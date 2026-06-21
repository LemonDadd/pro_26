import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { IsArray, IsString } from 'class-validator';

class BatchUsersDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('batch')
  async batch(@Body() dto: BatchUsersDto) {
    return this.userService.findByIds(dto.userIds);
  }
}
