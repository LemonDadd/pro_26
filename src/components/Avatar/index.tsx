import React from 'react';
import { Image, View, Text } from '@tarojs/components';
import classNames from 'classnames';
import styles from './index.module.scss';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'medium',
  className,
}) => {
  const firstChar = name.charAt(0);

  return (
    <View className={classNames(styles.avatar, styles[size], className)}>
      {src ? (
        <Image
          className={styles.avatarImg}
          src={src}
          mode="aspectFill"
          onError={(e) => console.error('[Avatar] 图片加载失败', e)}
        />
      ) : (
        <Text className={styles.avatarText}>{firstChar}</Text>
      )}
    </View>
  );
};

export default Avatar;
