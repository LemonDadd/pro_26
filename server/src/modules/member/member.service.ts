import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { calculateUserBalances, toExpenseLike } from '@/utils/aa-calculator';
import { generateUniqueInviteCode } from '@/utils/invite-code';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';

@Injectable()
export class MemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  async list(tripId: string) {
    const memberships = await this.prisma.tripMember.findMany({
      where: { tripId, status: 'active' },
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
    });
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { expenses: { include: { splits: true } } },
    });
    const memberIds = memberships.map((m) => m.userId);
    const expenses = (trip?.expenses ?? []).map((e) => toExpenseLike(e));
    const balances = calculateUserBalances(expenses, memberIds);

    return {
      list: memberships.map((m) => {
        const b = balances.find((x) => x.userId === m.userId);
        return {
          id: m.user.id,
          nickname: m.user.nickname,
          avatar: m.user.avatar,
          role: m.role,
          joinedAt: m.joinedAt,
          stats: {
            paid: b?.paid ?? 0,
            spent: b?.shouldPay ?? 0,
            balance: b?.balance ?? 0,
          },
        };
      }),
      total: memberships.length,
    };
  }

  async add(tripId: string, dto: { nickname: string; avatar?: string }) {
    const user = await this.prisma.user.create({
      data: {
        openid: `local_${Date.now()}`,
        nickname: dto.nickname,
        avatar: dto.avatar ?? `https://i.pravatar.cc/150?u=${dto.nickname}`,
      },
    });
    await this.prisma.tripMember.create({
      data: { tripId, userId: user.id, role: 'member', status: 'active' },
    });
    await this.activityService.add(tripId, user.id, 'member_join', '加入了行程');
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      role: 'member',
    };
  }

  async remove(tripId: string, userId: string) {
    const membership = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!membership) throwBiz(ErrorCodes.MEMBER_NOT_FOUND);
    await this.prisma.tripMember.update({
      where: { tripId_userId: { tripId, userId } },
      data: { status: 'left' },
    });
    return { id: userId, status: 'left' };
  }

  async generateInviteCode(tripId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throwBiz(ErrorCodes.TRIP_NOT_FOUND);
    const code = await generateUniqueInviteCode(this.prisma);
    const updated = await this.prisma.trip.update({
      where: { id: tripId },
      data: { inviteCode: code },
    });
    return {
      inviteCode: updated.inviteCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=trip:${updated.inviteCode}`,
      expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
  }

  async joinByCode(userId: string, inviteCode: string) {
    const trip = await this.prisma.trip.findUnique({ where: { inviteCode } });
    if (!trip) throwBiz(ErrorCodes.INVITE_CODE_INVALID);

    const existing = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId: trip.id, userId } },
    });
    if (existing && existing.status === 'active') {
      throwBiz(ErrorCodes.ALREADY_MEMBER);
    }

    if (existing) {
      await this.prisma.tripMember.update({
        where: { tripId_userId: { tripId: trip.id, userId } },
        data: { status: 'active' },
      });
    } else {
      await this.prisma.tripMember.create({
        data: { tripId: trip.id, userId, role: 'member', status: 'active' },
      });
    }

    await this.activityService.add(trip.id, userId, 'member_join', '加入了行程');
    return { tripId: trip.id, title: trip.title };
  }

  async leave(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throwBiz(ErrorCodes.TRIP_NOT_FOUND);
    if (trip.leaderId === userId) {
      throwBiz(ErrorCodes.FORBIDDEN, '队长不能退出，请先转让或删除行程');
    }
    await this.prisma.tripMember.update({
      where: { tripId_userId: { tripId, userId } },
      data: { status: 'left' },
    });
    return { tripId, status: 'left' };
  }
}
