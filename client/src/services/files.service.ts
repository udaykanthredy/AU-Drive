import apiClient from '@/lib/apiClient';

export const filesApi = {
  /** Step 1 of upload: get presigned URL from backend */
  getUploadUrl: (data: { originalName: string; mimeType: string }) =>
    apiClient.post('/files/upload-url', data),

  /** Step 2 of upload: save metadata after R2 upload succeeds */
  saveMetadata: (data: {
    r2Key: string;
    name: string;
    size: number;
    mimeType: string;
    folderId?: string | null;
  }) => apiClient.post('/files/metadata', data),

  /** Upload file directly to R2 using presigned URL */
  uploadToR2: (presignedUrl: string, file: File) =>
    fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    }),

  getFiles: (params?: { folderId?: string | null; isStarred?: boolean; isDeleted?: boolean }) =>
    apiClient.get('/files', { params }),

  getFile: (id: string) => apiClient.get(`/files/${id}`),

  updateFile: (id: string, data: Partial<{ name: string; folderId: string; isStarred: boolean }>) =>
    apiClient.patch(`/files/${id}`, data),
    
  deleteFile: (id: string) => apiClient.delete(`/files/${id}`),
};
