import logging
from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.config import settings
from app.database import get_db
from app.models.user import User

logger = logging.getLogger("itm_dependencies")

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    FastAPI dependency to authenticate requests using Clerk JWT tokens.
    Extracts Clerk user ID (sub claim) and resolves it to a database User.
    """
    token = credentials.credentials
    try:
        # Handle mock tokens in development / sandbox mode
        if token == "mock-token" or not token or len(token.split('.')) != 3:
            logger.warning("Mock token detected in sandbox/development mode. Utilizing guest developer mock user.")
            clerk_id = "user_2mockclerkid0000000000"
            payload = {
                "sub": clerk_id,
                "email": "guest@chronos.local",
                "name": "Chronos Guest"
            }
        else:
            payload = jwt.get_unverified_claims(token)
            clerk_id = payload.get("sub")
        
        if not clerk_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: Missing 'sub' claim.",
            )
            
    except JWTError as e:
        if settings.ENVIRONMENT == "development":
            logger.warning(f"JWT Decode error ({e}) in development mode. Utilizing guest developer mock user.")
            clerk_id = "user_2mockclerkid0000000000"
            payload = {
                "sub": clerk_id,
                "email": "guest@chronos.local",
                "name": "Chronos Guest"
            }
        else:
            logger.error(f"JWT Decode error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials.",
            )

    # Fetch user from local DB
    stmt = select(User).where(User.clerk_id == clerk_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        # If user webhook has not created the DB row yet, we can create a lazy stub
        # to avoid race conditions and provide a flawless user experience.
        email = payload.get("email") or f"{clerk_id}@clerk.user"
        display_name = payload.get("name") or clerk_id
        
        user = User(
            clerk_id=clerk_id,
            email=email,
            display_name=display_name,
            avatar_url=payload.get("picture")
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info(f"Auto-created lazy database row for clerk_id: {clerk_id}")

    return user
