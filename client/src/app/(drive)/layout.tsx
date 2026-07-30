'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

/**
 * Drive layout — guards all /dashboard/* pages.
 * On mount it attempts a silent token refresh via the httpOnly refresh-token cookie.
 * Only redirects to /login if the refresh fails (cookie missing / expired).
 */
export default function DriveLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshAuth } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Attempt to restore the session silently on every page load/reload
    refreshAuth().finally(() => setInitialized(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialized && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [initialized, isLoading, isAuthenticated, router]);

  // Show spinner while checking auth
  if (!initialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
