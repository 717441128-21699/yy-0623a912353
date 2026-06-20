import { create } from 'zustand';
import type { Patient, CheckItemKey, ActionLog, ActionLogType } from '@/types/patient';
import { mockPatients } from '@/data/mockPatients';

const STORAGE_KEY = 'dental-qc-store';

function loadFromStorage(): Patient[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.date === new Date().toDateString() && Array.isArray(data.patients)) {
      return data.patients;
    }
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(patients: Patient[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: new Date().toDateString(),
      patients
    }));
  } catch {}
}

const initialPatients = loadFromStorage() || mockPatients.map(p => ({ ...p, actionLogs: p.actionLogs || [] }));

let logCounter = 0;
function createActionLog(type: ActionLogType, itemKey?: CheckItemKey, itemName?: string, detail?: string): ActionLog {
  return {
    id: `log_${Date.now()}_${++logCounter}`,
    type,
    itemKey,
    itemName,
    timestamp: Date.now(),
    detail
  };
}

function addLogToPatient(patient: Patient, log: ActionLog): Patient {
  const existing = patient.actionLogs || [];
  return { ...patient, actionLogs: [log, ...existing] };
}

interface PatientState {
  patients: Patient[];
  updatedPhotos: Record<string, string>;
  setPatients: (patients: Patient[]) => void;
  updateCheckItem: (patientId: string, itemKey: CheckItemKey, status: 'completed' | 'pending' | 'tomorrow') => void;
  markAllCheckItemsCompleted: (patientId: string) => void;
  addPhoto: (patientId: string, itemKey: CheckItemKey, photoUrl: string) => void;
  completeTomorrowItem: (patientId: string, itemKey: CheckItemKey) => void;
  completeAllTomorrowItems: (patientId: string) => void;
  getPatientById: (id: string) => Patient | undefined;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: initialPatients,
  updatedPhotos: {},

  setPatients: (patients) => {
    set({ patients });
    saveToStorage(patients);
  },

  updateCheckItem: (patientId, itemKey, status) => {
    set(state => {
      const patients = state.patients.map(p => {
        if (p.id !== patientId) return p;
        const item = p.checkItems.find(i => i.key === itemKey);
        const itemName = item?.name || itemKey;
        const prevStatus = item?.status || (item?.completed ? 'completed' : 'pending');
        let logType: ActionLogType = 'completed';
        let detail = '';
        if (status === 'tomorrow') {
          logType = 'tomorrow';
          detail = `${itemName} 标记为明日处理`;
        } else if (status === 'completed' && prevStatus !== 'completed') {
          logType = 'completed';
          detail = `${itemName} 标记为已完成`;
        } else if (status === 'pending' && prevStatus === 'completed') {
          logType = 'revert';
          detail = `${itemName} 取消完成`;
        }
        const log = createActionLog(logType, itemKey, itemName, detail);
        const updated = addLogToPatient({
          ...p,
          checkItems: p.checkItems.map(item => {
            if (item.key !== itemKey) return item;
            return { ...item, completed: status === 'completed', status };
          })
        }, log);
        return updated;
      });
      saveToStorage(patients);
      return { patients };
    });
  },

  markAllCheckItemsCompleted: (patientId) => {
    set(state => {
      const patients = state.patients.map(p => {
        if (p.id !== patientId) return p;
        const log = createActionLog('markAllDone', undefined, undefined, '全部检查项标记为已完成');
        const updated = addLogToPatient({
          ...p,
          checkItems: p.checkItems.map(item => ({
            ...item,
            completed: true,
            status: 'completed' as const
          }))
        }, log);
        return updated;
      });
      saveToStorage(patients);
      return { patients };
    });
  },

  addPhoto: (patientId, itemKey, photoUrl) => {
    set(state => {
      const patients = state.patients.map(p => {
        if (p.id !== patientId) return p;
        const item = p.checkItems.find(i => i.key === itemKey);
        const itemName = item?.name || itemKey;
        const log = createActionLog('photo', itemKey, itemName, `拍照补录 ${itemName}`);
        const updated = addLogToPatient({
          ...p,
          checkItems: p.checkItems.map(item => {
            if (item.key !== itemKey) return item;
            return { ...item, completed: true, status: 'completed' as const, photoUrl };
          })
        }, log);
        return updated;
      });
      saveToStorage(patients);
      return { patients };
    });
  },

  completeTomorrowItem: (patientId, itemKey) => {
    set(state => {
      const patients = state.patients.map(p => {
        if (p.id !== patientId) return p;
        const item = p.checkItems.find(i => i.key === itemKey);
        const itemName = item?.name || itemKey;
        const log = createActionLog('completed', itemKey, itemName, `明日待办完成 ${itemName}`);
        const updated = addLogToPatient({
          ...p,
          checkItems: p.checkItems.map(item => {
            if (item.key !== itemKey) return item;
            return { ...item, completed: true, status: 'completed' as const };
          })
        }, log);
        return updated;
      });
      saveToStorage(patients);
      return { patients };
    });
  },

  completeAllTomorrowItems: (patientId) => {
    set(state => {
      const patients = state.patients.map(p => {
        if (p.id !== patientId) return p;
        const tomorrowItems = p.checkItems.filter(i => i.status === 'tomorrow');
        if (tomorrowItems.length === 0) return p;
        const itemNames = tomorrowItems.map(i => i.name).join('、');
        const log = createActionLog('markAllDone', undefined, undefined, `明日待办全部完成：${itemNames}`);
        const updated = addLogToPatient({
          ...p,
          checkItems: p.checkItems.map(item => {
            if (item.status !== 'tomorrow') return item;
            return { ...item, completed: true, status: 'completed' as const };
          })
        }, log);
        return updated;
      });
      saveToStorage(patients);
      return { patients };
    });
  },

  getPatientById: (id) => {
    return get().patients.find(p => p.id === id);
  }
}));
