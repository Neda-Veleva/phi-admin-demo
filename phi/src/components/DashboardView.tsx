import { Link } from 'react-router-dom';
import { CalendarClock, Flame, GraduationCap, Lightbulb, Mail, UsersRound } from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, interestStatusLabel } from '../lib/format';
import { stripHtml } from '../lib/html';
import { useAdmin } from '../context/admin-context';

export function DashboardView() {
  const { store } = useAdmin();
  const { trainings, interests, leadArticles, leadSignups } = store;
  const publishedLeadArticles = leadArticles.filter((a) => a.status === 'published').length;

  const publishedTrainings = trainings.filter((training) => training.status === 'published').length;
  const upcomingTrainings = [...trainings]
    .filter((training) => training.nextDate)
    .sort((left, right) => new Date(left.nextDate).getTime() - new Date(right.nextDate).getTime())
    .slice(0, 3);
  const hotLeads = interests.filter((person) => person.status === 'interested').length;
  const reservedLeads = interests.filter((person) => person.status === 'enrolled').length;
  const newestLeads = [...interests]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="content-stack">
      <section className="hero-panel dashboard-hero">
        <div>
          <span className="eyebrow">Добре дошли</span>
          <h2>Какво правим днес?</h2>
        </div>
        <div className="hero-actions">
          <Link className="button primary" to="/trainings">
            Обучения
          </Link>
          <Link className="button secondary" to="/interests">
            Заинтересовани хора
          </Link>
          <Link className="button secondary" to="/lead-magnet/articles">
            Безплатни ресурси
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon">
            <GraduationCap size={18} />
          </div>
          <span className="stat-label">Публикувани обучения</span>
          <strong>{publishedTrainings}</strong>
          <p>{trainings.length} общо в системата</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon">
            <UsersRound size={18} />
          </div>
          <span className="stat-label">Хора с интерес</span>
          <strong>{interests.length}</strong>
          <p>{reservedLeads} записали се</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon">
            <Flame size={18} />
          </div>
          <span className="stat-label">Силен интерес</span>
          <strong>{hotLeads}</strong>
          <p>готови за обаждане или съобщение</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon">
            <CalendarClock size={18} />
          </div>
          <span className="stat-label">Следващ курс</span>
          <strong>{upcomingTrainings[0] ? formatDate(upcomingTrainings[0].nextDate) : 'Няма'}</strong>
          <p>{upcomingTrainings[0]?.title ?? 'Добавете нова дата'}</p>
        </article>
      </section>

      <section className="panel lead-magnet-dash">
        <div className="panel-header">
          <div>
            <span className="eyebrow">За клиенти</span>
            <h3>Безплатни материали</h3>
          </div>
          <Link className="text-button" to="/lead-magnet/articles">
            Виж всичко
          </Link>
        </div>
        <div className="lead-magnet-dash-grid">
          <div className="lead-magnet-dash-stat">
            <div className="stat-icon stat-icon--amber">
              <Lightbulb size={18} />
            </div>
            <div>
              <strong>{publishedLeadArticles}</strong>
              <span>готови страници с материали</span>
              <Link to="/lead-magnet/articles">Към статиите →</Link>
            </div>
          </div>
          <div className="lead-magnet-dash-stat">
            <div className="stat-icon stat-icon--coral">
              <Mail size={18} />
            </div>
            <div>
              <strong>{leadSignups.length}</strong>
              <span>записали се за подарък</span>
              <Link to="/lead-magnet/signups">Към имейлите →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="split-grid two-up">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Следващи дати</span>
              <h3>Следващи обучения</h3>
            </div>
            <Link className="text-button" to="/trainings">
              Виж всички
            </Link>
          </div>
          <div className="list-stack compact">
            {upcomingTrainings.length === 0 ? (
              <p className="dashboard-list-empty">Няма въведена следваща дата — добавете я от списъка с обучения.</p>
            ) : (
              upcomingTrainings.map((training) => (
                <div className="list-row" key={training.id}>
                  <div>
                    <strong>{training.title}</strong>
                    <p>
                      {training.category} · {training.level}
                    </p>
                  </div>
                  <div className="list-row-meta align-right">
                    <span>{formatDate(training.nextDate)}</span>
                    <small>
                      {training.seatsReserved}/{training.seatsTotal} места
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Скорошни</span>
              <h3>Последни контакти</h3>
            </div>
            <Link className="text-button" to="/interests">
              Към списъка
            </Link>
          </div>
          <div className="list-stack compact">
            {newestLeads.length === 0 ? (
              <p className="dashboard-list-empty">Още няма записани хора — когато има, ще ги видите тук.</p>
            ) : (
              newestLeads.map((person) => (
                <div className="list-row" key={person.id}>
                  <div>
                    <strong>{person.fullName}</strong>
                    <p>{person.summary}</p>
                  </div>
                  <div className="list-row-meta align-right">
                    <span className={`soft-pill ${person.status}`}>{interestStatusLabel(person.status)}</span>
                    <small>{formatDateTime(person.lastContactAt)}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="panel revenue-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Обобщение</span>
            <h3>Резервации и очакван приход</h3>
          </div>
        </div>
        <div className="revenue-strip">
          {trainings.length === 0 ? (
            <p className="dashboard-list-empty">Добавете обучение, за да видите прихода от резервации.</p>
          ) : (
            trainings.map((training) => {
              const expectedRevenue = training.priceEUR * training.seatsReserved;

              return (
                <div className="revenue-item" key={training.id}>
                  <div>
                    <strong>{training.title}</strong>
                    <p>{stripHtml(training.shortDescription) || '—'}</p>
                  </div>
                  <div className="revenue-meta">
                    <span>{formatCurrency(expectedRevenue)}</span>
                    <small>{training.seatsReserved} резервирани места</small>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
