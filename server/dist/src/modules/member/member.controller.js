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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberController = void 0;
const common_1 = require("@nestjs/common");
const member_service_1 = require("./member.service");
const member_dto_1 = require("./dto/member.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const trip_access_guard_1 = require("../../common/guards/trip-access.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let MemberController = class MemberController {
    constructor(memberService) {
        this.memberService = memberService;
    }
    async list(tripId) {
        return this.memberService.list(tripId);
    }
    async add(tripId, dto) {
        return this.memberService.add(tripId, dto);
    }
    async remove(tripId, userId) {
        return this.memberService.remove(tripId, userId);
    }
    async inviteCode(tripId) {
        return this.memberService.generateInviteCode(tripId);
    }
    async joinByCode(user, dto) {
        return this.memberService.joinByCode(user.userId, dto.inviteCode);
    }
    async leave(user, tripId) {
        return this.memberService.leave(tripId, user.userId);
    }
};
exports.MemberController = MemberController;
__decorate([
    (0, common_1.Get)('trips/:tripId/members'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('trips/:tripId/members'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, member_dto_1.AddMemberDto]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "add", null);
__decorate([
    (0, common_1.Delete)('trips/:tripId/members/:userId'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    (0, trip_access_guard_1.RequireLeader)(),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('trips/:tripId/invite-code'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    (0, trip_access_guard_1.RequireLeader)(),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "inviteCode", null);
__decorate([
    (0, common_1.Post)('trips/join-by-code'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, member_dto_1.JoinByCodeDto]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "joinByCode", null);
__decorate([
    (0, common_1.Post)('trips/:tripId/leave'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "leave", null);
exports.MemberController = MemberController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [member_service_1.MemberService])
], MemberController);
//# sourceMappingURL=member.controller.js.map