import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import CheckItem from '@/components/CheckItem';
import { usePatientStore } from '@/store/usePatientStore';
import { treatmentTypeMap } from '@/data/mockPatients';
import type { CheckItemKey, CheckItemStatus } from '@/types/patient';
import classnames from 'classnames';

const PatientDetailPage: React.FC = () => {
  const router = useRouter();
  const patientId = router.params.id || '001';

  const { 
    patients, 
    updateCheckItem, 
    addPhoto, 
    markAllCheckItemsCompleted,
    getPatientById 
  } = usePatientStore();

  const patient = useMemo(() => {
    return getPatientById(patientId) || patients[0];
  }, [patients, patientId, getPatientById]);

  const typeInfo = useMemo(() => {
    return treatmentTypeMap[patient.treatmentType] || { name: '其他', color: '#86909c' };
  }, [patient]);

  const toggleCheckItem = useCallback((itemKey: CheckItemKey) => {
    const item = patient.checkItems.find(i => i.key === itemKey);
    if (!item) return;

    const currentStatus = item.status || (item.completed ? 'completed' : 'pending');
    let newStatus: CheckItemStatus;
    if (currentStatus === 'completed') {
      newStatus = 'pending';
    } else {
      newStatus = 'completed';
    }
    
    updateCheckItem(patientId, itemKey, newStatus);
  }, [patient, patientId, updateCheckItem]);

  const handlePhoto = useCallback((itemKey: CheckItemKey) => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        if (tempFilePaths && tempFilePaths.length > 0) {
          console.log('[PatientDetail] 选择图片成功:', tempFilePaths[0]);
          addPhoto(patientId, itemKey, tempFilePaths[0]);
          Taro.showToast({ title: '照片已补录', icon: 'success' });
        }
      },
      fail: (err) => {
        console.log('[PatientDetail] 选择图片失败:', err);
        if (err.errMsg?.includes('cancel')) {
          return;
        }
        Taro.showToast({ title: '拍照失败，请重试', icon: 'none' });
      }
    });
  }, [patientId, addPhoto]);

  const handleMarkTomorrow = useCallback((itemKey: CheckItemKey) => {
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
  }, [patientId, updateCheckItem]);

  const handleMarkAllDone = useCallback(() => {
    Taro.showModal({
      title: '全部标记完成',
      content: '确定将所有检查项标记为已完成吗？',
      success: (res) => {
        if (res.confirm) {
          markAllCheckItemsCompleted(patientId);
          Taro.showToast({ title: '已全部标记完成', icon: 'success' });
        }
      }
    });
  }, [patientId, markAllCheckItemsCompleted]);

  const getStatusText = (item: typeof patient.checkItems[0]) => {
    const status = item.status || (item.completed ? 'completed' : 'pending');
    switch (status) {
      case 'completed': return '已完成';
      case 'tomorrow': return '明日处理';
      default: return '待完善';
    }
  };

  const getStatusColor = (item: typeof patient.checkItems[0]) => {
    const status = item.status || (item.completed ? 'completed' : 'pending');
    switch (status) {
      case 'completed': return '#00b42a';
      case 'tomorrow': return '#722ed1';
      default: return '#86909c';
    }
  };

  const completedCount = patient.checkItems.filter(i => {
    const status = i.status || (i.completed ? 'completed' : 'pending');
    return status === 'completed';
  }).length;
  const totalCount = patient.checkItems.length;
  const pendingCount = patient.checkItems.filter(i => {
    const status = i.status || (i.completed ? 'completed' : 'pending');
    return status === 'pending';
  }).length;
  const tomorrowCount = patient.checkItems.filter(i => {
    const status = i.status || (i.completed ? 'completed' : 'pending');
    return status === 'tomorrow';
  }).length;

  useEffect(() => {
    console.log('[PatientDetail] 患者数据已更新:', patientId, {
      completed: completedCount,
      pending: pendingCount,
      tomorrow: tomorrowCount
    });
  }, [patientId, completedCount, pendingCount, tomorrowCount]);

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.patientHeader}>
        <View className={styles.patientInfo}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>{patient.name.charAt(0)}</Text>
          </View>
          <View className={styles.info}>
            <Text className={styles.name}>{patient.name}</Text>
            <Text className={styles.meta}>
              {patient.gender} · {patient.age}岁
            </Text>
            <Text className={styles.doctorInfo}>
              主治医生：{patient.doctor}
              {patient.assistant && ` · 护士：${patient.assistant}`}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <View className={styles.sectionDot} />
            <Text>治疗信息</Text>
          </View>
          <View className={styles.treatmentInfo}>
            <View className={styles.treatmentRow}>
              <Text className={styles.treatmentLabel}>治疗项目</Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                <View 
                  className={styles.tag}
                  style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}
                >
                  {typeInfo.name}
                </View>
                <Text className={styles.treatmentValue}>{patient.treatmentName}</Text>
              </View>
            </View>
            <View className={styles.treatmentRow}>
              <Text className={styles.treatmentLabel}>就诊时间</Text>
              <Text className={styles.treatmentValue}>
                {patient.startTime} - {patient.endTime}
              </Text>
            </View>
            <View className={styles.treatmentRow}>
              <Text className={styles.treatmentLabel}>费用</Text>
              <Text className={styles.feeValue}>¥{patient.fee}</Text>
            </View>
            {patient.followUpDate && (
              <View className={styles.treatmentRow}>
                <Text className={styles.treatmentLabel}>复诊时间</Text>
                <Text className={styles.treatmentValue}>{patient.followUpDate}</Text>
              </View>
            )}
          </View>
        </View>

        {patient.risks.length > 0 && (
          <View className={styles.riskSection}>
            <View className={styles.riskTitle}>
              <Text>⚠️</Text>
              <Text>风险提醒 ({patient.risks.length}项)</Text>
            </View>
            <View className={styles.riskList}>
              {patient.risks.map((risk, index) => (
                <View key={index} className={styles.riskItem}>
                  <View className={styles.riskDot} />
                  <View className={styles.riskInfo}>
                    <Text className={styles.riskName}>{risk.name}</Text>
                    <Text className={styles.riskDesc}>{risk.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <View className={styles.sectionDot} style={{ backgroundColor: '#ff7d00' }} />
            <Text>
              自查项目 ({completedCount}/{totalCount})
              {pendingCount > 0 && <Text style={{ color: '#ff7d00', fontSize: '24rpx', marginLeft: '16rpx' }}>
                {pendingCount}项待完善
              </Text>}
              {tomorrowCount > 0 && <Text style={{ color: '#722ed1', fontSize: '24rpx', marginLeft: '16rpx' }}>
                {tomorrowCount}项明日
              </Text>}
            </Text>
          </View>
          <View className={styles.checkList}>
            {patient.checkItems.map(item => (
              <CheckItem
                key={item.key}
                item={item}
                showActions
                onPhoto={() => handlePhoto(item.key)}
                onMarkTomorrow={() => handleMarkTomorrow(item.key)}
                onToggle={() => toggleCheckItem(item.key)}
              />
            ))}
          </View>
        </View>

        {patient.remark && (
          <View className={styles.remarkSection}>
            <View className={styles.remarkTitle}>
              <Text>📝</Text>
              <Text>备注</Text>
            </View>
            <Text className={styles.remarkContent}>{patient.remark}</Text>
          </View>
        )}

        <View style={{ height: 160 }} />
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.secondaryBtn} onClick={handleMarkAllDone}>
          <Text>全部标记完成</Text>
        </View>
        <View className={styles.primaryBtn} onClick={() => Taro.navigateBack()}>
          <Text>返回</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PatientDetailPage;
