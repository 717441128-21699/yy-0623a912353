import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import CheckItem from '@/components/CheckItem';
import { usePatientStore } from '@/store/usePatientStore';
import type { CheckItemKey, CheckItemStatus } from '@/types/patient';
import classnames from 'classnames';

type FilterType = 'all' | 'pending' | 'tomorrow' | 'completed';

const CheckPage: React.FC = () => {
  const { patients, updateCheckItem, addPhoto } = usePatientStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');

  const stats = useMemo(() => {
    const total = patients.length;
    const completed = patients.filter(p => 
      p.checkItems.every(item => item.status === 'completed')
    ).length;
    const pending = patients.filter(p => 
      p.checkItems.some(item => item.status === 'pending')
    ).length;
    const tomorrow = patients.filter(p => 
      p.checkItems.some(item => item.status === 'tomorrow')
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, tomorrow, percent };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    if (filter === 'all') return patients;
    if (filter === 'completed') {
      return patients.filter(p => p.checkItems.every(item => item.status === 'completed'));
    }
    if (filter === 'tomorrow') {
      return patients.filter(p => p.checkItems.some(item => item.status === 'tomorrow'));
    }
    return patients.filter(p => p.checkItems.some(item => item.status === 'pending'));
  }, [patients, filter]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const toggleCheckItem = useCallback((patientId: string, itemKey: CheckItemKey) => {
    const patient = patients.find(p => p.id === patientId);
    const item = patient?.checkItems.find(i => i.key === itemKey);
    if (!item) return;

    const currentStatus = item.status || (item.completed ? 'completed' : 'pending');
    let newStatus: CheckItemStatus;
    if (currentStatus === 'completed') {
      newStatus = 'pending';
    } else {
      newStatus = 'completed';
    }
    
    updateCheckItem(patientId, itemKey, newStatus);
  }, [patients, updateCheckItem]);

  const handlePhoto = useCallback((patientId: string, itemKey: CheckItemKey) => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        if (tempFilePaths && tempFilePaths.length > 0) {
          console.log('[CheckPage] 选择图片成功:', tempFilePaths[0]);
          addPhoto(patientId, itemKey, tempFilePaths[0]);
          Taro.showToast({ title: '照片已补录', icon: 'success' });
        }
      },
      fail: (err) => {
        console.log('[CheckPage] 选择图片失败:', err);
        if (err.errMsg?.includes('cancel')) {
          return;
        }
        Taro.showToast({ title: '拍照失败，请重试', icon: 'none' });
      }
    });
  }, [addPhoto]);

  const handleMarkTomorrow = useCallback((patientId: string, itemKey: CheckItemKey) => {
    Taro.showModal({
      title: '标记明日处理',
      content: '确定将此项目标记为明日处理吗？标记后将与普通待完善区分显示。',
      confirmText: '确定标记',
      success: (res) => {
        if (res.confirm) {
          updateCheckItem(patientId, itemKey, 'tomorrow');
          Taro.showToast({ title: '已标记明日处理', icon: 'success' });
        }
      }
    });
  }, [updateCheckItem]);

  const isPatientCompleted = (patient: typeof patients[0]) => {
    return patient.checkItems.every(item => item.status === 'completed');
  };

  const isPatientHasTomorrow = (patient: typeof patients[0]) => {
    return patient.checkItems.some(item => item.status === 'tomorrow');
  };

  const getPendingCount = (patient: typeof patients[0]) => {
    return patient.checkItems.filter(i => i.status === 'pending').length;
  };

  const getTomorrowCount = (patient: typeof patients[0]) => {
    return patient.checkItems.filter(i => i.status === 'tomorrow').length;
  };

  const getStatusText = (patient: typeof patients[0]) => {
    const pendingCount = getPendingCount(patient);
    const tomorrowCount = getTomorrowCount(patient);
    if (isPatientCompleted(patient)) return '全部完成';
    if (pendingCount > 0 && tomorrowCount > 0) {
      return `${pendingCount}项待完善 · ${tomorrowCount}项明日`;
    }
    if (pendingCount > 0) return `${pendingCount}项待完善`;
    if (tomorrowCount > 0) return `${tomorrowCount}项明日处理`;
    return '';
  };

  const getStatusColor = (patient: typeof patients[0]) => {
    if (isPatientCompleted(patient)) return '#00b42a';
    if (getPendingCount(patient) > 0) return '#ff7d00';
    if (getTomorrowCount(patient) > 0) return '#722ed1';
    return '#86909c';
  };

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>每日自查</Text>
        <Text className={styles.subtitle}>每天关门前10分钟，确保医疗质量</Text>

        <View className={styles.progressBar}>
          <View 
            className={styles.progressFill} 
            style={{ width: `${stats.percent}%` }}
          />
        </View>

        <View className={styles.progressText}>
          <Text>完成进度 {stats.percent}%</Text>
          <Text>{stats.completed}/{stats.total} 例</Text>
        </View>
      </View>

      <View className={styles.filterTabs}>
        <View 
          className={classnames(styles.filterTab, filter === 'all' && styles.active)}
          onClick={() => setFilter('all')}
        >
          全部 {stats.total}
        </View>
        <View 
          className={classnames(styles.filterTab, filter === 'pending' && styles.active)}
          onClick={() => setFilter('pending')}
        >
          待自查 {stats.pending}
        </View>
        <View 
          className={classnames(styles.filterTab, filter === 'tomorrow' && styles.active)}
          onClick={() => setFilter('tomorrow')}
          style={filter === 'tomorrow' ? { background: '#722ed1', color: '#fff' } : {}}
        >
          明日 {stats.tomorrow}
        </View>
        <View 
          className={classnames(styles.filterTab, filter === 'completed' && styles.active)}
          onClick={() => setFilter('completed')}
        >
          已完成 {stats.completed}
        </View>
      </View>

      <View className={styles.content}>
        {stats.pending === 0 && stats.tomorrow === 0 && filter === 'all' && (
          <View className={styles.allDoneTip}>
            <Text className={styles.allDoneTitle}>🎉 今日自查全部完成</Text>
            <Text className={styles.allDoneDesc}>太棒了！今天的医疗质量控制做得很好</Text>
          </View>
        )}

        {filteredPatients.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>
              {filter === 'completed' && '暂无已完成自查的病例'}
              {filter === 'pending' && '暂无待自查的病例'}
              {filter === 'tomorrow' && '暂无标记明日处理的病例'}
              {filter === 'all' && '暂无病例'}
            </Text>
          </View>
        ) : (
          filteredPatients.map(patient => {
            const isExpanded = expandedIds.has(patient.id);
            const isCompleted = isPatientCompleted(patient);
            const hasTomorrow = isPatientHasTomorrow(patient);

            return (
              <View 
                key={patient.id} 
                className={classnames(
                  styles.checkCard,
                  isCompleted && styles.completed,
                  hasTomorrow && !isCompleted && styles.hasTomorrow
                )}
              >
                <View 
                  className={styles.cardHeader}
                  onClick={() => toggleExpand(patient.id)}
                >
                  <View className={styles.patientInfo}>
                    <View className={styles.avatar}>
                      <Text className={styles.avatarText}>
                        {patient.name.charAt(0)}
                      </Text>
                    </View>
                    <View className={styles.info}>
                      <Text className={styles.name}>{patient.name}</Text>
                      <Text className={styles.treatment}>
                        {patient.treatmentName} · {patient.doctor}
                      </Text>
                    </View>
                  </View>

                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <View className={styles.checkDots}>
                      {patient.checkItems.map(item => {
                        const status = item.status || (item.completed ? 'completed' : 'pending');
                        return (
                          <View 
                            key={item.key}
                            className={classnames(
                              styles.checkDot,
                              status === 'completed' && styles.done,
                              status === 'tomorrow' && styles.dotTomorrow,
                              status === 'pending' && styles.pending
                            )}
                          >
                            {status === 'completed' ? '✓' : status === 'tomorrow' ? '📅' : ''}
                          </View>
                        );
                      })}
                    </View>
                    {!isCompleted && (
                      <Text className={styles.pendingCount} style={{ color: getStatusColor(patient) }}>
                        {getStatusText(patient)}
                      </Text>
                    )}
                    <Text className={classnames(
                      styles.cardExpand,
                      isExpanded && styles.expanded
                    )}>
                      ›
                    </Text>
                  </View>
                </View>

                {isExpanded && (
                  <View className={styles.checkList}>
                    {patient.checkItems.map(item => (
                      <CheckItem
                        key={item.key}
                        item={item}
                        showActions
                        onPhoto={() => handlePhoto(patient.id, item.key)}
                        onMarkTomorrow={() => handleMarkTomorrow(patient.id, item.key)}
                        onToggle={() => toggleCheckItem(patient.id, item.key)}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default CheckPage;
