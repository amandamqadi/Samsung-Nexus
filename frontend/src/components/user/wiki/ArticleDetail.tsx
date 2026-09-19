import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft, ArrowUp, ArrowDown, Bookmark, MessageCircle, Eye, Pencil, History,
  Send, ShieldCheck, Sparkles, Clock,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { WikiArticle } from '../../../types';
import ViewProfileModal from '../battles/ViewProfileModal';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function ArticleDetail({ article, onBack, onEdit, onOpenRelated }: {
  article: WikiArticle;
  onBack: () => void;
  onEdit: (id: string) => void;
  onOpenRelated: (article: WikiArticle) => void;
}) {
  const {
    currentUser, allUsers, profile, wikiArticles, voteOnArticle, toggleBookmarkArticle,
    addWikiComment, recordArticleView,
  } = useApp();

  const [commentDraft, setCommentDraft] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [openRevisionIndex, setOpenRevisionIndex] = useState<number | null>(null);

  useEffect(() => {
    // Only count real readership of published work — not the author previewing their own draft.
    if (article.status === 'published') recordArticleView(article.id);
    // Only ever record once per time the reader opens this article, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id]);

  const isAuthor = currentUser?.uid === article.authorId;
  const authorUser = allUsers.find((u) => u.uid === article.authorId);
  const upvoted = !!currentUser && article.upvotes.includes(currentUser.uid);
  const downvoted = !!currentUser && article.downvotes.includes(currentUser.uid);
  const bookmarked = profile.bookmarkedArticleIds.includes(article.id);
  const score = article.upvotes.length - article.downvotes.length;

  const related = useMemo(() => {
    return wikiArticles
      .filter((a) => a.id !== article.id)
      .map((a) => {
        const sharedTags = a.tags.filter((t) => article.tags.includes(t)).length;
        const sameCategory = a.category === article.category ? 1 : 0;
        return { article: a, score: sharedTags * 2 + sameCategory };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((r) => r.article);
  }, [wikiArticles, article]);

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentDraft.trim();
    if (!text) return;
    addWikiComment(article.id, text);
    setCommentDraft('');
  }

  return (
    <div className="fixed inset-0 z-[80] bg-surface overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6">
          <ArrowLeft size={15} /> Back to Nexus Wiki
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-card-alt border border-hairline text-muted font-medium">{article.category}</span>
          {article.featured && (
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-nexus-amber/15 text-nexus-amber font-medium">
              <Sparkles size={11} /> Featured
            </span>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold text-primary leading-tight mb-4">{article.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-hairline">
          <button onClick={() => setProfileModalOpen(true)} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-samsung-blue to-nexus-violet flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {initials(article.authorName)}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-primary group-hover:text-samsung-blue transition-colors flex items-center gap-1">
                {article.authorName} {authorUser?.idVerified && <ShieldCheck size={12} className="text-nexus-emerald" />}
              </p>
              <p className="text-[11px] text-faint">
                {article.publishedAt ? new Date(article.publishedAt.toDate()).toLocaleDateString() : 'Draft'} · {article.authorTrack}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-4 text-faint text-xs">
            <span className="flex items-center gap-1"><Eye size={13} /> {article.viewCount} views</span>
            <span className="flex items-center gap-1"><MessageCircle size={13} /> {article.comments.length} comments</span>
            {isAuthor && (
              <button onClick={() => onEdit(article.id)} className="flex items-center gap-1 text-samsung-blue hover:text-cyan-glow font-medium">
                <Pencil size={13} /> Edit
              </button>
            )}
          </div>
        </div>

        {article.status !== 'published' && (
          <div className={`rounded-xl border px-4 py-3 mb-6 text-sm ${
            article.status === 'rejected' ? 'border-red-500/30 bg-red-500/10 text-red-400'
            : article.status === 'pending' ? 'border-nexus-amber/30 bg-nexus-amber/10 text-nexus-amber'
            : 'border-hairline-strong bg-card-alt text-muted'
          }`}>
            {article.status === 'draft' && "This is a draft — only you can see it until you submit it for review."}
            {article.status === 'pending' && 'This article is awaiting moderator review and is only visible to you until published.'}
            {article.status === 'rejected' && (
              <>
                <span className="font-medium">Sent back for changes: </span>
                {article.rejectionReason || 'Please revise and resubmit.'}
              </>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {article.status === 'published' && (
            <div className="hidden sm:flex flex-col items-center gap-1 shrink-0 pt-1">
              <button
                onClick={() => voteOnArticle(article, 'up')}
                className={`p-2 rounded-lg border transition-colors ${upvoted ? 'border-nexus-emerald bg-nexus-emerald/10 text-nexus-emerald' : 'border-hairline text-muted hover:border-nexus-emerald/50'}`}
              >
                <ArrowUp size={16} />
              </button>
              <span className="text-sm font-semibold text-primary">{score}</span>
              <button
                onClick={() => voteOnArticle(article, 'down')}
                className={`p-2 rounded-lg border transition-colors ${downvoted ? 'border-red-400 bg-red-500/10 text-red-400' : 'border-hairline text-muted hover:border-red-400/50'}`}
              >
                <ArrowDown size={16} />
              </button>
              <button
                onClick={() => toggleBookmarkArticle(article.id)}
                className={`mt-2 p-2 rounded-lg border transition-colors ${bookmarked ? 'border-samsung-blue bg-samsung-blue/10 text-samsung-blue' : 'border-hairline text-muted hover:border-samsung-blue/50'}`}
              >
                <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="prose-wiki">
              <ReactMarkdown>{article.body}</ReactMarkdown>
            </div>

            {/* Mobile vote/bookmark row */}
            {article.status === 'published' && (
              <div className="flex sm:hidden items-center gap-3 mt-6 pt-4 border-t border-hairline">
                <button onClick={() => voteOnArticle(article, 'up')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${upvoted ? 'bg-nexus-emerald/15 text-nexus-emerald' : 'bg-card-alt text-muted'}`}>
                  <ArrowUp size={13} /> {article.upvotes.length}
                </button>
                <button onClick={() => voteOnArticle(article, 'down')} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${downvoted ? 'bg-red-500/15 text-red-400' : 'bg-card-alt text-muted'}`}>
                  <ArrowDown size={13} /> {article.downvotes.length}
                </button>
                <button onClick={() => toggleBookmarkArticle(article.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${bookmarked ? 'bg-samsung-blue/15 text-samsung-blue' : 'bg-card-alt text-muted'}`}>
                  <Bookmark size={13} fill={bookmarked ? 'currentColor' : 'none'} /> Bookmark
                </button>
              </div>
            )}

            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-6">
                {article.tags.map((t) => (
                  <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-glow/10 text-cyan-glow">#{t}</span>
                ))}
              </div>
            )}

            {/* Honest preview, not a fabricated AI summary — matches Nexus Battles' Learning Summary precedent */}
            <div className="rounded-xl border border-hairline bg-card p-4 mt-6">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={13} className="text-cyan-glow" />
                <p className="text-xs font-semibold text-primary">Quick Summary</p>
              </div>
              <p className="text-xs text-muted leading-relaxed">{article.excerpt}</p>
              <p className="text-[10px] text-faint mt-2">Full AI-generated summaries will appear here once a Gemini API key is connected.</p>
            </div>

            {(isAuthor || currentUser?.role === 'admin') && article.revisions.length > 1 && (
              <div className="mt-6">
                <button onClick={() => setRevisionsOpen((v) => !v)} className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary">
                  <History size={13} /> Revision history ({article.revisions.length})
                </button>
                {revisionsOpen && (
                  <div className="mt-2 space-y-1.5">
                    {[...article.revisions].reverse().map((rev, i) => {
                      const originalIndex = article.revisions.length - 1 - i;
                      const open = openRevisionIndex === originalIndex;
                      return (
                        <div key={originalIndex} className="rounded-lg border border-hairline bg-card-alt overflow-hidden">
                          <button
                            onClick={() => setOpenRevisionIndex(open ? null : originalIndex)}
                            className="w-full flex items-center justify-between px-3 py-2 text-left"
                          >
                            <span className="text-xs text-primary flex items-center gap-1.5"><Clock size={11} className="text-faint" /> {rev.title}</span>
                            <span className="text-[10px] text-faint">{new Date(rev.editedAt).toLocaleString()}</span>
                          </button>
                          {open && (
                            <div className="px-3 pb-3 prose-wiki text-xs max-h-64 overflow-y-auto">
                              <ReactMarkdown>{rev.body}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Comments */}
            <div className="mt-8 pt-6 border-t border-hairline">
              <h2 className="font-display font-semibold text-sm mb-4">Comments ({article.comments.length})</h2>
              <div className="space-y-3 mb-4">
                {article.comments.length === 0 && <p className="text-xs text-faint">No comments yet — start the discussion.</p>}
                {article.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-card-alt border border-hairline flex items-center justify-center text-[10px] font-semibold text-muted shrink-0">
                      {initials(c.authorName)}
                    </div>
                    <div className="min-w-0 flex-1 rounded-lg bg-card-alt px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-primary">{c.authorName}</p>
                        <p className="text-[10px] text-faint">{c.createdDate}</p>
                      </div>
                      <p className="text-xs text-muted mt-1">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              {article.status === 'published' ? (
                <form onSubmit={submitComment} className="flex items-center gap-2">
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-full bg-card-alt border border-hairline px-4 py-2 text-xs text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                  />
                  <button type="submit" className="p-2.5 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white transition-colors">
                    <Send size={13} />
                  </button>
                </form>
              ) : (
                <p className="text-xs text-faint">Comments open once this article is published.</p>
              )}
            </div>

            {related.length > 0 && (
              <div className="mt-8 pt-6 border-t border-hairline">
                <h2 className="font-display font-semibold text-sm mb-4">Related Articles</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {related.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onOpenRelated(r)}
                      className="text-left rounded-xl border border-hairline bg-card p-3.5 hover:border-hairline-strong transition-colors"
                    >
                      <p className="text-[10px] text-faint mb-1">{r.category}</p>
                      <p className="text-sm font-medium text-primary line-clamp-2">{r.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {profileModalOpen && authorUser && (
        <ViewProfileModal user={authorUser} onClose={() => setProfileModalOpen(false)} />
      )}
    </div>
  );
}
