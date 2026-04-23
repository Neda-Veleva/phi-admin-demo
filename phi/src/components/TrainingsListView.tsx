import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus } from 'lucide-react';
import { formatCurrency, formatDate, trainingStatusLabel } from '../lib/format';
import { stripHtml } from '../lib/html';
import { useAdmin } from '../context/admin-context';
import type { TrainingStatus } from '../types';

export function TrainingsListView() {
  const { store } = useAdmin();
  const navigate = useNavigate();
  const { trainings, interests } = store;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TrainingStatus>('all');

  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const q = search.toLowerCase();
      const matchesSearch =
        training.title.toLowerCase().includes(q) ||
        training.subtitle.toLowerCase().includes(q) ||
        training.category.toLowerCase().includes(q) ||
        training.level.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' ? true : training.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, trainings]);

  function trainingInterestCount(trainingId: string) {
    return interests.filter((person) => person.trainingIds.includes(trainingId)).length;
  }

  return (
    <div className="content-stack content-stack--tight">
      <section className="panel list-only-panel">
        <div className="panel-toolbar panel-toolbar--wrap">
          <input
            className="input"
            type="search"
            placeholder="Търси по заглавие, категория или ниво"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | TrainingStatus)}
          >
            <option value="all">Всички статуси</option>
            <option value="published">Публикувани</option>
            <option value="scheduled">Планирани</option>
            <option value="draft">Чернови</option>
            <option value="archived">Архив</option>
          </select>
          <Link className="button primary button--sm panel-toolbar-cta" to="/trainings/new">
            <Plus size={17} />
            Ново обучение
          </Link>
        </div>

        <div className="training-card-list">
          {filteredTrainings.length === 0 ? (
            <div className="empty-state compact">Няма обучения, които да отговарят на текущия филтър.</div>
          ) : (
            filteredTrainings.map((training) => (
              <div className="list-row list-row--clickable" key={training.id}>
                <button
                  type="button"
                  className="list-row-main"
                  onClick={() => navigate(`/trainings/${training.id}`)}
                >
                  <div className="training-card-topline">
                    <span className={`soft-pill ${training.status}`}>{trainingStatusLabel(training.status)}</span>
                    <span className="list-row-kicker">{training.category}</span>
                  </div>
                  <strong>{training.title}</strong>
                  <p>{stripHtml(training.shortDescription) || '—'}</p>
                  <div className="training-card-meta">
                    <span>{formatDate(training.nextDate)}</span>
                    <span>{formatCurrency(training.priceEUR)}</span>
                    <span>{trainingInterestCount(training.id)} интереса</span>
                  </div>
                </button>
                <div className="list-row-actions list-row-actions--split">
                  <Link className="button secondary button--compact" to={`/trainings/${training.id}`}>
                    <Eye size={16} />
                    Преглед
                  </Link>
                  <Link className="button secondary button--compact" to={`/trainings/${training.id}/edit`}>
                    <Pencil size={16} />
                    Редакция
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
