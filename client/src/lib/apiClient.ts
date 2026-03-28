import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Axios API client with request/response interceptors.
 * Attaches Authorization header from Zustand store on every request.
 */
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies (for httpOnly refresh token)
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor: attach access token ─────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Read token from Zustand persisted state
    try {
      const raw = localStorage.getItem('au-drive-auth');
      if (raw) {
        const state = JSON.parse(raw);
        const token = state?.state?.accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Silently ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 (token refresh) ─────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // TODO Phase 1: Call refresh endpoint and update token in store
        // await apiClient.post('/auth/refresh');
        // return apiClient(originalRequest);
      } catch {
        // Refresh failed — redirect to login
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
