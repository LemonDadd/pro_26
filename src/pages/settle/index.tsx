import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import Avatar from '@/components/Avatar';
import SettlementItem from '@/components/SettlementItem';
import EmptyState from '@/components/EmptyState';
import NavBar from '@/components/NavBar';
import { getUserById } from '@/utils/aaCalculator';
import type { SettlementPlan } from '@/types';
import styles from './index.module.scss';

const SettlePage: React.FC = () => {
  const { trips, currentTripId, fetchSettlement, markSettled, toggleSettled, isItemSettled, shareSettlement } = useTripStore();
  const [plan, setPlan] = useState<SettlementPlan | null>(null);

  useDidShow(() => {
    if (currentTripId) {
      fetchSettlement(currentTripId)
        .then((p) => setPlan(p))
        .catch(() => {});
    }
  });

  const currentTrip = trips.find((t) => t.id === currentTripId);
  const members = currentTrip?.members || [];

  const balances = plan?.userBalances || [];
  const settlements = plan?.settlements || [];
  const totalExpense = plan?.totalExpense || 0;

  const handleMarkSettled = useCallback(
    (settlementId: string | undefined, localKey: string) => {
      Taro.showModal({
        title: '确认结清',
        content: '确定要标记这笔账为已结清吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              if (settlementId) {
                await markSettled(settlementId, localKey);
              } else {
                toggleSettled(localKey);
              }
              Taro.showToast({ title: '已标记结清', icon: 'success' });
            } catch (err) {
            }
          }
        },
      });
    },
    [markSettled, toggleSettled]
  );

  const handleShareSettlement = useCallback(async () => {
    if (!currentTripId) return;
    Taro.showLoading({ title: '生成中...' });
    try {
      const result = await shareSettlement(currentTripId);
      Taro.hideLoading();
      if (result.shareUrl) {
        Taro.setClipboardData({ data: result.shareUrl });
      }
    } catch (err) {
      Taro.hideLoading();
    }
  }, [currentTripId, shareSettlement]);

  const getBalanceUser = (userId: string) => {
    return getUserById(members, userId);
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
                const localKey = s.id || `${s.fromUserId}-${s.toUserId}-${s.amount}`;
                const settled = s.settled || s.status === 'settled' || isItemSettled(localKey);
                return (
                  fromUser &&
                  toUser && (
                    <SettlementItem
                      key={s.id || index}
                      fromUser={fromUser}
                      toUser={toUser}
                      amount={s.amount}
                      settled={settled}
                      onSettle={() => handleMarkSettled(s.id, localKey)}
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
