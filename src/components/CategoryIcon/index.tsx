import React from 'react';
import { View, Text } from '@tarojs/components';
import classNames from 'classnames';
import { ExpenseCategory } from '@/types';
import { categoryEmojis } from '@/utils/format';
import styles from './index.module.scss';

interface CategoryIconProps {
  category: ExpenseCategory;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 'medium',
  className,
}) => {
  return (
    <View
      className={classNames(
        styles.categoryIcon,
        styles[category],
        styles[size],
        className
      )}
    >
      <Text className={styles.iconEmoji}>{categoryEmojis[category]}</Text>
    </View>
  );
};

export default CategoryIcon;
