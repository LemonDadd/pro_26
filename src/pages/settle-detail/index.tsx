import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
} from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import { formatMoney } from '@/utils/format';
import Avatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import type { SettlementPlan } from '@/types';
import styles from './index.module.scss';

const SettleDetailPage: React.FC = () => {
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

  const settlements = plan?.settlements || [];
  const totalExpense = plan?.totalExpense || 0;
  const averagePerPerson = plan?.avgPerPerson || 0;

  const getUserById = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members]
  );

  const handleTransfer = useCallback(
    (item: { fromUserId: string; toUserId: string; amount: number }) => {
      const toUser = getUserById(item.toUserId);
      Taro.showModal({
        title: '转账提示',
        content: `请向 ${toUser?.nickname || 'TA'} 转账 ¥${formatMoney(
          item.amount
        )}\n\n转账完成后点击「已结清」标记`,
        confirmText: '知道了',
        showCancel: false,
      });
    },
    [getUserById]
  );

  const handleSettle = useCallback(
    (settlementId: string | undefined, localKey: string) => {
      const wasSettled = isItemSettled(localKey);
      (async () => {
        try {
          if (settlementId && !wasSettled) {
            await markSettled(settlementId, localKey);
          } else {
            toggleSettled(localKey);
          }
          Taro.showToast({
            title: wasSettled ? '已取消结清' : '已标记结清',
            icon: 'success',
          });
        } catch (err) {
        }
      })();
    },
    [isItemSettled, markSettled, toggleSettled]
  );

  const handleShare = useCallback(async () => {
    if (!currentTripId) return;
    Taro.showLoading({ title: '生成中...' });
    try {
      const result = await shareSettlement(currentTripId);
      Taro.hideLoading();
      Taro.showActionSheet({
        itemList: ['生成结算单图片', '分享到微信群', '复制结算信息'],
        success: (res) => {
          if (res.tapIndex === 2) {
            Taro.setClipboardData({ data: result.shareUrl || '' });
          } else if (res.tapIndex === 0 && result.imageUrl) {
            Taro.previewImage({ urls: [result.imageUrl] });
          } else {
            Taro.showToast({ title: '分享卡片已生成', icon: 'none' });
          }
        },
      });
    } catch (err) {
      Taro.hideLoading();
    }
  }, [currentTripId, shareSettlement]);

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
              const localKey = item.id || `${item.fromUserId}-${item.toUserId}-${item.amount}`;
              const isSettled = item.settled || item.status === 'settled' || isItemSettled(localKey);

              return (
                <View key={localKey} className={styles.settleItem}>
                  <View className={styles.settleFrom}>
                    <Avatar
                      src={fromUser?.avatar}
                      name={fromUser?.nickname}
                      size="medium"
                      style={{ marginLeft: 'auto', marginBottom: 4 }}
                    />
                    <Text className={styles.userName}>
                      {fromUser?.nickname || '未知'}
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
                      name={toUser?.nickname}
                      size="medium"
                      style={{ marginBottom: 4 }}
                    />
                    <Text className={styles.userName}>
                      {toUser?.nickname || '未知'}
                    </Text>
                  </View>

                  <View style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Button
                      className={styles.actionBtn}
                      style={{ background: isSettled ? '#e5e6eb' : '#ff6b35' }}
                      onClick={() => handleSettle(item.id, localKey)}
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
