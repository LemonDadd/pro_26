import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import {
  calculateUserBalances,
  simplifyDebts,
  getTotalExpense,
  getAveragePerPerson,
} from '@/utils/aaCalculator';
import { formatMoney } from '@/utils/format';
import Avatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import styles from './index.module.scss';

const SettleDetailPage: React.FC = () => {
  const { trips, currentTripId, toggleSettled, isItemSettled } = useTripStore();

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const expenses = currentTrip?.expenses || [];
  const members = currentTrip?.members || [];

  const balances = useMemo(
    () => calculateUserBalances(expenses, members),
    [expenses, members]
  );

  const settlements = useMemo(
    () => simplifyDebts(balances, members),
    [balances, members]
  );

  const totalExpense = useMemo(
    () => getTotalExpense(expenses),
    [expenses]
  );

  const averagePerPerson = useMemo(
    () => getAveragePerPerson(expenses, members.length),
    [expenses, members.length]
  );

  const getUserById = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members]
  );

  const handleTransfer = useCallback(
    (item: { fromUserId: string; toUserId: string; amount: number }) => {
      const fromUser = getUserById(item.fromUserId);
      const toUser = getUserById(item.toUserId);
      Taro.showModal({
        title: '转账提示',
        content: `请向 ${toUser?.name || 'TA'} 转账 ¥${formatMoney(
          item.amount
        )}\n\n转账完成后点击「已结清」标记`,
        confirmText: '知道了',
        showCancel: false,
      });
    },
    [getUserById]
  );

  const handleSettle = useCallback(
    (itemId: string) => {
      const wasSettled = isItemSettled(itemId);
      toggleSettled(itemId);
      Taro.showToast({
        title: wasSettled ? '已取消结清' : '已标记结清',
        icon: 'success',
      });
    },
    [isItemSettled, toggleSettled]
  );

  const handleShare = useCallback(() => {
    Taro.showActionSheet({
      itemList: ['生成结算单图片', '分享到微信群', '复制结算信息'],
      success: (res) => {
        const actions = [
          '结算单图片生成中...',
          '正在生成分享卡片...',
          '结算信息已复制',
        ];
        Taro.showToast({
          title: actions[res.tapIndex],
          icon: 'none',
        });
      },
    });
  }, []);

  return (
    <View className={styles.page}>
      <NavBar title="结算详情" showBack />
      <View className={styles.header}>
        <Text className={styles.title}>结算方案</Text>
        <Text className={styles.subtitle}>
          共 {settlements.length} 笔转账，轻松结清
        </Text>
      </View>

      <ScrollView scrollY style={{ paddingBottom: 40 }}>
        <View className={styles.totalSection}>
          <View className={styles.totalItem}>
            <Text className={styles.totalLabel}>总花费</Text>
            <Text className={styles.totalValue}>
              ¥{formatMoney(totalExpense)}
            </Text>
          </View>
          <View className={styles.totalItem}>
            <Text className={styles.totalLabel}>人均</Text>
            <Text className={styles.totalValue}>
              ¥{formatMoney(averagePerPerson)}
            </Text>
          </View>
          <View className={styles.totalItem}>
            <Text className={styles.totalLabel}>转账笔数</Text>
            <Text className={styles.totalValue}>{settlements.length}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>转账明细</Text>
          </View>
          <View className={styles.settleList}>
            {settlements.map((item) => {
              const fromUser = getUserById(item.fromUserId);
              const toUser = getUserById(item.toUserId);
              const itemId = `${item.fromUserId}-${item.toUserId}-${item.amount}`;
              const isSettled = isItemSettled(itemId);

              return (
                <View key={itemId} className={styles.settleItem}>
                  <View className={styles.settleFrom}>
                    <Avatar
                      src={fromUser?.avatar}
                      name={fromUser?.name}
                      size="medium"
                      style={{ marginLeft: 'auto', marginBottom: 4 }}
                    />
                    <Text className={styles.userName}>
                      {fromUser?.name || '未知'}
                    </Text>
                  </View>

                  <View className={styles.amountBox}>
                    <Text className={styles.arrow}>→</Text>
                    <Text className={styles.amountText}>
                      ¥{formatMoney(item.amount)}
                    </Text>
                    <View
                      className={`${styles.statusTag} ${isSettled ? styles.settled : styles.pending}`}
                    >
                      {isSettled ? '已结清' : '待结算'}
                    </View>
                  </View>

                  <View className={styles.settleTo}>
                    <Avatar
                      src={toUser?.avatar}
                      name={toUser?.name}
                      size="medium"
                      style={{ marginBottom: 4 }}
                    />
                    <Text className={styles.userName}>
                      {toUser?.name || '未知'}
                    </Text>
                  </View>

                  <View style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Button
                      className={styles.actionBtn}
                      style={{ background: isSettled ? '#e5e6eb' : '#ff6b35' }}
                      onClick={() => handleSettle(itemId)}
                    >
                      <Text
                        className={styles.actionBtnText}
                        style={{ color: isSettled ? '#86909c' : '#fff' }}
                      >
                        {isSettled ? '取消' : '结清'}
                      </Text>
                    </Button>
                    {!isSettled && (
                      <Button
                        className={styles.actionBtn}
                        style={{ background: '#00b42a' }}
                        onClick={() => handleTransfer(item)}
                      >
                        <Text className={styles.actionBtnText}>
                          转给TA
                        </Text>
                      </Button>
                    )}
                  </View>
                </View>
              );
            })}

            {settlements.length === 0 && (
              <Text
                style={{
                  textAlign: 'center',
                  color: '#86909c',
                  padding: '40rpx 0',
                  fontSize: 24,
                  display: 'block',
                }}
              >
                暂无结算记录
              </Text>
            )}
          </View>
        </View>

        <View className={styles.shareSection}>
          <Button className={styles.shareBtn} onClick={handleShare}>
            <Text className={styles.shareBtnText}>生成长图</Text>
          </Button>
          <Button
            className={`${styles.shareBtn} ${styles.primary}`}
            onClick={handleShare}
          >
            <Text className={styles.shareBtnText}>分享结算单</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettleDetailPage;
