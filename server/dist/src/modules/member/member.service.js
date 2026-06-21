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
exports.MemberService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const activity_service_1 = require("../activity/activity.service");
const aa_calculator_1 = require("../../utils/aa-calculator");
const aa_calculator_2 = require("../../utils/aa-calculator");
const business_exception_1 = require("../../common/exceptions/business.exception");
let MemberService = class MemberService {
    constructor(prisma, activityService) {
        this.prisma = prisma;
        this.activityService = activityService;
    }
    async list(tripId) {
        const memberships = await this.prisma.tripMember.findMany({
            where: { tripId, status: 'active' },
            include: { user: { select: { id: true, nickname: true, avatar: true } } },
        });
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: { expenses: true },
        });
        const memberIds = memberships.map((m) => m.userId);
        const balances = (0, aa_calculator_1.calculateUserBalances)(trip?.expenses ?? [], memberIds);
        return {
            list: memberships.map((m) => {
                const b = balances.find((x) => x.userId === m.userId);
                return {
                    id: m.user.id,
                    nickname: m.user.nickname,
                    avatar: m.user.avatar,
                    role: m.role,
                    joinedAt: m.joinedAt,
                    stats: {
                        paid: b?.paid ?? 0,
                        spent: b?.shouldPay ?? 0,
                        balance: b?.balance ?? 0,
                    },
                };
            }),
            total: memberships.length,
        };
    }
    async add(tripId, dto) {
        const user = await this.prisma.user.create({
            data: {
                openid: `local_${Date.now()}`,
                nickname: dto.nickname,
                avatar: dto.avatar ?? `https://i.pravatar.cc/150?u=${dto.nickname}`,
            },
        });
        await this.prisma.tripMember.create({
            data: { tripId, userId: user.id, role: 'member', status: 'active' },
        });
        await this.activityService.add(tripId, user.id, 'member_join', '加入了行程');
        return {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
            role: 'member',
        };
    }
    async remove(tripId, userId) {
        const membership = await this.prisma.tripMember.findUnique({
            where: { tripId_userId: { tripId, userId } },
        });
        if (!membership)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.MEMBER_NOT_FOUND);
        await this.prisma.tripMember.update({
            where: { tripId_userId: { tripId, userId } },
            data: { status: 'left' },
        });
        return { id: userId, status: 'left' };
    }
    async generateInviteCode(tripId) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        const code = (0, aa_calculator_2.generateInviteCode)();
        const updated = await this.prisma.trip.update({
            where: { id: tripId },
            data: { inviteCode: code },
        });
        return {
            inviteCode: updated.inviteCode,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=trip:${updated.inviteCode}`,
            expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
    }
    async joinByCode(userId, inviteCode) {
        const trip = await this.prisma.trip.findUnique({ where: { inviteCode } });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.INVITE_CODE_INVALID);
        const existing = await this.prisma.tripMember.findUnique({
            where: { tripId_userId: { tripId: trip.id, userId } },
        });
        if (existing && existing.status === 'active') {
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.ALREADY_MEMBER);
        }
        if (existing) {
            await this.prisma.tripMember.update({
                where: { tripId_userId: { tripId: trip.id, userId } },
                data: { status: 'active' },
            });
        }
        else {
            await this.prisma.tripMember.create({
                data: { tripId: trip.id, userId, role: 'member', status: 'active' },
            });
        }
        await this.activityService.add(trip.id, userId, 'member_join', '加入了行程');
        return { tripId: trip.id, title: trip.title };
    }
    async leave(tripId, userId) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TRIP_NOT_FOUND);
        if (trip.leaderId === userId) {
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.FORBIDDEN, '队长不能退出，请先转让或删除行程');
        }
        await this.prisma.tripMember.update({
            where: { tripId_userId: { tripId, userId } },
            data: { status: 'left' },
        });
        return { tripId, status: 'left' };
    }
};
exports.MemberService = MemberService;
exports.MemberService = MemberService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_service_1.ActivityService])
], MemberService);
//# sourceMappingURL=member.service.js.map