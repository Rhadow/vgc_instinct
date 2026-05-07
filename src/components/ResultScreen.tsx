import type { QuizAnswer } from '../quiz/questionTypes';
import type { DamageQuestion } from '../quiz/questionTypes';
import { getMoveDisplayName } from '../data/moveNames';

interface ResultScreenProps {
  score: number;
  totalQuestions: number;
  answers: QuizAnswer[];
  mode: string;
  onRestart: () => void;
  onHome: () => void;
}

function getGrade(pct: number): { label: string; emoji: string; color: string } {
  if (pct >= 90) return { label: 'Master', emoji: '🏆', color: 'text-accent-amber' };
  if (pct >= 70) return { label: 'Expert', emoji: '⭐', color: 'text-accent-purple' };
  if (pct >= 50) return { label: 'Trainer', emoji: '🎯', color: 'text-accent-blue' };
  if (pct >= 30) return { label: 'Rookie', emoji: '💪', color: 'text-accent-green' };
  return { label: 'Beginner', emoji: '📚', color: 'text-text-secondary' };
}

export function ResultScreen({ score, totalQuestions, answers, mode, onRestart, onHome }: ResultScreenProps) {
  const maxScore = totalQuestions * 10;
  const pct = (score / maxScore) * 100;
  const grade = getGrade(pct);
  const correctCount = answers.filter((a) => a.correct).length;

  return (
    <div className="flex-1 flex flex-col px-4 py-8 animate-slide-up">
      {/* Score hero */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">{grade.emoji}</div>
        <h2 className={`text-3xl font-extrabold mb-1 ${grade.color}`}>
          {grade.label}
        </h2>
        <p className="text-text-secondary text-sm">
          {correctCount}/{totalQuestions} correct • {score}/{maxScore} points
        </p>
      </div>

      {/* Score bar */}
      <div className="w-full max-w-sm mx-auto mb-6">
        <div className="h-3 rounded-full bg-bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-1000 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-xs text-text-muted mt-1">{pct.toFixed(0)}%</p>
      </div>

      {/* Per-question breakdown */}
      <div className="w-full max-w-sm mx-auto mb-8 space-y-2">
        <h3 className="text-sm font-semibold text-text-secondary mb-2">Question Breakdown</h3>
        {answers.map((answer, i) => {
          const isDamage = answer.question.type === 'damage';
          const q = answer.question as DamageQuestion;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                answer.correct
                  ? 'bg-accent-green/5 border-accent-green/20'
                  : 'bg-accent-red/5 border-accent-red/20'
              }`}
            >
              <span className="text-lg">{answer.correct ? '✅' : '❌'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary truncate">
                  {isDamage
                    ? `${q.attacker.name} → ${q.defender.name} (${getMoveDisplayName(q.moveName)})`
                    : `Speed order (${answer.question.type})`
                  }
                </p>
                {isDamage && (
                  <p className="text-[10px] text-text-muted">
                    {q.correctResult.minPercent.toFixed(1)}% – {q.correctResult.maxPercent.toFixed(1)}%
                  </p>
                )}
              </div>
              <span className="text-xs font-bold text-text-secondary">
                +{answer.pointsEarned}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm mx-auto space-y-3 mt-auto">
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-accent-blue/30 active:scale-[0.98]"
        >
          Play Again ({mode === 'damage' ? '⚔️ Damage' : '⚡ Speed'})
        </button>
        <button
          onClick={onHome}
          className="w-full py-3 rounded-xl bg-bg-card border border-border text-text-secondary font-medium text-sm transition-all duration-200 hover:bg-bg-card-hover"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
