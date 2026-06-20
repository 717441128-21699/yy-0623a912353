import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockPatients } from '@/data/mockPatients';
import type { Patient, CheckItemKey } from '@/types/patient';
import classnames from 'classnames';

type FilterType = 'all' | 'pending' | 'completed';

const CheckPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');

  const stats = useMemo(() => {
    const total = patients.length;
    const completed = patients.filter(p => 
      p.checkItems.every(item => item.completed)
    ).length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percent };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    if (filter === 'all') return patients;
    if (filter === 'completed') {
      return patients.filter(p => p.checkItems.every(item => item.completed));
    }
    return patients.filter(p => p.checkItems.some(item => !item.completed));
  }, [patients, filter]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const toggleCheckItem = (patientId: string, itemKey: CheckItemKey) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      return {
        ...p,
        checkItems: p.checkItems.map(item => {
          if (item.key !== itemKey) return item;
          return { ...item, completed: !item.completed };
        })
      };
    }));
  };

  const handlePhoto = (patientId: string, itemKey: CheckItemKey) => {
    Taro.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0 || res.tapIndex === 1) {
          Taro.showToast({ title: '拍照补录成功', icon: 'success' });
          toggleCheckItem(patientId, itemKey);
        }
      }
    });
  };

  const handleMarkTomorrow = (patientId: string, itemKey: string) => {
    Taro.showModal({
      title: '标记明日处理',
      content: '确定将此项目标记为明日处理吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已标记明日处理', icon: 'success' });
        }
      }
    });
  };

  const isPatientCompleted = (patient: Patient) => {
    return patient.checkItems.every(item => item.completed);
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
          className={classnames(styles.filterTab, filter === 'completed' && styles.active)}
          onClick={() => setFilter('completed')}
        >
          已完成 {stats.completed}
        </View>
      </View>

      <View className={styles.content}>
        {stats.pending === 0 && filter === 'all' && (
          <View className={styles.allDoneTip}>
            <Text className={styles.allDoneTitle}>🎉 今日自查全部完成</Text>
            <Text className={styles.allDoneDesc}>太棒了！今天的医疗质量控制做得很好</Text>
          </View>
        )}

        {filteredPatients.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>
              {filter === 'completed' ? '暂无已完成自查的病例' : '暂无待自查的病例'}
            </Text>
          </View>
        ) : (
          filteredPatients.map(patient => {
            const isExpanded = expandedIds.has(patient.id);
            const isCompleted = isPatientCompleted(patient);

            return (
              <View 
                key={patient.id} 
                className={classnames(
                  styles.checkCard,
                  isCompleted && styles.completed
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
                      {patient.checkItems.map(item => (
                        <View 
                          key={item.key}
                          className={classnames(
                            styles.checkDot,
                            item.completed ? styles.done : styles.pending
                          )}
                        >
                          {item.completed ? '✓' : ''}
                        </View>
                      ))}
                    </View>
                    {!isCompleted && (
                      <Text className={styles.pendingCount}>
                        {patient.checkItems.filter(i => !i.completed).length}项
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
                      <View key={item.key} className={styles.checkItemRow}>
                        <View 
                          className={classnames(
                            styles.checkBox,
                            item.completed ? styles.checked : styles.unchecked
                          )}
                          onClick={() => toggleCheckItem(patient.id, item.key)}
                        >
                          {item.completed && '✓'}
                        </View>

                        <View className={styles.itemInfo}>
                          <Text className={styles.itemName}>{item.name}</Text>
                          <Text className={styles.itemStatus}>
                            {item.completed ? '已完成' : '待完善'}
                          </Text>
                        </View>

                        {!item.completed && (
                          <View className={styles.itemActions}>
                            {item.canPhoto && (
                              <View 
                                className={classnames(styles.actionBtn, styles.photo)}
                                onClick={() => handlePhoto(patient.id, item.key)}
                              >
                                <Text>拍照</Text>
                              </View>
                            )}
                            <View 
                              className={classnames(styles.actionBtn, styles.tomorrow)}
                              onClick={() => handleMarkTomorrow(patient.id, item.key)}
                            >
                              <Text>明日</Text>
                            </View>
                          </View>
                        )}
                      </View>
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
