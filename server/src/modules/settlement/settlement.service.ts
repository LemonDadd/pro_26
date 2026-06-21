import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
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

  private makePlanId(
    tripId: string,
    index: number,
    fromUserId: string,
    toUserId: string,
    amount: number,
  ) {
    return `plan:${tripId}:${index}:${fromUserId}-${toUserId}-${amount}`;
  }

  private parsePlanId(id: string): {
    tripId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    isPlan: boolean;
  } {
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

  private async ensureTripMember(tripId: string, userId: string) {
    if (!tripId) throwBiz(ErrorCodes.TRIP_NOT_FOUND);
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throwBiz(ErrorCodes.TRIP_NOT_FOUND);
    const membership = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!membership || membership.status !== 'active') {
      throwBiz(ErrorCodes.FORBIDDEN, '您不是该行程的成员');
    }
    return trip;
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
    const settledIdMap = new Map(
      settledRecords.map((s) => [`${s.fromUserId}-${s.toUserId}-${s.amount}`, s.id]),
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

  async settle(id: string, userId: string) {
    let tripId: string;
    let fromUserId: string;
    let toUserId: string;
    let amount: number;

    const parsed = this.parsePlanId(id);
    if (parsed.isPlan) {
      tripId = parsed.tripId;
      fromUserId = parsed.fromUserId;
      toUserId = parsed.toUserId;
      amount = parsed.amount;
    } else {
      const record = await this.prisma.settlement.findUnique({ where: { id } });
      if (!record) throwBiz(ErrorCodes.TRIP_NOT_FOUND);
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
    } else {
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

    await this.activityService.add(
      tripId,
      userId,
      'settle',
      `标记结清一笔结算 ¥${amount}`,
      amount,
    );

    return { id: record.id, status: 'settled' };
  }

  async share(tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throwBiz(ErrorCodes.TRIP_NOT_FOUND);

    const frontendBase =
      this.configService.get<string>('FRONTEND_BASE_URL') ||
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
}
