import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import Avatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import { formatMoney } from '@/utils/format';
import styles from './index.module.scss';

const MembersPage: React.FC = () => {
  const { trips, currentTripId } = useTripStore();

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const members = currentTrip?.members || [];
  const expenses = currentTrip?.expenses || [];

  const handleAddMember = useCallback(() => {
    Taro.showToast({ title: '邀请码功能开发中', icon: 'none' });
  }, []);

  const handleInvite = useCallback(() => {
    Taro.showToast({ title: '生成邀请码...', icon: 'loading' });
    setTimeout(() => {
      Taro.showModal({
        title: '邀请同伴',
        content: '小程序码已生成\n将图片分享到微信群即可邀请',
        showCancel: false,
      });
    }, 1000);
  }, []);

  const getMemberStat = useCallback(
    (userId: string) => {
      const paid = expenses
        .filter((e) => e.payerId === userId)
        .reduce((sum, e) => sum + e.amount, 0);

      const spent = expenses
        .filter((e) => e.participants.includes(userId))
        .reduce((sum, e) => {
          const share = e.amount / e.participants.length;
          return sum + share;
        }, 0);

      return { paid, spent, balance: paid - spent };
    },
    [expenses]
  );

  return (
    <View className={styles.page}>
      <NavBar title="同伴管理" showBack />
      <View className={styles.header}>
        <Text className={styles.headerTitle}>同伴管理</Text>
        <Text className={styles.headerSubtitle}>
          共 {members.length} 位同伴
        </Text>
      </View>

      <ScrollView scrollY>
        <View className={styles.memberList}>
          {members.map((member) => {
            const stat = getMemberStat(member.id);
            const isLeader = member.id === currentTrip?.leaderId;
            return (
              <View key={member.id} className={styles.memberItem}>
                <Avatar
                  src={member.avatar}
                  name={member.name}
                  size="large"
                />
                <View className={styles.memberInfo}>
                  <Text className={styles.memberName}>
                    {isLeader && (
                      <Text className={styles.leaderBadge}>队长</Text>
                    )}
                    {member.name}
                  </Text>
                  <Text className={styles.memberRole}>
                    已付 ¥{formatMoney(stat.paid)} · 分摊 ¥
                    {formatMoney(stat.spent)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color:
                      stat.balance >= 0 ? '#00b42a' : '#f53f3f',
                  }}
                >
                  {stat.balance >= 0 ? '+' : ''}
                  ¥{formatMoney(stat.balance)}
                </Text>
              </View>
            );
          })}
        </View>

        <View className={styles.addBtn} onClick={handleAddMember}>
          <Text className={styles.addBtnIcon}>+</Text>
          <Text className={styles.addBtnText}>添加同伴</Text>
        </View>

        <View className={styles.addBtn} onClick={handleInvite}>
          <Text className={styles.addBtnIcon}>📱</Text>
          <Text className={styles.addBtnText}>生成邀请码</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default MembersPage;
