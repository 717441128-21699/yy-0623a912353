import type { Patient, TreatmentGroup, SummaryStat, DoctorSummary, CheckItem, CheckItemStatus } from '@/types/patient';

const getItemStatus = (item: CheckItem): CheckItemStatus => {
  return item.status || (item.completed ? 'completed' : 'pending');
};

export const mockPatients: Patient[] = [
  {
    id: '001',
    name: '张明华',
    gender: '男',
    age: 35,
    treatmentType: 'cleaning',
    treatmentName: '超声波洁牙',
    doctor: '李医生',
    assistant: '王护士',
    startTime: '09:00',
    endTime: '09:45',
    fee: 380,
    checkItems: [
      { key: 'record', name: '病历书写', completed: true, status: 'completed' },
      { key: 'photos', name: '术前术后照片', completed: false, canPhoto: true, status: 'pending' },
      { key: 'advice', name: '处置医嘱', completed: true, status: 'completed' },
      { key: 'signature', name: '患者签字', completed: true, status: 'completed' }
    ],
    risks: [],
    followUpDate: '2024-06-27'
  },
  {
    id: '002',
    name: '李秀英',
    gender: '女',
    age: 42,
    treatmentType: 'cleaning',
    treatmentName: '牙周深度洁治',
    doctor: '王医生',
    assistant: '张护士',
    startTime: '10:00',
    endTime: '11:00',
    fee: 680,
    checkItems: [
      { key: 'record', name: '病历书写', completed: true, status: 'completed' },
      { key: 'photos', name: '术前术后照片', completed: true, status: 'completed' },
      { key: 'advice', name: '处置医嘱', completed: true, status: 'completed' },
      { key: 'signature', name: '患者签字', completed: true, status: 'completed' }
    ],
    risks: []
  },
  {
    id: '003',
    name: '王小军',
    gender: '男',
    age: 28,
    treatmentType: 'filling',
    treatmentName: '树脂补牙（2颗）',
    doctor: '李医生',
    assistant: '刘护士',
    startTime: '14:00',
    endTime: '15:00',
    fee: 860,
    checkItems: [
      { key: 'record', name: '病历书写', completed: false, status: 'pending' },
      { key: 'photos', name: '术前术后照片', completed: false, canPhoto: true, status: 'pending' },
      { key: 'advice', name: '处置医嘱', completed: false, status: 'pending' },
      { key: 'signature', name: '患者签字', completed: true, status: 'completed' }
    ],
    risks: [
      { type: 'noConsent', name: '未签知情同意', description: '补牙知情同意书未签署' }
    ]
  },
  {
    id: '004',
    name: '陈美丽',
    gender: '女',
    age: 31,
    treatmentType: 'filling',
    treatmentName: '纳米树脂充填',
    doctor: '张医生',
    assistant: '王护士',
    startTime: '15:30',
    endTime: '16:15',
    fee: 520,
    checkItems: [
      { key: 'record', name: '病历书写', completed: true, status: 'completed' },
      { key: 'photos', name: '术前术后照片', completed: true, status: 'completed' },
      { key: 'advice', name: '处置医嘱', completed: true, status: 'completed' },
      { key: 'signature', name: '患者签字', completed: true, status: 'completed' }
    ],
    risks: []
  },
  {
    id: '005',
    name: '赵大壮',
    gender: '男',
    age: 45,
    treatmentType: 'extraction',
    treatmentName: '智齿拔除（左下）',
    doctor: '王医生',
    assistant: '李护士',
    startTime: '09:30',
    endTime: '10:30',
    fee: 1200,
    checkItems: [
      { key: 'record', name: '病历书写', completed: true, status: 'completed' },
      { key: 'photos', name: '术前术后照片', completed: false, canPhoto: true, status: 'pending' },
      { key: 'advice', name: '处置医嘱', completed: true, status: 'completed' },
      { key: 'signature', name: '患者签字', completed: true, status: 'completed' }
    ],
    risks: [
      { type: 'noFollowUp', name: '复诊未约', description: '拔牙后7天复诊未预约' }
    ],
    remark: '复杂阻生齿'
  },
  {
    id: '006',
    name: '刘阿姨',
    gender: '女',
    age: 58,
    treatmentType: 'extraction',
    treatmentName: '松动牙拔除（3颗）',
    doctor: '李医生',
    startTime: '14:30',
    endTime: '15:15',
    fee: 450,
    checkItems: [
      { key: 'record', name: '病历书写', completed: true, status: 'completed' },
      { key: 'photos', name: '术前术后照片', completed: true, status: 'completed' },
      { key: 'advice', name: '处置医嘱', completed: false, status: 'pending' },
      { key: 'signature', name: '患者签字', completed: false, status: 'pending' }
    ],
    risks: [
      { type: 'feeMismatch', name: '收费不匹配', description: '收费项目与治疗项目不符' },
      { type: 'noFollowUp', name: '复诊未约', description: '未预约拆线复诊' }
    ],
    remark: '高血压病史'
  },
  {
    id: '007',
    name: '小星星',
    gender: '女',
    age: 6,
    treatmentType: 'pediatric',
    treatmentName: '儿童窝沟封闭（4颗）',
    doctor: '张医生',
    assistant: '刘护士',
    startTime: '10:30',
    endTime: '11:15',
    fee: 400,
    checkItems: [
      { key: 'record', name: '病历书写', completed: true, status: 'completed' },
      { key: 'photos', name: '术前术后照片', completed: false, canPhoto: true, status: 'pending' },
      { key: 'advice', name: '处置医嘱', completed: true, status: 'completed' },
      { key: 'signature', name: '患者签字', completed: true, status: 'completed' }
    ],
    risks: []
  },
  {
    id: '008',
    name: '浩浩',
    gender: '男',
    age: 8,
    treatmentType: 'pediatric',
    treatmentName: '乳牙根管治疗',
    doctor: '李医生',
    assistant: '王护士',
    startTime: '16:00',
    endTime: '17:00',
    fee: 980,
    checkItems: [
      { key: 'record', name: '病历书写', completed: false, status: 'pending' },
      { key: 'photos', name: '术前术后照片', completed: false, canPhoto: true, status: 'pending' },
      { key: 'advice', name: '处置医嘱', completed: false, status: 'pending' },
      { key: 'signature', name: '患者签字', completed: false, status: 'pending' }
    ],
    risks: [
      { type: 'noConsent', name: '未签知情同意', description: '根管治疗知情同意书未签署' },
      { type: 'noFollowUp', name: '复诊未约', description: '下次治疗时间未预约' }
    ]
  },
  {
    id: '009',
    name: '孙先生',
    gender: '男',
    age: 52,
    treatmentType: 'other',
    treatmentName: '临时义齿修复',
    doctor: '王医生',
    assistant: '张护士',
    startTime: '11:00',
    endTime: '12:00',
    fee: 1500,
    checkItems: [
      { key: 'record', name: '病历书写', completed: true, status: 'completed' },
      { key: 'photos', name: '术前术后照片', completed: true, status: 'completed' },
      { key: 'advice', name: '处置医嘱', completed: true, status: 'completed' },
      { key: 'signature', name: '患者签字', completed: true, status: 'completed' }
    ],
    risks: []
  },
  {
    id: '010',
    name: '周女士',
    gender: '女',
    age: 38,
    treatmentType: 'other',
    treatmentName: '牙齿美白',
    doctor: '张医生',
    startTime: '13:30',
    endTime: '14:30',
    fee: 1800,
    checkItems: [
      { key: 'record', name: '病历书写', completed: true, status: 'completed' },
      { key: 'photos', name: '术前术后照片', completed: false, canPhoto: true, status: 'pending' },
      { key: 'advice', name: '处置医嘱', completed: true, status: 'completed' },
      { key: 'signature', name: '患者签字', completed: false, status: 'pending' }
    ],
    risks: [
      { type: 'noConsent', name: '未签知情同意', description: '美白知情同意书未签署' }
    ]
  }
];

