'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { FilePreviewModal } from '@/components/drive/FilePreviewModal';
import { useUIStore } from '@/store/uiStore';
import { Trash2, Loader2, RotateCcw, X, AlertTriangle } from 'lucide-react';
import type { File as FileModel } from '@/types';
import { getFileIcon, formatBytes } from '@/components/drive/FileCard';
import toast from 'react-hot-toast';
import { useState } from 'react';

function TrashFileRow({ file, onRestore, onDelete }: {
  file: FileModel;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [loading, setLoading] = useState<'restore' | 'delete' | null>(null);

  const deletedAgo = file.deletedAt
    ? new Date(file.deletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-800/50 transition-colors group border border-transparent hover:border-gray-700/50">
      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-500 flex-shrink-0">
        {getFileIcon(file.mimeType, 'w-4 h-4')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-300 truncate">{file.name}</p>
        <p className="text-xs text-gray-600 mt-0.5">{formatBytes(file.size)} · Deleted {deletedAgo}</p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => { setLoading('restore'); onRestore(file._id); }}
          disabled={!!loading}
          title="Restore"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-400 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restore
        </button>
        <button
          onClick={() => { setLoading('delete'); onDelete(file._id); }}
          disabled={!!loading}
          title="Delete permanently"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
          Delete forever
        </button>
      </div>
    </div>
  );
}

export default function TrashPage() {
  const { setPreviewFile } = useUIStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['files', 'trash'],
    queryFn: () => filesApi.getFiles({ isDeleted: true }).then((r) => r.data.data as FileModel[]),
  });

  const handleRestore = async (id: string) => {
    try {
      await filesApi.restoreFile(id);
      toast.success('File restored to My Drive');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch {
      toast.error('Failed to restore file');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await filesApi.permanentDeleteFile(id);
      toast.success('File permanently deleted');
      queryClient.invalidateQueries({ queryKey: ['files', 'trash'] });
    } catch {
      toast.error('Failed to delete file');
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
        <p className="text-red-400 text-sm">Failed to load trash.</p>
      </div>
    );
  }

  const files = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trash2 className="w-6 h-6 text-gray-400" />
        <h1 className="text-2xl font-bold text-white">Trash</h1>
        {files.length > 0 && (
          <span className="text-sm text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {files.length} item{files.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {files.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Items in trash are automatically deleted after 30 days.</span>
        </div>
      )}

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
          <Trash2 className="w-14 h-14 text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-1">Trash is empty</h3>
          <p className="text-gray-500 text-sm">Files you delete will appear here.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800/50">
          {files.map((file) => (
            <TrashFileRow
              key={file._id}
              file={file}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      <FilePreviewModal />
    </div>
  );
}
