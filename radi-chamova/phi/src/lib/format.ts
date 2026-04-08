export function formatDate(value: string) {
  if (!value) return 'Без дата';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Невалидна дата';

  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string) {
  if (!value) return 'Няма контакт';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Невалидна дата';

  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function toLocalDateTimeInput(value: string) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function trainingStatusLabel(status: 'draft' | 'scheduled' | 'published' | 'archived') {
  return {
    draft: 'Чернова',
    scheduled: 'Планирано',
    published: 'Публикувано',
    archived: 'Архив',
  }[status];
}

export function interestStatusLabel(status: 'new' | 'no_answer' | 'interested' | 'not_interested' | 'enrolled' | 'completed') {
  return {
    new: 'Нов',
    no_answer: 'Не вдига',
    interested: 'Проявява интерес',
    not_interested: 'Не се интересува',
    enrolled: 'Записал се',
    completed: 'Завършил',
  }[status];
}

export function temperatureLabel(temperature: 'hot' | 'warm' | 'cold') {
  return {
    hot: 'Горещ',
    warm: 'Топъл',
    cold: 'Студен',
  }[temperature];
}

export function leadArticleStatusLabel(status: 'draft' | 'published') {
  return status === 'published' ? 'Публикувана' : 'Чернова';
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinCsv(values: string[]) {
  return values.join(', ');
}

export function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isDataUrlMaterial(url: string): boolean {
  return url.trim().startsWith('data:');
}

/** Ред за имейл шаблон — не вмъква data URL (твърде дълъг за mailto). */
export function leadMaterialLineForEmail(materialUrl: string): string {
  const u = materialUrl.trim();
  if (!u) {
    return 'Материалът се изпраща като прикачен файл от вас (вижте етикета по-долу).';
  }
  if (isDataUrlMaterial(u)) {
    return 'Материалът е качен в админ панела — прикачете PDF или снимката ръчно към имейла.';
  }
  return `Линк към материал: ${u}`;
}
