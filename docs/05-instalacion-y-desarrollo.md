# 05. Guía de Instalación y Desarrollo Local

Esta guía describe los pasos necesarios para clonar, configurar y ejecutar **MediaStream Downloader** en entornos de desarrollo local (Windows 10/11, Linux, macOS), así como en emuladores o dispositivos físicos Android mediante **ADB** y mediante **Docker**.

---

## 1. Requisitos Previos del Sistema

- **Python:** Versión 3.11 o 3.12 (verificar con `python --version`).
- **Node.js:** Versión 20.x o superior (verificar con `node --version`).
- **NPM:** Versión 10.x o superior (verificar con `npm --version`).
- **Git:** Instalado y configurado.
- **Android SDK / ADB:** (Opcional para pruebas móviles) Herramienta `adb` configurada en el `PATH` del sistema.
- **FFmpeg:** Recomendado tenerlo instalado o empaquetado en el contenedor (o binario en `PATH`).
- **Docker & Docker Compose:** (Opcional para despliegue aislado de un solo paso).

---

## 2. Configuración y Ejecución del Backend (FastAPI + yt-dlp)

### Paso 2.1: Navegar a la carpeta y crear el entorno virtual
```powershell
cd c:\Source_Code\Descargador\backend
python -m venv venv

# En Windows PowerShell:
.\venv\Scripts\Activate.ps1
# En Linux/macOS:
# source venv/bin/activate
```

### Paso 2.2: Instalar dependencias
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### Paso 2.3: Configurar variables de entorno (`.env`)
Crear un archivo `.env` en la raíz de `backend/` basado en `.env.example`:
```ini
HOST=127.0.0.1
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000", "capacitor://localhost", "http://localhost"]
TEMP_DOWNLOAD_DIR=./temp_downloads
MAX_CONCURRENT_DOWNLOADS=5
FILE_TTL_SECONDS=1800
```

### Paso 2.4: Iniciar el servidor backend en modo desarrollo
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
La documentación interactiva OpenAPI estará disponible en:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## 3. Configuración y Ejecución del Frontend (React + Vite + Tailwind)

### Paso 3.1: Navegar a la carpeta e instalar dependencias
```powershell
cd c:\Source_Code\Descargador\frontend
npm install
```

### Paso 3.2: Configurar variables de entorno del cliente (`.env`)
Crear un archivo `.env` en `frontend/`:
```ini
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### Paso 3.3: Iniciar el servidor de desarrollo
```powershell
npm run dev
```
La aplicación web se ejecutará en: `http://localhost:5173`

---

## 4. Despliegue y Pruebas en Android mediante ADB

Para compilar y probar la aplicación en un dispositivo Android o emulador conectado vía USB/WiFi:

### Paso 4.1: Construir el bundle web
```powershell
cd c:\Source_Code\Descargador\frontend
npm run build
```

### Paso 4.2: Sincronizar con el proyecto Android de Capacitor
```powershell
npx cap sync android
```

### Paso 4.3: Compilar APK y desplegar vía ADB
```powershell
# Verificar dispositivo conectado
adb devices

# Compilar e instalar APK directamente
cd android
.\gradlew assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk

# Lanzar la aplicación en el dispositivo
adb shell am start -n com.mediastream.downloader/.MainActivity

# Monitorear logs en tiempo real para diagnóstico
adb logcat -s MediaStreamApp:V
```

---

## 5. Ejecución con Docker Compose (Docker-First)

Para ejecutar toda la pila (Backend + Frontend + Nginx) en contenedores aislados:

```powershell
cd c:\Source_Code\Descargador
docker compose up --build -d
```
- Frontend accesible en: `http://localhost:3000`
- Backend API en: `http://localhost:8000/api/v1`
