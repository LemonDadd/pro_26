import request from './request';
import type { Expense, Page, ExpenseCategory, ParticipantSplit, SplitType } from '@/types';

export interface CreateExpenseParams {
  amount: number;
  category: ExpenseCategory;
  description: string;
  payerId: string;
  splitType?: SplitType;
  participants: string[];
  splits?: ParticipantSplit[];
  currency?: string;
  exchangeRate?: number;
  note?: string;
  receiptImage?: string;
}

export type UpdateExpenseParams = Partial<CreateExpenseParams>;

export interface ListExpensesParams {
  tripId: string;
  category?: ExpenseCategory;
  payerId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export async function createExpense(tripId: string, params: CreateExpenseParams): Promise<Expense> {
  return request<Expense>({
    url: `/trips/${tripId}/expenses`,
    method: 'POST',
    data: params,
  });
}

export async function listExpenses(params: ListExpensesParams): Promise<Page<Expense>> {
  const { tripId, category, payerId, startDate, endDate, keyword, page = 1, pageSize = 20 } = params;
  const query = new URLSearchParams();
  if (category) query.append('category', category);
  if (payerId) query.append('payerId', payerId);
  if (startDate) query.append('startDate', startDate);
  if (endDate) query.append('endDate', endDate);
  if (keyword) query.append('keyword', keyword);
  query.append('page', String(page));
  query.append('pageSize', String(pageSize));
  return request<Page<Expense>>({
    url: `/trips/${tripId}/expenses?${query.toString()}`,
    method: 'GET',
  });
}

export async function getExpenseDetail(id: string): Promise<Expense> {
  return request<Expense>({
    url: `/expenses/${id}`,
    method: 'GET',
  });
}

export async function updateExpense(id: string, params: UpdateExpenseParams): Promise<Expense> {
  return request<Expense>({
    url: `/expenses/${id}`,
    method: 'PUT',
    data: params,
  });
}

export async function deleteExpense(id: string): Promise<void> {
  return request<void>({
    url: `/expenses/${id}`,
    method: 'DELETE',
  });
}

export default {
  createExpense,
  listExpenses,
  getExpenseDetail,
  updateExpense,
  deleteExpense,
};
