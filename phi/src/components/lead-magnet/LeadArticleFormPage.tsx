import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Save, Upload, X } from 'lucide-react';
import { createId, isDataUrlMaterial, slugify } from '../../lib/format';
import { useAdmin } from '../../context/admin-context';
import type { LeadArticle, LeadArticleStatus } from '../../types';

const MATERIAL_MAX_BYTES = 4 * 1024 * 1024;
const MATERIAL_ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,image/gif,.pdf,.jpg,.jpeg,.png,.webp,.gif';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

function createBlankArticle(): LeadArticle {
  const now = new Date().toISOString();
  return {
    id: createId('lead-article'),
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    status: 'draft',
    materialLabel: '',
    materialUrl: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function LeadArticleFormPage() {
  const { articleId } = useParams<{ articleId?: string }>();
  const navigate = useNavigate();
  const { store, upsertLeadArticle } = useAdmin();
  const isNew = !articleId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [materialError, setMaterialError] = useState<string | null>(null);

  const [draft, setDraft] = useState<LeadArticle>(() => {
    if (isNew) return createBlankArticle();
    const found = store.leadArticles.find((a) => a.id === articleId);
    return found ?? createBlankArticle();
  });

  useEffect(() => {
    if (isNew) {
      setDraft(createBlankArticle());
      return;
    }
    const found = store.leadArticles.find((a) => a.id === articleId);
    if (found) setDraft(found);
  }, [articleId, isNew, store.leadArticles]);

  useEffect(() => {
    if (!isNew && articleId && !store.leadArticles.some((a) => a.id === articleId)) {
      navigate('/lead-magnet/articles', { replace: true });
    }
  }, [articleId, isNew, navigate, store.leadArticles]);

  function updateDraft<K extends keyof LeadArticle>(key: K, value: LeadArticle[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function clearMaterial() {
    setMaterialError(null);
    updateDraft('materialUrl', '');
    updateDraft('materialFileName', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleMaterialFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setMaterialError(null);
    event.target.value = '';
    if (!file) return;

    if (file.size > MATERIAL_MAX_BYTES) {
      setMaterialError('Файлът е над 4 MB. Изберете по-малък файл или ползвайте външен линк по-долу.');
      return;
    }

    const allowed = new Set([
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]);
    if (!allowed.has(file.type)) {
      setMaterialError('Нужен е PDF или изображение (JPG, PNG, WebP, GIF).');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDraft((current) => ({
        ...current,
        materialUrl: dataUrl,
        materialFileName: file.name,
      }));
    } catch {
      setMaterialError('Качването не бе успешно. Опитайте отново.');
    }
  }

  function handleSave() {
    const title = draft.title.trim();
    if (!title) return;
    const slug = slugify(title) || draft.id.replace(/^lead-article-/, 'article');
    upsertLeadArticle({
      ...draft,
      slug,
      updatedAt: new Date().toISOString(),
    });
    navigate('/lead-magnet/articles');
  }

  const pageTitle = isNew ? 'Нова статия' : draft.title || 'Редакция';

  return (
    <div className="form-page">
      <div className="form-page__toolbar">
        <Link className="text-button form-page__back" to="/lead-magnet/articles">
          <ArrowLeft size={18} />
          Към списъка
        </Link>
        <div className="form-page__toolbar-actions">
          <Link className="button secondary" to="/lead-magnet/articles">
            Отказ
          </Link>
          {!isNew && articleId && (
            <Link className="button secondary" to={`/lead-magnet/articles/${articleId}`}>
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
        <span className="eyebrow">{isNew ? 'Безплатни ресурси' : 'Редакция'}</span>
        <h2>{pageTitle}</h2>
        <p className="form-page__lede">
          Текстът може да се използва в имейл шаблона при изпращане на материала към регистриралите се.
        </p>
      </header>

      <div className="form-grid two-columns form-page__grid">
        <label className="field full-span">
          <span>Заглавие</span>
          <input
            className="input"
            value={draft.title}
            onChange={(event) => updateDraft('title', event.target.value)}
            placeholder="Заглавие на статията / офертата"
          />
        </label>
        <label className="field">
          <span>Статус</span>
          <select
            className="select"
            value={draft.status}
            onChange={(event) => updateDraft('status', event.target.value as LeadArticleStatus)}
          >
            <option value="draft">Чернова</option>
            <option value="published">Публикувана</option>
          </select>
        </label>
        <label className="field">
          <span>Етикет на материала</span>
          <input
            className="input"
            value={draft.materialLabel}
            onChange={(event) => updateDraft('materialLabel', event.target.value)}
            placeholder="Напр. PDF чеклист, линк към видео"
          />
        </label>
        <div className="field full-span material-upload-field">
          <span>Файл за материал (PDF или снимка)</span>
          <div className="material-upload">
            <input
              ref={fileInputRef}
              id="lead-material-file"
              className="visually-hidden"
              type="file"
              accept={MATERIAL_ACCEPT}
              onChange={handleMaterialFileChange}
            />
            <div className="material-upload__row">
              <label htmlFor="lead-material-file" className="button secondary button--sm material-upload__pick">
                <Upload size={17} />
                Избери файл
              </label>
              {draft.materialUrl && isDataUrlMaterial(draft.materialUrl) && (
                <span className="material-upload__name" title={draft.materialFileName}>
                  {draft.materialFileName ?? 'Качен файл'}
                </span>
              )}
              {draft.materialUrl && isDataUrlMaterial(draft.materialUrl) && (
                <button type="button" className="text-button material-upload__clear" onClick={clearMaterial}>
                  <X size={16} aria-hidden />
                  Премахни файла
                </button>
              )}
              {draft.materialUrl && !isDataUrlMaterial(draft.materialUrl) && (
                <a
                  className="text-button"
                  href={draft.materialUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Отвори линка
                </a>
              )}
              {draft.materialUrl && !isDataUrlMaterial(draft.materialUrl) && (
                <button type="button" className="text-button material-upload__clear" onClick={clearMaterial}>
                  <X size={16} aria-hidden />
                  Премахни линка
                </button>
              )}
            </div>
            <p className="material-upload__hint">
              До 4 MB. Файлът се записва в браузъра (за преглед и имейл шаблон без автоматично прикачване).
            </p>
            {materialError && <p className="material-upload__error">{materialError}</p>}
          </div>
          <label className="material-upload__url">
            <span>Или външен линк към файл</span>
            <input
              className="input"
              disabled={Boolean(draft.materialUrl && isDataUrlMaterial(draft.materialUrl))}
              value={draft.materialUrl && isDataUrlMaterial(draft.materialUrl) ? '' : draft.materialUrl}
              onChange={(event) => {
                setMaterialError(null);
                updateDraft('materialUrl', event.target.value.trim());
                updateDraft('materialFileName', undefined);
              }}
              placeholder="https://… — празно, ако изпращате само ръчно"
            />
          </label>
          {draft.materialUrl && isDataUrlMaterial(draft.materialUrl) && (
            <p className="material-upload__note">Премахнете качения файл, за да въведете линк.</p>
          )}
        </div>
        <label className="field full-span">
          <span>Кратко описание (за списъци и имейл)</span>
          <textarea
            className="textarea"
            rows={3}
            value={draft.excerpt}
            onChange={(event) => updateDraft('excerpt', event.target.value)}
          />
        </label>
        <label className="field full-span">
          <span>Пълен текст</span>
          <textarea
            className="textarea"
            rows={12}
            value={draft.body}
            onChange={(event) => updateDraft('body', event.target.value)}
            placeholder="Съдържание на статията…"
          />
        </label>
      </div>
    </div>
  );
}
