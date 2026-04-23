import { useLayoutEffect, useRef, useState } from 'react';
import { Bold, Italic, Link2, List, ListOrdered } from 'lucide-react';

type SimpleRichTextFieldProps = {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  'aria-label'?: string;
};

const EMPTY = '<p><br></p>';

export function SimpleRichTextField({ id, value, onChange, placeholder, 'aria-label': ariaLabel }: SimpleRichTextFieldProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el || focused) return;
    const desired = value?.trim() ? value : EMPTY;
    const cur = (el.innerHTML || '').replace(/\s+/g, ' ').trim();
    const want = desired.replace(/\s+/g, ' ').trim();
    if (cur !== want) {
      el.innerHTML = desired;
    }
  }, [value, focused]);

  function emit() {
    const el = elRef.current;
    if (!el) return;
    const html = el.innerHTML;
    const normalized =
      html === EMPTY || html === '<p></p>' || html === '<br>' || !el.textContent?.replace(/\u00a0/g, ' ').trim() ? '' : html;
    onChange(normalized);
  }

  function run(cmd: string, cmdValue?: string) {
    const el = elRef.current;
    if (!el) return;
    el.focus();
    try {
      document.execCommand(cmd, false, cmdValue);
    } catch {
      /* ignore */
    }
    emit();
  }

  function handleLink() {
    const url = window.prompt('Адрес на връзката (https://...)', 'https://');
    if (url == null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      run('unlink');
      return;
    }
    run('createLink', trimmed);
  }

  return (
    <div className="rich-text-field">
      <div className="rich-text-field__toolbar" role="toolbar" aria-label="Форматиране на текст">
        <button type="button" className="rich-text-field__tool" onClick={() => run('bold')} aria-label="Удебелен" title="Удебелен">
          <Bold size={16} strokeWidth={2.2} />
        </button>
        <button type="button" className="rich-text-field__tool" onClick={() => run('italic')} aria-label="Курсив" title="Курсив">
          <Italic size={16} strokeWidth={2.2} />
        </button>
        <span className="rich-text-field__sep" aria-hidden />
        <button
          type="button"
          className="rich-text-field__tool"
          onClick={() => run('insertUnorderedList')}
          aria-label="Списък с точки"
          title="Списък с точки"
        >
          <List size={16} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          className="rich-text-field__tool"
          onClick={() => run('insertOrderedList')}
          aria-label="Номериран списък"
          title="Номериран списък"
        >
          <ListOrdered size={16} strokeWidth={2.2} />
        </button>
        <span className="rich-text-field__sep" aria-hidden />
        <button type="button" className="rich-text-field__tool" onClick={handleLink} aria-label="Връзка" title="Връзка">
          <Link2 size={16} strokeWidth={2.2} />
        </button>
      </div>
      <div
        id={id}
        ref={elRef}
        className="rich-text-field__editor textarea"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        aria-label={ariaLabel ?? 'Текст с форматиране'}
        data-placeholder={placeholder || ''}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          emit();
        }}
        onInput={emit}
      />
    </div>
  );
}
