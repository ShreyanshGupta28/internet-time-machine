import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.domain import Domain
from app.models.biography import Biography

logger = logging.getLogger("itm_cache")

async def get_cached_domain(db: AsyncSession, domain_name: str) -> Domain | None:
    """
    Retrieve cached domain metadata and all snapshots if updated less than 7 days ago.
    """
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    stmt = (
        select(Domain)
        .where(Domain.domain == domain_name)
        .options(selectinload(Domain.snapshots))
    )
    result = await db.execute(stmt)
    domain = result.scalar_one_or_none()
    
    if domain:
        # Check if the cached snapshot metadata is less than 7 days old
        updated_at_utc = domain.updated_at.replace(tzinfo=timezone.utc) if domain.updated_at.tzinfo is None else domain.updated_at
        if updated_at_utc > seven_days_ago:
            logger.info(f"Snapshot cache HIT for domain: {domain_name}")
            return domain
        else:
            logger.info(f"Snapshot cache EXPIRED for domain: {domain_name}")
    else:
        logger.info(f"Snapshot cache MISS for domain: {domain_name}")
    return None

async def get_cached_biography(db: AsyncSession, domain_id) -> Biography | None:
    """
    Retrieve cached biography if it exists and has not expired yet.
    """
    stmt = select(Biography).where(Biography.domain_id == domain_id)
    result = await db.execute(stmt)
    biography = result.scalar_one_or_none()
    
    if biography:
        expires_at_utc = biography.expires_at.replace(tzinfo=timezone.utc) if biography.expires_at.tzinfo is None else biography.expires_at
        if expires_at_utc > datetime.now(timezone.utc):
            logger.info(f"Biography cache HIT for domain ID: {domain_id}")
            return biography
        else:
            logger.info(f"Biography cache EXPIRED for domain ID: {domain_id}")
    return None
