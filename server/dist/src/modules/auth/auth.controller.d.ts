import { AuthService } from './auth.service';
import { WxLoginDto, RefreshTokenDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    wxLogin(dto: WxLoginDto): Promise<{
        token: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        token: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
    }>;
    me(user: JwtPayload): Promise<{
        id: string;
        openid: string;
        nickname: string;
        avatar: string | null;
        phone: string | null;
        createdAt: Date;
    }>;
    updateProfile(user: JwtPayload, dto: UpdateProfileDto): Promise<{
        id: string;
        nickname: string;
        avatar: string | null;
    }>;
}
