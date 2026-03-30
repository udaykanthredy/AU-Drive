import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  viewMode: 'grid' | 'list';
  previewFileId: string | null;
  shareFileId: string | null;
  setViewMode: (mode: 'grid' | 'list') => void;
  setPreviewFile: (fileId: string | null) => void;
  setShareFile: (fileId: string | null) => void;
}

/**
 * Zustand store for persisting UI preferences like Grid/List view.
 * Also handles global UI state like the active file preview modal.
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      previewFileId: null,
      shareFileId: null,

      setViewMode: (viewMode) => set({ viewMode }),
      setPreviewFile: (previewFileId) => set({ previewFileId }),
      setShareFile: (shareFileId) => set({ shareFileId }),
    }),
    {
      name: 'au-drive-ui-prefs',
      /** Only persist the view mode, not the open modals */
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);
