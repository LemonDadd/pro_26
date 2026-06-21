import { PrismaService } from '@/prisma/prisma.service';
export declare class StatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    personal(userId: string): Promise<{
        totalTrips: number;
        totalExpense: number;
        totalExpenseCount: number;
        activeTrips: number;
    }>;
    categoryStats(tripId: string): Promise<{
        totalExpense: number;
        categoryStats: {
            percent: number;
            category: string;
            amount: number;
            count: number;
        }[];
    } | null>;
    myBill(tripId: string, userId: string): Promise<{
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
