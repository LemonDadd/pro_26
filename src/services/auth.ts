import request, { setToken, setRefreshToken, clearAuth } from './request';
import type { User, LoginResult } from '@/types';

export interface WxLoginParams {
  code: string;
  nickname?: string;
  avatar?: string;
}

export async function wxLogin(params: WxLoginParams): Promise<LoginResult> {
  const data = await request<LoginResult>({
    url: '/auth/wx-login',
    method: 'POST',
    data: params,
    skipAuth: true,
  });
  if (data?.token) {
    setToken(data.token);
  }
  if (data?.refreshToken) {
    setRefreshToken(data.refreshToken);
  }
  return data;
}

export async function refreshToken(refreshTokenStr: string): Promise<LoginResult> {
  const data = await request<LoginResult>({
    url: '/auth/refresh',
    method: 'POST',
    data: { refreshToken: refreshTokenStr },
    skipAuth: true,
  });
  if (data?.token) {
    setToken(data.token);
  }
  if (data?.refreshToken) {
    setRefreshToken(data.refreshToken);
  }
  return data;
}

export async function getCurrentUser(): Promise<User> {
  return request<User>({
    url: '/auth/me',
    method: 'GET',
  });
}

export interface UpdateProfileParams {
  nickname?: string;
  avatar?: string;
}

export async function updateProfile(params: UpdateProfileParams): Promise<User> {
  return request<User>({
    url: '/auth/profile',
    method: 'PUT',
    data: params,
  });
}

export function logout(): void {
  clearAuth();
}

export default {
  wxLogin,
  refreshToken,
  getCurrentUser,
  updateProfile,
  logout,
};
