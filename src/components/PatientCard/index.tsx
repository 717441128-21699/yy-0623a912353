import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { Patient, CheckItem, CheckItemStatus } from '@/types/patient';
import { treatmentTypeMap } from '@/data/mockPatients';
import classnames from 'classnames';

const getItemStatus = (item: CheckItem): CheckItemStatus => {
  return item.status || (item.completed ? 'completed' : 'pending');
};

interface PatientCardProps {
  patient: Patient;
  showRiskTag?: boolean;
  onClick?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, showRiskTag = false, onClick }) => {
  const typeInfo = treatmentTypeMap[patient.treatmentType] || { name: '其他', color: '#86909c' };
  
  const pendingCount = patient.checkItems.filter(item => getItemStatus(item) === 'pending').length;
  const tomorrowCount = patient.checkItems.filter(item => getItemStatus(item) === 'tomorrow').length;
  const completedCount = patient.checkItems.filter(item => getItemStatus(item) === 'completed').length;
  const isAllCompleted = completedCount === patient.checkItems.length;
  
  const hasRisk = patient.risks.length > 0;
  const hasTomorrow = tomorrowCount > 0;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/patient-detail/index?id=${patient.id}`
      });
    }
  };

  const getStatusText = () => {
    if (isAllCompleted) return '全部完成';
    if (pendingCount > 0 && tomorrowCount > 0) {
      return `${pendingCount}项待完善 · ${tomorrowCount}项明日`;
    }
    if (pendingCount > 0) return `${pendingCount}项待完善`;
    if (tomorrowCount > 0) return `${tomorrowCount}项明日处理`;
    return '';
  };

  const getStatusColor = () => {
    if (isAllCompleted) return '#00b42a';
    if (pendingCount > 0) return '#ff7d00';
    if (tomorrowCount > 0) return '#722ed1';
    return '#86909c';
  };

  return (
    <View 
      className={classnames(
        styles.card, 
        hasRisk && styles.hasRisk,
        isAllCompleted && styles.allCompleted
      )} 
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
          {patient.checkItems.map(item => {
            const status = item.status || (item.completed ? 'completed' : 'pending');
            return (
              <View 
                key={item.key} 
                className={classnames(
                  styles.checkDot,
                  status === 'completed' && styles.completed,
                  status === 'tomorrow' && styles.tomorrow,
                  status === 'pending' && styles.pending
                )}
              >
                {status === 'completed' ? '✓' : status === 'tomorrow' ? '📅' : ''}
              </View>
            );
          })}
          {(pendingCount > 0 || tomorrowCount > 0) && (
            <Text className={styles.pendingText} style={{ color: getStatusColor() }}>
              {getStatusText()}
            </Text>
          )}
        </View>
        
        <View className={styles.rightTags}>
          {hasTomorrow && (
            <View className={styles.tomorrowTag}>
              <Text className={styles.tomorrowTagText}>📅 明日</Text>
            </View>
          )}
          {showRiskTag && hasRisk && (
            <View className={styles.riskTag}>
              <Text className={styles.riskText}>⚠ {patient.risks.length}项风险</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default PatientCard;
