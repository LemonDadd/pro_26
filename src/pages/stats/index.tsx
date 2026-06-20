import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
  Canvas,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import Avatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import {
  getTotalExpense,
  getAveragePerPerson,
  getCategoryStats,
  calculateUserBalances,
} from '@/utils/aaCalculator';
import { categoryLabels, categoryEmojis } from '@/utils/format';
import { ExpenseCategory } from '@/types';
import styles from './index.module.scss';

const categoryColors: Record<ExpenseCategory, string> = {
  food: '#ff7d00',
  hotel: '#165dff',
  transport: '#722ed1',
  ticket: '#00b42a',
  fuel: '#f53f3f',
  toll: '#13c2c2',
  parking: '#faad14',
  other: '#86909c',
};

const StatsPage: React.FC = () => {
  const { trips, currentTripId, currentUser } = useTripStore();
  const canvasRef = useRef<any>(null);

  useDidShow(() => {
    console.log('[Stats] 页面显示');
  });

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const expenses = currentTrip?.expenses || [];
  const members = currentTrip?.members || [];

  const totalExpense = getTotalExpense(expenses);
  const avgPerPerson = getAveragePerPerson(expenses, members.length);
  const categoryStats = getCategoryStats(expenses);

  const userBalances = useMemo(() => {
    return calculateUserBalances(expenses, members);
  }, [expenses, members]);

  const myBalance = useMemo(() => {
    return userBalances.find((b) => b.userId === currentUser.id);
  }, [userBalances, currentUser.id]);

  const getBalanceClass = (balance: number) => {
    if (balance > 0.01) return styles.positive;
    if (balance < -0.01) return styles.negative;
    return styles.zero;
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0.01) return `收 ¥${balance.toFixed(0)}`;
    if (balance < -0.01) return `付 ¥${Math.abs(balance).toFixed(0)}`;
    return '已结清';
  };

  const handleShare = useCallback(() => {
    Taro.showToast({
      title: '生成分享卡片',
      icon: 'none',
    });
  }, []);

  const drawPieChart = useCallback(() => {
    if (!canvasRef.current || categoryStats.length === 0) return;

    const query = Taro.createSelectorQuery();
    query
      .select('#pieCanvas')
      .fields({ node: true, size: true })
      .exec((res: any) => {
        if (!res || !res[0]) return;

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        const dpr = Taro.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        const centerX = 150;
        const centerY = 150;
        const radius = 120;

        let startAngle = -Math.PI / 2;

        categoryStats.forEach((stat) => {
          const sliceAngle = (stat.amount / totalExpense) * 2 * Math.PI;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
          ctx.closePath();
          ctx.fillStyle = categoryColors[stat.category] || '#86909c';
          ctx.fill();

          startAngle += sliceAngle;
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, 70, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.fillStyle = '#1d2129';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`¥${totalExpense.toFixed(0)}`, centerX, centerY - 8);

        ctx.fillStyle = '#86909c';
        ctx.font = '12px sans-serif';
        ctx.fillText('总花费', centerX, centerY + 16);
      });
  }, [categoryStats, totalExpense]);

  useEffect(() => {
    const timer = setTimeout(() => {
      drawPieChart();
    }, 300);
    return () => clearTimeout(timer);
  }, [drawPieChart]);

  return (
    <View className={styles.page}>
      <NavBar title="统计分析" showBack={false} />
      <View className={styles.header}>
        <View className={styles.tripSelector}>
          <Text className={styles.tripName}>
            {currentTrip?.title || '请选择行程'}
          </Text>
          <Text className={styles.tripArrow}>▼</Text>
        </View>

        <View className={styles.overviewCard}>
          <View className={styles.overviewTotal}>
            <Text className={styles.totalLabel}>本次旅行总花费</Text>
            <Text className={styles.totalAmount}>¥{totalExpense.toFixed(2)}</Text>
          </View>
          <View className={styles.overviewGrid}>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{members.length}</Text>
              <Text className={styles.overviewLabel}>参与人数</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>
                ¥{avgPerPerson.toFixed(0)}
              </Text>
              <Text className={styles.overviewLabel}>人均花费</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{expenses.length}</Text>
              <Text className={styles.overviewLabel}>记账笔数</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>我的账单</Text>
          </View>
          <View className={styles.personalCard}>
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="large"
            />
            <View className={styles.personalInfo}>
              <Text className={styles.personalName}>{currentUser.name}</Text>
              <View className={styles.personalStats}>
                <View className={styles.personalStat}>
                  <Text className={styles.personalStatValue}>
                    ¥{myBalance?.paid.toFixed(0) || 0}
                  </Text>
                  <Text className={styles.personalStatLabel}>我垫付</Text>
                </View>
                <View className={styles.personalStat}>
                  <Text className={styles.personalStatValue}>
                    ¥{myBalance?.shouldPay.toFixed(0) || 0}
                  </Text>
                  <Text className={styles.personalStatLabel}>我消费</Text>
                </View>
              </View>
            </View>
            <View
              className={`${styles.balanceTag} ${getBalanceClass(myBalance?.balance || 0)}`}
            >
              <Text className={styles.balanceText}>
                {getBalanceText(myBalance?.balance || 0)}
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>分类统计</Text>
          </View>
          <View className={styles.pieChartSection}>
            <Canvas
              id="pieCanvas"
              type="2d"
              ref={canvasRef}
              className={styles.pieChart}
            />
            <View className={styles.legendList}>
              {categoryStats.map((stat) => (
                <View key={stat.category} className={styles.legendItem}>
                  <View className={styles.legendLeft}>
                    <View
                      className={styles.legendColor}
                      style={{
                        backgroundColor:
                          categoryColors[stat.category] || '#86909c',
                      }}
                    />
                    <Text className={styles.legendName}>
                      {categoryEmojis[stat.category]}{' '}
                      {categoryLabels[stat.category]}
                    </Text>
                  </View>
                  <View className={styles.legendRight}>
                    <Text className={styles.legendAmount}>
                      ¥{stat.amount.toFixed(2)}
                    </Text>
                    <Text className={styles.legendPercent}>
                      {totalExpense > 0
                        ? ((stat.amount / totalExpense) * 100).toFixed(1)
                        : 0}
                      %
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Button className={styles.shareButton} onClick={handleShare}>
          <Text className={styles.shareBtnText}>生成行程分享卡片</Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default StatsPage;
