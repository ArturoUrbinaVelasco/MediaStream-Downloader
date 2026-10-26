# 01. Alcance y Propuesta de Valor - MediaStream Downloader

## 1. Visión del Producto
**MediaStream Downloader** es una solución full-stack multiplataforma diseñada bajo la filosofía **First-Mobile**, orientada a proporcionar la forma más intuitiva, rápida y confiable de obtener contenido multimedia (video y audio) desde múltiples plataformas web (YouTube, TikTok, Instagram, Twitter/X, Facebook, Twitch, Vimeo, SoundCloud y más de 1,000 fuentes compatibles).

La interfaz de usuario implementa el paradigma de **un solo clic / un solo toque**: pegar un enlace, autodetectar la plataforma y metadatos en milisegundos, seleccionar el formato optimizado (Video HD o Audio HQ) y descargar con retroalimentación visual en tiempo real.

---

## 2. Objetivos del Sistema
1. **Multiplataforma Real (Cross-Platform):**
   - **Web (Desktop & Mobile):** Funcionamiento como Progressive Web App (PWA) instalable.
   - **Android:** Compilación nativa optimizada mediante Capacitor con soporte para depuración y despliegue por ADB.
   - **Windows Desktop:** Operación vía navegador, PWA de escritorio y arquitectura compatible con empaquetadores ligeros.
2. **Experiencia de Usuario (UX/UI) Excepcional:**
   - Detección inmediata de enlaces en portapapeles.
   - Microinteracciones táctiles, animaciones suaves y diseño ergonómico para uso con una sola mano.
   - Selector inteligente con 2 presets universales: **Video MP4 (Mejor resolución disponible hasta 1080p/4K)** y **Audio MP3 (320kbps High Quality)**, con opción de explorador avanzado de resoluciones.
3. **Internacionalización y Temas:**
   - Soporte multilingüe en caliente (**Español** e **Inglés**) con persistencia de preferencia.
   - Modos de visualización: **Claro**, **Oscuro** y **Automático (Sistema)**.
4. **Rendimiento y Telemetría en Tiempo Real:**
   - Barra de progreso reactiva alimentada por Server-Sent Events (SSE) reportando porcentaje exacto, velocidad de transferencia (`MB/s`) y tiempo estimado (ETA).

---

## 3. Historias de Usuario (User Stories)

### HU-01: Extracción Instantánea por Enlace
- **Como** usuario móvil o de escritorio,
- **Quiero** pegar una URL de un video en un campo central o pulsar el botón "Pegar",
- **Para** que la aplicación inspeccione y obtenga automáticamente el título, thumbnail, duración y canal del medio en menos de 2 segundos.

### HU-02: Descarga en Un Solo Toque (Video HD o Audio HQ)
- **Como** usuario que busca simplicidad,
- **Quiero** pulsar un botón claro de "Descargar Video MP4" o "Descargar Audio MP3",
- **Para** obtener el archivo en la mejor calidad sin tener que configurar codecs complicados.

### HU-03: Seguimiento del Progreso en Tiempo Real
- **Como** usuario con conexión de datos o WiFi variable,
- **Quiero** observar una barra de progreso que indique porcentaje, velocidad de descarga y estado (descarga o conversión de audio),
- **Para** saber con certeza cuánto tiempo tomará finalizar la descarga.

### HU-04: Cambio de Idioma y Tema en Caliente
- **Como** usuario bilingüe o con preferencias visuales específicas,
- **Quiero** alternar entre Español e Inglés y entre Tema Claro, Oscuro o Sistema con un toque,
- **Para** personalizar mi entorno sin que se reinicie la aplicación ni se pierda mi estado de descarga actual.

### HU-05: Historial Local de Descargas
- **Como** usuario frecuente,
- **Quiero** consultar una lista de mis descargas recientes almacenada localmente en mi dispositivo,
- **Para** volver a acceder a los enlaces o reproducir/compartir los archivos sin guardar datos en servidores externos.

---

## 4. Alcance del MVP vs. Fases Posteriores

| Característica | En MVP (Fase Actual) | Fase Posterior |
| :--- | :---: | :---: |
| Detección automática de enlaces | ✅ | ✅ |
| Extracción de metadatos (título, autor, miniatura, duración) | ✅ | ✅ |
| Preset Video MP4 (Mejor calidad disponible) | ✅ | ✅ |
| Preset Audio MP3 HQ (Extracción y transcodificación de audio) | ✅ | ✅ |
| Barra de progreso en vivo vía Server-Sent Events (SSE) | ✅ | ✅ |
| Internacionalización (Español / Inglés) con persistencia | ✅ | ✅ |
| Temas (Claro / Oscuro / Sistema) | ✅ | ✅ |
| Historial local en dispositivo (Zustand + LocalStorage) | ✅ | ✅ |
| Soporte Docker (Dockerfile multi-stage y compose) | ✅ | ✅ |
| Compatibilidad Android vía Capacitor + ADB | ✅ | ✅ |
| Descarga de Playlists completas en lote | ⏳ | ✅ |
| Corte de fragmentos de video (trimming en UI) | ⏳ | ✅ |
| Subida directa a servicios en la nube (Drive/Dropbox) | ⏳ | ✅ |
