import asyncio
import json
from pathlib import Path
from typing import AsyncGenerator, Dict, Optional
from app.domain.schemas import ProgressEvent

class ProgressManager:
    """
    Manages in-memory SSE event streams and state for background download tasks.
    Adheres to SRP: only handles progress subscriptions and event broadcasting.
    """
    def __init__(self):
        self._queues: Dict[str, asyncio.Queue] = {}
        self._task_files: Dict[str, Path] = {}
        self._task_statuses: Dict[str, str] = {}
        self._task_errors: Dict[str, str] = {}

    def register_task(self, task_id: str) -> None:
        self._queues[task_id] = asyncio.Queue()
        self._task_statuses[task_id] = "starting"

    async def emit_progress(self, task_id: str, event: ProgressEvent) -> None:
        self._task_statuses[task_id] = event.status
        if task_id in self._queues:
            await self._queues[task_id].put(event)

    def set_task_file(self, task_id: str, file_path: Path) -> None:
        self._task_files[task_id] = file_path
        self._task_statuses[task_id] = "finished"

    def get_task_file(self, task_id: str) -> Optional[Path]:
        return self._task_files.get(task_id)

    def get_task_status(self, task_id: str) -> str:
        return self._task_statuses.get(task_id, "unknown")

    async def subscribe(self, task_id: str) -> AsyncGenerator[dict, None]:
        """
        Yields Server-Sent Events formatted dictionaries until the task completes or fails.
        """
        if task_id not in self._queues:
            # Yield immediate error if task was not registered
            yield {
                "event": "error",
                "data": json.dumps({"task_id": task_id, "status": "error", "error": "Task not found"})
            }
            return

        queue = self._queues[task_id]
        try:
            while True:
                # Wait up to 30s between events to avoid hanging indefinitely
                try:
                    event: ProgressEvent = await asyncio.wait_for(queue.get(), timeout=30.0)
                except asyncio.TimeoutError:
                    # Send keep-alive ping
                    yield {
                        "event": "ping",
                        "data": json.dumps({"task_id": task_id, "status": "waiting"})
                    }
                    continue

                yield {
                    "event": "progress" if event.status not in ("finished", "error") else event.status,
                    "data": json.dumps(event.model_dump())
                }

                if event.status in ("finished", "error"):
                    break
        finally:
            # Clean up queue when client disconnects or completes
            self._queues.pop(task_id, None)

progress_manager = ProgressManager()
