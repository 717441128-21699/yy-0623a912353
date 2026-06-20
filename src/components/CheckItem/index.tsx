import React from 'react';
import { View, Text, Image } from '@tarojs/components';
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
  const status = item.status || (item.completed ? 'completed' : 'pending');

  const handlePhoto = (e) => {
    e.stopPropagation();
    if (onPhoto) {
      onPhoto();
    }
  };

  const handleMarkTomorrow = (e) => {
    e.stopPropagation();
    if (onMarkTomorrow) {
      onMarkTomorrow();
    }
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };

  const handlePreviewPhoto = (e) => {
    e.stopPropagation();
    if (item.photoUrl) {
      Taro.previewImage({
        urls: [item.photoUrl]
      });
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed': return '已完成';
      case 'tomorrow': return '明日处理';
      default: return '待完善';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return '#00b42a';
      case 'tomorrow': return '#722ed1';
      default: return '#86909c';
    }
  };

  const showActionButtons = showActions && status === 'pending';

  return (
    <View 
      className={classnames(
        styles.item,
        status === 'completed' && styles.completed,
        status === 'tomorrow' && styles.tomorrow
      )}
      onClick={handleToggle}
    >
      <View className={styles.checkbox}>
        {status === 'completed' && (
          <View className={styles.checked}>✓</View>
        )}
        {status === 'tomorrow' && (
          <View className={styles.tomorrowBox}>
            <Text className={styles.tomorrowIcon}>📅</Text>
          </View>
        )}
        {status === 'pending' && (
          <View className={styles.unchecked} />
        )}
      </View>

      <View className={styles.content}>
        <Text className={styles.name}>{item.name}</Text>
        <Text className={styles.status} style={{ color: getStatusColor() }}>
          {getStatusText()}
        </Text>
      </View>

      {item.photoUrl && (
        <View className={styles.photoPreview} onClick={handlePreviewPhoto}>
          <Image src={item.photoUrl} className={styles.photoImg} mode="aspectFill" />
          <Text className={styles.photoLabel}>已补录</Text>
        </View>
      )}

      {showActionButtons && (
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
