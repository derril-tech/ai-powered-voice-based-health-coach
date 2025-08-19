"""
AI services integration for OpenAI, Claude, and LangChain
"""

import asyncio
import json
from typing import Optional, Dict, List, Any, Union
from datetime import datetime, timedelta
import openai
import anthropic
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI, ChatAnthropic
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain, ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import PGVector
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import TextLoader
from langchain.chains.question_answering import load_qa_chain

from app.core.config import settings
from app.core.logging import get_logger
from app.core.redis import get_cache, set_cache

logger = get_logger(__name__)

# Global AI clients
openai_client: Optional[openai.AsyncOpenAI] = None
anthropic_client: Optional[anthropic.AsyncAnthropic] = None
langchain_openai: Optional[ChatOpenAI] = None
langchain_anthropic: Optional[ChatAnthropic] = None
embeddings: Optional[OpenAIEmbeddings] = None


class AIService:
    """Main AI service class for handling all AI operations"""
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self.langchain_openai = None
        self.langchain_anthropic = None
        self.embeddings = None
        self.vector_store = None
        self.conversation_memory = {}
    
    async def initialize(self):
        """Initialize AI services"""
        global openai_client, anthropic_client, langchain_openai, langchain_anthropic, embeddings
        
        try:
            # Initialize OpenAI client
            if settings.OPENAI_API_KEY:
                openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                self.openai_client = openai_client
                
                # Initialize LangChain OpenAI
                langchain_openai = ChatOpenAI(
                    model_name=settings.OPENAI_MODEL_NAME,
                    temperature=float(settings.OPENAI_TEMPERATURE),
                    max_tokens=int(settings.OPENAI_MAX_TOKENS),
                    openai_api_key=settings.OPENAI_API_KEY
                )
                self.langchain_openai = langchain_openai
                
                # Initialize embeddings
                embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
                self.embeddings = embeddings
                
                logger.info("OpenAI services initialized successfully")
            
            # Initialize Anthropic client
            if settings.ANTHROPIC_API_KEY:
                anthropic_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
                self.anthropic_client = anthropic_client
                
                # Initialize LangChain Anthropic
                langchain_anthropic = ChatAnthropic(
                    model=settings.ANTHROPIC_MODEL_NAME,
                    temperature=float(settings.ANTHROPIC_TEMPERATURE),
                    max_tokens_to_sample=int(settings.ANTHROPIC_MAX_TOKENS),
                    anthropic_api_key=settings.ANTHROPIC_API_KEY
                )
                self.langchain_anthropic = langchain_anthropic
                
                logger.info("Anthropic services initialized successfully")
            
            # Initialize vector store if database is available
            if embeddings and settings.DATABASE_URL:
                try:
                    self.vector_store = PGVector(
                        connection_string=settings.DATABASE_URL,
                        embedding_function=embeddings,
                        collection_name="voice_assistant_docs"
                    )
                    logger.info("Vector store initialized successfully")
                except Exception as e:
                    logger.warning(f"Failed to initialize vector store: {e}")
            
            logger.info("AI services initialization completed")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI services: {e}")
            raise
    
    async def close(self):
        """Close AI service connections"""
        try:
            if self.openai_client:
                await self.openai_client.close()
            if self.anthropic_client:
                await self.anthropic_client.close()
            logger.info("AI services closed successfully")
        except Exception as e:
            logger.error(f"Error closing AI services: {e}")
    
    async def process_voice_command(
        self, 
        transcript: str, 
        user_id: str, 
        context: Optional[Dict] = None,
        model_preference: str = "auto"
    ) -> Dict[str, Any]:
        """Process voice command using AI"""
        try:
            # Get user preferences
            user_prefs = await self._get_user_preferences(user_id)
            
            # Determine which model to use
            model_to_use = model_preference if model_preference != "auto" else user_prefs.get("ai_model_preference", "gpt-4")
            
            # Create system prompt for voice command processing
            system_prompt = self._create_voice_system_prompt(user_prefs, context)
            
            # Process with selected model
            if model_to_use.startswith("gpt") and self.openai_client:
                response = await self._process_with_openai(transcript, system_prompt, user_prefs)
            elif model_to_use.startswith("claude") and self.anthropic_client:
                response = await self._process_with_anthropic(transcript, system_prompt, user_prefs)
            else:
                # Fallback to OpenAI
                response = await self._process_with_openai(transcript, system_prompt, user_prefs)
            
            # Parse and structure the response
            structured_response = self._parse_ai_response(response, transcript)
            
            # Update conversation memory
            await self._update_conversation_memory(user_id, transcript, structured_response)
            
            return structured_response
            
        except Exception as e:
            logger.error(f"Error processing voice command: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": "I'm sorry, I encountered an error processing your request. Please try again.",
                "command_type": "error",
                "confidence": 0.0
            }
    
    async def generate_voice_response(
        self, 
        text: str, 
        user_id: str,
        voice_id: Optional[str] = None,
        speech_rate: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate voice response using text-to-speech"""
        try:
            # Get user preferences
            user_prefs = await self._get_user_preferences(user_id)
            
            # Use provided voice settings or user defaults
            voice_id = voice_id or user_prefs.get("voice_id", "alloy")
            speech_rate = speech_rate or user_prefs.get("speech_rate", "normal")
            
            # Convert speech rate to OpenAI format
            rate_mapping = {"slow": 0.8, "normal": 1.0, "fast": 1.2}
            speed = rate_mapping.get(speech_rate, 1.0)
            
            if self.openai_client:
                response = await self.openai_client.audio.speech.create(
                    model="tts-1",
                    voice=voice_id,
                    input=text,
                    speed=speed
                )
                
                # Save audio to file
                audio_path = f"temp/voice_response_{user_id}_{datetime.utcnow().timestamp()}.mp3"
                response.stream_to_file(audio_path)
                
                return {
                    "success": True,
                    "audio_path": audio_path,
                    "voice_id": voice_id,
                    "speech_rate": speech_rate,
                    "duration": len(text.split()) / 2.5  # Rough estimate
                }
            else:
                raise Exception("OpenAI client not available for TTS")
                
        except Exception as e:
            logger.error(f"Error generating voice response: {e}")
            return {
                "success": False,
                "error": str(e),
                "audio_path": None
            }
    
    async def transcribe_audio(
        self, 
        audio_file_path: str,
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """Transcribe audio using OpenAI Whisper"""
        try:
            if not self.openai_client:
                raise Exception("OpenAI client not available for transcription")
            
            with open(audio_file_path, "rb") as audio_file:
                response = await self.openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language=language,
                    response_format="verbose_json"
                )
            
            return {
                "success": True,
                "transcript": response.text,
                "language": response.language,
                "duration": response.duration,
                "segments": response.segments if hasattr(response, 'segments') else None
            }
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            return {
                "success": False,
                "error": str(e),
                "transcript": None
            }
    
    async def analyze_calendar_context(
        self, 
        user_id: str, 
        query: str,
        calendar_events: List[Dict]
    ) -> Dict[str, Any]:
        """Analyze calendar context using AI"""
        try:
            # Create calendar context
            calendar_context = self._format_calendar_context(calendar_events)
            
            system_prompt = f"""
            You are an AI assistant helping with calendar management. Analyze the user's calendar and query to provide helpful insights.
            
            Current calendar events:
            {calendar_context}
            
            User query: {query}
            
            Provide a structured response with:
            1. Analysis of the query
            2. Relevant calendar insights
            3. Suggested actions
            4. Available time slots (if scheduling)
            5. Potential conflicts
            """
            
            if self.openai_client:
                response = await self._process_with_openai(query, system_prompt, {})
            elif self.anthropic_client:
                response = await self._process_with_anthropic(query, system_prompt, {})
            else:
                raise Exception("No AI service available")
            
            return {
                "success": True,
                "analysis": response,
                "calendar_context": calendar_context
            }
            
        except Exception as e:
            logger.error(f"Error analyzing calendar context: {e}")
            return {
                "success": False,
                "error": str(e),
                "analysis": None
            }
    
    def _create_voice_system_prompt(self, user_prefs: Dict, context: Optional[Dict]) -> str:
        """Create system prompt for voice command processing"""
        base_prompt = """
        You are an AI-powered voice assistant for calendar management. Your role is to:
        
        1. Understand natural language voice commands
        2. Extract calendar-related intents (create, update, delete, query events)
        3. Parse dates, times, locations, and participants
        4. Provide clear, actionable responses
        5. Handle scheduling conflicts and suggest alternatives
        
        User preferences:
        - Timezone: {timezone}
        - Language: {language}
        - AI model: {ai_model}
        
        Current context: {context}
        
        Respond in JSON format with:
        {{
            "command_type": "calendar|reminder|query|error",
            "action": "create|update|delete|get|schedule",
            "confidence": 0.0-1.0,
            "entities": {{
                "title": "event title",
                "start_time": "ISO datetime",
                "end_time": "ISO datetime", 
                "location": "location",
                "attendees": ["email1", "email2"],
                "description": "description"
            }},
            "response": "natural language response",
            "suggestions": ["suggestion1", "suggestion2"]
        }}
        """
        
        return base_prompt.format(
            timezone=user_prefs.get("timezone", "UTC"),
            language=user_prefs.get("language", "en"),
            ai_model=user_prefs.get("ai_model_preference", "gpt-4"),
            context=json.dumps(context) if context else "{}"
        )
    
    async def _process_with_openai(self, transcript: str, system_prompt: str, user_prefs: Dict) -> str:
        """Process with OpenAI"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcript}
        ]
        
        response = await self.openai_client.chat.completions.create(
            model=user_prefs.get("ai_model_preference", "gpt-4"),
            messages=messages,
            temperature=float(user_prefs.get("ai_temperature", "0.7")),
            max_tokens=int(user_prefs.get("ai_context_length", "4000"))
        )
        
        return response.choices[0].message.content
    
    async def _process_with_anthropic(self, transcript: str, system_prompt: str, user_prefs: Dict) -> str:
        """Process with Anthropic Claude"""
        response = await self.anthropic_client.messages.create(
            model=user_prefs.get("ai_model_preference", "claude-3-sonnet-20240229"),
            max_tokens=int(user_prefs.get("ai_context_length", "4000")),
            temperature=float(user_prefs.get("ai_temperature", "0.7")),
            system=system_prompt,
            messages=[{"role": "user", "content": transcript}]
        )
        
        return response.content[0].text
    
    def _parse_ai_response(self, response: str, original_transcript: str) -> Dict[str, Any]:
        """Parse AI response into structured format"""
        try:
            # Try to parse as JSON
            if response.strip().startswith("{"):
                parsed = json.loads(response)
                return {
                    "success": True,
                    "command_type": parsed.get("command_type", "query"),
                    "action": parsed.get("action", "get"),
                    "confidence": parsed.get("confidence", 0.8),
                    "entities": parsed.get("entities", {}),
                    "response": parsed.get("response", response),
                    "suggestions": parsed.get("suggestions", []),
                    "original_transcript": original_transcript
                }
            else:
                # Fallback for non-JSON responses
                return {
                    "success": True,
                    "command_type": "query",
                    "action": "get",
                    "confidence": 0.7,
                    "entities": {},
                    "response": response,
                    "suggestions": [],
                    "original_transcript": original_transcript
                }
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse AI response as JSON: {response}")
            return {
                "success": True,
                "command_type": "query",
                "action": "get",
                "confidence": 0.6,
                "entities": {},
                "response": response,
                "suggestions": [],
                "original_transcript": original_transcript
            }
    
    async def _get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences from cache or database"""
        cache_key = f"user_prefs:{user_id}"
        cached_prefs = await get_cache(cache_key)
        
        if cached_prefs:
            return cached_prefs
        
        # TODO: Fetch from database
        default_prefs = {
            "timezone": "UTC",
            "language": "en",
            "ai_model_preference": "gpt-4",
            "ai_temperature": "0.7",
            "ai_context_length": "4000",
            "voice_id": "alloy",
            "speech_rate": "normal"
        }
        
        await set_cache(cache_key, default_prefs, expire=3600)  # Cache for 1 hour
        return default_prefs
    
    async def _update_conversation_memory(self, user_id: str, transcript: str, response: Dict):
        """Update conversation memory for context"""
        if user_id not in self.conversation_memory:
            self.conversation_memory[user_id] = []
        
        self.conversation_memory[user_id].append({
            "timestamp": datetime.utcnow().isoformat(),
            "transcript": transcript,
            "response": response,
            "command_type": response.get("command_type", "query")
        })
        
        # Keep only last 10 interactions
        if len(self.conversation_memory[user_id]) > 10:
            self.conversation_memory[user_id] = self.conversation_memory[user_id][-10:]
    
    def _format_calendar_context(self, calendar_events: List[Dict]) -> str:
        """Format calendar events for AI context"""
        if not calendar_events:
            return "No calendar events found."
        
        context_lines = []
        for event in calendar_events:
            start_time = event.get("start_time", "Unknown")
            end_time = event.get("end_time", "Unknown")
            title = event.get("title", "Untitled")
            location = event.get("location", "")
            
            context_lines.append(f"- {title} ({start_time} to {end_time}) {location}")
        
        return "\n".join(context_lines)


# Global AI service instance
ai_service = AIService()


async def init_ai_services():
    """Initialize AI services"""
    await ai_service.initialize()


async def close_ai_services():
    """Close AI services"""
    await ai_service.close()


async def get_ai_service() -> AIService:
    """Get AI service instance"""
    return ai_service
