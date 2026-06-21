import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async wxLogin(code: string, nickname?: string, avatar?: string) {
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

  private resolveOpenid(code: string): string {
    if (code.startsWith('mock_openid_')) {
      return code;
    }
    const mockOpenid = this.configService.get<string>('WX_MOCK_OPENID');
    if (mockOpenid) {
      return `${mockOpenid}_${code.slice(0, 6)}`;
    }
    return `wx_${code}`;
  }

  async signTokens(userId: string, openid: string, user: any) {
    const payload: JwtPayload = { userId, openid };
    const token = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
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

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throwBiz(ErrorCodes.TOKEN_EXPIRED);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) throwBiz(ErrorCodes.USER_NOT_FOUND);
    return this.signTokens(user.id, user.openid, user);
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throwBiz(ErrorCodes.USER_NOT_FOUND);
    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, data: { nickname?: string; avatar?: string }) {
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
}
