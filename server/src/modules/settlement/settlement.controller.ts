import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsNumber, IsString } from 'class-validator';
import { SettlementService } from './settlement.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TripAccessGuard } from '@/common/guards/trip-access.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

class SettleDto {
  @IsString() fromUserId: string;
  @IsString() toUserId: string;
  @IsNumber() amount: number;
}

@Controller()
@UseGuards(JwtAuthGuard, TripAccessGuard)
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get('trips/:tripId/settlements')
  async compute(@Param('tripId') tripId: string) {
    return this.settlementService.compute(tripId);
  }

  @Post('trips/:tripId/settlements/settle')
  async settle(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SettleDto,
  ) {
    return this.settlementService.settle(tripId, user.userId, dto);
  }

  @Post('trips/:tripId/settlement/share')
  async share(@Param('tripId') tripId: string) {
    return this.settlementService.share(tripId);
  }
}
