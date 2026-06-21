import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
export declare class MemberService {
    private readonly prisma;
    private readonly activityService;
    constructor(prisma: PrismaService, activityService: ActivityService);
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
    add(tripId: string, dto: {
        nickname: string;
        avatar?: string;
    }): Promise<{
        id: string;
        nickname: string;
        avatar: string | null;
        role: string;
    }>;
    remove(tripId: string, userId: string): Promise<{
        id: string;
        status: string;
    }>;
    generateInviteCode(tripId: string): Promise<{
        inviteCode: string;
        qrCodeUrl: string;
        expireAt: number;
    }>;
    joinByCode(userId: string, inviteCode: string): Promise<{
        tripId: string;
        title: string;
    }>;
    leave(tripId: string, userId: string): Promise<{
        tripId: string;
        status: string;
    }>;
}
