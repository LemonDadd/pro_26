import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';

export const TRIP_ACCESS_KEY = 'tripAccess';
export const RequireLeader = (requireLeader = true) =>
  SetMetadata(TRIP_ACCESS_KEY, { requireLeader });

@Injectable()
export class TripAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const tripId = req.params.tripId || req.params.id;
    const user = req.user as { userId: string } | undefined;

    const config = this.reflector.get<{ requireLeader?: boolean }>(
      TRIP_ACCESS_KEY,
      context.getHandler(),
    );

    if (!tripId || !user) {
      return true;
    }

    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throwBiz(ErrorCodes.TRIP_NOT_FOUND);

    const membership = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: user.userId } },
    });

    if (!membership || membership.status !== 'active') {
      throwBiz(ErrorCodes.FORBIDDEN, '您不是该行程的成员');
    }

    if (config?.requireLeader && trip.leaderId !== user.userId) {
      throwBiz(ErrorCodes.FORBIDDEN, '需要队长权限');
    }

    req.trip = trip;
    return true;
  }
}
