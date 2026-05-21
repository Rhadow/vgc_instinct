import { usePokemonData } from './hooks/usePokemonData';
import { useQuizSession } from './hooks/useQuizSession';
import { useSessionHistory } from './hooks/useSessionHistory';
import { HomeScreen } from './components/HomeScreen';
import { DamageQuestionView } from './components/DamageQuestion';
import { SpeedQuestionView } from './components/SpeedQuestion';
import { ResultScreen } from './components/ResultScreen';
import type { DamageQuestion, SpeedQuestion } from './quiz/questionTypes';
import { useEffect, useRef } from 'react';
import { useWeaknessTracker } from './hooks/useWeaknessTracker';

function App() {
  const { loading, error, dataSource, pokemonCount, totalMeta } = usePokemonData();
  const { recordResult, getWeakestPokemon, weaknessMap } = useWeaknessTracker();
  const quiz = useQuizSession(dataSource, weaknessMap);
  const { stats, recordSession } = useSessionHistory();

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
    }
    if (quiz.state === 'idle') {
      recordedRef.current = false;
    }
  }, [quiz.state, quiz.mode, quiz.score, quiz.totalQuestions, quiz.metaMode, recordSession]);

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

  // Home screen
  if (quiz.state === 'idle') {
    return (
      <HomeScreen
        onStart={quiz.startSession}
        pokemonCount={pokemonCount}
        totalMeta={totalMeta}
        loading={loading || quiz.loading}
        stats={stats}
        weakestPokemon={getWeakestPokemon(5)}
        getSpriteUrl={dataSource ? dataSource.getSpriteUrl : undefined}
      />
    );
  }

  // Results screen
  if (quiz.state === 'results') {
    return (
      <ResultScreen
        score={quiz.score}
        totalQuestions={quiz.totalQuestions}
        answers={quiz.answers}
        mode={quiz.mode!}
        onRestart={() => quiz.startSession(quiz.mode!, quiz.metaMode)}
        onHome={quiz.reset}
      />
    );
  }

  // Quiz screen (playing or answered)
  return (
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
          question={quiz.currentQuestion as DamageQuestion}
          onAnswer={quiz.submitDamageAnswer}
          answered={quiz.state === 'answered'}
        />
      ) : quiz.currentQuestion?.type === 'speed' ? (
        <SpeedQuestionView
          question={quiz.currentQuestion as SpeedQuestion}
          onAnswer={quiz.submitSpeedAnswer}
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

export default App;
