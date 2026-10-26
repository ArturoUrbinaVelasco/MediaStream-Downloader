import re
import asyncio
from typing import Dict, Any, List
import yt_dlp
from app.domain.schemas import MediaMetadataResponse, MediaFormat, PlatformType

class MediaExtractorService:
    """
    Handles URL inspection, platform detection, and metadata extraction.
    Follows Clean Architecture & SRP: focuses only on query extraction.
    """

    @staticmethod
    def detect_platform(url: str) -> PlatformType:
        url_lower = url.lower()
        if "youtube.com" in url_lower or "youtu.be" in url_lower:
            return PlatformType.YOUTUBE
        if "tiktok.com" in url_lower:
            return PlatformType.TIKTOK
        if "instagram.com" in url_lower:
            return PlatformType.INSTAGRAM
        if "twitter.com" in url_lower or "x.com" in url_lower:
            return PlatformType.TWITTER
        if "facebook.com" in url_lower or "fb.watch" in url_lower:
            return PlatformType.FACEBOOK
        if "vimeo.com" in url_lower:
            return PlatformType.VIMEO
        if "twitch.tv" in url_lower:
            return PlatformType.TWITCH
        if "soundcloud.com" in url_lower:
            return PlatformType.SOUNDCLOUD
        return PlatformType.GENERIC

    def _extract_sync(self, url: str) -> Dict[str, Any]:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "extract_flat": False,
            "noplaylist": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)

    async def extract_metadata(self, url: str) -> MediaMetadataResponse:
        """
        Asynchronously inspects URL to extract detailed media metadata.
        Runs synchronous yt-dlp in a separate thread pool.
        """
        loop = asyncio.get_running_loop()
        try:
            info = await loop.run_in_executor(None, self._extract_sync, url)
        except Exception as e:
            raise ValueError(f"Failed to extract metadata: {str(e)}")

        platform = self.detect_platform(url)
        formats: List[MediaFormat] = []

        raw_formats = info.get("formats", [])
        for f in raw_formats:
            vcodec = f.get("vcodec", "none")
            acodec = f.get("acodec", "none")
            has_video = vcodec != "none"
            has_audio = acodec != "none"
            
            # Filter out non-functional fragments
            if not has_video and not has_audio:
                continue

            resolution = f.get("resolution") or (
                f"{f.get('width', '')}x{f.get('height', '')}" if f.get("height") else None
            )

            format_id = str(f.get("format_id", ""))
            ext = f.get("ext", "mp4")
            filesize = f.get("filesize") or f.get("filesize_approx")
            
            note_parts = []
            if resolution:
                note_parts.append(resolution)
            if f.get("fps"):
                note_parts.append(f"{f.get('fps')}fps")
            if f.get("tbr"):
                note_parts.append(f"{int(f.get('tbr'))}k")
            
            label = " - ".join(note_parts) if note_parts else ext.upper()

            formats.append(
                MediaFormat(
                    format_id=format_id,
                    ext=ext,
                    resolution=resolution,
                    filesize=filesize,
                    has_video=has_video,
                    has_audio=has_audio,
                    quality_label=label
                )
            )

        return MediaMetadataResponse(
            id=str(info.get("id", "")),
            url=url,
            title=str(info.get("title", "Untitled Media")),
            uploader=str(info.get("uploader") or info.get("channel") or "Unknown"),
            duration=int(info.get("duration") or 0),
            thumbnail=info.get("thumbnail"),
            platform=platform,
            available_formats=formats,
            view_count=info.get("view_count"),
            description=info.get("description", "")[:300] if info.get("description") else None
        )

extractor_service = MediaExtractorService()
