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
const settlement_service_1 = require("./settlement.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const trip_access_guard_1 = require("../../common/guards/trip-access.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SettlementController = class SettlementController {
    constructor(settlementService) {
        this.settlementService = settlementService;
    }
    async compute(tripId) {
        return this.settlementService.compute(tripId);
    }
    async settle(id, user) {
        return this.settlementService.settle(id, user.userId);
    }
    async share(tripId) {
        return this.settlementService.share(tripId);
    }
};
exports.SettlementController = SettlementController;
__decorate([
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    (0, common_1.Get)('trips/:tripId/settlements'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettlementController.prototype, "compute", null);
__decorate([
    (0, common_1.Post)('settlements/:id/settle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SettlementController.prototype, "settle", null);
__decorate([
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    (0, common_1.Post)('trips/:tripId/settlement/share'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettlementController.prototype, "share", null);
exports.SettlementController = SettlementController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [settlement_service_1.SettlementService])
], SettlementController);
//# sourceMappingURL=settlement.controller.js.map