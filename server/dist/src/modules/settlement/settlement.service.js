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
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const activity_service_1 = require("../activity/activity.service");
const aa_calculator_1 = require("../../utils/aa-calculator");
const business_exception_1 = require("../../common/exceptions/business.exception");
let SettlementService = class SettlementService {
    constructor(prisma, activityService, configService) {
        this.prisma = prisma;
        this.activityService = activityService;
        this.configService = configService;
    }
    makePlanId(tripId, index, fromUserId, toUserId, amount) {
        return `plan:${tripId}:${index}:${fromUserId}-${toUserId}-${amount}`;
    }
    parsePlanId(id) {
        if (id.startsWith('plan:')) {
            const parts = id.slice(5).split(':');
            if (parts.length >= 3) {
                const tripId = parts[0];
                const tail = parts[parts.length - 1];
                const match = tail.match(/^(.+?)-(.+?)-(.+)$/);
                if (match) {
                    return {
                        tripId,
                        fromUserId: match[1],
                        toUserId: match[2],
                        amount: Number(match[3]),
                        isPlan: true,
                    };
                }
            }
        }
        return { tripId: '', fromUserId: '', toUserId: '', amount: 0, isPlan: false };
    }
    async ensureTripMember(tripId, userId) {
        if (!tripId)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        const membership = await this.prisma.tripMember.findUnique({
            where: { tripId_userId: { tripId, userId } },
        });
        if (!membership || membership.status !== 'active') {
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.FORBIDDEN, '您不是该行程的成员');
        }
        return trip;
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
        const expenses = trip.expenses.map((e) => (0, aa_calculator_1.toExpenseLike)(e));
        const balances = (0, aa_calculator_1.calculateUserBalances)(expenses, memberIds);
        const plan = (0, aa_calculator_1.simplifyDebts)(balances);
        const settledRecords = await this.prisma.settlement.findMany({
            where: { tripId, status: 'settled' },
        });
        const settledKeys = new Set(settledRecords.map((s) => `${s.fromUserId}-${s.toUserId}-${s.amount}`));
        const settledIdMap = new Map(settledRecords.map((s) => [`${s.fromUserId}-${s.toUserId}-${s.amount}`, s.id]));
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
                const settled = settledKeys.has(key);
                const dbId = settledIdMap.get(key);
                return {
                    id: dbId ?? this.makePlanId(tripId, index, s.fromUserId, s.toUserId, s.amount),
                    fromUserId: s.fromUserId,
                    fromUser: userMap.get(s.fromUserId),
                    toUserId: s.toUserId,
                    toUser: userMap.get(s.toUserId),
                    amount: s.amount,
                    status: settled ? 'settled' : 'pending',
                    settledAt: settled
                        ? settledRecords.find((r) => r.id === dbId)?.settledAt?.getTime() ?? null
                        : null,
                };
            }),
        };
    }
    async settle(id, userId) {
        let tripId;
        let fromUserId;
        let toUserId;
        let amount;
        const parsed = this.parsePlanId(id);
        if (parsed.isPlan) {
            tripId = parsed.tripId;
            fromUserId = parsed.fromUserId;
            toUserId = parsed.toUserId;
            amount = parsed.amount;
        }
        else {
            const record = await this.prisma.settlement.findUnique({ where: { id } });
            if (!record)
                (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
            tripId = record.tripId;
            fromUserId = record.fromUserId;
            toUserId = record.toUserId;
            amount = record.amount;
        }
        await this.ensureTripMember(tripId, userId);
        const existing = await this.prisma.settlement.findFirst({
            where: { tripId, fromUserId, toUserId, amount },
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
                    fromUserId,
                    toUserId,
                    amount,
                    status: 'settled',
                    settledAt: new Date(),
                    settledBy: userId,
                },
            });
        }
        await this.activityService.add(tripId, userId, 'settle', `标记结清一笔结算 ¥${amount}`, amount);
        return { id: record.id, status: 'settled' };
    }
    async share(tripId) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        const frontendBase = this.configService.get('FRONTEND_BASE_URL') ||
            'http://localhost:10086';
        const base = frontendBase.replace(/\/$/, '');
        const shareUrl = `${base}/#/pages/settlement/share?tripId=${tripId}&code=${trip.inviteCode}`;
        const imageUrl = `${base}/#/pages/settlement/share-card?tripId=${tripId}`;
        return {
            shareUrl,
            imageUrl,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`,
        };
    }
};
exports.SettlementService = SettlementService;
exports.SettlementService = SettlementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_service_1.ActivityService,
        config_1.ConfigService])
], SettlementService);
//# sourceMappingURL=settlement.service.js.map