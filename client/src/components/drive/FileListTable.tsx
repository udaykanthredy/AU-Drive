'use client';

import { format } from 'date-fns';
import { MoreVertical, Star, Folder as FolderIcon, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import type { File as FileModel, Folder } from '@/types';
import { formatBytes, getFileIcon } from './FileCard';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { useUIStore } from '@/store/uiStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface FileListTableProps {
  files: FileModel[];
  folders: Folder[];
  onFolderClick?: (folder: Folder) => void;
  onFileDoubleClick?: (file: FileModel) => void;
  showPath?: boolean; // show folder path info (used in Recent view)
}

export function FileListTable({ files, folders, onFolderClick, onFileDoubleClick, showPath }: FileListTableProps) {
  const queryClient = useQueryClient();
  const { setShareFile } = useUIStore();

  const handleDeleteFile = async (file: FileModel, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await filesApi.deleteFile(file._id);
      toast.success('File moved to trash');
      queryClient.invalidateQueries({ queryKey: ['files', file.folderId] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch {
      toast.error('Failed to move to trash');
    }
  };

  const handleToggleStar = async (file: FileModel, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await filesApi.updateFile(file._id, { isStarred: !file.isStarred });
      toast.success(file.isStarred ? 'Removed from starred' : 'Starred file');
      queryClient.invalidateQueries({ queryKey: ['files', file.folderId] });
    } catch {
      toast.error('Failed to update star status');
    }
  };

  if (files.length === 0 && folders.length === 0) {
    return (
      <div className="flex -mt-10 items-center justify-center p-12 text-black text-sm font-bold italic">
        This folder is empty.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-[minmax(200px,1fr)_120px_150px_100px_40px] items-center text-xs font-bold text-black border-b-4 border-black pb-2 px-3">
        <div className="uppercase">Name</div>
        <div className="uppercase">Owner</div>
        <div className="uppercase">Last modified</div>
        <div className="text-right uppercase">File size</div>
        <div></div>
      </div>

      <motion.div 
        className="flex flex-col mt-2 gap-1"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
      >
        {folders.map((folder) => (
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { opacity: 1, x: 0 }
            }}
            key={`folder-${folder._id}`}
            onClick={() => onFolderClick?.(folder)}
            className="grid grid-cols-[minmax(200px,1fr)_120px_150px_100px_40px] items-center px-3 py-3 border-b-2 border-black hover:bg-neo-yellow cursor-pointer group transition-colors bg-white font-bold"
          >
            <div className="flex items-center gap-3 truncate pr-4">
              <FolderIcon className="w-5 h-5 text-black flex-shrink-0 transition-colors fill-current" />
              <span className="text-sm font-bold text-black truncate">{folder.name}</span>
            </div>
            <div className="text-sm text-black truncate pr-4">me</div>
            <div className="text-sm text-black truncate">
              {format(new Date(folder.updatedAt), 'MMM d, yyyy')}
            </div>
            <div className="text-sm text-black text-right pr-4">—</div>
            <div className="flex justify-end pr-2">
              {/* Folder Actions */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-black hover:bg-black hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 border-2 border-transparent"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    onClick={(e) => e.stopPropagation()}
                    className="min-w-[160px] bg-white border-2 border-black p-1.5 shadow-neo animate-in fade-in z-50 mr-4"
                    align="end"
                  >
                    <DropdownMenu.Item className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-neo-yellow border-2 border-transparent hover:border-black">
                      Rename
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-red-500 border-2 border-transparent hover:border-black transition-colors">
                      Move to trash
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </motion.div>
        ))}

        {files.map((file) => (
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { opacity: 1, x: 0 }
            }}
            key={`file-${file._id}`}
            onClick={() => onFileDoubleClick?.(file)}
            className="grid grid-cols-[minmax(200px,1fr)_120px_150px_100px_40px] items-center px-3 py-3 border-b-2 border-black hover:bg-neo-blue cursor-pointer group transition-colors bg-white font-bold"
          >
            <div className="flex items-center gap-3 truncate pr-4">
              <div className="relative">
                {getFileIcon(file.mimeType, "w-5 h-5 flex-shrink-0 text-black")}
                {file.isStarred && (
                  <Star className="absolute -bottom-1 -right-1 w-3 h-3 text-yellow-500 fill-current bg-white rounded-full" />
                )}
              </div>
              <span className="text-sm font-bold text-black truncate">{file.name}</span>
              {file.containsPII && (
                <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" title="Contains sensitive PII" />
              )}
              {file.processingStatus === 'processing' && (
                <Loader2 className="w-4 h-4 animate-spin text-brand-500 flex-shrink-0" title="AI Processing..." />
              )}
              {file.processingStatus === 'failed' && (
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" title="Processing failed" />
              )}
            </div>
            <div className="text-sm text-black truncate pr-4">me</div>
            <div className="text-sm text-black truncate">
              {format(new Date(file.updatedAt), 'MMM d, yyyy')}
            </div>
            <div className="text-sm text-black text-right pr-4">{formatBytes(file.size)}</div>
            <div className="flex justify-end pr-2">
              {/* File Actions */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-black hover:bg-black hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 border-2 border-transparent"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    onClick={(e) => e.stopPropagation()}
                    className="min-w-[160px] bg-white border-2 border-black p-1.5 shadow-neo animate-in fade-in z-50 mr-4"
                    align="end"
                  >
                    <DropdownMenu.Item 
                      onClick={(e) => { e.stopPropagation(); onFileDoubleClick?.(file); }}
                      className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-neo-yellow border-2 border-transparent hover:border-black"
                    >
                      Preview
                    </DropdownMenu.Item>
                    <DropdownMenu.Item 
                      onClick={(e) => handleToggleStar(file, e)}
                      className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-neo-yellow border-2 border-transparent hover:border-black"
                    >
                      {file.isStarred ? 'Unstar' : 'Star'}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item 
                      onClick={(e) => { e.stopPropagation(); setShareFile(file._id); }}
                      className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-neo-yellow border-2 border-transparent hover:border-black"
                    >
                      Share
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-[2px] bg-black my-1.5" />
                    <DropdownMenu.Item 
                      onClick={(e) => handleDeleteFile(file, e)}
                      className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-red-500 border-2 border-transparent hover:border-black transition-colors"
                    >
                      Move to trash
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
