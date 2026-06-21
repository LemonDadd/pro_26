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
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const file_service_1 = require("./file.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const config_1 = require("@nestjs/config");
const storage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        cb(null, (0, path_1.join)(process.cwd(), 'uploads'));
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${(0, path_1.extname)(file.originalname)}`;
        cb(null, unique);
    },
});
let FileController = class FileController {
    constructor(fileService, configService) {
        this.fileService = fileService;
        this.configService = configService;
    }
    async upload(file, req) {
        this.fileService.validate(file);
        const url = this.fileService.buildUrl(file, req);
        return {
            url,
            size: file.size,
            type: file.mimetype,
            name: file.originalname,
        };
    }
    async ossCredentials() {
        return this.fileService.ossCredentials();
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('oss-credentials'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileController.prototype, "ossCredentials", null);
exports.FileController = FileController = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [file_service_1.FileService,
        config_1.ConfigService])
], FileController);
//# sourceMappingURL=file.controller.js.map