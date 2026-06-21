import Taro from '@tarojs/taro';
import type { ApiResponse } from '@/types';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface RequestOptions extends Omit<Taro.request.Option<string | any>, 'url' | 'success' | 'fail' | 'complete'> {
  url: string;
  skipAuth?: boolean;
}

export function getToken(): string {
  return Taro.getStorageSync(TOKEN_KEY) || '';
}

export function setToken(token: string): void {
  Taro.setStorageSync(TOKEN_KEY, token);
}

export function getRefreshToken(): string {
  return Taro.getStorageSync(REFRESH_TOKEN_KEY) || '';
}

export function setRefreshToken(token: string): void {
  Taro.setStorageSync(REFRESH_TOKEN_KEY, token);
}

export function clearAuth(): void {
  Taro.removeStorageSync(TOKEN_KEY);
  Taro.removeStorageSync(REFRESH_TOKEN_KEY);
}

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

function addPendingRequest(callback: (token: string) => void): void {
  pendingRequests.push(callback);
}

function processPendingRequests(token: string): void {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
}

async function refreshTokenIfNeeded(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      addPendingRequest((token) => resolve(token));
    });
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  isRefreshing = true;

  try {
    const res = await Taro.request<ApiResponse<{ token: string; refreshToken: string; expiresIn: number }>>({
      url: `${BASE_URL}/auth/refresh`,
      method: 'POST',
      data: { refreshToken },
      header: { 'Content-Type': 'application/json' },
    });

    if (res.data.code === 0 && res.data.data?.token) {
      setToken(res.data.data.token);
      if (res.data.data.refreshToken) {
        setRefreshToken(res.data.data.refreshToken);
      }
      processPendingRequests(res.data.data.token);
      return res.data.data.token;
    } else {
      clearAuth();
      processPendingRequests('');
      return null;
    }
  } catch {
    clearAuth();
    processPendingRequests('');
    return null;
  } finally {
    isRefreshing = false;
  }
}

export async function request<T = unknown>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, skipAuth = false, ...rest } = options;

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(header as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Taro.request.SuccessCallbackResult<ApiResponse<T>>;

  try {
    response = await Taro.request<ApiResponse<T>>({
      url: fullUrl,
      method,
      data,
      header: headers,
      ...rest,
    });
  } catch (err) {
    Taro.showToast({ title: '网络请求失败', icon: 'none' });
    throw err;
  }

  const { data: respData, statusCode } = response;

  if (!skipAuth && statusCode === 401) {
    const newToken = await refreshTokenIfNeeded();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      const retryResponse = await Taro.request<ApiResponse<T>>({
        url: fullUrl,
        method,
        data,
        header: headers,
        ...rest,
      });
      if (retryResponse.data.code === 0) {
        return retryResponse.data.data;
      }
      throw new Error(retryResponse.data.message || '请求失败');
    } else {
      Taro.showToast({ title: '登录已过期,请重新登录', icon: 'none' });
      throw new Error('Unauthorized');
    }
  }

  if (respData.code !== 0) {
    Taro.showToast({ title: respData.message || '请求失败', icon: 'none' });
    throw new Error(respData.message || '请求失败');
  }

  return respData.data;
}

export default request;
