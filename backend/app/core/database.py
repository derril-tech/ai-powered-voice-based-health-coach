"""
Database configuration and connection management
"""

import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create async engine
async_engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG,
    future=True
)

# Create sync engine for migrations
sync_engine = create_engine(
    settings.DATABASE_URL_SYNC,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Create sync session factory
SyncSessionLocal = sessionmaker(
    sync_engine,
    expire_on_commit=False
)

# Create declarative base
Base = declarative_base()


async def init_db():
    """Initialize database connection"""
    try:
        # Test connection
        async with async_engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection established successfully")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise


async def close_db():
    """Close database connections"""
    try:
        await async_engine.dispose()
        sync_engine.dispose()
        logger.info("Database connections closed successfully")
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")


async def get_db_health() -> dict:
    """Check database health"""
    try:
        async with async_engine.begin() as conn:
            result = await conn.execute(text("SELECT 1 as health_check"))
            return {"status": "healthy", "response_time": "fast"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


def get_sync_db():
    """Get synchronous database session for migrations"""
    db = SyncSessionLocal()
    try:
        return db
    except Exception as e:
        db.close()
        logger.error(f"Sync database session error: {e}")
        raise
