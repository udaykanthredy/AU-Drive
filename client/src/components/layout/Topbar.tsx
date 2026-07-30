'use client';

import { Search, LogOut, User, LayoutGrid, List, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { authApi } from '@/services/auth.service';
import { clsx } from 'clsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SearchBar } from '@/components/drive/SearchBar';

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
    <header className="h-[72px] border-b-4 border-black bg-white flex items-center justify-between px-8 flex-shrink-0 z-10 w-full relative">
      {/* Search Input */}
      <div className="flex-1 flex max-w-2xl px-2 relative z-10">
        <SearchBar />
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4 relative z-10">
        {/* View mode toggles */}
        <div className="hidden sm:flex items-center bg-neo-bg p-1 border-2 border-black mr-2 shadow-neo-sm">
          <button
            onClick={() => useUIStore.getState().setIsChatOpen(!useUIStore.getState().isChatOpen)}
            className="p-2 border-2 border-transparent hover:border-black hover:bg-neo-blue text-black font-bold transition-all mr-2"
            title="Open Chat"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              "p-2 transition-all border-2 font-bold",
              viewMode === 'list' ? 'bg-brand-500 text-black border-black shadow-neo-sm' : 'text-black border-transparent hover:border-black'
            )}
            title="List view"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              "p-2 transition-all border-2 font-bold",
              viewMode === 'grid' ? 'bg-brand-500 text-black border-black shadow-neo-sm' : 'text-black border-transparent hover:border-black'
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>

        {/* User Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center justify-center h-10 w-10 rounded-full bg-neo-pink border-2 border-black shadow-neo-sm text-sm font-bold text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all outline-none">
              {user?.name?.[0]?.toUpperCase() ?? <User className="w-5 h-5" />}
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
