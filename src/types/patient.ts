export type TreatmentType = 'cleaning' | 'filling' | 'extraction' | 'pediatric' | 'other';

export type CheckItemKey = 'record' | 'photos' | 'advice' | 'signature';

export type RiskType = 'noConsent' | 'feeMismatch' | 'noFollowUp';

export type CheckItemStatus = 'completed' | 'pending' | 'tomorrow';

export interface CheckItem {
  key: CheckItemKey;
  name: string;
  completed: boolean;
  canPhoto?: boolean;
  status?: CheckItemStatus;
  photoUrl?: string;
}

export interface RiskItem {
  type: RiskType;
  name: string;
  description: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: '男' | '女';
  age: number;
  treatmentType: TreatmentType;
  treatmentName: string;
  doctor: string;
  assistant?: string;
  startTime: string;
  endTime: string;
  fee: number;
  checkItems: CheckItem[];
  risks: RiskItem[];
  followUpDate?: string;
  remark?: string;
}

export interface TreatmentGroup {
  type: TreatmentType;
  name: string;
  count: number;
  color: string;
  patients: Patient[];
}

export interface SummaryStat {
  totalPatients: number;
  completedCheck: number;
  pendingCheck: number;
  tomorrowCheck: number;
  riskCount: number;
  riskByType: { type: RiskType; name: string; count: number }[];
  issuesByRole: { role: string; count: number }[];
  summaryText: string;
}
