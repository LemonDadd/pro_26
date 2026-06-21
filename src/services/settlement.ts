import request from './request';
import type { SettlementPlan, SettlementItem } from '@/types';

export async function getSettlementPlan(tripId: string): Promise<SettlementPlan> {
  return request<SettlementPlan>({
    url: `/trips/${tripId}/settlements`,
    method: 'GET',
  });
}

export async function markSettled(settlementId: string): Promise<SettlementItem> {
  return request<SettlementItem>({
    url: `/settlements/${settlementId}/settle`,
    method: 'POST',
  });
}

export async function shareSettlement(tripId: string): Promise<{ shareUrl: string; imageUrl: string; qrCodeUrl: string }> {
  return request<{ shareUrl: string; imageUrl: string; qrCodeUrl: string }>({
    url: `/trips/${tripId}/settlement/share`,
    method: 'POST',
  });
}

export default {
  getSettlementPlan,
  markSettled,
  shareSettlement,
};
