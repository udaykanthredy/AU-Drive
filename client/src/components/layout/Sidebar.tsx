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
import { useRef } from 'react';
import { clsx } from 'clsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { useFileUploader } from '@/hooks/useFileUploader';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CreateFolderModal } from '@/components/drive/CreateFolderModal';

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
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  
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
    <aside className="w-64 flex-shrink-0 bg-neo-bg border-r-4 border-black flex flex-col z-20 relative">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
            <rect x="14" y="14" width="72" height="72" fill="#000000" />
            <rect x="4" y="4" width="72" height="72" fill="#22c55e" stroke="#000000" strokeWidth="6" />
            <path d="M 22 40 L 58 40" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
            <path d="M 22 56 L 46 56" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
            <rect x="22" y="24" width="12" height="12" fill="#FDE047" stroke="#000000" strokeWidth="4" />
          </svg>
        </div>
        <span className="font-bold tracking-wide text-black text-xl font-sans uppercase">AU Drive</span>
      </div>

      {/* New Button */}
      <div className="px-4 mb-4 mt-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 bg-brand-500 text-black px-5 py-3 font-bold transition-all border-2 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none w-full md:w-auto">
              <Plus className="w-5 h-5 text-black" />
              New
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-white border-2 border-black p-1.5 shadow-neo animate-in fade-in slide-in-from-top-2 z-50"
              align="start"
              sideOffset={8}
            >
              <DropdownMenu.Item 
                onClick={() => setIsCreateFolderOpen(true)}
                className="flex items-center gap-2 px-3 py-2 outline-none cursor-pointer hover:bg-neo-yellow text-sm font-semibold text-black border-2 border-transparent hover:border-black"
              >
                <FolderPlus className="w-4 h-4 text-black stroke-[3]" />
                New Folder
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-[2px] bg-black my-1.5" />
              <DropdownMenu.Item 
                onClick={handleFileUploadClick}
                className="flex items-center gap-2 px-3 py-2 outline-none cursor-pointer hover:bg-neo-blue text-sm font-semibold text-black border-2 border-transparent hover:border-black"
              >
                <Upload className="w-4 h-4 text-black" />
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
      <nav className="flex-1 px-3 space-y-2 overflow-y-auto mt-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-3 text-sm transition-all font-bold border-2',
              pathname === href
                ? 'bg-neo-yellow text-black border-black shadow-neo-sm'
                : 'text-gray-800 border-transparent hover:border-black hover:bg-white hover:shadow-neo-sm'
            )}
          >
            <Icon className="w-[18px] h-[18px] text-black" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Storage usage */}
      <div className="px-6 py-6 border-t-4 border-black bg-white">
        <div className="text-sm text-black font-bold mb-3 flex items-center justify-between">
          <span>Storage</span>
        </div>
        <div className="h-4 bg-white overflow-hidden mb-2 border-2 border-black shadow-neo-sm">
          <div
            className={clsx(
              'h-full border-r-2 border-black',
              storagePercent > 90 ? 'bg-red-500' : storagePercent > 70 ? 'bg-neo-yellow' : 'bg-brand-500'
            )}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        <div className="text-xs font-bold text-gray-800">
          {formatBytes(storageUsed)} of {formatBytes(storageQuota)} used
        </div>
      </div>

      <CreateFolderModal 
        isOpen={isCreateFolderOpen} 
        onClose={() => setIsCreateFolderOpen(false)} 
      />
    </aside>
  );
}
