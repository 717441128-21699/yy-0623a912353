import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { Patient } from '@/types/patient';

interface RiskCardProps {
  patient: Patient;
  onClick?: () => void;
}

const RiskCard: React.FC<RiskCardProps> = ({ patient, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/patient-detail/index?id=${patient.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.patientInfo}>
          <Text className={styles.name}>{patient.name}</Text>
          <Text className={styles.treatment}>{patient.treatmentName}</Text>
        </View>
        <View className={styles.riskBadge}>
          <Text className={styles.riskBadgeText}>⚠ {patient.risks.length}</Text>
        </View>
      </View>

      <View className={styles.riskList}>
        {patient.risks.map((risk, index) => (
          <View key={index} className={styles.riskItem}>
            <View className={styles.riskDot} />
            <View className={styles.riskContent}>
              <Text className={styles.riskName}>{risk.name}</Text>
              <Text className={styles.riskDesc}>{risk.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.footer}>
        <Text className={styles.doctor}>责任医生：{patient.doctor}</Text>
        <Text className={styles.handleText}>去处理 →</Text>
      </View>
    </View>
  );
};

export default RiskCard;
