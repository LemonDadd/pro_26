import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { generateInviteCode } from '@/utils/aa-calculator';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';
import { ApplyTemplateDto } from '@/modules/trip/dto/trip.dto';

@Injectable()
export class TemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  async list(query: { tag?: string; keyword?: string; page: number; pageSize: number }) {
    const { tag, keyword, page, pageSize } = query;
    const where = {
      isPublic: true,
      ...(keyword ? { name: { contains: keyword } } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.tripTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.tripTemplate.count({ where }),
    ]);

    const list = rows.map((t) => this.format(t)).filter((t) => {
      if (!tag) return true;
      return t.tags.includes(tag);
    });

    return { list, total, page, pageSize, hasMore: page * pageSize < total };
  }

  async detail(id: string) {
    const tpl = await this.prisma.tripTemplate.findUnique({ where: { id } });
    if (!tpl) throwBiz(ErrorCodes.NOT_FOUND, '模板不存在');
    return this.format(tpl);
  }

  async apply(id: string, userId: string, dto: ApplyTemplateDto) {
    const tpl = await this.prisma.tripTemplate.findUnique({ where: { id } });
    if (!tpl) throwBiz(ErrorCodes.NOT_FOUND, '模板不存在');

    const sampleDays: any[] = tpl.sampleDays ? JSON.parse(tpl.sampleDays) : [];
    const title = dto.title || `${tpl.name}之旅`;

    const trip = await this.prisma.trip.create({
      data: {
        title,
        destination: dto.destination || tpl.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        leaderId: userId,
        templateId: tpl.id,
        inviteCode: generateInviteCode(),
        members: { create: { userId, role: 'leader', status: 'active' } },
        dayPlans: sampleDays.length
          ? {
              create: sampleDays.map((d: any) => ({
                day: d.day,
                destination: d.destination,
                description: d.description,
              })),
            }
          : undefined,
      },
    });

    await this.activityService.add(trip.id, userId, 'member_join', '创建了行程');
    return { tripId: trip.id, title: trip.title };
  }

  private format(t: any) {
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      cover: t.cover,
      estimatedDays: t.estimatedDays,
      estimatedBudget: t.estimatedBudget,
      categories: t.categories ? JSON.parse(t.categories) : [],
      tags: t.tags ? JSON.parse(t.tags) : [],
      sampleDays: t.sampleDays ? JSON.parse(t.sampleDays) : [],
      isPublic: t.isPublic,
    };
  }
}
