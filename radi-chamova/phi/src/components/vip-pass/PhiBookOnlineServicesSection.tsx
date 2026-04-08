import { useMemo, useState } from 'react';
import { type BookOnlineServiceCategory, bookOnlineServices } from '../../data/book-online-services';

type Filter = 'all' | BookOnlineServiceCategory;

const FILTER_LABELS: Record<Filter, string> = {
  all: 'Всички услуги',
  brows: 'Вежди',
  lips: 'Устни',
};

export function PhiBookOnlineServicesSection() {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    const base = bookOnlineServices.filter((s) => !s.isVipPass);
    if (filter === 'all') return base;
    return base.filter((s) => s.category === filter);
  }, [filter]);

  return (
    <section className="panel book-online-services" aria-labelledby="book-online-services-heading">
      <div className="book-online-services__head">
        <div>
          <p className="eyebrow">Администрация</p>
          <h3 id="book-online-services-heading" className="book-online-services__title">
            Услуги
          </h3>
        </div>
      </div>

      <div className="book-online-services__tabs" role="tablist" aria-label="Филтър по тип услуга">
        {(Object.keys(FILTER_LABELS) as Filter[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={`book-online-services__tab ${filter === key ? 'is-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {FILTER_LABELS[key]}
          </button>
        ))}
      </div>

      <ul className="book-online-services__grid">
        {visible.map((s) => (
          <li key={s.id} className="book-online-service-card">
            <div className="book-online-service-card__media" aria-hidden>
              <span className="book-online-service-card__media-label">{s.category === 'brows' ? 'Вежди' : 'Устни'}</span>
            </div>
            <div className="book-online-service-card__body">
              <h4 className="book-online-service-card__name">{s.title}</h4>
              <p className="book-online-service-card__desc">{s.description}</p>
              <div className="book-online-service-card__meta">
                <span>{s.duration}</span>
                <span className="book-online-service-card__price">{s.price}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
