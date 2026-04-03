import apiClient from '@/lib/apiClient';

export const foldersApi = {
  createFolder: (data: { name: string; parentFolderId?: string }) => 
    apiClient.post('/folders', data),

  getFolders: (parentFolderId?: string) => 
    apiClient.get('/folders', { params: { parentFolderId } }),

  updateFolder: (id: string, name: string) => 
    apiClient.patch(`/folders/${id}`, { name }),

  starFolder: (id: string, isStarred: boolean) =>
    apiClient.patch(`/folders/${id}/star`, { isStarred }),

  deleteFolder: (id: string) => 
    apiClient.delete(`/folders/${id}`),
};
