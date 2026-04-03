'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { FolderPlus, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/services/folders.service';
import toast from 'react-hot-toast';

interface NewFolderModalProps {
  open: boolean;
  onClose: () => void;
  parentFolderId?: string | null;
}

export function NewFolderModal({ open, onClose, parentFolderId }: NewFolderModalProps) {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const { mutate: createFolder, isPending } = useMutation({
    mutationFn: () => foldersApi.createFolder({ name: name.trim(), parentFolderId: parentFolderId ?? undefined }),
    onSuccess: () => {
      toast.success(`Folder "${name.trim()}" created`);
      // Invalidate both root and current folder's folder list
      queryClient.invalidateQueries({ queryKey: ['folders', parentFolderId ?? null] });
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create folder');
    },
  });

  const handleClose = () => {
    setName('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createFolder();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-sm z-50 p-6 animate-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-base font-semibold text-gray-200 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-brand-400" />
              New Folder
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Folder name
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Untitled folder"
                maxLength={255}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={!name.trim() || isPending}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
