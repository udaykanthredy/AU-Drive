// TODO Phase 1: Implement files API calls

import apiClient from '@/lib/apiClient';

export const filesApi = {
  /** Step 1 of upload: get presigned URL from backend */
  getUploadUrl: (data: { name: string; mimeType: string; size: number; folderId?: string }) =>
    apiClient.post('/files/upload-url', data),

  /** Step 2 of upload: save metadata after R2 upload succeeds */
  saveMetadata: (data: {
    r2Key: string;
    name: string;
    size: number;
    mimeType: string;
    folderId?: string;
  }) => apiClient.post('/files/metadata', data),

  /** Upload file directly to R2 using presigned URL */
  uploadToR2: (presignedUrl: string, file: File, onProgress?: (pct: number) => void) =>
    fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    }),

  getFile: (id: string) => apiClient.get(`/files/${id}`),
  updateFile: (id: string, data: Partial<{ name: string; folderId: string; isStarred: boolean }>) =>
    apiClient.patch(`/files/${id}`, data),
  deleteFile: (id: string) => apiClient.delete(`/files/${id}`),
  permanentDelete: (id: string) => apiClient.delete(`/files/${id}/permanent`),
  restoreFile: (id: string) => apiClient.post(`/files/${id}/restore`),
  getRecent: () => apiClient.get('/files/recent'),
  getStarred: () => apiClient.get('/files/starred'),
  getTrash: () => apiClient.get('/files/trash'),
};
