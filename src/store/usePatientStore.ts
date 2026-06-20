import { create } from 'zustand';
import type { Patient, CheckItemKey } from '@/types/patient';
import { mockPatients } from '@/data/mockPatients';

interface PatientState {
  patients: Patient[];
  updatedPhotos: Record<string, string>;
  setPatients: (patients: Patient[]) => void;
  updateCheckItem: (patientId: string, itemKey: CheckItemKey, status: 'completed' | 'pending' | 'tomorrow') => void;
  markAllCheckItemsCompleted: (patientId: string) => void;
  addPhoto: (patientId: string, itemKey: CheckItemKey, photoUrl: string) => void;
  getPatientById: (id: string) => Patient | undefined;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [...mockPatients],
  updatedPhotos: {},

  setPatients: (patients) => set({ patients }),

  updateCheckItem: (patientId, itemKey, status) => {
    console.log('[Store] updateCheckItem', { patientId, itemKey, status });
    set(state => ({
      patients: state.patients.map(p => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          checkItems: p.checkItems.map(item => {
            if (item.key !== itemKey) return item;
            return {
              ...item,
              completed: status === 'completed',
              status: status
            };
          })
        };
      })
    }));
  },

  markAllCheckItemsCompleted: (patientId) => {
    console.log('[Store] markAllCheckItemsCompleted', { patientId });
    set(state => ({
      patients: state.patients.map(p => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          checkItems: p.checkItems.map(item => ({
            ...item,
            completed: true,
            status: 'completed' as const
          }))
        };
      })
    }));
  },

  addPhoto: (patientId, itemKey, photoUrl) => {
    console.log('[Store] addPhoto', { patientId, itemKey, photoUrl });
    const photoKey = `${patientId}-${itemKey}`;
    set(state => ({
      updatedPhotos: {
        ...state.updatedPhotos,
        [photoKey]: photoUrl
      },
      patients: state.patients.map(p => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          checkItems: p.checkItems.map(item => {
            if (item.key !== itemKey) return item;
            return {
              ...item,
              completed: true,
              status: 'completed' as const,
              photoUrl
            };
          })
        };
      })
    }));
  },

  getPatientById: (id) => {
    return get().patients.find(p => p.id === id);
  }
}));
