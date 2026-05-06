import { useState, useCallback } from 'react';
import type { QuizMode } from '../data/types';
import type { QuizQuestion, QuizAnswer } from '../quiz/questionTypes';
import type { DamageQuestion, SpeedQuestion } from '../quiz/questionTypes';
import { generateDamageQuestion, generateSpeedQuestion, checkDamageAnswer, checkSpeedAnswer, saveHighScore } from '../quiz/engine';
import type { QuizDataSource } from '../quiz/engine';

const TOTAL_QUESTIONS = 10;

type QuizState = 'idle' | 'playing' | 'answered' | 'results';

interface UseQuizSessionReturn {
  state: QuizState;
  mode: QuizMode | null;
  currentQuestion: QuizQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  answers: QuizAnswer[];
  loading: boolean;
  startSession: (mode: QuizMode) => Promise<void>;
  submitDamageAnswer: (index: number) => void;
  submitSpeedAnswer: (order: number[]) => void;
  nextQuestion: () => Promise<void>;
  reset: () => void;
}

export function useQuizSession(dataSource: QuizDataSource | null): UseQuizSessionReturn {
  const [state, setState] = useState<QuizState>('idle');
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const generateQuestion = useCallback(async (quizMode: QuizMode): Promise<QuizQuestion | null> => {
    if (!dataSource) return null;
    if (quizMode === 'damage') {
      return generateDamageQuestion(dataSource);
    } else {
      return generateSpeedQuestion(dataSource);
    }
  }, [dataSource]);

  const startSession = useCallback(async (quizMode: QuizMode) => {
    setLoading(true);
    setMode(quizMode);
    setAnswers([]);
    setScore(0);
    setCurrentIndex(0);
    setQuestions([]);

    const q = await generateQuestion(quizMode);
    if (q) {
      setQuestions([q]);
      setState('playing');
    }
    setLoading(false);
  }, [generateQuestion]);

  const submitDamageAnswer = useCallback((selectedIndex: number) => {
    const question = questions[currentIndex] as DamageQuestion;
    if (!question) return;

    const answer = checkDamageAnswer(question, selectedIndex);
    setAnswers((prev) => [...prev, answer]);
    setScore((prev) => prev + answer.pointsEarned);
    setState('answered');
  }, [questions, currentIndex]);

  const submitSpeedAnswer = useCallback((userOrder: number[]) => {
    const question = questions[currentIndex] as SpeedQuestion;
    if (!question) return;

    const answer = checkSpeedAnswer(question, userOrder);
    setAnswers((prev) => [...prev, answer]);
    setScore((prev) => prev + answer.pointsEarned);
    setState('answered');
  }, [questions, currentIndex]);

  const nextQuestion = useCallback(async () => {
    const nextIdx = currentIndex + 1;

    if (nextIdx >= TOTAL_QUESTIONS) {
      // Session complete
      const finalScore = score;
      if (mode) saveHighScore(mode, finalScore);
      setState('results');
      return;
    }

    setLoading(true);
    const q = await generateQuestion(mode!);
    if (q) {
      setQuestions((prev) => [...prev, q]);
      setCurrentIndex(nextIdx);
      setState('playing');
    }
    setLoading(false);
  }, [currentIndex, score, mode, generateQuestion]);

  const reset = useCallback(() => {
    setState('idle');
    setMode(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setScore(0);
  }, []);

  return {
    state,
    mode,
    currentQuestion: questions[currentIndex] ?? null,
    currentIndex,
    totalQuestions: TOTAL_QUESTIONS,
    score,
    answers,
    loading,
    startSession,
    submitDamageAnswer,
    submitSpeedAnswer,
    nextQuestion,
    reset,
  };
}
