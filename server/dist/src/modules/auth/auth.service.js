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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async wxLogin(code, nickname, avatar) {
        const openid = this.resolveOpenid(code);
        const user = await this.prisma.user.upsert({
            where: { openid },
            update: {
                nickname: nickname ?? undefined,
                avatar: avatar ?? undefined,
            },
            create: {
                openid,
                nickname: nickname ?? `用户${openid.slice(-6)}`,
                avatar: avatar ?? `https://i.pravatar.cc/150?u=${openid}`,
            },
        });
        return this.signTokens(user.id, user.openid, user);
    }
    resolveOpenid(code) {
        if (code.startsWith('mock_openid_')) {
            return code;
        }
        const mockOpenid = this.configService.get('WX_MOCK_OPENID');
        if (mockOpenid) {
            return `${mockOpenid}_${code.slice(0, 6)}`;
        }
        return `wx_${code}`;
    }
    async signTokens(userId, openid, user) {
        const payload = { userId, openid };
        const token = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
        });
        return {
            token,
            refreshToken,
            expiresIn: 604800,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatar: user.avatar,
            },
        };
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get('JWT_SECRET'),
            });
        }
        catch {
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.TOKEN_EXPIRED);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.userId },
        });
        if (!user)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.USER_NOT_FOUND);
        return this.signTokens(user.id, user.openid, user);
    }
    async getCurrentUser(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.USER_NOT_FOUND);
        return {
            id: user.id,
            openid: user.openid,
            nickname: user.nickname,
            avatar: user.avatar,
            phone: user.phone,
            createdAt: user.createdAt,
        };
    }
    async updateProfile(userId, data) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                nickname: data.nickname,
                avatar: data.avatar,
            },
        });
        return {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map