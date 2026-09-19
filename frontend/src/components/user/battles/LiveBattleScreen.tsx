import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Swords, XCircle, Zap } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { Battle } from '../../../types';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function LiveBattleScreen({ battle }: { battle: Battle }) {
  const { currentUser, submitBattleAnswer, exitBattle } = useApp();
  const myIndex = battle.players.findIndex((p) => p.uid === currentUser?.uid);
  const me = battle.players[myIndex];
  const opponent = battle.players.find((p) => p.uid !== currentUser?.uid) ?? null;

  const currentQuestionIndex = useMemo(() => {
    const idx = me?.answers.findIndex((a) => a === null) ?? -1;
    return idx === -1 ? battle.questions.length - 1 : idx;
  }, [me?.answers, battle.questions.length]);

  const question = battle.questions[currentQuestionIndex];
  const alreadyAnswered = me?.answers[currentQuestionIndex] != null;
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(battle.questionSeconds);

  useEffect(() => {
    setSelected(null);
    setSecondsLeft(battle.questionSeconds);
  }, [currentQuestionIndex, battle.questionSeconds]);

  useEffect(() => {
    if (alreadyAnswered) return;
    if (secondsLeft <= 0) {
      submitBattleAnswer(battle.id, currentQuestionIndex, -1);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, alreadyAnswered, battle.id, currentQuestionIndex, submitBattleAnswer]);

  if (!me || !question) return null;

  async function handleAnswer(optionIndex: number) {
    if (alreadyAnswered || submitting) return;
    setSelected(optionIndex);
    setSubmitting(true);
    try {
      await submitBattleAnswer(battle.id, currentQuestionIndex, optionIndex);
    } finally {
      setSubmitting(false);
    }
  }

  const answeredCount = me.answers.filter((a) => a !== null).length;

  return (
    <div className="fixed inset-0 z-[80] bg-surface overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Swords size={18} className="text-nexus-amber" />
            <span className="font-display font-bold text-sm">NEXUS BATTLE</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-card-alt border border-hairline text-muted">{battle.mode}</span>
          </div>
          <button onClick={exitBattle} className="text-xs text-faint hover:text-red-400 transition-colors">
            Forfeit remaining questions
          </button>
        </div>

        {/* Live score panel */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-cyan-glow/40 bg-cyan-glow/5 p-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-samsung-blue to-cyan-glow flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {initials(me.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary truncate">{me.name} (You)</p>
                <p className="text-[11px] text-faint">{answeredCount}/{battle.questions.length} answered</p>
              </div>
            </div>
            <div className="font-display text-3xl font-bold text-cyan-glow mt-3">{me.score}</div>
          </div>

          {opponent ? (
            <div className="rounded-2xl border border-hairline bg-card p-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-nexus-violet to-samsung-blue flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {initials(opponent.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-primary truncate">{opponent.name}</p>
                  <p className="text-[11px] text-faint">
                    {opponent.answers.filter((a) => a !== null).length}/{battle.questions.length} answered
                    {opponent.finishedAt && ' · Finished'}
                  </p>
                </div>
              </div>
              <div className="font-display text-3xl font-bold text-primary mt-3">{opponent.score}</div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-hairline-strong p-4 flex items-center justify-center text-center">
              <p className="text-xs text-faint">Practice mode — no opponent</p>
            </div>
          )}
        </div>

        {/* Progress + timer */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted">Question {currentQuestionIndex + 1} of {battle.questions.length}</span>
          <span className={`flex items-center gap-1.5 text-xs font-semibold ${secondsLeft <= 5 ? 'text-red-400' : 'text-muted'}`}>
            <Clock size={13} /> {secondsLeft}s
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-card-alt overflow-hidden mb-6">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${secondsLeft <= 5 ? 'bg-red-400' : 'bg-samsung-blue'}`}
            style={{ width: `${(secondsLeft / battle.questionSeconds) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="rounded-2xl border border-hairline bg-card p-6 mb-4">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-card-alt border border-hairline text-muted">{question.subtopic}</span>
          <h2 className="font-display text-lg font-semibold text-primary mt-3 leading-snug">{question.question}</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrect = i === question.correctIndex;
            const revealed = alreadyAnswered || selected !== null;
            let stateClasses = 'border-hairline hover:border-hairline-strong text-primary';
            if (revealed && isCorrect) stateClasses = 'border-nexus-emerald/60 bg-nexus-emerald/10 text-nexus-emerald';
            else if (revealed && isSelected && !isCorrect) stateClasses = 'border-red-500/60 bg-red-500/10 text-red-400';
            else if (revealed) stateClasses = 'border-hairline text-faint opacity-60';

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={alreadyAnswered || submitting}
                className={`flex items-center gap-2.5 text-left rounded-xl border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-default ${stateClasses}`}
              >
                {revealed && isCorrect && <CheckCircle2 size={16} className="shrink-0" />}
                {revealed && isSelected && !isCorrect && <XCircle size={16} className="shrink-0" />}
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {alreadyAnswered && (
          <div className="flex items-center gap-2 mt-4 text-xs text-muted">
            <Zap size={13} className="text-nexus-amber" />
            {currentQuestionIndex + 1 < battle.questions.length ? 'Next question is loading...' : 'Waiting for your opponent to finish...'}
          </div>
        )}
      </div>
    </div>
  );
}
