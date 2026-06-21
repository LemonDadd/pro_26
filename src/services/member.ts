import request from './request';
import type { User, Page } from '@/types';

export interface AddMemberParams {
  nickname: string;
  avatar?: string;
}

export async function listMembers(tripId: string): Promise<Page<User>> {
  return request<Page<User>>({
    url: `/trips/${tripId}/members`,
    method: 'GET',
  });
}

export async function addMember(tripId: string, params: AddMemberParams): Promise<User> {
  return request<User>({
    url: `/trips/${tripId}/members`,
    method: 'POST',
    data: params,
  });
}

export async function removeMember(tripId: string, userId: string): Promise<void> {
  return request<void>({
    url: `/trips/${tripId}/members/${userId}`,
    method: 'DELETE',
  });
}

export async function generateInviteCode(tripId: string): Promise<{ inviteCode: string; qrCodeUrl: string; expireAt: number }> {
  return request<{ inviteCode: string; qrCodeUrl: string; expireAt: number }>({
    url: `/trips/${tripId}/invite-code`,
    method: 'POST',
  });
}

export async function joinByCode(inviteCode: string): Promise<User> {
  return request<User>({
    url: '/trips/join-by-code',
    method: 'POST',
    data: { inviteCode },
  });
}

export async function leaveTrip(tripId: string): Promise<void> {
  return request<void>({
    url: `/trips/${tripId}/leave`,
    method: 'POST',
  });
}

export default {
  listMembers,
  addMember,
  removeMember,
  generateInviteCode,
  joinByCode,
  leaveTrip,
};
