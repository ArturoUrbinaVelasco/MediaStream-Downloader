# 🎬 MediaStream Downloader (Cross-Platform & Multi-Language)

[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean%20Architecture-blue.svg)](docs/02-arquitectura.md)
[![TypeScript](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20Tailwind-indigo.svg)](frontend/)
[![Python](https://img.shields.io/badge/Backend-FastAPI%20%7C%20yt--dlp-green.svg)](backend/)
[![Mobile](https://img.shields.io/badge/Mobile-Android%20%7C%20Capacitor%20%7C%20ADB-orange.svg)](scripts/adb_deploy.ps1)
[![Docker](https://img.shields.io/badge/DevOps-Docker%20Compose-2496ED.svg)](docker-compose.yml)

> Aplicación full-stack **First-Mobile**, altamente responsiva, multilenguaje (**Español / Inglés**) con cambio en caliente, soporte de temas (**Dark / Light / System**) y experiencia de **un solo clic** para descargar video o audio en la mejor calidad posible con barra de progreso reactiva en tiempo real (Server-Sent Events).

---

## 🚀 Características Principales

- **Filosofía First-Mobile & Cross-Platform:** Diseñada ergonómicamente para teléfonos móviles, tabletas y escritorio. Compilable para **Web / PWA**, **Android nativo** (mediante Capacitor) y **Windows**.
- **Flujo de 1-Clic / 1-Toque:** Pegar enlace -> Detección automática de plataforma y metadatos -> Descarga inmediata en **Video MP4 HD** o **Audio MP3 HQ (320kbps)**.
- **Telemetría en Vivo vía SSE:** Barra de progreso con porcentaje, velocidad de descarga (`MB/s`) y tiempo estimado (`ETA`).
- **Internacionalización Dinámica (i18n):** Soporte en caliente para **Español** e **Inglés** con persistencia en el dispositivo.
- **Modos de Tema:** Claro, Oscuro y Automático sincronizado con el sistema operativo.
- **Historial Local Privado:** Historial de descargas almacenado 100% en el dispositivo del usuario (*Zero-Data Retention* en el servidor).
- **Despliegue Docker-First:** Multi-stage Dockerfiles y `docker-compose.yml` listos para producción.
- **Automatización ADB:** Scripts PowerShell integrados para verificación de dispositivos, compilación e instalación por ADB en Android.

---

## 📁 Estructura del Repositorio

```text
c:\Source_Code\Descargador/
├── backend/                     # API FastAPI + Motor yt-dlp + SSE
│   ├── app/
│   │   ├── api/v1/endpoints/    # Endpoints REST (extract, download, progress, file)
│   │   ├── core/                # Configuración, CORS, variables de entorno
│   │   ├── domain/              # Modelos de dominio y DTOs Pydantic
│   │   ├── services/            # yt-dlp extractor, downloader, progress queue, cleanup
│   │   └── main.py              # Entrada FastAPI y ciclo de vida
│   ├── tests/                   # Suite de pruebas Pytest
│   ├── Dockerfile               # Multi-stage Dockerfile con FFmpeg
│   └── requirements.txt
├── frontend/                    # SPA React 19 + TypeScript + Vite + Tailwind
│   ├── android/                 # Proyecto Android nativo (Capacitor)
│   ├── src/
│   │   ├── components/          # Header, UrlInput, MediaCard, ProgressBar, HistoryDrawer
│   │   ├── i18n/                # Diccionarios de traducción (ES / EN)
│   │   ├── services/            # Cliente API y adaptadores SSE
│   │   ├── store/               # Stores Zustand (settings, history)
│   │   └── App.tsx
│   ├── capacitor.config.ts      # Configuración de compilación móvil
│   ├── Dockerfile               # Multi-stage Dockerfile con Nginx
│   └── package.json
├── docs/                        # Documentación técnica obligatoria
│   ├── 01-alcance-y-propuesta.md
│   ├── 02-arquitectura.md
│   ├── 03-base-de-datos.md
│   ├── 04-principios-de-programacion.md
│   ├── 05-instalacion-y-desarrollo.md
│   ├── 06-estatus-y-pendientes.md
│   ├── manual-de-usuario.md
│   └── manual-de-desarrollo.md
├── scripts/
│   └── adb_deploy.ps1           # Automatización de despliegue en Android por ADB
├── start_local.ps1              # Lanzador rápido en local para Windows
├── docker-compose.yml           # Orquestación de contenedores
└── README.md
```

---

## ⚡ Inicio Rápido (Local en Windows)

### Opción 1: Lanzador de un solo clic (PowerShell)
```powershell
.\start_local.ps1
```
Abre automáticamente:
- **Frontend UI:** `http://localhost:5173`
- **Backend API:** `http://127.0.0.1:8000`
- **Swagger Docs:** `http://127.0.0.1:8000/docs`

### Opción 2: Docker Compose (Docker-First)
```powershell
docker compose up --build
```
- Frontend accesible en `http://localhost:3000`
- Backend API accesible en `http://localhost:8000/api/v1`

### Opción 3: Despliegue en Android vía ADB
```powershell
.\scripts\adb_deploy.ps1
```

---

## 🧪 Pruebas Automatizadas

### Backend (Pytest)
```powershell
cd backend
.\venv\Scripts\pytest -v
```

### Frontend (Build & Lint)
```powershell
cd frontend
npm run build
```

---

## 📖 Documentación Completa en `/docs`
Para detalles arquitectónicos, diseño de base de datos o guías de desarrollo, consulta:
- [01. Alcance y Propuesta de Valor](docs/01-alcance-y-propuesta.md)
- [02. Arquitectura del Sistema](docs/02-arquitectura.md)
- [03. Modelo de Datos y Almacenamiento](docs/03-base-de-datos.md)
- [04. Principios de Programación y Estándares](docs/04-principios-de-programacion.md)
- [05. Guía de Instalación y Desarrollo](docs/05-instalacion-y-desarrollo.md)
- [06. Estatus y Backlog de Pendientes](docs/06-estatus-y-pendientes.md)
- [Manual de Usuario](docs/manual-de-usuario.md)
- [Manual de Desarrollo](docs/manual-de-desarrollo.md)

---

## 👤 Autor
**Arturo Urbina Velasco**  
Email: [arturo.urbina.velasco@gmail.com](mailto:arturo.urbina.velasco@gmail.com)
