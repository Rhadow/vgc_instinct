import { usePokemonData } from './hooks/usePokemonData';
import { useQuizSession } from './hooks/useQuizSession';
import { useSessionHistory } from './hooks/useSessionHistory';
import { HomeScreen } from './components/HomeScreen';
import { DamageQuestionView } from './components/DamageQuestion';
import { SpeedQuestionView } from './components/SpeedQuestion';
import { TypeQuestionView } from './components/TypeQuestion';
import { ResultScreen } from './components/ResultScreen';
import type { DamageQuestion, SpeedQuestion, CasualQuestion } from './quiz/questionTypes';
import type { TypeQuestion } from './quiz/typeQuiz';
import { CasualQuestionView } from './components/CasualQuestion';
import { useEffect, useRef, useMemo } from 'react';
import { useWeaknessTracker } from './hooks/useWeaknessTracker';
import { useDailyChallenge } from './hooks/useDailyChallenge';
import { useCasualChallenge, getTodayKey } from './hooks/useCasualChallenge';
import { generateCasualQuestions, checkCasualAnswer } from './quiz/casualQuiz';
import { useAchievements } from './hooks/useAchievements';
import type { AchievementContext } from './hooks/useAchievements';
import { AchievementToast } from './components/AchievementToast';
import type { QuizMode } from './data/types';

