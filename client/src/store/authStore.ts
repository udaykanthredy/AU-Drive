import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  storageUsed: number;
  storageQuota: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  /** Called on app mount — silently refreshes access token using the httpOnly cookie. */
  refreshAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true, // start true so layout waits for the refresh attempt

      setUser: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true, isLoading: false }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      refreshAuth: async () => {
        try {
          const res = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const { accessToken, user } = res.data?.data ?? {};
          if (accessToken && user) {
            set({ user, accessToken, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          // Refresh token expired or missing — user must log in again
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'echodrive-auth',
      // Only persist user data, not the token (security)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
