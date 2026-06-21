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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const stats_service_1 = require("./stats.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const trip_access_guard_1 = require("../../common/guards/trip-access.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let StatsController = class StatsController {
    constructor(statsService) {
        this.statsService = statsService;
    }
    async personal(user) {
        return this.statsService.personal(user.userId);
    }
    async category(tripId) {
        return this.statsService.categoryStats(tripId);
    }
    async myBill(tripId, user) {
        return this.statsService.myBill(tripId, user.userId);
    }
    async trend(tripId, type = 'day') {
        return this.statsService.trend(tripId, type);
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)('stats/personal'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "personal", null);
__decorate([
    (0, common_1.Get)('trips/:tripId/stats/category'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "category", null);
__decorate([
    (0, common_1.Get)('trips/:tripId/stats/my-bill'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "myBill", null);
__decorate([
    (0, common_1.Get)('trips/:tripId/stats/trend'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "trend", null);
exports.StatsController = StatsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map