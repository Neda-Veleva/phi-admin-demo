import { Link } from 'react-router-dom';
import { FileText, Lightbulb, Mail } from 'lucide-react';
import { useAdmin } from '../../context/admin-context';

export function LeadMagnetOverview() {
  const { store } = useAdmin();
  const { leadArticles, leadSignups } = store;
  const published = leadArticles.filter((a) => a.status === 'published').length;

  return (
    <div className="content-stack">
      <section className="section-heading">
        <div>
          <span className="eyebrow">Безплатни ресурси</span>
          <h2>Материали и регистрации</h2>
          <p>
            Подготвяте страниците с подаръци за клиентите, виждате кой се е записал и изпращате материала по имейл —
            с копиране на адреси и готов текст.
          </p>
        </div>
      </section>

      <section className="stats-grid stats-grid--three">
        <article className="stat-card">
          <div className="stat-icon stat-icon--amber">
            <FileText size={18} />
          </div>
          <span className="stat-label">Публикувани ресурси</span>
          <strong>{published}</strong>
          <p>{leadArticles.length} общо статии</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon stat-icon--coral">
            <Mail size={18} />
          </div>
          <span className="stat-label">Събрани контакти</span>
          <strong>{leadSignups.length}</strong>
          <p>от форми за безплатно съдържание</p>
        </article>
        <article className="stat-card">
          <div className="stat-icon stat-icon--teal">
            <Lightbulb size={18} />
          </div>
          <span className="stat-label">Следваща стъпка</span>
          <strong>Една стъпка</strong>
          <p>напред — към „Заинтересовани хора“ за последващи действия и записвания</p>
        </article>
      </section>

      <section className="split-grid two-up">
        <Link className="module-card module-card--amber" to="/lead-magnet/articles">
          <div className="module-card__icon">
            <Lightbulb size={22} />
          </div>
          <div>
            <h3>Създаване и управление на безплатни ресурси</h3>
            <ul className="module-card__list">
              <li>Статии с описание и текст за изпращане</li>
              <li>Статус чернова / публикувана</li>
              <li>Етикет за материал (PDF, шаблон и т.н.)</li>
            </ul>
            <span className="module-card__cta">Към ресурсите →</span>
          </div>
        </Link>

        <Link className="module-card module-card--coral" to="/lead-magnet/signups">
          <div className="module-card__icon">
            <Mail size={22} />
          </div>
          <div>
            <h3>Регистрация срещу съдържание</h3>
            <ul className="module-card__list">
              <li>Списък с имейли с множествена селекция</li>
              <li>Копиране на избраните адреси</li>
              <li>Изпращане на материал през имейл клиент (шаблон)</li>
            </ul>
            <span className="module-card__cta">Към регистрациите →</span>
          </div>
        </Link>
      </section>
    </div>
  );
}
