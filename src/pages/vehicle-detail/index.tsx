import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
} from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import Avatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import ExpenseItem from '@/components/ExpenseItem';
import { formatMoney, formatDate } from '@/utils/format';
import styles from './index.module.scss';

const VehicleDetailPage: React.FC = () => {
  const router = useRouter();
  const { trips, currentTripId, deleteVehicle } = useTripStore();

  const vehicleId = router.params.id;

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const vehicle = useMemo(
    () => currentTrip?.vehicles?.find((v) => v.id === vehicleId),
    [currentTrip, vehicleId]
  );

  const members = currentTrip?.members || [];
  const expenses = currentTrip?.expenses || [];

  const owner = useMemo(
    () => members.find((m) => m.id === vehicle?.ownerId),
    [members, vehicle]
  );

  const fuelExpenses = useMemo(() => {
    if (!vehicle) return [];
    return expenses.filter(
      (e) => e.category === 'fuel' && e.payerId === vehicle.ownerId
    );
  }, [expenses, vehicle]);

  const totalFuelCost = useMemo(() => {
    return fuelExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [fuelExpenses]);

  const handleEdit = useCallback(() => {
    Taro.navigateTo({
      url: `/pages/vehicle-edit/index?id=${vehicleId}`,
    });
  }, [vehicleId]);

  const handleDelete = useCallback(() => {
    if (!currentTripId || !vehicleId) return;

    Taro.showModal({
      title: '删除确认',
      content: '确定要删除这辆车吗？',
      success: (res) => {
        if (res.confirm) {
          deleteVehicle(currentTripId, vehicleId);
          Taro.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        }
      },
    });
  }, [currentTripId, vehicleId, deleteVehicle]);

  const handleExpenseClick = useCallback((expenseId: string) => {
    Taro.navigateTo({
      url: `/pages/expense-detail/index?id=${expenseId}`,
    });
  }, []);

  if (!vehicle) {
    return (
      <View className={styles.page}>
        <NavBar title="车辆详情" showBack />
        <Text
          style={{
            padding: 100,
            textAlign: 'center',
            display: 'block',
            color: '#86909c',
          }}
        >
          车辆不存在
        </Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <NavBar title="车辆详情" showBack />

      <ScrollView scrollY style={{ paddingBottom: 140 }}>
        <View className={styles.header}>
          <View className={styles.vehicleIconWrapper}>
            <Text className={styles.vehicleIcon}>🚗</Text>
          </View>
          <Text className={styles.vehicleModel}>{vehicle.model}</Text>
          {vehicle.plateNumber && (
            <View className={styles.plateBadge}>
              <Text className={styles.plateText}>{vehicle.plateNumber}</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>承载人数</Text>
            <Text className={styles.infoValue}>{vehicle.capacity} 人</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>百公里油耗</Text>
            <Text className={styles.infoValue}>
              {vehicle.fuelConsumption} L
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>车主</Text>
            <View className={styles.ownerInfo}>
              <Avatar
                src={owner?.avatar}
                name={owner?.nickname}
                size="small"
              />
              <Text className={styles.ownerName}>
                {owner?.nickname || '未知'}
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.statsCard}>
            <View className={styles.statsItem}>
              <Text className={styles.statsValue}>¥{formatMoney(totalFuelCost)}</Text>
              <Text className={styles.statsLabel}>累计油费</Text>
            </View>
            <View className={styles.statsDivider} />
            <View className={styles.statsItem}>
              <Text className={styles.statsValue}>{fuelExpenses.length}</Text>
              <Text className={styles.statsLabel}>记账笔数</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>油费记录</Text>
          </View>
          {fuelExpenses.length > 0 ? (
            <View className={styles.expenseList}>
              {fuelExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  members={members}
                  onClick={() => handleExpenseClick(expense.id)}
                />
              ))}
            </View>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>⛽</Text>
              <Text className={styles.emptyText}>暂无油费记录</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.deleteBtn} onClick={handleDelete}>
          <Text className={styles.deleteBtnText}>删除</Text>
        </Button>
        <Button className={styles.editBtn} onClick={handleEdit}>
          <Text className={styles.editBtnText}>编辑</Text>
        </Button>
      </View>
    </View>
  );
};

export default VehicleDetailPage;
