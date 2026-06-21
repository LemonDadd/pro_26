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
exports.TripService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const activity_service_1 = require("../activity/activity.service");
const invite_code_1 = require("../../utils/invite-code");
const aa_calculator_1 = require("../../utils/aa-calculator");
const business_exception_1 = require("../../common/exceptions/business.exception");
let TripService = class TripService {
    constructor(prisma, activityService) {
        this.prisma = prisma;
        this.activityService = activityService;
    }
    async create(userId, dto) {
        const inviteCode = await (0, invite_code_1.generateUniqueInviteCode)(this.prisma);
        const trip = await this.prisma.trip.create({
            data: {
                title: dto.title,
                destination: dto.destination,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                leaderId: userId,
                templateId: dto.templateId,
                inviteCode,
                members: {
                    create: { userId, role: 'leader', status: 'active' },
                },
                dayPlans: dto.days?.length
                    ? {
                        create: dto.days.map((d) => ({
                            day: d.day,
                            date: d.date ? new Date(d.date) : null,
                            destination: d.destination,
                            description: d.description,
                        })),
                    }
                    : undefined,
            },
            include: this.detailInclude(),
        });
        await this.activityService.add(trip.id, userId, 'member_join', '创建了行程');
        return this.formatTrip(trip);
    }
    async list(userId, status, page = 1, pageSize = 20) {
        const where = {
            members: { some: { userId, status: 'active' } },
            ...(status ? { status } : {}),
        };
        const [list, total] = await Promise.all([
            this.prisma.trip.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    leader: { select: { id: true, nickname: true, avatar: true } },
                    members: {
                        include: { user: { select: { id: true, nickname: true, avatar: true } } },
                    },
                    expenses: { select: { amount: true } },
                },
            }),
            this.prisma.trip.count({ where }),
        ]);
        return {
            list: list.map((t) => ({
                ...this.stripRelations(t),
                totalExpense: (0, aa_calculator_1.getTotalExpense)(t.expenses),
            })),
            total,
            page,
            pageSize,
            hasMore: page * pageSize < total,
        };
    }
    async detail(id) {
        const trip = await this.prisma.trip.findUnique({
            where: { id },
            include: this.detailInclude(),
        });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        return this.formatTrip(trip);
    }
    async update(id, dto) {
        const exists = await this.prisma.trip.findUnique({ where: { id } });
        if (!exists)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        if (dto.days) {
            await this.prisma.tripDayPlan.deleteMany({ where: { tripId: id } });
            if (dto.days.length) {
                await this.prisma.tripDayPlan.createMany({
                    data: dto.days.map((d) => ({
                        tripId: id,
                        day: d.day,
                        date: d.date ? new Date(d.date) : null,
                        destination: d.destination,
                        description: d.description,
                    })),
                });
            }
        }
        const trip = await this.prisma.trip.update({
            where: { id },
            data: {
                title: dto.title,
                destination: dto.destination,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            },
            include: this.detailInclude(),
        });
        return this.formatTrip(trip);
    }
    async remove(id) {
        const exists = await this.prisma.trip.findUnique({ where: { id } });
        if (!exists)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        await this.prisma.trip.delete({ where: { id } });
        return { id };
    }
    async complete(id) {
        const exists = await this.prisma.trip.findUnique({ where: { id } });
        if (!exists)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        const trip = await this.prisma.trip.update({
            where: { id },
            data: { status: 'completed' },
        });
        return { id: trip.id, status: trip.status };
    }
    async summary(tripId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                expenses: true,
                members: { where: { status: 'active' } },
            },
        });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        const memberIds = trip.members.map((m) => m.userId);
        return {
            totalExpense: (0, aa_calculator_1.getTotalExpense)(trip.expenses),
            avgPerPerson: (0, aa_calculator_1.getAveragePerPerson)(trip.expenses, memberIds.length),
            expenseCount: trip.expenses.length,
            memberCount: memberIds.length,
            categoryStats: (0, aa_calculator_1.getCategoryStats)(trip.expenses),
        };
    }
    detailInclude() {
        return {
            leader: { select: { id: true, nickname: true, avatar: true } },
            members: {
                where: { status: 'active' },
                include: { user: { select: { id: true, nickname: true, avatar: true } } },
            },
            dayPlans: { orderBy: { day: 'asc' } },
            expenses: { select: { amount: true } },
        };
    }
    stripRelations(trip) {
        const { members, expenses, leader, ...rest } = trip;
        return rest;
    }
    formatTrip(trip) {
        const expenses = trip.expenses ?? [];
        return {
            id: trip.id,
            title: trip.title,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            leaderId: trip.leaderId,
            status: trip.status,
            templateId: trip.templateId,
            inviteCode: trip.inviteCode,
            createdAt: trip.createdAt,
            updatedAt: trip.updatedAt,
            leader: trip.leader,
            members: (trip.members ?? []).map((m) => ({
                id: m.user.id,
                nickname: m.user.nickname,
                avatar: m.user.avatar,
                role: m.role,
                joinedAt: m.joinedAt,
            })),
            days: (trip.dayPlans ?? []).map((d) => ({
                id: d.id,
                day: d.day,
                date: d.date,
                destination: d.destination,
                description: d.description,
            })),
            stats: {
                totalExpense: (0, aa_calculator_1.getTotalExpense)(expenses),
                expenseCount: expenses.length,
                memberCount: trip.members?.length ?? 0,
            },
        };
    }
};
exports.TripService = TripService;
exports.TripService = TripService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_service_1.ActivityService])
], TripService);
//# sourceMappingURL=trip.service.js.map