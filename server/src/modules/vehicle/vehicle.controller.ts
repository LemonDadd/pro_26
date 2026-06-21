import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  CreateFuelSubsidyDto,
} from './dto/vehicle.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TripAccessGuard } from '@/common/guards/trip-access.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get('trips/:tripId/vehicles')
  @UseGuards(TripAccessGuard)
  async list(@Param('tripId') tripId: string) {
    return this.vehicleService.list(tripId);
  }

  @Post('trips/:tripId/vehicles')
  @UseGuards(TripAccessGuard)
  async create(@Param('tripId') tripId: string, @Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(tripId, dto);
  }

  @Get('vehicles/:id')
  async detail(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.vehicleService.detail(id, user.userId);
  }

  @Put('vehicles/:id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(id, user.userId, dto);
  }

  @Delete('vehicles/:id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.vehicleService.remove(id, user.userId);
  }

  @Post('trips/:tripId/fuel-subsidy')
  @UseGuards(TripAccessGuard)
  async fuelSubsidy(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateFuelSubsidyDto,
  ) {
    return this.vehicleService.createFuelSubsidy(tripId, user.userId, dto);
  }

  @Get('trips/:tripId/fuel-subsidy')
  @UseGuards(TripAccessGuard)
  async listFuelSubsidy(@Param('tripId') tripId: string) {
    return this.vehicleService.listFuelSubsidy(tripId);
  }
}
