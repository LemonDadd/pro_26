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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const business_exception_1 = require("../../common/exceptions/business.exception");
let FileService = class FileService {
    constructor(configService) {
        this.configService = configService;
        this.allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        this.maxSize = 10 * 1024 * 1024;
    }
    validate(file) {
        if (!file)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.FILE_UPLOAD_FAILED, '文件不存在');
        if (!this.allowedTypes.includes(file.mimetype)) {
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.FILE_TYPE_UNSUPPORTED);
        }
        if (file.size > this.maxSize) {
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.FILE_TOO_LARGE);
        }
    }
    buildUrl(file, req) {
        const port = this.configService.get('PORT', 3000);
        const host = req?.headers?.host || `localhost:${port}`;
        return `http://${host}/uploads/${file.filename}`;
    }
    ossCredentials() {
        return {
            provider: 'mock',
            message: '本地开发环境使用本地文件上传，无需 OSS 凭证',
            uploadEndpoint: '/api/v1/files/upload',
            maxSize: this.maxSize,
            allowedTypes: this.allowedTypes,
        };
    }
};
exports.FileService = FileService;
exports.FileService = FileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FileService);
//# sourceMappingURL=file.service.js.map