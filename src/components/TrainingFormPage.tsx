import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import {
  createId,
  joinCsv,
  slugify,
  splitCsv,
  toLocalDateTimeInput,
} from '../lib/format';
import { useAdmin } from '../context/admin-context';
import type { Training, TrainingFormat, TrainingStatus } from '../types';

function createBlankTraining(): Training {
  const now = new Date().toISOString();

  return {
    id: createId('training'),
    slug: '',
    title: '',
    academy: 'PhiAcademy',
    category: 'Вежди',
    level: 'Базово обучение',
    status: 'draft',
    format: 'live',
    location: 'София',
    durationLabel: '',
    priceEUR: 0,
    nextDate: '',
    seatsTotal: 8,
    seatsReserved: 0,
    shortDescription: '',
    longDescription: '',
    heroImage: '',
    tags: [],
    languages: ['BG'],
    createdAt: now,
    updatedAt: now,
  };
}

export function TrainingFormPage() {
  const { trainingId } = useParams<{ trainingId?: string }>();
  const navigate = useNavigate();
  const { store, upsertTraining } = useAdmin();
  const isNew = !trainingId;

  const [draft, setDraft] = useState<Training>(() => {
    if (isNew) return createBlankTraining();
    const found = store.trainings.find((t) => t.id === trainingId);
    return found ?? createBlankTraining();
  });

  useEffect(() => {
    if (isNew) {
      setDraft(createBlankTraining());
      return;
    }
    const found = store.trainings.find((t) => t.id === trainingId);
    if (found) setDraft(found);
  }, [trainingId, isNew, store.trainings]);

  useEffect(() => {
    if (!isNew && trainingId && !store.trainings.some((t) => t.id === trainingId)) {
      navigate('/trainings', { replace: true });
    }
  }, [trainingId, isNew, navigate, store.trainings]);

  function updateDraft<K extends keyof Training>(key: K, value: Training[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    const title = draft.title.trim();
    if (!title) return;

    const safeSlug = slugify(title) || draft.id;
    upsertTraining({
      ...draft,
      slug: safeSlug,
      updatedAt: new Date().toISOString(),
    });
    navigate('/trainings');
  }

  const pageTitle = isNew ? 'Ново обучение' : draft.title || 'Редакция на обучение';

  return (
    <div className="form-page">
      <div className="form-page__toolbar">
        <Link className="text-button form-page__back" to="/trainings">
          <ArrowLeft size={18} />
          Към списъка
        </Link>
        <div className="form-page__toolbar-actions">
          <Link className="button secondary" to="/trainings">
            Отказ
          </Link>
          {!isNew && trainingId && (
            <Link className="button secondary" to={`/trainings/${trainingId}`}>
              <Eye size={18} />
              Преглед
            </Link>
          )}
          <button className="button primary" type="button" onClick={handleSave}>
            <Save size={18} />
            Запази
          </button>
        </div>
      </div>

      <header className="form-page__header">
        <span className="eyebrow">{isNew ? 'Добавяне' : 'Редакция'}</span>
        <h2>{pageTitle}</h2>
        <p className="form-page__lede">
          Попълнете датите, капацитета и описанията. Промените се записват локално в браузъра.
        </p>
      </header>

      <div className="form-grid two-columns form-page__grid">
        <label className="field full-span">
          <span>Заглавие</span>
          <input
            className="input"
            value={draft.title}
            onChange={(event) => updateDraft('title', event.target.value)}
            placeholder="Например PhiBrows Basic"
          />
        </label>
        <label className="field">
          <span>Академия</span>
          <input className="input" value={draft.academy} onChange={(event) => updateDraft('academy', event.target.value)} />
        </label>
        <label className="field">
          <span>Категория</span>
          <input className="input" value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} />
        </label>
        <label className="field">
          <span>Ниво</span>
          <input className="input" value={draft.level} onChange={(event) => updateDraft('level', event.target.value)} />
        </label>
        <label className="field">
          <span>Статус</span>
          <select
            className="select"
            value={draft.status}
            onChange={(event) => updateDraft('status', event.target.value as TrainingStatus)}
          >
            <option value="draft">Чернова</option>
            <option value="scheduled">Планирано</option>
            <option value="published">Публикувано</option>
            <option value="archived">Архив</option>
          </select>
        </label>
        <label className="field">
          <span>Формат</span>
          <select
            className="select"
            value={draft.format}
            onChange={(event) => updateDraft('format', event.target.value as TrainingFormat)}
          >
            <option value="live">На живо</option>
            <option value="online">Онлайн</option>
            <option value="hybrid">Хибридно</option>
          </select>
        </label>
        <label className="field">
          <span>Локация</span>
          <input className="input" value={draft.location} onChange={(event) => updateDraft('location', event.target.value)} />
        </label>
        <label className="field">
          <span>Следваща дата</span>
          <input
            className="input"
            type="datetime-local"
            value={toLocalDateTimeInput(draft.nextDate)}
            onChange={(event) =>
              updateDraft('nextDate', event.target.value ? new Date(event.target.value).toISOString() : '')
            }
          />
        </label>
        <label className="field">
          <span>Продължителност</span>
          <input
            className="input"
            value={draft.durationLabel}
            onChange={(event) => updateDraft('durationLabel', event.target.value)}
          />
        </label>
        <label className="field">
          <span>Цена в EUR</span>
          <input
            className="input"
            type="number"
            min="0"
            value={draft.priceEUR}
            onChange={(event) => updateDraft('priceEUR', Number(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Общо места</span>
          <input
            className="input"
            type="number"
            min="0"
            value={draft.seatsTotal}
            onChange={(event) => updateDraft('seatsTotal', Number(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Резервирани места</span>
          <input
            className="input"
            type="number"
            min="0"
            value={draft.seatsReserved}
            onChange={(event) => updateDraft('seatsReserved', Number(event.target.value))}
          />
        </label>
        <label className="field full-span">
          <span>Кратко описание</span>
          <textarea
            className="textarea"
            rows={3}
            value={draft.shortDescription}
            onChange={(event) => updateDraft('shortDescription', event.target.value)}
          />
        </label>
        <label className="field full-span">
          <span>Дълго описание</span>
          <textarea
            className="textarea"
            rows={5}
            value={draft.longDescription}
            onChange={(event) => updateDraft('longDescription', event.target.value)}
          />
        </label>
        <label className="field full-span">
          <span>Езици</span>
          <input
            className="input"
            value={joinCsv(draft.languages)}
            onChange={(event) => updateDraft('languages', splitCsv(event.target.value))}
            placeholder="BG, EN"
          />
        </label>
        <label className="field full-span">
          <span>Тагове</span>
          <input
            className="input"
            value={joinCsv(draft.tags)}
            onChange={(event) => updateDraft('tags', splitCsv(event.target.value))}
            placeholder="симетрия, healing, follow-up"
          />
        </label>
      </div>
    </div>
  );
}
