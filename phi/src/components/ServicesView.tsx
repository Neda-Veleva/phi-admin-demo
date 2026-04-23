import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdmin } from '../context/admin-context';
import type { ServiceCategory } from '../types';

type Filter = 'all' | ServiceCategory;

const FILTER_LABELS: Record<Filter, string> = {
  all: 'Всички услуги',
  brows: 'Вежди',
  lips: 'Устни',
};

export function ServicesView() {
  const { store, removeService } = useAdmin();
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    const list = [...(store.services ?? [])].sort(
      (a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
    );
    if (filter === 'all') return list;
    return list.filter((s) => s.category === filter);
  }, [filter, store.services]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3800);
  }

  return (
    <div className="content-stack content-stack--tight">
      {toast && <div className="toast-banner">{toast}</div>}

      <div className="services-admin-layout">
        <section className="panel list-only-panel services-admin-list" aria-label="Списък с услуги">
          <div className="panel-toolbar panel-toolbar--wrap">
            <div className="services-admin-filters" role="tablist" aria-label="Филтър по тип услуга">
              {(Object.keys(FILTER_LABELS) as Filter[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={filter === key}
                  className={`book-online-services__tab ${filter === key ? 'is-active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {FILTER_LABELS[key]}
                </button>
              ))}
            </div>
            <Link className="button primary button--sm" to="/services/new">
              <Plus size={16} />
              Добави услуга
            </Link>
          </div>

          <div className="lead-article-table-wrap">
            <table className="data-table data-table--compact">
              <thead>
                <tr>
                  <th>Тип</th>
                  <th>Услуга</th>
                  <th>Продълж.</th>
                  <th>Цена</th>
                  <th aria-label="Действия" />
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state compact">Няма услуги.</div>
                    </td>
                  </tr>
                ) : (
                  visible.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className={`vip-kind-pill vip-kind-pill--${s.category}`}>
                          {s.category === 'brows' ? 'Вежди' : 'Устни'}
                        </span>
                      </td>
                      <td>
                        <strong>{s.title}</strong>
                      </td>
                      <td className="table-cell-muted">{s.duration || '—'}</td>
                      <td className="table-cell-muted">{s.price || '—'}</td>
                      <td>
                        <div className="services-admin-row-actions">
                          <Link
                            className="table-icon-link"
                            aria-label="Редакция"
                            to={`/services/${s.id}/edit`}
                          >
                            <Pencil size={18} />
                          </Link>
                          <button
                            type="button"
                            className="icon-danger"
                            aria-label="Изтрий"
                            onClick={() => {
                              removeService(s.id);
                              showToast('Услугата е изтрита.');
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

