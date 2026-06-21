import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TripAccessGuard } from '@/common/guards/trip-access.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('stats/personal')
  async personal(@CurrentUser() user: JwtPayload) {
    return this.statsService.personal(user.userId);
  }

  @Get('trips/:tripId/stats/category')
  @UseGuards(TripAccessGuard)
  async category(@Param('tripId') tripId: string) {
    return this.statsService.categoryStats(tripId);
  }

  @Get('trips/:tripId/stats/my-bill')
  @UseGuards(TripAccessGuard)
  async myBill(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.statsService.myBill(tripId, user.userId);
  }

  @Get('trips/:tripId/stats/trend')
  @UseGuards(TripAccessGuard)
  async trend(
    @Param('tripId') tripId: string,
    @Query('type') type: 'day' | 'month' = 'day',
  ) {
    return this.statsService.trend(tripId, type);
  }
}
