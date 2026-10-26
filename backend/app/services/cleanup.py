import os
import time
import asyncio
from pathlib import Path
from app.core.config import settings

async def cleanup_expired_files_loop() -> None:
    """
    Background worker that runs every 10 minutes to remove files
    exceeding FILE_TTL_SECONDS (default 30 mins) from TEMP_DOWNLOAD_DIR.
    """
    while True:
        try:
            await asyncio.sleep(600)  # Check every 10 minutes
            now = time.time()
            if not settings.TEMP_DOWNLOAD_DIR.exists():
                continue

            for file_path in settings.TEMP_DOWNLOAD_DIR.iterdir():
                if file_path.is_file():
                    file_age = now - file_path.stat().st_mtime
                    if file_age > settings.FILE_TTL_SECONDS:
                        try:
                            file_path.unlink()
                        except OSError:
                            pass
        except asyncio.CancelledError:
            break
        except Exception:
            pass
