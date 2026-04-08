import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Copy, Plus, Square, Trash2 } from 'lucide-react';
import { createId } from '../../lib/format';
import { vipPassKindLabel } from '../../lib/vip-pass';
import { useAdmin } from '../../context/admin-context';
import type { VipPassKind, VipPassInterest } from '../../types';

export function VipPassInterestsView() {
  const { store, upsertVipPassInterest, removeVipPassInterest } = useAdmin();
  const [kindFilter, setKindFilter] = useState<'all' | VipPassKind>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState({
    fullName: '',
    email: '',
    phone: '',
    kind: 'brows' as VipPassKind,
  });

  const rows = useMemo(() => {
    const list = [...store.vipPassInterests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (kindFilter === 'all') return list;
    return list.filter((r) => r.kind === kindFilter);
  }, [kindFilter, store.vipPassInterests]);

  useEffect(() => {
    setSelected((prev) => new Set([...prev].filter((id) => rows.some((r) => r.id === id))));
  }, [rows]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3800);
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedEmails = useMemo(() => {
    const emails = rows.filter((r) => selected.has(r.id)).map((r) => r.email.trim()).filter(Boolean);
    return [...new Set(emails)];
  }, [rows, selected]);

  const allVisibleSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = selectedEmails.length > 0;

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        rows.forEach((r) => next.delete(r.id));
        return next;
      });
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((r) => next.add(r.id));
      return next;
    });
  }

  async function copySelectedEmails() {
    if (!someSelected) {
      showToast('Изберете поне един контакт.');
      return;
    }
    const text = selectedEmails.join(', ');
    try {
      await navigator.clipboard.writeText(text);
      showToast('Имейлите са копирани в клипборда.');
    } catch {
      showToast('Копирането не бе успешно — опитайте отново.');
    }
  }

  function handleAdd() {
    const fullName = draft.fullName.trim();
    const email = draft.email.trim();
    if (!fullName || !email) {
      showToast('Попълнете име и имейл.');
      return;
    }
    const row: VipPassInterest = {
      id: createId('vip-i'),
      kind: draft.kind,
      fullName,
      email,
      phone: draft.phone.trim(),
      source: 'Ръчно добавен',
      createdAt: new Date().toISOString(),
    };
    upsertVipPassInterest(row);
    setDraft((d) => ({ ...d, fullName: '', email: '', phone: '' }));
    showToast('Записът е добавен.');
  }

  return (
    <div className="content-stack content-stack--tight">
      {toast && <div className="toast-banner">{toast}</div>}

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">VIP PASS</span>
            <h3>Нов запис</h3>
          </div>
        </div>
        <div className="vip-interest-add-grid">
          <label className="field">
            <span>Тип</span>
            <select className="select" value={draft.kind} onChange={(e) => setDraft((d) => ({ ...d, kind: e.target.value as VipPassKind }))}>
              <option value="brows">{vipPassKindLabel('brows')}</option>
              <option value="lips">{vipPassKindLabel('lips')}</option>
            </select>
          </label>
          <label className="field">
            <span>Име</span>
            <input
              className="input"
              value={draft.fullName}
              onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
              placeholder="Име и фамилия"
            />
          </label>
          <label className="field">
            <span>Имейл</span>
            <input
              className="input"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              placeholder="email@…"
            />
          </label>
          <label className="field">
            <span>Телефон</span>
            <input
              className="input"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              placeholder="По избор"
            />
          </label>
          <div className="vip-interest-add-actions">
            <button type="button" className="button primary button--sm" onClick={handleAdd}>
              <Plus size={17} />
              Добави
            </button>
          </div>
        </div>
      </section>

      <section className="panel list-only-panel">
        <div className="panel-toolbar panel-toolbar--wrap">
          <select className="select" value={kindFilter} onChange={(e) => setKindFilter(e.target.value as 'all' | VipPassKind)}>
            <option value="all">Всички типове</option>
            <option value="brows">{vipPassKindLabel('brows')}</option>
            <option value="lips">{vipPassKindLabel('lips')}</option>
          </select>
          <Link className="text-button panel-toolbar-cta" to="/vip-pass/slots">
            Към календара за часове →
          </Link>
        </div>

        <div className="bulk-bar">
          <button type="button" className="text-button bulk-bar__select" onClick={toggleSelectAllVisible} disabled={rows.length === 0}>
            {allVisibleSelected ? <CheckSquare size={18} /> : <Square size={18} />}
            {allVisibleSelected ? 'Премахни избора от видимите' : 'Избери всички видими'}
          </button>
          <span className="bulk-bar__count">{selectedEmails.length} избрани</span>
          <div className="bulk-bar__buttons">
            <button type="button" className="button secondary button--compact" onClick={copySelectedEmails} disabled={!someSelected}>
              <Copy size={16} />
              Копирай имейли
            </button>
          </div>
        </div>

        <div className="lead-article-table-wrap">
          <table className="data-table data-table--compact">
            <thead>
              <tr>
                <th className="th-check" aria-label="Избор" />
                <th>Тип</th>
                <th>Име</th>
                <th>Имейл</th>
                <th>Телефон</th>
                <th>Източник</th>
                <th aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state compact">Няма записи. Добавете първия или изчакайте заявки от сайта.</div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="td-check">
                      <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelected(row.id)} />
                    </td>
                    <td>
                      <span className={`vip-kind-pill vip-kind-pill--${row.kind}`}>{vipPassKindLabel(row.kind)}</span>
                    </td>
                    <td>
                      <strong>{row.fullName}</strong>
                    </td>
                    <td>{row.email}</td>
                    <td className="table-cell-muted">{row.phone || '—'}</td>
                    <td className="table-cell-muted">{row.source}</td>
                    <td>
                      <button
                        type="button"
                        className="icon-danger"
                        aria-label="Премахни"
                        onClick={() => removeVipPassInterest(row.id)}
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
    </div>
  );
}
