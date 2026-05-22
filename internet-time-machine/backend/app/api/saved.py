import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.domain import Domain
from app.models.saved import SavedDomain
from app.schemas.saved import SavedDomainCreate, SavedDomainUpdate, SavedDomainResponse
from app.services.wayback import normalize_domain, fetch_snapshots

logger = logging.getLogger("itm_api_saved")
router = APIRouter(prefix="/saved", tags=["saved"])

@router.get("", response_model=Dict[str, List[SavedDomainResponse]])
async def get_saved_domains(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all bookmarked domains for the current authenticated user."""
    stmt = (
        select(SavedDomain)
        .where(SavedDomain.user_id == current_user.id)
        .options(selectinload(SavedDomain.domain_rel).selectinload(Domain.snapshots))
    )
    result = await db.execute(stmt)
    records = result.scalars().all()

    saved_list = []
    for r in records:
        dom = r.domain_rel
        latest_ts = None
        if dom.snapshots:
            # Get latest snapshot timestamp
            sorted_snaps = sorted(dom.snapshots, key=lambda x: x.wayback_ts)
            latest_ts = sorted_snaps[-1].wayback_ts
            
        saved_list.append({
            "id": r.id,
            "domain": dom.domain,
            "personal_note": r.personal_note,
            "saved_at": r.saved_at,
            "first_captured": dom.first_captured.isoformat() if dom.first_captured else None,
            "latest_snapshot_ts": latest_ts
        })

    return {"saved": saved_list}

@router.post("", status_code=status.HTTP_201_CREATED)
async def save_domain(
    payload: SavedDomainCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bookmark a domain to the current user's dashboard library with a personal note."""
    try:
        norm_domain = normalize_domain(payload.domain)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    # 1. Ensure Domain exists in DB (or pull from Wayback)
    stmt = select(Domain).where(Domain.domain == norm_domain)
    result = await db.execute(stmt)
    domain_record = result.scalar_one_or_none()

    if not domain_record:
        logger.info(f"Bookmarked domain {norm_domain} not cached. Fetching snapshots first.")
        try:
            wayback_snaps = await fetch_snapshots(norm_domain)
        except Exception:
            wayback_snaps = []
            
        if not wayback_snaps:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot bookmark {norm_domain} as it has no Wayback captures."
            )
            
        first_dt = datetime.fromisoformat(wayback_snaps[0]["captured_at"].replace("Z", "+00:00"))
        last_dt = datetime.fromisoformat(wayback_snaps[-1]["captured_at"].replace("Z", "+00:00"))
        
        domain_record = Domain(
            domain=norm_domain,
            first_captured=first_dt.date(),
            last_captured=last_dt.date(),
            total_snapshots=len(wayback_snaps),
            view_count=1
        )
        db.add(domain_record)
        
        from app.models.snapshot import Snapshot
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
        await db.refresh(domain_record)

    # 2. Check if already bookmarked
    stmt = select(SavedDomain).where(
        SavedDomain.user_id == current_user.id,
        SavedDomain.domain_id == domain_record.id
    )
    result = await db.execute(stmt)
    existing_bookmark = result.scalar_one_or_none()

    if existing_bookmark:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Domain already bookmarked in your personal library."
        )

    # 3. Create bookmark
    bookmark = SavedDomain(
        user_id=current_user.id,
        domain_id=domain_record.id,
        personal_note=payload.personal_note
    )
    db.add(bookmark)
    await db.commit()
    await db.refresh(bookmark)

    return {
        "id": bookmark.id,
        "domain": domain_record.domain,
        "personal_note": bookmark.personal_note,
        "saved_at": bookmark.saved_at
    }

@router.delete("/{domain}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_domain(
    domain: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a bookmarked domain from the current user's library."""
    try:
        norm_domain = normalize_domain(domain)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    stmt = select(Domain).where(Domain.domain == norm_domain)
    result = await db.execute(stmt)
    domain_record = result.scalar_one_or_none()

    if not domain_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found.")

    stmt = select(SavedDomain).where(
        SavedDomain.user_id == current_user.id,
        SavedDomain.domain_id == domain_record.id
    )
    result = await db.execute(stmt)
    bookmark = result.scalar_one_or_none()

    if not bookmark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found.")

    await db.delete(bookmark)
    await db.commit()
    return None

@router.patch("/{domain}")
async def update_saved_domain(
    domain: str,
    payload: SavedDomainUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update personal notes for a bookmarked domain in the user's library."""
    try:
        norm_domain = normalize_domain(domain)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    stmt = select(Domain).where(Domain.domain == norm_domain)
    result = await db.execute(stmt)
    domain_record = result.scalar_one_or_none()

    if not domain_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found.")

    stmt = select(SavedDomain).where(
        SavedDomain.user_id == current_user.id,
        SavedDomain.domain_id == domain_record.id
    )
    result = await db.execute(stmt)
    bookmark = result.scalar_one_or_none()

    if not bookmark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found.")

    bookmark.personal_note = payload.personal_note
    await db.commit()
    await db.refresh(bookmark)

    return {
        "id": bookmark.id,
        "domain": domain_record.domain,
        "personal_note": bookmark.personal_note,
        "saved_at": bookmark.saved_at
    }
ZOOM_OUT_MARKER_PATCH = "saved_patch_complete"
