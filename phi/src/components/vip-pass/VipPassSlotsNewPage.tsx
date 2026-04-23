import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Mail, Trash2 } from 'lucide-react';
import { createId } from '../../lib/format';
import {
  VIP_MAX_SLOTS_PER_MONTH,
  VIP_MIN_SLOTS_RECOMMENDED,
  buildCalendarCells,
  countSlotsForMonth,
  countSlotsForMonthAll,
  dateKeyFromDate,
  formatMonthYearBg,
  formatWeekdayDateBg,
  slotsForDayFilter,
  vipDemoBlockedStartTimes,
  vipPassKindLabel,
  vipSlotStartTimes2h,
  yearMonthFromDate,
} from '../../lib/vip-pass';
import { useAdmin } from '../../context/admin-context';
import type { VipPassKind, VipPassSlot } from '../../types';

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'];
type KindFilter = VipPassKind | 'all';
const MAILTO_SAFE = 1850;

export function VipPassSlotsNewPage() {
  const { store, upsertVipPassSlot, removeVipPassSlot } = useAdmin();
  const [kind, setKind] = useState<KindFilter>('all');
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date());
  const [time, setTime] = useState(() => vipSlotStartTimes2h()[1] ?? '10:00');
  const [toast, setToast] = useState<string | null>(null);
  const [notifySelected, setNotifySelected] = useState<Set<string>>(new Set());

  const ym = yearMonthFromDate(visibleMonth);
  const cells = useMemo(() => buildCalendarCells(visibleMonth), [visibleMonth]);

  const countMonthForKind = useMemo(
    () => (kind === 'all' ? countSlotsForMonthAll(store.vipPassSlots, ym) : countSlotsForMonth(store.vipPassSlots, ym, kind)),
    [store.vipPassSlots, ym, kind]
  );
  const countMonthTotal = useMemo(() => countSlotsForMonthAll(store.vipPassSlots, ym), [store.vipPassSlots, ym]);

  const monthSlotsForEmail = useMemo(() => {
    if (kind === 'all') return [];
    return store.vipPassSlots
      .filter((s) => s.yearMonth === ym && s.kind === kind)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [store.vipPassSlots, ym, kind]);

  const interestsForKind = useMemo(() => {
    if (kind === 'all') return [];
    return store.vipPassInterests.filter((i) => i.kind === kind);
  }, [store.vipPassInterests, kind]);

  useEffect(() => {
    if (kind === 'all') {
      setNotifySelected(new Set());
      return;
    }
    setNotifySelected(new Set(interestsForKind.map((i) => i.id)));
  }, [kind, interestsForKind]);

  const selectedKey = selectedDate ? dateKeyFromDate(selectedDate) : null;
  const daySlots = useMemo(() => {
    if (!selectedKey) return [];
    if (kind === 'all') {
      return store.vipPassSlots
        .filter((s) => s.date === selectedKey)
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time) || a.kind.localeCompare(b.kind));
    }
    return slotsForDayFilter(store.vipPassSlots, selectedKey, kind);
  }, [store.vipPassSlots, selectedKey, kind]);

  const startTimes2h = useMemo(() => vipSlotStartTimes2h(), []);
  const blockedTimesForDay = useMemo(() => {
    if (!selectedKey) return { occupied: new Set<string>(), demo: new Set<string>() };
    const occupied = new Set(daySlots.filter((s) => kind === 'all' || s.kind === kind).map((s) => s.time));
    const demo =
      kind === 'all'
        ? new Set<string>()
        : vipDemoBlockedStartTimes(selectedKey, kind, startTimes2h);
    return { occupied, demo };
  }, [selectedKey, kind, daySlots, startTimes2h]);

  useEffect(() => {
    const { occupied, demo } = blockedTimesForDay;
    setTime((prev) => {
      if (occupied.has(prev) || demo.has(prev) || !startTimes2h.includes(prev)) {
        const firstFree = startTimes2h.find((t) => !occupied.has(t) && !demo.has(t));
        return firstFree ?? startTimes2h[0] ?? prev;
      }
      return prev;
    });
  }, [selectedKey, kind, blockedTimesForDay, startTimes2h]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 4200);
  }

  function prevMonth() {
    setVisibleMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setVisibleMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function toggleNotify(id: string) {
    setNotifySelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllNotify() {
    setNotifySelected(new Set(interestsForKind.map((i) => i.id)));
  }

  function clearNotify() {
    setNotifySelected(new Set());
  }

  function buildNotifyMailto() {
    if (kind === 'all') {
      showToast('Изберете тип (Вежди или Устни), за да известите клиенти.');
      return null;
    }
    const recipients = interestsForKind.filter((i) => notifySelected.has(i.id));
    if (recipients.length === 0) {
      showToast('Маркирайте поне един клиент за известяване.');
      return null;
    }
    const emails = [...new Set(recipients.map((r) => r.email.trim()).filter(Boolean))];
    if (emails.length === 0) {
      showToast('Няма валидни имейли.');
      return null;
    }
    if (monthSlotsForEmail.length === 0) {
      showToast('Първо добавете поне един час за месеца.');
      return null;
    }

    const lines = monthSlotsForEmail.map((s) => `· ${s.date} в ${s.time} ч.`);
    const body = [
      'Здравейте,',
      '',
      `Обявени са VIP часове за ${vipPassKindLabel(kind)} (${ym}):`,
      '',
      ...lines,
      '',
      'Моля, свържете се с нас за записване на извънреден час.',
      '',
      'Поздрави,',
      'PHI · phi.bg',
    ].join('\n');

    const bcc = emails.join(',');
    const subject = `VIP PASS — ${vipPassKindLabel(kind)} ${ym}`;
    const href = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (href.length > MAILTO_SAFE) {
      showToast('Твърде дълъг линк — изберете по-малко получатели.');
      return null;
    }
    return { href, bcc };
  }

  function openNotifyEmail() {
    const mailto = buildNotifyMailto();
    if (!mailto) return;
    window.location.href = mailto.href;
  }

  async function sendNotifyEmail() {
    const mailto = buildNotifyMailto();
    if (!mailto) return;
    try {
      await navigator.clipboard.writeText(mailto.bcc);
    } catch {
      // ignore clipboard errors
    }
    window.location.href = mailto.href;
  }

  function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function handlePickDay(d: Date) {
    setSelectedDate(d);
  }

  function handleAddSlot() {
    if (!selectedDate || !selectedKey) {
      showToast('Изберете ден от календара.');
      return;
    }
    if (kind === 'all') {
      showToast('Изберете тип (Вежди или Устни), за да добавите час.');
      return;
    }
    if (countMonthTotal >= VIP_MAX_SLOTS_PER_MONTH) {
      showToast(`Максимум ${VIP_MAX_SLOTS_PER_MONTH} часа общо за месеца (Вежди + Устни).`);
      return;
    }
    if (!startTimes2h.includes(time)) {
      showToast('Изберете начален час от списъка (на всеки 2 часа).');
      return;
    }
    const { occupied, demo } = blockedTimesForDay;
    if (occupied.has(time) || demo.has(time)) {
      showToast('Този час не е свободен.');
      return;
    }
    const duplicate = store.vipPassSlots.some((s) => s.kind === kind && s.date === selectedKey && s.time === time);
    if (duplicate) {
      showToast('Този час вече е добавен.');
      return;
    }
    const now = new Date().toISOString();
    const slot: VipPassSlot = {
      id: createId('vip-slot'),
      kind,
      date: selectedKey,
      time,
      yearMonth: ym,
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
    upsertVipPassSlot(slot);
    showToast('Часът е запазен.');
  }

  const headerRight = selectedDate ? formatWeekdayDateBg(selectedDate).toUpperCase() : 'ИЗБЕРЕТЕ ДЕН';

  const { occupied: occupiedTimes, demo: demoBlockedTimes } = blockedTimesForDay;
  const canUseSelectedTime =
    Boolean(selectedKey) &&
    startTimes2h.includes(time) &&
    !occupiedTimes.has(time) &&
    !demoBlockedTimes.has(time);

  return (
    <div className="content-stack content-stack--tight">
      {toast && <div className="toast-banner">{toast}</div>}

      <div className="panel-toolbar panel-toolbar--wrap">
        <Link className="text-button" to="/vip-pass/slots">
          Към списъка с часове
        </Link>
        <span className="vip-pass-kind-tabs__hint">
          {countMonthTotal}/{VIP_MAX_SLOTS_PER_MONTH} часа общо за месеца
          {countMonthForKind < VIP_MIN_SLOTS_RECOMMENDED && ` · за този тип: ${countMonthForKind} · препоръчително поне ${VIP_MIN_SLOTS_RECOMMENDED}`}
        </span>
      </div>

      <div className="vip-pass-kind-tabs">
        <button
          type="button"
          className={`vip-pass-kind-tabs__btn ${kind === 'all' ? 'is-active' : ''}`}
          onClick={() => setKind('all')}
        >
          Всички
        </button>
        <button
          type="button"
          className={`vip-pass-kind-tabs__btn ${kind === 'brows' ? 'is-active' : ''}`}
          onClick={() => setKind('brows')}
        >
          {vipPassKindLabel('brows')}
        </button>
        <button
          type="button"
          className={`vip-pass-kind-tabs__btn ${kind === 'lips' ? 'is-active' : ''}`}
          onClick={() => setKind('lips')}
        >
          {vipPassKindLabel('lips')}
        </button>
      </div>

      <section className="panel vip-pass-calendar-panel">
        <div className="vip-pass-calendar-layout">
          <div className="vip-calendar">
            <div className="vip-calendar__toolbar">
              <button type="button" className="vip-calendar__nav" onClick={prevMonth} aria-label="Предишен месец">
                <ChevronLeft size={22} />
              </button>
              <h3 className="vip-calendar__month">{formatMonthYearBg(visibleMonth)}</h3>
              <button type="button" className="vip-calendar__nav" onClick={nextMonth} aria-label="Следващ месец">
                <ChevronRight size={22} />
              </button>
            </div>
            <div className="vip-calendar__weekdays">
              {WEEKDAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="vip-calendar__grid">
              {cells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`e-${idx}`} className="vip-calendar__cell vip-calendar__cell--empty" />;
                }
                const key = dateKeyFromDate(cell);
                const isSelected = selectedDate && isSameDay(cell, selectedDate);
                const hasSlot =
                  kind === 'all'
                    ? store.vipPassSlots.some((s) => s.date === key)
                    : store.vipPassSlots.some((s) => s.date === key && s.kind === kind);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`vip-calendar__cell ${isSelected ? 'is-selected' : ''} ${hasSlot ? 'has-slot' : ''}`}
                    onClick={() => handlePickDay(cell)}
                  >
                    <span className="vip-calendar__num">{cell.getDate()}</span>
                    {hasSlot && <span className="vip-calendar__dot" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="vip-pass-day-panel">
            <p className="vip-pass-day-panel__eyebrow">Наличност</p>
            <h3 className="vip-pass-day-panel__title">{headerRight}</h3>
            {daySlots.length === 0 ? (
              <p className="vip-pass-day-panel__empty">Няма часове за този ден — добавете отдолу.</p>
            ) : (
              <ul className="vip-slot-chips">
                {daySlots.map((s) => (
                  <li key={s.id} className="vip-slot-chip">
                    <span>
                      {s.time} ч.
                      {kind === 'all' && (
                        <span className={`vip-kind-pill vip-kind-pill--${s.kind}`} style={{ marginLeft: 8 }}>
                          {vipPassKindLabel(s.kind)}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      className="vip-slot-chip__remove"
                      aria-label="Премахни час"
                      onClick={() => removeVipPassSlot(s.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="vip-pass-add-slot">
              <div className="field vip-pass-add-slot__times-field">
                <span>Час · начало на слота (услугата е 2 часа)</span>
                <div className="vip-slot-time-grid" role="group" aria-label="Начален час">
                  {startTimes2h.map((t) => {
                    const isOccupied = occupiedTimes.has(t);
                    const isDemoBusy = demoBlockedTimes.has(t);
                    const blocked = isOccupied || isDemoBusy;
                    const isSelected = time === t && !blocked;
                    let title: string | undefined;
                    if (isOccupied) title = 'Вече добавен за този ден';
                    else if (isDemoBusy) title = 'Зает за този ден';
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`vip-slot-time-btn ${isSelected ? 'is-selected' : ''} ${blocked ? 'is-blocked' : ''}`}
                        disabled={blocked}
                        title={title}
                        onClick={() => {
                          if (!blocked) setTime(t);
                        }}
                      >
                        {t}
                        <span className="vip-slot-time-btn__suffix" aria-hidden>
                          {' '}
                          ч.
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                className="button primary button--sm vip-pass-add-slot__submit"
                onClick={handleAddSlot}
                disabled={kind === 'all' || countMonthTotal >= VIP_MAX_SLOTS_PER_MONTH || !canUseSelectedTime}
              >
                Добави час
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel vip-pass-clients-panel" aria-label="Клиенти за известяване">
        <div className="vip-pass-notify">
          <p className="vip-pass-notify__title">Извести клиенти (имейл)</p>
          <p className="vip-pass-notify__hint">
            След като сте добавили часовете, маркирайте кои заявили интерес да получат съобщение. Отваря се имейл клиентът ви
            с готов текст за месеца.
          </p>

          {kind === 'all' ? (
            <p className="table-cell-muted">Изберете „VIP PASS Вежди“ или „VIP PASS Устни“, за да видите списъка с клиенти.</p>
          ) : interestsForKind.length === 0 ? (
            <p className="table-cell-muted">
              Няма заявки за този тип —{' '}
              <Link className="text-button" to="/vip-pass/interests">
                добавете клиенти
              </Link>
              .
            </p>
          ) : (
            <>
              <div className="vip-pass-notify__toolbar">
                <button type="button" className="vip-pass-notify__action" onClick={selectAllNotify}>
                  Всички
                </button>
                <button type="button" className="vip-pass-notify__action" onClick={clearNotify}>
                  Без избор
                </button>
              </div>
              <ul className="vip-pass-notify__list">
                {interestsForKind.map((i) => (
                  <li key={i.id}>
                    <label className="vip-pass-notify__row">
                      <input type="checkbox" checked={notifySelected.has(i.id)} onChange={() => toggleNotify(i.id)} />
                      <span>
                        <strong>{i.fullName}</strong> · {i.email}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="button secondary button--sm"
                onClick={openNotifyEmail}
                disabled={monthSlotsForEmail.length === 0}
              >
                <Mail size={16} />
                Отвори имейл с известие
              </button>
              <button
                type="button"
                className="button primary button--sm"
                onClick={sendNotifyEmail}
                disabled={monthSlotsForEmail.length === 0}
              >
                <Mail size={16} />
                Изпрати имейл с известие
              </button>
              {monthSlotsForEmail.length === 0 && <p className="vip-pass-notify__warn">Първо добавете поне един час за месеца.</p>}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

