import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Pencil, Plus, Save, Trash2, UserPlus, Users } from 'lucide-react';
import { createId, interestStatusLabel, isUpcomingYmd, temperatureLabel, toLocalDateInput } from '../lib/format';
import { interestsForCourse } from '../lib/training-interests';
import { useAdmin } from '../context/admin-context';
import type { TrainingEvent, TrainingEventAttendee } from '../types';

type FormTab = 'info' | 'attendees' | 'interests';

function createBlankEvent(): TrainingEvent {
  const now = new Date().toISOString();
  return {
    id: createId('training-event'),
    trainingId: '',
    date: toLocalDateInput(now),
    city: 'София',
    capacity: 8,
    published: false,
    attendees: [],
    createdAt: now,
    updatedAt: now,
  };
}

function remainingSeats(draft: TrainingEvent) {
  return Math.max(0, draft.capacity - draft.attendees.length);
}

export function TrainingEventFormPage() {
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();
  const { store, upsertTrainingEvent } = useAdmin();
  const isNew = !eventId;

  const [formTab, setFormTab] = useState<FormTab>('info');
  const [draft, setDraft] = useState<TrainingEvent>(() => {
    if (isNew) return createBlankEvent();
    const found = store.trainingEvents.find((e) => e.id === eventId);
    return found ? { ...found } : createBlankEvent();
  });

  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');

  useEffect(() => {
    if (isNew) {
      setDraft(createBlankEvent());
      return;
    }
    const found = store.trainingEvents.find((e) => e.id === eventId);
    if (found) setDraft({ ...found });
  }, [eventId, isNew, store.trainingEvents]);

  useEffect(() => {
    if (!isNew && eventId && !store.trainingEvents.some((e) => e.id === eventId)) {
      navigate('/trainings/sessions/upcoming', { replace: true });
    }
  }, [eventId, isNew, navigate, store.trainingEvents]);

  function updateDraft<K extends keyof TrainingEvent>(key: K, value: TrainingEvent[K]) {
    setDraft((c) => ({ ...c, [key]: value }));
  }

  const courseOptions = useMemo(
    () => [...store.trainings].sort((a, b) => a.title.localeCompare(b.title, 'bg')),
    [store.trainings]
  );
  const courseTitle = useMemo(
    () => store.trainings.find((t) => t.id === draft.trainingId)?.title,
    [draft.trainingId, store.trainings]
  );

  const pageTitle = isNew
    ? 'Ново събитие'
    : [courseTitle, draft.date].filter(Boolean).join(' · ') || 'Редакция на събитие';

  const interestsForThisCourse = useMemo(
    () => (draft.trainingId ? interestsForCourse(store.interests, draft.trainingId) : []),
    [draft.trainingId, store.interests]
  );

  function addAttendee() {
    const fullName = addName.trim();
    if (!fullName) return;
    const now = new Date().toISOString();
    const row: TrainingEventAttendee = {
      id: createId('att'),
      fullName,
      email: addEmail.trim(),
      phone: addPhone.trim(),
      createdAt: now,
    };
    setDraft((c) => ({ ...c, attendees: [...c.attendees, row] }));
    setAddName('');
    setAddEmail('');
    setAddPhone('');
  }

  function removeAttendee(id: string) {
    setDraft((c) => ({ ...c, attendees: c.attendees.filter((a) => a.id !== id) }));
  }

  function handleSave() {
    if (!draft.trainingId.trim() || !draft.date.trim() || !draft.city.trim() || draft.capacity < 0) {
      return;
    }
    upsertTrainingEvent({
      ...draft,
      trainingId: draft.trainingId,
      date: /^\d{4}-\d{2}-\d{2}$/.test(draft.date) ? draft.date : toLocalDateInput(draft.date + 'T12:00:00'),
      updatedAt: new Date().toISOString(),
    });
    const to = isUpcomingYmd(draft.date) ? '/trainings/sessions/upcoming' : '/trainings/sessions/past';
    navigate(to);
  }

  const overbooked = draft.attendees.length > draft.capacity;
  const rem = remainingSeats(draft);

  return (
    <div className="form-page">
      <div className="form-page__toolbar">
        <Link
          className="text-button form-page__back"
          to={isUpcomingYmd(draft.date) ? '/trainings/sessions/upcoming' : '/trainings/sessions/past'}
        >
          <ArrowLeft size={18} />
          Към списъка
        </Link>
        <div className="form-page__toolbar-actions">
          {!isNew && eventId ? (
            <Link className="button secondary" to={`/trainings/sessions/${eventId}`}>
              <Eye size={18} />
              Преглед
            </Link>
          ) : null}
          <Link
            className="button secondary"
            to={isUpcomingYmd(draft.date) ? '/trainings/sessions/upcoming' : '/trainings/sessions/past'}
          >
            Отказ
          </Link>
          <button className="button primary" type="button" onClick={handleSave}>
            <Save size={18} />
            Запази
          </button>
        </div>
      </div>

      <header className="form-page__header">
        <span className="eyebrow">{isNew ? 'Добавяне' : 'Редакция'}</span>
        <h2>{pageTitle}</h2>
        <p className="form-page__lede">Основни данни, записани на датата, и заявилите интерес към курса в CRM.</p>
      </header>

      <div className="form-page__tablist" role="tablist" aria-label="Секции">
        <button
          type="button"
          role="tab"
          aria-selected={formTab === 'info'}
          className={`book-online-services__tab${formTab === 'info' ? ' is-active' : ''}`}
          onClick={() => setFormTab('info')}
        >
          Основна информация
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={formTab === 'attendees'}
          className={`book-online-services__tab${formTab === 'attendees' ? ' is-active' : ''}`}
          onClick={() => setFormTab('attendees')}
        >
          Записани хора
          {draft.attendees.length > 0 ? (
            <span className="sidebar-pill" style={{ marginLeft: 8 }}>
              {draft.attendees.length}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={formTab === 'interests'}
          className={`book-online-services__tab${formTab === 'interests' ? ' is-active' : ''}`}
          onClick={() => setFormTab('interests')}
        >
          Интерес към курса
          {interestsForThisCourse.length > 0 ? (
            <span className="sidebar-pill" style={{ marginLeft: 8 }}>
              {interestsForThisCourse.length}
            </span>
          ) : null}
        </button>
      </div>

      {formTab === 'info' && (
        <div className="form-grid two-columns form-page__grid">
          <label className="field full-span">
            <span>Курс (обучение)</span>
            <select
              className="select"
              value={draft.trainingId}
              onChange={(e) => updateDraft('trainingId', e.target.value)}
            >
              <option value="">— Изберете курс —</option>
              {courseOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.academy})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Дата</span>
            <input
              className="input"
              type="date"
              value={draft.date}
              onChange={(e) => updateDraft('date', e.target.value)}
            />
          </label>
          <label className="field">
            <span>Град</span>
            <input className="input" value={draft.city} onChange={(e) => updateDraft('city', e.target.value)} />
          </label>
          <label className="field">
            <span>Капацитет (места)</span>
            <input
              className="input"
              type="number"
              min={0}
              value={draft.capacity}
              onChange={(e) => updateDraft('capacity', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            />
          </label>
          <div className="field">
            <span>Оставащи места</span>
            <div
              className="input"
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: 0,
                minHeight: 50,
                color: overbooked ? 'var(--danger)' : undefined,
                fontWeight: overbooked ? 600 : 500,
              }}
            >
              {overbooked ? 0 : rem}
              {overbooked ? ' (над капацитет)' : ''}
            </div>
            <p className="material-upload__hint" style={{ marginTop: 6 }}>
              Показва се автоматично: капацитет минус броя записани. При всяко добавяне или премахване на записан стойността се
              обновява; не се въвежда на ръка.
            </p>
          </div>
          <div className="field full-span">
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }}
                checked={draft.published}
                onChange={(e) => updateDraft('published', e.target.checked)}
              />
              <span>
                <strong>Публикувано</strong> — видимо в публичния изглед (сайт). Маркирай, когато събитието е готово за обявяване.
              </span>
            </label>
            <p className="material-upload__hint" style={{ marginTop: 8 }}>
              В списъка „Предстоящи“ можете също с един клик да публикувате или скриете събитие.
            </p>
          </div>
        </div>
      )}

      {formTab === 'attendees' && (
        <div className="form-page__grid" style={{ padding: '26px 28px' }}>
          <div className="embedded-panel" style={{ padding: 0 }}>
            <div className="panel-toolbar" style={{ margin: 0, padding: '16px 18px' }}>
              <h4 className="embedded-panel-header" style={{ margin: 0, border: 'none', padding: 0 }}>
                <UserPlus size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                Списък със записани
              </h4>
            </div>
            {draft.attendees.length === 0 ? (
              <p className="table-cell-muted" style={{ margin: 0, padding: '20px 18px' }}>
                Няма записани. Добавете ред отдолу.
              </p>
            ) : (
              <div className="lead-article-table-wrap" style={{ borderTop: '1px solid var(--line)' }}>
                <table className="data-table data-table--compact">
                  <thead>
                    <tr>
                      <th>Име</th>
                      <th>Имейл</th>
                      <th>Телефон</th>
                      <th aria-label="Премахни" />
                    </tr>
                  </thead>
                  <tbody>
                    {draft.attendees.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <strong>{a.fullName}</strong>
                        </td>
                        <td className="table-cell-muted">{a.email || '—'}</td>
                        <td className="table-cell-muted">{a.phone || '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="table-icon-link"
                            aria-label="Премахни"
                            onClick={() => removeAttendee(a.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="panel-toolbar" style={{ flexWrap: 'wrap', borderTop: '1px solid var(--line)' }}>
              <div className="form-grid two-columns" style={{ width: '100%', gap: 12, alignItems: 'end' }}>
                <label className="field" style={{ margin: 0 }}>
                  <span>Име</span>
                  <input className="input" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Пълно име" />
                </label>
                <label className="field" style={{ margin: 0 }}>
                  <span>Имейл</span>
                  <input
                    className="input"
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="email@…"
                  />
                </label>
                <label className="field" style={{ margin: 0 }}>
                  <span>Телефон</span>
                  <input className="input" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+359 …" />
                </label>
                <button type="button" className="button secondary" onClick={addAttendee} style={{ minHeight: 50, alignSelf: 'end' }}>
                  <Plus size={16} />
                  Добави
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {formTab === 'interests' && (
        <div className="form-page__grid" style={{ padding: '26px 28px' }}>
          <div className="embedded-panel" style={{ padding: 0 }}>
            <div className="panel-toolbar" style={{ margin: 0, padding: '16px 18px' }}>
              <h4 className="embedded-panel-header" style={{ margin: 0, border: 'none', padding: 0 }}>
                <Users size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                Заявили интерес (CRM) за курса
              </h4>
            </div>
            <p className="table-cell-muted" style={{ margin: 0, padding: '12px 18px' }}>
              Контакти с избрания курс като предпочитан или в списъка си с обучения.{' '}
              {draft.trainingId
                ? 'Този изглед е само за четене; редакция в картата на контакта.'
                : 'Изберете курс в таб „Основна информация“.'}
            </p>
            {!draft.trainingId ? (
              <p className="table-cell-muted" style={{ margin: 0, padding: '0 18px 20px' }}>
                Няма избран курс.
              </p>
            ) : interestsForThisCourse.length === 0 ? (
              <p className="table-cell-muted" style={{ margin: 0, padding: '0 18px 20px' }}>
                Няма заявки за този курс в CRM.
              </p>
            ) : (
              <div className="lead-article-table-wrap" style={{ borderTop: '1px solid var(--line)' }}>
                <table className="data-table data-table--compact">
                  <thead>
                    <tr>
                      <th>Име</th>
                      <th>Контакт</th>
                      <th>Статус</th>
                      <th>Темп.</th>
                      <th>Град</th>
                      <th aria-label="Карта" />
                    </tr>
                  </thead>
                  <tbody>
                    {interestsForThisCourse.map((p) => (
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
                        <td className="table-cell-muted">{p.city || '—'}</td>
                        <td>
                          <Link className="table-icon-link" to={`/interests/${p.id}/edit`} aria-label="Карта">
                            <Pencil size={18} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
