import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { formatCurrency, formatDate, joinCsv, trainingStatusLabel } from '../lib/format';
import { useAdmin } from '../context/admin-context';

export function TrainingPreviewPage() {
  const { trainingId } = useParams<{ trainingId: string }>();
  const navigate = useNavigate();
  const { store } = useAdmin();
  const training = store.trainings.find((t) => t.id === trainingId);

  useEffect(() => {
    if (trainingId && !store.trainings.some((t) => t.id === trainingId)) {
      navigate('/trainings', { replace: true });
    }
  }, [trainingId, navigate, store.trainings]);

  if (!training || !trainingId) {
    return null;
  }

  const interestCount = store.interests.filter((p) => p.trainingIds.includes(trainingId)).length;

  return (
    <div className="preview-page">
      <div className="preview-page__toolbar">
        <Link className="text-button form-page__back" to="/trainings">
          <ArrowLeft size={18} />
          Към списъка
        </Link>
        <div className="preview-page__actions">
          <Link className="button primary" to={`/trainings/${training.id}/edit`}>
            <Pencil size={18} />
            Редакция
          </Link>
        </div>
      </div>

      <article className="preview-card">
        <header className="preview-card__header">
          <span className="eyebrow">{training.academy}</span>
          <h1 className="preview-card__title">{training.title}</h1>
          <div className="preview-card__meta">
            <span className={`soft-pill ${training.status}`}>{trainingStatusLabel(training.status)}</span>
            <span>{training.category}</span>
            <span>{training.level}</span>
            <span>{training.format === 'live' ? 'На живо' : training.format === 'online' ? 'Онлайн' : 'Хибридно'}</span>
          </div>
          <p className="preview-card__lead">{training.shortDescription}</p>
        </header>

        <dl className="preview-facts">
          <div>
            <dt>Локация</dt>
            <dd>{training.location || '—'}</dd>
          </div>
          <div>
            <dt>Следваща дата</dt>
            <dd>{formatDate(training.nextDate)}</dd>
          </div>
          <div>
            <dt>Продължителност</dt>
            <dd>{training.durationLabel || '—'}</dd>
          </div>
          <div>
            <dt>Цена</dt>
            <dd>{formatCurrency(training.priceEUR)}</dd>
          </div>
          <div>
            <dt>Места</dt>
            <dd>
              {training.seatsReserved} / {training.seatsTotal} заети
            </dd>
          </div>
          <div>
            <dt>Интереси в CRM</dt>
            <dd>{interestCount}</dd>
          </div>
        </dl>

        <section className="preview-section">
          <h2>Пълно описание</h2>
          <div className="preview-prose">{training.longDescription || '—'}</div>
        </section>

        {(training.tags.length > 0 || training.languages.length > 0) && (
          <section className="preview-section preview-section--tags">
            {training.tags.length > 0 && (
              <p>
                <strong>Тагове:</strong> {joinCsv(training.tags)}
              </p>
            )}
            {training.languages.length > 0 && (
              <p>
                <strong>Езици:</strong> {joinCsv(training.languages)}
              </p>
            )}
          </section>
        )}
      </article>
    </div>
  );
}
