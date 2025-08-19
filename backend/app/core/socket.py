"""
WebSocket/Socket.IO integration for real-time voice communication
"""

import asyncio
import json
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
from contextlib import asynccontextmanager

import socketio
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState

from app.core.config import settings
from app.core.logging import get_logger
from app.core.security import SecurityService
from app.core.ai import get_ai_service
from app.core.redis import get_cache, set_cache

logger = get_logger(__name__)

# Socket.IO server instance
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.CORS_ORIGINS,
    logger=True,
    engineio_logger=True
)

# Socket.IO ASGI app
socket_app = socketio.ASGIApp(sio)

# Connection management
active_connections: Dict[str, Dict] = {}
user_sessions: Dict[str, List[str]] = {}


class ConnectionManager:
    """Manages WebSocket connections and real-time communication"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, List[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a new WebSocket client"""
        await websocket.accept()
        connection_id = str(uuid.uuid4())
        self.active_connections[connection_id] = websocket
        
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(connection_id)
        
        logger.info(f"WebSocket connected: {connection_id} for user: {user_id}")
        
        # Send connection confirmation
        await self.send_personal_message({
            "type": "connection_established",
            "connection_id": connection_id,
            "timestamp": datetime.utcnow().isoformat()
        }, connection_id)
        
        return connection_id
    
    async def disconnect(self, connection_id: str, user_id: str):
        """Disconnect a WebSocket client"""
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            if websocket.client_state != WebSocketState.DISCONNECTED:
                await websocket.close()
            del self.active_connections[connection_id]
        
        if user_id in self.user_connections:
            if connection_id in self.user_connections[user_id]:
                self.user_connections[user_id].remove(connection_id)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        logger.info(f"WebSocket disconnected: {connection_id} for user: {user_id}")
    
    async def send_personal_message(self, message: Dict, connection_id: str):
        """Send message to specific connection"""
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.send_text(json.dumps(message))
    
    async def send_to_user(self, message: Dict, user_id: str):
        """Send message to all connections of a user"""
        if user_id in self.user_connections:
            for connection_id in self.user_connections[user_id]:
                await self.send_personal_message(message, connection_id)
    
    async def broadcast(self, message: Dict):
        """Broadcast message to all connected clients"""
        for connection_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, connection_id)


# Global connection manager
manager = ConnectionManager()


# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth):
    """Handle Socket.IO connection"""
    try:
        # Extract user ID from auth or headers
        user_id = None
        if auth and 'user_id' in auth:
            user_id = auth['user_id']
        elif 'HTTP_AUTHORIZATION' in environ:
            token = environ['HTTP_AUTHORIZATION'].replace('Bearer ', '')
            user_id = SecurityService.get_current_user_id_from_token(token)
        
        if not user_id:
            await sio.disconnect(sid)
            return False
        
        # Store connection info
        active_connections[sid] = {
            'user_id': user_id,
            'connected_at': datetime.utcnow(),
            'user_agent': environ.get('HTTP_USER_AGENT', ''),
            'ip_address': environ.get('REMOTE_ADDR', '')
        }
        
        if user_id not in user_sessions:
            user_sessions[user_id] = []
        user_sessions[user_id].append(sid)
        
        logger.info(f"Socket.IO connected: {sid} for user: {user_id}")
        
        # Send connection confirmation
        await sio.emit('connection_established', {
            'sid': sid,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat()
        }, room=sid)
        
        return True
        
    except Exception as e:
        logger.error(f"Error in Socket.IO connect: {e}")
        await sio.disconnect(sid)
        return False


@sio.event
async def disconnect(sid):
    """Handle Socket.IO disconnection"""
    try:
        if sid in active_connections:
            user_id = active_connections[sid]['user_id']
            del active_connections[sid]
            
            if user_id in user_sessions:
                if sid in user_sessions[user_id]:
                    user_sessions[user_id].remove(sid)
                if not user_sessions[user_id]:
                    del user_sessions[user_id]
            
            logger.info(f"Socket.IO disconnected: {sid} for user: {user_id}")
        
    except Exception as e:
        logger.error(f"Error in Socket.IO disconnect: {e}")


