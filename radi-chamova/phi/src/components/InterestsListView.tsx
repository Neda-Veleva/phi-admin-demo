import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Copy, Pencil, Plus, Square } from 'lucide-react';
import { formatDateTime } from '../lib/format';
import { useAdmin } from '../context/admin-context';
import type { InterestStatus } from '../types';

export function InterestsListView() {
  const { store, upsertInterest } = useAdmin();
  const { interests } = store;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InterestStatus>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function telHref(phone: string) {
    const cleaned = phone.trim().replace(/[^\d+]/g, '');
    return cleaned ? `tel:${cleaned}` : '';
  }

  const trainingTitleById = useMemo(() => {
    return new Map(store.trainings.map((t) => [t.id, t.title]));
  }, [store.trainings]);

  const filteredInterests = useMemo(() => {
    return interests.filter((person) => {
      const matchesSearch =
        person.fullName.toLowerCase().includes(search.toLowerCase()) ||
        person.email.toLowerCase().includes(search.toLowerCase()) ||
        person.city.toLowerCase().includes(search.toLowerCase()) ||
        person.phone.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : person.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [interests, search, statusFilter]);

  const visibleRows = useMemo(() => {
    return filteredInterests
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredInterests]);

  useEffect(() => {
    setSelected((prev) => new Set([...prev].filter((id) => visibleRows.some((r) => r.id === id))));
  }, [visibleRows]);

  const selectedEmails = useMemo(() => {
    const emails = visibleRows
      .filter((p) => selected.has(p.id))
      .map((p) => p.email.trim())
      .filter(Boolean);
    return [...new Set(emails)];
  }, [selected, visibleRows]);

  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((p) => selected.has(p.id));
  const someSelected = selectedEmails.length > 0;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleRows.forEach((p) => next.delete(p.id));
        return next;
      });
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      visibleRows.forEach((p) => next.add(p.id));
      return next;
    });
  }

  async function copySelectedEmails() {
    if (!someSelected) return;
    const text = selectedEmails.join(', ');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no toast here; keep quiet like other tables
    }
  }

  return (
    <div className="content-stack content-stack--tight">
      <section className="panel list-only-panel">
        <div className="panel-toolbar panel-toolbar--wrap">
          <input
            className="input"
            type="search"
            placeholder="Търси по име, имейл, телефон или град"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | InterestStatus)}
          >
            <option value="all">Всички статуси</option>
            <option value="new">Нов</option>
            <option value="no_answer">Не вдига</option>
            <option value="interested">Проявява интерес</option>
            <option value="not_interested">Не се интересува</option>
            <option value="enrolled">Записал се</option>
            <option value="completed">Завършил</option>
          </select>
          <Link className="button primary button--sm panel-toolbar-cta" to="/interests/new">
            <Plus size={17} />
            Нов контакт
          </Link>
        </div>

        <div className="bulk-bar">
          <button
            type="button"
            className="text-button bulk-bar__select"
            onClick={toggleSelectAllVisible}
            disabled={visibleRows.length === 0}
          >
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
                <th>Име</th>
                <th>Телефон</th>
                <th>Имейл</th>
                <th>Курс</th>
                <th>Дата</th>
                <th>Бележки</th>
                <th>Статус</th>
                <th aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state compact">Няма хора, които да отговарят на текущия филтър.</div>
                  </td>
                </tr>
              ) : (
                visibleRows.map((person) => (
                    <tr key={person.id}>
                      {(() => {
                        const leadingTrainingId = person.preferredTrainingId || person.trainingIds[0] || '';
                        const leadingTrainingTitle = leadingTrainingId ? trainingTitleById.get(leadingTrainingId) : undefined;

                        return (
                          <>
                            <td className="td-check">
                              <input
                                type="checkbox"
                                checked={selected.has(person.id)}
                                onChange={() => toggle(person.id)}
                                aria-label={`Избор ${person.fullName}`}
                              />
                            </td>
                            <td>
                              <strong>{person.fullName}</strong>
                            </td>
                            <td className="table-cell-muted">
                              {person.phone ? (
                                <a className="table-link" href={telHref(person.phone)}>
                                  {person.phone}
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>
                              {person.email ? (
                                <a className="table-link" href={`mailto:${encodeURIComponent(person.email)}`}>
                                  {person.email}
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="table-cell-muted">{leadingTrainingTitle || '—'}</td>
                            <td className="table-cell-muted">{formatDateTime(person.createdAt)}</td>
                            <td className="table-cell-muted">{person.notes.length === 0 ? '—' : `${person.notes.length} бел.`}</td>
                            <td>
                              <span className={`soft-pill ${person.status} status-pill-editor`}>
                                <select
                                  className="status-pill-editor__select"
                                  value={person.status}
                                  onChange={(event) => {
                                    const nextStatus = event.target.value as InterestStatus;
                                    upsertInterest({ ...person, status: nextStatus });
                                  }}
                                  aria-label={`Статус за ${person.fullName}`}
                                >
                                  <option value="new">Нов</option>
                                  <option value="no_answer">Не вдига</option>
                                  <option value="interested">Проявява интерес</option>
                                  <option value="not_interested">Не се интересува</option>
                                  <option value="enrolled">Записал се</option>
                                  <option value="completed">Завършил</option>
                                </select>
                              </span>
                            </td>
                            <td>
                              <Link className="button secondary button--compact" to={`/interests/${person.id}/edit`}>
                                <Pencil size={16} />
                                Отвори карта
                              </Link>
                            </td>
                          </>
                        );
                      })()}
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
