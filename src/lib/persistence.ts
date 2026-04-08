import { seedStore } from '../data/seed';
import type {
  AdminStore,
  InterestedPerson,
  InterestNote,
  LeadArticle,
  LeadSignup,
  Service,
  VipPassInterest,
  VipPassSlot,
} from '../types';

const STORAGE_KEY = 'phi-admin-store-v2';
const STORAGE_KEY_LEGACY = 'phi-admin-store-v1';

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedStore)) as AdminStore;
}

function normalizeEmailToExample(value: string): string {
  const input = value.trim();
  if (!input) return '';
  const at = input.indexOf('@');
  if (at <= 0) return input;
  const local = input.slice(0, at);
  return `${local}@example.com`;
}

function normalizeInterestNote(raw: Partial<InterestNote> & { id: string }): InterestNote {
  return {
    id: raw.id,
    author: typeof raw.author === 'string' ? raw.author : 'Admin',
    body: typeof raw.body === 'string' ? raw.body : '',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
  };
}

function normalizeInterestedPerson(raw: Partial<InterestedPerson> & { id: string }): InterestedPerson {
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
  const lastContactAt = typeof raw.lastContactAt === 'string' ? raw.lastContactAt : createdAt;
  const status =
    raw.status === 'new' ||
    raw.status === 'no_answer' ||
    raw.status === 'interested' ||
    raw.status === 'not_interested' ||
    raw.status === 'enrolled' ||
    raw.status === 'completed'
      ? raw.status
      : raw.status === 'reserved'
        ? 'enrolled'
        : raw.status === 'contacted' || raw.status === 'qualified'
          ? 'interested'
          : 'new';

  return {
    id: raw.id,
    fullName: typeof raw.fullName === 'string' ? raw.fullName : '',
    email: typeof raw.email === 'string' ? normalizeEmailToExample(raw.email) : '',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    city: typeof raw.city === 'string' ? raw.city : '',
    source: typeof raw.source === 'string' ? raw.source : '',
    status,
    temperature: raw.temperature === 'hot' || raw.temperature === 'warm' || raw.temperature === 'cold' ? raw.temperature : 'warm',
    preferredTrainingId: typeof raw.preferredTrainingId === 'string' ? raw.preferredTrainingId : '',
    trainingIds: Array.isArray(raw.trainingIds) ? raw.trainingIds.filter((x): x is string => typeof x === 'string') : [],
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    createdAt,
    lastContactAt,
    notes: Array.isArray(raw.notes)
      ? raw.notes
          .filter((n): n is InterestNote => Boolean(n && typeof (n as InterestNote).id === 'string'))
          .map((n) => normalizeInterestNote(n as Partial<InterestNote> & { id: string }))
      : [],
  };
}

function mergeInterestedPeopleWithSeed(parsed: InterestedPerson[], seedList: InterestedPerson[]): InterestedPerson[] {
  const parsedNorm = parsed.map((item) => normalizeInterestedPerson(item as Partial<InterestedPerson> & { id: string }));
  const ids = new Set(parsedNorm.map((p) => p.id));
  const extra = seedList.filter((s) => !ids.has(s.id)).map((s) => normalizeInterestedPerson(s as Partial<InterestedPerson> & { id: string }));
  return [...parsedNorm, ...extra];
}

function normalizeVipPassInterest(raw: Partial<VipPassInterest> & { id: string }): VipPassInterest {
  const kind = raw.kind === 'lips' ? 'lips' : 'brows';
  return {
    id: raw.id,
    kind,
    fullName: typeof raw.fullName === 'string' ? raw.fullName : '',
    email: typeof raw.email === 'string' ? normalizeEmailToExample(raw.email) : '',
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

function normalizeLeadArticle(raw: Partial<LeadArticle> & { id: string }): LeadArticle {
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString();
  return {
    id: raw.id,
    slug: typeof raw.slug === 'string' ? raw.slug : raw.id,
    title: typeof raw.title === 'string' ? raw.title : '',
    excerpt: typeof raw.excerpt === 'string' ? raw.excerpt : '',
    body: typeof raw.body === 'string' ? raw.body : '',
    status: raw.status === 'published' ? 'published' : 'draft',
    materialLabel: typeof raw.materialLabel === 'string' ? raw.materialLabel : '',
    materialUrl: typeof raw.materialUrl === 'string' ? raw.materialUrl : '',
    materialFileName: typeof raw.materialFileName === 'string' ? raw.materialFileName : undefined,
    createdAt,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : createdAt,
  };
}

function mergeLeadArticlesWithSeed(parsed: LeadArticle[], seedList: LeadArticle[]): LeadArticle[] {
  const parsedNorm = parsed.map((item) => normalizeLeadArticle(item as Partial<LeadArticle> & { id: string }));
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
    email: typeof raw.email === 'string' ? normalizeEmailToExample(raw.email) : '',
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

  const leadArticles: LeadArticle[] = Array.isArray(parsed.leadArticles)
    ? mergeLeadArticlesWithSeed(parsed.leadArticles as LeadArticle[], seed.leadArticles)
    : seed.leadArticles;

  const interests: InterestedPerson[] = Array.isArray(parsed.interests)
    ? mergeInterestedPeopleWithSeed(parsed.interests as InterestedPerson[], seed.interests)
    : seed.interests.map((person) => normalizeInterestedPerson(person as Partial<InterestedPerson> & { id: string }));

  return {
    trainings: Array.isArray(parsed.trainings) ? parsed.trainings : seed.trainings,
    interests,
    leadArticles,
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
