import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TripAccessGuard } from '@/common/guards/trip-access.guard';

@Controller('trips/:tripId/activities')
@UseGuards(JwtAuthGuard, TripAccessGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async list(
    @Param('tripId') _tripId: string,
    @Query('type') type?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.activityService.listByTrip(_tripId, {
      type,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }
}
