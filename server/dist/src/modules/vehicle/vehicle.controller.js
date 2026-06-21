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
exports.VehicleController = void 0;
const common_1 = require("@nestjs/common");
const vehicle_service_1 = require("./vehicle.service");
const vehicle_dto_1 = require("./dto/vehicle.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const trip_access_guard_1 = require("../../common/guards/trip-access.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let VehicleController = class VehicleController {
    constructor(vehicleService) {
        this.vehicleService = vehicleService;
    }
    async list(tripId) {
        return this.vehicleService.list(tripId);
    }
    async create(tripId, dto) {
        return this.vehicleService.create(tripId, dto);
    }
    async detail(id, user) {
        return this.vehicleService.detail(id, user.userId);
    }
    async update(id, user, dto) {
        return this.vehicleService.update(id, user.userId, dto);
    }
    async remove(id, user) {
        return this.vehicleService.remove(id, user.userId);
    }
    async fuelSubsidy(tripId, user, dto) {
        return this.vehicleService.createFuelSubsidy(tripId, user.userId, dto);
    }
    async listFuelSubsidy(tripId) {
        return this.vehicleService.listFuelSubsidy(tripId);
    }
};
exports.VehicleController = VehicleController;
__decorate([
    (0, common_1.Get)('trips/:tripId/vehicles'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('trips/:tripId/vehicles'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicle_dto_1.CreateVehicleDto]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('vehicles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "detail", null);
__decorate([
    (0, common_1.Put)('vehicles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, vehicle_dto_1.UpdateVehicleDto]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('vehicles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('trips/:tripId/fuel-subsidy'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, vehicle_dto_1.CreateFuelSubsidyDto]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "fuelSubsidy", null);
__decorate([
    (0, common_1.Get)('trips/:tripId/fuel-subsidy'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "listFuelSubsidy", null);
exports.VehicleController = VehicleController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [vehicle_service_1.VehicleService])
], VehicleController);
//# sourceMappingURL=vehicle.controller.js.map