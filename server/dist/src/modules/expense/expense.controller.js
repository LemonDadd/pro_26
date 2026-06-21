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
exports.ExpenseController = void 0;
const common_1 = require("@nestjs/common");
const expense_service_1 = require("./expense.service");
const expense_dto_1 = require("./dto/expense.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const trip_access_guard_1 = require("../../common/guards/trip-access.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ExpenseController = class ExpenseController {
    constructor(expenseService) {
        this.expenseService = expenseService;
    }
    async create(tripId, user, dto) {
        return this.expenseService.create(tripId, user.userId, dto);
    }
    async list(tripId, query, page = '1', pageSize = '20') {
        return this.expenseService.list(tripId, query, Number(page), Number(pageSize));
    }
    async detail(id) {
        return this.expenseService.detail(id);
    }
    async update(id, user, dto) {
        return this.expenseService.update(id, user.userId, dto);
    }
    async remove(id, user) {
        return this.expenseService.remove(id, user.userId);
    }
};
exports.ExpenseController = ExpenseController;
__decorate([
    (0, common_1.Post)('trips/:tripId/expenses'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, expense_dto_1.CreateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('trips/:tripId/expenses'),
    (0, common_1.UseGuards)(trip_access_guard_1.TripAccessGuard),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, expense_dto_1.ListExpenseDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "detail", null);
__decorate([
    (0, common_1.Put)('expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, expense_dto_1.UpdateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "remove", null);
exports.ExpenseController = ExpenseController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [expense_service_1.ExpenseService])
], ExpenseController);
//# sourceMappingURL=expense.controller.js.map