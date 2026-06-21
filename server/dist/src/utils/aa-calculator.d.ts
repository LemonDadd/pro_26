import { Expense, ExpenseSplit } from '@prisma/client';
export interface UserBalance {
    userId: string;
    paid: number;
    shouldPay: number;
    balance: number;
}
export interface SettlementItem {
    fromUserId: string;
    toUserId: string;
    amount: number;
}
export interface CategoryStat {
    category: string;
    amount: number;
    count: number;
}
export interface SplitItem {
    userId: string;
    amount?: number;
    percentage?: number;
}
export interface ExpenseLike {
    amount: number;
    payerId: string;
    splitType: string;
    category?: string;
    participants?: string[];
    splits?: {
        userId: string;
        amount?: number | null;
        percentage?: number | null;
    }[];
}
export type ExpenseWithSplits = Expense & {
    splits: ExpenseSplit[];
};
export declare function toExpenseLike(e: ExpenseWithSplits): ExpenseLike;
export declare function calculateUserBalances(expenses: ExpenseLike[], memberIds: string[]): UserBalance[];
export declare function simplifyDebts(balances: UserBalance[]): SettlementItem[];
export declare function getTotalExpense(expenses: {
    amount: number;
}[]): number;
export declare function getAveragePerPerson(expenses: {
    amount: number;
}[], membersCount: number): number;
export declare function getCategoryStats(expenses: {
    amount: number;
    category: string;
}[]): CategoryStat[];
export declare function generateInviteCode(): string;
