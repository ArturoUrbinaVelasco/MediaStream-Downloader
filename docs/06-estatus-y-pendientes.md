# 06. Estatus del Proyecto y Backlog de Pendientes

Este documento refleja el estado en tiempo real del desarrollo, el progreso de las fases y la lista de tareas pendientes para asegurar la continuidad del proyecto.

---

## 1. Estado General del Proyecto
- **Fase Actual:** Fase 2 (Estructuración y Documentación) completándose hacia Fase 3 (Desarrollo del Core).
- **Salud del Código:** En proceso de construcción con estándares Clean Code, SOLID y Clean Architecture.
- **Entorno de Trabajo:** Windows 10/11 x64, Node v24.20, Python 3.12.10, ADB v1.0.41 disponible.

---

## 2. Matriz de Progreso de Entregables

| Hito / Entregable | Estado | Notas |
| :--- | :---: | :--- |
| **Fase 1: Análisis y Arquitectura** | ✅ Completado | Aprobado: React 19 + Tailwind + Capacitor + FastAPI + yt-dlp |
| **Fase 2: Estructuración y Docs en `/docs`** | 🟡 En Proceso | Creando los 8 documentos técnicos maestros |
| **Fase 3: Backend Core (FastAPI + yt-dlp + SSE)** | ⏳ Pendiente | Endpoints de extracción, descarga de presets y eventos SSE |
| **Fase 4: Frontend UI (Mobile-First + i18n + Temas)** | ⏳ Pendiente | UI ultra-intuitiva, switch ES/EN, temas Light/Dark/System |
| **Fase 5: Pruebas y Validación (Pytest + Vitest)** | ⏳ Pendiente | Suites de pruebas unitarias y de integración |
| **Fase 6: Dockerización y Empaquetado Android (ADB)** | ⏳ Pendiente | Dockerfiles, compose, Capacitor config y scripts de automatización |

---

## 3. Backlog de Tareas Detallado

### [Sprint 1: Núcleo Backend & API]
- [ ] Inicializar entorno de backend (`backend/requirements.txt`).
- [ ] Implementar capa de dominio y esquemas Pydantic (`MediaInfo`, `DownloadTask`, `FormatPreset`).
- [ ] Implementar servicio de extracción con `yt-dlp` (`YtDlpService`) soportando YouTube, TikTok, Instagram, Twitter, etc.
- [ ] Implementar generador asíncrono y cola de progreso SSE (`ProgressService`).
- [ ] Configurar middleware de CORS, manejo global de excepciones y limpieza periódica de caché.
- [ ] Crear tests unitarios con `pytest` para verificar extracción y sanitización de URLs.

### [Sprint 2: Frontend Mobile-First & UX]
- [ ] Inicializar proyecto Vite + React 19 + TypeScript en `frontend/`.
- [ ] Configurar Tailwind CSS con soporte para modo oscuro (`class`) y paleta ergonómica.
- [ ] Configurar internacionalización `i18next` con diccionarios completos en Español (`es.json`) e Inglés (`en.json`).
- [ ] Implementar `useTheme` con soporte para Claro, Oscuro y Automático según SO.
- [ ] Desarrollar componentes UI:
  - `Header`: Selector de tema, idioma y enlace a historial.
  - `UrlInput`: Campo de entrada de alta accesibilidad con botón inteligente de "Pegar desde portapapeles".
  - `MediaPreviewCard`: Tarjeta de metadatos con thumbnail, título, duración y selector de presets (Video HD / Audio HQ).
  - `DownloadProgress`: Barra de progreso reactiva en tiempo real (porcentaje, velocidad y ETA).
  - `HistoryDrawer`: Historial local persistente con opción de descarga y borrado.

### [Sprint 3: Empaquetado y DevOps]
- [ ] Configurar `Dockerfile` multi-etapa para backend con `ffmpeg`.
- [ ] Configurar `Dockerfile` para frontend con Nginx.
- [ ] Crear `docker-compose.yml` para orquestación completa.
- [ ] Inicializar Capacitor para Android (`capacitor.config.ts`).
- [ ] Verificar scripts de instalación y automatización con ADB.
