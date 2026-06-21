"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateUserBalances = calculateUserBalances;
exports.simplifyDebts = simplifyDebts;
exports.getTotalExpense = getTotalExpense;
exports.getAveragePerPerson = getAveragePerPerson;
exports.getCategoryStats = getCategoryStats;
exports.generateInviteCode = generateInviteCode;
const round2 = (n) => Number(n.toFixed(2));
function calculateUserBalances(expenses, memberIds) {
    const balances = {};
    memberIds.forEach((id) => {
        balances[id] = { paid: 0, shouldPay: 0 };
    });
    expenses.forEach((expense) => {
        if (balances[expense.payerId]) {
            balances[expense.payerId].paid += expense.amount;
        }
        if (expense.splitType === 'equal' &&
            expense.participants &&
            expense.participants.length > 0) {
            const perPerson = expense.amount / expense.participants.length;
            expense.participants.forEach((userId) => {
                if (balances[userId]) {
                    balances[userId].shouldPay += perPerson;
                }
            });
        }
        else if (expense.splitType === 'percentage' && expense.splits) {
            expense.splits.forEach((split) => {
                if (balances[split.userId] && split.percentage) {
                    balances[split.userId].shouldPay +=
                        expense.amount * (split.percentage / 100);
                }
            });
        }
        else if (expense.splitType === 'custom' && expense.splits) {
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
function simplifyDebts(balances) {
    const debtors = [];
    const creditors = [];
    balances.forEach((b) => {
        if (b.balance < -0.01) {
            debtors.push({ userId: b.userId, amount: Math.abs(b.balance) });
        }
        else if (b.balance > 0.01) {
            creditors.push({ userId: b.userId, amount: b.balance });
        }
    });
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    const settlements = [];
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
        if (debtor.amount < 0.01)
            i++;
        if (creditor.amount < 0.01)
            j++;
    }
    return settlements;
}
function getTotalExpense(expenses) {
    return round2(expenses.reduce((sum, e) => sum + e.amount, 0));
}
function getAveragePerPerson(expenses, membersCount) {
    if (membersCount === 0)
        return 0;
    return round2(getTotalExpense(expenses) / membersCount);
}
function getCategoryStats(expenses) {
    const stats = {};
    expenses.forEach((e) => {
        if (!stats[e.category])
            stats[e.category] = { amount: 0, count: 0 };
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
function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
//# sourceMappingURL=aa-calculator.js.map