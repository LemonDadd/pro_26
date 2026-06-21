import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  getTotalExpense,
  getAveragePerPerson,
  getCategoryStats,
  calculateUserBalances,
} from '@/utils/aa-calculator';

interface ExpenseLike {
  amount: number;
  payerId: string;
  splitType: string;
  participants?: string[];
  splits?: { userId: string; amount?: number | null; percentage?: number | null }[];
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  private toExpenseLike(e: any): ExpenseLike {
    return {
      amount: e.amount,
      payerId: e.payerId,
      splitType: e.splitType,
      participants:
        e.splitType === 'equal' && e.splits
          ? e.splits.map((s: any) => s.userId)
          : undefined,
      splits:
        e.splitType !== 'equal' && e.splits
          ? e.splits.map((s: any) => ({
              userId: s.userId,
              amount: s.amount,
              percentage: s.percentage,
            }))
          : undefined,
    };
  }

  async personal(userId: string) {
    const memberships = await this.prisma.tripMember.findMany({
      where: { userId, status: 'active' },
      select: {
        trip: {
          include: { expenses: { select: { amount: true, createdAt: true } } },
        },
      },
    });
    const trips = memberships.map((m) => m.trip);
    const totalExpense = trips.reduce(
      (sum, t) => sum + getTotalExpense(t.expenses),
      0,
    );
    const totalExpenseCount = trips.reduce(
      (sum, t) => sum + t.expenses.length,
      0,
    );
    const activeTrips = trips.filter((t) => t.status === 'active').length;
    return {
      totalTrips: trips.length,
      totalExpense: Number(totalExpense.toFixed(2)),
      totalExpenseCount,
      activeTrips,
    };
  }

  async categoryStats(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { expenses: true, members: { where: { status: 'active' } } },
    });
    if (!trip) return null;
    const total = getTotalExpense(trip.expenses);
    const stats = getCategoryStats(trip.expenses);
    return {
      totalExpense: total,
      categoryStats: stats.map((s) => ({
        ...s,
        percent: total > 0 ? Number(((s.amount / total) * 100).toFixed(1)) : 0,
      })),
    };
  }

  async myBill(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        expenses: { include: { splits: true } },
        members: { where: { status: 'active' }, select: { userId: true } },
      },
    });
    if (!trip) return null;
    const memberIds = trip.members.map((m) => m.userId);
    const expenses = trip.expenses.map((e) => this.toExpenseLike(e));
    const balances = calculateUserBalances(expenses, memberIds);
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

  async trend(tripId: string, type: 'day' | 'month' = 'day') {
    const expenses = await this.prisma.expense.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
      select: { amount: true, createdAt: true },
    });
    const map = new Map<string, { amount: number; count: number }>();
    expenses.forEach((e) => {
      const d = new Date(e.createdAt);
      const key =
        type === 'day'
          ? d.toISOString().slice(0, 10)
          : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { amount: 0, count: 0 });
      const item = map.get(key)!;
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
}
