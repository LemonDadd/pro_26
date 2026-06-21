import request from './request';
import type { PersonalStats, CategoryStat, MyBill, TrendStatItem } from '@/types';

export interface CategoryStatsResult {
  totalExpense: number;
  categoryStats: CategoryStat[];
}

export async function getPersonalStats(): Promise<PersonalStats> {
  return request<PersonalStats>({
    url: '/stats/personal',
    method: 'GET',
  });
}

export async function getCategoryStats(tripId: string): Promise<CategoryStatsResult> {
  return request<CategoryStatsResult>({
    url: `/trips/${tripId}/stats/category`,
    method: 'GET',
  });
}

export async function getMyBill(tripId: string): Promise<MyBill> {
  return request<MyBill>({
    url: `/trips/${tripId}/stats/my-bill`,
    method: 'GET',
  });
}

export async function getTrendStats(tripId: string, type: 'day' | 'month' = 'day'): Promise<{ list: TrendStatItem[] }> {
  return request<{ list: TrendStatItem[] }>({
    url: `/trips/${tripId}/stats/trend?type=${type}`,
    method: 'GET',
  });
}

export async function getMineSummary(): Promise<{ user: PersonalStats & { nickname?: string }; stats: PersonalStats }> {
  return request<{ user: PersonalStats & { nickname?: string }; stats: PersonalStats }>({
    url: '/mine/summary',
    method: 'GET',
  });
}

export default {
  getPersonalStats,
  getCategoryStats,
  getMyBill,
  getTrendStats,
  getMineSummary,
};
