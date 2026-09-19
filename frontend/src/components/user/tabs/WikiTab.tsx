import { useMemo, useState } from 'react';
import { BookOpen, FolderPlus, Search, Sparkles, TrendingUp } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { WIKI_CATEGORIES } from '../../../types';
import type { WikiArticle } from '../../../types';
import ArticleCard from '../wiki/ArticleCard';
import ArticleDetail from '../wiki/ArticleDetail';
import ArticleEditor from '../wiki/ArticleEditor';
import MyArticles from '../wiki/MyArticles';

type ViewMode = 'browse' | 'detail' | 'editor' | 'mine';

const TRENDING_WINDOW_DAYS = 14;

export default function WikiTab() {
  const { wikiArticles, myWikiArticles, profile } = useApp();
  const [mode, setMode] = useState<ViewMode>('browse');
  const [originMode, setOriginMode] = useState<'browse' | 'mine'>('browse');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Published articles are visible to everyone via wikiArticles; a non-published article
  // (draft/pending/rejected) is only visible here to its own author, via myWikiArticles.
  const selectedArticle = wikiArticles.find((a) => a.id === selectedId)
    ?? myWikiArticles.find((a) => a.id === selectedId)
    ?? null;

  const featured = useMemo(() => wikiArticles.filter((a) => a.featured).slice(0, 3), [wikiArticles]);

  const trending = useMemo(() => {
    const cutoff = Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return [...wikiArticles]
      .filter((a) => (a.publishedAt?.toMillis() ?? 0) >= cutoff)
      .map((a) => ({
        article: a,
        score: (a.upvotes.length - a.downvotes.length) * 3 + a.comments.length * 2 + a.viewCount * 0.1,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((r) => r.article);
  }, [wikiArticles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return wikiArticles.filter((a) => {
      const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
      const matchesQuery = !q
        || a.title.toLowerCase().includes(q)
        || a.excerpt.toLowerCase().includes(q)
        || a.tags.some((t) => t.toLowerCase().includes(q))
        || a.authorName.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [wikiArticles, query, categoryFilter]);

  function openArticle(article: WikiArticle) {
    if (mode === 'browse' || mode === 'mine') setOriginMode(mode);
    setSelectedId(article.id);
    setMode('detail');
  }

  function backToBrowse() {
    setMode('browse');
    setSelectedId(null);
    setEditingId(null);
  }

  if (mode === 'editor') {
    return (
      <ArticleEditor
        articleId={editingId}
        onClose={() => setMode(originMode)}
        onSubmitted={(id) => { setSelectedId(id); setOriginMode('mine'); setMode('mine'); }}
      />
    );
  }

  if (mode === 'detail' && selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        onBack={() => setMode(originMode)}
        onEdit={(id) => { setEditingId(id); setMode('editor'); }}
        onOpenRelated={openArticle}
      />
    );
  }

  if (mode === 'mine') {
    return (
      <MyArticles
        onBack={backToBrowse}
        onOpen={openArticle}
        onNew={() => { setEditingId(null); setOriginMode('mine'); setMode('editor'); }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={20} className="text-cyan-glow" />
            <h1 className="font-display text-2xl font-bold">Nexus Wiki</h1>
          </div>
          <p className="text-sm text-muted">The institutional memory of Samsung Innovation Campus — knowledge that outlives graduation</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setMode('mine')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-hairline-strong text-primary text-sm font-semibold hover:bg-card-alt transition-colors"
          >
            My Articles
          </button>
          <button
            onClick={() => { setEditingId(null); setOriginMode('browse'); setMode('editor'); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors"
          >
            <FolderPlus size={15} /> Write Article
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, tags, authors..."
            className="w-full rounded-lg bg-card border border-hairline pl-9 pr-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg bg-card border border-hairline px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue"
        >
          <option value="All">All categories</option>
          {WIKI_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {featured.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-sm mb-3 flex items-center gap-1.5"><Sparkles size={15} className="text-nexus-amber" /> Featured</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((a) => (
              <ArticleCard key={a.id} article={a} onOpen={() => openArticle(a)} bookmarked={profile.bookmarkedArticleIds.includes(a.id)} />
            ))}
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-sm mb-3 flex items-center gap-1.5"><TrendingUp size={15} className="text-cyan-glow" /> Trending</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trending.map((a) => (
              <ArticleCard key={a.id} article={a} onOpen={() => openArticle(a)} bookmarked={profile.bookmarkedArticleIds.includes(a.id)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display font-semibold text-sm mb-3">
          {categoryFilter === 'All' ? 'All Articles' : categoryFilter} ({filtered.length})
        </h2>
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-hairline-strong p-10 text-center">
            <BookOpen size={22} className="text-faint mx-auto mb-3" />
            <p className="text-sm text-muted">
              {wikiArticles.length === 0 ? 'No published articles yet — be the first to share your knowledge.' : 'No articles match your search or filters.'}
            </p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} onOpen={() => openArticle(a)} bookmarked={profile.bookmarkedArticleIds.includes(a.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
