import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { CreateExpenseDto, UpdateExpenseDto, ListExpenseDto } from './dto/expense.dto';
type UserRef = {
    id: string;
    nickname: string;
    avatar: string | null;
};
export declare class ExpenseService {
    private readonly prisma;
    private readonly activityService;
    constructor(prisma: PrismaService, activityService: ActivityService);
    private buildSplits;
    create(tripId: string, createdBy: string, dto: CreateExpenseDto): Promise<{
        id: string;
        tripId: string;
        amount: number;
        category: string;
        description: string;
        payerId: string;
        splitType: string;
        currency: string;
        exchangeRate: number;
        originalAmount: number | null;
        note: string | null;
        receiptUrl: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        payer: UserRef;
        participants: {
            percentage?: number | undefined;
            id: string;
            nickname: string;
            avatar: string | null;
            splitAmount: number;
        }[];
    }>;
    list(tripId: string, query: ListExpenseDto, page?: number, pageSize?: number): Promise<{
        list: {
            id: string;
            tripId: string;
            amount: number;
            category: string;
            description: string;
            payerId: string;
            splitType: string;
            currency: string;
            exchangeRate: number;
            originalAmount: number | null;
            note: string | null;
            receiptUrl: string | null;
            createdBy: string;
            createdAt: Date;
            updatedAt: Date;
            payer: UserRef;
            participants: {
                percentage?: number | undefined;
                id: string;
                nickname: string;
                avatar: string | null;
                splitAmount: number;
            }[];
        }[];
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }>;
    detail(id: string): Promise<{
        id: string;
        tripId: string;
        amount: number;
        category: string;
        description: string;
        payerId: string;
        splitType: string;
        currency: string;
        exchangeRate: number;
        originalAmount: number | null;
        note: string | null;
        receiptUrl: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        payer: UserRef;
        participants: {
            percentage?: number | undefined;
            id: string;
            nickname: string;
            avatar: string | null;
            splitAmount: number;
        }[];
    }>;
    update(id: string, userId: string, dto: UpdateExpenseDto): Promise<{
        id: string;
        tripId: string;
        amount: number;
        category: string;
        description: string;
        payerId: string;
        splitType: string;
        currency: string;
        exchangeRate: number;
        originalAmount: number | null;
        note: string | null;
        receiptUrl: string | null;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        payer: UserRef;
        participants: {
            percentage?: number | undefined;
            id: string;
            nickname: string;
            avatar: string | null;
            splitAmount: number;
        }[];
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
    }>;
    private detailInclude;
    private formatExpense;
}
export {};
