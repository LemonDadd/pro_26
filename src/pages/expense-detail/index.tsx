import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
  Image,
} from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import { getExpenseDetail } from '@/services/expense';
import type { Expense } from '@/types';
import Avatar from '@/components/Avatar';
import CategoryIcon from '@/components/CategoryIcon';
import { categoryLabels, formatTimestamp, formatMoney } from '@/utils/format';
import NavBar from '@/components/NavBar';
import styles from './index.module.scss';

const ExpenseDetailPage: React.FC = () => {
  const router = useRouter();
  const { trips, currentTripId, deleteExpense } = useTripStore();

  const expenseId = router.params.id;

  const [expense, setExpense] = useState<Expense | null>(null);

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const members = currentTrip?.members || [];

  useDidShow(() => {
    if (!expenseId) return;
    getExpenseDetail(expenseId)
      .then((data) => setExpense(data))
      .catch(() => {});
  });

  const payer = useMemo(
    () => members.find((m) => m.id === expense?.payerId),
    [members, expense]
  );

  const participantShares = useMemo(() => {
    if (!expense) return [];
    return expense.participants.map((p) => {
      const user = members.find((m) => m.id === p.id);
      return {
        userId: p.id,
        nickname: p.nickname || user?.nickname || '未知',
        avatar: p.avatar || user?.avatar,
        shareAmount: p.splitAmount || expense.amount / expense.participants.length,
      };
    });
  }, [expense, members]);

  const handleDelete = useCallback(() => {
    if (!expenseId || !currentTripId) return;

    Taro.showModal({
      title: '删除确认',
      content: '确定要删除这笔费用吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteExpense(currentTripId, expenseId);
            Taro.showToast({ title: '已删除', icon: 'success' });
            setTimeout(() => {
              Taro.navigateBack();
            }, 1000);
          } catch (err) {
          }
        }
      },
    });
  }, [expenseId, currentTripId, deleteExpense]);

  const handleEdit = useCallback(() => {
    if (!expenseId) return;
    Taro.navigateTo({ url: `/pages/add-expense/index?expenseId=${expenseId}` });
  }, [expenseId]);

  if (!expense) {
    return (
      <View className={styles.page}>
        <NavBar title="费用详情" showBack />
        <Text style={{ padding: 100, textAlign: 'center', display: 'block', color: '#86909c' }}>
          费用不存在
        </Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <NavBar title="费用详情" showBack />
      <View className={styles.header}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
          <CategoryIcon category={expense.category} size="medium" />
          <Text className={styles.descText}>
            {categoryLabels[expense.category]}
          </Text>
        </View>
        <Text className={styles.amountText}>¥{formatMoney(expense.amount)}</Text>
        <Text className={styles.descText}>{expense.description}</Text>
        <Text className={styles.metaText}>
          {formatTimestamp(expense.createdAt)}
        </Text>
      </View>

      <ScrollView scrollY style={{ paddingBottom: 140 }}>
        <View className={styles.section}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>付款人</Text>
            <View className={styles.payerInfo}>
              <Avatar
                src={payer?.avatar}
                name={payer?.nickname}
                size="small"
              />
              <Text className={styles.infoValue}>{payer?.nickname || '-'}</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>分摊方式</Text>
            <Text className={styles.infoValue}>
              {expense.splitType === 'equal'
                ? '均摊'
                : expense.splitType === 'percentage'
                ? '按比例'
                : '自定义'}
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              参与人 ({expense.participants.length}人)
            </Text>
          </View>
          <View className={styles.participantList}>
            {participantShares.map((p) => (
              <View key={p.userId} className={styles.participantItem}>
                <View className={styles.participantInfo}>
                  <Avatar
                    src={p.avatar}
                    name={p.nickname}
                    size="small"
                  />
                  <Text className={styles.participantName}>{p.nickname}</Text>
                </View>
                <Text className={styles.shareAmount}>
                  ¥{formatMoney(p.shareAmount)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {expense.note && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>备注</Text>
            </View>
            <Text className={styles.noteText}>{expense.note}</Text>
          </View>
        )}

        {expense.receiptImage && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>小票照片</Text>
            </View>
            <Image
              src={expense.receiptImage}
              mode="aspectFill"
              className={styles.receiptImage}
              style={{ margin: 24, width: 'calc(100% - 48px)' }}
              onError={(e) =>
                console.error('[ExpenseDetail] 小票图片加载失败', e)
              }
            />
          </View>
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.deleteBtn} onClick={handleDelete}>
          <Text className={styles.deleteBtnText}>删除</Text>
        </Button>
        <Button className={styles.editBtn} onClick={handleEdit}>
          <Text className={styles.editBtnText}>编辑</Text>
        </Button>
      </View>
    </View>
  );
};

export default ExpenseDetailPage;
