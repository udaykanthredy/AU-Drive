'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderOpen,
  Star,
  Clock,
  Trash2,
  Share2,
  HardDrive,
  Plus,
  Upload,
  FolderPlus
} from 'lucide-react';
import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { NewFolderModal } from '@/components/drive/NewFolderModal';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { useFileUploader } from '@/hooks/useFileUploader';
import { useSearchParams } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'My Drive', icon: FolderOpen },
  { href: '/dashboard/recent', label: 'Recent', icon: Clock },
  { href: '/dashboard/starred', label: 'Starred', icon: Star },
  { href: '/dashboard/shared', label: 'Shared with me', icon: Share2 },
  { href: '/dashboard/trash', label: 'Trash', icon: Trash2 },
];

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  
  const { uploadFiles } = useFileUploader();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);

  const currentFolderId = searchParams?.get('folder');

  const storageUsed = user?.storageUsed ?? 0;
  const storageQuota = user?.storageQuota ?? 15 * 1024 * 1024 * 1024; // 15GB fallback
  const storagePercent = Math.min(100, Math.round((storageUsed / storageQuota) * 100));

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(Array.from(e.target.files), currentFolderId);
      // Reset input so the same file could be uploaded again
      e.target.value = '';
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <HardDrive className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg">AU Drive</span>
      </div>

      {/* New Button */}
      <div className="px-4 mb-4 mt-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-xl font-medium transition-colors border border-gray-700 hover:border-gray-600 shadow-sm w-full md:w-auto">
              <Plus className="w-5 h-5 text-brand-400" />
              New
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 z-50"
              align="start"
              sideOffset={8}
            >
              <DropdownMenu.Item
                onSelect={() => setNewFolderOpen(true)}
                className="flex items-center gap-2 px-3 py-2 outline-none cursor-pointer hover:bg-gray-700 rounded-md text-sm text-gray-200"
              >
                <FolderPlus className="w-4 h-4 text-gray-400" />
                New Folder
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-gray-700 my-1.5" />
              <DropdownMenu.Item 
                onClick={handleFileUploadClick}
                className="flex items-center gap-2 px-3 py-2 outline-none cursor-pointer hover:bg-gray-700 rounded-md text-sm text-gray-200"
              >
                <Upload className="w-4 h-4 text-gray-400" />
                File Upload
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          multiple 
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors font-medium',
              pathname === href
                ? 'bg-brand-600/15 text-brand-400'
                : 'text-gray-300 hover:bg-gray-800'
            )}
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Storage usage */}
      <div className="px-6 py-6 border-t border-gray-800">
        <div className="text-sm text-gray-400 mb-3 flex items-center justify-between">
          <span>Storage</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden mb-2">
          <div
            className={clsx(
              'h-full transition-all duration-500 rounded-full',
              storagePercent > 90 ? 'bg-red-500' : storagePercent > 70 ? 'bg-yellow-500' : 'bg-brand-500'
            )}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <div className="text-xs text-gray-500">
          {formatBytes(storageUsed)} of {formatBytes(storageQuota)} used
        </div>
      </div>

      <NewFolderModal
        open={newFolderOpen}
        onClose={() => setNewFolderOpen(false)}
        parentFolderId={currentFolderId}
      />
    </aside>
  );
}
