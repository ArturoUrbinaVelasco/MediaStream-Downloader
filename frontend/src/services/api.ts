import type { FormatPreset, MediaMetadata, ProgressEventPayload } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export interface HealthCheckResult {
  status: string;
  version: string;
  ffmpeg_available: boolean;
}

export const checkHealth = async (): Promise<HealthCheckResult> => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
};

export const extractMetadata = async (url: string): Promise<MediaMetadata> => {
  const response = await fetch(`${API_BASE_URL}/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(errorData.detail || 'Failed to inspect media link');
  }

  return response.json();
};

export const startDownload = async (
  url: string,
  preset: FormatPreset,
  customFormatId?: string
): Promise<{ task_id: string; status: string; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      preset,
      custom_format_id: customFormatId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to initiate download' }));
    throw new Error(errorData.detail || 'Download request rejected');
  }

  return response.json();
};

export const getFileDownloadUrl = (taskId: string, filename?: string): string => {
  const params = filename ? `?filename=${encodeURIComponent(filename)}` : '';
  return `${API_BASE_URL}/file/${taskId}${params}`;
};

export const subscribeToTaskProgress = (
  taskId: string,
  onEvent: (event: ProgressEventPayload) => void,
  onError: (err: any) => void
): (() => void) => {
  const eventSource = new EventSource(`${API_BASE_URL}/progress/${taskId}`);

  const handleMessage = (e: MessageEvent) => {
    try {
      const data: ProgressEventPayload = JSON.parse(e.data);
      onEvent(data);
      if (data.status === 'finished' || data.status === 'error') {
        eventSource.close();
      }
    } catch (err) {
      onError(err);
    }
  };

  eventSource.addEventListener('progress', handleMessage);
  eventSource.addEventListener('finished', handleMessage);
  eventSource.addEventListener('error', (e) => {
    try {
      if ((e as MessageEvent).data) {
        const data = JSON.parse((e as MessageEvent).data);
        onEvent(data);
      }
    } catch {
      // Connection closed
    }
    eventSource.close();
  });

  return () => {
    eventSource.close();
  };
};
