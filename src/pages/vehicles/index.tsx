import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import Avatar from '@/components/Avatar';
import { formatMoney } from '@/utils/format';
import NavBar from '@/components/NavBar';
import styles from './index.module.scss';

const VehiclesPage: React.FC = () => {
  const { trips, currentTripId } = useTripStore();

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const vehicles = currentTrip?.vehicles || [];
  const members = currentTrip?.members || [];
  const expenses = currentTrip?.expenses || [];

  const getOwnerFuelCost = useCallback(
    (ownerId: string) => {
      return expenses
        .filter((e) => e.category === 'fuel' && e.payerId === ownerId)
        .reduce((sum, e) => sum + e.amount, 0);
    },
    [expenses]
  );

  const handleAddVehicle = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/vehicle-edit/index',
    });
  }, []);

  const handleAddFuel = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/fuel-subsidy/index',
    });
  }, []);

  const handleVehicleClick = useCallback((vehicleId: string) => {
    Taro.navigateTo({
      url: `/pages/vehicle-detail/index?id=${vehicleId}`,
    });
  }, []);

  const getOwnerById = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members]
  );

  return (
    <View className={styles.page}>
      <NavBar title="车辆管理" showBack />
      <View className={styles.header}>
        <Text className={styles.headerTitle}>拼车用车</Text>
        <Text className={styles.headerSubtitle}>
          油费过路费按人头/里程分摊
        </Text>
      </View>

      <ScrollView scrollY>
        <View className={styles.vehicleList}>
          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => {
              const owner = getOwnerById(vehicle.ownerId);
              return (
                <View
                  key={vehicle.id}
                  className={styles.vehicleCard}
                  onClick={() => handleVehicleClick(vehicle.id)}
                >
                  <View className={styles.vehicleHeader}>
                    <View className={styles.vehicleModel}>
                      <Text className={styles.vehicleIcon}>🚗</Text>
                      <View>
                        <Text className={styles.vehicleName}>
                          {vehicle.model}
                        </Text>
                        {vehicle.plateNumber && (
                          <Text className={styles.plateText}>
                            {vehicle.plateNumber}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View className={styles.infoGrid}>
                    <View className={styles.infoItem}>
                      <Text className={styles.infoValue}>
                        {vehicle.capacity}
                      </Text>
                      <Text className={styles.infoLabel}>承载人数</Text>
                    </View>
                    <View className={styles.infoItem}>
                      <Text className={styles.infoValue}>
                        {vehicle.fuelConsumption}
                      </Text>
                      <Text className={styles.infoLabel}>百公里油耗</Text>
                    </View>
                    <View className={styles.infoItem}>
                      <Text className={styles.infoValue}>
                        ¥{formatMoney(getOwnerFuelCost(vehicle.ownerId))}
                      </Text>
                      <Text className={styles.infoLabel}>累计油费</Text>
                    </View>
                  </View>

                  <View className={styles.vehicleOwner}>
                    <Avatar
                      src={owner?.avatar}
                      name={owner?.name}
                      size="small"
                    />
                    <Text className={styles.ownerLabel}>车主</Text>
                    <Text className={styles.ownerName}>
                      {owner?.name || '未知'}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🚙</Text>
              <Text className={styles.emptyTitle}>暂无车辆</Text>
              <Text className={styles.emptyDesc}>
                添加车辆后可以记录油费、过路费
              </Text>
            </View>
          )}
        </View>

        <View className={styles.addBtn} onClick={handleAddVehicle}>
          <Text className={styles.addBtnIcon}>+</Text>
          <Text className={styles.addBtnText}>添加车辆</Text>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.fuelBtn} onClick={handleAddFuel}>
          <Text className={styles.fuelBtnText}>⛽ 录入油费补贴</Text>
        </Button>
      </View>
    </View>
  );
};

export default VehiclesPage;