@sio.event
async def voice_command(sid, data):
    """Handle voice command from client"""
    try:
        if sid not in active_connections:
            await sio.emit('error', {'message': 'Not authenticated'}, room=sid)
            return
        
        user_id = active_connections[sid]['user_id']
        
        # Extract command data
        audio_data = data.get('audio_data')
        transcript = data.get('transcript')
        context = data.get('context', {})
        
        # Send processing status
        await sio.emit('voice_processing', {
            'status': 'processing',
            'timestamp': datetime.utcnow().isoformat()
        }, room=sid)
        
        # Process with AI
        ai_service = await get_ai_service()
        result = await ai_service.process_voice_command(
            transcript=transcript or "",
            user_id=user_id,
            context=context
        )
        
        # Send result back
        await sio.emit('voice_response', {
            'success': result.get('success', False),
            'response': result.get('response', ''),
            'command_type': result.get('command_type', 'query'),
            'entities': result.get('entities', {}),
            'suggestions': result.get('suggestions', []),
            'confidence': result.get('confidence', 0.0),
            'timestamp': datetime.utcnow().isoformat()
        }, room=sid)
        
        # Generate voice response if needed
        if result.get('success') and result.get('response'):
            voice_result = await ai_service.generate_voice_response(
                text=result['response'],
                user_id=user_id
            )
            
            if voice_result.get('success'):
                await sio.emit('voice_audio', {
                    'audio_path': voice_result['audio_path'],
                    'duration': voice_result.get('duration', 0),
                    'timestamp': datetime.utcnow().isoformat()
                }, room=sid)
        
        logger.info(f"Voice command processed for user {user_id}: {result.get('command_type', 'unknown')}")
        
    except Exception as e:
        logger.error(f"Error processing voice command: {e}")
        await sio.emit('error', {
            'message': 'Error processing voice command',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }, room=sid)


@sio.event
async def audio_stream(sid, data):
    """Handle real-time audio stream"""
    try:
        if sid not in active_connections:
            await sio.emit('error', {'message': 'Not authenticated'}, room=sid)
            return
        
        user_id = active_connections[sid]['user_id']
        audio_chunk = data.get('audio_chunk')
        is_final = data.get('is_final', False)
        
        # Store audio chunk in cache
        cache_key = f"audio_stream:{user_id}:{sid}"
        current_stream = await get_cache(cache_key) or []
        current_stream.append({
            'chunk': audio_chunk,
            'timestamp': datetime.utcnow().isoformat(),
            'is_final': is_final
        })
        
        await set_cache(cache_key, current_stream, expire=300)  # 5 minutes
        
        # If final chunk, process the complete audio
        if is_final:
            # TODO: Process complete audio stream
            await sio.emit('audio_processed', {
                'status': 'completed',
                'timestamp': datetime.utcnow().isoformat()
            }, room=sid)
        
    except Exception as e:
        logger.error(f"Error handling audio stream: {e}")
        await sio.emit('error', {
            'message': 'Error processing audio stream',
            'error': str(e)
        }, room=sid)


@sio.event
async def calendar_update(sid, data):
    """Handle calendar updates from client"""
    try:
        if sid not in active_connections:
            await sio.emit('error', {'message': 'Not authenticated'}, room=sid)
            return
        
        user_id = active_connections[sid]['user_id']
        event_data = data.get('event')
        action = data.get('action')  # create, update, delete
        
        # TODO: Process calendar update
        # This would integrate with the calendar service
        
        # Broadcast to all user connections
        await sio.emit('calendar_updated', {
            'action': action,
            'event': event_data,
            'timestamp': datetime.utcnow().isoformat()
        }, room=user_id)
        
        logger.info(f"Calendar {action} for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error handling calendar update: {e}")
        await sio.emit('error', {
            'message': 'Error updating calendar',
            'error': str(e)
        }, room=sid)


@sio.event
async def join_room(sid, data):
    """Join a specific room (e.g., for user-specific updates)"""
    try:
        room = data.get('room')
        if room:
            sio.enter_room(sid, room)
            await sio.emit('room_joined', {
                'room': room,
                'timestamp': datetime.utcnow().isoformat()
            }, room=sid)
            
    except Exception as e:
        logger.error(f"Error joining room: {e}")


