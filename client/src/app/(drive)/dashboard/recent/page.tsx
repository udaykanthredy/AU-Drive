'use client';

import { useQuery } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { FileListTable } from '@/components/drive/FileListTable';
import { FilePreviewModal } from '@/components/drive/FilePreviewModal';
import { useUIStore } from '@/store/uiStore';
import { Clock, Loader2 } from 'lucide-react';
import type { File as FileModel } from '@/types';

export default function RecentPage() {
  const { setPreviewFile } = useUIStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['files', 'recent'],
    queryFn: () =>
      filesApi
        .getFiles({ isDeleted: false })
        .then((r) => {
          const files = r.data.data as FileModel[];
          // Sort by updatedAt descending, take last 50
          return [...files]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 50);
        }),
  });

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
        <p className="text-red-400 text-sm">Failed to load recent files.</p>
      </div>
    );
  }

  const files = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="w-6 h-6 text-brand-400" />
        <h1 className="text-2xl font-bold text-white">Recent</h1>
        {files.length > 0 && (
          <span className="text-sm text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
          <Clock className="w-14 h-14 text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-1">No recent activity</h3>
          <p className="text-gray-500 text-sm">Files you upload or open will appear here.</p>
        </div>
      ) : (
        <FileListTable
          files={files}
          folders={[]}
          onFolderClick={() => {}}
          onFileDoubleClick={(f) => setPreviewFile(f._id)}
          showPath
        />
      )}
      <FilePreviewModal />
    </div>
  );
}
