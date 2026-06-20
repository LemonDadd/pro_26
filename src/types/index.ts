export interface User {
  id: string;
  name: string;
  avatar: string;
  isLeader?: boolean;
}

export type ExpenseCategory =
  | 'food'
  | 'hotel'
  | 'transport'
  | 'ticket'
  | 'fuel'
  | 'toll'
  | 'parking'
  | 'other';

export type SplitType = 'equal' | 'percentage' | 'custom';

export interface ParticipantSplit {
  userId: string;
  amount?: number;
  percentage?: number;
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  payerId: string;
  participants: string[];
  splitType: SplitType;
  splits?: ParticipantSplit[];
  note?: string;
  receiptImage?: string;
  currency?: string;
  exchangeRate?: number;
  createdAt: number;
  createdBy: string;
}

export interface Vehicle {
  id: string;
  tripId: string;
  plateNumber?: string;
  model: string;
  capacity: number;
  fuelConsumption: number;
  ownerId: string;
}

export interface TripDayPlan {
  day: number;
  date: string;
  destination: string;
  description?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  leaderId: string;
  members: User[];
  days?: TripDayPlan[];
  vehicles?: Vehicle[];
  expenses?: Expense[];
  createdAt: number;
  status: 'active' | 'completed';
  templateId?: string;
}

export interface SettlementItem {
  fromUserId: string;
  toUserId: string;
  amount: number;
  settled?: boolean;
}

export interface UserBalance {
  userId: string;
  paid: number;
  shouldPay: number;
  balance: number;
}

export interface CategoryStat {
  category: ExpenseCategory;
  amount: number;
  count: number;
}

export interface TripTemplate {
  id: string;
  name: string;
  description: string;
  cover: string;
  estimatedDays: number;
  estimatedBudget: number;
  categories: ExpenseCategory[];
  sampleDays: TripDayPlan[];
}

export interface Activity {
  id: string;
  tripId: string;
  type: 'expense' | 'member_join' | 'settle';
  userId: string;
  content: string;
  amount?: number;
  createdAt: number;
}
