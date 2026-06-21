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
exports.TemplateController = void 0;
const common_1 = require("@nestjs/common");
const template_service_1 = require("./template.service");
const trip_dto_1 = require("../trip/dto/trip.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TemplateController = class TemplateController {
    constructor(templateService) {
        this.templateService = templateService;
    }
    async list(tag, keyword, page = '1', pageSize = '20') {
        return this.templateService.list({
            tag,
            keyword,
            page: Number(page),
            pageSize: Number(pageSize),
        });
    }
    async detail(id) {
        return this.templateService.detail(id);
    }
    async apply(id, user, dto) {
        return this.templateService.apply(id, user.userId, dto);
    }
};
exports.TemplateController = TemplateController;
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Query)('tag')),
    __param(1, (0, common_1.Query)('keyword')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('templates/:id/apply'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, trip_dto_1.ApplyTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "apply", null);
exports.TemplateController = TemplateController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [template_service_1.TemplateService])
], TemplateController);
//# sourceMappingURL=template.controller.js.map