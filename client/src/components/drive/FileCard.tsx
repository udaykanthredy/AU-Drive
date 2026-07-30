import { FileText, Image as ImageIcon, File, MoreVertical, Star, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';
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
      onClick={() => onDoubleClicked?.(file)}
      className="flex flex-col bg-white border-2 border-black shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none cursor-pointer transition-all duration-200 group overflow-hidden relative"
    >
      {/* Thumbnail area */}
      <div className="h-32 bg-neo-bg flex items-center justify-center border-b-2 border-black relative z-10">
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
          {file.containsPII && (
            <div className="bg-red-500 text-white rounded-full p-1 shadow-md" title="Contains sensitive PII">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
        {getFileIcon(file.mimeType, "w-12 h-12 text-gray-700")}
        {file.isStarred && (
          <Star className="absolute top-2 left-2 w-4 h-4 text-yellow-500 fill-current" />
        )}
      </div>

      {/* Details area */}
      <div className="p-3 flex items-start gap-2 justify-between flex-1 relative z-10">
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            {getFileIcon(file.mimeType, "w-4 h-4 flex-shrink-0 text-black")}
            <span className="text-sm font-bold text-black truncate">{file.name}</span>
          </div>
          <span className="text-xs font-bold text-gray-500 block">
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
              className="min-w-[160px] bg-white border-2 border-black p-1.5 shadow-neo animate-in fade-in z-50 mr-4"
              align="end"
            >
              <DropdownMenu.Item 
                onClick={handlePreview}
                className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-neo-yellow border-2 border-transparent hover:border-black"
              >
                Preview
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                onClick={handleShare}
                className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-neo-yellow border-2 border-transparent hover:border-black"
              >
                Share
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-neo-yellow border-2 border-transparent hover:border-black">
                Rename
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-[2px] bg-black my-1.5" />
              <DropdownMenu.Item 
                onClick={handleTrash}
                className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-red-500 border-2 border-transparent hover:border-black transition-colors"
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
