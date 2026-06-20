import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classNames from 'classnames';
import styles from './index.module.scss';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionText,
  onAction,
  className,
}) => {
  return (
    <View className={classNames(styles.emptyState, className)}>
      <Text className={styles.emptyIcon}>{icon}</Text>
      <Text className={styles.emptyTitle}>{title}</Text>
      {description && <Text className={styles.emptyDesc}>{description}</Text>}
      {actionText && onAction && (
        <Button className={styles.actionBtn} onClick={onAction}>
          <Text className={styles.btnText}>{actionText}</Text>
        </Button>
      )}
    </View>
  );
};

export default EmptyState;
