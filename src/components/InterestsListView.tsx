import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus } from 'lucide-react';
import { formatDateTime, interestStatusLabel, temperatureLabel } from '../lib/format';
import { useAdmin } from '../context/admin-context';
import type { InterestStatus } from '../types';

export function InterestsListView() {
  const { store } = useAdmin();
  const navigate = useNavigate();
  const { interests } = store;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InterestStatus>('all');

  const filteredInterests = useMemo(() => {
    return interests.filter((person) => {
      const matchesSearch =
        person.fullName.toLowerCase().includes(search.toLowerCase()) ||
        person.email.toLowerCase().includes(search.toLowerCase()) ||
        person.city.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : person.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [interests, search, statusFilter]);

  return (
    <div className="content-stack content-stack--tight">
      <section className="panel list-only-panel">
        <div className="panel-toolbar panel-toolbar--wrap">
          <input
            className="input"
            type="search"
            placeholder="Търси по име, имейл или град"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | InterestStatus)}
          >
            <option value="all">Всички статуси</option>
            <option value="new">Нови</option>
            <option value="contacted">Контактувани</option>
            <option value="qualified">Квалифицирани</option>
            <option value="reserved">Резервирани</option>
            <option value="archived">Архив</option>
          </select>
          <Link className="button primary button--sm panel-toolbar-cta" to="/interests/new">
            <Plus size={17} />
            Нов контакт
          </Link>
        </div>

        <div className="lead-list">
          {filteredInterests.length === 0 ? (
            <div className="empty-state compact">Няма хора, които да отговарят на текущия филтър.</div>
          ) : (
            filteredInterests.map((person) => (
              <div className="list-row list-row--clickable" key={person.id}>
                <button
                  type="button"
                  className="list-row-main"
                  onClick={() => navigate(`/interests/${person.id}/edit`)}
                >
                  <div className="training-card-topline">
                    <span className={`soft-pill ${person.temperature}`}>{temperatureLabel(person.temperature)}</span>
                    <span className={`soft-pill ${person.status}`}>{interestStatusLabel(person.status)}</span>
                  </div>
                  <strong>{person.fullName}</strong>
                  <p>{person.summary || 'Без въведено резюме.'}</p>
                  <div className="lead-meta-grid">
                    <span>{person.city || 'Без град'}</span>
                    <span>{person.notes.length} бележки</span>
                    <span>{formatDateTime(person.lastContactAt)}</span>
                  </div>
                </button>
                <div className="list-row-actions">
                  <Link className="button secondary button--compact" to={`/interests/${person.id}/edit`}>
                    <Pencil size={16} />
                    Отвори карта
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
