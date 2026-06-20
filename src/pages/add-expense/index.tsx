import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Input,
  Textarea,
  Button,
  ScrollView,
  Image,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import { ExpenseCategory, SplitType } from '@/types';
import {
  categoryLabels,
  categoryEmojis,
  generateId,
} from '@/utils/format';
import Avatar from '@/components/Avatar';
import styles from './index.module.scss';

const AddExpensePage: React.FC = () => {
  const { trips, currentTripId, currentUser, addExpense, setCurrentTrip } = useTripStore();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [payerId, setPayerId] = useState(currentUser.id);
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [receiptImage, setReceiptImage] = useState('');
  const [currency, setCurrency] = useState('CNY');
  const [exchangeRate, setExchangeRate] = useState('1');

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId),
    [trips, currentTripId]
  );

  const members = currentTrip?.members || [];

  React.useEffect(() => {
    if (members.length > 0 && selectedMembers.length === 0) {
      setSelectedMembers(members.map((m) => m.id));
    }
  }, [members, selectedMembers.length]);

  const categories: ExpenseCategory[] = [
    'food',
    'hotel',
    'transport',
    'ticket',
    'fuel',
    'toll',
    'parking',
    'other',
  ];

  const currencyOptions = [
    { code: 'CNY', symbol: '¥', name: '人民币' },
    { code: 'USD', symbol: '$', name: '美元' },
    { code: 'EUR', symbol: '€', name: '欧元' },
    { code: 'JPY', symbol: '¥', name: '日元' },
    { code: 'GBP', symbol: '£', name: '英镑' },
    { code: 'HKD', symbol: 'HK$', name: '港币' },
  ];

  const rateNum = parseFloat(exchangeRate) || 0;
  const amountNum = parseFloat(amount) || 0;
  const cnyAmount =
    currency === 'CNY' ? amountNum : amountNum * rateNum;

  const handleCategorySelect = useCallback((cat: ExpenseCategory) => {
    setCategory(cat);
  }, []);

  const handleCurrencyChange = useCallback((code: string) => {
    setCurrency(code);
    const defaults: Record<string, string> = {
      CNY: '1',
      USD: '7.2',
      EUR: '7.8',
      JPY: '0.05',
      GBP: '9.1',
      HKD: '0.92',
    };
    setExchangeRate(defaults[code] || '1');
  }, []);

  const handleMemberToggle = useCallback((userId: string) => {
    setSelectedMembers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((m) => m.id));
    }
  }, [members, selectedMembers.length]);

  const handleChooseImage = useCallback(() => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          setReceiptImage(res.tempFilePaths[0]);
          Taro.showToast({ title: '图片已添加', icon: 'success' });
        }
      },
      fail: (err) => {
        console.error('[AddExpense] 选择图片失败', err);
      },
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!currentTripId) {
      Taro.showToast({ title: '请先选择行程', icon: 'none' });
      return;
    }

    if (!amountNum || amountNum <= 0) {
      Taro.showToast({ title: '请输入金额', icon: 'none' });
      return;
    }

    if (currency !== 'CNY' && (!rateNum || rateNum <= 0)) {
      Taro.showToast({ title: '请输入有效汇率', icon: 'none' });
      return;
    }

    if (!description.trim()) {
      Taro.showToast({ title: '请输入描述', icon: 'none' });
      return;
    }

    if (selectedMembers.length === 0) {
      Taro.showToast({ title: '请选择参与人', icon: 'none' });
      return;
    }

    addExpense({
      tripId: currentTripId,
      amount: Number(cnyAmount.toFixed(2)),
      category,
      description: description.trim(),
      payerId,
      participants: selectedMembers,
      splitType,
      note: note.trim() || undefined,
      receiptImage: receiptImage || undefined,
      currency,
      exchangeRate: currency === 'CNY' ? 1 : rateNum,
      createdBy: currentUser.id,
    });

    Taro.showToast({ title: '记账成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  }, [
    currentTripId,
    amountNum,
    rateNum,
    currency,
    cnyAmount,
    description,
    category,
    payerId,
    selectedMembers,
    splitType,
    note,
    receiptImage,
    addExpense,
    currentUser.id,
  ]);

  const getCategoryBgClass = (cat: ExpenseCategory) => {
    const bgColors: Record<ExpenseCategory, string> = {
      food: 'rgba(255, 125, 0, 0.1)',
      hotel: 'rgba(22, 93, 255, 0.1)',
      transport: 'rgba(114, 46, 209, 0.1)',
      ticket: 'rgba(0, 180, 42, 0.1)',
      fuel: 'rgba(245, 63, 63, 0.1)',
      toll: 'rgba(19, 194, 194, 0.1)',
      parking: 'rgba(250, 173, 20, 0.1)',
      other: 'rgba(134, 144, 156, 0.1)',
    };
    return bgColors[cat];
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.section}>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>金额</Text>
            <View className={styles.inputContent}>
              <Input
                className={styles.amountInput}
                type="digit"
                placeholder="0.00"
                placeholderClass={styles.inputPlaceholder}
                value={amount}
                onInput={(e) => setAmount(e.detail.value)}
                focus
              />
            </View>
          </View>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>描述</Text>
            <View className={styles.inputContent}>
              <Input
                className={styles.textInput}
                placeholder="填写费用说明"
                placeholderClass={styles.inputPlaceholder}
                value={description}
                onInput={(e) => setDescription(e.detail.value)}
              />
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>币种与汇率</Text>
          </View>
          <View className={styles.currencyRow}>
            {currencyOptions.map((opt) => (
              <View
                key={opt.code}
                className={`${styles.currencyChip} ${currency === opt.code ? styles.currencyActive : ''}`}
                onClick={() => handleCurrencyChange(opt.code)}
              >
                <Text className={styles.currencySymbol}>{opt.symbol}</Text>
                <Text className={styles.currencyCode}>{opt.code}</Text>
              </View>
            ))}
          </View>
          {currency !== 'CNY' && (
            <View className={styles.inputRow}>
              <Text className={styles.inputLabel}>汇率</Text>
              <View className={styles.inputContent}>
                <Input
                  className={styles.textInput}
                  type="digit"
                  placeholder={`1 ${currency} = ? CNY`}
                  placeholderClass={styles.inputPlaceholder}
                  value={exchangeRate}
                  onInput={(e) => setExchangeRate(e.detail.value)}
                />
              </View>
            </View>
          )}
          {currency !== 'CNY' && amountNum > 0 && rateNum > 0 && (
            <View className={styles.cnyPreview}>
              <Text className={styles.cnyPreviewText}>
                折合人民币 ¥{cnyAmount.toFixed(2)} 元（以此结算）
              </Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>费用类别</Text>
          </View>
          <View className={styles.categoryGrid}>
            {categories.map((cat) => (
              <View
                key={cat}
                className={`${styles.categoryItem} ${category === cat ? styles.active : ''}`}
                onClick={() => handleCategorySelect(cat)}
              >
                <View
                  className={styles.categoryIcon}
                  style={{ background: getCategoryBgClass(cat) }}
                >
                  <Text>{categoryEmojis[cat]}</Text>
                </View>
                <Text className={styles.categoryName}>
                  {categoryLabels[cat]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>付款人</Text>
            <View className={styles.inputContent}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                <Avatar src={members.find(m => m.id === payerId)?.avatar} name={members.find(m => m.id === payerId)?.name} size="small" />
                <Text className={styles.textInput}>
                  {members.find(m => m.id === payerId)?.name || '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              参与人 ({selectedMembers.length}人)
            </Text>
            <Text
              style={{
                fontSize: 24,
                color: '#ff6b35',
                position: 'absolute',
                right: 32,
                top: 24,
              }}
              onClick={handleSelectAll}
            >
              {selectedMembers.length === members.length ? '取消全选' : '全选'}
            </Text>
          </View>
          <View className={styles.memberList}>
            {members.map((member) => (
              <View
                key={member.id}
                className={styles.memberItem}
                onClick={() => handleMemberToggle(member.id)}
              >
                <View className={styles.memberInfo}>
                  <Avatar
                    src={member.avatar}
                    name={member.name}
                    size="medium"
                  />
                  <Text className={styles.memberName}>{member.name}</Text>
                </View>
                <View
                  className={`${styles.checkbox} ${selectedMembers.includes(member.id) ? styles.checked : ''}`}
                >
                  {selectedMembers.includes(member.id) && (
                    <Text className={styles.checkIcon}>✓</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>分摊方式</Text>
          </View>
          <View className={styles.splitTypeRow}>
            <Button
              className={`${styles.splitTypeBtn} ${splitType === 'equal' ? styles.active : ''}`}
              onClick={() => setSplitType('equal')}
            >
              <Text className={styles.splitTypeText}>均摊</Text>
            </Button>
            <Button
              className={`${styles.splitTypeBtn} ${splitType === 'percentage' ? styles.active : ''}`}
              onClick={() => setSplitType('percentage')}
            >
              <Text className={styles.splitTypeText}>按比例</Text>
            </Button>
            <Button
              className={`${styles.splitTypeBtn} ${splitType === 'custom' ? styles.active : ''}`}
              onClick={() => setSplitType('custom')}
            >
              <Text className={styles.splitTypeText}>自定义</Text>
            </Button>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>备注</Text>
          </View>
          <View style={{ padding: '0 32rpx 24rpx' }}>
            <Textarea
              className={styles.noteInput}
              placeholder="添加备注信息..."
              placeholderClass={styles.inputPlaceholder}
              value={note}
              onInput={(e) => setNote(e.detail.value)}
              maxLength={200}
              autoHeight
            />
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>小票照片</Text>
          </View>
          <View style={{ padding: '0 32rpx 24rpx' }}>
            {receiptImage ? (
              <Image
                src={receiptImage}
                mode="aspectFill"
                style={{ width: 160, height: 160, borderRadius: 12 }}
                onClick={handleChooseImage}
                onError={(e) => console.error('[AddExpense] 小票图片加载失败', e)}
              />
            ) : (
              <View
                className={styles.receiptUpload}
                onClick={handleChooseImage}
              >
                <Text className={styles.uploadIcon}>📷</Text>
                <Text className={styles.uploadText}>拍小票</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>保存</Text>
        </Button>
      </View>
    </View>
  );
};

export default AddExpensePage;
