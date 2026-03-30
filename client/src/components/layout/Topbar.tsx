'use client';

import { Search, LogOut, User, LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { authApi } from '@/services/auth.service';
import { clsx } from 'clsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function Topbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  
  const { viewMode, setViewMode } = useUIStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // clear locally regardless
    }
    clearAuth();
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 flex-shrink-0 z-10 w-full shadow-sm">
      {/* Search Input */}
      <div className="flex-1 flex max-w-2xl px-2">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-2xl text-gray-200 placeholder-gray-500 bg-gray-800 focus:outline-none focus:bg-white focus:text-gray-900 focus:border-transparent focus:ring-0 sm:text-sm transition-all focus:placeholder-gray-400"
            placeholder="Search in Drive..."
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* View mode toggles */}
        <div className="hidden sm:flex items-center bg-gray-800/50 p-1 rounded-lg border border-gray-800 mr-2">
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              "p-1.5 rounded-md transition-colors",
              viewMode === 'list' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              "p-1.5 rounded-md transition-colors",
              viewMode === 'grid' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* User Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-600 text-sm font-medium text-white ring-2 ring-gray-900 hover:ring-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-500 transition-all">
              {user?.name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[240px] bg-gray-800 border border-gray-700 rounded-xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 z-50 mr-4 mt-2"
              align="end"
            >
              <div className="px-3 py-3 border-b border-gray-700 mb-2">
                <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate mt-1">{user?.email}</p>
              </div>

              <DropdownMenu.Item 
                className="flex items-center gap-2 px-3 py-2.5 outline-none cursor-pointer hover:bg-red-500/10 hover:text-red-400 rounded-lg text-sm text-gray-300 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
