import { MemberService } from './member.service';
import { AddMemberDto, JoinByCodeDto } from './dto/member.dto';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
export declare class MemberController {
    private readonly memberService;
    constructor(memberService: MemberService);
    list(tripId: string): Promise<{
        list: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: string;
            joinedAt: Date;
            stats: {
                paid: number;
                spent: number;
                balance: number;
            };
        }[];
        total: number;
    }>;
    add(tripId: string, dto: AddMemberDto): Promise<{
        id: string;
        nickname: string;
        avatar: string | null;
        role: string;
    }>;
    remove(tripId: string, userId: string): Promise<{
        id: string;
        status: string;
    }>;
    inviteCode(tripId: string): Promise<{
        inviteCode: string;
        qrCodeUrl: string;
        expireAt: number;
    }>;
    joinByCode(user: JwtPayload, dto: JoinByCodeDto): Promise<{
        tripId: string;
        title: string;
    }>;
    leave(user: JwtPayload, tripId: string): Promise<{
        tripId: string;
        status: string;
    }>;
}
