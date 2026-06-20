import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockPatients, calculateSummary } from '@/data/mockPatients';
import classnames from 'classnames';

const SummaryPage: React.FC = () => {
  const summary = useMemo(() => calculateSummary(mockPatients), []);

  const maxRiskCount = Math.max(...summary.riskByType.map(r => r.count), 1);
  const maxRoleCount = Math.max(...summary.issuesByRole.map(r => r.count), 1);

  const handleCopy = () => {
    Taro.setClipboardData({
      data: summary.summaryText,
      success: () => {
        Taro.showToast({ title: '已复制到剪贴板', icon: 'success' });
      }
    });
  };

  const handleShare = () => {
    Taro.showActionSheet({
      itemList: ['发送到微信群', '发送给同事', '复制文字'],
      success: (res) => {
        if (res.tapIndex === 0 || res.tapIndex === 1) {
          Taro.showToast({ title: '请选择分享对象', icon: 'none' });
        } else if (res.tapIndex === 2) {
          handleCopy();
        }
      }
    });
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'noConsent': return '📄';
      case 'feeMismatch': return '💰';
      case 'noFollowUp': return '📅';
      default: return '⚠️';
    }
  };

  const getRiskColor = (type: string) => {
    switch (type) {
      case 'noConsent': return '#f53f3f';
      case 'feeMismatch': return '#ff7d00';
      case 'noFollowUp': return '#722ed1';
      default: return '#f53f3f';
    }
  };

  const today = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const weekday = weekdays[today.getDay()];

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>晚间质控小结</Text>
        <Text className={styles.subtitle}>{dateStr} {weekday} · 每日质量回顾</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.statsCard}>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{summary.totalPatients}</Text>
              <Text className={styles.statLabel}>今日患者</Text>
            </View>
            <View className={classnames(styles.statItem, styles.statSuccess)}>
              <Text className={styles.statNumber}>{summary.completedCheck}</Text>
              <Text className={styles.statLabel}>已自查</Text>
            </View>
            <View className={classnames(styles.statItem, styles.statWarning)}>
              <Text className={styles.statNumber}>{summary.pendingCheck}</Text>
              <Text className={styles.statLabel}>待完善</Text>
            </View>
            <View className={classnames(styles.statItem, styles.statDanger)}>
              <Text className={styles.statNumber}>{summary.riskCount}</Text>
              <Text className={styles.statLabel}>有风险</Text>
            </View>
          </View>
        </View>

        {summary.riskByType.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <View className={styles.sectionDot} style={{ backgroundColor: '#f53f3f' }} />
              <Text>风险类型分布</Text>
            </View>
            <View className={styles.riskList}>
              {summary.riskByType.map(risk => (
                <View key={risk.type} className={styles.riskItem}>
                  <View className={classnames(
                    styles.riskIcon,
                    risk.type === 'feeMismatch' ? styles.warning : styles.danger
                  )}>
                    <Text>{getRiskIcon(risk.type)}</Text>
                  </View>
                  <View className={styles.riskInfo}>
                    <Text className={styles.riskName}>{risk.name}</Text>
                    <View className={styles.riskBar}>
                      <View 
                        className={styles.riskBarFill}
                        style={{ 
                          width: `${(risk.count / maxRiskCount) * 100}%`,
                          backgroundColor: getRiskColor(risk.type)
                        }}
                      />
                    </View>
                  </View>
                  <Text className={styles.riskCount}>{risk.count}例</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {summary.issuesByRole.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <View className={styles.sectionDot} style={{ backgroundColor: '#ff7d00' }} />
              <Text>责任岗位统计</Text>
            </View>
            <View className={styles.roleList}>
              {summary.issuesByRole.map((role, index) => (
                <View key={role.role} className={styles.roleItem}>
                  <View className={styles.roleAvatar}>
                    <Text>{role.role.charAt(0)}</Text>
                  </View>
                  <View className={styles.roleInfo}>
                    <Text className={styles.roleName}>{role.role}</Text>
                    <View className={styles.roleBar}>
                      <View 
                        className={styles.roleBarFill}
                        style={{ width: `${(role.count / maxRoleCount) * 100}%` }}
                      />
                    </View>
                  </View>
                  <Text className={styles.roleCount}>{role.count}例</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.summaryCard}>
          <View className={styles.summaryHeader}>
            <Text className={styles.summaryTitle}>整改话术</Text>
            <View className={styles.copyBtn} onClick={handleCopy}>
              <Text>一键复制</Text>
            </View>
          </View>
          <View className={styles.summaryContent}>
            <Text>{summary.summaryText}</Text>
          </View>
        </View>

        <View style={{ height: 160 }} />
      </View>

      <View className={styles.bottomActions}>
        <View className={styles.secondaryBtn} onClick={handleCopy}>
          <Text>复制话术</Text>
        </View>
        <View className={styles.primaryBtn} onClick={handleShare}>
          <Text>发到群里</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SummaryPage;
