'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { filesApi } from '@/services/files.service';
import { useUIStore } from '@/store/uiStore';
import { FileCard } from '@/components/drive/FileCard';
import { FileListTable } from '@/components/drive/FileListTable';
import { FilePreviewModal } from '@/components/drive/FilePreviewModal';
import { ShareModal } from '@/components/drive/ShareModal';
import { Star, Loader2 } from 'lucide-react';
import type { File as FileModel } from '@/types';

export default function StarredPage() {
  const router = useRouter();
  const { viewMode, setPreviewFile } = useUIStore();

  const { data, isLoading } = useQuery({
    queryKey: ['files-starred'],
    queryFn: () => filesApi.getFiles({ isStarred: true }).then(res => res.data.data as FileModel[]),
  });

  const files: FileModel[] = data ?? [];

  const handleFileDoubleClick = (file: FileModel) => setPreviewFile(file._id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brand-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading starred files...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Star className="w-6 h-6 text-yellow-400" />
        <h1 className="text-xl font-bold text-gray-200">Starred</h1>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
          <Star className="w-14 h-14 text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">No starred files</p>
          <p className="text-sm text-gray-600 mt-1">Star files to find them easily here</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
          {files.map(file => (
            <FileCard key={file._id} file={file} onDoubleClicked={handleFileDoubleClick} />
          ))}
        </div>
      ) : (
        <FileListTable
          files={files}
          folders={[]}
          onFolderClick={(f) => router.push(`/dashboard?folder=${f._id}`)}
          onFileDoubleClick={handleFileDoubleClick}
        />
      )}

      <FilePreviewModal />
      <ShareModal />
    </div>
  );
}