@sio.event
async def leave_room(sid, data):
    """Leave a specific room"""
    try:
        room = data.get('room')
        if room:
            sio.leave_room(sid, room)
            await sio.emit('room_left', {
                'room': room,
                'timestamp': datetime.utcnow().isoformat()
            }, room=sid)
            
    except Exception as e:
        logger.error(f"Error leaving room: {e}")


# WebSocket endpoint for FastAPI
async def websocket_endpoint(websocket: WebSocket, token: str):
    """FastAPI WebSocket endpoint"""
    try:
        # Validate token
        user_id = SecurityService.get_current_user_id_from_token(token)
        if not user_id:
            await websocket.close(code=4001, reason="Invalid token")
            return
        
        # Connect to manager
        connection_id = await manager.connect(websocket, user_id)
        
        try:
            while True:
                # Receive message
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                message_type = message.get('type')
                
                if message_type == 'voice_command':
                    await handle_voice_command_ws(connection_id, user_id, message)
                elif message_type == 'calendar_update':
                    await handle_calendar_update_ws(connection_id, user_id, message)
                elif message_type == 'ping':
                    await manager.send_personal_message({
                        'type': 'pong',
                        'timestamp': datetime.utcnow().isoformat()
                    }, connection_id)
                else:
                    await manager.send_personal_message({
                        'type': 'error',
                        'message': f'Unknown message type: {message_type}'
                    }, connection_id)
                    
        except WebSocketDisconnect:
            await manager.disconnect(connection_id, user_id)
            
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.close(code=4000, reason="Internal error")


async def handle_voice_command_ws(connection_id: str, user_id: str, message: Dict):
    """Handle voice command via WebSocket"""
    try:
        transcript = message.get('transcript', '')
        context = message.get('context', {})
        
        # Send processing status
        await manager.send_personal_message({
            'type': 'voice_processing',
            'status': 'processing',
            'timestamp': datetime.utcnow().isoformat()
        }, connection_id)
        
        # Process with AI
        ai_service = await get_ai_service()
        result = await ai_service.process_voice_command(
            transcript=transcript,
            user_id=user_id,
            context=context
        )
        
        # Send result
        await manager.send_personal_message({
            'type': 'voice_response',
            'success': result.get('success', False),
            'response': result.get('response', ''),
            'command_type': result.get('command_type', 'query'),
            'entities': result.get('entities', {}),
            'suggestions': result.get('suggestions', []),
            'confidence': result.get('confidence', 0.0),
            'timestamp': datetime.utcnow().isoformat()
        }, connection_id)
        
    except Exception as e:
        logger.error(f"Error handling voice command via WebSocket: {e}")
        await manager.send_personal_message({
            'type': 'error',
            'message': 'Error processing voice command',
            'error': str(e)
        }, connection_id)


async def handle_calendar_update_ws(connection_id: str, user_id: str, message: Dict):
    """Handle calendar update via WebSocket"""
    try:
        event_data = message.get('event')
        action = message.get('action')
        
        # TODO: Process calendar update
        
        # Send confirmation
        await manager.send_personal_message({
            'type': 'calendar_updated',
            'action': action,
            'event': event_data,
            'timestamp': datetime.utcnow().isoformat()
        }, connection_id)
        
    except Exception as e:
        logger.error(f"Error handling calendar update via WebSocket: {e}")
        await manager.send_personal_message({
            'type': 'error',
            'message': 'Error updating calendar',
            'error': str(e)
        }, connection_id)


# Utility functions
async def broadcast_to_user(user_id: str, message: Dict):
    """Broadcast message to all connections of a user"""
    # Socket.IO broadcast
    if user_id in user_sessions:
        await sio.emit('broadcast', message, room=user_id)
    
    # WebSocket broadcast
    await manager.send_to_user(message, user_id)


async def get_active_connections_count() -> int:
    """Get count of active connections"""
    return len(active_connections) + len(manager.active_connections)


async def get_user_connections(user_id: str) -> List[str]:
    """Get all connection IDs for a user"""
    connections = []
    
    # Socket.IO connections
    if user_id in user_sessions:
        connections.extend(user_sessions[user_id])
    
    # WebSocket connections
    if user_id in manager.user_connections:
        connections.extend(manager.user_connections[user_id])
    
    return connections
