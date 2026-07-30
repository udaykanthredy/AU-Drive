'use client';

import { useSelectionStore } from '@/store/selectionStore';
import { Download, Trash2, FolderOutput, X } from 'lucide-react';
import { filesApi } from '@/services/files.service';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';

export function BulkActionBar() {
  const { selectedFileIds, clearSelection } = useSelectionStore();
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (selectedFileIds.length === 0) return null;

  const handleBulkDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await filesApi.bulkDownload(selectedFileIds);
      // Create a temporary link to download the zip blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'AU-Drive-Export.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Downloaded ${selectedFileIds.length} files`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to download files');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await filesApi.bulkDelete(selectedFileIds);
      toast.success(`Moved ${selectedFileIds.length} files to trash`);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      clearSelection();
    } catch (error) {
      toast.error('Failed to delete files');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 fade-in">
      <div className="bg-neo-bg border-4 border-black shadow-neo px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 flex items-center justify-center bg-brand-500 border-2 border-black font-black text-black">
            {selectedFileIds.length}
          </span>
          <span className="font-bold text-black uppercase tracking-wider text-sm">
            Files Selected
          </span>
        </div>

        <div className="w-[2px] h-8 bg-black opacity-20"></div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBulkDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neo-yellow border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold text-black uppercase text-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            {isDownloading ? 'Zipping...' : 'Download'}
          </button>
          
          {/* <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neo-blue border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold text-black uppercase text-xs">
            <FolderOutput className="w-4 h-4 stroke-[3]" />
            Move
          </button> */}

          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-500 hover:text-white border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold text-black uppercase text-xs disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 stroke-[3]" />
            Delete
          </button>
        </div>

        <button
          onClick={clearSelection}
          className="ml-2 p-1 text-black hover:bg-black hover:text-white border-2 border-transparent transition-colors"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
