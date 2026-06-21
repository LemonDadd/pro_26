import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    wxLogin(code: string, nickname?: string, avatar?: string): Promise<{
        token: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: any;
            nickname: any;
            avatar: any;
        };
    }>;
    private resolveOpenid;
    signTokens(userId: string, openid: string, user: any): Promise<{
        token: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: any;
            nickname: any;
            avatar: any;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        token: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: any;
            nickname: any;
            avatar: any;
        };
    }>;
    getCurrentUser(userId: string): Promise<{
        id: string;
        openid: string;
        nickname: string;
        avatar: string | null;
        phone: string | null;
        createdAt: Date;
    }>;
    updateProfile(userId: string, data: {
        nickname?: string;
        avatar?: string;
    }): Promise<{
        id: string;
        nickname: string;
        avatar: string | null;
    }>;
}
