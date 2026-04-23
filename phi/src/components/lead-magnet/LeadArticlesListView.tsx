import { Link, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus } from 'lucide-react';
import { leadArticleStatusLabel } from '../../lib/format';
import { useAdmin } from '../../context/admin-context';

export function LeadArticlesListView() {
  const { store } = useAdmin();
  const navigate = useNavigate();
  const articles = [...store.leadArticles].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="content-stack content-stack--tight">
      <section className="panel list-only-panel">
        <div className="panel-toolbar panel-toolbar--end">
          <Link className="button primary button--sm" to="/lead-magnet/articles/new">
            <Plus size={17} />
            Нова статия
          </Link>
        </div>

        <div className="lead-article-table-wrap">
          <table className="data-table data-table--compact">
            <thead>
              <tr>
                <th className="col-status">Статус</th>
                <th>Заглавие</th>
                <th className="col-material">Материал</th>
                <th className="col-date">Обновена</th>
                <th className="col-actions" aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state compact">Няма статии. Добавете първата.</div>
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id}>
                    <td className="col-status">
                      <span className={`status-badge ${article.status === 'published' ? 'is-on' : 'is-off'}`}>
                        {leadArticleStatusLabel(article.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="table-title-link table-title-link--plain"
                        onClick={() => navigate(`/lead-magnet/articles/${article.id}`)}
                      >
                        {article.title}
                      </button>
                    </td>
                    <td className="col-material table-cell-muted">{article.materialLabel || '—'}</td>
                    <td className="col-date table-cell-muted">
                      {new Date(article.updatedAt).toLocaleDateString('bg-BG', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="col-actions">
                      <div className="table-icon-actions">
                        <Link
                          className="table-icon-link"
                          to={`/lead-magnet/articles/${article.id}`}
                          title="Преглед"
                          aria-label={`Преглед: ${article.title}`}
                        >
                          <Eye size={17} />
                        </Link>
                        <Link
                          className="table-icon-link"
                          to={`/lead-magnet/articles/${article.id}/edit`}
                          title="Редакция"
                          aria-label={`Редакция: ${article.title}`}
                        >
                          <Pencil size={17} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
