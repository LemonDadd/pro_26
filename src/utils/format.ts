import { ExpenseCategory } from '@/types';

export function formatMoney(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

export function formatMoneyShort(amount: number): string {
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`;
  }
  return `¥${amount.toFixed(0)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
}

export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

export const categoryLabels: Record<ExpenseCategory, string> = {
  food: '餐饮',
  hotel: '住宿',
  transport: '交通',
  ticket: '门票',
  fuel: '油费',
  toll: '过路费',
  parking: '停车费',
  other: '其他',
};

export const categoryEmojis: Record<ExpenseCategory, string> = {
  food: '🍜',
  hotel: '🏨',
  transport: '🚗',
  ticket: '🎫',
  fuel: '⛽',
  toll: '🛣️',
  parking: '🅿️',
  other: '📦',
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
