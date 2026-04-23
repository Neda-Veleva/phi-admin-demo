import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { createId } from '../lib/format';
import { useAdmin } from '../context/admin-context';
import type { Service, ServiceCategory } from '../types';

function createBlankService(): Service {
  const now = new Date().toISOString();
  return {
    id: createId('svc'),
    title: '',
    description: '',
    duration: '',
    price: '',
    category: 'brows',
    createdAt: now,
    updatedAt: now,
  };
}

export function ServiceFormPage() {
  const { serviceId } = useParams<{ serviceId?: string }>();
  const navigate = useNavigate();
  const { store, upsertService } = useAdmin();
  const isNew = !serviceId;

  const [draft, setDraft] = useState<Service>(() => {
    if (isNew) return createBlankService();
    const found = store.services.find((s) => s.id === serviceId);
    return found ?? createBlankService();
  });

  useEffect(() => {
    if (isNew) {
      setDraft(createBlankService());
      return;
    }
    const found = store.services.find((s) => s.id === serviceId);
    if (found) setDraft(found);
  }, [serviceId, isNew, store.services]);

  useEffect(() => {
    if (!isNew && serviceId && !store.services.some((s) => s.id === serviceId)) {
      navigate('/services', { replace: true });
    }
  }, [serviceId, isNew, navigate, store.services]);

  function updateDraft<K extends keyof Service>(key: K, value: Service[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    const title = draft.title.trim();
    if (!title) return;

    const now = new Date().toISOString();
    if (isNew) {
      upsertService({
        ...draft,
        title,
        createdAt: now,
        updatedAt: now,
      });
      navigate('/services');
      return;
    }

    const existing = store.services.find((s) => s.id === serviceId);
    if (!existing) {
      navigate('/services', { replace: true });
      return;
    }

    upsertService({
      ...existing,
      ...draft,
      title,
      updatedAt: now,
    });
    navigate('/services');
  }

  const pageTitle = isNew ? 'Нова услуга' : draft.title || 'Редакция на услуга';

  return (
    <div className="form-page">
      <div className="form-page__toolbar">
        <Link className="text-button form-page__back" to="/services">
          <ArrowLeft size={18} />
          Към списъка
        </Link>
        <div className="form-page__toolbar-actions">
          <Link className="button secondary" to="/services">
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
        <p className="form-page__lede">Управлявайте услугите, които се показват на сайта. Промените се записват локално в браузъра.</p>
      </header>

      <div className="form-grid two-columns form-page__grid">
        <label className="field full-span">
          <span>Име</span>
          <input
            className="input"
            value={draft.title}
            onChange={(event) => updateDraft('title', event.target.value)}
            placeholder="Напр. PhiBrows"
          />
        </label>

        <label className="field">
          <span>Тип</span>
          <select
            className="select"
            value={draft.category}
            onChange={(event) => updateDraft('category', event.target.value as ServiceCategory)}
          >
            <option value="brows">Вежди</option>
            <option value="lips">Устни</option>
          </select>
        </label>

        <label className="field">
          <span>Продължителност</span>
          <input
            className="input"
            value={draft.duration}
            onChange={(event) => updateDraft('duration', event.target.value)}
            placeholder="Напр. 2 ч"
          />
        </label>

        <label className="field">
          <span>Цена</span>
          <input
            className="input"
            value={draft.price}
            onChange={(event) => updateDraft('price', event.target.value)}
            placeholder="Напр. 400 €"
          />
        </label>

        <label className="field full-span">
          <span>Описание</span>
          <textarea
            className="textarea"
            rows={4}
            value={draft.description}
            onChange={(event) => updateDraft('description', event.target.value)}
            placeholder="Кратко описание"
          />
        </label>
      </div>
    </div>
  );
}

