import { Injectable } from '@nestjs/common';
import { Vehicle } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  CreateFuelSubsidyDto,
} from './dto/vehicle.dto';

const round2 = (n: number) => Number(n.toFixed(2));

type UserRef = { id: string; nickname: string; avatar: string | null };
interface VehicleWithOwner extends Vehicle {
  owner: UserRef;
}

@Injectable()
export class VehicleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  async list(tripId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { tripId },
      include: {
        owner: { select: { id: true, nickname: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    const expenses = await this.prisma.expense.findMany({
      where: { tripId, category: 'fuel' },
      select: { payerId: true, amount: true },
    });

    return {
      list: vehicles.map((v) => ({
        ...this.formatVehicle(v),
        fuelCost: round2(
          expenses
            .filter((e) => e.payerId === v.ownerId)
            .reduce((sum, e) => sum + e.amount, 0),
        ),
      })),
      total: vehicles.length,
    };
  }

  async detail(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { owner: { select: { id: true, nickname: true, avatar: true } } },
    });
    if (!vehicle) throwBiz(ErrorCodes.VEHICLE_NOT_FOUND);
    return this.formatVehicle(vehicle);
  }

  async create(tripId: string, dto: CreateVehicleDto) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        tripId,
        plateNumber: dto.plateNumber,
        model: dto.model,
        capacity: dto.capacity ?? 5,
        fuelConsumption: dto.fuelConsumption,
        ownerId: dto.ownerId,
      },
      include: { owner: { select: { id: true, nickname: true, avatar: true } } },
    });
    return this.formatVehicle(vehicle);
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const exists = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!exists) throwBiz(ErrorCodes.VEHICLE_NOT_FOUND);
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        plateNumber: dto.plateNumber,
        model: dto.model,
        capacity: dto.capacity,
        fuelConsumption: dto.fuelConsumption,
      },
      include: { owner: { select: { id: true, nickname: true, avatar: true } } },
    });
    return this.formatVehicle(vehicle);
  }

  async remove(id: string) {
    const exists = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!exists) throwBiz(ErrorCodes.VEHICLE_NOT_FOUND);
    await this.prisma.vehicle.delete({ where: { id } });
    return { id };
  }

  async createFuelSubsidy(tripId: string, userId: string, dto: CreateFuelSubsidyDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });
    if (!vehicle) throwBiz(ErrorCodes.VEHICLE_NOT_FOUND);

    const isSplit = dto.isSplit ?? true;
    const payerId = vehicle.ownerId;
    const members = await this.prisma.tripMember.findMany({
      where: { tripId, status: 'active' },
      select: { userId: true },
    });
    const participants = isSplit
      ? members.map((m) => m.userId)
      : [payerId];

    const expense = await this.prisma.expense.create({
      data: {
        tripId,
        amount: round2(dto.totalAmount),
        category: 'fuel',
        description: `油费补贴 - ${vehicle.model}`,
        payerId,
        splitType: 'equal',
        currency: 'CNY',
        exchangeRate: 1,
        note: dto.note,
        createdBy: userId,
        splits: {
          create: participants.map((u) => ({
            userId: u,
            amount: round2(dto.totalAmount / participants.length),
            percentage: null,
          })),
        },
      },
    });

    const subsidy = await this.prisma.fuelSubsidy.create({
      data: {
        tripId,
        vehicleId: dto.vehicleId,
        fuelDate: new Date(dto.fuelDate),
        fuelAmount: dto.fuelAmount,
        fuelPrice: dto.fuelPrice,
        totalAmount: round2(dto.totalAmount),
        isSplit,
        expenseId: expense.id,
        note: dto.note,
      },
    });

    await this.activityService.add(
      tripId,
      userId,
      'expense',
      `录入油费补贴 - ${vehicle.model}`,
      round2(dto.totalAmount),
    );

    return { id: subsidy.id, expenseId: expense.id, totalAmount: subsidy.totalAmount };
  }

  async listFuelSubsidy(tripId: string) {
    const list = await this.prisma.fuelSubsidy.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
      include: { vehicle: { select: { id: true, model: true, plateNumber: true } } },
    });
    return { list, total: list.length };
  }

  private formatVehicle(v: VehicleWithOwner) {
    return {
      id: v.id,
      tripId: v.tripId,
      plateNumber: v.plateNumber,
      model: v.model,
      capacity: v.capacity,
      fuelConsumption: v.fuelConsumption,
      ownerId: v.ownerId,
      owner: v.owner,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  }
}
