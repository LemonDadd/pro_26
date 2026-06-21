import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import Avatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import {
  getDaysBetween,
  formatDate,
} from '@/utils/format';
import { getTotalExpense, getAveragePerPerson } from '@/utils/aaCalculator';
import styles from './index.module.scss';

const TripDetailPage: React.FC = () => {
  const router = useRouter();
  const { trips, setCurrentTrip, fetchTripDetail, loading, generateInviteCode } = useTripStore();
  const [loaded, setLoaded] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  const tripId = router.params.id;

  useDidShow(() => {
    if (tripId) {
      fetchTripDetail(tripId).finally(() => setLoaded(true));
    }
  });

  const trip = useMemo(() => {
    return trips.find((t) => t.id === tripId);
  }, [trips, tripId]);

  const totalExpense = trip ? getTotalExpense(trip.expenses || []) : 0;
  const avgPerPerson = trip
    ? getAveragePerPerson(trip.expenses || [], trip.members.length)
    : 0;
  const days = trip ? getDaysBetween(trip.startDate, trip.endDate) : 0;

  const handleViewMembers = useCallback(() => {
    Taro.navigateTo({ url: `/pages/members/index?tripId=${tripId}` });
  }, [tripId]);

  const handleInvite = useCallback(async () => {
    if (!tripId || qrLoading) return;
    setQrLoading(true);
    try {
      const { inviteCode: code } = await generateInviteCode(tripId);
      setInviteCode(code);
      Taro.setClipboardData({ data: code });
    } catch (err) {
    } finally {
      setQrLoading(false);
    }
  }, [tripId, generateInviteCode, qrLoading]);




  const handleEditTrip = useCallback(() => {
    Taro.navigateTo({ url: `/pages/create-trip/index?tripId=${tripId}` });
  }, [tripId]);

  const handleAddExpense = useCallback(() => {
    if (tripId) {
      setCurrentTrip(tripId);
      Taro.navigateTo({ url: '/pages/add-expense/index' });
    }
  }, [tripId, setCurrentTrip]);

  if (!trip) {
    return (
      <View className={styles.page}>
        <NavBar title="行程详情" showBack />
        <View style={{ padding: 100, textAlign: 'center' }}>
          <Text>{loading || !loaded ? '加载中...' : '行程不存在'}</Text>
        </View>
      </View>
    );
  }

  const leader = trip.members.find((m) => m.id === trip.leaderId);

  return (
    <View className={styles.page}>
      <NavBar title="行程详情" showBack />
      <View className={styles.header}>
        <Text className={styles.tripTitle}>{trip.title}</Text>
        <Text className={styles.tripSubtitle}>📍 {trip.destination} · {days}天行程</Text>
      </View>

      <ScrollView scrollY>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>总花费</Text>
            <Text className={styles.infoValue}>¥{totalExpense.toFixed(2)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>人均花费</Text>
            <Text className={styles.infoValue}>¥{avgPerPerson.toFixed(2)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>行程日期</Text>
            <Text className={styles.infoValue}>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>队长</Text>
            <Text className={styles.infoValue}>{leader?.nickname || '-'}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>同行伙伴 ({trip.members.length}人)</Text>
            <Text className={styles.sectionMore} onClick={handleViewMembers}>
              管理 →
            </Text>
          </View>
          <View className={styles.memberList}>
            {trip.members.slice(0, 6).map((member) => (
              <View key={member.id} className={styles.memberItem}>
                <Avatar src={member.avatar} name={member.nickname} size="large" />
                <Text className={styles.memberName}>{member.nickname}</Text>
                {member.id === trip.leaderId && (
                  <Text className={styles.leaderBadge}>队长</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {trip.days && trip.days.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>行程概要</Text>
            </View>
            <View className={styles.dayList}>
              {trip.days.map((day) => (
                <View key={day.day} className={styles.dayItem}>
                  <View className={styles.dayNumber}>D{day.day}</View>
                  <View className={styles.dayInfo}>
                    <Text className={styles.dayDestination}>{day.destination}</Text>
                    <Text className={styles.dayDesc}>{day.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>邀请伙伴</Text>
          </View>
          <View className={styles.qrCard}>
            <View className={styles.qrPlaceholder} onClick={handleInvite}>
              <Text className={styles.qrIcon}>📱</Text>
            </View>
            <Text className={styles.qrTip}>
              生成小程序码，分享到微信群邀请伙伴加入
            </Text>
            {inviteCode ? (
              <Text className={styles.qrTip}>邀请码：{inviteCode}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button
          className={`${styles.bottomBtn} ${styles.secondaryBtn}`}
          onClick={handleEditTrip}
        >
          <Text className={styles.btnText}>编辑</Text>
        </Button>
        <Button
          className={`${styles.bottomBtn} ${styles.primaryBtn}`}
          onClick={handleAddExpense}
        >
          <Text className={styles.btnText}>记一笔</Text>
        </Button>
      </View>
    </View>
  );
};

export default TripDetailPage;
