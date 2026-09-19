import { useRef, useState } from 'react';
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Code, Quote, Image, Eye, Pencil,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ToolbarAction {
  icon: typeof Bold;
  label: string;
  apply: (selected: string) => { text: string; cursorOffset?: number };
}

const TOOLBAR: ToolbarAction[] = [
  { icon: Bold, label: 'Bold', apply: (s) => ({ text: `**${s || 'bold text'}**` }) },
  { icon: Italic, label: 'Italic', apply: (s) => ({ text: `*${s || 'italic text'}*` }) },
  { icon: Heading2, label: 'Heading', apply: (s) => ({ text: `\n## ${s || 'Heading'}\n` }) },
  { icon: Heading3, label: 'Subheading', apply: (s) => ({ text: `\n### ${s || 'Subheading'}\n` }) },
  { icon: List, label: 'Bullet list', apply: (s) => ({ text: `\n- ${s || 'List item'}\n` }) },
  { icon: ListOrdered, label: 'Numbered list', apply: (s) => ({ text: `\n1. ${s || 'List item'}\n` }) },
  { icon: Link2, label: 'Link', apply: (s) => ({ text: `[${s || 'link text'}](https://)` }) },
  { icon: Image, label: 'Image', apply: (s) => ({ text: `![${s || 'alt text'}](https://)` }) },
  { icon: Code, label: 'Code block', apply: (s) => ({ text: `\n\`\`\`\n${s || 'code'}\n\`\`\`\n` }) },
  { icon: Quote, label: 'Quote', apply: (s) => ({ text: `\n> ${s || 'Quote'}\n` }) },
];

export default function MarkdownEditor({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyAction(action: ToolbarAction) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const { text } = action.apply(selected);
    const nextValue = value.slice(0, start) + text + value.slice(end);
    onChange(nextValue);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="rounded-xl border border-hairline bg-card-alt overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-hairline bg-card">
        <div className="flex items-center gap-0.5 flex-wrap">
          {TOOLBAR.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => applyAction(action)}
              title={action.label}
              disabled={mode === 'preview'}
              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-card-alt transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <action.icon size={14} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-card-alt rounded-full p-0.5 border border-hairline shrink-0">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${mode === 'write' ? 'bg-samsung-blue text-white' : 'text-muted'}`}
          >
            <Pencil size={11} /> Write
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${mode === 'preview' ? 'bg-samsung-blue text-white' : 'text-muted'}`}
          >
            <Eye size={11} /> Preview
          </button>
        </div>
      </div>

      {mode === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={16}
          className="w-full bg-transparent px-4 py-3 text-sm text-primary placeholder:text-faint focus:outline-none resize-y font-mono leading-relaxed"
        />
      ) : (
        <div className="px-4 py-3 min-h-[200px] prose-wiki text-sm text-primary">
          {value.trim() ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-faint italic">Nothing to preview yet — write something first.</p>
          )}
        </div>
      )}
    </div>
  );
}
