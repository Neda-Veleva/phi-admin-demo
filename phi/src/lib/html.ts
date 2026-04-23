/** Премахва HTML тагове за кратки прегледи в списъци. */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Дали низът изглежда като HTML (за преглед: plain vs rich). */
export function looksLikeHtmlFragment(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value.trim());
}

/** Стари записи:plain text → прости параграфи за rich text полето. */
export function plainTextToSimpleRichHtml(plain: string): string {
  if (!plain || !plain.trim()) return '';
  if (looksLikeHtmlFragment(plain)) return plain;
  const esc = plain.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<p>${esc}</p>`;
}
