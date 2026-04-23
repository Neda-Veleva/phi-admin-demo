import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Mail, Plus, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/admin-context';
import {
  VIP_MAX_SLOTS_PER_MONTH,
  countSlotsForMonthAll,
  formatMonthYearBg,
  vipPassKindLabel,
  yearMonthFromDate,
} from '../../lib/vip-pass';
import type { VipPassKind } from '../../types';

type KindFilter = VipPassKind | 'all';
const MAILTO_SAFE = 1850;

export function VipPassSlotsListView() {
  const { store, removeVipPassSlot } = useAdmin();
  const [toast, setToast] = useState<string | null>(null);
  const [kind, setKind] = useState<KindFilter>('all');
  const [notifySelected, setNotifySelected] = useState<Set<string>>(new Set());
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const ym = yearMonthFromDate(visibleMonth);
  const totalCountMonth = useMemo(() => countSlotsForMonthAll(store.vipPassSlots, ym), [store.vipPassSlots, ym]);

  const rows = useMemo(() => {
    return store.vipPassSlots
      .filter((s) => s.yearMonth === ym && (kind === 'all' ? true : s.kind === kind))
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.kind.localeCompare(b.kind));
  }, [store.vipPassSlots, ym, kind]);

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

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3800);
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

  return (
    <div className="content-stack content-stack--tight">
      {toast && <div className="toast-banner">{toast}</div>}

      <section className="panel list-only-panel" aria-label="VIP часове — списък">
        <div className="panel-toolbar panel-toolbar--wrap">
          <div className="vip-calendar__toolbar" aria-label="Избор на месец">
            <button type="button" className="vip-calendar__nav" onClick={prevMonth} aria-label="Предишен месец">
              <ChevronLeft size={22} />
            </button>
            <h3 className="vip-calendar__month">{formatMonthYearBg(visibleMonth)}</h3>
            <button type="button" className="vip-calendar__nav" onClick={nextMonth} aria-label="Следващ месец">
              <ChevronRight size={22} />
            </button>
          </div>

          <span className="vip-pass-kind-tabs__hint">
            {totalCountMonth}/{VIP_MAX_SLOTS_PER_MONTH} часа общо за месеца
          </span>

          <Link className="button primary button--sm" to="/vip-pass/slots/new">
            <Plus size={16} />
            Добави часове
          </Link>
        </div>

        <div className="vip-pass-kind-tabs vip-pass-kind-tabs--compact vip-pass-kind-tabs--panel-sep">
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

        <div className="lead-article-table-wrap">
          <table className="data-table data-table--compact">
            <thead>
              <tr>
                <th>Тип</th>
                <th>Дата</th>
                <th>Час</th>
                <th aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state compact">Няма добавени VIP часове за този месец.</div>
                  </td>
                </tr>
              ) : (
                rows.map((slot) => (
                  <tr key={slot.id}>
                    <td>
                      <span className={`vip-kind-pill vip-kind-pill--${slot.kind}`}>
                        {vipPassKindLabel(slot.kind as VipPassKind)}
                      </span>
                    </td>
                    <td>
                      <strong>{slot.date}</strong>
                    </td>
                    <td className="table-cell-muted">{slot.time} ч.</td>
                    <td>
                      <button
                        type="button"
                        className="icon-danger"
                        aria-label="Изтрий"
                        onClick={() => {
                          removeVipPassSlot(slot.id);
                          showToast('Часът е изтрит.');
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

