from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./alden.db"
    
    # AI API
    gemini_api_key: Optional[str] = None
    
    # CORS
    allow_origins: list = ["*"]  # In production, specify exact origins
    allow_credentials: bool = True
    allow_methods: list = ["*"]
    allow_headers: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Load API key from environment if not set
        if not self.gemini_api_key:
            self.gemini_api_key = os.environ.get("GEMINI_API_KEY")

settings = Settings() 