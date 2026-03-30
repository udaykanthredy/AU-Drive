import { FileText, Image as ImageIcon, File, MoreVertical, Star } from 'lucide-react';
import type { File as FileModel } from '@/types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { useUIStore } from '@/store/uiStore';
import toast from 'react-hot-toast';

interface FileCardProps {
  file: FileModel;
  onDoubleClicked?: (file: FileModel) => void;
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(mimeType: string, className?: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon className={className} />;
  if (mimeType === 'application/pdf') return <FileText className={className} />;
  return <File className={className} />;
}

export function FileCard({ file, onDoubleClicked }: FileCardProps) {
  const queryClient = useQueryClient();
  const { setShareFile } = useUIStore();

  const handleTrash = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await filesApi.deleteFile(file._id);
      toast.success('File moved to trash');
      queryClient.invalidateQueries({ queryKey: ['files', file.folderId] });
    } catch {
      toast.error('Failed to move to trash');
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClicked?.(file);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareFile(file._id);
  };

  return (
    <div
      onDoubleClick={() => onDoubleClicked?.(file)}
      className="flex flex-col bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-gray-700 cursor-pointer transition-all group shadow-sm hover:shadow-md h-full overflow-hidden"
    >
      {/* Thumbnail area (Placeholder for Phase 2 images) */}
      <div className="h-32 bg-gray-950 flex items-center justify-center border-b border-gray-800 relative">
        {getFileIcon(file.mimeType, "w-12 h-12 text-gray-700")}
        {file.isStarred && (
          <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-500 fill-current" />
        )}
      </div>

      {/* Details area */}
      <div className="p-3 flex items-start gap-2 justify-between flex-1">
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            {getFileIcon(file.mimeType, "w-4 h-4 flex-shrink-0 text-brand-400")}
            <span className="text-sm font-medium text-gray-200 truncate">{file.originalName}</span>
          </div>
          <span className="text-xs text-gray-500 block">
            {formatBytes(file.size)}
          </span>
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-700 hover:text-white opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 flex-shrink-0"
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
                onClick={handlePreview}
                className="px-3 py-2 text-sm text-gray-200 outline-none cursor-pointer hover:bg-gray-700 rounded-md"
              >
                Preview
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                onClick={handleShare}
                className="px-3 py-2 text-sm text-gray-200 outline-none cursor-pointer hover:bg-gray-700 rounded-md"
              >
                Share
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-3 py-2 text-sm text-gray-200 outline-none cursor-pointer hover:bg-gray-700 rounded-md">
                Rename
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-gray-700 my-1.5" />
              <DropdownMenu.Item 
                onClick={handleTrash}
                className="px-3 py-2 text-sm text-red-400 outline-none cursor-pointer hover:bg-red-500/10 rounded-md transition-colors"
              >
                Move to trash
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
