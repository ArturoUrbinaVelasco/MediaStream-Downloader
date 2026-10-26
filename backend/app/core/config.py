import os
from pathlib import Path
from typing import List, Union, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediaStream Downloader API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)
    
    # Host & Port
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "capacitor://localhost",
        "http://localhost",
        "*"
    ]
    
    # Storage & Cache
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    TEMP_DOWNLOAD_DIR: Path = BASE_DIR / "temp_downloads"
    FILE_TTL_SECONDS: int = 1800  # 30 minutes
    MAX_CONCURRENT_DOWNLOADS: int = 5
    
    # Optional YouTube Authentication Cookies
    YOUTUBE_COOKIES_TEXT: Optional[str] = Field(default=None)
    YOUTUBE_COOKIES_FILE: Optional[str] = Field(default=None)

    def get_cookie_file_path(self) -> Optional[str]:
        if self.YOUTUBE_COOKIES_FILE and Path(self.YOUTUBE_COOKIES_FILE).exists():
            return self.YOUTUBE_COOKIES_FILE
        default_file = self.BASE_DIR / "cookies.txt"
        if default_file.exists():
            return str(default_file)
        if self.YOUTUBE_COOKIES_TEXT:
            target = self.TEMP_DOWNLOAD_DIR / "auth_cookies.txt"
            target.write_text(self.YOUTUBE_COOKIES_TEXT, encoding="utf-8")
            return str(target)
        return None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

# Ensure temp directory exists
os.makedirs(settings.TEMP_DOWNLOAD_DIR, exist_ok=True)
