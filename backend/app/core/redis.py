"""
Redis configuration and connection management
"""

import logging
import json
from typing import Optional, Any
import aioredis
from redis import Redis

from app.core.config import settings

logger = logging.getLogger(__name__)

# Global Redis connections
redis_client: Optional[aioredis.Redis] = None
sync_redis_client: Optional[Redis] = None


async def init_redis():
    """Initialize Redis connections"""
    global redis_client, sync_redis_client
    
    try:
        # Async Redis client
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            password=settings.REDIS_PASSWORD,
            db=settings.REDIS_DB,
            encoding="utf-8",
            decode_responses=True
        )
        
        # Sync Redis client
        sync_redis_client = Redis.from_url(
            settings.REDIS_URL,
            password=settings.REDIS_PASSWORD,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        
        # Test connection
        await redis_client.ping()
        logger.info("Redis connection established successfully")
        
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        raise


async def close_redis():
    """Close Redis connections"""
    global redis_client, sync_redis_client
    
    try:
        if redis_client:
            await redis_client.close()
        if sync_redis_client:
            sync_redis_client.close()
        logger.info("Redis connections closed successfully")
    except Exception as e:
        logger.error(f"Error closing Redis connections: {e}")


async def get_redis_health() -> dict:
    """Check Redis health"""
    try:
        if redis_client:
            await redis_client.ping()
            return {"status": "healthy", "response_time": "fast"}
        return {"status": "unhealthy", "error": "Redis client not initialized"}
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}


async def get_redis() -> aioredis.Redis:
    """Get Redis client dependency"""
    if not redis_client:
        raise RuntimeError("Redis client not initialized")
    return redis_client


def get_sync_redis() -> Redis:
    """Get synchronous Redis client"""
    if not sync_redis_client:
        raise RuntimeError("Sync Redis client not initialized")
    return sync_redis_client


# Cache utilities
async def set_cache(key: str, value: Any, expire: int = 3600) -> bool:
    """Set cache value"""
    try:
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        await redis_client.set(key, value, ex=expire)
        return True
    except Exception as e:
        logger.error(f"Error setting cache: {e}")
        return False


async def get_cache(key: str) -> Optional[Any]:
    """Get cache value"""
    try:
        value = await redis_client.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None
    except Exception as e:
        logger.error(f"Error getting cache: {e}")
        return None


async def delete_cache(key: str) -> bool:
    """Delete cache value"""
    try:
        await redis_client.delete(key)
        return True
    except Exception as e:
        logger.error(f"Error deleting cache: {e}")
        return False


async def clear_cache_pattern(pattern: str) -> bool:
    """Clear cache by pattern"""
    try:
        keys = await redis_client.keys(pattern)
        if keys:
            await redis_client.delete(*keys)
        return True
    except Exception as e:
        logger.error(f"Error clearing cache pattern: {e}")
        return False


# Rate limiting utilities
async def increment_rate_limit(key: str, window: int = 60) -> int:
    """Increment rate limit counter"""
    try:
        current = await redis_client.incr(key)
        if current == 1:
            await redis_client.expire(key, window)
        return current
    except Exception as e:
        logger.error(f"Error incrementing rate limit: {e}")
        return 0


async def get_rate_limit(key: str) -> int:
    """Get current rate limit count"""
    try:
        count = await redis_client.get(key)
        return int(count) if count else 0
    except Exception as e:
        logger.error(f"Error getting rate limit: {e}")
        return 0
