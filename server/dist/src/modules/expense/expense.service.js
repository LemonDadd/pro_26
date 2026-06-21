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
exports.ExpenseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const activity_service_1 = require("../activity/activity.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const round2 = (n) => Number(n.toFixed(2));
let ExpenseService = class ExpenseService {
    constructor(prisma, activityService) {
        this.prisma = prisma;
        this.activityService = activityService;
    }
    buildSplits(amount, splitType, participants, splits) {
        if (splitType === 'equal' && participants && participants.length) {
            const per = amount / participants.length;
            return participants.map((userId) => ({
                userId,
                amount: round2(per),
                percentage: null,
            }));
        }
        if (splitType === 'percentage' && splits) {
            return splits.map((s) => ({
                userId: s.userId,
                amount: round2(amount * ((s.percentage ?? 0) / 100)),
                percentage: s.percentage ?? null,
            }));
        }
        if (splitType === 'custom' && splits) {
            return splits.map((s) => ({
                userId: s.userId,
                amount: round2(s.amount ?? 0),
                percentage: null,
            }));
        }
        return [];
    }
    async create(tripId, createdBy, dto) {
        const splitType = dto.splitType ?? 'equal';
        const currency = dto.currency ?? 'CNY';
        const rate = dto.exchangeRate ?? 1;
        const originalAmount = currency === 'CNY' ? null : dto.amount;
        const cnyAmount = currency === 'CNY' ? dto.amount : round2(dto.amount * rate);
        const splits = this.buildSplits(cnyAmount, splitType, dto.participants, dto.splits);
        const expense = await this.prisma.expense.create({
            data: {
                tripId,
                amount: round2(cnyAmount),
                category: dto.category,
                description: dto.description,
                payerId: dto.payerId,
                splitType,
                currency,
                exchangeRate: rate,
                originalAmount,
                note: dto.note,
                receiptUrl: dto.receiptImage,
                createdBy,
                splits: { create: splits },
            },
            include: this.detailInclude(),
        });
        await this.activityService.add(tripId, createdBy, 'expense', `记了一笔：${dto.description}`, round2(cnyAmount));
        return this.formatExpense(expense);
    }
    async list(tripId, query, page = 1, pageSize = 20) {
        const where = {
            tripId,
            ...(query.category ? { category: query.category } : {}),
            ...(query.payerId ? { payerId: query.payerId } : {}),
            ...(query.startDate || query.endDate
                ? {
                    createdAt: {
                        ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
                        ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
                    },
                }
                : {}),
            ...(query.keyword ? { description: { contains: query.keyword } } : {}),
        };
        const [list, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: this.detailInclude(),
            }),
            this.prisma.expense.count({ where }),
        ]);
        return {
            list: list.map((e) => this.formatExpense(e)),
            total,
            page,
            pageSize,
            hasMore: page * pageSize < total,
        };
    }
    async detail(id, userId) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
            include: this.detailInclude(),
        });
        if (!expense)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.EXPENSE_NOT_FOUND);
        await this.ensureTripMember(expense.tripId, userId);
        return this.formatExpense(expense);
    }
    async update(id, userId, dto) {
        const expense = await this.prisma.expense.findUnique({ where: { id } });
        if (!expense)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.EXPENSE_NOT_FOUND);
        await this.ensureTripMember(expense.tripId, userId);
        const splitType = dto.splitType ?? expense.splitType;
        const currency = dto.currency ?? expense.currency;
        const rate = dto.exchangeRate ?? expense.exchangeRate;
        const baseAmount = dto.amount !== undefined
            ? dto.amount
            : currency === 'CNY'
                ? expense.amount
                : (expense.originalAmount ?? expense.amount);
        let cnyAmount;
        let originalAmount;
        if (currency === 'CNY') {
            cnyAmount = round2(baseAmount);
            originalAmount = null;
        }
        else {
            originalAmount = round2(baseAmount);
            cnyAmount = round2(baseAmount * rate);
        }
        if (dto.participants || dto.splits || dto.splitType) {
            await this.prisma.expenseSplit.deleteMany({ where: { expenseId: id } });
            const newSplits = this.buildSplits(cnyAmount, splitType, dto.participants, dto.splits);
            if (newSplits.length) {
                await this.prisma.expenseSplit.createMany({
                    data: newSplits.map((s) => ({ expenseId: id, ...s })),
                });
            }
        }
        const updated = await this.prisma.expense.update({
            where: { id },
            data: {
                amount: round2(cnyAmount),
                category: dto.category,
                description: dto.description,
                payerId: dto.payerId,
                splitType,
                currency,
                exchangeRate: rate,
                originalAmount,
                note: dto.note,
                receiptUrl: dto.receiptImage,
            },
            include: this.detailInclude(),
        });
        await this.activityService.add(expense.tripId, userId, 'expense', `修改了费用：${dto.description || expense.description}`, updated.amount);
        return this.formatExpense(updated);
    }
    async remove(id, userId) {
        const expense = await this.prisma.expense.findUnique({ where: { id } });
        if (!expense)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.EXPENSE_NOT_FOUND);
        await this.ensureTripMember(expense.tripId, userId);
        await this.prisma.expense.delete({ where: { id } });
        await this.activityService.add(expense.tripId, userId, 'expense', `删除了费用：${expense.description}`, expense.amount);
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
    detailInclude() {
        return {
            payer: { select: { id: true, nickname: true, avatar: true } },
            splits: {
                include: { user: { select: { id: true, nickname: true, avatar: true } } },
            },
        };
    }
    formatExpense(e) {
        return {
            id: e.id,
            tripId: e.tripId,
            amount: e.amount,
            category: e.category,
            description: e.description,
            payerId: e.payerId,
            splitType: e.splitType,
            currency: e.currency,
            exchangeRate: e.exchangeRate,
            originalAmount: e.originalAmount,
            note: e.note,
            receiptUrl: e.receiptUrl,
            createdBy: e.createdBy,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
            payer: e.payer,
            participants: (e.splits ?? []).map((s) => ({
                id: s.userId,
                nickname: s.user?.nickname,
                avatar: s.user?.avatar,
                splitAmount: s.amount,
                ...(s.percentage != null ? { percentage: s.percentage } : {}),
            })),
        };
    }
};
exports.ExpenseService = ExpenseService;
exports.ExpenseService = ExpenseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_service_1.ActivityService])
], ExpenseService);
//# sourceMappingURL=expense.service.js.map