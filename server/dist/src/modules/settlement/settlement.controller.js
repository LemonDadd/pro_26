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
exports.SettlementController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const settlement_service_1 = require("./settlement.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const trip_access_guard_1 = require("../../common/guards/trip-access.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
class SettleDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettleDto.prototype, "fromUserId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettleDto.prototype, "toUserId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SettleDto.prototype, "amount", void 0);
let SettlementController = class SettlementController {
    constructor(settlementService) {
        this.settlementService = settlementService;
    }
    async compute(tripId) {
        return this.settlementService.compute(tripId);
    }
    async settle(tripId, user, dto) {
        return this.settlementService.settle(tripId, user.userId, dto);
    }
    async share(tripId) {
        return this.settlementService.share(tripId);
    }
};
exports.SettlementController = SettlementController;
__decorate([
    (0, common_1.Get)('trips/:tripId/settlements'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettlementController.prototype, "compute", null);
__decorate([
    (0, common_1.Post)('trips/:tripId/settlements/settle'),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, SettleDto]),
    __metadata("design:returntype", Promise)
], SettlementController.prototype, "settle", null);
__decorate([
    (0, common_1.Post)('trips/:tripId/settlement/share'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettlementController.prototype, "share", null);
exports.SettlementController = SettlementController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trip_access_guard_1.TripAccessGuard),
    __metadata("design:paramtypes", [settlement_service_1.SettlementService])
], SettlementController);
//# sourceMappingURL=settlement.controller.js.map