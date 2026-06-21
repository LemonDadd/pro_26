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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, UpdateExpenseDto, ListExpenseDto } from './dto/expense.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TripAccessGuard } from '@/common/guards/trip-access.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post('trips/:tripId/expenses')
  @UseGuards(TripAccessGuard)
  async create(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expenseService.create(tripId, user.userId, dto);
  }

  @Get('trips/:tripId/expenses')
  @UseGuards(TripAccessGuard)
  async list(
    @Param('tripId') tripId: string,
    @Query() query: ListExpenseDto,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.expenseService.list(tripId, query, Number(page), Number(pageSize));
  }

  @Get('expenses/:id')
  async detail(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.expenseService.detail(id, user.userId);
  }

  @Put('expenses/:id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(id, user.userId, dto);
  }

  @Delete('expenses/:id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.expenseService.remove(id, user.userId);
  }
}
