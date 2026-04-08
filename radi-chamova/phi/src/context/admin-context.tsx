import { createContext, useContext, type ReactNode } from 'react';
import type {
  AdminStore,
  InterestedPerson,
  InterestNote,
  LeadArticle,
  LeadSignup,
  Service,
  Training,
  VipPassInterest,
  VipPassSlot,
} from '../types';

export interface AdminContextValue {
  store: AdminStore;
  upsertTraining: (training: Training) => void;
  upsertInterest: (person: InterestedPerson) => void;
  addNote: (interestId: string, note: InterestNote) => void;
  upsertLeadArticle: (article: LeadArticle) => void;
  addLeadSignup: (signup: LeadSignup) => void;
  updateLeadSignup: (signup: LeadSignup) => void;
  markLeadSignupsMaterialSent: (ids: string[], sent: boolean) => void;
  removeLeadSignup: (signupId: string) => void;
  upsertService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  upsertVipPassSlot: (slot: VipPassSlot) => void;
  removeVipPassSlot: (slotId: string) => void;
  upsertVipPassInterest: (row: VipPassInterest) => void;
  removeVipPassInterest: (id: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ value, children }: { value: AdminContextValue; children: ReactNode }) {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return ctx;
}
