import { Injectable } from '@nestjs/common';
import { Expense, ExpenseSplit } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  ListExpenseDto,
  SplitDto,
} from './dto/expense.dto';

const round2 = (n: number) => Number(n.toFixed(2));

type UserRef = { id: string; nickname: string; avatar: string | null };
interface ExpenseDetail extends Expense {
  payer: UserRef;
  splits: (ExpenseSplit & { user: UserRef })[];
}

@Injectable()
export class ExpenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  private buildSplits(
    amount: number,
    splitType: string,
    participants?: string[],
    splits?: SplitDto[],
  ): { userId: string; amount: number; percentage: number | null }[] {
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

  async create(tripId: string, createdBy: string, dto: CreateExpenseDto) {
    const splitType = dto.splitType ?? 'equal';
    const currency = dto.currency ?? 'CNY';
    const rate = dto.exchangeRate ?? 1;
    const originalAmount = currency === 'CNY' ? null : dto.amount;
    const cnyAmount = currency === 'CNY' ? dto.amount : round2(dto.amount * rate);
    const splits = this.buildSplits(
      cnyAmount,
      splitType,
      dto.participants,
      dto.splits,
    );

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

    await this.activityService.add(
      tripId,
      createdBy,
      'expense',
      `记了一笔：${dto.description}`,
      round2(cnyAmount),
    );

    return this.formatExpense(expense);
  }

  async list(tripId: string, query: ListExpenseDto, page = 1, pageSize = 20) {
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

  async detail(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: this.detailInclude(),
    });
    if (!expense) throwBiz(ErrorCodes.EXPENSE_NOT_FOUND);
    return this.formatExpense(expense);
  }

  async update(id: string, userId: string, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throwBiz(ErrorCodes.EXPENSE_NOT_FOUND);

    const splitType = dto.splitType ?? expense.splitType;
    let cnyAmount = expense.amount;
    let originalAmount = expense.originalAmount;
    let currency = expense.currency;
    let rate = expense.exchangeRate;

    if (dto.currency) {
      currency = dto.currency;
      rate = dto.exchangeRate ?? rate;
    }
    if (dto.amount !== undefined) {
      if (currency === 'CNY') {
        cnyAmount = dto.amount;
        originalAmount = null;
      } else {
        originalAmount = dto.amount;
        cnyAmount = round2(dto.amount * rate);
      }
    }

    if (dto.participants || dto.splits || dto.splitType) {
      await this.prisma.expenseSplit.deleteMany({ where: { expenseId: id } });
      const newSplits = this.buildSplits(
        cnyAmount,
        splitType,
        dto.participants,
        dto.splits,
      );
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

    await this.activityService.add(
      expense.tripId,
      userId,
      'expense',
      `修改了费用：${dto.description || expense.description}`,
      updated.amount,
    );

    return this.formatExpense(updated);
  }

  async remove(id: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throwBiz(ErrorCodes.EXPENSE_NOT_FOUND);
    await this.prisma.expense.delete({ where: { id } });
    await this.activityService.add(
      expense.tripId,
      userId,
      'expense',
      `删除了费用：${expense.description}`,
      -expense.amount,
    );
    return { id };
  }

  private detailInclude() {
    return {
      payer: { select: { id: true, nickname: true, avatar: true } },
      splits: {
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      },
    } as const;
  }

  private formatExpense(e: ExpenseDetail) {
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
}
