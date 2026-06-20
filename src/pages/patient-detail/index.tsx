import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockPatients, treatmentTypeMap } from '@/data/mockPatients';
import type { CheckItemKey } from '@/types/patient';
import classnames from 'classnames';

const PatientDetailPage: React.FC = () => {
  const router = useRouter();
  const patientId = router.params.id || '001';

  const [patient, setPatient] = useState(() => {
    return mockPatients.find(p => p.id === patientId) || mockPatients[0];
  });

  const typeInfo = useMemo(() => {
    return treatmentTypeMap[patient.treatmentType] || { name: '其他', color: '#86909c' };
  }, [patient]);

  const toggleCheckItem = (itemKey: CheckItemKey) => {
    setPatient(prev => ({
      ...prev,
      checkItems: prev.checkItems.map(item => {
        if (item.key !== itemKey) return item;
        return { ...item, completed: !item.completed };
      })
    }));
  };

  const handlePhoto = (itemKey: CheckItemKey) => {
    Taro.showActionSheet({
      itemList: ['拍照补录', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0 || res.tapIndex === 1) {
          Taro.showToast({ title: '补录成功', icon: 'success' });
          toggleCheckItem(itemKey);
        }
      }
    });
  };

  const handleMarkTomorrow = (itemKey: string) => {
    Taro.showModal({
      title: '标记明日处理',
      content: '确定将此项目标记为明日处理吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已标记', icon: 'success' });
        }
      }
    });
  };

  const handleMarkAllDone = () => {
    setPatient(prev => ({
      ...prev,
      checkItems: prev.checkItems.map(item => ({ ...item, completed: true }))
    }));
    Taro.showToast({ title: '已全部标记完成', icon: 'success' });
  };

  const completedCount = patient.checkItems.filter(i => i.completed).length;
  const totalCount = patient.checkItems.length;

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
            <Text>自查项目 ({completedCount}/{totalCount})</Text>
          </View>
          <View className={styles.checkList}>
            {patient.checkItems.map(item => (
              <View key={item.key} className={styles.checkItem}>
                <View 
                  className={classnames(
                    styles.checkBox,
                    item.completed ? styles.checked : styles.unchecked
                  )}
                  onClick={() => toggleCheckItem(item.key)}
                >
                  {item.completed && '✓'}
                </View>
                <View className={styles.itemContent}>
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
                        onClick={() => handlePhoto(item.key)}
                      >
                        <Text>拍照补录</Text>
                      </View>
                    )}
                    <View 
                      className={classnames(styles.actionBtn, styles.tomorrow)}
                      onClick={() => handleMarkTomorrow(item.key)}
                    >
                      <Text>明日处理</Text>
                    </View>
                  </View>
                )}
              </View>
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
