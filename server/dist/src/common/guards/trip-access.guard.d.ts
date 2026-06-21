import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';
export declare const TRIP_ACCESS_KEY = "tripAccess";
export declare const TRIP_ID_PARAM_KEY = "tripIdParam";
export declare const RequireLeader: (requireLeader?: boolean) => import("@nestjs/common").CustomDecorator<string>;
export declare const TripIdParam: (paramName: string) => import("@nestjs/common").CustomDecorator<string>;
export declare class TripAccessGuard implements CanActivate {
    private readonly prisma;
    private readonly reflector;
    constructor(prisma: PrismaService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
