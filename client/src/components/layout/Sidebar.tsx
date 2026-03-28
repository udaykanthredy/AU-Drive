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
  Search,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'My Drive', icon: FolderOpen },
  { href: '/dashboard/starred', label: 'Starred', icon: Star },
  { href: '/dashboard/recent', label: 'Recent', icon: Clock },
  { href: '/dashboard/shared', label: 'Shared', icon: Share2 },
  { href: '/dashboard/trash', label: 'Trash', icon: Trash2 },
];

/**
 * Sidebar navigation component.
 * TODO Phase 1:
 *  - Show storage usage progress bar (storageUsed / storageQuota)
 *  - Add folder tree for nested folder navigation
 *  - Collapse on mobile
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg">AU Drive</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-brand-600/20 text-brand-400'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Storage usage placeholder */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 mb-2">Storage</div>
        <div className="h-1.5 rounded-full bg-gray-800">
          {/* TODO Phase 1: Calculate width from useAuthStore().user.storageUsed */}
          <div className="h-1.5 rounded-full bg-brand-500 w-1/4" />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {/* TODO Phase 1: Show real values */}
          3.75 GB of 15 GB used
        </div>
      </div>
    </aside>
  );
}
