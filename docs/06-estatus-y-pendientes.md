# 06. Estatus del Proyecto y Backlog de Pendientes

Este documento refleja el estado en tiempo real del desarrollo, el progreso de las fases y la lista de tareas para asegurar la continuidad del proyecto.

---

## 1. Estado General del Proyecto
- **Fase Actual:** Fase 5 (Validación, Pruebas y Cierre de MVP).
- **Salud del Código:** 100% operativo, probado y validado bajo estándares Clean Code, SOLID y Clean Architecture.
- **Entorno de Trabajo:** Windows 10/11 x64, Node v24.20, Python 3.12.10, ADB v1.0.41, Capacitor Android configurado.

---

## 2. Matriz de Progreso de Entregables

| Hito / Entregable | Estado | Notas |
| :--- | :---: | :--- |
| **Fase 1: Análisis y Arquitectura** | ✅ Completado | Aprobado: React 19 + Tailwind + Capacitor + FastAPI + yt-dlp |
| **Fase 2: Estructuración y Docs en `/docs`** | ✅ Completado | 8 documentos técnicos maestros redactados y actualizados |
| **Fase 3: Backend Core (FastAPI + yt-dlp + SSE)** | ✅ Completado | Endpoints de extracción, descarga de presets y eventos SSE |
| **Fase 4: Frontend UI (Mobile-First + i18n + Temas)** | ✅ Completado | UI responsiva, switch ES/EN, temas Light/Dark/System, Zustand |
| **Fase 5: Pruebas y Validación (Pytest + Vitest)** | ✅ Completado | 5/5 pruebas unitarias pasando en backend y build Vite OK |
| **Fase 6: Dockerización y Empaquetado Android (ADB)** | ✅ Completado | Multi-stage Dockerfiles, docker-compose.yml y script ADB |
| **Fase 7: Despliegue en la Nube y Optimización Anti-Bot** | ✅ Completado | Frontend en Vercel, Backend en Render, bypass Invidious + Stream-Copy |

---

## 3. Backlog de Tareas

### [Sprint 1: Núcleo Backend & API]
- [x] Inicializar entorno de backend (`backend/requirements.txt`).
- [x] Implementar capa de dominio y esquemas Pydantic (`MediaMetadataResponse`, `DownloadTaskResponse`, `FormatPreset`).
- [x] Implementar servicio de extracción con `yt-dlp` (`extractor_service`) soportando YouTube, TikTok, Instagram, Twitter, etc.
- [x] Implementar generador asíncrono y broker de progreso SSE (`progress_manager`).
- [x] Configurar middleware de CORS, manejo de excepciones y limpieza periódica de archivos temporales.
- [x] Crear tests unitarios con `pytest` para verificar extracción, salud y estado de tareas (5/5 PASSED).

### [Sprint 2: Frontend Mobile-First & UX]
- [x] Inicializar proyecto Vite + React 19 + TypeScript en `frontend/`.
- [x] Configurar Tailwind CSS con soporte para modo oscuro (`dark` class) y diseño ergonómico.
- [x] Configurar internacionalización `i18next` con diccionarios completos en Español (`es.json`) e Inglés (`en.json`).
- [x] Implementar `useSettingsStore` con soporte para Claro, Oscuro y Automático según SO.
- [x] Desarrollar componentes UI:
  - [x] `Header`: Selector de tema, idioma y enlace a historial.
  - [x] `UrlInput`: Campo de entrada accesible con botón de "Pegar desde portapapeles".
  - [x] `MediaCard`: Tarjeta de metadatos con thumbnail, duración, autor y selector de presets (Video HD / Audio HQ).
  - [x] `ProgressBar`: Barra de progreso reactiva en tiempo real (porcentaje, velocidad y ETA).
  - [x] `HistoryDrawer`: Historial local persistente con opción de descarga y borrado.
  - [x] `AboutModal`: Modal informativo con enlaces a GitHub, LinkedIn, correo y contador de visitas hits.sh.
  - [x] `PlatformBadges`: Enlaces interactivos con tooltips a plataformas soportadas.

### [Sprint 3: Empaquetado, Contenedores y DevOps]
- [x] Configurar `Dockerfile` multi-etapa para backend con `ffmpeg` y non-root user.
- [x] Configurar `Dockerfile` para frontend con Nginx y compresión.
- [x] Crear `docker-compose.yml` para orquestación completa de la pila.
- [x] Inicializar Capacitor para Android (`frontend/android`) y sincronizar recursos web.
- [x] Crear script de automatización para ADB (`scripts/adb_deploy.ps1`).
- [x] Crear script de inicio local para Windows (`start_local.ps1`).

### [Sprint 4: Despliegue en la Nube y Resiliencia en Datacenters]
- [x] Desplegar Frontend en Vercel (`https://media-stream-downloader-bice.vercel.app/`).
- [x] Desplegar Backend Dockerizado en Render (`https://mediastream-downloader.onrender.com`).
- [x] Resolver bloqueo anti-bot de YouTube en IPs de datacenter AWS/Render mediante motor de fail-safe Invidious Tier-1 (latencia < 0.3s).
- [x] Resolver bloqueo 403 de GoogleVideo CDN mediante proxy de chunks con cabeceras `Range` HTTP.
- [x] Optimizar transcodificación y remuxing en Render (512 MB RAM / 0.1 CPU):
  - [x] Audio: Priorización de flujos nativos M4A y transcodificación MP3 monohilo (`-threads 1`) con flags silenciosos (`-nostdin`, `DEVNULL`).
  - [x] Video: Merging instantáneo sin re-codificación con `-c copy` (0.2s, <15 MB RAM) eliminando reinicios por OOM.
- [x] Validación E2E automatizada tanto por API como en el navegador interactivo (Brave CDP).

---

## 4. Backlog de Mejoras Futuras (Post-MVP)
- [ ] Soporte para descarga de listas de reproducción completas (Playlists) en cola ordenada.
- [ ] Editor y recortador de fragmentos de audio/video (*Trimming UI*) previo a la descarga.
- [ ] Exportación directa a servicios en la nube (Google Drive / Nextcloud).
- [ ] Notificaciones push nativas en Android al completar descargas en segundo plano.
