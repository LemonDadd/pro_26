import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from '@/modules/stats/stats.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { getTotalExpense } from '@/utils/aa-calculator';

@Controller('mine')
@UseGuards(JwtAuthGuard)
export class MineController {
  constructor(
    private readonly statsService: StatsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('summary')
  async summary(@CurrentUser() user: JwtPayload) {
    const stats = await this.statsService.personal(user.userId);
    const record = await this.prisma.user.findUnique({ where: { id: user.userId } });
    return {
      user: record
        ? { id: record.id, nickname: record.nickname, avatar: record.avatar }
        : null,
      stats,
    };
  }
}
