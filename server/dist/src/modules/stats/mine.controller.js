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
exports.MineController = void 0;
const common_1 = require("@nestjs/common");
const stats_service_1 = require("./stats.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let MineController = class MineController {
    constructor(statsService, prisma) {
        this.statsService = statsService;
        this.prisma = prisma;
    }
    async summary(user) {
        const stats = await this.statsService.personal(user.userId);
        const record = await this.prisma.user.findUnique({ where: { id: user.userId } });
        return {
            user: record
                ? { id: record.id, nickname: record.nickname, avatar: record.avatar }
                : null,
            stats,
        };
    }
};
exports.MineController = MineController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MineController.prototype, "summary", null);
exports.MineController = MineController = __decorate([
    (0, common_1.Controller)('mine'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stats_service_1.StatsService,
        prisma_service_1.PrismaService])
], MineController);
//# sourceMappingURL=mine.controller.js.map