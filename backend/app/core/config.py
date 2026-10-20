from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List


def _normalize_database_url(url: str) -> str:
    """
    Normalize database URL to use psycopg v3 driver.
    Converts postgres:// or postgresql:// to postgresql+psycopg://
    to ensure SQLAlchemy uses the installed psycopg v3 instead of psycopg2.
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/skyra_dev"
    gemini_api_key: str = ""
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    jwt_secret_key: str = "change-this-in-production"
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3003", "http://localhost:3004", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3003", "http://127.0.0.1:3004", "https://skyra-zueq.onrender.com", "https://theskyra.in", "https://www.theskyra.in"]
    log_level: str = "INFO"

    # Email settings
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "SKYRA"

    @property
    def normalized_database_url(self) -> str:
        """Return the database URL with psycopg v3 driver."""
        return _normalize_database_url(self.database_url)


settings = Settings()
