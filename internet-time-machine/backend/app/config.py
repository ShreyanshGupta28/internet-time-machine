import logging
import sys
from pydantic_settings import BaseSettings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("itm_config")

class Settings(BaseSettings):
    DATABASE_URL: str
    ANTHROPIC_API_KEY: str
    CLERK_SECRET_KEY: str
    CLERK_WEBHOOK_SECRET: str
    SECRET_KEY: str
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    FREE_TIER_DAILY_ANALYSES: int = 5

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

try:
    settings = Settings()
except Exception as e:
    logger.error("=" * 60)
    logger.error("CRITICAL STARTUP ERROR: Missing or invalid environment variables!")
    logger.error("Ensure that all required variables are set in backend/.env")
    logger.error("Required variables: DATABASE_URL, ANTHROPIC_API_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, SECRET_KEY")
    logger.error(str(e))
    logger.error("=" * 60)
    sys.exit(1)
