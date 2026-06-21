import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import {
  calculateUserBalances,
  simplifyDebts,
  getTotalExpense,
} from '@/utils/aa-calculator';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';

interface ExpenseLike {
  amount: number;
  payerId: string;
  splitType: string;
  participants?: string[];
  splits?: { userId: string; amount?: number | null; percentage?: number | null }[];
}

@Injectable()
export class SettlementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

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

  async compute(tripId: string) {
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
    if (!trip) throwBiz(ErrorCodes.TRIP_NOT_FOUND);

    const memberIds = trip.members.map((m) => m.userId);
    const expenses = trip.expenses.map((e) => this.toExpenseLike(e));
    const balances = calculateUserBalances(expenses, memberIds);
    const plan = simplifyDebts(balances);

    const settledRecords = await this.prisma.settlement.findMany({
      where: { tripId, status: 'settled' },
    });
    const settledKeys = new Set(
      settledRecords.map((s) => `${s.fromUserId}-${s.toUserId}-${s.amount}`),
    );

    const userMap = new Map(trip.members.map((m) => [m.userId, m.user]));

    return {
      totalExpense: getTotalExpense(expenses),
      memberCount: memberIds.length,
      avgPerPerson: memberIds.length
        ? Number((getTotalExpense(expenses) / memberIds.length).toFixed(2))
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

  async settle(
    tripId: string,
    userId: string,
    data: { fromUserId: string; toUserId: string; amount: number },
  ) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throwBiz(ErrorCodes.TRIP_NOT_FOUND);

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
    } else {
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

    await this.activityService.add(
      tripId,
      userId,
      'settle',
      `标记结清一笔结算 ¥${data.amount}`,
      data.amount,
    );

    return { id: record.id, status: 'settled' };
  }

  async share(tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throwBiz(ErrorCodes.TRIP_NOT_FOUND);
    const result = await this.compute(tripId);
    const shareUrl = `https://example.com/share/trip/${tripId}`;
    return {
      shareUrl,
      imageUrl: `${shareUrl}/card`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=trip:${trip.inviteCode}`,
    };
  }
}
