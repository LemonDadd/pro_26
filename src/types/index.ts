export interface User {
  id: string;
  nickname: string;
  avatar: string;
  role?: 'leader' | 'member';
  phone?: string;
  createdAt?: number;
  openid?: string;
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

export interface Participant {
  id: string;
  nickname: string;
  avatar: string;
  splitAmount: number;
  percentage?: number;
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  payerId: string;
  participants: Participant[];
  splitType: SplitType;
  splits?: ParticipantSplit[];
  note?: string;
  receiptImage?: string;
  receiptUrl?: string;
  currency?: string;
  exchangeRate?: number;
  createdAt: number;
  updatedAt?: number;
  createdBy: string;
  payer?: User;
}

export interface Vehicle {
  id: string;
  tripId: string;
  plateNumber?: string;
  model: string;
  capacity: number;
  fuelConsumption: number;
  ownerId: string;
  owner?: User;
  fuelCost?: number;
  createdAt?: number;
}

export interface TripDayPlan {
  id?: string;
  day: number;
  date?: string;
  destination: string;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface TripStats {
  totalExpense: number;
  avgPerPerson: number;
  expenseCount: number;
  memberCount: number;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  leaderId: string;
  leader?: User;
  members: User[];
  days?: TripDayPlan[];
  vehicles?: Vehicle[];
  expenses?: Expense[];
  createdAt: number;
  updatedAt?: number;
  status: 'active' | 'completed';
  templateId?: string;
  inviteCode: string;
  stats?: TripStats;
}

export interface SettlementItem {
  id?: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  settled?: boolean;
  status?: 'pending' | 'settled';
  fromUser?: User;
  toUser?: User;
  settledAt?: number;
}

export interface UserBalance {
  userId: string;
  user?: User;
  paid: number;
  shouldPay: number;
  balance: number;
}

export interface CategoryStat {
  category: ExpenseCategory;
  amount: number;
  count: number;
  percent?: number;
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
  tags: string[];
}

export interface Activity {
  id: string;
  tripId: string;
  type: 'expense' | 'member_join' | 'settle';
  userId: string;
  user?: User;
  content: string;
  amount?: number;
  createdAt: number;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface Page<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface SettlementPlan {
  totalExpense: number;
  memberCount: number;
  avgPerPerson: number;
  userBalances: UserBalance[];
  settlements: SettlementItem[];
}

export interface TrendStatItem {
  date: string;
  amount: number;
  count: number;
}

export interface PersonalStats {
  totalTrips: number;
  totalExpense: number;
  totalExpenseCount: number;
  activeTrips: number;
}

export interface MyBill {
  userId: string;
  paid: number;
  shouldPay: number;
  balance: number;
  paidExpenses: Expense[];
  participatedExpenses: Expense[];
}
