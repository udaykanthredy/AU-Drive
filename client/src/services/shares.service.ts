import apiClient from '@/lib/apiClient';

export interface Share {
  _id: string;
  resourceId: string;
  resourceType: 'file' | 'folder';
  permission: 'viewer' | 'editor';
  linkToken: string;
  expiresAt: string | null;
  createdBy: string;
  isRevoked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SharedResourceResponse {
  file?: any; // The file metadata with presignedUrl
  folder?: any;
  share: {
    permission: string;
    expiresAt: string | null;
  };
}

export const sharesApi = {
  createShare: async (resourceId: string, resourceType: 'file' | 'folder' = 'file', expiresInDays: number | null = null) => {
    const response = await apiClient.post<Share>('/shares', { resourceId, resourceType, expiresInDays });
    return response.data;
  },

  getShare: async (token: string) => {
    const response = await apiClient.get<SharedResourceResponse>(`/shares/${token}`);
    return response.data;
  },

  revokeShare: async (shareId: string) => {
    await apiClient.delete(`/shares/${shareId}`);
  },
};
