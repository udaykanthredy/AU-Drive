'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

/**
 * Higher-order component: redirects unauthenticated users to /login.
 * Wrap any page that requires auth with this component.
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthGuardedPage(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (!isAuthenticated) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}
