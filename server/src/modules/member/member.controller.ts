import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { AddMemberDto, JoinByCodeDto } from './dto/member.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TripAccessGuard, RequireLeader } from '@/common/guards/trip-access.guard';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('trips/:tripId/members')
  @UseGuards(TripAccessGuard)
  async list(@Param('tripId') tripId: string) {
    return this.memberService.list(tripId);
  }

  @Post('trips/:tripId/members')
  @UseGuards(TripAccessGuard)
  async add(
    @Param('tripId') tripId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.memberService.add(tripId, dto);
  }

  @Delete('trips/:tripId/members/:userId')
  @UseGuards(TripAccessGuard)
  @RequireLeader()
  async remove(
    @Param('tripId') tripId: string,
    @Param('userId') userId: string,
  ) {
    return this.memberService.remove(tripId, userId);
  }

  @Post('trips/:tripId/invite-code')
  @UseGuards(TripAccessGuard)
  @RequireLeader()
  async inviteCode(@Param('tripId') tripId: string) {
    return this.memberService.generateInviteCode(tripId);
  }

  @Post('trips/join-by-code')
  async joinByCode(
    @CurrentUser() user: JwtPayload,
    @Body() dto: JoinByCodeDto,
  ) {
    return this.memberService.joinByCode(user.userId, dto.inviteCode);
  }

  @Post('trips/:tripId/leave')
  @UseGuards(TripAccessGuard)
  async leave(
    @CurrentUser() user: JwtPayload,
    @Param('tripId') tripId: string,
  ) {
    return this.memberService.leave(tripId, user.userId);
  }
}
