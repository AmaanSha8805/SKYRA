from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/skyra_dev"
    gemini_api_key: str = ""
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    jwt_secret_key: str = "change-this-in-production"
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3003", "http://localhost:3004", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3003", "http://127.0.0.1:3004"]
    log_level: str = "INFO"
    
    # Email settings
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "SKYRA"


settings = Settings()
