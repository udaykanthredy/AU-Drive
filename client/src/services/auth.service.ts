// TODO Phase 1: Implement auth API calls

import apiClient from '@/lib/apiClient';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterPayload) => apiClient.post('/auth/register', data),
  login: (data: LoginPayload) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  refresh: () => apiClient.post('/auth/refresh'),
};
