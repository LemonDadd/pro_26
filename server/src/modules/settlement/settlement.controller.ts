import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TripAccessGuard } from '@/common/guards/trip-access.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @UseGuards(TripAccessGuard)
  @Get('trips/:tripId/settlements')
  async compute(@Param('tripId') tripId: string) {
    return this.settlementService.compute(tripId);
  }

  @Post('settlements/:id/settle')
  async settle(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.settlementService.settle(id, user.userId);
  }

  @UseGuards(TripAccessGuard)
  @Post('trips/:tripId/settlement/share')
  async share(@Param('tripId') tripId: string) {
    return this.settlementService.share(tripId);
  }
}
