import re
import urllib.parse
import asyncio
from typing import Dict, Any, List, Optional
import httpx
import yt_dlp
from app.domain.schemas import MediaMetadataResponse, MediaFormat, PlatformType

DEFAULT_HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Sec-Fetch-Mode": "navigate",
}

INVIDIOUS_INSTANCES = [
    "https://yt.chocolatemoo53.com",
    "https://inv.nadeko.net",
    "https://invidious.nerdvpn.de"
]


class MediaExtractorService:
    """
    Handles URL inspection, platform detection, and metadata extraction.
    Follows Clean Architecture & SRP: focuses only on query extraction.
    Features automated multi-tier fallback (yt-dlp visionos/android -> Invidious API).
    """

    @staticmethod
    def clean_url(url: str) -> str:
        """
        Removes noisy playlist / tracking parameters from single video URLs.
        """
        try:
            parsed = urllib.parse.urlparse(url)
            if ("youtube.com" in parsed.netloc or "youtu.be" in parsed.netloc) and "/playlist" not in parsed.path:
                qs = urllib.parse.parse_qs(parsed.query)
                if "v" in qs:
                    clean_query = urllib.parse.urlencode({"v": qs["v"][0]})
                    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", clean_query, ""))
            return url
        except Exception:
            return url

    @staticmethod
    def extract_youtube_video_id(url: str) -> Optional[str]:
        patterns = [
            r'(?:v=|\/v\/|youtu\.be\/|embed\/|\/live\/|\/shorts\/)([a-zA-Z0-9_-]{11})',
            r'^([a-zA-Z0-9_-]{11})$'
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

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
            "js_runtimes": {"node": {}},
            "extractor_args": {
                "youtube": {
                    "player_client": ["visionos", "android"],
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

    async def _extract_via_invidious(self, url: str) -> MediaMetadataResponse:
        """
        Fallback extraction for YouTube when datacenter IPs are blocked by Google.
        Uses public Invidious high-availability API endpoints.
        """
        video_id = self.extract_youtube_video_id(url)
        if not video_id:
            raise ValueError("No se pudo identificar el identificador del video de YouTube.")

        last_error = None
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            for instance in INVIDIOUS_INSTANCES:
                try:
                    api_url = f"{instance}/api/v1/videos/{video_id}"
                    resp = await client.get(api_url, headers=DEFAULT_HTTP_HEADERS)
                    if resp.status_code == 200:
                        data = resp.json()
                        return self._parse_invidious_response(video_id, url, data)
                except Exception as err:
                    last_error = err
                    continue

        raise ValueError(
            self._sanitize_error_message(str(last_error or "Invidious fallback failed"))
        )

    def _parse_invidious_response(self, video_id: str, original_url: str, data: Dict[str, Any]) -> MediaMetadataResponse:
        formats: List[MediaFormat] = []
        adaptive = data.get("adaptiveFormats", [])

        for f in adaptive:
            ftype = f.get("type", "")
            has_video = "video" in ftype
            has_audio = "audio" in ftype
            if not has_video and not has_audio:
                continue

            itag = str(f.get("itag", ""))
            ext = f.get("container") or ("mp4" if "mp4" in ftype else "webm")
            res = f.get("resolution") or f.get("qualityLabel")
            filesize = int(f.get("clen")) if f.get("clen") else f.get("filesize")
            bitrate = f.get("bitrate")

            label_parts = []
            if res:
                label_parts.append(res)
            elif has_audio and bitrate:
                kbps = int(bitrate) // 1000
                label_parts.append(f"{kbps}kbps Audio")
            if ext:
                label_parts.append(ext.upper())

            label = " - ".join(label_parts) if label_parts else ext.upper()

            formats.append(
                MediaFormat(
                    format_id=itag,
                    ext=ext,
                    resolution=res,
                    filesize=filesize,
                    has_video=has_video,
                    has_audio=has_audio,
                    quality_label=label
                )
            )

        # Select highest quality thumbnail
        thumbnails = data.get("videoThumbnails", [])
        thumbnail_url = thumbnails[-1]["url"] if thumbnails else f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"

        return MediaMetadataResponse(
            id=video_id,
            url=original_url,
            title=str(data.get("title", "YouTube Media")),
            uploader=str(data.get("author", "YouTube Channel")),
            duration=int(data.get("lengthSeconds") or 0),
            thumbnail=thumbnail_url,
            platform=PlatformType.YOUTUBE,
            available_formats=formats,
            view_count=data.get("viewCount"),
            description=data.get("description", "")[:300] if data.get("description") else None
        )

    def _parse_ytdlp_formats(self, raw_formats: List[Dict[str, Any]]) -> List[MediaFormat]:
        formats: List[MediaFormat] = []
        for f in raw_formats:
            vcodec = f.get("vcodec", "none")
            acodec = f.get("acodec", "none")
            has_video = vcodec != "none"
            has_audio = acodec != "none"

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
        return formats

    async def extract_metadata(self, url: str) -> MediaMetadataResponse:
        """
        Asynchronously inspects URL to extract detailed media metadata.
        For YouTube, prioritizes the ultra-fast Invidious API (0.8s response) to avoid
        datacenter IP blocks on cloud servers, with yt-dlp fallback.
        For other platforms (TikTok, SoundCloud, Twitter, Instagram), uses yt-dlp.
        """
        clean_target_url = self.clean_url(url)
        platform = self.detect_platform(clean_target_url)
        loop = asyncio.get_running_loop()

        # YouTube optimization: Invidious first for zero-latency extraction on cloud servers
        if platform == PlatformType.YOUTUBE:
            try:
                return await self._extract_via_invidious(clean_target_url)
            except Exception:
                # Fall back to yt-dlp if Invidious instances are unavailable
                pass

        try:
            info = await loop.run_in_executor(None, self._extract_sync, clean_target_url)
            formats = self._parse_ytdlp_formats(info.get("formats", []))
            
            if platform == PlatformType.YOUTUBE and not formats:
                raise ValueError("No formats returned by yt-dlp")

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
        except Exception as e:
            if platform == PlatformType.YOUTUBE:
                try:
                    return await self._extract_via_invidious(clean_target_url)
                except Exception:
                    pass

            friendly_err = self._sanitize_error_message(str(e))
            raise ValueError(friendly_err)


extractor_service = MediaExtractorService()
