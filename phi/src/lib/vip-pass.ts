import type { VipPassKind, VipPassSlot } from '../types';

export const VIP_MAX_SLOTS_PER_MONTH = 4;
export const VIP_MIN_SLOTS_RECOMMENDED = 2;

export function vipPassKindLabel(kind: VipPassKind): string {
  return kind === 'brows' ? 'VIP PASS Вежди' : 'VIP PASS Устни';
}

export function yearMonthFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function dateKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function countSlotsForMonth(slots: VipPassSlot[], yearMonth: string, kind: VipPassKind): number {
  return slots.filter((s) => s.yearMonth === yearMonth && s.kind === kind).length;
}

export function countSlotsForMonthAll(slots: VipPassSlot[], yearMonth: string): number {
  return slots.filter((s) => s.yearMonth === yearMonth).length;
}

export function slotsForDayFilter(slots: VipPassSlot[], dateKey: string, kind: VipPassKind): VipPassSlot[] {
  return slots.filter((s) => s.date === dateKey && s.kind === kind).sort((a, b) => a.time.localeCompare(b.time));
}

/** Клетки за календар (понеделник първи колона). */
export function buildCalendarCells(visibleMonth: Date): (Date | null)[] {
  const y = visibleMonth.getFullYear();
  const m = visibleMonth.getMonth();
  const first = new Date(y, m, 1);
  const startPad = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
  const tail = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < tail; i++) cells.push(null);
  return cells;
}

const MONTH_NAMES_BG = [
  'януари',
  'февруари',
  'март',
  'април',
  'май',
  'юни',
  'юли',
  'август',
  'септември',
  'октомври',
  'ноември',
  'декември',
];

export function formatMonthYearBg(d: Date): string {
  return `${MONTH_NAMES_BG[d.getMonth()]} ${d.getFullYear()} г.`.toUpperCase();
}

export function formatWeekdayDateBg(d: Date): string {
  const w = new Intl.DateTimeFormat('bg-BG', { weekday: 'long' }).format(d);
  const rest = new Intl.DateTimeFormat('bg-BG', { day: 'numeric', month: 'long' }).format(d);
  return `${w}, ${rest}`;
}

/** Начални часове за VIP слот (услугата е 2 ч.): 08:00 … 20:00 на всеки 2 часа. */
export const VIP_SLOT_START_TIMES_2H = [
  '08:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
] as const;

export function vipSlotStartTimes2h(): string[] {
  return [...VIP_SLOT_START_TIMES_2H];
}

/**
 * Два „заети“ часa за избрания ден (демо UI — различно по дни/тип),
 * все едно са блокирани от външен календар.
 */
export function vipDemoBlockedStartTimes(dateKey: string, kind: VipPassKind, allTimes: readonly string[]): Set<string> {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  h = (h + (kind === 'lips' ? 7919 : 6151)) >>> 0;
  const n = allTimes.length;
  if (n === 0) return new Set();
  const i1 = h % n;
  const i2 = (h >> 5) % n;
  const out = new Set<string>();
  out.add(allTimes[i1]);
  out.add(allTimes[i2 === i1 ? (i1 + 2) % n : i2]);
  return out;
}

export function timeOptionsStep30(): string[] {
  const out: string[] = [];
  for (let h = 9; h <= 19; h++) {
    for (const m of [0, 30]) {
      if (h === 19 && m > 0) break;
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return out;
}
