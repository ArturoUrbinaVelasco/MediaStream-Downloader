from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, HttpUrl, Field

class PlatformType(str, Enum):
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    VIMEO = "vimeo"
    TWITCH = "twitch"
    SOUNDCLOUD = "soundcloud"
    GENERIC = "generic"

class FormatPreset(str, Enum):
    VIDEO_BEST = "video_best"
    VIDEO_1080P = "video_1080p"
    VIDEO_720P = "video_720p"
    AUDIO_BEST = "audio_best"
    AUDIO_128K = "audio_128k"

class ExtractRequest(BaseModel):
    url: str = Field(..., min_length=4, description="URL pública del medio a inspeccionar")

class MediaFormat(BaseModel):
    format_id: str
    ext: str
    resolution: Optional[str] = None
    filesize: Optional[int] = None
    has_video: bool = True
    has_audio: bool = True
    quality_label: Optional[str] = None

class MediaMetadataResponse(BaseModel):
    id: str
    url: str
    title: str
    uploader: Optional[str] = "Unknown"
    duration: Optional[int] = 0
    thumbnail: Optional[str] = None
    platform: PlatformType = PlatformType.GENERIC
    available_formats: List[MediaFormat] = []
    view_count: Optional[int] = None
    description: Optional[str] = None

class DownloadRequest(BaseModel):
    url: str = Field(..., min_length=4, description="URL pública del medio a descargar")
    preset: FormatPreset = Field(default=FormatPreset.VIDEO_BEST, description="Preset de formato")
    custom_format_id: Optional[str] = Field(default=None, description="Formato específico opcional")

class DownloadTaskResponse(BaseModel):
    task_id: str
    status: str
    message: str

class ProgressEvent(BaseModel):
    task_id: str
    status: str  # 'starting', 'downloading', 'processing', 'finished', 'error'
    percent: float = 0.0
    speed: Optional[str] = None
    eta: Optional[int] = None
    downloaded_bytes: Optional[int] = None
    total_bytes: Optional[int] = None
    filename: Optional[str] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    ffmpeg_available: bool
