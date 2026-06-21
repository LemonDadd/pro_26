import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto, UpdateTripDto } from './dto/trip.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TripAccessGuard, RequireLeader, TripIdParam } from '@/common/guards/trip-access.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTripDto,
  ) {
    return this.tripService.create(user.userId, dto);
  }

  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.tripService.list(
      user.userId,
      status,
      Number(page),
      Number(pageSize),
    );
  }

  @Get(':id')
  @TripIdParam('id')
  @UseGuards(TripAccessGuard)
  async detail(@Param('id') id: string) {
    return this.tripService.detail(id);
  }

  @Put(':id')
  @TripIdParam('id')
  @UseGuards(TripAccessGuard)
  @RequireLeader()
  async update(@Param('id') id: string, @Body() dto: UpdateTripDto) {
    return this.tripService.update(id, dto);
  }

  @Delete(':id')
  @TripIdParam('id')
  @UseGuards(TripAccessGuard)
  @RequireLeader()
  async remove(@Param('id') id: string) {
    return this.tripService.remove(id);
  }

  @Post(':id/complete')
  @TripIdParam('id')
  @UseGuards(TripAccessGuard)
  @RequireLeader()
  async complete(@Param('id') id: string) {
    return this.tripService.complete(id);
  }

  @Get(':id/summary')
  @TripIdParam('id')
  @UseGuards(TripAccessGuard)
  async summary(@Param('id') id: string) {
    return this.tripService.summary(id);
  }
}
