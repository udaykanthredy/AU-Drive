'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { Trash2, Loader2, RotateCcw, Trash } from 'lucide-react';
import { formatBytes, getFileIcon } from '@/components/drive/FileCard';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { File as FileModel } from '@/types';

export default function TrashPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['files-trash'],
    queryFn: () => filesApi.getFiles({ isDeleted: true } as any).then(res => res.data.data as FileModel[]),
  });

  const files: FileModel[] = data ?? [];

  const { mutate: restore } = useMutation({
    mutationFn: (fileId: string) => filesApi.restoreFile(fileId),
    onSuccess: (_, fileId) => {
      toast.success('File restored');
      queryClient.invalidateQueries({ queryKey: ['files-trash'] });
      queryClient.invalidateQueries({ queryKey: ['files', null] });
    },
    onError: () => toast.error('Failed to restore file'),
  });

  const { mutate: permanentDelete } = useMutation({
    mutationFn: (fileId: string) => filesApi.permanentDeleteFile(fileId),
    onSuccess: () => {
      toast.success('File permanently deleted');
      queryClient.invalidateQueries({ queryKey: ['files-trash'] });
    },
    onError: () => toast.error('Failed to delete file'),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brand-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading trash...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trash2 className="w-6 h-6 text-red-400" />
          <h1 className="text-xl font-bold text-gray-200">Trash</h1>
        </div>
        {files.length > 0 && (
          <p className="text-xs text-gray-500">{files.length} item{files.length !== 1 ? 's' : ''} in trash</p>
        )}
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
          <Trash2 className="w-14 h-14 text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">Trash is empty</p>
          <p className="text-sm text-gray-600 mt-1">Files moved to trash appear here</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
          {/* Table header */}
          <div className="grid grid-cols-[minmax(200px,1fr)_150px_120px] items-center text-xs font-semibold text-gray-500 px-4 py-3 border-b border-gray-800">
            <div>Name</div>
            <div>Deleted</div>
            <div className="text-right">Actions</div>
          </div>

          {files.map((file) => (
            <div
              key={file._id}
              className="grid grid-cols-[minmax(200px,1fr)_150px_120px] items-center px-4 py-3 hover:bg-gray-800/50 transition-colors group"
            >
              {/* Name */}
              <div className="flex items-center gap-3 truncate pr-4">
                {getFileIcon(file.mimeType, 'w-5 h-5 flex-shrink-0 text-gray-500')}
                <span className="text-sm text-gray-300 truncate">{file.originalName}</span>
                <span className="text-xs text-gray-600 flex-shrink-0">{formatBytes(file.size)}</span>
              </div>

              {/* Deleted date */}
              <div className="text-sm text-gray-500">
                {file.deletedAt ? format(new Date(file.deletedAt as any), 'MMM d, yyyy') : '—'}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => restore(file._id)}
                  title="Restore"
                  className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-2.5 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Permanently delete "${file.originalName}"? This cannot be undone.`)) {
                      permanentDelete(file._id);
                    }
                  }}
                  title="Delete permanently"
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
