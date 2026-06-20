import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import type { CheckItem as CheckItemType } from '@/types/patient';

interface CheckItemProps {
  item: CheckItemType;
  onPhoto?: () => void;
  onMarkTomorrow?: () => void;
  onToggle?: () => void;
  showActions?: boolean;
}

const CheckItem: React.FC<CheckItemProps> = ({ 
  item, 
  onPhoto, 
  onMarkTomorrow,
  onToggle,
  showActions = false
}) => {
  const handlePhoto = (e) => {
    e.stopPropagation();
    if (onPhoto) {
      onPhoto();
    } else {
      Taro.showToast({ title: '拍照补录', icon: 'none' });
    }
  };

  const handleMarkTomorrow = (e) => {
    e.stopPropagation();
    if (onMarkTomorrow) {
      onMarkTomorrow();
    } else {
      Taro.showToast({ title: '已标记明日处理', icon: 'success' });
    }
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <View 
      className={classnames(
        styles.item,
        item.completed && styles.completed
      )}
      onClick={handleToggle}
    >
      <View className={styles.checkbox}>
        {item.completed ? (
          <View className={styles.checked}>✓</View>
        ) : (
          <View className={styles.unchecked} />
        )}
      </View>

      <View className={styles.content}>
        <Text className={styles.name}>{item.name}</Text>
        <Text className={styles.status}>
          {item.completed ? '已完成' : '待完善'}
        </Text>
      </View>

      {showActions && !item.completed && (
        <View className={styles.actions}>
          {item.canPhoto && (
            <View className={styles.photoBtn} onClick={handlePhoto}>
              <Text className={styles.photoText}>拍照</Text>
            </View>
          )}
          <View className={styles.tomorrowBtn} onClick={handleMarkTomorrow}>
            <Text className={styles.tomorrowText}>明日</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default CheckItem;
