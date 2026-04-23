import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, ImagePlus, Save, Trash2 } from 'lucide-react';
import {
  createId,
  joinCsv,
  slugify,
  splitCsv,
  toLocalDateTimeInput,
} from '../lib/format';
import { useAdmin } from '../context/admin-context';
import type { Training, TrainingFormat, TrainingStatus } from '../types';
import { SimpleRichTextField } from './SimpleRichTextField';

const HERO_MAX_BYTES = 2.5 * 1024 * 1024;
const HERO_MAX_IMAGES = 12;
const HERO_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

function createBlankTraining(): Training {
  const now = new Date().toISOString();

  return {
    id: createId('training'),
    slug: '',
    title: '',
    subtitle: '',
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
    heroImages: [],
    tags: [],
    languages: ['BG'],
    createdAt: now,
    updatedAt: now,
  };
}

type FormTab = 'info' | 'planning';

export function TrainingFormPage() {
  const { trainingId } = useParams<{ trainingId?: string }>();
  const navigate = useNavigate();
  const { store, upsertTraining } = useAdmin();
  const isNew = !trainingId;
  const [formTab, setFormTab] = useState<FormTab>('info');
  const [heroError, setHeroError] = useState<string | null>(null);

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

  function removeHeroAt(index: number) {
    setDraft((current) => ({
      ...current,
      heroImages: current.heroImages.filter((_, i) => i !== index),
    }));
    setHeroError(null);
  }

  async function onHeroFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    setHeroError(null);
    if (!files?.length) {
      event.target.value = '';
      return;
    }

    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (draft.heroImages.length + newUrls.length >= HERO_MAX_IMAGES) {
        setHeroError(`Най-много ${HERO_MAX_IMAGES} снимки.`);
        break;
      }
      if (file.size > HERO_MAX_BYTES) {
        setHeroError('Всяка снимка трябва да е под 2,5 MB.');
        break;
      }
      if (!allowed.has(file.type)) {
        setHeroError('Само JPG, PNG, WebP или GIF.');
        break;
      }
      try {
        newUrls.push(await readFileAsDataUrl(file));
      } catch {
        setHeroError('Качването неуспешно. Опитайте отново.');
        event.target.value = '';
        return;
      }
    }

    if (newUrls.length) {
      setDraft((c) => ({ ...c, heroImages: [...c.heroImages, ...newUrls] }));
    }
    event.target.value = '';
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
          Попълнете раздела „Основна информация“ за заглавието, снимките и въвеждането, след което датите и капацитета. Промените се
          записват локално в браузъра.
        </p>
      </header>

      <div className="form-page__tablist" role="tablist" aria-label="Секции на обучение">
        <button
          type="button"
          id="tab-training-info"
          role="tab"
          aria-selected={formTab === 'info'}
          aria-controls="tabpanel-training-info"
          className={`book-online-services__tab${formTab === 'info' ? ' is-active' : ''}`}
          onClick={() => setFormTab('info')}
        >
          Основна информация
        </button>
        <button
          type="button"
          id="tab-training-planning"
          role="tab"
          aria-selected={formTab === 'planning'}
          aria-controls="tabpanel-training-planning"
          className={`book-online-services__tab${formTab === 'planning' ? ' is-active' : ''}`}
          onClick={() => setFormTab('planning')}
        >
          Планиране и съдържание
        </button>
      </div>

      {formTab === 'info' && (
        <div
          className="form-grid two-columns form-page__grid"
          id="tabpanel-training-info"
          role="tabpanel"
          aria-labelledby="tab-training-info"
        >
          <label className="field full-span">
            <span>Заглавие</span>
            <input
              className="input"
              value={draft.title}
              onChange={(event) => updateDraft('title', event.target.value)}
              placeholder="Например PhiBrows Basic"
            />
          </label>
          <label className="field full-span">
            <span>Подзаглавие</span>
            <input
              className="input"
              value={draft.subtitle}
              onChange={(event) => updateDraft('subtitle', event.target.value)}
              placeholder="Кратка подложка под заглавието"
            />
          </label>
          <div className="field full-span material-upload-field">
            <span>Hero снимки</span>
            <p className="material-upload__hint">До {HERO_MAX_IMAGES} снимки (JPG, PNG, WebP, GIF), до 2,5 MB всяка. Запазват се локално (data URL).</p>
            <div className="training-hero-grid" aria-label="Качени hero снимки">
              {draft.heroImages.map((url, i) => (
                <figure key={`${i}-${url.slice(0, 32)}`} className="training-hero-tile">
                  <img src={url} alt="" />
                  <button type="button" className="training-hero-tile__remove" onClick={() => removeHeroAt(i)} aria-label="Премахни снимката">
                    <Trash2 size={16} />
                  </button>
                </figure>
              ))}
            </div>
            <div className="material-upload__row">
              <input
                type="file"
                id="training-hero-files"
                accept={HERO_ACCEPT}
                className="visually-hidden"
                multiple
                onChange={onHeroFilesSelected}
              />
              <label htmlFor="training-hero-files" className="button secondary button--sm material-upload__pick">
                <ImagePlus size={16} />
                Добави снимки
              </label>
            </div>
            {heroError && <p className="material-upload__error">{heroError}</p>}
          </div>
          <div className="field full-span">
            <span>Кратко описание (rich text)</span>
            <SimpleRichTextField
              value={draft.shortDescription}
              onChange={(html) => updateDraft('shortDescription', html)}
              placeholder="Кратко представяне с форматиране"
              aria-label="Кратко описание с форматиране"
            />
          </div>
        </div>
      )}

      {formTab === 'planning' && (
        <div
          className="form-grid two-columns form-page__grid"
          id="tabpanel-training-planning"
          role="tabpanel"
          aria-labelledby="tab-training-planning"
        >
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
      )}
    </div>
  );
}
