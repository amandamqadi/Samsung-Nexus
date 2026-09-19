import { useState } from 'react';
import { ExternalLink, FolderGit2, Heart, Lock, MessageCircle, Send } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function FeedTab({ embedded = false }: { embedded?: boolean }) {
  const { feedPosts, currentUser, toggleLikePost, addComment, canInteractWithPost, connectWithAlumnus } = useApp();
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function toggleComments(postId: string) {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  }

  function submitComment(postId: string) {
    const text = drafts[postId]?.trim();
    if (!text) return;
    addComment(postId, text);
    setDrafts((prev) => ({ ...prev, [postId]: '' }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      {!embedded && (
        <>
          <h1 className="font-display text-2xl font-bold mb-1">Feed</h1>
          <p className="text-sm text-muted mb-6">New projects shared by alumni across Samsung Nexus — connect with someone to like and comment on their posts</p>
        </>
      )}

      {feedPosts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-hairline-strong p-10 text-center">
          <FolderGit2 size={22} className="text-faint mx-auto mb-3" />
          <p className="text-sm text-muted">Nothing here yet — add a project from My Projects and it'll show up in everyone's feed.</p>
        </div>
      )}

      <div className="space-y-5">
        {feedPosts.map((post) => {
          const liked = !!currentUser && post.likedBy.includes(currentUser.uid);
          const commentsOpen = openComments.has(post.id);
          const isOwnPost = post.authorId === currentUser?.uid;
          const canInteract = canInteractWithPost(post.id);
          return (
            <div key={post.id} className="rounded-2xl border border-hairline bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-samsung-blue to-nexus-violet flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {initials(post.authorName)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{post.authorName}</p>
                  <p className="text-[11px] text-faint">{post.authorTrack} · {post.createdDate}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-1.5">
                  <FolderGit2 size={14} className="text-nexus-violet shrink-0" />
                  <p className="text-sm font-semibold text-primary">{post.title}</p>
                </div>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{post.description}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {post.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-card-alt border border-hairline text-muted">{t}</span>
                  ))}
                  {post.link && (
                    <a href={post.link} target="_blank" rel="noreferrer" className="text-[11px] text-samsung-blue hover:text-cyan-glow flex items-center gap-0.5 ml-auto">
                      View <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-hairline">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  disabled={!canInteract}
                  title={canInteract ? undefined : `Connect with ${post.authorName} to like this post`}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    !canInteract ? 'text-faint cursor-not-allowed' : liked ? 'text-red-400' : 'text-muted hover:text-red-400'
                  }`}
                >
                  <Heart size={15} fill={liked ? 'currentColor' : 'none'} /> {post.likedBy.length}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary transition-colors"
                >
                  <MessageCircle size={15} /> {post.comments.length}
                </button>
                {!isOwnPost && !canInteract && (
                  <span className="flex items-center gap-1 text-[11px] text-faint ml-auto">
                    <Lock size={11} /> Connect to interact
                  </span>
                )}
              </div>

              {commentsOpen && (
                <div className="mt-3 pt-3 border-t border-hairline space-y-2.5">
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-card-alt border border-hairline flex items-center justify-center text-[9px] font-semibold text-muted shrink-0">
                        {initials(c.authorName)}
                      </div>
                      <div className="min-w-0 flex-1 rounded-lg bg-card-alt px-3 py-2">
                        <p className="text-xs font-medium text-primary">{c.authorName}</p>
                        <p className="text-xs text-muted mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  {canInteract ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitComment(post.id);
                      }}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        value={drafts[post.id] ?? ''}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Write a comment..."
                        className="flex-1 rounded-full bg-card-alt border border-hairline px-3.5 py-1.5 text-xs text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                      />
                      <button type="submit" className="p-2 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white transition-colors">
                        <Send size={13} />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-card-alt px-3 py-2 pt-1">
                      <p className="text-xs text-faint">Connect with {post.authorName} to join the conversation.</p>
                      <button
                        onClick={() => connectWithAlumnus(post.authorId)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white font-medium transition-colors shrink-0"
                      >
                        Connect
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
