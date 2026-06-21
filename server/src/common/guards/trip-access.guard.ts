import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';
import { Trip } from '@prisma/client';

export const TRIP_ACCESS_KEY = 'tripAccess';
export const TRIP_ID_PARAM_KEY = 'tripIdParam';
export const RequireLeader = (requireLeader = true) =>
  SetMetadata(TRIP_ACCESS_KEY, { requireLeader });
export const TripIdParam = (paramName: string) =>
  SetMetadata(TRIP_ID_PARAM_KEY, paramName);

interface TripAccessRequest extends Request {
  user?: JwtPayload;
  trip?: Trip;
}

@Injectable()
export class TripAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<TripAccessRequest>();
    const user = req.user;

    const accessConfig = this.reflector.get<{ requireLeader?: boolean }>(
      TRIP_ACCESS_KEY,
      context.getHandler(),
    );
    const tripIdParamName =
      this.reflector.get<string>(TRIP_ID_PARAM_KEY, context.getHandler()) ??
      'tripId';
    const tripId = req.params?.[tripIdParamName];

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

    if (accessConfig?.requireLeader && trip.leaderId !== user.userId) {
      throwBiz(ErrorCodes.FORBIDDEN, '需要队长权限');
    }

    req.trip = trip;
    return true;
  }
}
