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
exports.TripController = void 0;
const common_1 = require("@nestjs/common");
const trip_service_1 = require("./trip.service");
const trip_dto_1 = require("./dto/trip.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const trip_access_guard_1 = require("../../common/guards/trip-access.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TripController = class TripController {
    constructor(tripService) {
        this.tripService = tripService;
    }
    async create(user, dto) {
        return this.tripService.create(user.userId, dto);
    }
    async list(user, status, page = '1', pageSize = '20') {
        return this.tripService.list(user.userId, status, Number(page), Number(pageSize));
    }
    async detail(id) {
        return this.tripService.detail(id);
    }
    async update(id, dto) {
        return this.tripService.update(id, dto);
    }
    async remove(id) {
        return this.tripService.remove(id);
    }
    async complete(id) {
        return this.tripService.complete(id);
    }
    async summary(id) {
        return this.tripService.summary(id);
    }
};
exports.TripController = TripController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, trip_dto_1.CreateTripDto]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, trip_access_guard_1.TripIdParam)('id'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "detail", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, trip_access_guard_1.TripIdParam)('id'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    (0, trip_access_guard_1.RequireLeader)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, trip_dto_1.UpdateTripDto]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, trip_access_guard_1.TripIdParam)('id'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    (0, trip_access_guard_1.RequireLeader)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, trip_access_guard_1.TripIdParam)('id'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    (0, trip_access_guard_1.RequireLeader)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "complete", null);
__decorate([
    (0, common_1.Get)(':id/summary'),
    (0, trip_access_guard_1.TripIdParam)('id'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TripController.prototype, "summary", null);
exports.TripController = TripController = __decorate([
    (0, common_1.Controller)('trips'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [trip_service_1.TripService])
], TripController);
//# sourceMappingURL=trip.controller.js.map