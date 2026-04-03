import { Folder as FolderIcon, MoreVertical, Share2, Star } from 'lucide-react';
import { Folder } from '@/types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useUIStore } from '@/store/uiStore';
import { foldersApi } from '@/services/folders.service';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface FolderCardProps {
  folder: Folder;
  onClick?: (folder: Folder) => void;
}

export function FolderCard({ folder, onClick }: FolderCardProps) {
  const { setShareFolder } = useUIStore();
  const queryClient = useQueryClient();

  const handleStar = async () => {
    try {
      await foldersApi.starFolder(folder._id, !folder.isStarred);
      queryClient.invalidateQueries({ queryKey: ['folders', folder.parentId ?? null] });
      toast.success(folder.isStarred ? 'Removed from starred' : 'Added to starred');
    } catch {
      toast.error('Failed to update star');
    }
  };
  return (
    <div
      onClick={() => onClick?.(folder)}
      className="flex items-center justify-between p-3.5 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-gray-700 cursor-pointer transition-all group shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3 truncate">
        <FolderIcon className="w-5 h-5 text-gray-500 flex-shrink-0 group-hover:text-brand-400 transition-colors" />
        <span className="text-sm font-medium text-gray-200 truncate">{folder.name}</span>
        {folder.isStarred && <Star className="w-3.5 h-3.5 text-yellow-400 fill-current flex-shrink-0" />}
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            onClick={(e) => e.stopPropagation()} // Prevent trigger navigation
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-700 hover:text-white opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
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
            <DropdownMenu.Item
              className="px-3 py-2 text-sm text-gray-200 outline-none cursor-pointer hover:bg-gray-700 rounded-md flex items-center gap-2"
              onSelect={handleStar}
            >
              <Star className={`w-3.5 h-3.5 ${folder.isStarred ? 'text-yellow-400 fill-current' : ''}`} />
              {folder.isStarred ? 'Unstar' : 'Star'}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-3 py-2 text-sm text-gray-200 outline-none cursor-pointer hover:bg-gray-700 rounded-md flex items-center gap-2"
              onSelect={() => setShareFolder(folder._id)}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </DropdownMenu.Item>
            <DropdownMenu.Item className="px-3 py-2 text-sm text-gray-200 outline-none cursor-pointer hover:bg-gray-700 rounded-md">
              Move to...
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-px bg-gray-700 my-1.5" />
            <DropdownMenu.Item className="px-3 py-2 text-sm text-red-400 outline-none cursor-pointer hover:bg-red-500/10 rounded-md transition-colors">
              Move to trash
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
