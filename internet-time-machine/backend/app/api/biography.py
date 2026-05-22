import logging
import json
from datetime import datetime, timezone, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.domain import Domain
from app.models.snapshot import Snapshot
from app.models.biography import Biography
from app.schemas.biography import BiographyResponse
from app.services.wayback import normalize_domain
from app.services.cache import get_cached_biography
from app.services.ai_biography import stream_biography

logger = logging.getLogger("itm_api_biography")
router = APIRouter(prefix="/biography", tags=["biography"])

@router.get("/{domain}", response_model=BiographyResponse)
async def get_biography(domain: str, db: AsyncSession = Depends(get_db)):
    """Retrieve the cached biography for a domain if it exists and has not expired."""
    try:
        norm_domain = normalize_domain(domain)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    stmt = select(Domain).where(Domain.domain == norm_domain)
    result = await db.execute(stmt)
    domain_record = result.scalar_one_or_none()
    
    if not domain_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain metadata not found. Search for the domain first to cache snapshots."
        )

    cached_bio = await get_cached_biography(db, domain_record.id)
    if not cached_bio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Biography not generated or has expired."
        )

    return cached_bio

@router.post("/{domain}/generate")
async def generate_biography_endpoint(
    domain: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate an AI biography narrative. Renders as a Server-Sent Events (SSE) stream.
    Validates user daily free quotas.
    """
    # 1. Normalize domain
    try:
        norm_domain = normalize_domain(domain)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    # 2. Check and enforce User Free Quota (5 per day, resets at midnight UTC)
    today_utc = datetime.now(timezone.utc).date()
    
    # Query current user again to ensure fresh transaction boundary
    stmt = select(User).where(User.id == current_user.id)
    res = await db.execute(stmt)
    user = res.scalar_one()

    if user.analyses_reset != today_utc:
        user.analyses_today = 0
        user.analyses_reset = today_utc
        await db.commit()

    if user.analyses_today >= settings.FREE_TIER_DAILY_ANALYSES:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Free tier limit is {settings.FREE_TIER_DAILY_ANALYSES} analyses per day."
        )

    # 3. Check Domain & Snapshots Exist
    stmt = select(Domain).where(Domain.domain == norm_domain).options(selectinload(Domain.snapshots))
    result = await db.execute(stmt)
    domain_record = result.scalar_one_or_none()

    if not domain_record or not domain_record.snapshots:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain snapshots not cached. Search for the domain first to retrieve snapshots."
        )

    # 4. Check if fresh biography exists. If so, stream it instantly and don't count towards quota!
    cached_bio = await get_cached_biography(db, domain_record.id)
    if cached_bio:
        async def stream_cached():
            # Quick progressive simulated stream for caching
            bio_data = {
                "biography_md": cached_bio.biography_md,
                "design_eras": cached_bio.design_eras,
                "key_moments": cached_bio.key_moments,
                "one_liner": cached_bio.one_liner,
                "generated_at": cached_bio.generated_at.isoformat()
            }
            yield f"data: {json.dumps({'type': 'token', 'content': 'Loading story from local cache...'})}\n\n"
            yield f"data: {json.dumps({'type': 'complete', 'biography': bio_data})}\n\n"
        return StreamingResponse(stream_cached(), media_type="text/event-stream")

    # 5. Extract evenly spaced snapshots (up to 20)
    all_snapshots = sorted(domain_record.snapshots, key=lambda x: x.wayback_ts)
    total_snaps = len(all_snapshots)
    
    sampled_snapshots = []
    if total_snaps <= 20:
        sampled_snapshots = all_snapshots
    else:
        step = total_snaps / 20.0
        for i in range(20):
            idx = int(i * step)
            sampled_snapshots.append(all_snapshots[idx])

    # Convert to standard dictionary list
    dict_snapshots = [
        {
            "captured_at": s.captured_at.isoformat(),
            "wayback_ts": s.wayback_ts,
            "wayback_url": s.wayback_url,
            "page_title": s.page_title or ""
        }
        for s in sampled_snapshots
    ]

    async def sse_generator():
        full_biography = None
        # Stream chunks from Anthropic Service
        async for sse_chunk in stream_biography(norm_domain, dict_snapshots):
            yield sse_chunk
            
            # Catch complete event payload to write to DB
            if sse_chunk.startswith("data: "):
                try:
                    payload = json.loads(sse_chunk[6:].strip())
                    if payload.get("type") == "complete":
                        full_biography = payload.get("biography")
                except Exception:
                    pass

        # Save to DB if complete was successful
        if full_biography:
            try:
                # Re-fetch domain inside generator session scope
                async with AsyncSession(db.bind, expire_on_commit=False) as gen_session:
                    stmt_domain = select(Domain).where(Domain.domain == norm_domain)
                    res_dom = await gen_session.execute(stmt_domain)
                    dom_rec = res_dom.scalar_one()

                    # Upsert Biography
                    stmt_bio = select(Biography).where(Biography.domain_id == dom_rec.id)
                    res_bio = await gen_session.execute(stmt_bio)
                    bio_rec = res_bio.scalar_one_or_none()

                    if bio_rec:
                        bio_rec.biography_md = full_biography.get("biography_md") or ""
                        bio_rec.design_eras = full_biography.get("design_eras") or []
                        bio_rec.key_moments = full_biography.get("key_moments") or []
                        bio_rec.one_liner = full_biography.get("one_liner") or ""
                        bio_rec.generated_at = datetime.now(timezone.utc)
                        bio_rec.expires_at = datetime.now(timezone.utc) + timedelta(days=30)
                    else:
                        new_bio = Biography(
                            domain_id=dom_rec.id,
                            biography_md=full_biography.get("biography_md") or "",
                            design_eras=full_biography.get("design_eras") or [],
                            key_moments=full_biography.get("key_moments") or [],
                            one_liner=full_biography.get("one_liner") or "",
                            expires_at=datetime.now(timezone.utc) + timedelta(days=30)
                        )
                        gen_session.add(new_bio)

                    # Update User daily quota
                    stmt_user = select(User).where(User.id == current_user.id)
                    res_user = await gen_session.execute(stmt_user)
                    gen_user = res_user.scalar_one()
                    gen_user.analyses_today += 1

                    await gen_session.commit()
                    logger.info(f"Successfully cached biography and updated analyses quota for user: {current_user.email}")
            except Exception as ex:
                logger.error(f"Generator finalization DB save failure: {ex}")

    return StreamingResponse(sse_generator(), media_type="text/event-stream")
