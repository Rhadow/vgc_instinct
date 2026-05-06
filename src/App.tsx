import { usePokemonData } from './hooks/usePokemonData';
import { useQuizSession } from './hooks/useQuizSession';
import { HomeScreen } from './components/HomeScreen';
import { DamageQuestionView } from './components/DamageQuestion';
import { SpeedQuestionView } from './components/SpeedQuestion';
import { ResultScreen } from './components/ResultScreen';
import type { DamageQuestion, SpeedQuestion } from './quiz/questionTypes';

function App() {
  const { loading, error, dataSource, pokemonCount } = usePokemonData();
  const quiz = useQuizSession(dataSource);

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-accent-red text-lg mb-2">⚠️ Error</p>
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
        loading={loading || quiz.loading}
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
        onRestart={() => quiz.startSession(quiz.mode!)}
        onHome={quiz.reset}
      />
    );
  }

  // Quiz screen (playing or answered)
  return (
    <div className="flex-1 flex flex-col px-4 py-4 max-w-lg mx-auto w-full">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-muted">
            Question {quiz.currentIndex + 1} / {quiz.totalQuestions}
          </span>
          <span className="text-xs font-bold text-accent-blue">
            Score: {quiz.score}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-300"
            style={{ width: `${((quiz.currentIndex + 1) / quiz.totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Loading state */}
      {quiz.loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-muted text-sm animate-pulse">Generating question...</p>
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
