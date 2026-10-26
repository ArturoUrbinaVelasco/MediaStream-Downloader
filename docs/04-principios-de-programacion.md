# 04. Principios de Programación y Estándares de Ingeniería

Este documento establece las reglas obligatorias de diseño, código limpio y calidad que rigen el desarrollo de **MediaStream Downloader**.

---

## 1. Clean Code y Filosofía de Uncle Bob (Robert C. Martin)

1. **La Regla del Boy Scout:**
   * *"Deja el código más limpio de como lo encontraste."* Cada cambio o intervención técnica debe mejorar la legibilidad y estructura de los módulos tocados.
2. **Nombres con Significado e Intención Reveladora:**
   * Prohibido el uso de nombres genéricos como `data`, `info`, `manager`, `temp`, `res`.
   * En su lugar, usar nombres precisos: `extractMetadataFromUrl`, `mediaStreamDispatcher`, `activeDownloadTask`.
3. **Funciones Pequeñas y con un Solo Nivel de Abstracción:**
   * Longitud recomendada: menores a 20 líneas.
   * Una función hace una sola cosa y la hace bien (Single Responsibility).
   * **Cero parámetros booleanos de bandera:** En lugar de `downloadMedia(url, isAudio = true)`, separar en `downloadVideo(url)` y `downloadAudio(url)`.
4. **Command-Query Separation (CQS):**
   * Un método ejecuta una acción (comando) o devuelve información (consulta), nunca ambas a la vez.
5. **Cero Código Muerto:**
   * Prohibido subir al repositorio bloques de código comentados o importaciones no utilizadas.

---

## 2. Principios SOLID Aplicados

- **S (Single Responsibility Principle):**
  - Cada servicio en el backend (`YtDlpExtractorService`, `FfmpegConverterService`, `TaskManager`) tiene una única razón para cambiar.
  - En el frontend, los componentes visuales (`UrlInputBar`, `FormatCard`, `ProgressBar`) no contienen lógica de red ni orquestación de sockets.
- **O (Open/Closed Principle):**
  - El sistema de formatos y presets está abierto a extensión (nuevos formatos como WEBM, WAV, FLAC) sin modificar el núcleo de procesamiento.
- **L (Liskov Substitution Principle):**
  - Cualquier adaptador de almacenamiento (LocalDisk, S3, MemoryBuffer) puede sustituir a la interfaz base sin alterar la lógica de entrega de archivos.
- **I (Interface Segregation Principle):**
  - Interfaces pequeñas y desacopladas en TypeScript y Protocolos en Python en lugar de interfaces monolíticas.
- **D (Dependency Inversion Principle):**
  - Los controladores dependen de abstracciones (interfaces de servicios de extracción), no de implementaciones concretas de librerías.

---

## 3. Principios de Arquitectura Ágil: KISS, YAGNI y DRY vs. AHA

- **KISS (Keep It Simple, Stupid):** Priorizar la solución más simple y mantenible hoy. No agregar microservicios o colas complejas de mensajería (Kafka/RabbitMQ) para un problema que se resuelve elegantemente con colas asíncronas de FastAPI y Server-Sent Events.
- **YAGNI (You Aren't Gonna Need It):** No implementar funcionalidades especulativas para futuros hipotéticos.
- **AHA (Avoid Hasty Abstractions) sobre DRY prematuro:** Se tolera duplicación cosmética hasta identificar 3 ocurrencias estructurales genuinas de dominio (Regla del Tres).

---

## 4. Estrategia de Manejo de Errores
- Prohibido devolver o propagar `null` o `None` silenciosos.
- En TypeScript: Uso de tipos unión discriminados (`type Result<T, E> = { success: true; data: T } | { success: false; error: E }`).
- En Python: Excepciones de dominio tipadas (`MediaExtractionError`, `UnsupportedPlatformError`, `DownloadTimeoutError`) que se traducen en `HTTPException` coherentes en el middleware global.

---

## 5. Pruebas Automatizadas (F.I.R.S.T.)
Todas las pruebas del proyecto deben cumplir:
- **Fast:** Ejecución rápida para integrarse en git hooks o CI en segundos.
- **Independent:** Ningún test depende del resultado o estado de otro.
- **Repeatable:** Mismo resultado en cualquier entorno (Windows, Docker, Linux).
- **Self-validating:** Resultado binario claro (Pass/Fail) sin interpretación manual.
- **Timely:** Desarrolladas en paralelo o antes de la lógica de negocio.

---

## 6. Control de Versiones y Convenciones de Commits
- **Autor / Committer:** `arturo.urbina.velasco@gmail.com`.
- **Estándar:** Conventional Commits obligatorio:
  - `feat: <descripción>` — Nueva característica para el usuario o sistema.
  - `fix: <descripción>` — Corrección de fallo o bug.
  - `refactor: <descripción>` — Refactorización sin alterar el comportamiento observable.
  - `test: <descripción>` — Creación o actualización de pruebas.
  - `chore: <descripción>` — Cambios en build, dependencias o herramientas.
  - `docs: <descripción>` — Cambios exclusivamente en documentación.
