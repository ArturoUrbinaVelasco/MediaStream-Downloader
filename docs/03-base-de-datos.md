# 03. Modelo de Datos y Almacenamiento - MediaStream Downloader

## 1. Filosofía de Datos: Privacidad y Arquitectura Efímera
Por diseño ético y de seguridad, **MediaStream Downloader** sigue una filosofía de **Zero-Data Retention** en el backend:
- El servidor no almacena historiales, IPs, credenciales ni registros permanentes de los contenidos que los usuarios descargan.
- Los archivos transcodificados residen en una partición temporal en el servidor con eliminación programada (`TTL = 30 minutos`).
- Toda la persistencia de configuraciones, preferencias del usuario e historial de descargas se gestiona **100% de forma local en el dispositivo del cliente** mediante almacenamiento seguro en el navegador y APIs nativas de almacenamiento en Android.

---

## 2. Esquema de Datos en Almacenamiento Local (Frontend - Zustand / LocalStorage)

### 2.1. Store de Preferencias del Usuario (`SettingsStore`)
Almacena la configuración de interfaz y comportamiento preferido:

```typescript
interface UserSettings {
  /** Idioma activo: 'es' (Español) o 'en' (Inglés) */
  language: 'es' | 'en';
  /** Modo visual: 'light', 'dark' o 'system' */
  theme: 'light' | 'dark' | 'system';
  /** Formato por defecto para descargas rápidas */
  defaultFormat: 'video_hd' | 'audio_hq';
  /** Si debe descargar automáticamente tras validar enlace */
  autoDownload: boolean;
  /** Limite máximo de elementos en el historial local */
  maxHistoryItems: number;
}
```

### 2.2. Store de Historial de Descargas (`HistoryStore`)
Permite al usuario consultar qué ha descargado previamente en su dispositivo sin compartirlo con el servidor:

```typescript
interface HistoryItem {
  id: string;                 // UUID v4 único
  originalUrl: string;        // URL de origen
  title: string;              // Título del medio
  thumbnailUrl: string;       // URL de miniatura
  duration: number;           // Duración en segundos
  platform: string;           // 'youtube', 'tiktok', 'instagram', 'twitter', 'other'
  format: 'mp4' | 'mp3';      // Formato seleccionado
  fileSizeEstimate: string;   // Ej: '45.2 MB'
  downloadedAt: string;       // Timestamp ISO 8601
  status: 'completed' | 'failed';
}
```

---

## 3. Esquema de Entidades en Tránsito (Backend - DTOs Pydantic)

A nivel de API, los contratos de datos son estrictamente validados mediante esquemas Pydantic v2:

```python
# app/domain/schemas.py
from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from enum import Enum

class MediaType(str, Enum):
    VIDEO = "video"
    AUDIO = "audio"

class FormatPreset(str, Enum):
    VIDEO_BEST = "video_best"     # Mejor video + audio disponible (muxed a MP4)
    VIDEO_1080P = "video_1080p"   # Máximo 1080p MP4
    VIDEO_720P = "video_720p"     # Máximo 720p MP4
    AUDIO_BEST = "audio_best"     # Audio original extraído y convertido a MP3 320k
    AUDIO_128K = "audio_128k"     # Audio MP3 optimizado para tamaño ligero

class ExtractRequest(BaseModel):
    url: HttpUrl = Field(..., description="URL pública del medio a inspeccionar")

class MediaFormatInfo(BaseModel):
    format_id: str
    extension: str
    resolution: Optional[str] = None
    filesize_approx: Optional[int] = None
    note: Optional[str] = None
    has_video: bool
    has_audio: bool

class MediaMetadataResponse(BaseModel):
    id: str
    url: str
    title: str
    uploader: Optional[str] = None
    duration: Optional[int] = None
    thumbnail: Optional[str] = None
    extractor: str
    available_formats: List[MediaFormatInfo]

class DownloadRequest(BaseModel):
    url: HttpUrl
    preset: FormatPreset = FormatPreset.VIDEO_BEST

class DownloadTaskResponse(BaseModel):
    task_id: str
    status: str
    message: str
```

---

## 4. Gestión de Memoria y Ciclo de Vida en Disco del Backend

Para operaciones con alta concurrencia:
- Directorio de trabajo: `/tmp/mediastream_cache/` (o `%TEMP%/mediastream_cache` en Windows).
- Los archivos finales reciben un nombre seguro normalizado basado en el hash del `task_id` para evitar inyecciones en el sistema de archivos (`path traversal`).
- Tarea periódica de limpieza:
  ```python
  # Purga archivos temporales con más de 30 minutos de antigüedad
  MAX_FILE_AGE_SECONDS = 1800
  ```