export const treatmentTypeMap: Record<string, { name: string; color: string }> = {
  cleaning: { name: '洁牙', color: '#00b42a' },
  filling: { name: '补牙', color: '#ff7d00' },
  extraction: { name: '拔牙', color: '#f53f3f' },
  pediatric: { name: '儿牙', color: '#722ed1' },
  other: { name: '其他', color: '#86909c' }
};

export function getTreatmentGroups(patients: Patient[]): TreatmentGroup[] {
  const groups: Record<string, Patient[]> = {};
  
  patients.forEach(patient => {
    const type = patient.treatmentType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(patient);
  });

  return Object.keys(groups).map(type => {
    const info = treatmentTypeMap[type] || { name: '其他', color: '#86909c' };
    return {
      type: type as any,
      name: info.name,
      color: info.color,
      count: groups[type].length,
      patients: groups[type]
    };
  }).sort((a, b) => b.count - a.count);
}

export function getRiskPatients(patients: Patient[]): Patient[] {
  return patients.filter(p => p.risks.length > 0);
}

export function getPendingCheckPatients(patients: Patient[]): Patient[] {
  return patients.filter(p => 
    p.checkItems.some(item => getItemStatus(item) === 'pending')
  );
}

export function getTomorrowCheckPatients(patients: Patient[]): Patient[] {
  return patients.filter(p => 
    p.checkItems.some(item => getItemStatus(item) === 'tomorrow')
  );
}

