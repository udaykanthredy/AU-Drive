import { format } from 'date-fns';
import { MoreVertical, Star, Folder as FolderIcon } from 'lucide-react';
import type { File as FileModel, Folder } from '@/types';
import { formatBytes, getFileIcon } from './FileCard';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { useUIStore } from '@/store/uiStore';
import toast from 'react-hot-toast';

interface FileListTableProps {
  files: FileModel[];
  folders: Folder[];
  onFolderClick?: (folder: Folder) => void;
  onFileDoubleClick?: (file: FileModel) => void;
}

export function FileListTable({ files, folders, onFolderClick, onFileDoubleClick }: FileListTableProps) {
  const queryClient = useQueryClient();
  const { setShareFile } = useUIStore();

  const handleDeleteFile = async (file: FileModel, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await filesApi.deleteFile(file._id);
      toast.success('File moved to trash');
      queryClient.invalidateQueries({ queryKey: ['files', file.folderId] });
    } catch {
      toast.error('Failed to move to trash');
    }
  };

  if (files.length === 0 && folders.length === 0) {
    return (
      <div className="flex -mt-10 items-center justify-center p-12 text-gray-500 text-sm italic">
        This folder is empty.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-[minmax(200px,1fr)_120px_150px_100px_40px] items-center text-xs font-semibold text-gray-400 border-b border-gray-800 pb-2 px-3">
        <div>Name</div>
        <div>Owner</div>
        <div>Last modified</div>
        <div className="text-right">File size</div>
        <div></div>
      </div>

      <div className="flex flex-col mt-2 gap-1">
        {folders.map((folder) => (
          <div
            key={`folder-${folder._id}`}
            onClick={() => onFolderClick?.(folder)}
            className="grid grid-cols-[minmax(200px,1fr)_120px_150px_100px_40px] items-center px-3 py-3 rounded-lg hover:bg-gray-800/60 cursor-pointer group transition-colors"
          >
            <div className="flex items-center gap-3 truncate pr-4">
              <FolderIcon className="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:text-brand-400 transition-colors fill-current opacity-80" />
              <span className="text-sm font-medium text-gray-200 truncate">{folder.name}</span>
            </div>
            <div className="text-sm text-gray-400 truncate pr-4">me</div>
            <div className="text-sm text-gray-400 truncate">
              {format(new Date(folder.updatedAt), 'MMM d, yyyy')}
            </div>
            <div className="text-sm text-gray-400 text-right pr-4">—</div>
            <div className="flex justify-end pr-2">
              {/* Folder Actions */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-md text-gray-500 hover:bg-gray-700 hover:text-white opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    onClick={(e) => e.stopPropagation()}
                    className="min-w-[160px] bg-gray-800 border border-gray-700 rounded-lg p-1.5 shadow-xl animate-in fade-in z-50 mr-4"
                    align="end"
                  >
                    <DropdownMenu.Item className="px-3 py-2 text-sm text-gray-200 outline-none cursor-pointer hover:bg-gray-700 rounded-md">
                      Rename
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="px-3 py-2 text-sm text-red-400 outline-none cursor-pointer hover:bg-red-500/10 rounded-md transition-colors">
                      Move to trash
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        ))}

        {files.map((file) => (
          <div
            key={`file-${file._id}`}
            onDoubleClick={() => onFileDoubleClick?.(file)}
            className="grid grid-cols-[minmax(200px,1fr)_120px_150px_100px_40px] items-center px-3 py-3 rounded-lg hover:bg-gray-800/60 cursor-pointer group transition-colors"
          >
            <div className="flex items-center gap-3 truncate pr-4">
              <div className="relative">
                {getFileIcon(file.mimeType, "w-5 h-5 flex-shrink-0 text-brand-400")}
                {file.isStarred && (
                  <Star className="absolute -bottom-1 -right-1 w-3 h-3 text-yellow-500 fill-current bg-gray-900 rounded-full" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-200 truncate">{file.originalName}</span>
            </div>
            <div className="text-sm text-gray-400 truncate pr-4">me</div>
            <div className="text-sm text-gray-400 truncate">
              {format(new Date(file.updatedAt), 'MMM d, yyyy')}
            </div>
            <div className="text-sm text-gray-400 text-right pr-4">{formatBytes(file.size)}</div>
            <div className="flex justify-end pr-2">
              {/* File Actions */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-md text-gray-500 hover:bg-gray-700 hover:text-white opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    onClick={(e) => e.stopPropagation()}
                    className="min-w-[160px] bg-gray-800 border border-gray-700 rounded-lg p-1.5 shadow-xl animate-in fade-in z-50 mr-4"
                    align="end"
                  >
                    <DropdownMenu.Item 
                      onClick={(e) => { e.stopPropagation(); onFileDoubleClick?.(file); }}
                      className="px-3 py-2 text-sm text-gray-200 outline-none cursor-pointer hover:bg-gray-700 rounded-md"
                    >
                      Preview
                    </DropdownMenu.Item>
                    <DropdownMenu.Item 
                      onClick={(e) => { e.stopPropagation(); setShareFile(file._id); }}
                      className="px-3 py-2 text-sm text-gray-200 outline-none cursor-pointer hover:bg-gray-700 rounded-md"
                    >
                      Share
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-gray-700 my-1.5" />
                    <DropdownMenu.Item 
                      onClick={(e) => handleDeleteFile(file, e)}
                      className="px-3 py-2 text-sm text-red-400 outline-none cursor-pointer hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      Move to trash
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
