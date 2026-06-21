import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  Image,
} from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import type { TripTemplate } from '@/types';
import TripCard from '@/components/TripCard';
import Avatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import { getTotalExpense } from '@/utils/aaCalculator';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { trips, currentUser, setCurrentTrip, fetchTrips, initialized, joinByCode, fetchTemplates } = useTripStore();
  const [, setRefreshing] = useState(false);
  const [templates, setTemplates] = useState<TripTemplate[]>([]);

  useEffect(() => {
    fetchTemplates({ pageSize: 6 })
      .then(setTemplates)
      .catch(() => {});
  }, [fetchTemplates]);

  useDidShow(() => {
    if (initialized && trips.length === 0) {
      fetchTrips();
    }
  });

  usePullDownRefresh(() => {
    setRefreshing(true);
    fetchTrips()
      .then(() => Taro.showToast({ title: '刷新成功', icon: 'success' }))
      .catch(() => {})
      .finally(() => {
        setRefreshing(false);
        Taro.stopPullDownRefresh();
      });
  });

  const handleCreateTrip = useCallback(() => {
    Taro.navigateTo({ url: '/pages/create-trip/index' });
  }, []);

  const handleScanJoin = useCallback(async () => {
    try {
      const res = await Taro.scanCode({ onlyFromCamera: false, scanType: ['qrCode'] });
      const code = res.result;
      if (!code) return;
      Taro.showLoading({ title: '加入中...' });
      await joinByCode(code);
      Taro.hideLoading();
      Taro.showToast({ title: '加入成功', icon: 'success' });
      setTimeout(() => Taro.switchTab({ url: '/pages/home/index' }), 1000);
    } catch (err) {
      Taro.hideLoading();
    }
  }, [joinByCode]);

  const handleViewAllTrips = useCallback(() => {
    Taro.switchTab({ url: '/pages/expense/index' });
  }, []);

  const handleSelectTemplate = useCallback((templateId: string) => {
    Taro.navigateTo({
      url: `/pages/create-trip/index?templateId=${templateId}`,
    });
  }, []);

  const handleTripClick = useCallback(
    (tripId: string) => {
      setCurrentTrip(tripId);
      Taro.navigateTo({ url: `/pages/trip-detail/index?id=${tripId}` });
    },
    [setCurrentTrip]
  );

  const activeTrips = trips.filter((t) => t.status === 'active');
  const totalTrips = trips.length;
  const totalExpense = trips.reduce(
    (sum, t) => sum + (t.stats?.totalExpense ?? getTotalExpense(t.expenses || [])),
    0
  );

  return (
    <View>
      <NavBar title="旅行拼车 AA" showBack={false} />
      <ScrollView scrollY className={styles.page}>
        <View className={styles.header}>
        <View className={styles.welcomeSection}>
          <View className={styles.userInfo}>
            <Avatar
              src={currentUser.avatar}
              name={currentUser.nickname}
              size="large"
            />
            <View>
              <Text className={styles.welcomeText}>👋 嗨，欢迎回来</Text>
              <Text className={styles.userName}>{currentUser.nickname}</Text>
            </View>
          </View>
          <Button className={styles.scanBtn} onClick={handleScanJoin}>
            <Text className={styles.scanIcon}>📷</Text>
          </Button>
        </View>

        <View className={styles.actionButtons}>
          <Button
            className={`${styles.actionBtn} ${styles.primaryBtn}`}
            onClick={handleCreateTrip}
          >
            <Text className={styles.btnIcon}>➕</Text>
            <Text className={styles.btnText}>创建行程</Text>
          </Button>
          <Button
            className={`${styles.actionBtn} ${styles.secondaryBtn}`}
            onClick={handleScanJoin}
          >
            <Text className={styles.btnIcon}>🔗</Text>
            <Text className={styles.btnText}>扫码加入</Text>
          </Button>
        </View>

        <View className={styles.statsCard}>
          <Text className={styles.statsTitle}>我的旅行数据</Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{totalTrips}</Text>
              <Text className={styles.statLabel}>次行程</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>
                ¥{totalExpense.toFixed(0)}
              </Text>
              <Text className={styles.statLabel}>累计花费</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{activeTrips.length}</Text>
              <Text className={styles.statLabel}>进行中</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>我的行程</Text>
          <Text className={styles.moreBtn} onClick={handleViewAllTrips}>
            查看全部 →
          </Text>
        </View>
        <View className={styles.tripList}>
          {activeTrips.slice(0, 3).map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onClick={() => handleTripClick(trip.id)}
            />
          ))}
        </View>
      </View>

      <View className={styles.templatesSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>热门模板</Text>
          <Text className={styles.moreBtn} onClick={() => Taro.navigateTo({ url: '/pages/templates/index' })}>更多 →</Text>
        </View>
        <ScrollView scrollX className={styles.templateList}>
          {templates.map((template) => (
            <View
              key={template.id}
              className={styles.templateCard}
              onClick={() => handleSelectTemplate(template.id)}
            >
              <Image
                className={styles.templateCover}
                src={template.cover}
                mode="aspectFill"
                onError={(e) =>
                  console.error('[Home] 模板封面加载失败', e)
                }
              />
              <View className={styles.templateInfo}>
                <Text className={styles.templateName}>{template.name}</Text>
                <Text className={styles.templateDesc}>
                  {template.description}
                </Text>
                <View className={styles.templateMeta}>
                  <Text className={styles.templateDays}>
                    {template.estimatedDays}天
                  </Text>
                  <Text className={styles.templateBudget}>
                    ¥{template.estimatedBudget}/人
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      </ScrollView>
    </View>
  );
};

export default HomePage;
