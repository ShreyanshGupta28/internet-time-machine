import logging
import json
from fastapi import APIRouter, Request, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from svix.webhooks import Webhook, WebhookVerificationError
from app.config import settings
from app.database import get_db
from app.models.user import User

logger = logging.getLogger("itm_api_webhooks")
router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/clerk")
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Webhook handler for Clerk user events (user.created, user.updated).
    Validates Svix signatures and synchronizes user state to local DB.
    """
    headers = request.headers
    payload = await request.body()
    
    # 1. Verification Block
    # Check if a valid webhook secret is present
    if settings.CLERK_WEBHOOK_SECRET and settings.CLERK_WEBHOOK_SECRET != "whsec_REPLACE_ME":
        svix_id = headers.get("svix-id")
        svix_timestamp = headers.get("svix-timestamp")
        svix_signature = headers.get("svix-signature")
        
        if not svix_id or not svix_timestamp or not svix_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Svix signature headers."
            )
            
        try:
            wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
            msg_data = wh.verify(payload, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature
            })
        except WebhookVerificationError as err:
            logger.error(f"Svix signature validation failed: {err}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Svix signature."
            )
    else:
        # Development fallback (bypass signature verification if secret is unconfigured)
        logger.warning("CLERK_WEBHOOK_SECRET is not set. Decoding body without verification for development.")
        try:
            msg_data = json.loads(payload.decode("utf-8"))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON payload: {e}"
            )

    # 2. Extract Event & Synced Attributes
    event_type = msg_data.get("type")
    event_payload = msg_data.get("data", {})
    
    if event_type not in ["user.created", "user.updated"]:
        logger.info(f"Ignored Clerk event: {event_type}")
        return {"status": "ignored"}

    clerk_id = event_payload.get("id")
    email_addresses = event_payload.get("email_addresses", [])
    email = None
    if email_addresses:
        email = email_addresses[0].get("email_address")
    
    if not clerk_id or not email:
        logger.warning("Clerk event missing clerk_id or primary email.")
        return {"status": "missing_fields"}

    first_name = event_payload.get("first_name") or ""
    last_name = event_payload.get("last_name") or ""
    display_name = f"{first_name} {last_name}".strip() or email.split("@")[0]
    avatar_url = event_payload.get("image_url") or event_payload.get("profile_image_url")

    # 3. Database Sync
    stmt = select(User).where(User.clerk_id == clerk_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user:
        # Update User
        user.email = email
        user.display_name = display_name
        user.avatar_url = avatar_url
        logger.info(f"Synchronized updated user in DB: {email}")
    else:
        # Create User
        user = User(
            clerk_id=clerk_id,
            email=email,
            display_name=display_name,
            avatar_url=avatar_url
        )
        db.add(user)
        logger.info(f"Synchronized new user in DB: {email}")

    await db.commit()
    return {"status": "ok"}
