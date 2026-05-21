import { useState, useCallback, useRef } from 'react';
import type { QuizMode } from '../data/types';
import type { QuizQuestion, QuizAnswer } from '../quiz/questionTypes';
import type { DamageQuestion, SpeedQuestion } from '../quiz/questionTypes';
import { generateDamageQuestion, generateSpeedQuestion, checkDamageAnswer, checkSpeedAnswer, saveHighScore } from '../quiz/engine';
import type { QuizDataSource } from '../quiz/engine';
import type { WeaknessEntry } from './useWeaknessTracker';
import { generateTypeQuestion, checkTypeAnswer } from '../quiz/typeQuiz';
import type { TypeQuestion } from '../quiz/typeQuiz';
import { generateDailyChallenge, getTodayKey } from '../quiz/dailyChallenge';

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
  startSession: (mode: QuizMode, metaMode?: boolean) => Promise<void>;
  submitDamageAnswer: (index: number) => void;
  submitSpeedAnswer: (order: number[]) => void;
  submitTypeAnswer: (index: number) => void;
  nextQuestion: () => Promise<void>;
  reset: () => void;
  dailyDateKey: string | null;
}

export function useQuizSession(
  dataSource: QuizDataSource | null,
  weaknessMap?: Record<string, WeaknessEntry>
): UseQuizSessionReturn {
  const [state, setState] = useState<QuizState>('idle');
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [metaMode, setMetaMode] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dailyDateKey, setDailyDateKey] = useState<string | null>(null);

  // Track question history to prevent repeats within a session
  const historyRef = useRef<Set<string>>(new Set());

  const generateQuestion = useCallback(async (quizMode: QuizMode, isMetaMode: boolean): Promise<QuizQuestion | null> => {
    if (!dataSource) return null;
    if (quizMode === 'damage') {
      return generateDamageQuestion(dataSource, historyRef.current, 20, isMetaMode, weaknessMap);
    } else if (quizMode === 'speed') {
      return generateSpeedQuestion(dataSource, historyRef.current, 10, isMetaMode, weaknessMap);
    } else if (quizMode === 'type') {
      return generateTypeQuestion(dataSource, historyRef.current, 20, isMetaMode);
    }
    return null;
  }, [dataSource, weaknessMap]);

  const startSession = useCallback(async (quizMode: QuizMode, isMetaMode: boolean = false) => {
    setLoading(true);
    setMode(quizMode);
    setMetaMode(isMetaMode);
    setAnswers([]);
    setScore(0);
    setCurrentIndex(0);
    setQuestions([]);
    setDailyDateKey(null);
    historyRef.current = new Set(); // Reset history for new session

    if (quizMode === 'daily') {
      if (dataSource) {
        const todayKey = getTodayKey();
        setDailyDateKey(todayKey);
        const dailyQuestions = generateDailyChallenge(dataSource, todayKey);
        if (dailyQuestions && dailyQuestions.length > 0) {
          setQuestions(dailyQuestions);
          setState('playing');
        }
      }
    } else {
      const q = await generateQuestion(quizMode, isMetaMode);
      if (q) {
        setQuestions([q]);
        setState('playing');
      }
    }
    setLoading(false);
  }, [dataSource, generateQuestion]);

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

  const submitTypeAnswer = useCallback((selectedIndex: number) => {
    const question = questions[currentIndex] as TypeQuestion;
    if (!question) return;

    const answer = checkTypeAnswer(question, selectedIndex);
    setAnswers((prev) => [...prev, answer]);
    setScore((prev) => prev + answer.pointsEarned);
    setState('answered');
  }, [questions, currentIndex]);


  const nextQuestion = useCallback(async () => {
    const nextIdx = currentIndex + 1;
    const totalQs = mode === 'daily' ? questions.length : TOTAL_QUESTIONS;

    if (nextIdx >= totalQs) {
      const finalScore = score;
      if (mode) saveHighScore(mode, finalScore);
      setState('results');
      return;
    }

    if (mode === 'daily') {
      setCurrentIndex(nextIdx);
      setState('playing');
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
  }, [currentIndex, score, mode, metaMode, questions.length, generateQuestion]);


  const reset = useCallback(() => {
    setState('idle');
    setMode(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setScore(0);
    setDailyDateKey(null);
    historyRef.current = new Set();
  }, []);

  return {
    state,
    mode,
    metaMode,
    currentQuestion: questions[currentIndex] ?? null,
    currentIndex,
    totalQuestions: mode === 'daily' ? questions.length : TOTAL_QUESTIONS,
    score,
    answers,
    loading,
    startSession,
    submitDamageAnswer,
    submitSpeedAnswer,
    submitTypeAnswer,
    nextQuestion,
    reset,
    dailyDateKey,
  };
}

