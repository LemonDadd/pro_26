import { StatsService } from './stats.service';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    personal(user: JwtPayload): Promise<{
        totalTrips: number;
        totalExpense: number;
        totalExpenseCount: number;
        activeTrips: number;
    }>;
    category(tripId: string): Promise<{
        totalExpense: number;
        categoryStats: {
            percent: number;
            category: string;
            amount: number;
            count: number;
        }[];
    } | null>;
    myBill(tripId: string, user: JwtPayload): Promise<{
        userId: string;
        paid: number;
        shouldPay: number;
        balance: number;
        paidExpenses: {
            id: string;
            amount: number;
            description: string;
            category: string;
        }[];
        participatedExpenses: {
            id: string;
            amount: number;
            description: string;
            category: string;
        }[];
    } | null>;
    trend(tripId: string, type?: 'day' | 'month'): Promise<{
        list: {
            date: string;
            amount: number;
            count: number;
        }[];
    }>;
}
