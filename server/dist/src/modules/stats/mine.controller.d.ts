import { StatsService } from '@/modules/stats/stats.service';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
import { PrismaService } from '@/prisma/prisma.service';
export declare class MineController {
    private readonly statsService;
    private readonly prisma;
    constructor(statsService: StatsService, prisma: PrismaService);
    summary(user: JwtPayload): Promise<{
        user: {
            id: string;
            nickname: string;
            avatar: string | null;
        } | null;
        stats: {
            totalTrips: number;
            totalExpense: number;
            totalExpenseCount: number;
            activeTrips: number;
        };
    }>;
}
