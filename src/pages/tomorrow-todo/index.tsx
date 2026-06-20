import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { usePatientStore } from '@/store/usePatientStore';
import type { CheckItemKey, CheckItem as CheckItemType, CheckItemStatus } from '@/types/patient';

const getItemStatus = (item: CheckItemType): CheckItemStatus => {
  return item.status || (item.completed ? 'completed' : 'pending');
};

interface DoctorTodo {
  doctor: string;
  patients: {
    patientId: string;
    patientName: string;
    treatmentName: string;
    items: {
      itemKey: CheckItemKey;
      itemName: string;
      status: CheckItemStatus;
    }[];
  }[];
}

const TomorrowTodoPage: React.FC = () => {
  const { patients, completeTomorrowItem, completeAllTomorrowItems } = usePatientStore();

  const doctorTodos = useMemo(() => {
    const map: Record<string, DoctorTodo> = {};
    patients.forEach(p => {
      const tomorrowItems = p.checkItems.filter(i => getItemStatus(i) === 'tomorrow');
      if (tomorrowItems.length === 0) return;
      if (!map[p.doctor]) {
        map[p.doctor] = { doctor: p.doctor, patients: [] };
      }
      map[p.doctor].patients.push({
        patientId: p.id,
        patientName: p.name,
        treatmentName: p.treatmentName,
        items: tomorrowItems.map(i => ({
          itemKey: i.key,
          itemName: i.name,
          status: getItemStatus(i)
        }))
      });
    });
    return Object.values(map).sort((a, b) => {
      const aCount = a.patients.reduce((s, p) => s + p.items.length, 0);
      const bCount = b.patients.reduce((s, p) => s + p.items.length, 0);
      return bCount - aCount;
    });
  }, [patients]);

  const totalTomorrowItems = useMemo(() => {
    return patients.reduce((sum, p) => sum + p.checkItems.filter(i => getItemStatus(i) === 'tomorrow').length, 0);
  }, [patients]);

  const totalDoctorCount = doctorTodos.length;

  const handleCompleteItem = useCallback((patientId: string, itemKey: CheckItemKey, itemName: string) => {
    Taro.showModal({
      title: '确认完成',
      content: `确定已完成「${itemName}」吗？`,
      confirmText: '已完成',
      success: (res) => {
        if (res.confirm) {
          completeTomorrowItem(patientId, itemKey);
          Taro.showToast({ title: '已完成', icon: 'success' });
        }
      }
    });
  }, [completeTomorrowItem]);

  const handleCompleteAllForPatient = useCallback((patientId: string, patientName: string, count: number) => {
    Taro.showModal({
      title: '全部完成',
      content: `确定将 ${patientName} 的 ${count} 项明日待办全部标记为已完成吗？`,
      confirmText: '全部完成',
      success: (res) => {
        if (res.confirm) {
          completeAllTomorrowItems(patientId);
          Taro.showToast({ title: '已全部完成', icon: 'success' });
        }
      }
    });
  }, [completeAllTomorrowItems]);

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>📅 明日待办</Text>
        <Text className={styles.subtitle}>第二天跟进事项，按医生分组管理</Text>
        <View className={styles.statsRow}>
          <View className={styles.statChip}>
            <Text>{totalTomorrowItems} 项待办</Text>
          </View>
          <View className={styles.statChip}>
            <Text>{totalDoctorCount} 位医生</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        {doctorTodos.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>✅</Text>
            <Text className={styles.emptyText}>暂无明日待办</Text>
            <Text className={styles.emptyDesc}>所有检查项已处理完毕</Text>
          </View>
        ) : (
          doctorTodos.map(group => {
            const itemCount = group.patients.reduce((s, p) => s + p.items.length, 0);
            return (
              <View key={group.doctor} className={styles.doctorGroup}>
                <View className={styles.doctorHeader}>
                  <View className={styles.doctorInfo}>
                    <View className={styles.doctorAvatar}>
                      <Text>{group.doctor.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text className={styles.doctorName}>{group.doctor}</Text>
                      <Text className={styles.doctorCount}>{itemCount} 项待办</Text>
                    </View>
                  </View>
                </View>

                <View className={styles.todoList}>
                  {group.patients.map(patient => (
                    <View key={patient.patientId}>
                      {patient.items.map((item, idx) => (
                        <View key={item.itemKey} className={styles.todoItem}>
                          <View className={styles.todoLeft}>
                            <View className={styles.todoIcon}>
                              <Text>📋</Text>
                            </View>
                            <View className={styles.todoText}>
                              <Text className={styles.todoPatient}>{patient.patientName}</Text>
                              <Text className={styles.todoItemName}>{item.itemName} · {patient.treatmentName}</Text>
                            </View>
                          </View>
                          <View
                            className={styles.completeBtn}
                            onClick={() => handleCompleteItem(patient.patientId, item.itemKey, item.itemName)}
                          >
                            <Text>完成</Text>
                          </View>
                        </View>
                      ))}
                      {patient.items.length > 1 && (
                        <View style={{ padding: '12rpx 0 20rpx', textAlign: 'right' }}>
                          <View
                            className={styles.completeAllBtn}
                            onClick={() => handleCompleteAllForPatient(patient.patientId, patient.patientName, patient.items.length)}
                          >
                            <Text>全部完成 ({patient.items.length}项)</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

export default TomorrowTodoPage;
