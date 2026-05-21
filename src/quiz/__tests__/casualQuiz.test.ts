import { describe, it, expect } from 'vitest';
import { generateCasualQuestions, checkCasualAnswer } from '../casualQuiz';

describe('Casual Quiz Core Logic (National Dex)', () => {
  it('should generate exactly 5 daily questions deterministically', () => {
    // Pass empty object since the data source is loaded statically from the National Dex JSON
    const questions1 = generateCasualQuestions({} as any, '2026-05-21');
    const questions2 = generateCasualQuestions({} as any, '2026-05-21');
    const questions3 = generateCasualQuestions({} as any, '2026-05-22');

    expect(questions1).toHaveLength(5);
    expect(questions2).toHaveLength(5);
    expect(questions3).toHaveLength(5);

    // Deterministic matching: same seed yields same questions
    expect(questions1).toEqual(questions2);

    // Different seed yields different questions
    expect(questions1).not.toEqual(questions3);
  });

  it('should guarantee that correct options have the exact target types and wrong options do not', () => {
    const questions = generateCasualQuestions({} as any, '2026-05-21');

    questions.forEach((q) => {
      expect(q.type).toBe('casual');
      expect(q.options).toHaveLength(4);
      expect(q.sprites).toHaveLength(4);
      expect(q.targetTypes.length).toBeGreaterThan(0);

      const correctMon = q.options[q.correctIndex];
      
      // The correct option must have types exactly equal to targetTypes (ignoring order)
      const sortedTarget = [...q.targetTypes].sort();
      const sortedCorrect = [...correctMon.types].sort();
      expect(sortedCorrect).toEqual(sortedTarget);

      // Verify each option has a valid sprite URL containing the official PokeAPI artwork endpoint
      q.options.forEach((opt, idx) => {
        expect(q.sprites[idx]).toContain('official-artwork');
        
        // Wrong options must NOT have the same types as correct types
        if (idx !== q.correctIndex) {
          const sortedWrong = [...opt.types].sort();
          expect(sortedWrong).not.toEqual(sortedTarget);
        }
      });
    });
  });

  it('should verify casual answers correctly and distribute appropriate points', () => {
    const questions = generateCasualQuestions({} as any, '2026-05-21');
    const firstQ = questions[0];

    // Correct answer check
    const correctAns = checkCasualAnswer(firstQ, firstQ.correctIndex);
    expect(correctAns.correct).toBe(true);
    expect(correctAns.pointsEarned).toBe(10);

    // Wrong answer check
    const wrongIdx = (firstQ.correctIndex + 1) % 4;
    const wrongAns = checkCasualAnswer(firstQ, wrongIdx);
    expect(wrongAns.correct).toBe(false);
    expect(wrongAns.pointsEarned).toBe(0);
  });

  it('should apply harder distractor logic for dual-type and mono-type questions when sufficient candidates exist', () => {
    let testedDual = false;
    let testedMono = false;

    // Test across a few dates to guarantee we hit different targets
    for (let day = 20; day <= 30; day++) {
      const questions = generateCasualQuestions({} as any, `2026-05-${day}`);
      
      questions.forEach((q) => {
        if (q.targetTypes.length === 2) {
          const [t1, t2] = q.targetTypes;
          
          const allShareOneTargetType = q.options.every((opt) => opt.types.includes(t1) || opt.types.includes(t2));
          if (allShareOneTargetType) {
            const allShareT1 = q.options.every((opt) => opt.types.includes(t1));
            const allShareT2 = q.options.every((opt) => opt.types.includes(t2));
            expect(allShareT1 || allShareT2).toBe(true);
            testedDual = true;
          }
        } else if (q.targetTypes.length === 1) {
          const mono = q.targetTypes[0];
          
          const allShareMonoType = q.options.every((opt) => opt.types.includes(mono));
          if (allShareMonoType) {
            q.options.forEach((opt, idx) => {
              if (idx !== q.correctIndex) {
                expect(opt.types.length).toBe(2);
              }
            });
            testedMono = true;
          }
        }
      });
    }

    expect(testedDual).toBe(true);
    expect(testedMono).toBe(true);
  });
});
