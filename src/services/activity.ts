import request from './request';
import type { Activity, Page } from '@/types';

export interface ListActivitiesParams {
  tripId: string;
  type?: 'expense' | 'member_join' | 'settle';
  page?: number;
  pageSize?: number;
}

export async function listActivities(params: ListActivitiesParams): Promise<Page<Activity>> {
  const { tripId, type, page = 1, pageSize = 20 } = params;
  const query = new URLSearchParams();
  if (type) query.append('type', type);
  query.append('page', String(page));
  query.append('pageSize', String(pageSize));
  return request<Page<Activity>>({
    url: `/trips/${tripId}/activities?${query.toString()}`,
    method: 'GET',
  });
}

export default {
  listActivities,
};
