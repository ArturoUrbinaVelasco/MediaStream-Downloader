import os
import shutil
import asyncio
import time
import re
from pathlib import Path
from typing import Optional, Dict, Any, List
import httpx
import yt_dlp
from app.core.config import settings
from app.domain.schemas import FormatPreset, ProgressEvent, PlatformType
from app.services.progress import progress_manager
from app.services.extractor import MediaExtractorService, INVIDIOUS_INSTANCES

DEFAULT_STREAM_HEADERS = {
    "User-Agent": "com.google.android.youtube/19.29.37 (Linux; U; Android 14)",
    "Accept": "*/*",
    "Accept-Encoding": "identity",
}

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

def sanitize_filename(name: str) -> str:
    return re.sub(r'[\\/*?:"<>|]', "", name).strip() or "media"


class MediaDownloaderService:
    """
    Executes asynchronous downloads using yt-dlp with real-time SSE progress reporting.
    Features automated multi-tier fail-safe for YouTube cloud datacenter environments.
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
                    "player_client": ["visionos", "android"],
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

    async def _stream_download_chunked(
        self,
        client: httpx.AsyncClient,
        stream_url: str,
        output_path: Path,
        total_size: int,
        task_id: str,
        start_pct: float,
        pct_span: float,
        status_label: str = "downloading"
    ) -> None:
        chunk_size = 512 * 1024  # 512 KB
        downloaded = 0
        t_start = time.time()

        with open(output_path, "wb") as f_out:
            while downloaded < total_size:
                chunk_end = min(downloaded + chunk_size - 1, total_size - 1)
                headers = dict(DEFAULT_STREAM_HEADERS)
                headers["Range"] = f"bytes={downloaded}-{chunk_end}"

                resp = await client.get(stream_url, headers=headers)
                if resp.status_code in (200, 206):
                    f_out.write(resp.content)
                    downloaded += len(resp.content)
                else:
                    break

                elapsed = time.time() - t_start
                speed_val = (downloaded / elapsed) if elapsed > 0 else 0
                pct = start_pct + ((downloaded / total_size) * pct_span)

                event = ProgressEvent(
                    task_id=task_id,
                    status=status_label,
                    percent=round(pct, 1),
                    speed=format_speed(speed_val),
                    downloaded_bytes=downloaded,
                    total_bytes=total_size
                )
                await progress_manager.emit_progress(task_id, event)

    async def _download_via_invidious(
        self,
        task_id: str,
        url: str,
        preset: FormatPreset,
        custom_format_id: Optional[str]
    ) -> None:
        video_id = MediaExtractorService.extract_youtube_video_id(url)
        if not video_id:
            raise ValueError("No se pudo identificar el ID del video de YouTube.")

        # Emit initial status
        await progress_manager.emit_progress(
            task_id,
            ProgressEvent(task_id=task_id, status="starting", percent=2.0)
        )

        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            meta = None
            for instance in INVIDIOUS_INSTANCES:
                try:
                    resp = await client.get(f"{instance}/api/v1/videos/{video_id}")
                    if resp.status_code == 200:
                        meta = resp.json()
                        break
                except Exception:
                    continue

            if not meta:
                raise RuntimeError("No fue posible consultar los flujos de medios en los servidores de respaldo.")

            title = sanitize_filename(meta.get("title", "YouTube Media"))
            adaptive = meta.get("adaptiveFormats", [])
            audio_formats = [f for f in adaptive if "audio" in f.get("type", "")]
            video_formats = [f for f in adaptive if "video" in f.get("type", "")]

            if not audio_formats and not video_formats:
                raise RuntimeError("No hay flujos de audio o video disponibles para esta descarga.")

            is_audio_only = preset in (FormatPreset.AUDIO_BEST, FormatPreset.AUDIO_128K)
            ffmpeg_ok = is_ffmpeg_available()

            if is_audio_only:
                # Select best audio stream
                selected_audio = max(audio_formats, key=lambda f: int(f.get("bitrate") or 0))
                audio_size = int(selected_audio.get("clen") or 0)
                if audio_size == 0:
                    audio_size = int(selected_audio.get("bitrate", 128000)) * int(meta.get("lengthSeconds", 180)) // 8

                temp_audio = settings.TEMP_DOWNLOAD_DIR / f"{task_id}_raw.m4a"
                await self._stream_download_chunked(
                    client=client,
                    stream_url=selected_audio["url"],
                    output_path=temp_audio,
                    total_size=audio_size,
                    task_id=task_id,
                    start_pct=5.0,
                    pct_span=85.0,
                    status_label="downloading"
                )

                await progress_manager.emit_progress(
                    task_id,
                    ProgressEvent(task_id=task_id, status="processing", percent=95.0)
                )

                if ffmpeg_ok:
                    final_file = settings.TEMP_DOWNLOAD_DIR / f"{task_id}.mp3"
                    bitrate = "320k" if preset == FormatPreset.AUDIO_BEST else "128k"
                    cmd = ["ffmpeg", "-y", "-i", str(temp_audio), "-vn", "-b:a", bitrate, str(final_file)]
                    proc = await asyncio.create_subprocess_exec(
                        *cmd,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE
                    )
                    await proc.communicate()
                    if temp_audio.exists():
                        temp_audio.unlink(missing_ok=True)
                else:
                    final_file = settings.TEMP_DOWNLOAD_DIR / f"{task_id}.m4a"
                    temp_audio.rename(final_file)

                progress_manager.set_task_file(task_id, final_file)
                final_filename = f"{title}{final_file.suffix}"
                await progress_manager.emit_progress(
                    task_id,
                    ProgressEvent(
                        task_id=task_id,
                        status="finished",
                        percent=100.0,
                        filename=final_filename
                    )
                )

            else:
                # Video download
                best_audio = max(audio_formats, key=lambda f: int(f.get("bitrate") or 0)) if audio_formats else None
                
                # Match video preset
                if preset == FormatPreset.VIDEO_1080P:
                    candidates = [f for f in video_formats if "1080" in f.get("qualityLabel", "")]
                    selected_video = candidates[0] if candidates else video_formats[0]
                elif preset == FormatPreset.VIDEO_720P:
                    candidates = [f for f in video_formats if "720" in f.get("qualityLabel", "")]
                    selected_video = candidates[0] if candidates else video_formats[0]
                else:
                    # VIDEO_BEST: highest resolution
                    selected_video = max(video_formats, key=lambda f: int(f.get("bitrate") or 0))

                video_size = int(selected_video.get("clen") or 0)
                if video_size == 0:
                    video_size = int(selected_video.get("bitrate", 1000000)) * int(meta.get("lengthSeconds", 180)) // 8

                temp_video = settings.TEMP_DOWNLOAD_DIR / f"{task_id}_vid.mp4"
                await self._stream_download_chunked(
                    client=client,
                    stream_url=selected_video["url"],
                    output_path=temp_video,
                    total_size=video_size,
                    task_id=task_id,
                    start_pct=5.0,
                    pct_span=55.0,
                    status_label="downloading"
                )

                if best_audio and ffmpeg_ok:
                    audio_size = int(best_audio.get("clen") or 0)
                    if audio_size == 0:
                        audio_size = int(best_audio.get("bitrate", 128000)) * int(meta.get("lengthSeconds", 180)) // 8

                    temp_audio = settings.TEMP_DOWNLOAD_DIR / f"{task_id}_aud.m4a"
                    await self._stream_download_chunked(
                        client=client,
                        stream_url=best_audio["url"],
                        output_path=temp_audio,
                        total_size=audio_size,
                        task_id=task_id,
                        start_pct=60.0,
                        pct_span=30.0,
                        status_label="downloading"
                    )

                    await progress_manager.emit_progress(
                        task_id,
                        ProgressEvent(task_id=task_id, status="processing", percent=92.0)
                    )

                    final_file = settings.TEMP_DOWNLOAD_DIR / f"{task_id}.mp4"
                    cmd = [
                        "ffmpeg", "-y", "-i", str(temp_video), "-i", str(temp_audio),
                        "-c:v", "copy", "-c:a", "aac", "-shortest", str(final_file)
                    ]
                    proc = await asyncio.create_subprocess_exec(
                        *cmd,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE
                    )
                    await proc.communicate()

                    temp_video.unlink(missing_ok=True)
                    temp_audio.unlink(missing_ok=True)
                else:
                    final_file = settings.TEMP_DOWNLOAD_DIR / f"{task_id}.mp4"
                    temp_video.rename(final_file)

                progress_manager.set_task_file(task_id, final_file)
                final_filename = f"{title}.mp4"
                await progress_manager.emit_progress(
                    task_id,
                    ProgressEvent(
                        task_id=task_id,
                        status="finished",
                        percent=100.0,
                        filename=final_filename
                    )
                )

    async def start_download(
        self,
        task_id: str,
        url: str,
        preset: FormatPreset,
        custom_format_id: Optional[str] = None
    ) -> None:
        loop = asyncio.get_running_loop()
        progress_manager.register_task(task_id)

        target_url = MediaExtractorService.clean_url(url)
        is_youtube = MediaExtractorService.detect_platform(target_url) == PlatformType.YOUTUBE

        try:
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
            # If YouTube and yt-dlp failed (e.g. cloud datacenter IP blocked), activate Invidious fallback
            if is_youtube:
                try:
                    await self._download_via_invidious(task_id, target_url, preset, custom_format_id)
                    return
                except Exception as inv_err:
                    e = inv_err

            error_event = ProgressEvent(
                task_id=task_id,
                status="error",
                percent=0.0,
                error=str(e)
            )
            await progress_manager.emit_progress(task_id, error_event)


downloader_service = MediaDownloaderService()
