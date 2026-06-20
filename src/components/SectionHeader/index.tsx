import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  count?: number;
  color?: string;
  rightText?: string;
  onClick?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  count, 
  color = '#1d2129',
  rightText,
  onClick 
}) => {
  return (
    <View className={styles.header} onClick={onClick}>
      <View className={styles.left}>
        <View className={styles.dot} style={{ backgroundColor: color }} />
        <Text className={styles.title}>{title}</Text>
        {count !== undefined && (
          <Text className={styles.count}>{count}人</Text>
        )}
      </View>
      {rightText && (
        <Text className={styles.rightText}>{rightText}</Text>
      )}
    </View>
  );
};

export default SectionHeader;
