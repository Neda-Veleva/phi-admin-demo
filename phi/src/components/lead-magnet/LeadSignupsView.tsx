import { useMemo, useState } from 'react';
import { CheckSquare, Copy, Mail, Plus, Square, Trash2 } from 'lucide-react';
import { createId, formatDateTime, leadMaterialLineForEmail } from '../../lib/format';
import { useAdmin } from '../../context/admin-context';
import type { LeadArticle, LeadSignup } from '../../types';

const MAILTO_SAFE_LENGTH = 1850;

function articleById(articles: LeadArticle[], id: string) {
  return articles.find((a) => a.id === id);
}

export function LeadSignupsView() {
  const { store, addLeadSignup, updateLeadSignup, markLeadSignupsMaterialSent, removeLeadSignup } = useAdmin();
  const { leadArticles, leadSignups } = store;

  const [search, setSearch] = useState('');
  const [articleFilter, setArticleFilter] = useState<string>('all');
  const [sentFilter, setSentFilter] = useState<'all' | 'sent' | 'unsent'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [manual, setManual] = useState({
    fullName: '',
    email: '',
    articleId: leadArticles[0]?.id ?? '',
  });

  const filtered = useMemo(() => {
    return leadSignups
      .filter((s) => {
        const q = search.trim().toLowerCase();
        const matchArticle = articleFilter === 'all' || s.articleId === articleFilter;
        const matchSent =
          sentFilter === 'all' ? true : sentFilter === 'sent' ? s.materialSent : !s.materialSent;
        const matchSearch =
          !q ||
          s.email.toLowerCase().includes(q) ||
          s.fullName.toLowerCase().includes(q);
        return matchArticle && matchSent && matchSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [articleFilter, leadSignups, search, sentFilter]);

  const selectedEmails = useMemo(() => {
    const emails = filtered.filter((s) => selected.has(s.id)).map((s) => s.email);
    return [...new Set(emails)];
  }, [filtered, selected]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const someSelected = selectedEmails.length > 0;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 4200);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.add(s.id));
        return next;
      });
    }
  }

  async function copySelectedEmails() {
    if (!someSelected) {
      showToast('Изберете поне един контакт.');
      return;
    }
    const text = selectedEmails.join(', ');
    try {
      await navigator.clipboard.writeText(text);
      showToast('Имейлите са копирани в клипборда.');
    } catch {
      showToast('Копирането не бе успешно — опитайте отново.');
    }
  }

  function resolveTemplateArticle(): LeadArticle | undefined {
    const firstSignup = filtered.find((s) => selected.has(s.id));
    if (firstSignup) {
      const art = articleById(leadArticles, firstSignup.articleId);
      if (art) return art;
    }
    return leadArticles[0];
  }

  function openSendMaterial() {
    if (!someSelected) {
      showToast('Изберете получатели.');
      return;
    }
    const article = resolveTemplateArticle();
    if (!article) {
      showToast('Няма избрана статия за шаблона. Добавете поне една статия.');
      return;
    }

    const bcc = selectedEmails.join(',');
    const subject = `Материал от PHI Academy: ${article.title}`;
    const body = [
      'Здравейте,',
      '',
      'Благодарим за регистрацията ви за безплатното съдържание.',
      '',
      `Тема: ${article.title}`,
      '',
      article.excerpt,
      '',
      leadMaterialLineForEmail(article.materialUrl),
      '',
      `Етикет: ${article.materialLabel || '—'}`,
      '',
      'Поздрави,',
      'PHI Academy',
    ].join('\n');

    const href = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (href.length > MAILTO_SAFE_LENGTH) {
      showToast(
        'Твърде много адреси за един имейл линк. Копирайте имейлите на части или използвайте по-малка селекция.'
      );
      return;
    }

    window.location.href = href;
  }

  function setMaterialSentForRow(row: LeadSignup, sent: boolean) {
    const now = new Date().toISOString();
    updateLeadSignup({
      ...row,
      materialSent: sent,
      materialSentAt: sent ? row.materialSentAt ?? now : null,
    });
  }

  function markSelectedAsSent() {
    if (!someSelected) {
      showToast('Изберете поне един контакт.');
      return;
    }
    const ids = filtered.filter((s) => selected.has(s.id)).map((s) => s.id);
    markLeadSignupsMaterialSent(ids, true);
    showToast('Избраните са маркирани като изпратени.');
  }

  function handleManualAdd() {
    const email = manual.email.trim();
    const fullName = manual.fullName.trim();
    if (!email || !fullName || !manual.articleId) {
      showToast('Попълнете име, имейл и ресурс.');
      return;
    }

    const signup: LeadSignup = {
      id: createId('lead-su'),
      email,
      fullName,
      articleId: manual.articleId,
      source: 'Ръчно добавен',
      createdAt: new Date().toISOString(),
      materialSent: false,
      materialSentAt: null,
    };
    addLeadSignup(signup);
    setManual((m) => ({ ...m, fullName: '', email: '' }));
    showToast('Контактът е добавен.');
  }

  return (
    <div className="content-stack content-stack--tight">
      {toast && <div className="toast-banner">{toast}</div>}

      {leadArticles.length > 0 && (
        <section className="panel lead-signups-toolbar">
          <div className="lead-signups-add">
            <span className="lead-signups-add-title">Ръчно добавяне</span>
            <div className="lead-signups-add-grid">
              <input
                className="input"
                placeholder="Име и фамилия"
                value={manual.fullName}
                onChange={(e) => setManual((m) => ({ ...m, fullName: e.target.value }))}
              />
              <input
                className="input"
                type="email"
                placeholder="Имейл"
                value={manual.email}
                onChange={(e) => setManual((m) => ({ ...m, email: e.target.value }))}
              />
              <select
                className="select"
                value={manual.articleId || leadArticles[0]?.id}
                onChange={(e) => setManual((m) => ({ ...m, articleId: e.target.value }))}
              >
                {leadArticles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
              <button type="button" className="button primary button--sm" onClick={handleManualAdd}>
                <Plus size={18} />
                Добави
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="panel list-only-panel">
        <div className="panel-toolbar panel-toolbar--wrap lead-signups-actions">
          <input
            className="input"
            type="search"
            placeholder="Търси по име или имейл"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="select" value={articleFilter} onChange={(e) => setArticleFilter(e.target.value)}>
            <option value="all">Всички ресурси</option>
            {leadArticles.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <select className="select" value={sentFilter} onChange={(e) => setSentFilter(e.target.value as 'all' | 'sent' | 'unsent')}>
            <option value="all">Всички статуси</option>
            <option value="unsent">Неизпратен материал</option>
            <option value="sent">Изпратен материал</option>
          </select>
        </div>

        <div className="bulk-bar">
          <button type="button" className="text-button bulk-bar__select" onClick={toggleSelectAllFiltered}>
            {allFilteredSelected ? <CheckSquare size={18} /> : <Square size={18} />}
            {allFilteredSelected ? 'Премахни избора от видимите' : 'Избери всички видими'}
          </button>
          <span className="bulk-bar__count">
            {selectedEmails.length} избрани
            {filtered.length !== leadSignups.length ? ` · ${filtered.length} в текущия филтър` : ''}
          </span>
          <div className="bulk-bar__buttons">
            <button type="button" className="button secondary button--compact" onClick={copySelectedEmails} disabled={!someSelected}>
              <Copy size={16} />
              Копирай имейли
            </button>
            <button type="button" className="button primary button--compact" onClick={openSendMaterial} disabled={!someSelected}>
              <Mail size={16} />
              Изпрати материал
            </button>
            <button type="button" className="button secondary button--compact" onClick={markSelectedAsSent} disabled={!someSelected}>
              Маркирай като изпратени
            </button>
          </div>
        </div>

        <div className="lead-article-table-wrap">
          <table className="data-table data-table--compact">
            <thead>
              <tr>
                <th className="th-check" aria-label="Избор" />
                <th>Име</th>
                <th>Имейл</th>
                <th>Ресурс</th>
                <th>Източник</th>
                <th>Дата</th>
                <th>Материал</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state compact">Няма записи за този филтър.</div>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const art = articleById(leadArticles, row.articleId);
                  return (
                    <tr key={row.id}>
                      <td className="td-check">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={() => toggle(row.id)}
                          aria-label={`Избор ${row.email}`}
                        />
                      </td>
                      <td>
                        <strong>{row.fullName}</strong>
                      </td>
                      <td>{row.email}</td>
                      <td className="table-muted">{art?.title ?? '—'}</td>
                      <td className="table-muted">{row.source}</td>
                      <td className="table-muted">{formatDateTime(row.createdAt)}</td>
                      <td>
                        <div className="material-status-cell">
                          <button
                            type="button"
                            className={`material-status-toggle ${row.materialSent ? 'is-sent' : 'is-unsent'}`}
                            onClick={() => setMaterialSentForRow(row, !row.materialSent)}
                            title={row.materialSent ? 'Маркирай като неизпратен' : 'Маркирай като изпратен'}
                          >
                            {row.materialSent ? 'Изпратен' : 'Неизпратен'}
                          </button>
                          {row.materialSent && row.materialSentAt && (
                            <span className="material-status-date">{formatDateTime(row.materialSentAt)}</span>
                          )}
                        </div>
                      </td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className="icon-danger"
                          aria-label="Премахни запис"
                          onClick={() => {
                            removeLeadSignup(row.id);
                            setSelected((prev) => {
                              const next = new Set(prev);
                              next.delete(row.id);
                              return next;
                            });
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
