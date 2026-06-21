import { ExpenseService } from './expense.service';
import { CreateExpenseDto, UpdateExpenseDto, ListExpenseDto } from './dto/expense.dto';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
export declare class ExpenseController {
    private readonly expenseService;
    constructor(expenseService: ExpenseService);
    create(tripId: string, user: JwtPayload, dto: CreateExpenseDto): Promise<{
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
        payer: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
        participants: {
            percentage?: number | undefined;
            id: string;
            nickname: string;
            avatar: string | null;
            splitAmount: number;
        }[];
    }>;
    list(tripId: string, query: ListExpenseDto, page?: string, pageSize?: string): Promise<{
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
            payer: {
                id: string;
                nickname: string;
                avatar: string | null;
            };
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
    detail(id: string, user: JwtPayload): Promise<{
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
        payer: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
        participants: {
            percentage?: number | undefined;
            id: string;
            nickname: string;
            avatar: string | null;
            splitAmount: number;
        }[];
    }>;
    update(id: string, user: JwtPayload, dto: UpdateExpenseDto): Promise<{
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
        payer: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
        participants: {
            percentage?: number | undefined;
            id: string;
            nickname: string;
            avatar: string | null;
            splitAmount: number;
        }[];
    }>;
    remove(id: string, user: JwtPayload): Promise<{
        id: string;
    }>;
}
