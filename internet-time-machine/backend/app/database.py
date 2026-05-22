import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings

logger = logging.getLogger("itm_database")

# Ensure using a modern async driver (asyncpg)
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    database_url,
    pool_pre_ping=True,
    echo=False
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def create_tables() -> None:
    """Creates all database tables on startup. Used as a fallback and local dev fast route."""
    try:
        async with engine.begin() as conn:
            # We import all models here so that they are registered on the Base metadata
            from app.models.user import User
            from app.models.domain import Domain
            from app.models.snapshot import Snapshot
            from app.models.biography import Biography
            from app.models.saved import SavedDomain
            
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")
        # Note: we do not sys.exit here because Alembic might be used, but we log clearly.

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for yielding async database sessions inside API routers."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
