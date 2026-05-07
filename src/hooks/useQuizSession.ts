import { useState, useCallback, useRef } from 'react';
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
  metaMode: boolean;
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
  const [metaMode, setMetaMode] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  // Track question history to prevent repeats within a session
  const historyRef = useRef<Set<string>>(new Set());

  const generateQuestion = useCallback(async (quizMode: QuizMode, isMetaMode: boolean): Promise<QuizQuestion | null> => {
    if (!dataSource) return null;
    if (quizMode === 'damage') {
      return generateDamageQuestion(dataSource, historyRef.current, 20, isMetaMode);
    } else {
      return generateSpeedQuestion(dataSource, historyRef.current, 10, isMetaMode);
    }
  }, [dataSource]);

  const startSession = useCallback(async (quizMode: QuizMode, isMetaMode: boolean = false) => {
    setLoading(true);
    setMode(quizMode);
    setMetaMode(isMetaMode);
    setAnswers([]);
    setScore(0);
    setCurrentIndex(0);
    setQuestions([]);
    historyRef.current = new Set(); // Reset history for new session

    const q = await generateQuestion(quizMode, isMetaMode);
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
      const finalScore = score;
      if (mode) saveHighScore(mode, finalScore);
      setState('results');
      return;
    }

    setLoading(true);
    const q = await generateQuestion(mode!, metaMode);
    if (q) {
      setQuestions((prev) => [...prev, q]);
      setCurrentIndex(nextIdx);
      setState('playing');
    }
    setLoading(false);
  }, [currentIndex, score, mode, metaMode, generateQuestion]);

  const reset = useCallback(() => {
    setState('idle');
    setMode(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setScore(0);
    historyRef.current = new Set();
  }, []);

  return {
    state,
    mode,
    metaMode,
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
