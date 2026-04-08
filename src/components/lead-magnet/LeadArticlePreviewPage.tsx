import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { isDataUrlMaterial, leadArticleStatusLabel } from '../../lib/format';
import { useAdmin } from '../../context/admin-context';

function bodyToParagraphs(body: string) {
  const normalized = body.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const blocks = normalized.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (blocks.length > 0) return blocks;
  return normalized.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function LeadArticlePreviewPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { store } = useAdmin();
  const article = store.leadArticles.find((a) => a.id === articleId);

  const paragraphs = article ? bodyToParagraphs(article.body) : [];

  useEffect(() => {
    if (articleId && !store.leadArticles.some((a) => a.id === articleId)) {
      navigate('/lead-magnet/articles', { replace: true });
    }
  }, [articleId, navigate, store.leadArticles]);

  if (!article) {
    return null;
  }

  const isDraft = article.status === 'draft';

  return (
    <div className="preview-page">
      <div className="preview-page__toolbar">
        <Link className="text-button form-page__back" to="/lead-magnet/articles">
          <ArrowLeft size={18} />
          Към списъка
        </Link>
        <div className="preview-page__actions">
          <Link className="button primary" to={`/lead-magnet/articles/${article.id}/edit`}>
            <Pencil size={18} />
            Редакция
          </Link>
        </div>
      </div>

      {isDraft && (
        <div className="preview-draft-banner" role="status">
          Това е чернова — посетителите виждат само публикувани ресурси на публичния сайт.
        </div>
      )}

      <article className="preview-card preview-card--article">
        <header className="preview-card__header">
          <span className="eyebrow">Безплатен ресурс</span>
          <h1 className="preview-card__title">{article.title}</h1>
          <div className="preview-card__meta">
            <span className={`soft-pill ${article.status === 'published' ? 'published' : 'draft'}`}>
              {leadArticleStatusLabel(article.status)}
            </span>
            {article.slug && <span className="preview-slug">/{article.slug}</span>}
          </div>
          {article.excerpt && <p className="preview-card__lead">{article.excerpt}</p>}
        </header>

        <section className="preview-section">
          <h2 className="visually-hidden">Съдържание</h2>
          <div className="preview-prose">
            {paragraphs.map((block, i) => (
              <p key={i}>{block}</p>
            ))}
          </div>
        </section>

        <footer className="preview-article-footer">
          <div>
            <strong>Материал за изпращане</strong>
            <p>{article.materialLabel || '—'}</p>
          </div>
          {article.materialUrl ? (
            <a className="text-button" href={article.materialUrl} target="_blank" rel="noreferrer">
              {isDataUrlMaterial(article.materialUrl) ? 'Отвори материала →' : 'Отвори линк →'}
            </a>
          ) : (
            <span className="table-muted">Без публичен линк — изпращате файла ръчно.</span>
          )}
        </footer>
      </article>
    </div>
  );
}
