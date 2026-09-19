import { useState } from 'react';
import { Star, Wrench, X } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function SkillsSection() {
  const { profile, addProfileEntry, removeProfileEntry, toggleSkillPin, showToast } = useApp();
  const [input, setInput] = useState('');
  const pinnedCount = profile.skills.filter((s) => s.pinned).length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    try {
      await addProfileEntry('skills', { name, pinned: false });
      setInput('');
    } catch (err) {
      console.error('failed to add skill', err);
      showToast('Could not save — please try again');
    }
  }

  return (
    <div className="border-t border-hairline pt-5">
      <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-1">
        <Wrench size={15} className="text-cyan-glow" /> Skills
      </h3>
      <p className="text-xs text-muted mb-3">Pin up to three skills for maximum visibility on your profile.</p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Python, Firebase, UX Research"
          className="flex-1 rounded-lg bg-card-alt border border-hairline px-3 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
        />
        <button type="submit" className="px-3.5 py-2 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-xs font-semibold transition-colors">
          Add
        </button>
      </form>

      {profile.skills.length === 0 && <p className="text-xs text-faint">No skills added yet.</p>}
      <div className="flex flex-wrap gap-2">
        {profile.skills.map((s) => (
          <span
            key={s.id}
            className={`group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              s.pinned ? 'border-cyan-glow/50 bg-cyan-glow/10 text-cyan-glow' : 'border-hairline text-muted'
            }`}
          >
            {s.name}
            <button
              onClick={() => toggleSkillPin(s.id)}
              disabled={!s.pinned && pinnedCount >= 3}
              className={`p-0.5 rounded-full hover:bg-card disabled:opacity-30 ${s.pinned ? 'text-cyan-glow' : 'text-faint'}`}
              aria-label={s.pinned ? 'Unpin skill' : 'Pin skill'}
              title={!s.pinned && pinnedCount >= 3 ? 'You can only pin 3 skills' : s.pinned ? 'Unpin' : 'Pin to top'}
            >
              <Star size={11} fill={s.pinned ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => removeProfileEntry('skills', s.id)}
              className="p-0.5 rounded-full text-faint hover:text-red-400 hover:bg-card"
              aria-label="Remove skill"
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
