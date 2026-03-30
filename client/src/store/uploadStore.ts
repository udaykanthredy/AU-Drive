import { create } from 'zustand';

export interface UploadItem {
  id: string; // Internal temporary ID
  file: File;
  progress: number; // 0 to 100
  status: 'pending' | 'uploading' | 'saving_metadata' | 'success' | 'error';
  error?: string;
}

interface UploadState {
  uploads: Record<string, UploadItem>;
  isPanelOpen: boolean;
  addUpload: (id: string, file: File) => void;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: UploadItem['status'], error?: string) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
  togglePanel: (isOpen?: boolean) => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  uploads: {},
  isPanelOpen: false,

  addUpload: (id, file) =>
    set((state) => ({
      uploads: {
        ...state.uploads,
        [id]: { id, file, progress: 0, status: 'pending' },
      },
      isPanelOpen: true, // Auto-open panel on new upload
    })),

  updateProgress: (id, progress) =>
    set((state) => {
      const upload = state.uploads[id];
      if (!upload) return state;
      return {
        uploads: {
          ...state.uploads,
          [id]: { ...upload, progress },
        },
      };
    }),

  updateStatus: (id, status, error) =>
    set((state) => {
      const upload = state.uploads[id];
      if (!upload) return state;
      return {
        uploads: {
          ...state.uploads,
          [id]: { ...upload, status, error },
        },
      };
    }),

  removeUpload: (id) =>
    set((state) => {
      const newUploads = { ...state.uploads };
      delete newUploads[id];
      return { uploads: newUploads };
    }),

  clearCompleted: () =>
    set((state) => {
      const activeUploads = Object.fromEntries(
        Object.entries(state.uploads).filter(
          ([_, upload]) => upload.status !== 'success'
        )
      );
      return { uploads: activeUploads };
    }),

  togglePanel: (isOpen) =>
    set((state) => ({
      isPanelOpen: isOpen !== undefined ? isOpen : !state.isPanelOpen,
    })),
}));
