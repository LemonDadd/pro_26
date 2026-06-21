import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async add(
    tripId: string,
    userId: string,
    type: string,
    content: string,
    amount?: number,
    metadata?: Record<string, any>,
  ) {
    return this.prisma.activity.create({
      data: {
        tripId,
        userId,
        type,
        content,
        amount,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  async listByTrip(
    tripId: string,
    options: { type?: string; page: number; pageSize: number },
  ) {
    const { type, page, pageSize } = options;
    const where = { tripId, ...(type ? { type } : {}) };
    const [list, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
      }),
      this.prisma.activity.count({ where }),
    ]);
    return {
      list: list.map((a) => ({
        ...a,
        amount: a.amount ?? undefined,
        metadata: a.metadata ? JSON.parse(a.metadata) : undefined,
      })),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }
}
