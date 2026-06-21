export declare class SplitDto {
    userId: string;
    amount?: number;
    percentage?: number;
}
export declare class CreateExpenseDto {
    amount: number;
    category: string;
    description: string;
    payerId: string;
    splitType?: string;
    participants: string[];
    splits?: SplitDto[];
    currency?: string;
    exchangeRate?: number;
    note?: string;
    receiptImage?: string;
}
export declare class UpdateExpenseDto {
    amount?: number;
    category?: string;
    description?: string;
    payerId?: string;
    splitType?: string;
    participants?: string[];
    splits?: SplitDto[];
    currency?: string;
    exchangeRate?: number;
    note?: string;
    receiptImage?: string;
}
export declare class ListExpenseDto {
    category?: string;
    payerId?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
}
