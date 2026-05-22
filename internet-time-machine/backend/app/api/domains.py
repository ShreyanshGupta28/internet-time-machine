import logging
from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.domain import Domain
from app.models.snapshot import Snapshot
from app.schemas.domain import DomainResponse
from app.services.wayback import normalize_domain, fetch_snapshots
from app.services.cache import get_cached_domain

logger = logging.getLogger("itm_api_domains")
router = APIRouter(prefix="/domain", tags=["domains"])

@router.get("/{domain}", response_model=DomainResponse)
async def get_domain_snapshots(
    domain: str,
    refresh: bool = Query(default=False),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch domain metadata and snapshots from the database or the Wayback Machine CDX API.
    Normalizes domain inputs automatically.
    """
    # 1. Normalize Domain
    try:
        norm_domain = normalize_domain(domain)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

    # 2. Check Cache (if not explicit refresh)
    if not refresh:
        cached = await get_cached_domain(db, norm_domain)
        if cached:
            # Increment view count
            cached.view_count += 1
            await db.commit()
            
            # Check if has cached biography
            from app.models.biography import Biography
            stmt_bio = select(Biography.id).where(Biography.domain_id == cached.id)
            res_bio = await db.execute(stmt_bio)
            has_bio = res_bio.first() is not None
            
            return {
                "domain": cached.domain,
                "first_captured": cached.first_captured,
                "last_captured": cached.last_captured,
                "total_snapshots": cached.total_snapshots or len(cached.snapshots),
                "has_biography": has_bio,
                "snapshots": cached.snapshots
            }

    # 3. Call Wayback CDX API
    logger.info(f"Fetching snapshots from Wayback Machine for: {norm_domain}")
    try:
        wayback_snaps = await fetch_snapshots(norm_domain)
    except Exception as e:
        logger.error(f"Error calling Wayback CDX API: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to retrieve snapshots from the Wayback Machine. Please try again."
        )

    if not wayback_snaps:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "no_snapshots", "message": f"No archived snapshots found for {norm_domain}"}
        )

    # Parse first and last dates
    first_dt = datetime.fromisoformat(wayback_snaps[0]["captured_at"].replace("Z", "+00:00"))
    last_dt = datetime.fromisoformat(wayback_snaps[-1]["captured_at"].replace("Z", "+00:00"))

    # 4. Store/Update in Database
    try:
        stmt = select(Domain).where(Domain.domain == norm_domain).options(selectinload(Domain.snapshots))
        result = await db.execute(stmt)
        existing_domain = result.scalar_one_or_none()

        if existing_domain:
            # Update existing record
            existing_domain.first_captured = first_dt.date()
            existing_domain.last_captured = last_dt.date()
            existing_domain.total_snapshots = len(wayback_snaps)
            existing_domain.view_count += 1
            existing_domain.updated_at = datetime.now(timezone.utc)
            
            # Replace snapshots with fresh ones
            # Delete existing ones
            for old_snap in existing_domain.snapshots:
                await db.delete(old_snap)
            existing_domain.snapshots.clear()
            
            # Add new snapshots
            for s in wayback_snaps:
                snap = Snapshot(
                    wayback_ts=s["wayback_ts"],
                    captured_at=datetime.fromisoformat(s["captured_at"].replace("Z", "+00:00")),
                    status_code=s["status_code"],
                    wayback_url=s["wayback_url"],
                    page_title=s.get("page_title")
                )
                existing_domain.snapshots.append(snap)
                
            domain_record = existing_domain
        else:
            # Create new record
            domain_record = Domain(
                domain=norm_domain,
                first_captured=first_dt.date(),
                last_captured=last_dt.date(),
                total_snapshots=len(wayback_snaps),
                view_count=1
            )
            db.add(domain_record)
            
            for s in wayback_snaps:
                snap = Snapshot(
                    wayback_ts=s["wayback_ts"],
                    captured_at=datetime.fromisoformat(s["captured_at"].replace("Z", "+00:00")),
                    status_code=s["status_code"],
                    wayback_url=s["wayback_url"],
                    page_title=s.get("page_title")
                )
                domain_record.snapshots.append(snap)

        await db.commit()
        
        # Reload with selectinload to avoid lazy-load greenlet spawn error!
        stmt = select(Domain).where(Domain.id == domain_record.id).options(selectinload(Domain.snapshots))
        res = await db.execute(stmt)
        domain_record = res.scalar_one()

    except IntegrityError as e:
        logger.warning(f"IntegrityError/Race condition detected for {norm_domain}: {e}. Rolling back and retrieving existing domain.")
        await db.rollback()
        
        # Query again to fetch the domain that was committed by the concurrent task
        stmt = select(Domain).where(Domain.domain == norm_domain).options(selectinload(Domain.snapshots))
        result = await db.execute(stmt)
        domain_record = result.scalar_one_or_none()
        
        if not domain_record:
            # Fallback if somehow it's still missing
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database conflict occurred. Please try again."
            )

    # Check if has cached biography
    from app.models.biography import Biography
    stmt_bio = select(Biography.id).where(Biography.domain_id == domain_record.id)
    res_bio = await db.execute(stmt_bio)
    has_bio = res_bio.first() is not None

    return {
        "domain": domain_record.domain,
        "first_captured": domain_record.first_captured,
        "last_captured": domain_record.last_captured,
        "total_snapshots": domain_record.total_snapshots,
        "has_biography": has_bio,
        "snapshots": domain_record.snapshots
    }
