import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import PatientCard from '@/components/PatientCard';
import RiskCard from '@/components/RiskCard';
import { usePatientStore } from '@/store/usePatientStore';
import { 
  getTreatmentGroups, 
  getRiskPatients,
  getPendingCheckPatients,
  getTomorrowCheckPatients
} from '@/data/mockPatients';
import type { TreatmentType } from '@/types/patient';
import classnames from 'classnames';

const TodayPage: React.FC = () => {
  const { patients } = usePatientStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<TreatmentType>>(
    new Set(['cleaning', 'filling', 'extraction', 'pediatric', 'other'])
  );

  const treatmentGroups = useMemo(() => getTreatmentGroups(patients), [patients]);
  const riskPatients = useMemo(() => getRiskPatients(patients), [patients]);
  const pendingPatients = useMemo(() => getPendingCheckPatients(patients), [patients]);
  const tomorrowPatients = useMemo(() => getTomorrowCheckPatients(patients), [patients]);

  const today = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const weekday = weekdays[today.getDay()];

  const toggleGroup = useCallback((type: TreatmentType) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(type)) {
        newExpanded.delete(type);
      } else {
        newExpanded.add(type);
      }
      return newExpanded;
    });
  }, []);

  const handlePullDownRefresh = useCallback(() => {
    Taro.showToast({ title: '刷新成功', icon: 'success' });
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  }, []);

  React.useEffect(() => {
    Taro.onPullDownRefresh(handlePullDownRefresh);
    return () => {
      Taro.stopPullDownRefresh();
    };
  }, [handlePullDownRefresh]);

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <View className={styles.dateRow}>
          <Text className={styles.date}>{dateStr}</Text>
          <Text className={styles.weekday}>{weekday}</Text>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{patients.length}</Text>
            <Text className={styles.statLabel}>今日患者</Text>
          </View>
          <View className={classnames(styles.statItem, styles.statWarning)}>
            <Text className={styles.statNumber}>{pendingPatients.length}</Text>
            <Text className={styles.statLabel}>待自查</Text>
          </View>
          {tomorrowPatients.length > 0 && (
            <View className={classnames(styles.statItem, styles.statTomorrow)}>
              <Text className={styles.statNumber}>{tomorrowPatients.length}</Text>
              <Text className={styles.statLabel}>明日</Text>
            </View>
          )}
          <View className={classnames(styles.statItem, styles.statDanger)}>
            <Text className={styles.statNumber}>{riskPatients.length}</Text>
            <Text className={styles.statLabel}>有风险</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {riskPatients.length > 0 && (
          <View className={styles.riskSection}>
            <View className={styles.sectionTitle}>
              <View className={styles.sectionTitleLeft}>
                <View className={styles.sectionDot} />
                <Text className={styles.sectionTitleText}>风险提醒</Text>
              </View>
              <View className={styles.sectionCount}>
                {riskPatients.length}例
              </View>
            </View>

            {riskPatients.map(patient => (
              <RiskCard key={patient.id} patient={patient} />
            ))}
          </View>
        )}

        <View className={styles.sectionTitle}>
          <View className={styles.sectionTitleLeft}>
            <View className={styles.sectionDot} style={{ backgroundColor: '#00a0e9' }} />
            <Text className={styles.sectionTitleText}>今日患者</Text>
          </View>
        </View>

        {treatmentGroups.map(group => (
          <View key={group.type} className={styles.patientGroup}>
            <View className={styles.groupHeader} onClick={() => toggleGroup(group.type)}>
              <View className={styles.groupLeft}>
                <View 
                  className={styles.groupTag} 
                  style={{ backgroundColor: group.color + '20', color: group.color }}
                >
                  {group.name}
                </View>
                <Text className={styles.groupCount}>{group.count}人</Text>
              </View>
              <Text className={classnames(
                styles.groupArrow,
                expandedGroups.has(group.type) && styles.expanded
              )}>
                ›
              </Text>
            </View>

            {expandedGroups.has(group.type) && (
              <View>
                {group.patients.map(patient => (
                  <PatientCard key={patient.id} patient={patient} showRiskTag />
                ))}
              </View>
            )}
          </View>
        ))}

        {patients.length === 0 && (
          <View className={styles.emptyTip}>
            今日暂无患者
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TodayPage;
