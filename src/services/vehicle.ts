import request from './request';
import type { Vehicle, Page } from '@/types';

export interface CreateVehicleParams {
  plateNumber?: string;
  model: string;
  capacity?: number;
  fuelConsumption?: number;
  ownerId: string;
}

export type UpdateVehicleParams = Partial<CreateVehicleParams>;

export interface FuelSubsidyParams {
  vehicleId: string;
  fuelDate: string;
  fuelAmount: number;
  fuelPrice: number;
  totalAmount: number;
  isSplit?: boolean;
  note?: string;
}

export async function listVehicles(tripId: string): Promise<Page<Vehicle>> {
  return request<Page<Vehicle>>({
    url: `/trips/${tripId}/vehicles`,
    method: 'GET',
  });
}

export async function createVehicle(tripId: string, params: CreateVehicleParams): Promise<Vehicle> {
  return request<Vehicle>({
    url: `/trips/${tripId}/vehicles`,
    method: 'POST',
    data: params,
  });
}

export async function getVehicleDetail(id: string): Promise<Vehicle> {
  return request<Vehicle>({
    url: `/vehicles/${id}`,
    method: 'GET',
  });
}

export async function updateVehicle(id: string, params: UpdateVehicleParams): Promise<Vehicle> {
  return request<Vehicle>({
    url: `/vehicles/${id}`,
    method: 'PUT',
    data: params,
  });
}

export async function deleteVehicle(id: string): Promise<void> {
  return request<void>({
    url: `/vehicles/${id}`,
    method: 'DELETE',
  });
}

export async function addFuelSubsidy(tripId: string, params: FuelSubsidyParams): Promise<{ id: string; expenseId: string }> {
  return request<{ id: string; expenseId: string }>({
    url: `/trips/${tripId}/fuel-subsidy`,
    method: 'POST',
    data: params,
  });
}

export async function listFuelSubsidies(tripId: string): Promise<Page<{ id: string; vehicleId: string; fuelDate: string; fuelAmount: number; fuelPrice: number; totalAmount: number; note?: string }>> {
  return request<Page<{ id: string; vehicleId: string; fuelDate: string; fuelAmount: number; fuelPrice: number; totalAmount: number; note?: string }>>({
    url: `/trips/${tripId}/fuel-subsidy`,
    method: 'GET',
  });
}

export default {
  listVehicles,
  createVehicle,
  getVehicleDetail,
  updateVehicle,
  deleteVehicle,
  addFuelSubsidy,
  listFuelSubsidies,
};
