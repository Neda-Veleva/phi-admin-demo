import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { formatDate, interestStatusLabel, isUpcomingYmd, temperatureLabel } from '../lib/format';
import { interestsForCourse } from '../lib/training-interests';
import { useAdmin } from '../context/admin-context';

function remainingSeats(capacity: number, enrolled: number) {
  return Math.max(0, capacity - enrolled);
}

export function TrainingEventPreviewPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { store } = useAdmin();
  const event = store.trainingEvents.find((e) => e.id === eventId);
  const course = event ? store.trainings.find((t) => t.id === event.trainingId) : undefined;

  const crmForCourse = useMemo(
    () => (event && event.trainingId ? interestsForCourse(store.interests, event.trainingId) : []),
    [event, store.interests]
  );

  useEffect(() => {
    if (eventId && !store.trainingEvents.some((e) => e.id === eventId)) {
      navigate('/trainings/sessions/upcoming', { replace: true });
    }
  }, [eventId, navigate, store.trainingEvents]);

  if (!event || !eventId) {
    return null;
  }

  const over = event.attendees.length > event.capacity;
  const rem = remainingSeats(event.capacity, event.attendees.length);
  const listPath = isUpcomingYmd(event.date) ? '/trainings/sessions/upcoming' : '/trainings/sessions/past';

  return (
    <div className="preview-page">
      <div className="preview-page__toolbar">
        <Link className="text-button form-page__back" to={listPath}>
          <ArrowLeft size={18} />
          Към датите
        </Link>
        <div className="preview-page__actions">
          <Link className="button primary" to={`/trainings/sessions/${event.id}/edit`}>
            <Pencil size={18} />
            Редакция
          </Link>
        </div>
      </div>

      <article className="preview-card">
        <header className="preview-card__header">
          <span className="eyebrow">{course?.academy ?? 'Курс'}</span>
          <h1 className="preview-card__title">{course?.title ?? '—'}</h1>
          <div className="preview-card__meta" style={{ marginTop: 8 }}>
            {event.published ? (
              <span className="soft-pill published">Публично</span>
            ) : (
              <span className="soft-pill draft">Скрито</span>
            )}
            {course ? <span>{course.category}</span> : null}
            {course ? <span>{course.level}</span> : null}
          </div>
        </header>

        <dl className="preview-facts">
          <div>
            <dt>Дата</dt>
            <dd>{formatDate(event.date + 'T12:00:00')}</dd>
          </div>
          <div>
            <dt>Град</dt>
            <dd>{event.city || '—'}</dd>
          </div>
          <div>
            <dt>Капацитет</dt>
            <dd>{event.capacity}</dd>
          </div>
          <div>
            <dt>Оставащи места</dt>
            <dd style={over ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>
              {over ? 0 : rem}
              {over ? ' (над капацитет)' : ''}
            </dd>
          </div>
          <div>
            <dt>Записани (списък)</dt>
            <dd>{event.attendees.length}</dd>
          </div>
          <div>
            <dt>Интерес в CRM (курса)</dt>
            <dd>{crmForCourse.length}</dd>
          </div>
        </dl>

        <section className="preview-section">
          <h2>Записани на тази дата</h2>
          {event.attendees.length === 0 ? (
            <p className="table-cell-muted">Няма записани за това събитие.</p>
          ) : (
            <div className="lead-article-table-wrap">
              <table className="data-table data-table--compact">
                <thead>
                  <tr>
                    <th>Име</th>
                    <th>Имейл</th>
                    <th>Телефон</th>
                  </tr>
                </thead>
                <tbody>
                  {event.attendees.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.fullName}</strong>
                      </td>
                      <td className="table-cell-muted">{a.email || '—'}</td>
                      <td className="table-cell-muted">{a.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="preview-section">
          <h2>Заявили интерес към курса (CRM)</h2>
          <p className="table-cell-muted" style={{ margin: '0 0 16px' }}>
            Контакти, за които този курс е предпочитан или е отбелязан в списъка с обучения — независимо от датата на
            събитието.
          </p>
          {crmForCourse.length === 0 ? (
            <p className="table-cell-muted">Няма заявки за този курс.</p>
          ) : (
            <div className="lead-article-table-wrap">
              <table className="data-table data-table--compact">
                <thead>
                  <tr>
                    <th>Име</th>
                    <th>Контакт</th>
                    <th>Статус</th>
                    <th>Темп.</th>
                    <th aria-label="Действия" />
                  </tr>
                </thead>
                <tbody>
                  {crmForCourse.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.fullName}</strong>
                      </td>
                      <td className="table-cell-muted">
                        <div>{p.email || '—'}</div>
                        <div>{p.phone || '—'}</div>
                      </td>
                      <td>
                        <span className={`soft-pill ${p.status}`}>{interestStatusLabel(p.status)}</span>
                      </td>
                      <td className="table-cell-muted">{temperatureLabel(p.temperature)}</td>
                      <td>
                        <Link className="table-icon-link" to={`/interests/${p.id}/edit`} aria-label="Отвори карта">
                          <Pencil size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
