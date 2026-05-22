from fastapi import APIRouter
from app.api.domains import router as domains_router
from app.api.biography import router as biography_router
from app.api.saved import router as saved_router
from app.api.webhooks import router as webhooks_router

router = APIRouter(prefix="/api/v1")

# Register individual feature routers
router.include_router(domains_router)
router.include_router(biography_router)
router.include_router(saved_router)
router.include_router(webhooks_router)
