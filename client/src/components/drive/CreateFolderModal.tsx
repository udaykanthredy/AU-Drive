'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { foldersApi } from '@/services/folders.service';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFolderModal({ isOpen, onClose }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const currentFolderId = searchParams?.get('folder') || undefined;
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsLoading(true);
    try {
      await foldersApi.createFolder({
        name: folderName.trim(),
        parentFolderId: currentFolderId,
      });
      toast.success('Folder created!');
      queryClient.invalidateQueries({ queryKey: ['folders', currentFolderId || null] });
      setFolderName('');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create folder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Dialog.Content className="w-full max-w-md bg-white border-4 border-black shadow-neo rounded-none overflow-hidden animate-in zoom-in-95 z-50">
            <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-neo-pink">
              <div className="flex items-center gap-2 text-black">
                <FolderPlus className="w-6 h-6 stroke-[3]" />
                <Dialog.Title className="text-xl font-black uppercase tracking-widest">
                  New Folder
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="p-1 text-black hover:bg-white border-2 border-transparent hover:border-black transition-colors">
                  <X className="w-6 h-6 stroke-[3]" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-black uppercase mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Project Assets"
                  autoFocus
                  required
                  className="w-full bg-white border-2 border-black px-4 py-3 text-black font-bold placeholder-gray-400 focus:outline-none focus:shadow-neo focus:-translate-y-[2px] focus:-translate-x-[2px] transition-all"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-white text-black font-bold uppercase border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !folderName.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-black font-bold uppercase border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin stroke-[3]" />}
                  Create Folder
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
