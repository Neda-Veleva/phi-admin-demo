import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarClock, Copy, Eye, History, Pencil, Plus, Trash2 } from 'lucide-react';
import { formatDate, isUpcomingYmd } from '../lib/format';
import { useAdmin } from '../context/admin-context';
import type { TrainingEvent } from '../types';

function remainingSeats(e: TrainingEvent) {
  return Math.max(0, e.capacity - e.attendees.length);
}

function sortByDate(variant: 'upcoming' | 'past', list: TrainingEvent[]) {
  const copy = [...list];
  if (variant === 'upcoming') {
    return copy.sort((a, b) => a.date.localeCompare(b.date));
  }
  return copy.sort((a, b) => b.date.localeCompare(a.date));
}

type Props = { variant: 'upcoming' | 'past' };

export function TrainingEventsListView({ variant }: Props) {
  const navigate = useNavigate();
  const { store, removeTrainingEvent, duplicateTrainingEvent, upsertTrainingEvent } = useAdmin();
  const { trainingEvents, trainings } = store;

  const title = variant === 'upcoming' ? 'Предстоящи обучения' : 'Минали обучения';
  const byCourse = useMemo(
    () => new Map(trainings.map((t) => [t.id, t.title] as const)),
    [trainings]
  );

  const events = useMemo(() => {
    const filtered = trainingEvents.filter((e) => (variant === 'upcoming' ? isUpcomingYmd(e.date) : !isUpcomingYmd(e.date)));
    return sortByDate(variant, filtered);
  }, [trainingEvents, variant]);

  return (
    <div className="content-stack content-stack--tight">
      <div className="topbar">
        <div>
          <span className="eyebrow">Дати на обучения</span>
          <h2 className="topbar-title-single" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {variant === 'upcoming' ? <CalendarClock size={28} /> : <History size={28} />}
            {title}
          </h2>
          <p className="topbar-subtitle">
            {variant === 'upcoming'
              ? 'Събития с днешна дата или по-късна дата. Публикувай или скрий от публичния изглед с бутона в колоната „Публикуване“.'
              : 'Събития с дата преди днес.'}
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'flex-end' }}>
          <div className="book-online-services__tabs" role="tablist" aria-label="Филтър по време">
            <Link to="/trainings/sessions/past" className={`book-online-services__tab${variant === 'past' ? ' is-active' : ''}`} role="tab" aria-selected={variant === 'past'}>
              Минали
            </Link>
            <Link
              to="/trainings/sessions/upcoming"
              className={`book-online-services__tab${variant === 'upcoming' ? ' is-active' : ''}`}
              role="tab"
              aria-selected={variant === 'upcoming'}
            >
              Предстоящи
            </Link>
          </div>
          <Link className="button primary button--sm" to="/trainings/sessions/new">
            <Plus size={16} />
            Ново събитие
          </Link>
        </div>
      </div>

      <section className="panel list-only-panel">
        <div className="lead-article-table-wrap">
          {events.length === 0 ? (
            <div className="empty-state compact" style={{ padding: '32px 20px' }}>
              <p>Няма {variant === 'upcoming' ? 'предстоящи' : 'минали'} събития. Добавете от „Ново събитие“.</p>
            </div>
          ) : (
            <table className="data-table data-table--compact">
              <thead>
                <tr>
                  <th>Курс</th>
                  <th>Дата</th>
                  <th>Град</th>
                  <th>Капацитет</th>
                  <th>Оставащи места</th>
                  <th>Записани</th>
                  {variant === 'upcoming' ? <th>Публикуване</th> : null}
                  <th aria-label="Действия" />
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const rem = remainingSeats(e);
                  const over = e.attendees.length > e.capacity;
                  const course = byCourse.get(e.trainingId);
                  return (
                    <tr key={e.id}>
                      <td>
                        <strong>{course || '—'}</strong>
                        {!course && e.trainingId ? (
                          <span className="table-cell-muted" style={{ display: 'block', fontSize: '0.85rem' }}>
                            (няма курс: {e.trainingId})
                          </span>
                        ) : null}
                      </td>
                      <td className="table-cell-muted">{formatDate(e.date + 'T12:00:00')}</td>
                      <td>{e.city || '—'}</td>
                      <td>{e.capacity}</td>
                      <td>
                        <span style={over ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>{over ? 0 : rem}</span>
                        {over ? (
                          <span className="table-cell-muted" style={{ marginLeft: 6, fontSize: '0.8rem' }}>
                            (над капацитет)
                          </span>
                        ) : null}
                      </td>
                      <td>{e.attendees.length}</td>
                      {variant === 'upcoming' ? (
                        <td>
                          <button
                            type="button"
                            className={`soft-pill ${e.published ? 'published' : 'draft'}`}
                            style={{ cursor: 'pointer', font: 'inherit' }}
                            onClick={() =>
                              upsertTrainingEvent({
                                ...e,
                                published: !e.published,
                                updatedAt: new Date().toISOString(),
                              })
                            }
                          >
                            {e.published ? 'Публично' : 'Скрито'}
                          </button>
                        </td>
                      ) : null}
                      <td>
                        <div className="list-row-actions list-row-actions--split" style={{ justifyContent: 'flex-end' }}>
                          <Link className="table-icon-link" to={`/trainings/sessions/${e.id}`} aria-label="Преглед" title="Преглед">
                            <Eye size={18} />
                          </Link>
                          <button
                            type="button"
                            className="table-icon-link"
                            aria-label="Дублирай събитие"
                            title="Дублирай (без записани)"
                            onClick={() => {
                              const newId = duplicateTrainingEvent(e.id);
                              if (newId) {
                                navigate(`/trainings/sessions/${newId}/edit`);
                              }
                            }}
                          >
                            <Copy size={18} />
                          </button>
                          <Link className="table-icon-link" aria-label="Редакция" to={`/trainings/sessions/${e.id}/edit`}>
                            <Pencil size={18} />
                          </Link>
                          <button
                            type="button"
                            className="table-icon-link"
                            aria-label="Премахни"
                            onClick={() => {
                              if (window.confirm('Да се изтрие това събитие? Списъкът със записани също ще бъде изтрит.')) {
                                removeTrainingEvent(e.id);
                              }
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
