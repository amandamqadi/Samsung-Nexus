import { useState } from 'react';
import { BookOpen, Check, Eye, Search, Star, X } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { AdminView } from '../AdminPortal';

export default function WikiAdmin({ view }: { view: AdminView }) {
  if (view === 'wiki.all') return <AllArticlesView />;
  return <ModerationQueueView />;
}

function ModerationQueueView() {
  const { pendingWikiArticles, approveWikiArticle, rejectWikiArticle } = useApp();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  function confirmReject(id: string) {
    rejectWikiArticle(id, reason.trim());
    setRejectingId(null);
    setReason('');
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Wiki Moderation Queue</h1>
      <p className="text-sm text-muted mb-6">Articles alumni have submitted for review — approve to publish, or send back with feedback</p>

      {pendingWikiArticles.length === 0 && (
        <div className="rounded-2xl border border-dashed border-hairline-strong p-10 text-center">
          <BookOpen size={22} className="text-faint mx-auto mb-3" />
          <p className="text-sm text-muted">Nothing waiting for review right now.</p>
        </div>
      )}

      <div className="space-y-4">
        {pendingWikiArticles.map((a) => (
          <div key={a.id} className="rounded-2xl border border-hairline bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-card-alt border border-hairline text-muted">{a.category}</span>
                  {a.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-glow/10 text-cyan-glow">#{t}</span>
                  ))}
                </div>
                <p className="font-display font-semibold text-primary">{a.title}</p>
                <p className="text-xs text-faint mt-0.5">By {a.authorName} · {a.authorTrack}</p>
                <p className="text-sm text-muted mt-2 leading-relaxed line-clamp-3">{a.excerpt}</p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => approveWikiArticle(a.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-nexus-emerald/15 text-nexus-emerald font-medium hover:bg-nexus-emerald/25 transition-colors"
                >
                  <Check size={13} /> Approve
                </button>
                <button
                  onClick={() => setRejectingId(rejectingId === a.id ? null : a.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 font-medium hover:bg-red-500/25 transition-colors"
                >
                  <X size={13} /> Reject
                </button>
              </div>
            </div>

            {rejectingId === a.id && (
              <div className="mt-4 pt-4 border-t border-hairline">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="What should the author fix before resubmitting? (visible to them)"
                  rows={2}
                  className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2 text-xs text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue resize-none mb-2"
                />
                <button
                  onClick={() => confirmReject(a.id)}
                  className="text-xs px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                >
                  Confirm Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AllArticlesView() {
  const { wikiArticles, toggleFeaturedArticle } = useApp();
  const [query, setQuery] = useState('');

  const filtered = wikiArticles.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()) || a.authorName.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">All Published Articles</h1>
      <p className="text-sm text-muted mb-6">{wikiArticles.length} live articles on Nexus Wiki — feature the best ones to surface them on the hub</p>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles or authors..."
          className="w-full rounded-lg bg-card border border-hairline pl-9 pr-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
        />
      </div>

      {filtered.length === 0 && <p className="text-sm text-faint">No published articles yet.</p>}

      {filtered.length > 0 && (
        <div className="rounded-2xl border border-hairline bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-hairline text-xs text-faint uppercase tracking-wide">
                <th className="text-left font-medium px-5 py-3">Title</th>
                <th className="text-left font-medium px-5 py-3">Author</th>
                <th className="text-left font-medium px-5 py-3">Category</th>
                <th className="text-left font-medium px-5 py-3">Score</th>
                <th className="text-left font-medium px-5 py-3">Views</th>
                <th className="text-right font-medium px-5 py-3">Featured</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((a) => (
                <tr key={a.id} className="border-b border-hairline last:border-0 hover:bg-card-alt">
                  <td className="px-5 py-3 font-medium text-primary max-w-xs truncate">{a.title}</td>
                  <td className="px-5 py-3 text-muted">{a.authorName}</td>
                  <td className="px-5 py-3 text-muted">{a.category}</td>
                  <td className="px-5 py-3 text-muted">{a.upvotes.length - a.downvotes.length}</td>
                  <td className="px-5 py-3 text-muted"><span className="inline-flex items-center gap-1"><Eye size={12} /> {a.viewCount}</span></td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleFeaturedArticle(a.id, !a.featured)}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        a.featured ? 'bg-nexus-amber/15 text-nexus-amber' : 'bg-card-alt border border-hairline text-muted'
                      }`}
                    >
                      <Star size={12} fill={a.featured ? 'currentColor' : 'none'} /> {a.featured ? 'Featured' : 'Feature'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
