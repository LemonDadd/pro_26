"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripAccessGuard = exports.TripIdParam = exports.RequireLeader = exports.TRIP_ID_PARAM_KEY = exports.TRIP_ACCESS_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../exceptions/business.exception");
exports.TRIP_ACCESS_KEY = 'tripAccess';
exports.TRIP_ID_PARAM_KEY = 'tripIdParam';
const RequireLeader = (requireLeader = true) => (0, common_1.SetMetadata)(exports.TRIP_ACCESS_KEY, { requireLeader });
exports.RequireLeader = RequireLeader;
const TripIdParam = (paramName) => (0, common_1.SetMetadata)(exports.TRIP_ID_PARAM_KEY, paramName);
exports.TripIdParam = TripIdParam;
let TripAccessGuard = class TripAccessGuard {
    constructor(prisma, reflector) {
        this.prisma = prisma;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const accessConfig = this.reflector.get(exports.TRIP_ACCESS_KEY, context.getHandler());
        const tripIdParamName = this.reflector.get(exports.TRIP_ID_PARAM_KEY, context.getHandler()) ??
            'tripId';
        const tripId = req.params?.[tripIdParamName];
        if (!tripId || !user) {
            return true;
        }
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        const membership = await this.prisma.tripMember.findUnique({
            where: { tripId_userId: { tripId, userId: user.userId } },
        });
        if (!membership || membership.status !== 'active') {
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.FORBIDDEN, '您不是该行程的成员');
        }
        if (accessConfig?.requireLeader && trip.leaderId !== user.userId) {
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.FORBIDDEN, '需要队长权限');
        }
        req.trip = trip;
        return true;
    }
};
exports.TripAccessGuard = TripAccessGuard;
exports.TripAccessGuard = TripAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector])
], TripAccessGuard);
//# sourceMappingURL=trip-access.guard.js.map