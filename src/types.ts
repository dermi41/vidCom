export interface VideoEntry {
  url: string;
  id: string;
  title?: string;
  thumbnail?: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'processing' | 'done' | 'error';
  message?: string;
}