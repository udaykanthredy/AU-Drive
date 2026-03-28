'use client';

import { Search, Bell, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

/**
 * Top navigation bar.
 * TODO Phase 1:
 *  - Wire up search to semantic search API (Phase 2)
 *  - User dropdown (profile, logout)
 *  - Notification bell (activity feed)
 */
export function Topbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-[60px] border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 flex-shrink-0">
      {/* Search bar */}
      <div className="relative w-96 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search files..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
          // TODO Phase 2: Wire up to semantic search API
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-medium text-white">
            {user?.name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
          </div>
          <span className="text-sm font-medium hidden sm:block">{user?.name ?? 'Account'}</span>
        </button>
      </div>
    </header>
  );
}