function App() {
  const { loading, error, dataSource, pokemonCount, totalMeta } = usePokemonData();
  const { recordResult, getWeakestPokemon, weaknessMap } = useWeaknessTracker();
  const quiz = useQuizSession(dataSource, weaknessMap);
  const { stats, history, recordSession } = useSessionHistory();

  const daily = useDailyChallenge();
  const { saveDailyResult } = daily;
  const casual = useCasualChallenge();

  // Compute achievement context dynamically
  const achievementContext = useMemo((): AchievementContext => {
    const damageHighScoreCount = history.filter(
      (r) => r.mode === 'damage' && r.totalQuestions > 0 && r.score >= r.totalQuestions * 8
    ).length;
    const speedHighScoreCount = history.filter(
      (r) => r.mode === 'speed' && r.totalQuestions > 0 && r.score >= r.totalQuestions * 8
    ).length;
    const typeHighScoreCount = history.filter(
      (r) => r.mode === 'type' && r.totalQuestions > 0 && r.score >= r.totalQuestions * 8
    ).length;
    const hasPerfectScore = history.some(
      (r) => r.totalQuestions > 0 && r.score === r.totalQuestions * 10
    );

    return {
      totalSessions: stats.totalSessions,
      currentStreak: stats.currentStreak,
      damageBest: stats.damageBest,
      speedBest: stats.speedBest,
      dailyStreak: daily.dailyStreak,
      weaknessEntryCount: Object.keys(weaknessMap).length,
      damageHighScoreCount,
      speedHighScoreCount,
      typeHighScoreCount,
      hasPerfectScore,
    };
  }, [stats, daily.dailyStreak, weaknessMap, history]);

  const achievements = useAchievements(achievementContext);

  // Record weakness results when answers change
  const processedAnswersRef = useRef<number>(0);
  useEffect(() => {
    if (quiz.answers.length > processedAnswersRef.current) {
      const newAnswers = quiz.answers.slice(processedAnswersRef.current);
      newAnswers.forEach((ans) => {
        const { question, correct } = ans;
        if (question.type === 'damage') {
          const dq = question as DamageQuestion;
          recordResult(dq.attacker.name, correct);
          recordResult(dq.defender.name, correct);
        } else if (question.type === 'speed') {
          const sq = question as SpeedQuestion;
          const userOrder = ans.userAnswer as number[];
          sq.pokemons.forEach((pokemon, index) => {
            const userPos = userOrder.indexOf(index);
            const correctPos = sq.correctOrder.findIndex((r) => r.pokemon.name === pokemon.name);
            const isCorrect = userPos === correctPos;
            recordResult(pokemon.name, isCorrect);
          });
        } else if (question.type === 'type') {
          const tq = question as TypeQuestion;
          recordResult(tq.defender.name, correct);
        } else if (question.type === 'casual') {
          const cq = question as CasualQuestion;
          const targetPokemonName = cq.options[cq.correctIndex].name;
          recordResult(targetPokemonName, correct);
        }
      });
      processedAnswersRef.current = quiz.answers.length;
    }
    if (quiz.state === 'idle') {
      processedAnswersRef.current = 0;
    }
  }, [quiz.answers, quiz.state, recordResult]);

  // Record session when results are shown
  const recordedRef = useRef(false);
  useEffect(() => {
    if (quiz.state === 'results' && quiz.mode && !recordedRef.current) {
      recordedRef.current = true;
      recordSession({
        mode: quiz.mode,
        score: quiz.score,
        totalQuestions: quiz.totalQuestions,
        metaMode: quiz.metaMode,
      });
      if (quiz.mode === 'daily') {
        saveDailyResult(quiz.score, quiz.totalQuestions, quiz.dailyDateKey || undefined);
      } else if (quiz.mode === 'casual') {
        casual.saveCasualResult(
          quiz.score,
          quiz.totalQuestions,
          quiz.answers.map((ans) => ans.userAnswer as number),
          quiz.dailyDateKey || undefined
        );
      }
    }
    if (quiz.state === 'idle') {
      recordedRef.current = false;
    }
  }, [quiz.state, quiz.mode, quiz.score, quiz.totalQuestions, quiz.metaMode, quiz.dailyDateKey, recordSession, saveDailyResult]);

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-accent-red font-semibold mb-2">Something went wrong</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  let content;

  const handleStartSession = async (mode: QuizMode, metaMode: boolean = false) => {
    if (mode === 'casual' && casual.isTodayComplete && casual.todayAnswers && dataSource) {
      const todayKey = getTodayKey();
      const qs = generateCasualQuestions(dataSource, todayKey);
      if (qs && qs.length > 0) {
        const ans = qs.map((q, idx) => checkCasualAnswer(q, casual.todayAnswers![idx]));
        quiz.restoreSession('casual', qs, ans, casual.todayScore || 0, todayKey);
      }
      return;
    }
    await quiz.startSession(mode, metaMode);
  };

  if (quiz.state === 'idle') {
    content = (
      <HomeScreen
        onStart={handleStartSession}
        pokemonCount={pokemonCount}
        totalMeta={totalMeta}
        loading={loading || quiz.loading}
        stats={stats}
        weakestPokemon={getWeakestPokemon(5)}
        getSpriteUrl={dataSource ? dataSource.getSpriteUrl : undefined}
        daily={daily}
        casual={casual}
        achievements={achievements}
      />
    );
  } else if (quiz.state === 'results') {
    content = (
      <ResultScreen
        score={quiz.score}
        totalQuestions={quiz.totalQuestions}
        answers={quiz.answers}
        mode={quiz.mode!}
        onRestart={() => quiz.startSession(quiz.mode!, quiz.metaMode)}
        onHome={quiz.reset}
      />
    );
  } else {
    content = (
      <div className="flex-1 flex flex-col px-4 py-4 max-w-lg mx-auto w-full">
        {/* Top bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={quiz.reset}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              ← Home
            </button>
            <span className="text-[11px] text-text-muted">
              {quiz.currentIndex + 1} / {quiz.totalQuestions}
            </span>
            <span className="text-xs font-bold text-accent-blue tabular-nums">
              {quiz.score} pts
            </span>
          </div>
          <div className="h-1 rounded-full bg-bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-300"
              style={{ width: `${((quiz.currentIndex + 1) / quiz.totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Loading state */}
        {quiz.loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mx-auto" />
              <p className="text-text-muted text-xs">Generating question…</p>
            </div>
          </div>
        ) : quiz.currentQuestion?.type === 'damage' ? (
          <DamageQuestionView
            key={quiz.currentIndex}
            question={quiz.currentQuestion as DamageQuestion}
            onAnswer={quiz.submitDamageAnswer}
            answered={quiz.state === 'answered'}
          />
        ) : quiz.currentQuestion?.type === 'speed' ? (
          <SpeedQuestionView
            key={quiz.currentIndex}
            question={quiz.currentQuestion as SpeedQuestion}
            onAnswer={quiz.submitSpeedAnswer}
            answered={quiz.state === 'answered'}
          />
        ) : quiz.currentQuestion?.type === 'type' ? (
          <TypeQuestionView
            key={quiz.currentIndex}
            question={quiz.currentQuestion as TypeQuestion}
            onAnswer={quiz.submitTypeAnswer}
            answered={quiz.state === 'answered'}
          />
        ) : quiz.currentQuestion?.type === 'casual' ? (
          <CasualQuestionView
            key={quiz.currentIndex}
            question={quiz.currentQuestion as CasualQuestion}
            onAnswer={quiz.submitCasualAnswer}
            answered={quiz.state === 'answered'}
          />
        ) : null}

        {/* Next button */}
        {quiz.state === 'answered' && (
          <div className="mt-6 mb-4">
            <button
              onClick={quiz.nextQuestion}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-accent-blue/30 active:scale-[0.98]"
            >
              {quiz.currentIndex + 1 >= quiz.totalQuestions ? 'See Results' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <AchievementToast badges={achievements.newlyUnlocked} onDismiss={achievements.clearNewlyUnlocked} />
      {content}
    </>
  );
}

export default App;
