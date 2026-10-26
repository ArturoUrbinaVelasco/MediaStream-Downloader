import uuid
import urllib.parse
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from fastapi.responses import FileResponse
from sse_starlette.sse import EventSourceResponse

from app.core.config import settings
from app.domain.schemas import (
    ExtractRequest,
    MediaMetadataResponse,
    DownloadRequest,
    DownloadTaskResponse,
    HealthResponse,
)
from app.services.extractor import extractor_service
from app.services.downloader import downloader_service, is_ffmpeg_available
from app.services.progress import progress_manager

router = APIRouter(tags=["Media Operations"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        ffmpeg_available=is_ffmpeg_available()
    )

@router.post("/extract", response_model=MediaMetadataResponse)
async def extract_metadata(payload: ExtractRequest):
    try:
        metadata = await extractor_service.extract_metadata(payload.url)
        return metadata
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error inspecting media: {str(e)}"
        )

@router.post("/download", response_model=DownloadTaskResponse)
async def initiate_download(payload: DownloadRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    # Schedule download in background task so API responds immediately with task_id
    background_tasks.add_task(
        downloader_service.start_download,
        task_id=task_id,
        url=payload.url,
        preset=payload.preset,
        custom_format_id=payload.custom_format_id
    )
    return DownloadTaskResponse(
        task_id=task_id,
        status="starting",
        message="Download queued successfully"
    )

@router.get("/progress/{task_id}")
async def stream_progress(task_id: str):
    return EventSourceResponse(progress_manager.subscribe(task_id))

@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    status = progress_manager.get_task_status(task_id)
    return {"task_id": task_id, "status": status}

@router.get("/file/{task_id}")
async def download_file(task_id: str, filename: str = Query(default=None)):
    target_path = progress_manager.get_task_file(task_id)
    if not target_path or not target_path.exists():
        # Check if file exists on disk
        candidates = list(settings.TEMP_DOWNLOAD_DIR.glob(f"{task_id}.*"))
        if candidates:
            target_path = candidates[0]
        else:
            raise HTTPException(status_code=404, detail="Requested file not found or expired")

    download_name = filename if filename else target_path.name
    # Ensure extension is preserved
    if not download_name.endswith(target_path.suffix):
        download_name += target_path.suffix

    safe_name = urllib.parse.quote(download_name)
    headers = {
        "Content-Disposition": f"attachment; filename*=UTF-8''{safe_name}"
    }

    return FileResponse(
        path=str(target_path),
        media_type="application/octet-stream",
        filename=download_name,
        headers=headers
    )
