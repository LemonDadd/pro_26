import { SettlementService } from './settlement.service';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
export declare class SettlementController {
    private readonly settlementService;
    constructor(settlementService: SettlementService);
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
    settle(id: string, user: JwtPayload): Promise<{
        id: any;
        status: string;
    }>;
    share(tripId: string): Promise<{
        shareUrl: string;
        imageUrl: string;
        qrCodeUrl: string;
    }>;
}
