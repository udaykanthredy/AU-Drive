export interface User {
  id: string;
  name: string;
  email: string;
  storageUsed: number;
  storageQuota: number;
}

export interface Folder {
  _id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  isStarred: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface File {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  folderId: string | null;
  ownerId: string;
  r2Key: string;
  isStarred: boolean;
  isInTrash: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  processingStatus: 'pending' | 'processing' | 'done' | 'error';
  extractedText?: string;
  summary?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
