'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { FileCard } from '@/components/drive/FileCard';
import { FilePreviewModal } from '@/components/drive/FilePreviewModal';
import { useUIStore } from '@/store/uiStore';
import { Star, Loader2, StarOff } from 'lucide-react';
import type { File as FileModel } from '@/types';
import toast from 'react-hot-toast';

export default function StarredPage() {
  const { setPreviewFile } = useUIStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['files', 'starred'],
    queryFn: () => filesApi.getFiles({ isStarred: true }).then((r) => r.data.data as FileModel[]),
  });

  const handleUnstar = async (file: FileModel, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await filesApi.updateFile(file._id, { isStarred: false });
      toast.success(`Removed "${file.name}" from starred`);
      queryClient.invalidateQueries({ queryKey: ['files', 'starred'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch {
      toast.error('Failed to unstar file');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400 text-sm">Failed to load starred files.</p>
      </div>
    );
  }

  const files = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="w-6 h-6 text-yellow-400 fill-current" />
        <h1 className="text-2xl font-bold text-white">Starred</h1>
        {files.length > 0 && (
          <span className="text-sm text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
          <StarOff className="w-14 h-14 text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-1">No starred files</h3>
          <p className="text-gray-500 text-sm">Star a file to find it quickly here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
          {files.map((file) => (
            <div key={file._id} className="relative group/star">
              <FileCard file={file} onDoubleClicked={(f) => setPreviewFile(f._id)} />
              {/* Quick unstar button */}
              <button
                onClick={(e) => handleUnstar(file, e)}
                title="Remove from starred"
                className="absolute top-1.5 left-1.5 z-20 p-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 opacity-0 group-hover/star:opacity-100 transition-opacity hover:bg-yellow-500/40"
              >
                <Star className="w-3 h-3 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
      <FilePreviewModal />
    </div>
  );
}
