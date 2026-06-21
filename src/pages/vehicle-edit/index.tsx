import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Input,
  Button,
  ScrollView,
} from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import Avatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import styles from './index.module.scss';

const VehicleEditPage: React.FC = () => {
  const router = useRouter();
  const { trips, currentTripId, currentUser, addVehicle, updateVehicle } = useTripStore();

  const vehicleId = router.params.id;
  const isEdit = !!vehicleId;

  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [capacity, setCapacity] = useState(5);
  const [fuelConsumption, setFuelConsumption] = useState('8.0');
  const [ownerId, setOwnerId] = useState('');
  const [showOwnerPicker, setShowOwnerPicker] = useState(false);

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const members = currentTrip?.members || [];
  const vehicles = currentTrip?.vehicles || [];

  useEffect(() => {
    if (isEdit && vehicles.length > 0) {
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (vehicle) {
        setModel(vehicle.model);
        setPlateNumber(vehicle.plateNumber || '');
        setCapacity(vehicle.capacity);
        setFuelConsumption(vehicle.fuelConsumption.toFixed(1));
        setOwnerId(vehicle.ownerId);
      }
    } else {
      setOwnerId(currentUser.id);
    }
  }, [isEdit, vehicleId, vehicles, currentUser.id]);

  const owner = useMemo(
    () => members.find((m) => m.id === ownerId),
    [members, ownerId]
  );

  const handleCapacityMinus = useCallback(() => {
    setCapacity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleCapacityPlus = useCallback(() => {
    setCapacity((prev) => Math.min(20, prev + 1));
  }, []);

  const handleOwnerSelect = useCallback((userId: string) => {
    setOwnerId(userId);
    setShowOwnerPicker(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!currentTripId) {
      Taro.showToast({ title: '请先选择行程', icon: 'none' });
      return;
    }

    if (!model.trim()) {
      Taro.showToast({ title: '请输入车型', icon: 'none' });
      return;
    }

    const fuelNum = parseFloat(fuelConsumption) || 0;
    if (fuelNum <= 0) {
      Taro.showToast({ title: '请输入有效油耗', icon: 'none' });
      return;
    }

    const vehicleData = {
      model: model.trim(),
      plateNumber: plateNumber.trim() || undefined,
      capacity,
      fuelConsumption: Number(fuelNum.toFixed(1)),
      ownerId,
    };

    try {
      if (isEdit) {
        await updateVehicle(currentTripId, vehicleId!, vehicleData);
        Taro.showToast({ title: '保存成功', icon: 'success' });
      } else {
        await addVehicle(currentTripId, vehicleData);
        Taro.showToast({ title: '添加成功', icon: 'success' });
      }

      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } catch (err) {
    }
  }, [
    currentTripId,
    model,
    plateNumber,
    capacity,
    fuelConsumption,
    ownerId,
    isEdit,
    vehicleId,
    addVehicle,
    updateVehicle,
  ]);

  return (
    <View className={styles.page}>
      <NavBar title={isEdit ? '编辑车辆' : '新增车辆'} showBack />
      <ScrollView scrollY>
        <View className={styles.section}>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>车型</Text>
            <View className={styles.inputContent}>
              <Input
                className={styles.textInput}
                placeholder="请输入车型"
                placeholderClass={styles.inputPlaceholder}
                value={model}
                onInput={(e) => setModel(e.detail.value)}
                maxlength={50}
              />
            </View>
          </View>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>车牌号</Text>
            <View className={styles.inputContent}>
              <Input
                className={styles.textInput}
                placeholder="选填"
                placeholderClass={styles.inputPlaceholder}
                value={plateNumber}
                onInput={(e) => setPlateNumber(e.detail.value)}
                maxlength={20}
              />
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>承载人数</Text>
            <View className={styles.stepper}>
              <Button
                className={styles.stepBtn}
                onClick={handleCapacityMinus}
              >
                <Text className={styles.stepBtnText}>-</Text>
              </Button>
              <Text className={styles.stepValue}>{capacity}</Text>
              <Button
                className={styles.stepBtn}
                onClick={handleCapacityPlus}
              >
                <Text className={styles.stepBtnText}>+</Text>
              </Button>
            </View>
          </View>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>百公里油耗</Text>
            <View className={styles.inputContent}>
              <View className={styles.fuelInputWrapper}>
                <Input
                  className={styles.textInput}
                  type="digit"
                  placeholder="8.0"
                  placeholderClass={styles.inputPlaceholder}
                  value={fuelConsumption}
                  onInput={(e) => setFuelConsumption(e.detail.value)}
                />
                <Text className={styles.unitText}>L/100km</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View
            className={styles.inputRow}
            onClick={() => setShowOwnerPicker(true)}
          >
            <Text className={styles.inputLabel}>车主</Text>
            <View className={styles.inputContent}>
              <View className={styles.ownerSelector}>
                <Avatar
                  src={owner?.avatar}
                  name={owner?.nickname}
                  size="small"
                />
                <Text className={styles.ownerName}>
                  {owner?.nickname || '请选择'}
                </Text>
                <Text className={styles.arrowIcon}>›</Text>
              </View>
            </View>
          </View>
        </View>

        {showOwnerPicker && (
          <View
            className={styles.pickerMask}
            onClick={() => setShowOwnerPicker(false)}
          >
            <View
              className={styles.pickerContent}
              onClick={(e) => e.stopPropagation()}
            >
              <View className={styles.pickerHeader}>
                <Text className={styles.pickerTitle}>选择车主</Text>
              </View>
              <ScrollView scrollY className={styles.pickerList}>
                {members.map((member) => (
                  <View
                    key={member.id}
                    className={styles.pickerItem}
                    onClick={() => handleOwnerSelect(member.id)}
                  >
                    <Avatar
                      src={member.avatar}
                      name={member.nickname}
                      size="small"
                    />
                    <Text className={styles.pickerItemText}>
                      {member.nickname}
                    </Text>
                    {ownerId === member.id && (
                      <Text className={styles.checkIcon}>✓</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>保存</Text>
        </Button>
      </View>
    </View>
  );
};

export default VehicleEditPage;
