import Taro from '@tarojs/taro';
import { getToken } from './request';

export interface UploadResult {
  url: string;
  size: number;
  type: string;
  name: string;
}

export async function uploadFile(filePath: string, type: 'receipt' | 'avatar' | 'other' = 'other'): Promise<UploadResult> {
  const token = getToken();
  const res = await Taro.uploadFile({
    url: `${BASE_URL}/files/upload`,
    filePath,
    name: 'file',
    header: token ? { Authorization: `Bearer ${token}` } : {},
    formData: { type },
  });

  let data: { code: number; message: string; data: UploadResult };
  try {
    data = JSON.parse(res.data);
  } catch {
    throw new Error('上传失败');
  }

  if (data.code !== 0) {
    Taro.showToast({ title: data.message || '上传失败', icon: 'none' });
    throw new Error(data.message || '上传失败');
  }

  return data.data;
}

export async function getOssCredentials(): Promise<{
  accessKeyId: string;
  accessKeySecret: string;
  stsToken: string;
  bucket: string;
  region: string;
  dir: string;
  expire: number;
}> {
  return (await import('./request')).default({
    url: '/files/oss-credentials',
    method: 'GET',
  });
}

export default {
  uploadFile,
  getOssCredentials,
};
