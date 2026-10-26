import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.services.extractor import MediaExtractorService
from app.domain.schemas import PlatformType, ProgressEvent
from app.services.progress import ProgressManager

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "MediaStream Downloader API" in data["project"]
    assert data["docs_url"] == "/docs"

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ffmpeg_available" in data

def test_platform_detection():
    assert MediaExtractorService.detect_platform("https://www.youtube.com/watch?v=dQw4w9WgXcQ") == PlatformType.YOUTUBE
    assert MediaExtractorService.detect_platform("https://youtu.be/dQw4w9WgXcQ") == PlatformType.YOUTUBE
    assert MediaExtractorService.detect_platform("https://www.tiktok.com/@user/video/123456789") == PlatformType.TIKTOK
    assert MediaExtractorService.detect_platform("https://www.instagram.com/reel/C8xyz123/") == PlatformType.INSTAGRAM
    assert MediaExtractorService.detect_platform("https://x.com/user/status/123456") == PlatformType.TWITTER
    assert MediaExtractorService.detect_platform("https://example.com/video.mp4") == PlatformType.GENERIC

def test_extract_invalid_payload():
    response = client.post("/api/v1/extract", json={"url": "abc"})
    # Fails min_length validation or URL check
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_progress_manager_lifecycle():
    pm = ProgressManager()
    task_id = "test-task-123"
    pm.register_task(task_id)
    assert pm.get_task_status(task_id) == "starting"

    event = ProgressEvent(
        task_id=task_id,
        status="downloading",
        percent=45.5,
        speed="3.5 MB/s"
    )
    await pm.emit_progress(task_id, event)
    assert pm.get_task_status(task_id) == "downloading"
