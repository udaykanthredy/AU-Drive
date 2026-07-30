'use client';

import { Folder as FolderIcon, MoreVertical } from 'lucide-react';
import { Folder } from '@/types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion } from 'framer-motion';

interface FolderCardProps {
  folder: Folder;
  onClick?: (folder: Folder) => void;
}

export const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function FolderCard({ folder, onClick }: FolderCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, rotate: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(folder)}
      className="flex items-center justify-between p-3.5 bg-white border-2 border-black hover:bg-neo-yellow cursor-pointer transition-colors group shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
    >
      <div className="flex items-center gap-3 truncate">
        <FolderIcon className="w-5 h-5 text-black flex-shrink-0 group-hover:scale-110 transition-transform fill-current" />
        <span className="text-sm font-bold text-black truncate">{folder.name}</span>
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded-md text-black hover:bg-black hover:text-white opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 border-2 border-transparent"
          >
            <MoreVertical className="w-4 h-4 stroke-[3]" />
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
            <DropdownMenu.Item className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-neo-yellow border-2 border-transparent hover:border-black">
              Move to...
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-[2px] bg-black my-1.5" />
            <DropdownMenu.Item className="px-3 py-2 text-sm text-black font-bold outline-none cursor-pointer hover:bg-red-500 border-2 border-transparent hover:border-black transition-colors">
              Move to trash
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </motion.div>
  );
}
