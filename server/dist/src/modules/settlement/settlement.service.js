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
exports.SettlementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const activity_service_1 = require("../activity/activity.service");
const aa_calculator_1 = require("../../utils/aa-calculator");
const business_exception_1 = require("../../common/exceptions/business.exception");
let SettlementService = class SettlementService {
    constructor(prisma, activityService) {
        this.prisma = prisma;
        this.activityService = activityService;
    }
    toExpenseLike(e) {
        return {
            amount: e.amount,
            payerId: e.payerId,
            splitType: e.splitType,
            participants: e.splitType === 'equal' && e.splits
                ? e.splits.map((s) => s.userId)
                : undefined,
            splits: e.splitType !== 'equal' && e.splits
                ? e.splits.map((s) => ({
                    userId: s.userId,
                    amount: s.amount,
                    percentage: s.percentage,
                }))
                : undefined,
        };
    }
    async compute(tripId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                expenses: { include: { splits: true } },
                members: {
                    where: { status: 'active' },
                    include: { user: { select: { id: true, nickname: true, avatar: true } } },
                },
            },
        });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        const memberIds = trip.members.map((m) => m.userId);
        const expenses = trip.expenses.map((e) => this.toExpenseLike(e));
        const balances = (0, aa_calculator_1.calculateUserBalances)(expenses, memberIds);
        const plan = (0, aa_calculator_1.simplifyDebts)(balances);
        const settledRecords = await this.prisma.settlement.findMany({
            where: { tripId, status: 'settled' },
        });
        const settledKeys = new Set(settledRecords.map((s) => `${s.fromUserId}-${s.toUserId}-${s.amount}`));
        const userMap = new Map(trip.members.map((m) => [m.userId, m.user]));
        return {
            totalExpense: (0, aa_calculator_1.getTotalExpense)(expenses),
            memberCount: memberIds.length,
            avgPerPerson: memberIds.length
                ? Number(((0, aa_calculator_1.getTotalExpense)(expenses) / memberIds.length).toFixed(2))
                : 0,
            userBalances: balances.map((b) => ({
                userId: b.userId,
                user: userMap.get(b.userId),
                paid: b.paid,
                shouldPay: b.shouldPay,
                balance: b.balance,
            })),
            settlements: plan.map((s, index) => {
                const key = `${s.fromUserId}-${s.toUserId}-${s.amount}`;
                return {
                    id: `plan_${index}_${key}`,
                    fromUserId: s.fromUserId,
                    fromUser: userMap.get(s.fromUserId),
                    toUserId: s.toUserId,
                    toUser: userMap.get(s.toUserId),
                    amount: s.amount,
                    status: settledKeys.has(key) ? 'settled' : 'pending',
                };
            }),
        };
    }
    async settle(tripId, userId, data) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        const existing = await this.prisma.settlement.findFirst({
            where: {
                tripId,
                fromUserId: data.fromUserId,
                toUserId: data.toUserId,
                amount: data.amount,
            },
        });
        let record;
        if (existing) {
            record = await this.prisma.settlement.update({
                where: { id: existing.id },
                data: { status: 'settled', settledAt: new Date(), settledBy: userId },
            });
        }
        else {
            record = await this.prisma.settlement.create({
                data: {
                    tripId,
                    fromUserId: data.fromUserId,
                    toUserId: data.toUserId,
                    amount: data.amount,
                    status: 'settled',
                    settledAt: new Date(),
                    settledBy: userId,
                },
            });
        }
        await this.activityService.add(tripId, userId, 'settle', `标记结清一笔结算 ¥${data.amount}`, data.amount);
        return { id: record.id, status: 'settled' };
    }
    async share(tripId) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        const result = await this.compute(tripId);
        const shareUrl = `https://example.com/share/trip/${tripId}`;
        return {
            shareUrl,
            imageUrl: `${shareUrl}/card`,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=trip:${trip.inviteCode}`,
        };
    }
};
exports.SettlementService = SettlementService;
exports.SettlementService = SettlementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_service_1.ActivityService])
], SettlementService);
//# sourceMappingURL=settlement.service.js.map