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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const aa_calculator_1 = require("../../utils/aa-calculator");
let StatsService = class StatsService {
    constructor(prisma) {
        this.prisma = prisma;
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
    async personal(userId) {
        const memberships = await this.prisma.tripMember.findMany({
            where: { userId, status: 'active' },
            select: {
                trip: {
                    include: { expenses: { select: { amount: true, createdAt: true } } },
                },
            },
        });
        const trips = memberships.map((m) => m.trip);
        const totalExpense = trips.reduce((sum, t) => sum + (0, aa_calculator_1.getTotalExpense)(t.expenses), 0);
        const totalExpenseCount = trips.reduce((sum, t) => sum + t.expenses.length, 0);
        const activeTrips = trips.filter((t) => t.status === 'active').length;
        return {
            totalTrips: trips.length,
            totalExpense: Number(totalExpense.toFixed(2)),
            totalExpenseCount,
            activeTrips,
        };
    }
    async categoryStats(tripId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: { expenses: true, members: { where: { status: 'active' } } },
        });
        if (!trip)
            return null;
        const total = (0, aa_calculator_1.getTotalExpense)(trip.expenses);
        const stats = (0, aa_calculator_1.getCategoryStats)(trip.expenses);
        return {
            totalExpense: total,
            categoryStats: stats.map((s) => ({
                ...s,
                percent: total > 0 ? Number(((s.amount / total) * 100).toFixed(1)) : 0,
            })),
        };
    }
    async myBill(tripId, userId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                expenses: { include: { splits: true } },
                members: { where: { status: 'active' }, select: { userId: true } },
            },
        });
        if (!trip)
            return null;
        const memberIds = trip.members.map((m) => m.userId);
        const expenses = trip.expenses.map((e) => this.toExpenseLike(e));
        const balances = (0, aa_calculator_1.calculateUserBalances)(expenses, memberIds);
        const mine = balances.find((b) => b.userId === userId);
        const paidExpenses = trip.expenses
            .filter((e) => e.payerId === userId)
            .map((e) => ({ id: e.id, amount: e.amount, description: e.description, category: e.category }));
        const participatedExpenses = trip.expenses
            .filter((e) => e.splits.some((s) => s.userId === userId))
            .map((e) => ({ id: e.id, amount: e.amount, description: e.description, category: e.category }));
        return {
            userId,
            paid: mine?.paid ?? 0,
            shouldPay: mine?.shouldPay ?? 0,
            balance: mine?.balance ?? 0,
            paidExpenses,
            participatedExpenses,
        };
    }
    async trend(tripId, type = 'day') {
        const expenses = await this.prisma.expense.findMany({
            where: { tripId },
            orderBy: { createdAt: 'asc' },
            select: { amount: true, createdAt: true },
        });
        const map = new Map();
        expenses.forEach((e) => {
            const d = new Date(e.createdAt);
            const key = type === 'day'
                ? d.toISOString().slice(0, 10)
                : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!map.has(key))
                map.set(key, { amount: 0, count: 0 });
            const item = map.get(key);
            item.amount += e.amount;
            item.count += 1;
        });
        return {
            list: Array.from(map.entries()).map(([date, v]) => ({
                date,
                amount: Number(v.amount.toFixed(2)),
                count: v.count,
            })),
        };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map