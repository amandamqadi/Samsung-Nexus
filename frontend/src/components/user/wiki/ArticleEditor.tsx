import { useState } from 'react';
import { AlertTriangle, ArrowLeft, Loader2, Save, Send } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { WIKI_CATEGORIES } from '../../../types';
import MarkdownEditor from './MarkdownEditor';

export default function ArticleEditor({ articleId, onClose, onSubmitted }: {
  articleId: string | null;
  onClose: () => void;
  onSubmitted: (id: string) => void;
}) {
  const { myWikiArticles, createWikiArticle, updateWikiArticle, submitWikiForReview } = useApp();
  const existing = articleId ? myWikiArticles.find((a) => a.id === articleId) ?? null : null;

  const [draftId, setDraftId] = useState<string | null>(articleId);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [category, setCategory] = useState(existing?.category ?? WIKI_CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState(existing?.tags.join(', ') ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rejected = existing?.status === 'rejected';
  const valid = title.trim().length >= 5 && body.trim().length >= 50;

  function currentDetails() {
    return {
      title: title.trim(),
      category,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8),
      body,
    };
  }

  async function handleSaveDraft() {
    if (!valid) return;
    setSaving(true);
    try {
      if (draftId) {
        await updateWikiArticle(draftId, currentDetails());
      } else {
        const id = await createWikiArticle(currentDetails());
        setDraftId(id);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!valid) return;
    setSubmitting(true);
    try {
      let id = draftId;
      if (id) {
        await updateWikiArticle(id, currentDetails());
      } else {
        id = await createWikiArticle(currentDetails());
        setDraftId(id);
      }
      await submitWikiForReview(id);
      onSubmitted(id);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-surface overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6">
          <ArrowLeft size={15} /> Back to Nexus Wiki
        </button>

        <h1 className="font-display text-2xl font-bold mb-1">{existing ? 'Edit Article' : 'Write a New Article'}</h1>
        <p className="text-sm text-muted mb-6">Share knowledge with the Samsung Innovation Campus alumni network — every article goes through moderator review before publishing.</p>

        {rejected && existing?.rejectionReason && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-5">
            <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">This article was sent back for changes</p>
              <p className="text-xs text-muted mt-0.5">{existing.rejectionReason}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How I got hired at Capitec"
              className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue"
              >
                {WIKI_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Tags (up to 8, comma separated)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="python, interviews, azure"
                className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Article Body</label>
            <MarkdownEditor value={body} onChange={setBody} placeholder="Write your article in Markdown — use the toolbar for formatting, headings, links, code blocks and images." />
            <p className="text-[11px] text-faint mt-1.5">Minimum 50 characters. {body.trim().length}/50</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
          <button
            onClick={handleSaveDraft}
            disabled={!valid || saving || submitting}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg border border-hairline-strong text-primary text-sm font-semibold hover:bg-card-alt transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={!valid || saving || submitting}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}
