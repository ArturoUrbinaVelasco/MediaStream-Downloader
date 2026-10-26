import re
import urllib.parse
import asyncio
from typing import Dict, Any, List
import yt_dlp
from app.domain.schemas import MediaMetadataResponse, MediaFormat, PlatformType

DEFAULT_HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Sec-Fetch-Mode": "navigate",
}

class MediaExtractorService:
    """
    Handles URL inspection, platform detection, and metadata extraction.
    Follows Clean Architecture & SRP: focuses only on query extraction.
    """

    @staticmethod
    def clean_url(url: str) -> str:
        """
        Removes noisy playlist / tracking parameters from single video URLs.
        """
        try:
            parsed = urllib.parse.urlparse(url)
            # If it's a YouTube video link with &list=, strip list param unless it's a playlist page
            if ("youtube.com" in parsed.netloc or "youtu.be" in parsed.netloc) and "/playlist" not in parsed.path:
                qs = urllib.parse.parse_qs(parsed.query)
                if "v" in qs:
                    clean_query = urllib.parse.urlencode({"v": qs["v"][0]})
                    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", clean_query, ""))
            return url
        except Exception:
            return url

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
            "nocheckcertificate": True,
            "http_headers": DEFAULT_HTTP_HEADERS,
            "extractor_args": {
                "youtube": {
                    "player_client": ["android", "ios", "mweb", "web"],
                    "player_skip": ["js", "configs", "webpage"],
                }
            },
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)

    def _sanitize_error_message(self, raw_error: str) -> str:
        err = raw_error.lower()
        if "this video is unavailable" in err or "video unavailable" in err:
            return "El video no está disponible, es privado o fue eliminado de la plataforma."
        if "private video" in err:
            return "Este video es privado y no permite acceso público."
        if "sign in to confirm your age" in err or "age" in err:
            return "El contenido tiene restricción de edad en la plataforma."
        if "not available in your country" in err or "geographic" in err:
            return "Este contenido tiene restricciones geográficas regionales."
        if "failed to extract any player response" in err:
            return "La plataforma temporalmente no respondió. Por favor intenta de nuevo en unos segundos."
        return raw_error

    async def extract_metadata(self, url: str) -> MediaMetadataResponse:
        """
        Asynchronously inspects URL to extract detailed media metadata.
        Runs synchronous yt-dlp in a separate thread pool.
        """
        clean_target_url = self.clean_url(url)
        loop = asyncio.get_running_loop()
        try:
            info = await loop.run_in_executor(None, self._extract_sync, clean_target_url)
        except Exception as e:
            friendly_err = self._sanitize_error_message(str(e))
            raise ValueError(friendly_err)

        platform = self.detect_platform(clean_target_url)
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
            url=clean_target_url,
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
