import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, NotebookPen, Save } from 'lucide-react';
import { createId, formatDateTime, toLocalDateTimeInput } from '../lib/format';
import { useAdmin } from '../context/admin-context';
import type {
  InterestNote,
  InterestedPerson,
  InterestStatus,
  InterestTemperature,
} from '../types';

function createBlankInterest(): InterestedPerson {
  const now = new Date().toISOString();

  return {
    id: createId('interest'),
    fullName: '',
    email: '',
    phone: '',
    city: '',
    source: 'Ръчно добавен',
    status: 'new',
    temperature: 'warm',
    preferredTrainingId: '',
    trainingIds: [],
    summary: '',
    createdAt: now,
    lastContactAt: now,
    notes: [],
  };
}

export function InterestFormPage() {
  const { interestId } = useParams<{ interestId?: string }>();
  const navigate = useNavigate();
  const { store, upsertInterest, addNote } = useAdmin();
  const isNew = !interestId;

  const [draft, setDraft] = useState<InterestedPerson>(() => {
    if (isNew) return createBlankInterest();
    const found = store.interests.find((p) => p.id === interestId);
    return found ?? createBlankInterest();
  });

  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    if (isNew) {
      setDraft(createBlankInterest());
      setNoteDraft('');
      return;
    }
    const found = store.interests.find((p) => p.id === interestId);
    if (found) setDraft(found);
  }, [interestId, isNew, store.interests]);

  useEffect(() => {
    if (!isNew && interestId && !store.interests.some((p) => p.id === interestId)) {
      navigate('/interests', { replace: true });
    }
  }, [interestId, isNew, navigate, store.interests]);

  function updateDraft<K extends keyof InterestedPerson>(key: K, value: InterestedPerson[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    if (!draft.fullName.trim()) return;
    const personToSave: InterestedPerson = {
      ...draft,
      lastContactAt: draft.lastContactAt || new Date().toISOString(),
    };

    upsertInterest(personToSave);
    navigate('/interests');
  }

  function toggleTraining(trainingId: string) {
    const hasTraining = draft.trainingIds.includes(trainingId);
    const trainingIds = hasTraining
      ? draft.trainingIds.filter((item) => item !== trainingId)
      : [...draft.trainingIds, trainingId];

    setDraft((current) => ({
      ...current,
      trainingIds,
      preferredTrainingId: hasTraining
        ? current.preferredTrainingId === trainingId
          ? trainingIds[0] ?? ''
          : current.preferredTrainingId
        : current.preferredTrainingId || trainingId,
    }));
  }

  function appendNote() {
    const body = noteDraft.trim();
    if (!body || !draft.fullName.trim()) return;

    const note: InterestNote = {
      id: createId('note'),
      author: 'Admin',
      body,
      createdAt: new Date().toISOString(),
    };

    upsertInterest(draft);
    addNote(draft.id, note);
    setNoteDraft('');
    setDraft((current) => ({
      ...current,
      notes: [note, ...current.notes],
      lastContactAt: note.createdAt,
    }));
  }

  const pageTitle = isNew ? 'Нов контакт' : draft.fullName || 'Редакция на контакт';

  return (
    <div className="form-page">
      <div className="form-page__toolbar">
        <Link className="text-button form-page__back" to="/interests">
          <ArrowLeft size={18} />
          Към списъка
        </Link>
        <div className="form-page__toolbar-actions">
          <Link className="button secondary" to="/interests">
            Отказ
          </Link>
          <button className="button primary" type="button" onClick={handleSave}>
            <Save size={18} />
            Запази
          </button>
        </div>
      </div>

      <header className="form-page__header">
        <span className="eyebrow">{isNew ? 'Добавяне' : 'Карта'}</span>
        <h2>{pageTitle}</h2>
        <p className="form-page__lede">
          Данни за контакт, интерес към обучения и вътрешни бележки. Записът се пази локално в браузъра.
        </p>
      </header>

      <div className="form-grid two-columns form-page__grid">
        <label className="field">
          <span>Име и фамилия</span>
          <input className="input" value={draft.fullName} onChange={(event) => updateDraft('fullName', event.target.value)} />
        </label>
        <label className="field">
          <span>Имейл</span>
          <input className="input" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} />
        </label>
        <label className="field">
          <span>Телефон</span>
          <input className="input" value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} />
        </label>
        <label className="field">
          <span>Град</span>
          <input className="input" value={draft.city} onChange={(event) => updateDraft('city', event.target.value)} />
        </label>
        <label className="field">
          <span>Източник</span>
          <input className="input" value={draft.source} onChange={(event) => updateDraft('source', event.target.value)} />
        </label>
        <label className="field">
          <span>Статус</span>
          <select
            className="select"
            value={draft.status}
            onChange={(event) => updateDraft('status', event.target.value as InterestStatus)}
          >
            <option value="new">Нов</option>
            <option value="contacted">Контактуван</option>
            <option value="qualified">Квалифициран</option>
            <option value="reserved">Резервирано място</option>
            <option value="archived">Архив</option>
          </select>
        </label>
        <label className="field">
          <span>Температура</span>
          <select
            className="select"
            value={draft.temperature}
            onChange={(event) => updateDraft('temperature', event.target.value as InterestTemperature)}
          >
            <option value="hot">Горещ</option>
            <option value="warm">Топъл</option>
            <option value="cold">Студен</option>
          </select>
        </label>
        <label className="field">
          <span>Последен контакт</span>
          <input
            className="input"
            type="datetime-local"
            value={toLocalDateTimeInput(draft.lastContactAt)}
            onChange={(event) =>
              updateDraft('lastContactAt', event.target.value ? new Date(event.target.value).toISOString() : '')
            }
          />
        </label>
        <label className="field full-span">
          <span>Кратко резюме</span>
          <textarea className="textarea" rows={3} value={draft.summary} onChange={(event) => updateDraft('summary', event.target.value)} />
        </label>
      </div>

      <section className="embedded-panel form-page__section">
        <div className="embedded-panel-header">
          <h4>Интерес към обучения</h4>
          <p>Може да следите повече от едно обучение и да маркирате едно като водещо.</p>
        </div>
        <div className="checkbox-grid">
          {store.trainings.map((training) => {
            const active = draft.trainingIds.includes(training.id);
            const preferred = draft.preferredTrainingId === training.id;

            return (
              <label className={`checkbox-card ${active ? 'active' : ''}`} key={training.id}>
                <input type="checkbox" checked={active} onChange={() => toggleTraining(training.id)} />
                <div>
                  <strong>{training.title}</strong>
                  <p>
                    {training.category} · {training.level}
                  </p>
                  <button
                    type="button"
                    className={`tiny-pill ${preferred ? 'active' : ''}`}
                    onClick={() => updateDraft('preferredTrainingId', training.id)}
                  >
                    {preferred ? 'Водещ интерес' : 'Маркирай като водещ'}
                  </button>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <section className="embedded-panel notes-panel form-page__section">
        <div className="embedded-panel-header">
          <h4>Бележки към човека</h4>
          <p>Вътрешна история на разговори и follow-up за екипа.</p>
        </div>
        <div className="note-composer">
          <textarea
            className="textarea"
            rows={3}
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder="Например: изпратена програма, чака депозит, да се потърси отново след 3 дни..."
          />
          <button className="button secondary" type="button" onClick={appendNote}>
            <NotebookPen size={18} />
            Добави бележка
          </button>
        </div>
        {!draft.fullName.trim() && (
          <div className="empty-state compact">Запиши картата с име, преди да добавяш бележки.</div>
        )}

        <div className="notes-timeline">
          {draft.notes.length === 0 ? (
            <div className="empty-state compact">Все още няма бележки за този човек.</div>
          ) : (
            draft.notes
              .slice()
              .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
              .map((note) => (
                <article className="note-item" key={note.id}>
                  <div className="note-item-header">
                    <strong>{note.author}</strong>
                    <span>{formatDateTime(note.createdAt)}</span>
                  </div>
                  <p>{note.body}</p>
                </article>
              ))
          )}
        </div>
      </section>
    </div>
  );
}
