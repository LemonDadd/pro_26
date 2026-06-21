import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Input,
  Textarea,
  Button,
  ScrollView,
  Switch,
  Picker,
} from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import { addFuelSubsidy } from '@/services/vehicle';
import Avatar from '@/components/Avatar';
import NavBar from '@/components/NavBar';
import { formatDateFull } from '@/utils/format';
import styles from './index.module.scss';

const FuelSubsidyPage: React.FC = () => {
  const router = useRouter();
  const { trips, currentTripId } = useTripStore();

  const vehicleId = router.params.vehicleId;

  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [fuelDate, setFuelDate] = useState(formatDateFull(new Date().toISOString()));
  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelPrice, setFuelPrice] = useState('7.89');
  const [totalAmount, setTotalAmount] = useState('');
  const [isSplit, setIsSplit] = useState(true);
  const [note, setNote] = useState('');
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const vehicles = currentTrip?.vehicles || [];
  const members = currentTrip?.members || [];

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId),
    [vehicles, selectedVehicleId]
  );

  const owner = useMemo(
    () => members.find((m) => m.id === selectedVehicle?.ownerId),
    [members, selectedVehicle]
  );

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      if (vehicleId) {
        setSelectedVehicleId(vehicleId);
      } else {
        setSelectedVehicleId(vehicles[0].id);
      }
    }
  }, [vehicles, selectedVehicleId, vehicleId]);

  useEffect(() => {
    const amount = parseFloat(fuelAmount) || 0;
    const price = parseFloat(fuelPrice) || 0;
    if (amount > 0 && price > 0) {
      const total = amount * price;
      setTotalAmount(total.toFixed(2));
    }
  }, [fuelAmount, fuelPrice]);



  const handleVehicleSelect = useCallback((id: string) => {
    setSelectedVehicleId(id);
    setShowVehiclePicker(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!currentTripId) {
      Taro.showToast({ title: '请先选择行程', icon: 'none' });
      return;
    }

    if (!selectedVehicleId) {
      Taro.showToast({ title: '请选择车辆', icon: 'none' });
      return;
    }

    const amountNum = parseFloat(fuelAmount) || 0;
    if (amountNum <= 0) {
      Taro.showToast({ title: '请输入加油量', icon: 'none' });
      return;
    }

    const priceNum = parseFloat(fuelPrice) || 0;
    if (priceNum <= 0) {
      Taro.showToast({ title: '请输入油价', icon: 'none' });
      return;
    }

    const totalNum = parseFloat(totalAmount) || 0;
    if (totalNum <= 0) {
      Taro.showToast({ title: '总金额不能为0', icon: 'none' });
      return;
    }

    try {
      Taro.showLoading({ title: '提交中...' });
      await addFuelSubsidy(currentTripId, {
        vehicleId: selectedVehicleId,
        fuelDate,
        fuelAmount: amountNum,
        fuelPrice: priceNum,
        totalAmount: totalNum,
        isSplit,
        note: note.trim() || undefined,
      });
      Taro.hideLoading();
      Taro.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } catch (err) {
      Taro.hideLoading();
    }
  }, [
    currentTripId,
    selectedVehicleId,
    fuelDate,
    fuelAmount,
    fuelPrice,
    totalAmount,
    isSplit,
    note,
  ]);

  return (
    <View className={styles.page}>
      <NavBar title="油费补贴录入" showBack />
      <ScrollView scrollY>
        <View className={styles.section}>
          <View
            className={styles.inputRow}
            onClick={() => setShowVehiclePicker(true)}
          >
            <Text className={styles.inputLabel}>选择车辆</Text>
            <View className={styles.inputContent}>
              <View className={styles.vehicleSelector}>
                {selectedVehicle ? (
                  <>
                    <Text className={styles.vehicleName}>
                      {selectedVehicle.model}
                    </Text>
                    {selectedVehicle.plateNumber && (
                      <Text className={styles.plateText}>
                        {selectedVehicle.plateNumber}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text className={styles.placeholderText}>请选择车辆</Text>
                )}
                <Text className={styles.arrowIcon}>›</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Picker
            mode="date"
            value={fuelDate}
            onChange={(e) => setFuelDate(e.detail.value)}
          >
            <View className={styles.inputRow}>
              <Text className={styles.inputLabel}>加油日期</Text>
              <View className={styles.inputContent}>
                <Text className={styles.dateText}>{fuelDate}</Text>
              </View>
            </View>
          </Picker>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>加油量</Text>
            <View className={styles.inputContent}>
              <View className={styles.inputWithUnit}>
                <Input
                  className={styles.textInput}
                  type="digit"
                  placeholder="请输入"
                  placeholderClass={styles.inputPlaceholder}
                  value={fuelAmount}
                  onInput={(e) => setFuelAmount(e.detail.value)}
                />
                <Text className={styles.unitText}>升</Text>
              </View>
            </View>
          </View>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>当日油价</Text>
            <View className={styles.inputContent}>
              <View className={styles.inputWithUnit}>
                <Input
                  className={styles.textInput}
                  type="digit"
                  placeholder="7.89"
                  placeholderClass={styles.inputPlaceholder}
                  value={fuelPrice}
                  onInput={(e) => setFuelPrice(e.detail.value)}
                />
                <Text className={styles.unitText}>元/升</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>总金额</Text>
            <View className={styles.inputContent}>
              <View className={styles.totalAmountWrapper}>
                <Text className={styles.currencySymbol}>¥</Text>
                <Input
                  className={styles.totalAmountInput}
                  type="digit"
                  placeholder="0.00"
                  placeholderClass={styles.inputPlaceholder}
                  value={totalAmount}
                  onInput={(e) => setTotalAmount(e.detail.value)}
                />
              </View>
            </View>
          </View>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>是否分摊</Text>
            <View className={styles.inputContent}>
              <Switch
                checked={isSplit}
                onChange={(e) => setIsSplit(e.detail.value)}
                color="#ff6b35"
              />
            </View>
          </View>
        </View>

        {selectedVehicle && (
          <View className={styles.section}>
            <View className={styles.inputRow}>
              <Text className={styles.inputLabel}>付款人</Text>
              <View className={styles.inputContent}>
                <View className={styles.payerInfo}>
                  <Avatar
                    src={owner?.avatar}
                    name={owner?.nickname}
                    size="small"
                  />
                  <Text className={styles.payerName}>
                    {owner?.nickname || '车主'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>备注</Text>
          </View>
          <View style={{ padding: '0 32rpx 24rpx' }}>
            <Textarea
              className={styles.noteInput}
              placeholder="添加备注信息..."
              placeholderClass={styles.inputPlaceholder}
              value={note}
              onInput={(e) => setNote(e.detail.value)}
              maxlength={200}
              autoHeight
            />
          </View>
        </View>
      </ScrollView>

      {showVehiclePicker && (
        <View
          className={styles.pickerMask}
          onClick={() => setShowVehiclePicker(false)}
        >
          <View
            className={styles.pickerContent}
            onClick={(e) => e.stopPropagation()}
          >
            <View className={styles.pickerHeader}>
              <Text className={styles.pickerTitle}>选择车辆</Text>
            </View>
            <ScrollView scrollY className={styles.pickerList}>
              {vehicles.map((vehicle) => (
                <View
                  key={vehicle.id}
                  className={styles.pickerItem}
                  onClick={() => handleVehicleSelect(vehicle.id)}
                >
                  <View className={styles.pickerItemInfo}>
                    <Text className={styles.vehicleIcon}>🚗</Text>
                    <View>
                      <Text className={styles.pickerItemTitle}>
                        {vehicle.model}
                      </Text>
                      {vehicle.plateNumber && (
                        <Text className={styles.pickerItemSubtitle}>
                          {vehicle.plateNumber}
                        </Text>
                      )}
                    </View>
                  </View>
                  {selectedVehicleId === vehicle.id && (
                    <Text className={styles.checkIcon}>✓</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>保存</Text>
        </Button>
      </View>
    </View>
  );
};

export default FuelSubsidyPage;
