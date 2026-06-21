import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
export declare class SettlementService {
    private readonly prisma;
    private readonly activityService;
    private readonly configService;
    constructor(prisma: PrismaService, activityService: ActivityService, configService: ConfigService);
    private toExpenseLike;
    private makePlanId;
    private parsePlanId;
    private ensureTripMember;
    compute(tripId: string): Promise<{
        totalExpense: number;
        memberCount: number;
        avgPerPerson: number;
        userBalances: {
            userId: string;
            user: {
                id: string;
                nickname: string;
                avatar: string | null;
            } | undefined;
            paid: number;
            shouldPay: number;
            balance: number;
        }[];
        settlements: {
            id: string;
            fromUserId: string;
            fromUser: {
                id: string;
                nickname: string;
                avatar: string | null;
            } | undefined;
            toUserId: string;
            toUser: {
                id: string;
                nickname: string;
                avatar: string | null;
            } | undefined;
            amount: number;
            status: string;
            settledAt: number | null;
        }[];
    }>;
    settle(id: string, userId: string): Promise<{
        id: any;
        status: string;
    }>;
    share(tripId: string): Promise<{
        shareUrl: string;
        imageUrl: string;
        qrCodeUrl: string;
    }>;
}
