import request from './request';
import type { Trip, TripStats, Page, TripDayPlan } from '@/types';

export interface CreateTripParams {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  templateId?: string;
  days?: TripDayPlan[];
}

export interface UpdateTripParams {
  title?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  templateId?: string;
  days?: TripDayPlan[];
}

export interface ListTripsParams {
  status?: 'active' | 'completed';
  page?: number;
  pageSize?: number;
}

export async function createTrip(params: CreateTripParams): Promise<Trip> {
  return request<Trip>({
    url: '/trips',
    method: 'POST',
    data: params,
  });
}

export async function listTrips(params: ListTripsParams = {}): Promise<Page<Trip>> {
  const { status, page = 1, pageSize = 20 } = params;
  const query = new URLSearchParams();
  if (status) query.append('status', status);
  query.append('page', String(page));
  query.append('pageSize', String(pageSize));
  return request<Page<Trip>>({
    url: `/trips?${query.toString()}`,
    method: 'GET',
  });
}

export async function getTripDetail(id: string): Promise<Trip> {
  return request<Trip>({
    url: `/trips/${id}`,
    method: 'GET',
  });
}

export async function updateTrip(id: string, params: UpdateTripParams): Promise<Trip> {
  return request<Trip>({
    url: `/trips/${id}`,
    method: 'PUT',
    data: params,
  });
}

export async function deleteTrip(id: string): Promise<void> {
  return request<void>({
    url: `/trips/${id}`,
    method: 'DELETE',
  });
}

export async function completeTrip(id: string): Promise<Trip> {
  return request<Trip>({
    url: `/trips/${id}/complete`,
    method: 'POST',
  });
}

export async function getTripSummary(id: string): Promise<TripStats> {
  return request<TripStats>({
    url: `/trips/${id}/summary`,
    method: 'GET',
  });
}

export default {
  createTrip,
  listTrips,
  getTripDetail,
  updateTrip,
  deleteTrip,
  completeTrip,
  getTripSummary,
};
