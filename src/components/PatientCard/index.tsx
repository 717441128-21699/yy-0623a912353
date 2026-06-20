import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { Patient } from '@/types/patient';
import { treatmentTypeMap } from '@/data/mockPatients';
import classnames from 'classnames';

interface PatientCardProps {
  patient: Patient;
  showRiskTag?: boolean;
  onClick?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, showRiskTag = false, onClick }) => {
  const typeInfo = treatmentTypeMap[patient.treatmentType] || { name: '其他', color: '#86909c' };
  const pendingCount = patient.checkItems.filter(item => !item.completed).length;
  const hasRisk = patient.risks.length > 0;

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
    <View 
      className={classnames(styles.card, hasRisk && styles.hasRisk)} 
      onClick={handleClick}
    >
      <View className={styles.header}>
        <View className={styles.left}>
          <View className={styles.avatar} style={{ backgroundColor: typeInfo.color + '20' }}>
            <Text className={styles.avatarText} style={{ color: typeInfo.color }}>
              {patient.name.charAt(0)}
            </Text>
          </View>
          <View className={styles.info}>
            <Text className={styles.name}>{patient.name}</Text>
            <Text className={styles.meta}>
              {patient.gender} · {patient.age}岁 · {patient.doctor}
            </Text>
          </View>
        </View>
        <View className={styles.right}>
          <Text className={styles.fee}>¥{patient.fee}</Text>
          <Text className={styles.time}>{patient.endTime}</Text>
        </View>
      </View>

      <View className={styles.body}>
        <View className={styles.tag} style={{ backgroundColor: typeInfo.color + '15', color: typeInfo.color }}>
          {typeInfo.name}
        </View>
        <Text className={styles.treatment}>{patient.treatmentName}</Text>
      </View>

      <View className={styles.footer}>
        <View className={styles.checkStatus}>
          {patient.checkItems.map(item => (
            <View 
              key={item.key} 
              className={classnames(
                styles.checkDot,
                item.completed ? styles.completed : styles.pending
              )}
            >
              {item.completed ? '✓' : ''}
            </View>
          ))}
          {pendingCount > 0 && (
            <Text className={styles.pendingText}>{pendingCount}项待完善</Text>
          )}
        </View>
        
        {showRiskTag && hasRisk && (
          <View className={styles.riskTag}>
            <Text className={styles.riskText}>⚠ {patient.risks.length}项风险</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PatientCard;
