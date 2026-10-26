import os
import shutil
import asyncio
import uuid
from pathlib import Path
from typing import Optional, Dict, Any
import yt_dlp
from app.core.config import settings
from app.domain.schemas import FormatPreset, ProgressEvent
from app.services.progress import progress_manager

def is_ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None

def format_speed(speed_bytes_sec: Optional[float]) -> str:
    if not speed_bytes_sec or speed_bytes_sec <= 0:
        return "0 KB/s"
    mb = speed_bytes_sec / (1024 * 1024)
    if mb >= 1.0:
        return f"{mb:.1f} MB/s"
    kb = speed_bytes_sec / 1024
    return f"{kb:.0f} KB/s"

class MediaDownloaderService:
    """
    Executes asynchronous downloads using yt-dlp with real-time SSE progress reporting.
    """

    def _build_ydl_options(
        self,
        task_id: str,
        preset: FormatPreset,
        custom_format_id: Optional[str],
        loop: asyncio.AbstractEventLoop
    ) -> Dict[str, Any]:
        out_template = str(settings.TEMP_DOWNLOAD_DIR / f"{task_id}.%(ext)s")
        ffmpeg_ok = is_ffmpeg_available()

        def progress_hook(d: Dict[str, Any]):
            status = d.get("status")
            if status == "downloading":
                total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
                downloaded = d.get("downloaded_bytes") or 0
                percent = round((downloaded / total) * 100, 1) if total > 0 else 0.0
                speed = format_speed(d.get("speed"))
                eta = d.get("eta")

                event = ProgressEvent(
                    task_id=task_id,
                    status="downloading",
                    percent=percent,
                    speed=speed,
                    eta=eta,
                    downloaded_bytes=downloaded,
                    total_bytes=total
                )
                asyncio.run_coroutine_threadsafe(
                    progress_manager.emit_progress(task_id, event), loop
                )

            elif status == "finished":
                event = ProgressEvent(
                    task_id=task_id,
                    status="processing",
                    percent=100.0,
                    filename=d.get("filename")
                )
                asyncio.run_coroutine_threadsafe(
                    progress_manager.emit_progress(task_id, event), loop
                )

        opts: Dict[str, Any] = {
            "outtmpl": out_template,
            "quiet": True,
            "no_warnings": True,
            "noplaylist": True,
            "progress_hooks": [progress_hook],
            "nocheckcertificate": True,
            "http_headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            },
            "js_runtimes": {"node": {}},
            "extractor_args": {
                "youtube": {
                    "player_client": ["android", "ios", "mweb", "web"],
                }
            },
        }

        if custom_format_id:
            opts["format"] = custom_format_id
            return opts

        if preset in (FormatPreset.AUDIO_BEST, FormatPreset.AUDIO_128K):
            if ffmpeg_ok:
                opts["format"] = "bestaudio/best"
                bitrate = "320" if preset == FormatPreset.AUDIO_BEST else "128"
                opts["postprocessors"] = [{
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": bitrate,
                }]
            else:
                # Fallback: extract highest audio format directly without conversion
                opts["format"] = "bestaudio/best"
        elif preset == FormatPreset.VIDEO_1080P:
            if ffmpeg_ok:
                opts["format"] = "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best"
            else:
                opts["format"] = "best[height<=1080][ext=mp4]/best[height<=1080]/best"
        elif preset == FormatPreset.VIDEO_720P:
            if ffmpeg_ok:
                opts["format"] = "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best"
            else:
                opts["format"] = "best[height<=720][ext=mp4]/best[height<=720]/best"
        else:
            # VIDEO_BEST default
            if ffmpeg_ok:
                opts["format"] = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best"
                opts["merge_output_format"] = "mp4"
            else:
                opts["format"] = "best[ext=mp4]/best"

        return opts

    def _execute_download_sync(self, url: str, ydl_opts: Dict[str, Any]) -> str:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            return info.get("title", "Media")

    async def start_download(
        self,
        task_id: str,
        url: str,
        preset: FormatPreset,
        custom_format_id: Optional[str] = None
    ) -> None:
        loop = asyncio.get_running_loop()
        progress_manager.register_task(task_id)

        try:
            from app.services.extractor import MediaExtractorService
            target_url = MediaExtractorService.clean_url(url)
            ydl_opts = self._build_ydl_options(task_id, preset, custom_format_id, loop)
            title = await loop.run_in_executor(
                None, self._execute_download_sync, target_url, ydl_opts
            )

            # Locate downloaded file with task_id prefix
            matching_files = list(settings.TEMP_DOWNLOAD_DIR.glob(f"{task_id}.*"))
            if not matching_files:
                raise FileNotFoundError("Output file was not generated by downloader engine.")

            target_file = matching_files[0]
            progress_manager.set_task_file(task_id, target_file)

            final_event = ProgressEvent(
                task_id=task_id,
                status="finished",
                percent=100.0,
                filename=f"{title}{target_file.suffix}"
            )
            await progress_manager.emit_progress(task_id, final_event)

        except Exception as e:
            error_event = ProgressEvent(
                task_id=task_id,
                status="error",
                percent=0.0,
                error=str(e)
            )
            await progress_manager.emit_progress(task_id, error_event)

downloader_service = MediaDownloaderService()
