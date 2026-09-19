import { ArrowUp, Bookmark, MessageCircle, Star, Eye } from 'lucide-react';
import type { WikiArticle, WikiStatus } from '../../../types';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const STATUS_META: Record<WikiStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-card-alt border border-hairline text-muted' },
  pending: { label: 'Pending Review', className: 'bg-nexus-amber/15 text-nexus-amber' },
  published: { label: 'Published', className: 'bg-nexus-emerald/15 text-nexus-emerald' },
  rejected: { label: 'Needs Changes', className: 'bg-red-500/15 text-red-400' },
};

export default function ArticleCard({
  article, onOpen, bookmarked, showStatus,
}: {
  article: WikiArticle;
  onOpen: () => void;
  bookmarked?: boolean;
  showStatus?: boolean;
}) {
  const score = article.upvotes.length - article.downvotes.length;
  const statusMeta = STATUS_META[article.status];

  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-2xl border border-hairline bg-card p-5 hover:border-hairline-strong transition-colors flex flex-col"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-card-alt border border-hairline text-muted font-medium">{article.category}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {article.featured && <Star size={13} className="text-nexus-amber fill-nexus-amber" />}
          {bookmarked && <Bookmark size={13} className="text-samsung-blue fill-samsung-blue" />}
          {showStatus && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusMeta.className}`}>{statusMeta.label}</span>}
        </div>
      </div>

      <h3 className="font-display font-semibold text-primary leading-snug mb-1.5 line-clamp-2">{article.title}</h3>
      <p className="text-xs text-muted leading-relaxed line-clamp-2 flex-1">{article.excerpt}</p>

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {article.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-glow/10 text-cyan-glow">#{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-hairline">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-samsung-blue to-nexus-violet flex items-center justify-center text-white text-[9px] font-semibold shrink-0">
            {initials(article.authorName)}
          </div>
          <span className="text-[11px] text-faint truncate">{article.authorName}</span>
        </div>
        <div className="flex items-center gap-2.5 text-faint shrink-0">
          <span className="flex items-center gap-1 text-[11px]"><ArrowUp size={11} /> {score}</span>
          <span className="flex items-center gap-1 text-[11px]"><MessageCircle size={11} /> {article.comments.length}</span>
          <span className="flex items-center gap-1 text-[11px]"><Eye size={11} /> {article.viewCount}</span>
        </div>
      </div>
    </button>
  );
}
