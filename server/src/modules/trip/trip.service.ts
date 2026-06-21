import { Injectable } from '@nestjs/common';
import { Trip, TripMember, TripDayPlan } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { generateUniqueInviteCode } from '@/utils/invite-code';
import {
  getTotalExpense,
  getAveragePerPerson,
  getCategoryStats,
} from '@/utils/aa-calculator';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';
import { CreateTripDto, UpdateTripDto } from './dto/trip.dto';

type UserRef = { id: string; nickname: string; avatar: string | null };
type TripMemberWithUser = TripMember & { user: UserRef };

interface TripWithRelations extends Trip {
  leader: UserRef;
  members: TripMemberWithUser[];
  dayPlans?: TripDayPlan[];
  expenses: { amount: number }[];
}

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  async create(userId: string, dto: CreateTripDto) {
    const inviteCode = await generateUniqueInviteCode(this.prisma);
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

  async list(userId: string, status?: string, page = 1, pageSize = 20) {
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
        totalExpense: getTotalExpense(t.expenses),
      })),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }

  async detail(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: this.detailInclude(),
    });
    if (!trip) throwBiz(ErrorCodes.TRIP_NOT_FOUND);
    return this.formatTrip(trip);
  }

  async update(id: string, dto: UpdateTripDto) {
    const exists = await this.prisma.trip.findUnique({ where: { id } });
    if (!exists) throwBiz(ErrorCodes.TRIP_NOT_FOUND);

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

  async remove(id: string) {
    const exists = await this.prisma.trip.findUnique({ where: { id } });
    if (!exists) throwBiz(ErrorCodes.TRIP_NOT_FOUND);
    await this.prisma.trip.delete({ where: { id } });
    return { id };
  }

  async complete(id: string) {
    const exists = await this.prisma.trip.findUnique({ where: { id } });
    if (!exists) throwBiz(ErrorCodes.TRIP_NOT_FOUND);
    const trip = await this.prisma.trip.update({
      where: { id },
      data: { status: 'completed' },
    });
    return { id: trip.id, status: trip.status };
  }

  async summary(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        expenses: true,
        members: { where: { status: 'active' } },
      },
    });
    if (!trip) throwBiz(ErrorCodes.TRIP_NOT_FOUND);

    const memberIds = trip.members.map((m) => m.userId);
    return {
      totalExpense: getTotalExpense(trip.expenses),
      avgPerPerson: getAveragePerPerson(trip.expenses, memberIds.length),
      expenseCount: trip.expenses.length,
      memberCount: memberIds.length,
      categoryStats: getCategoryStats(trip.expenses),
    };
  }

  private detailInclude() {
    return {
      leader: { select: { id: true, nickname: true, avatar: true } },
      members: {
        where: { status: 'active' },
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      },
      dayPlans: { orderBy: { day: 'asc' } },
      expenses: { select: { amount: true } },
    } as const;
  }

  private stripRelations(trip: TripWithRelations) {
    const { members, expenses, leader, ...rest } = trip;
    return rest;
  }

  private formatTrip(trip: TripWithRelations) {
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
        totalExpense: getTotalExpense(expenses),
        avgPerPerson: getAveragePerPerson(
          expenses,
          trip.members?.length ?? 0,
        ),
        expenseCount: expenses.length,
        memberCount: trip.members?.length ?? 0,
      },
    };
  }
}
