import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
} from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import ExpenseItem from '@/components/ExpenseItem';
import EmptyState from '@/components/EmptyState';
import {
  getTotalExpense,
  getAveragePerPerson,
} from '@/utils/aaCalculator';
import { categoryLabels, ExpenseCategory } from '@/utils/format';
import styles from './index.module.scss';

const ExpensePage: React.FC = () => {
  const { trips, currentTripId } = useTripStore();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useDidShow(() => {
    console.log('[Expense] 页面显示');
  });

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  });

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const expenses = currentTrip?.expenses || [];
  const members = currentTrip?.members || [];

  const filteredExpenses = useMemo(() => {
    if (activeFilter === 'all') return expenses;
    return expenses.filter((e) => e.category === activeFilter);
  }, [expenses, activeFilter]);

  const totalExpense = getTotalExpense(expenses);
  const avgPerPerson = getAveragePerPerson(expenses, members.length);

  const handleAddExpense = useCallback(() => {
    if (!currentTripId) {
      Taro.showToast({ title: '请先选择行程', icon: 'none' });
      return;
    }
    Taro.navigateTo({ url: '/pages/add-expense/index' });
  }, [currentTripId]);

  const handleFilterClick = useCallback((filter: string) => {
    setActiveFilter(filter);
  }, []);

  const categories = ['all', 'food', 'hotel', 'transport', 'ticket', 'fuel', 'toll', 'parking', 'other'];

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return '全部';
    return categoryLabels[cat as ExpenseCategory] || cat;
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.tripSelector}>
          <Text className={styles.tripName}>
            {currentTrip?.title || '请选择行程'}
          </Text>
          <Text className={styles.tripArrow}>▼</Text>
        </View>

        <View className={styles.summaryCard}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>本次总花费</Text>
            <Text className={styles.summaryTotal}>¥{totalExpense.toFixed(2)}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>人均花费</Text>
            <Text className={styles.summaryValue}>¥{avgPerPerson.toFixed(2)}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>记账笔数</Text>
            <Text className={styles.summaryValue}>{expenses.length}笔</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <ScrollView scrollX className={styles.filterSection}>
          {categories.map((cat) => (
            <View
              key={cat}
              className={`${styles.filterChip} ${activeFilter === cat ? styles.active : ''}`}
              onClick={() => handleFilterClick(cat)}
            >
              <Text>{getCategoryLabel(cat)}</Text>
            </View>
          ))}
        </ScrollView>

        {filteredExpenses.length > 0 ? (
          <View className={styles.expenseList}>
            {filteredExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                members={members}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="💰"
            title="暂无花费记录"
            description="点击右下角按钮记一笔"
            actionText="记一笔"
            onAction={handleAddExpense}
          />
        )}
      </ScrollView>

      <Button className={styles.fabButton} onClick={handleAddExpense}>
        <Text className={styles.fabIcon}>+</Text>
      </Button>
    </View>
  );
};

export default ExpensePage;
