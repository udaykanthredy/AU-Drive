import { create } from 'zustand';

interface SelectionState {
  selectedFileIds: string[];
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedFileIds: [],
  toggleSelection: (id) => set((state) => ({
    selectedFileIds: state.selectedFileIds.includes(id)
      ? state.selectedFileIds.filter((fileId) => fileId !== id)
      : [...state.selectedFileIds, id]
  })),
  selectAll: (ids) => set({ selectedFileIds: ids }),
  clearSelection: () => set({ selectedFileIds: [] }),
}));
