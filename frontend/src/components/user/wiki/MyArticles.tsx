import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { WikiArticle } from '../../../types';
import ArticleCard from './ArticleCard';

export default function MyArticles({ onBack, onOpen, onNew }: {
  onBack: () => void;
  onOpen: (article: WikiArticle) => void;
  onNew: () => void;
}) {
  const { myWikiArticles, deleteWikiArticle } = useApp();

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft size={15} /> Back to Nexus Wiki
      </button>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">My Articles</h1>
          <p className="text-sm text-muted mt-1">Everything you've written — drafts, articles pending review, published work, and anything sent back for changes</p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors shrink-0"
        >
          <PlusCircle size={15} /> New Article
        </button>
      </div>

      {myWikiArticles.length === 0 && (
        <div className="rounded-2xl border border-dashed border-hairline-strong p-10 text-center">
          <p className="text-sm text-muted">You haven't written anything yet — share what you know with the network.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {myWikiArticles.map((a) => (
          <div key={a.id} className="relative group">
            <ArticleCard article={a} onOpen={() => onOpen(a)} showStatus />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${a.title}"? This cannot be undone.`)) deleteWikiArticle(a.id);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              aria-label="Delete article"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
