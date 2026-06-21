import React, { useCallback, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import type { PersonalStats } from '@/types';
import NavBar from '@/components/NavBar';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { currentUser, fetchMineSummary } = useTripStore();
  const [summary, setSummary] = useState<PersonalStats | null>(null);

  useDidShow(() => {
    fetchMineSummary()
      .then((res) => setSummary(res.stats))
      .catch(() => {});
  });

  const totalTrips = summary?.totalTrips || 0;
  const totalSpent = summary?.totalExpense || 0;
  const expenseCount = summary?.totalExpenseCount || 0;

  const handleMenuItem = useCallback((key: string) => {
    const actions: Record<string, () => void> = {
      vehicles: () =>
        Taro.navigateTo({ url: '/pages/vehicles/index' }),
      templates: () =>
        Taro.navigateTo({ url: '/pages/templates/index' }),
      settings: () =>
        Taro.navigateTo({ url: '/pages/settings/index' }),
      help: () =>
        Taro.navigateTo({ url: '/pages/help/index' }),
      about: () => Taro.showToast({ title: '关于我们', icon: 'none' }),
    };
    actions[key]?.();
  }, []);

  const menuGroups = [
    {
      title: '行程管理',
      items: [
        { key: 'vehicles', icon: '🚗', text: '我的车辆', badge: '' },
        { key: 'templates', icon: '📋', text: '行程模板', badge: '' },
      ],
    },
    {
      title: '其他',
      items: [
        { key: 'settings', icon: '⚙️', text: '设置', badge: '' },
        { key: 'help', icon: '❓', text: '帮助与反馈', badge: '' },
        { key: 'about', icon: 'ℹ️', text: '关于我们', badge: '' },
      ],
    },
  ];

  return (
    <View>
      <NavBar title="我的" showBack={false} />
      <ScrollView scrollY className={styles.page}>
        <View className={styles.header}>
        <View className={styles.userProfile}>
          <Image
            className={styles.userAvatar}
            src={currentUser.avatar}
            mode="aspectFill"
            onError={(e) => console.error('[Mine] 头像加载失败', e)}
          />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{currentUser.nickname}</Text>
            <Text className={styles.userDesc}>ID: {currentUser.id}</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{totalTrips}</Text>
            <Text className={styles.statLabel}>次旅行</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              ¥{totalSpent.toFixed(0)}
            </Text>
            <Text className={styles.statLabel}>累计花费</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{expenseCount}</Text>
            <Text className={styles.statLabel}>记账笔数</Text>
          </View>
        </View>
      </View>

      {menuGroups.map((group, groupIndex) => (
        <View key={groupIndex} className={styles.menuSection}>
          {group.items.map((item) => (
            <View
              key={item.key}
              className={styles.menuItem}
              onClick={() => handleMenuItem(item.key)}
            >
              <Text className={styles.menuIcon}>{item.icon}</Text>
              <Text className={styles.menuText}>{item.text}</Text>
              {item.badge && (
                <Text className={styles.menuBadge}>{item.badge}</Text>
              )}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      ))}

      <View className={styles.footer}>
        <Text className={styles.footerText}>旅行拼车 AA v1.0.0</Text>
      </View>
      </ScrollView>
    </View>
  );
};

export default MinePage;
