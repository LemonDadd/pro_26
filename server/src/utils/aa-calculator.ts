import { Expense } from '@prisma/client';

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

interface ExpenseLike {
  amount: number;
  payerId: string;
  splitType: string;
  category?: string;
  participants?: string[];
  splits?: { userId: string; amount?: number | null; percentage?: number | null }[];
}

const round2 = (n: number) => Number(n.toFixed(2));

export function calculateUserBalances(
  expenses: ExpenseLike[],
  memberIds: string[],
): UserBalance[] {
  const balances: Record<string, { paid: number; shouldPay: number }> = {};
  memberIds.forEach((id) => {
    balances[id] = { paid: 0, shouldPay: 0 };
  });

  expenses.forEach((expense) => {
    if (balances[expense.payerId]) {
      balances[expense.payerId].paid += expense.amount;
    }

    if (
      expense.splitType === 'equal' &&
      expense.participants &&
      expense.participants.length > 0
    ) {
      const perPerson = expense.amount / expense.participants.length;
      expense.participants.forEach((userId) => {
        if (balances[userId]) {
          balances[userId].shouldPay += perPerson;
        }
      });
    } else if (expense.splitType === 'percentage' && expense.splits) {
      expense.splits.forEach((split) => {
        if (balances[split.userId] && split.percentage) {
          balances[split.userId].shouldPay +=
            expense.amount * (split.percentage / 100);
        }
      });
    } else if (expense.splitType === 'custom' && expense.splits) {
      expense.splits.forEach((split) => {
        if (balances[split.userId] && split.amount) {
          balances[split.userId].shouldPay += split.amount;
        }
      });
    }
  });

  return memberIds.map((id) => {
    const b = balances[id] ?? { paid: 0, shouldPay: 0 };
    return {
      userId: id,
      paid: round2(b.paid),
      shouldPay: round2(b.shouldPay),
      balance: round2(b.paid - b.shouldPay),
    };
  });
}

export function simplifyDebts(balances: UserBalance[]): SettlementItem[] {
  const debtors: { userId: string; amount: number }[] = [];
  const creditors: { userId: string; amount: number }[] = [];

  balances.forEach((b) => {
    if (b.balance < -0.01) {
      debtors.push({ userId: b.userId, amount: Math.abs(b.balance) });
    } else if (b.balance > 0.01) {
      creditors.push({ userId: b.userId, amount: b.balance });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: SettlementItem[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      settlements.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: round2(amount),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}

export function getTotalExpense(expenses: { amount: number }[]): number {
  return round2(expenses.reduce((sum, e) => sum + e.amount, 0));
}

export function getAveragePerPerson(
  expenses: { amount: number }[],
  membersCount: number,
): number {
  if (membersCount === 0) return 0;
  return round2(getTotalExpense(expenses) / membersCount);
}

export function getCategoryStats(
  expenses: { amount: number; category: string }[],
): CategoryStat[] {
  const stats: Record<string, { amount: number; count: number }> = {};
  expenses.forEach((e) => {
    if (!stats[e.category]) stats[e.category] = { amount: 0, count: 0 };
    stats[e.category].amount += e.amount;
    stats[e.category].count += 1;
  });
  return Object.entries(stats)
    .map(([category, data]) => ({
      category,
      amount: round2(data.amount),
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
