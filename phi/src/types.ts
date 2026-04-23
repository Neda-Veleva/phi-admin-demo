export type TrainingStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type TrainingFormat = 'live' | 'online' | 'hybrid';
export type InterestStatus = 'new' | 'no_answer' | 'interested' | 'not_interested' | 'enrolled' | 'completed';
export type InterestTemperature = 'hot' | 'warm' | 'cold';

export interface Training {
  id: string;
  slug: string;
  title: string;
  /** Подзаглавие / лайн под заглавието на курса. */
  subtitle: string;
  academy: string;
  category: string;
  level: string;
  status: TrainingStatus;
  format: TrainingFormat;
  location: string;
  durationLabel: string;
  priceEUR: number;
  nextDate: string;
  seatsTotal: number;
  seatsReserved: number;
  /** Кратко въведение; съдържа HTML от rich text редактора. */
  shortDescription: string;
  longDescription: string;
  /** Галерия hero: data URL или външни линкове. */
  heroImages: string[];
  tags: string[];
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InterestNote {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface InterestedPerson {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  source: string;
  status: InterestStatus;
  temperature: InterestTemperature;
  preferredTrainingId: string;
  trainingIds: string[];
  summary: string;
  createdAt: string;
  lastContactAt: string;
  notes: InterestNote[];
}

export type LeadArticleStatus = 'draft' | 'published';

/** Безплатна статия / ресурс за lead magnet (регистрация срещу съдържание). */
export interface LeadArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  status: LeadArticleStatus;
  /** Етикет за прикачения файл, напр. „PDF чеклист“. */
  materialLabel: string;
  /** Външен линк, или data URL от качен PDF/снимка, или празно — изпращате ръчно по имейл. */
  materialUrl: string;
  /** Име на качения файл (когато materialUrl е data URL). */
  materialFileName?: string;
  createdAt: string;
  updatedAt: string;
}

/** Контакт от форма „регистрация за безплатно съдържание“. */
export interface LeadSignup {
  id: string;
  email: string;
  fullName: string;
  articleId: string;
  source: string;
  createdAt: string;
  /** Дали материалът е изпратен на контакта (ръчно маркиране). */
  materialSent: boolean;
  /** Кога е маркирано като изпратен; null ако не е изпратен. */
  materialSentAt: string | null;
}

export type VipPassKind = 'brows' | 'lips';

export type ServiceCategory = 'brows' | 'lips';

/** Услуга от списъка (по phi.bg), управлявана в администрацията. */
export interface Service {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  category: ServiceCategory;
  createdAt: string;
  updatedAt: string;
}

/** Извънреден VIP час (до 4 общо за месеца, за двата типа услуги). */
export interface VipPassSlot {
  id: string;
  kind: VipPassKind;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  time: string;
  /** YYYY-MM */
  yearMonth: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Клиент заявил интерес към VIP PASS (чака известие за часове). */
export interface VipPassInterest {
  id: string;
  kind: VipPassKind;
  fullName: string;
  email: string;
  phone: string;
  source: string;
  createdAt: string;
}

/** Записан на конкретна дата/събитие на курс. */
export interface TrainingEventAttendee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}

/**
 * Конкретна дата и място на провеждане на курс (релация към `Training`).
 */
export interface TrainingEvent {
  id: string;
  trainingId: string;
  /** YYYY-MM-DD (календарна дата). */
  date: string;
  city: string;
  capacity: number;
  /** Видимо за публика (напр. на сайт); „Скрий“ го нулира. */
  published: boolean;
  attendees: TrainingEventAttendee[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminStore {
  trainings: Training[];
  /** Събития по дати (курс + дата + град + капацитет + записани). */
  trainingEvents: TrainingEvent[];
  interests: InterestedPerson[];
  leadArticles: LeadArticle[];
  leadSignups: LeadSignup[];
  services: Service[];
  vipPassSlots: VipPassSlot[];
  vipPassInterests: VipPassInterest[];
  lastSyncedAt: string;
}
