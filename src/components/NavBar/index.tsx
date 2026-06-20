import React, { useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface NavBarProps {
  title: string;
  showBack?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ title, showBack = false }) => {
  const handleBack = useCallback(() => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 1) {
      Taro.navigateBack();
    } else {
      Taro.switchTab({ url: '/pages/home/index' });
    }
  }, []);

  return (
    <View>
      <View className={styles.placeholder} />
      <View className={styles.navBar}>
        {showBack ? (
          <Button className={styles.backBtn} onClick={handleBack}>
            <Text className={styles.backIcon}>‹</Text>
          </Button>
        ) : null}
        <Text
          className={`${styles.title} ${showBack ? styles.titleWithBack : ''}`}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};

export default NavBar;
