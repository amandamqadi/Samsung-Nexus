import { useEffect, useState } from 'react';
import {
  Award, BookOpen, Loader2, Search, Swords, Target, Trophy, Users, X, Zap,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { BATTLE_MODES, DIFFICULTY_LEVELS, type BattleMode, type DifficultyLevel } from '../../../types';
import LiveBattleScreen from '../battles/LiveBattleScreen';
import BattleResultsScreen from '../battles/BattleResultsScreen';

const MODE_DESCRIPTIONS: Record<BattleMode, string> = {
  'Practice': 'Solo practice — no opponent, no ranking impact.',
  'Random Match': 'Matched with any available alumnus in this category and difficulty.',
  'Challenge Friend': 'Pick a specific alumnus and challenge them directly.',
  'University Battle': 'Matched only with alumni from your university.',
  'Samsung Cohort Battle': 'Matched only with alumni from your Samsung Innovation Campus cohort.',
  'Ranked Match': 'Matched with someone close to your skill rating — affects your ranking.',
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function BattlesTab() {
  const {
    currentUser, categories, battleStats, myBattles, activeBattle, queueEntry,
    incomingChallenges, allUsers, startPractice, joinQueue, leaveQueue, sendChallenge,
    respondToChallenge,
  } = useApp();

  const [mode, setMode] = useState<BattleMode>('Random Match');
  const [category, setCategory] = useState(categories[0] ?? 'Artificial Intelligence');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Beginner');
  const [starting, setStarting] = useState(false);
  const [friendQuery, setFriendQuery] = useState('');
  const [friendTarget, setFriendTarget] = useState<string | null>(null);
  const [viewingBattleId, setViewingBattleId] = useState<string | null>(null);

  useEffect(() => {
    if (!categories.includes(category) && categories.length > 0) setCategory(categories[0]);
  }, [categories, category]);

  // Recover into a live battle after refresh, or when someone else matches us while we wait.
  useEffect(() => {
    if (activeBattle && !viewingBattleId) setViewingBattleId(activeBattle.id);
    if (queueEntry?.matchedBattleId) setViewingBattleId(queueEntry.matchedBattleId);
  }, [activeBattle, queueEntry?.matchedBattleId, viewingBattleId]);

  const viewingBattle = myBattles.find((b) => b.id === viewingBattleId) ?? null;

  if (viewingBattle && viewingBattle.status === 'active') {
    return <LiveBattleScreen battle={viewingBattle} />;
  }
  if (viewingBattle && viewingBattle.status === 'completed') {
    return <BattleResultsScreen battle={viewingBattle} onClose={() => setViewingBattleId(null)} />;
  }

  const isWaiting = queueEntry?.status === 'waiting';
  const friends = allUsers.filter((u) => u.role === 'user' && u.uid !== currentUser?.uid
    && u.name.toLowerCase().includes(friendQuery.toLowerCase()));
  const recentBattles = myBattles.filter((b) => b.status === 'completed').slice(0, 6);

  async function handlePrimaryAction() {
    setStarting(true);
    try {
      if (mode === 'Practice') {
        await startPractice(category, difficulty);
      } else if (mode === 'Challenge Friend') {
        const target = allUsers.find((u) => u.uid === friendTarget);
        if (target) await sendChallenge(target.uid, target.name, category, difficulty);
      } else {
        await joinQueue(mode, category, difficulty);
      }
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <Swords size={22} className="text-nexus-amber" />
        <h1 className="font-display text-2xl font-bold">Nexus Battles</h1>
      </div>
      <p className="text-sm text-muted mb-6">Compete. Learn. Connect. — challenge fellow alumni to live 1v1 knowledge battles.</p>

      {incomingChallenges.length > 0 && (
        <div className="space-y-2 mb-6">
          {incomingChallenges.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-nexus-amber/40 bg-nexus-amber/10 px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Zap size={16} className="text-nexus-amber shrink-0" />
                <p className="text-sm text-primary truncate">
                  <span className="font-semibold">{c.fromName}</span> challenged you to a {c.category} battle ({c.difficulty})
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => respondToChallenge(c.id, true)} className="text-xs px-3 py-1.5 rounded-full bg-nexus-emerald/15 text-nexus-emerald font-medium">Accept</button>
                <button onClick={() => respondToChallenge(c.id, false)} className="text-xs px-3 py-1.5 rounded-full bg-card border border-hairline text-muted font-medium">Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Trophy, label: 'Skill Rating', value: battleStats.skillRating, color: 'text-cyan-glow' },
          { icon: Zap, label: 'XP', value: battleStats.xp, color: 'text-nexus-amber' },
          { icon: Target, label: 'Record', value: `${battleStats.wins}W - ${battleStats.losses}L - ${battleStats.ties}T`, color: 'text-nexus-emerald' },
          { icon: Award, label: 'Badges', value: battleStats.badges.length, color: 'text-nexus-violet' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-hairline bg-card p-4">
            <Icon size={16} className={color} />
            <div className="font-display text-lg font-bold mt-2">{value}</div>
            <div className="text-[11px] text-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-hairline bg-card p-6">
        <h2 className="font-display font-semibold text-sm mb-3">Choose a Battle Mode</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-5">
          {BATTLE_MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                mode === m ? 'border-samsung-blue bg-samsung-blue/10' : 'border-hairline hover:border-hairline-strong'
              }`}
            >
              <p className={`text-sm font-semibold ${mode === m ? 'text-samsung-blue' : 'text-primary'}`}>{m}</p>
              <p className="text-[11px] text-faint mt-1 leading-snug">{MODE_DESCRIPTIONS[m]}</p>
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)} className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue">
              {DIFFICULTY_LEVELS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {mode === 'Challenge Friend' && (
          <div className="mb-5">
            <label className="block text-xs font-medium text-muted mb-1.5">Opponent</label>
            {friendTarget ? (
              <div className="flex items-center justify-between rounded-lg border border-samsung-blue/40 bg-samsung-blue/10 px-3 py-2.5">
                <span className="text-sm text-primary">{allUsers.find((u) => u.uid === friendTarget)?.name}</span>
                <button onClick={() => setFriendTarget(null)} className="text-muted hover:text-red-400"><X size={14} /></button>
              </div>
            ) : (
              <div>
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                  <input
                    value={friendQuery}
                    onChange={(e) => setFriendQuery(e.target.value)}
                    placeholder="Search alumni by name..."
                    className="w-full rounded-lg bg-card-alt border border-hairline pl-9 pr-3 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {friends.slice(0, 8).map((f) => (
                    <button key={f.uid} onClick={() => setFriendTarget(f.uid)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-card-alt text-left">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-samsung-blue to-nexus-violet flex items-center justify-center text-white text-[10px] font-semibold shrink-0">{initials(f.name)}</div>
                      <span className="text-sm text-primary">{f.name}</span>
                    </button>
                  ))}
                  {friends.length === 0 && <p className="text-xs text-faint px-2.5 py-2">No alumni found.</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {isWaiting ? (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-hairline-strong px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-muted">
              <Loader2 size={15} className="animate-spin" /> Searching for an opponent in {queueEntry?.category}...
            </span>
            <button onClick={leaveQueue} className="text-xs px-3 py-1.5 rounded-full bg-card-alt border border-hairline text-muted">Cancel</button>
          </div>
        ) : (
          <button
            onClick={handlePrimaryAction}
            disabled={starting || !!activeBattle || (mode === 'Challenge Friend' && !friendTarget)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {starting ? <Loader2 size={15} className="animate-spin" /> : <Swords size={15} />}
            {mode === 'Practice' ? 'Start Practice' : mode === 'Challenge Friend' ? 'Send Challenge' : 'Find Match'}
          </button>
        )}
      </div>

      <div className="mt-6">
        <h2 className="font-display font-semibold text-sm mb-3 flex items-center gap-2"><BookOpen size={15} className="text-cyan-glow" /> Recent Battles</h2>
        {recentBattles.length === 0 && <p className="text-xs text-faint">No battles played yet — start one above.</p>}
        <div className="space-y-2">
          {recentBattles.map((b) => {
            const me = b.players.find((p) => p.uid === currentUser?.uid);
            const opp = b.players.find((p) => p.uid !== currentUser?.uid);
            const won = b.winnerUid === currentUser?.uid;
            const tied = b.winnerUid === 'tie';
            return (
              <button
                key={b.id}
                onClick={() => setViewingBattleId(b.id)}
                className="w-full flex items-center justify-between gap-3 rounded-xl border border-hairline bg-card px-4 py-3 hover:border-hairline-strong transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Users size={14} className="text-faint shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-primary truncate">{b.category} · {b.difficulty} · {b.mode}</p>
                    <p className="text-[11px] text-faint truncate">{opp ? `vs ${opp.name}` : 'Solo practice'} · {me?.score ?? 0}/{b.questions.length}</p>
                  </div>
                </div>
                {opp && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    tied ? 'bg-nexus-amber/15 text-nexus-amber' : won ? 'bg-nexus-emerald/15 text-nexus-emerald' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {tied ? 'Tie' : won ? 'Won' : 'Lost'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
