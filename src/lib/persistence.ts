import { seedStore } from '../data/seed';
import type { AdminStore, LeadSignup, Service, VipPassInterest, VipPassSlot } from '../types';

const STORAGE_KEY = 'phi-admin-store-v2';
const STORAGE_KEY_LEGACY = 'phi-admin-store-v1';

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedStore)) as AdminStore;
}

function normalizeVipPassInterest(raw: Partial<VipPassInterest> & { id: string }): VipPassInterest {
  const kind = raw.kind === 'lips' ? 'lips' : 'brows';
  return {
    id: raw.id,
    kind,
    fullName: typeof raw.fullName === 'string' ? raw.fullName : '',
    email: typeof raw.email === 'string' ? raw.email : '',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    source: typeof raw.source === 'string' ? raw.source : '',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
  };
}

/** Допълва липсващи seed заявки (ако в storage е останал само стар демо запис и т.н.). */
function mergeVipPassInterestsWithSeed(parsed: VipPassInterest[], seedList: VipPassInterest[]): VipPassInterest[] {
  const parsedNorm = parsed.map((item) => normalizeVipPassInterest(item as Partial<VipPassInterest> & { id: string }));
  const ids = new Set(parsedNorm.map((p) => p.id));
  const extra = seedList.filter((s) => !ids.has(s.id));
  return [...parsedNorm, ...extra];
}

function normalizeService(raw: Partial<Service> & { id: string }): Service {
  const category = raw.category === 'lips' ? 'lips' : 'brows';
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
  return {
    id: raw.id,
    title: typeof raw.title === 'string' ? raw.title : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    duration: typeof raw.duration === 'string' ? raw.duration : '',
    price: typeof raw.price === 'string' ? raw.price : '',
    category,
    createdAt,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : createdAt,
  };
}

function mergeServicesWithSeed(parsed: Service[], seedList: Service[]): Service[] {
  const parsedNorm = parsed.map((item) => normalizeService(item as Partial<Service> & { id: string }));
  const ids = new Set(parsedNorm.map((p) => p.id));
  const extra = seedList.filter((s) => !ids.has(s.id));
  return [...parsedNorm, ...extra];
}

function normalizeLeadSignup(raw: Partial<LeadSignup> & { id: string }): LeadSignup {
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
  const materialSent = typeof raw.materialSent === 'boolean' ? raw.materialSent : false;
  let materialSentAt: string | null =
    typeof raw.materialSentAt === 'string' && raw.materialSentAt.length > 0 ? raw.materialSentAt : null;

  if (materialSent && !materialSentAt) {
    materialSentAt = createdAt;
  }
  if (!materialSent) {
    materialSentAt = null;
  }

  return {
    id: raw.id,
    email: typeof raw.email === 'string' ? raw.email : '',
    fullName: typeof raw.fullName === 'string' ? raw.fullName : '',
    articleId: typeof raw.articleId === 'string' ? raw.articleId : '',
    source: typeof raw.source === 'string' ? raw.source : '',
    createdAt,
    materialSent,
    materialSentAt,
  };
}

function normalizeFromParsed(parsed: Partial<AdminStore>): AdminStore {
  const seed = cloneSeed();

  const leadSignupsRaw = Array.isArray(parsed.leadSignups) ? parsed.leadSignups : seed.leadSignups;
  const leadSignups = leadSignupsRaw.map((item) => normalizeLeadSignup(item as LeadSignup));

  const services: Service[] = Array.isArray(parsed.services)
    ? mergeServicesWithSeed(parsed.services as Service[], seed.services)
    : seed.services;

  const vipPassSlots: VipPassSlot[] = Array.isArray(parsed.vipPassSlots) ? parsed.vipPassSlots : seed.vipPassSlots;
  const vipPassInterests: VipPassInterest[] = Array.isArray(parsed.vipPassInterests)
    ? mergeVipPassInterestsWithSeed(parsed.vipPassInterests as VipPassInterest[], seed.vipPassInterests)
    : seed.vipPassInterests;

  return {
    trainings: Array.isArray(parsed.trainings) ? parsed.trainings : seed.trainings,
    interests: Array.isArray(parsed.interests) ? parsed.interests : seed.interests,
    leadArticles: Array.isArray(parsed.leadArticles) ? parsed.leadArticles : seed.leadArticles,
    leadSignups,
    services,
    vipPassSlots,
    vipPassInterests,
    lastSyncedAt: typeof parsed.lastSyncedAt === 'string' ? parsed.lastSyncedAt : new Date().toISOString(),
  };
}

export function loadStore() {
  if (typeof window === 'undefined') {
    return cloneSeed();
  }

  const rawV2 = window.localStorage.getItem(STORAGE_KEY);
  const rawLegacy = window.localStorage.getItem(STORAGE_KEY_LEGACY);
  const raw = rawV2 ?? rawLegacy;

  if (!raw) {
    return cloneSeed();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AdminStore>;
    const store = normalizeFromParsed(parsed);

    if (!rawV2 && rawLegacy) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      window.localStorage.removeItem(STORAGE_KEY_LEGACY);
    }

    return store;
  } catch {
    return cloneSeed();
  }
}

export function saveStore(store: AdminStore) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
