import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { Expense, User } from '@/types';
import CategoryIcon from '../CategoryIcon';
import Avatar from '../Avatar';
import { categoryLabels, formatMoney, formatTimestamp } from '@/utils/format';
import styles from './index.module.scss';

interface ExpenseItemProps {
  expense: Expense;
  members: User[];
  className?: string;
  onClick?: () => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  members,
  className,
  onClick,
}) => {
  const payer = members.find((m) => m.id === expense.payerId);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/expense-detail/index?id=${expense.id}`,
      });
    }
  };

  return (
    <View
      className={classNames(styles.expenseItem, className)}
      onClick={handleClick}
    >
      <CategoryIcon category={expense.category} size="medium" />

      <View className={styles.expenseInfo}>
        <View className={styles.expenseHeader}>
          <Text className={styles.description}>{expense.description}</Text>
          <Text className={styles.amount}>-{formatMoney(expense.amount)}</Text>
        </View>
        <View className={styles.expenseMeta}>
          <View className={styles.payerInfo}>
            <Avatar src={payer?.avatar} name={payer?.name} size="small" />
            <Text className={styles.payerName}>{payer?.name} 付</Text>
          </View>
          <Text className={styles.categoryTag}>
            {categoryLabels[expense.category]}
          </Text>
          <Text className={styles.time}>{formatTimestamp(expense.createdAt)}</Text>
        </View>
        {expense.participants.length > 0 && (
          <View className={styles.participantsInfo}>
            <Text className={styles.participantsLabel}>
              {expense.participants.length}人分摊
            </Text>
            {expense.splitType !== 'equal' && (
              <Text className={styles.splitTag}>
                {expense.splitType === 'percentage' ? '按比例' : '自定义'}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ExpenseItem;
