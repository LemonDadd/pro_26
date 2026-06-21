import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import Avatar from '@/components/Avatar';
import SettlementItem from '@/components/SettlementItem';
import EmptyState from '@/components/EmptyState';
import NavBar from '@/components/NavBar';
import {
  calculateUserBalances,
  simplifyDebts,
  getTotalExpense,
  getUserById,
} from '@/utils/aaCalculator';
import { formatMoney } from '@/utils/format';
import styles from './index.module.scss';

const SettlePage: React.FC = () => {
  const { trips, currentTripId, markSettled, isSettled } = useTripStore();

  useDidShow(() => {
    console.log('[Settle] 页面显示');
  });

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const expenses = currentTrip?.expenses || [];
  const members = currentTrip?.members || [];

  const balances = useMemo(() => {
    return calculateUserBalances(expenses, members);
  }, [expenses, members]);

  const settlements = useMemo(() => {
    return simplifyDebts(balances, members);
  }, [balances, members]);

  const totalExpense = getTotalExpense(expenses);

  const handleMarkSettled = useCallback(
    (fromUserId: string, toUserId: string, amount: number) => {
      Taro.showModal({
        title: '确认结清',
        content: '确定要标记这笔账为已结清吗？',
        success: (res) => {
          if (res.confirm) {
            markSettled(fromUserId, toUserId, amount);
            Taro.showToast({ title: '已标记结清', icon: 'success' });
          }
        },
      });
    },
    [markSettled]
  );

  const handleShareSettlement = useCallback(() => {
    Taro.showToast({
      title: '生成结算单分享',
      icon: 'none',
    });
  }, []);

  const getBalanceUser = (userId: string) => {
    const user = getUserById(members, userId);
    return user;
  };

  const getBalanceLabel = (balance: number) => {
    if (balance > 0.01) return '应收';
    if (balance < -0.01) return '应付';
    return '已结清';
  };

  const getBalanceClass = (balance: number) => {
    if (balance > 0.01) return styles.amountPositive;
    if (balance < -0.01) return styles.amountNegative;
    return styles.amountZero;
  };

  return (
    <View className={styles.page}>
      <NavBar title="AA 结算" showBack={false} />
      <View className={styles.header}>
        <Text className={styles.headerTitle}>当前行程</Text>
        <Text className={styles.tripName}>
          {currentTrip?.title || '请选择行程'}
        </Text>
      </View>

      <ScrollView scrollY>
        <View className={styles.summaryCard}>
          <View className={styles.summaryGrid}>
            <View className={styles.summaryItem}>
              <Text className={styles.summaryValue}>
                ¥{totalExpense.toFixed(0)}
              </Text>
              <Text className={styles.summaryLabel}>总花费</Text>
            </View>
            <View className={styles.summaryItem}>
              <Text className={styles.summaryValue}>{members.length}</Text>
              <Text className={styles.summaryLabel}>参与人数</Text>
            </View>
            <View className={styles.summaryItem}>
              <Text className={styles.summaryValue}>
                ¥{members.length > 0 ? (totalExpense / members.length).toFixed(0) : 0}
              </Text>
              <Text className={styles.summaryLabel}>人均</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>个人账单</Text>
          <View className={styles.balanceList}>
            {balances.map((b) => {
              const user = getBalanceUser(b.userId);
              return (
                <View key={b.userId} className={styles.balanceItem}>
                  <View className={styles.balanceUser}>
                    <Avatar
                      src={user?.avatar}
                      name={user?.nickname}
                      size="medium"
                    />
                    <View className={styles.balanceInfo}>
                      <Text className={styles.userName}>
                        {user?.nickname || '未知'}
                      </Text>
                      <Text className={styles.userDetail}>
                        已付 ¥{b.paid.toFixed(2)} / 应花 ¥{b.shouldPay.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <View className={styles.balanceAmount}>
                    <Text className={getBalanceClass(b.balance)}>
                      {b.balance > 0.01
                        ? `+¥${b.balance.toFixed(2)}`
                        : b.balance < -0.01
                        ? `-¥${Math.abs(b.balance).toFixed(2)}`
                        : '¥0.00'}
                    </Text>
                    <Text className={styles.amountLabel}>
                      {getBalanceLabel(b.balance)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>结算方案</Text>
          {settlements.length > 0 ? (
            <View className={styles.settlementList}>
              {settlements.map((s, index) => {
                const fromUser = getBalanceUser(s.fromUserId);
                const toUser = getBalanceUser(s.toUserId);
                const settled = isSettled(s.fromUserId, s.toUserId, s.amount);
                return (
                  fromUser &&
                  toUser && (
                    <SettlementItem
                      key={index}
                      fromUser={fromUser}
                      toUser={toUser}
                      amount={s.amount}
                      settled={settled}
                      onSettle={() =>
                        handleMarkSettled(s.fromUserId, s.toUserId, s.amount)
                      }
                    />
                  )
                );
              })}
            </View>
          ) : (
            <EmptyState
              icon="✅"
              title="无需结算"
              description="大家的花费都已经平啦"
            />
          )}
        </View>
      </ScrollView>

      <Button className={styles.actionButton} onClick={handleShareSettlement}>
        <Text className={styles.actionBtnText}>生成结算单分享</Text>
      </Button>
    </View>
  );
};

export default SettlePage;
