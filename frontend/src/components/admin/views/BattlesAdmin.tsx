import { useState } from 'react';
import { Plus, Swords, Tags } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { DEFAULT_QUIZ_CATEGORIES } from '../../../types';

export default function BattlesAdmin() {
  const { categories, addCategory } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name || categories.includes(name)) return;
    setAdding(true);
    try {
      await addCategory(name);
      setNewCategory('');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-1">
        <Swords size={20} className="text-nexus-amber" />
        <h1 className="font-display text-2xl font-bold">Nexus Battles — Categories</h1>
      </div>
      <p className="text-sm text-muted mb-6">Manage the quiz categories available across all battle modes.</p>

      <div className="rounded-2xl border border-hairline bg-card p-5 mb-6 max-w-xs">
        <p className="text-xs text-muted">Total Categories</p>
        <p className="font-display text-2xl font-bold mt-1">{categories.length}</p>
      </div>

      <div className="rounded-2xl border border-hairline bg-card p-6">
        <form onSubmit={handleAdd} className="flex items-center gap-2 mb-5">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name (e.g. Blockchain)"
            className="flex-1 rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
          />
          <button
            type="submit"
            disabled={adding || !newCategory.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors disabled:opacity-50 shrink-0"
          >
            <Plus size={15} /> Add Category
          </button>
        </form>

        <div className="flex items-center gap-1.5 mb-3">
          <Tags size={13} className="text-faint" />
          <p className="text-xs text-muted">All categories ({categories.length})</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                (DEFAULT_QUIZ_CATEGORIES as readonly string[]).includes(c)
                  ? 'border-hairline bg-card-alt text-muted'
                  : 'border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow'
              }`}
            >
              {c}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-faint mt-4">
          Highlighted categories were added by administrators. Categories cannot be removed once alumni have played battles in them.
        </p>
      </div>
    </div>
  );
}