export function getCompletedCheckPatients(patients: Patient[]): Patient[] {
  return patients.filter(p => 
    p.checkItems.every(item => getItemStatus(item) === 'completed')
  );
}

export function calculateSummary(patients: Patient[]): SummaryStat {
  const totalPatients = patients.length;
  const riskPatients = getRiskPatients(patients);
  const pendingPatients = getPendingCheckPatients(patients);
  const tomorrowPatients = getTomorrowCheckPatients(patients);
  const completedPatients = getCompletedCheckPatients(patients);

  const riskByTypeMap: Record<string, { type: any; name: string; count: number }> = {
    noConsent: { type: 'noConsent', name: '未签知情同意', count: 0 },
    feeMismatch: { type: 'feeMismatch', name: '收费不匹配', count: 0 },
    noFollowUp: { type: 'noFollowUp', name: '复诊未约', count: 0 }
  };

  patients.forEach(patient => {
    patient.risks.forEach(risk => {
      if (riskByTypeMap[risk.type]) {
        riskByTypeMap[risk.type].count++;
      }
    });
  });

  const riskByType = Object.values(riskByTypeMap).filter(r => r.count > 0);

  const doctorIssueMap: Record<string, number> = {};
  patients.forEach(patient => {
    const hasPending = patient.checkItems.some(item => getItemStatus(item) === 'pending');
    const hasRisk = patient.risks.length > 0;
    if (hasPending || hasRisk) {
      doctorIssueMap[patient.doctor] = (doctorIssueMap[patient.doctor] || 0) + 1;
    }
  });

  const issuesByRole = Object.entries(doctorIssueMap)
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count);

  const pendingCount = patients.reduce((sum, p) => {
    return sum + p.checkItems.filter(item => getItemStatus(item) === 'pending').length;
  }, 0);
  const tomorrowCount = patients.reduce((sum, p) => {
    return sum + p.checkItems.filter(item => getItemStatus(item) === 'tomorrow').length;
  }, 0);
  const riskCount = riskPatients.reduce((sum, p) => sum + p.risks.length, 0);

  const doctorMap: Record<string, DoctorSummary> = {};
  patients.forEach(patient => {
    const doc = patient.doctor;
    if (!doctorMap[doc]) {
      doctorMap[doc] = { doctor: doc, pendingItems: [], tomorrowItems: [], riskItems: [], doctorText: '' };
    }
    patient.checkItems.forEach(item => {
      const s = getItemStatus(item);
      if (s === 'pending') {
        doctorMap[doc].pendingItems.push({ patientName: patient.name, itemName: item.name, patientId: patient.id, itemKey: item.key });
      } else if (s === 'tomorrow') {
        doctorMap[doc].tomorrowItems.push({ patientName: patient.name, itemName: item.name, patientId: patient.id, itemKey: item.key });
      }
    });
    patient.risks.forEach(risk => {
      doctorMap[doc].riskItems.push({ patientName: patient.name, riskName: risk.name });
    });
  });

  const doctorSummaries = Object.values(doctorMap)
    .filter(d => d.pendingItems.length > 0 || d.tomorrowItems.length > 0 || d.riskItems.length > 0)
    .sort((a, b) => (b.pendingItems.length + b.tomorrowItems.length + b.riskItems.length) - (a.pendingItems.length + a.tomorrowItems.length + a.riskItems.length));

  doctorSummaries.forEach(d => {
    let text = `👨‍⚕️ ${d.doctor}：\n`;
    if (d.pendingItems.length > 0) {
      text += `⏳ 待完善：\n`;
      d.pendingItems.forEach(item => {
        text += `  · ${item.patientName} - ${item.itemName}\n`;
      });
    }
    if (d.tomorrowItems.length > 0) {
      text += `📅 明日处理：\n`;
      d.tomorrowItems.forEach(item => {
        text += `  · ${item.patientName} - ${item.itemName}\n`;
      });
    }
    if (d.riskItems.length > 0) {
      text += `⚠️ 风险项：\n`;
      d.riskItems.forEach(item => {
        text += `  · ${item.patientName} - ${item.riskName}\n`;
      });
    }
    d.doctorText = text.trimEnd();
  });

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  
  let summaryText = `【${dateStr} 晚间质控小结】\n\n`;
  summaryText += `今日就诊患者共 ${totalPatients} 人。\n`;
  summaryText += `✅ 已完成自查：${completedPatients.length} 人\n`;
  summaryText += `⏳ 待完善：${pendingCount} 项\n`;
  if (tomorrowCount > 0) {
    summaryText += `📅 标记明日处理：${tomorrowCount} 项\n`;
  }
  summaryText += `⚠️ 风险项：${riskCount} 项\n\n`;
  
  if (riskByType.length > 0) {
    summaryText += `主要风险：\n`;
    riskByType.forEach(r => {
      summaryText += `• ${r.name}：${r.count} 例\n`;
    });
    summaryText += `\n`;
  }

  if (doctorSummaries.length > 0) {
    summaryText += `📋 各医生待办：\n\n`;
    doctorSummaries.forEach(d => {
      summaryText += d.doctorText + `\n\n`;
    });
  }

  summaryText += `整改要求：\n`;
  if (pendingCount > 0) {
    summaryText += `1. 今晚请待完善项目的医生尽快补齐\n`;
  }
  if (tomorrowCount > 0) {
    summaryText += `2. 标记明日处理的项目请明早10点前完成\n`;
  }
  summaryText += `3. 未签知情同意的病例务必补签\n`;
  summaryText += `4. 复诊未约的患者请前台跟进\n`;
  summaryText += `5. 各医生请重视医疗文书质量\n\n`;
  summaryText += `请大家今晚认真复盘，明天晨会通报。`;

  return {
    totalPatients,
    completedCheck: completedPatients.length,
    pendingCheck: pendingPatients.length,
    tomorrowCheck: tomorrowPatients.length,
    riskCount: riskPatients.length,
    riskByType,
    issuesByRole,
    summaryText,
    doctorSummaries
  };
}
