# Manual de Desarrollo y Guía de Contribución

Este manual está dirigido a desarrolladores, ingenieros de DevOps y modelos de IA que continúen, mantengan o extiendan el código base de **MediaStream Downloader**.

---

## 1. Estructura de Repositorio y Módulos

```text
c:\Source_Code\Descargador/
├── backend/                   # Microservicio API Python (FastAPI + yt-dlp)
│   ├── app/
│   │   ├── api/v1/endpoints/  # Rutas HTTP y controladores REST
│   │   ├── core/              # Configuración (pydantic-settings), logger, CORS
│   │   ├── domain/            # Entidades y esquemas Pydantic
│   │   ├── services/          # Lógica de negocio (yt-dlp wrapper, progress queue, cleanup)
│   │   └── main.py            # Instancia FastAPI y ciclo de vida de la aplicación
│   ├── tests/                 # Tests unitarios con pytest
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                  # Interfaz SPA Mobile-First (Vite + React + Tailwind)
│   ├── src/
│   │   ├── components/        # Componentes atómicos y moleculares
│   │   ├── hooks/             # Lógica reactiva reutilizable
│   │   ├── i18n/              # Configuración y diccionarios es/en
│   │   ├── services/          # Cliente API y adaptadores SSE
│   │   ├── store/             # Stores Zustand con persistencia
│   │   ├── types/             # Interfaces TypeScript
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── capacitor.config.ts    # Configuración de compilación móvil para Android
│   ├── Dockerfile
│   └── package.json
├── docs/                      # Documentación del sistema
├── docker-compose.yml         # Orquestación de contenedores
└── README.md
```

---

## 2. Flujo de Trabajo para Desarrolladores y Agentes de IA

### Regla de Oro: Convención de Commits y Autor
Cualquier commit generado en este repositorio debe respetar:
- Autor: `Arturo Urbina Velasco <arturo.urbina.velasco@gmail.com>`
- Formato: `<tipo>: <descripción en imperativo>`
  - Ejemplos: `feat: add SSE progress event listener`, `fix: sanitize yt-dlp filename output`, `test: add unit test for metadata extractor`.

### Cómo Extender Nuevos Formatos de Descarga
1. **En Backend:**
   - Modificar el enum `FormatPreset` en `backend/app/domain/schemas.py`.
   - Ajustar el selector de opciones de `yt_dlp` en `backend/app/services/downloader.py` para mapear el nuevo preset a las opciones deseadas (`format_sort`, `postprocessors`).
2. **En Frontend:**
   - Añadir la clave de traducción correspondiente en `frontend/src/i18n/locales/es.json` y `en.json`.
   - Añadir la opción en el componente `FormatSelector.tsx`.

---

## 3. Pruebas y Validación Automatizada

### Pruebas de Backend (Pytest)
```powershell
cd backend
pytest -v
```

### Pruebas de Frontend (Vitest / ESLint)
```powershell
cd frontend
npm run lint
npm run test
```

---

## 4. Guía de Depuración (Troubleshooting)

### Depuración de `yt-dlp`
Si una plataforma cambia sus firmas y las descargas fallan:
1. Actualizar `yt-dlp` a la última versión: `pip install --upgrade yt-dlp`.
2. Probar la extracción en terminal con verbose:
   ```powershell
   python -m yt_dlp -v -F "https://enlace-problematico"
   ```

### Depuración de Android con ADB
1. Listar dispositivos: `adb devices`.
2. Inspeccionar logs del runtime:
   ```powershell
   adb logcat *:S MediaStream:V Chromium:D
   ```
3. Reiniciar el servicio ADB si no responde:
   ```powershell
   adb kill-server
   adb start-server
   ```
