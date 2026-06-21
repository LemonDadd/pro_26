"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const activity_service_1 = require("../activity/activity.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const round2 = (n) => Number(n.toFixed(2));
let VehicleService = class VehicleService {
    constructor(prisma, activityService) {
        this.prisma = prisma;
        this.activityService = activityService;
    }
    async list(tripId) {
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
                fuelCost: round2(expenses
                    .filter((e) => e.payerId === v.ownerId)
                    .reduce((sum, e) => sum + e.amount, 0)),
            })),
            total: vehicles.length,
        };
    }
    async detail(id, userId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: { owner: { select: { id: true, nickname: true, avatar: true } } },
        });
        if (!vehicle)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.VEHICLE_NOT_FOUND);
        await this.ensureTripMember(vehicle.tripId, userId);
        return this.formatVehicle(vehicle);
    }
    async create(tripId, dto) {
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
    async update(id, userId, dto) {
        const exists = await this.prisma.vehicle.findUnique({ where: { id } });
        if (!exists)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.VEHICLE_NOT_FOUND);
        await this.ensureTripMember(exists.tripId, userId);
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
    async remove(id, userId) {
        const exists = await this.prisma.vehicle.findUnique({ where: { id } });
        if (!exists)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.VEHICLE_NOT_FOUND);
        await this.ensureTripMember(exists.tripId, userId);
        await this.prisma.vehicle.delete({ where: { id } });
        return { id };
    }
    async ensureTripMember(tripId, userId) {
        const membership = await this.prisma.tripMember.findUnique({
            where: { tripId_userId: { tripId, userId } },
        });
        if (!membership || membership.status !== 'active') {
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.FORBIDDEN, '您不是该行程的成员');
        }
    }
    async createFuelSubsidy(tripId, userId, dto) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: dto.vehicleId },
        });
        if (!vehicle)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.VEHICLE_NOT_FOUND);
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
        await this.activityService.add(tripId, userId, 'expense', `录入油费补贴 - ${vehicle.model}`, round2(dto.totalAmount));
        return { id: subsidy.id, expenseId: expense.id, totalAmount: subsidy.totalAmount };
    }
    async listFuelSubsidy(tripId) {
        const list = await this.prisma.fuelSubsidy.findMany({
            where: { tripId },
            orderBy: { createdAt: 'desc' },
            include: { vehicle: { select: { id: true, model: true, plateNumber: true } } },
        });
        return { list, total: list.length };
    }
    formatVehicle(v) {
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
};
exports.VehicleService = VehicleService;
exports.VehicleService = VehicleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_service_1.ActivityService])
], VehicleService);
//# sourceMappingURL=vehicle.service.js.map