import { Expense, User, SettlementItem, UserBalance, ExpenseCategory } from '@/types';

export function calculateUserBalances(
  expenses: Expense[],
  members: User[]
): UserBalance[] {
  const balances: Record<string, { paid: number; shouldPay: number }> = {};

  members.forEach((m) => {
    balances[m.id] = { paid: 0, shouldPay: 0 };
  });

  expenses.forEach((expense) => {
    if (balances[expense.payerId]) {
      balances[expense.payerId].paid += expense.amount;
    }

    if (expense.splitType === 'equal' && expense.participants.length > 0) {
      expense.participants.forEach((p) => {
        if (balances[p.id]) {
          balances[p.id].shouldPay += p.splitAmount;
        }
      });
    } else if (expense.splitType === 'percentage' && expense.splits) {
      expense.splits.forEach((split) => {
        if (balances[split.userId] && split.percentage) {
          balances[split.userId].shouldPay += expense.amount * (split.percentage / 100);
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

  return members.map((m) => ({
    userId: m.id,
    paid: Number(balances[m.id]?.paid.toFixed(2) || '0'),
    shouldPay: Number(balances[m.id]?.shouldPay.toFixed(2) || '0'),
    balance: Number(
      (balances[m.id]?.paid - balances[m.id]?.shouldPay).toFixed(2) || '0'
    ),
  }));
}

export function simplifyDebts(
  balances: UserBalance[],
  members: User[]
): SettlementItem[] {
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
        amount: Number(amount.toFixed(2)),
        settled: false,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}

export function getTotalExpense(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getAveragePerPerson(
  expenses: Expense[],
  membersCount: number
): number {
  if (membersCount === 0) return 0;
  return getTotalExpense(expenses) / membersCount;
}

export function getCategoryStats(expenses: Expense[]): {
  category: ExpenseCategory;
  amount: number;
  count: number;
}[] {
  const stats: Record<string, { amount: number; count: number }> = {};

  expenses.forEach((e) => {
    if (!stats[e.category]) {
      stats[e.category] = { amount: 0, count: 0 };
    }
    stats[e.category].amount += e.amount;
    stats[e.category].count += 1;
  });

  return Object.entries(stats)
    .map(([category, data]) => ({
      category: category as ExpenseCategory,
      amount: Number(data.amount.toFixed(2)),
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getUserById(members: User[], userId: string): User | undefined {
  return members.find((m) => m.id === userId);
}
