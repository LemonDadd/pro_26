import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { Trip } from '@/types';
import Avatar from '../Avatar';
import { getDaysBetween, formatDate, formatMoneyShort } from '@/utils/format';
import { getTotalExpense } from '@/utils/aaCalculator';
import styles from './index.module.scss';

interface TripCardProps {
  trip: Trip;
  className?: string;
  onClick?: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, className, onClick }) => {
  const totalExpense = getTotalExpense(trip.expenses || []);
  const days = getDaysBetween(trip.startDate, trip.endDate);
  const leader = trip.members.find((m) => m.id === trip.leaderId);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/trip-detail/index?id=${trip.id}`,
      });
    }
  };

  return (
    <View
      className={classNames(styles.tripCard, className)}
      onClick={handleClick}
    >
      <View className={styles.cardHeader}>
        <View className={styles.tripInfo}>
          <Text className={styles.tripTitle}>{trip.title}</Text>
          <View className={styles.tripMeta}>
            <Text className={styles.metaItem}>📍 {trip.destination}</Text>
            <Text className={styles.metaItem}>📅 {days}天</Text>
          </View>
        </View>
        <View
          className={classNames(
            styles.statusBadge,
            trip.status === 'active' ? styles.active : styles.completed
          )}
        >
          <Text className={styles.statusText}>
            {trip.status === 'active' ? '进行中' : '已结束'}
          </Text>
        </View>
      </View>

      <View className={styles.cardBody}>
        <View className={styles.expenseSection}>
          <Text className={styles.expenseLabel}>总花费</Text>
          <Text className={styles.expenseAmount}>{formatMoneyShort(totalExpense)}</Text>
        </View>

        <View className={styles.membersSection}>
          <View className={styles.memberAvatars}>
            {trip.members.slice(0, 4).map((member, index) => (
              <View
                key={member.id}
                className={styles.avatarWrap}
                style={{ marginLeft: index > 0 ? '-16rpx' : 0 }}
              >
                <Avatar src={member.avatar} name={member.name} size="small" />
              </View>
            ))}
            {trip.members.length > 4 && (
              <View className={styles.moreMembers}>
                <Text className={styles.moreText}>+{trip.members.length - 4}</Text>
              </View>
            )}
          </View>
          <Text className={styles.memberCount}>
            {trip.members.length}人
          </Text>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <Text className={styles.dateText}>
          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
        </Text>
        {leader && (
          <View className={styles.leaderInfo}>
            <Text className={styles.leaderLabel}>队长：</Text>
            <Text className={styles.leaderName}>{leader.name}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TripCard;
