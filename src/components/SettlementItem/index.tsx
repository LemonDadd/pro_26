import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { User } from '@/types';
import Avatar from '../Avatar';
import { formatMoney } from '@/utils/format';
import styles from './index.module.scss';

interface SettlementItemProps {
  fromUser: User;
  toUser: User;
  amount: number;
  settled?: boolean;
  onSettle?: () => void;
  className?: string;
}

const SettlementItem: React.FC<SettlementItemProps> = ({
  fromUser,
  toUser,
  amount,
  settled = false,
  onSettle,
  className,
}) => {
  const handleTransfer = () => {
    Taro.showActionSheet({
      itemList: ['微信转账', '复制收款信息', '标记已结清'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({
            title: '正在跳转微信转账',
            icon: 'loading',
            duration: 1500,
          });
        } else if (res.tapIndex === 1) {
          const text = `${fromUser.name} 转给 ${toUser.name} ${formatMoney(amount)}`;
          Taro.setClipboardData({
            data: text,
            success: () => {
              Taro.showToast({ title: '已复制', icon: 'success' });
            },
          });
        } else if (res.tapIndex === 2) {
          onSettle?.();
        }
      },
    });
  };

  const handleMarkSettled = () => {
    onSettle?.();
  };

  return (
    <View className={classNames(styles.settlementItem, className, settled && styles.settled)}>
      <View className={styles.userSection}>
        <View className={styles.userInfo}>
          <Avatar src={fromUser.avatar} name={fromUser.name} size="medium" />
          <Text className={styles.userName}>{fromUser.name}</Text>
        </View>

        <View className={styles.transferArrow}>
          <Text className={styles.arrowText}>→</Text>
          <Text className={styles.amountText}>{formatMoney(amount)}</Text>
        </View>

        <View className={styles.userInfo}>
          <Avatar src={toUser.avatar} name={toUser.name} size="medium" />
          <Text className={styles.userName}>{toUser.name}</Text>
        </View>
      </View>

      <View className={styles.actionSection}>
        {settled ? (
          <View className={styles.settledBadge}>
            <Text className={styles.settledText}>✓ 已结清</Text>
          </View>
        ) : (
          <View className={styles.actionButtons}>
            <Button
              className={classNames(styles.actionBtn, styles.primaryBtn)}
              onClick={handleTransfer}
            >
              <Text className={styles.btnText}>转给TA</Text>
            </Button>
            <Button
              className={classNames(styles.actionBtn, styles.secondaryBtn)}
              onClick={handleMarkSettled}
            >
              <Text className={styles.btnSecondaryText}>已结清</Text>
            </Button>
          </View>
        )}
      </View>
    </View>
  );
};

export default SettlementItem;
