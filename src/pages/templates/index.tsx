import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { tripTemplates } from '@/data/templates';
import NavBar from '@/components/NavBar';
import styles from './index.module.scss';

const TemplatesPage: React.FC = () => {
  const handleSelectTemplate = useCallback((templateId: string) => {
    Taro.navigateTo({
      url: `/pages/create-trip/index?templateId=${templateId}`,
    });
  }, []);

  return (
    <View className={styles.page}>
      <NavBar title="选择模板" showBack />
      <View className={styles.header}>
        <Text className={styles.headerTitle}>行程模板</Text>
        <Text className={styles.headerSubtitle}>
          选择模板快速创建行程
        </Text>
      </View>

      <ScrollView scrollY>
        <View className={styles.templateList}>
          {tripTemplates.map((template) => (
            <View
              key={template.id}
              className={styles.templateCard}
              onClick={() => handleSelectTemplate(template.id)}
            >
              <Image
                src={template.cover}
                mode="aspectFill"
                className={styles.templateCover}
                onError={(e) =>
                  console.error('[Templates] 模板封面加载失败', e)
                }
              />
              <View className={styles.templateContent}>
                <Text className={styles.templateName}>
                  {template.name}
                </Text>
                <Text className={styles.templateDesc}>
                  {template.description}
                </Text>
                <View className={styles.templateMeta}>
                  <View className={styles.metaItem}>
                    <Text className={styles.metaIcon}>📅</Text>
                    <Text className={styles.metaText}>
                      约 {template.estimatedDays} 天
                    </Text>
                  </View>
                  <View className={styles.metaItem}>
                    <Text className={styles.metaIcon}>💰</Text>
                    <Text className={styles.metaText}>
                      人均 ¥{template.estimatedBudget}
                    </Text>
                  </View>
                </View>
                <View className={styles.tags}>
                  {template.tags.map((tag, index) => (
                    <Text key={index} className={styles.tag}>
                      {tag}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default TemplatesPage;
