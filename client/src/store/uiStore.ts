import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  viewMode: 'grid' | 'list';
  previewFileId: string | null;
  shareFileId: string | null;
  isChatOpen: boolean;
  setViewMode: (mode: 'grid' | 'list') => void;
  setPreviewFile: (fileId: string | null) => void;
  setShareFile: (fileId: string | null) => void;
  setIsChatOpen: (isOpen: boolean) => void;
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
      isChatOpen: false,

      setViewMode: (viewMode) => set({ viewMode }),
      setPreviewFile: (previewFileId) => set({ previewFileId }),
      setShareFile: (shareFileId) => set({ shareFileId }),
      setIsChatOpen: (isChatOpen) => set({ isChatOpen }),
    }),
    {
      name: 'echodrive-ui-prefs',
      /** Only persist the view mode, not the open modals */
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);
