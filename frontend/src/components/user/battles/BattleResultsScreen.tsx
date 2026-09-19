import { useEffect, useMemo, useState } from 'react';
import {
  Award, BookOpen, Calendar, CheckCircle2, Handshake, MessageSquareQuote, Swords, Target,
  Timer, Trophy, UserPlus, Users, Zap,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { Battle, WikiArticle } from '../../../types';
import ViewProfileModal from './ViewProfileModal';

const BADGE_LABELS: Record<string, { label: string; icon: typeof Award }> = {
  first_battle: { label: 'First Battle', icon: Swords },
  first_victory: { label: 'First Victory', icon: Trophy },
  perfect_score: { label: 'Perfect Score', icon: Target },
  five_battles: { label: '5 Battles Played', icon: Award },
};

export default function BattleResultsScreen({ battle, onClose }: { battle: Battle; onClose: () => void }) {
  const {
    currentUser, battleStats, allUsers, connectWithAlumnus, followAlumnus, profile,
    requestMentorship, sendChallenge, fetchWikiArticlesByAuthor, categories,
  } = useApp();

  const me = battle.players.find((p) => p.uid === currentUser?.uid) ?? null;
  const opponent = battle.players.find((p) => p.uid !== currentUser?.uid) ?? null;
  const opponentUser = opponent ? allUsers.find((u) => u.uid === opponent.uid) : null;

  const isPractice = battle.players.length === 1;
  const won = !isPractice && battle.winnerUid === currentUser?.uid;
  const tied = battle.winnerUid === 'tie';
  const outcomeLabel = isPractice ? 'Practice complete' : tied ? "It's a tie!" : won ? 'Victory!' : 'Battle lost';

  const totalQuestions = battle.questions.length;
  const accuracy = me ? Math.round((me.score / totalQuestions) * 100) : 0;
  const responseSeconds = me?.totalTimeMs ? Math.round(me.totalTimeMs / 1000) : null;

  const ratingDelta = me ? battleStats.skillRating - me.skillRatingBefore : 0;

  // --- Real per-subtopic breakdown (no fabricated AI narrative — genuine computed stats) ---
  const subtopicBreakdown = useMemo(() => {
    if (!me) return [];
    const map = new Map<string, { correct: number; total: number }>();
    battle.questions.forEach((qn, i) => {
      const entry = map.get(qn.subtopic) ?? { correct: 0, total: 0 };
      entry.total += 1;
      if (me.answers[i] === qn.correctIndex) entry.correct += 1;
      map.set(qn.subtopic, entry);
    });
    return Array.from(map.entries()).map(([subtopic, v]) => ({
      subtopic, correct: v.correct, total: v.total, pct: Math.round((v.correct / v.total) * 100),
    })).sort((a, b) => a.pct - b.pct);
  }, [battle, me]);

  const weakest = subtopicBreakdown[0];
  const strongest = subtopicBreakdown[subtopicBreakdown.length - 1];
  // Only frame this as "performed well but struggled" when there's a genuine gap — otherwise a
  // perfect (or uniformly flat) score would get mislabeled as a weakness that doesn't exist.
  const summarySentence = weakest && strongest && weakest.pct < 100 && weakest.pct < strongest.pct
    ? `You performed well in ${battle.category} ${strongest.subtopic} (${strongest.pct}%) but struggled with ${weakest.subtopic} (${weakest.pct}%).`
    : weakest && weakest.pct === 100
      ? `Perfect run — you got every question right across all of ${battle.category} covered in this battle.`
      : subtopicBreakdown.length > 0
        ? `You scored ${accuracy}% overall on ${battle.category} (${subtopicBreakdown.map((s) => s.subtopic).join(', ')}).`
        : 'No breakdown available for this battle.';

  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);
  const [wikiLoaded, setWikiLoaded] = useState(false);
  const [wikiOpen, setWikiOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mentorshipOpen, setMentorshipOpen] = useState(false);
  const [mentorshipMessage, setMentorshipMessage] = useState('');
  const [challengeSent, setChallengeSent] = useState(false);

  useEffect(() => {
    if (wikiOpen && !wikiLoaded && opponent) {
      fetchWikiArticlesByAuthor(opponent.uid).then((articles) => {
        setWikiArticles(articles);
        setWikiLoaded(true);
      });
    }
  }, [wikiOpen, wikiLoaded, opponent, fetchWikiArticlesByAuthor]);

  const alreadyFollowing = opponent ? profile.followedUids.includes(opponent.uid) : false;

  async function handleChallengeAgain() {
    if (!opponent) return;
    await sendChallenge(opponent.uid, opponent.name, battle.category, battle.difficulty);
    setChallengeSent(true);
  }

  return (
    <div className="fixed inset-0 z-[80] bg-surface overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-3xl border border-hairline bg-gradient-to-br from-card via-card to-samsung-blue/10 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-grid opacity-[0.1] pointer-events-none" />
          <div className="relative z-10">
            <Trophy size={32} className={won ? 'text-nexus-amber mx-auto' : 'text-faint mx-auto'} />
            <h1 className="font-display text-2xl font-bold mt-3">{outcomeLabel}</h1>
            <p className="text-sm text-muted mt-1">{battle.category} · {battle.difficulty} · {battle.mode}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { icon: CheckCircle2, label: 'Score', value: `${me?.score ?? 0}/${totalQuestions}`, color: 'text-nexus-emerald' },
            { icon: Target, label: 'Accuracy', value: `${accuracy}%`, color: 'text-cyan-glow' },
            { icon: Timer, label: 'Response Time', value: responseSeconds ? `${responseSeconds}s` : '—', color: 'text-nexus-violet' },
            { icon: Zap, label: 'XP Earned', value: `+${isPractice ? 0 : 20}`, color: 'text-nexus-amber' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl border border-hairline bg-card p-4">
              <Icon size={16} className={color} />
              <div className="font-display text-lg font-bold mt-2">{value}</div>
              <div className="text-[11px] text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {!isPractice && (
          <div className="rounded-2xl border border-hairline bg-card p-5 mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Correct / Incorrect</p>
              <p className="text-sm font-semibold text-primary mt-0.5">{me?.score ?? 0} correct · {totalQuestions - (me?.score ?? 0)} incorrect</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Ranking Change</p>
              <p className={`text-sm font-semibold mt-0.5 ${ratingDelta >= 0 ? 'text-nexus-emerald' : 'text-red-400'}`}>
                {ratingDelta >= 0 ? '+' : ''}{ratingDelta} ({battleStats.skillRating} rating)
              </p>
            </div>
          </div>
        )}

        {battleStats.badges.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted mb-2">Badges Earned</p>
            <div className="flex flex-wrap gap-2">
              {battleStats.badges.map((b) => {
                const meta = BADGE_LABELS[b];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <span key={b} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-nexus-amber/10 border border-nexus-amber/30 text-nexus-amber">
                    <Icon size={13} /> {meta.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Learning Summary — real computed stats, template narrative (Gemini integration pending an API key) */}
        <div className="rounded-2xl border border-hairline bg-card p-6 mt-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={15} className="text-cyan-glow" />
            <h2 className="font-display font-semibold text-sm">Learning Summary</h2>
          </div>
          <p className="text-sm text-muted leading-relaxed">{summarySentence}</p>
          {subtopicBreakdown.length > 0 && (
            <div className="space-y-2 mt-4">
              {subtopicBreakdown.map((s) => (
                <div key={s.subtopic} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{s.subtopic}</span>
                  <span className={`font-semibold ${s.pct >= 70 ? 'text-nexus-emerald' : s.pct >= 40 ? 'text-nexus-amber' : 'text-red-400'}`}>
                    {s.correct}/{s.total} ({s.pct}%)
                  </span>
                </div>
              ))}
            </div>
          )}
          {weakest && (
            <div className="mt-4 pt-4 border-t border-hairline">
              <p className="text-xs text-muted mb-2">Recommended next steps</p>
              <ul className="text-xs text-muted space-y-1 list-disc list-inside">
                {weakest.pct < 100 ? (
                  <li>Practice Quiz: {battle.category} — {weakest.subtopic}</li>
                ) : (
                  <li>Try a harder difficulty or a new category in {battle.category} to keep building your rating</li>
                )}
                <li>Browse the Community for alumni on the {battle.category} track</li>
                <li>Check Opportunities and Events related to {battle.category}</li>
              </ul>
              {categories.length > 0 && (
                <p className="text-[11px] text-faint mt-3">
                  Full Gemini-generated guidance (Nexus Wiki articles, learning paths, mentor matches) will appear here once a Gemini API key is connected.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Networking — the point of every battle */}
        {!isPractice && opponent && opponentUser && (
          <div className="rounded-2xl border border-hairline bg-card p-6 mt-5">
            <div className="flex items-center gap-2 mb-1">
              <Handshake size={15} className="text-nexus-violet" />
              <h2 className="font-display font-semibold text-sm">Keep the connection going</h2>
            </div>
            <p className="text-xs text-muted mb-4">You just battled {opponent.name} — here's how to turn it into something more.</p>

            <div className="grid sm:grid-cols-2 gap-2.5">
              <button onClick={() => connectWithAlumnus(opponent.uid)} className="flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-lg border border-hairline hover:border-cyan-glow/50 text-primary transition-colors">
                <UserPlus size={14} className="text-cyan-glow" /> Connect
              </button>
              <button onClick={() => followAlumnus(opponent.uid)} className="flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-lg border border-hairline hover:border-cyan-glow/50 text-primary transition-colors">
                <Users size={14} className="text-cyan-glow" /> {alreadyFollowing ? 'Following' : 'Follow Profile'}
              </button>
              <button onClick={() => setProfileModalOpen(true)} className="flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-lg border border-hairline hover:border-cyan-glow/50 text-primary transition-colors">
                <Award size={14} className="text-cyan-glow" /> View Innovation Passport
              </button>
              <button onClick={() => setWikiOpen(true)} className="flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-lg border border-hairline hover:border-cyan-glow/50 text-primary transition-colors">
                <BookOpen size={14} className="text-cyan-glow" /> Read Wiki Articles
              </button>
              <button onClick={() => setMentorshipOpen(true)} className="flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-lg border border-hairline hover:border-cyan-glow/50 text-primary transition-colors">
                <MessageSquareQuote size={14} className="text-cyan-glow" /> Request Mentorship
              </button>
              <button
                onClick={handleChallengeAgain}
                disabled={challengeSent}
                className="flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-lg border border-hairline hover:border-cyan-glow/50 text-primary transition-colors disabled:opacity-50"
              >
                <Swords size={14} className="text-nexus-amber" /> {challengeSent ? 'Challenge Sent' : 'Challenge Again'}
              </button>
            </div>
            <button disabled className="w-full flex items-center justify-center gap-2 text-xs px-3.5 py-2.5 rounded-lg border border-dashed border-hairline-strong text-faint mt-2.5 cursor-not-allowed">
              <Calendar size={14} /> Invite to Community — Coming soon
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors"
        >
          Back to Nexus Battles
        </button>
      </div>

      {wikiOpen && opponent && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onMouseDown={(e) => e.target === e.currentTarget && setWikiOpen(false)}>
          <div className="w-full max-w-md bg-card border border-hairline-strong rounded-2xl shadow-2xl p-6">
            <h3 className="font-display font-semibold text-primary mb-1">{opponent.name}'s Wiki Articles</h3>
            <p className="text-xs text-muted mb-4">Knowledge shared with the Samsung Nexus community</p>
            {!wikiLoaded && <p className="text-xs text-faint">Loading...</p>}
            {wikiLoaded && wikiArticles.length === 0 && (
              <p className="text-xs text-faint">{opponent.name.split(' ')[0]} hasn't published any Wiki articles yet.</p>
            )}
            {wikiArticles.map((a) => (
              <div key={a.id} className="rounded-lg border border-hairline bg-card-alt p-3 mb-2">
                <p className="text-sm font-medium text-primary">{a.title}</p>
                <p className="text-xs text-muted mt-1">{a.body}</p>
              </div>
            ))}
            <button onClick={() => setWikiOpen(false)} className="w-full mt-4 py-2 rounded-lg bg-samsung-blue text-white text-sm font-semibold">Close</button>
          </div>
        </div>
      )}

      {mentorshipOpen && opponent && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onMouseDown={(e) => e.target === e.currentTarget && setMentorshipOpen(false)}>
          <div className="w-full max-w-md bg-card border border-hairline-strong rounded-2xl shadow-2xl p-6">
            <h3 className="font-display font-semibold text-primary mb-1">Request Mentorship</h3>
            <p className="text-xs text-muted mb-4">Send {opponent.name} a short message about what you'd like guidance on.</p>
            <textarea
              value={mentorshipMessage}
              onChange={(e) => setMentorshipMessage(e.target.value)}
              rows={4}
              placeholder="Hi! I'd love your guidance on..."
              className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue resize-none mb-4"
            />
            <button
              onClick={async () => {
                await requestMentorship(opponent.uid, opponent.name, mentorshipMessage || 'Would love to connect and learn from you!');
                setMentorshipOpen(false);
                setMentorshipMessage('');
              }}
              className="w-full py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors"
            >
              Send Request
            </button>
          </div>
        </div>
      )}

      {profileModalOpen && opponentUser && (
        <ViewProfileModal user={opponentUser} onClose={() => setProfileModalOpen(false)} />
      )}
    </div>
  );
}
