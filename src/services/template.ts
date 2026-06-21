import request from './request';
import type { TripTemplate, Page, Trip } from '@/types';

export interface ListTemplatesParams {
  tag?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface ApplyTemplateParams {
  title?: string;
  destination?: string;
  startDate: string;
  endDate: string;
}

export async function listTemplates(params: ListTemplatesParams = {}): Promise<Page<TripTemplate>> {
  const { tag, keyword, page = 1, pageSize = 20 } = params;
  const query = new URLSearchParams();
  if (tag) query.append('tag', tag);
  if (keyword) query.append('keyword', keyword);
  query.append('page', String(page));
  query.append('pageSize', String(pageSize));
  return request<Page<TripTemplate>>({
    url: `/templates?${query.toString()}`,
    method: 'GET',
    skipAuth: true,
  });
}

export async function getTemplateDetail(id: string): Promise<TripTemplate> {
  return request<TripTemplate>({
    url: `/templates/${id}`,
    method: 'GET',
    skipAuth: true,
  });
}

export async function applyTemplate(id: string, params: ApplyTemplateParams): Promise<Trip> {
  return request<Trip>({
    url: `/templates/${id}/apply`,
    method: 'POST',
    data: params,
  });
}

export default {
  listTemplates,
  getTemplateDetail,
  applyTemplate,
};
