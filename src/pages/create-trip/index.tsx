import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Input,
  Button,
  ScrollView,
  Image,
} from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import { tripTemplates } from '@/data/templates';
import NavBar from '@/components/NavBar';
import styles from './index.module.scss';

const CreateTripPage: React.FC = () => {
  const router = useRouter();
  const { addTrip, updateTrip, currentUser, trips } = useTripStore();

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const tripId = router.params.tripId;
  const templateId = router.params.templateId;
  const isEditMode = !!tripId;

  const editingTrip = isEditMode
    ? trips.find((t) => t.id === tripId)
    : undefined;

  useEffect(() => {
    if (isEditMode && editingTrip) {
      setTitle(editingTrip.title);
      setDestination(editingTrip.destination);
      setStartDate(editingTrip.startDate);
      setEndDate(editingTrip.endDate);
      setSelectedTemplateId(editingTrip.templateId || '');
    }
  }, [isEditMode, editingTrip]);

  useEffect(() => {
    if (!isEditMode && templateId) {
      setSelectedTemplateId(templateId);
      const template = tripTemplates.find((t) => t.id === templateId);
      if (template) {
        setTitle(template.name + '之旅');
        setDestination(template.name);
      }
    }
  }, [templateId, isEditMode]);

  const handleTemplateSelect = useCallback((id: string) => {
    setSelectedTemplateId(id);
    const template = tripTemplates.find((t) => t.id === id);
    if (template) {
      setTitle(template.name + '之旅');
      setDestination(template.name);
    }
  }, []);

  const handleDateChange = useCallback(
    (type: 'start' | 'end', e: any) => {
      const value = e.detail.value;
      if (type === 'start') {
        setStartDate(value);
      } else {
        setEndDate(value);
      }
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入行程名称', icon: 'none' });
      return;
    }
    if (!destination.trim()) {
      Taro.showToast({ title: '请输入目的地', icon: 'none' });
      return;
    }
    if (!startDate || !endDate) {
      Taro.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }

    const template = tripTemplates.find((t) => t.id === selectedTemplateId);

    if (isEditMode && tripId) {
      updateTrip(tripId, {
        title: title.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        templateId: selectedTemplateId || undefined,
      });

      Taro.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } else {
      addTrip({
        title: title.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        leaderId: currentUser.id,
        members: [currentUser],
        days: template?.sampleDays?.map((d, i) => ({
          ...d,
          day: i + 1,
          date: '',
        })),
        status: 'active',
        templateId: selectedTemplateId || undefined,
      });

      Taro.showToast({ title: '创建成功', icon: 'success' });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1000);
    }
  }, [
    title,
    destination,
    startDate,
    endDate,
    selectedTemplateId,
    isEditMode,
    tripId,
    updateTrip,
    addTrip,
    currentUser,
  ]);

  return (
    <View className={styles.page}>
      <NavBar title={isEditMode ? '编辑行程' : '创建行程'} showBack />
      <ScrollView scrollY>
        <View className={styles.section}>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>行程名称</Text>
            <View className={styles.inputContent}>
              <Input
                className={styles.textInput}
                placeholder="给行程起个名字"
                placeholderClass={styles.inputPlaceholder}
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>目的地</Text>
            <View className={styles.inputContent}>
              <Input
                className={styles.textInput}
                placeholder="要去哪里玩？"
                placeholderClass={styles.inputPlaceholder}
                value={destination}
                onInput={(e) => setDestination(e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>开始日期</Text>
            <View className={styles.inputContent}>
              <Input
                className={styles.textInput}
                type="text"
                placeholder="选择开始日期"
                placeholderClass={styles.inputPlaceholder}
                value={startDate}
                onInput={(e) => handleDateChange('start', e)}
              />
            </View>
          </View>
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>结束日期</Text>
            <View className={styles.inputContent}>
              <Input
                className={styles.textInput}
                type="text"
                placeholder="选择结束日期"
                placeholderClass={styles.inputPlaceholder}
                value={endDate}
                onInput={(e) => handleDateChange('end', e)}
              />
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>选择模板（可选）</Text>
          </View>
          <View className={styles.templateList}>
            {tripTemplates.map((template) => (
              <View
                key={template.id}
                className={`${styles.templateItem} ${selectedTemplateId === template.id ? styles.selected : ''}`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <Image
                  className={styles.templateCover}
                  src={template.cover}
                  mode="aspectFill"
                  onError={(e) =>
                    console.error('[CreateTrip] 模板封面加载失败', e)
                  }
                />
                <View className={styles.templateInfo}>
                  <Text className={styles.templateName}>
                    {template.name}
                  </Text>
                  <Text className={styles.templateDesc}>
                    {template.description} · {template.estimatedDays}天
                  </Text>
                </View>
                {selectedTemplateId === template.id && (
                  <View className={styles.checkmark}>
                    <Text className={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>
            {isEditMode ? '保存修改' : '创建行程'}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default CreateTripPage;
