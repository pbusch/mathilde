'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Challenge {
  numbers: number[];
  target: number;
  usedNumbers: number[];
}

const operations = ['+', '-', '×', '÷'] as const;
type Operation = typeof operations[number];

interface CalculationSlot {
  num1: number | null;
  operation: Operation | null;
  num2: number | null;
  result: number | null;
}

interface NumberToken {
  id: string;
  value: number;
}

const createToken = (value: number): NumberToken => ({
  id:
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  value,
});

const buildTokens = (values: number[]) => values.map((value) => createToken(value));

const calculateResult = (num1: number, num2: number, op: Operation): number | null => {
  switch (op) {
    case '+':
      return num1 + num2;
    case '-':
      return num1 - num2;
    case '×':
      return num1 * num2;
    case '÷':
      if (num2 === 0 || num1 % num2 !== 0) return null;
      return num1 / num2;
    default:
      return null;
  }
};

const generateChallenge = (level: number): Challenge => {
  let numbers: number[];
  let target: number;

  // Progressive difficulty
  if (level <= 3) {
    // Easy: Small numbers (1-10), simple targets
    numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10) + 1);
    target = Math.floor(Math.random() * 20) + 10; // 10-29
  } else if (level <= 6) {
    // Medium: Mix of small and medium numbers (1-15)
    numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 15) + 1);
    target = Math.floor(Math.random() * 30) + 20; // 20-49
  } else {
    // Hard: Larger numbers (1-25)
    numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 25) + 1);
    target = Math.floor(Math.random() * 50) + 30; // 30-79
  }

  return { numbers, target, usedNumbers: [] };
};

const NumberTargetGame = () => {
  const router = useRouter();
  const COMPLETION_LEVEL = process.env.NEXT_PUBLIC_GAME_COMPLETION_LEVEL 
    ? parseInt(process.env.NEXT_PUBLIC_GAME_COMPLETION_LEVEL) 
    : 10;
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(() => generateChallenge(1));
  const [availableNumbers, setAvailableNumbers] = useState<NumberToken[]>(() => buildTokens(currentChallenge.numbers));
  const [selectedNum1, setSelectedNum1] = useState<NumberToken | null>(null);
  const [selectedNum2, setSelectedNum2] = useState<NumberToken | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [calculationSlots, setCalculationSlots] = useState<CalculationSlot[]>([
    { num1: null, operation: null, num2: null, result: null },
    { num1: null, operation: null, num2: null, result: null },
    { num1: null, operation: null, num2: null, result: null },
    { num1: null, operation: null, num2: null, result: null },
  ]);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);
  const [celebrationItems] = useState(() =>
    [...Array(40)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 0.5 + Math.random() * 0.5,
      emoji: ['🎯', '⭐', '🌟', '✨', '🎊', '🎉'][Math.floor(Math.random() * 6)],
    }))
  );

  const completeIsland = useCallback(async (finalScore: number) => {
    setSavingProgress(true);
    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          islandId: 4,  // Number Target is on Island 4
          score: finalScore 
        }),
      });

      if (response.ok) {
        setFeedback('🎉 Island Complete! Returning to the map... 🎉');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setSavingProgress(false);
    }
  }, [router]);

  const handleNumberClick = (token: NumberToken) => {
    if (feedback) return;

    if (selectedNum1 && token.id === selectedNum1.id) {
      setSelectedNum1(null);
      setSelectedOperation(null);
      return;
    }

    if (selectedNum2 && token.id === selectedNum2.id) {
      setSelectedNum2(null);
      return;
    }

    if (selectedNum1 === null) {
      setSelectedNum1(token);
      return;
    }

    if (selectedNum2 === null) {
      setSelectedNum2(token);
      return;
    }

    setSelectedNum1(token);
    setSelectedNum2(null);
    setSelectedOperation(null);
  };

  const handleOperationClick = (op: Operation) => {
    if (feedback) return;
    if (selectedNum1 !== null) {
      setSelectedOperation(op);
    }
  };

  const checkWin = useCallback(() => {
    setAttempts(attempts + 1);
    const stepsUsed = calculationSlots.filter(slot => slot.result !== null).length;
    const points = Math.max(200 - stepsUsed * 30, 100);
    const updatedScore = score + points;
    setScore(updatedScore);
    setFeedback(`🎉 Excellent! You reached ${currentChallenge.target}!`);
    setShowCelebration(true);

    setTimeout(() => {
      if (level >= COMPLETION_LEVEL) {
        setGameCompleted(true);
        completeIsland(updatedScore);
      } else {
        const nextLevel = level + 1;
        const newChallenge = generateChallenge(nextLevel);
        setLevel(nextLevel);
        setCurrentChallenge(newChallenge);
        setAvailableNumbers(buildTokens(newChallenge.numbers));
        setCalculationSlots([
          { num1: null, operation: null, num2: null, result: null },
          { num1: null, operation: null, num2: null, result: null },
          { num1: null, operation: null, num2: null, result: null },
          { num1: null, operation: null, num2: null, result: null },
        ]);
        setCurrentSlotIndex(0);
        setSelectedNum1(null);
        setSelectedNum2(null);
        setSelectedOperation(null);
        setFeedback('');
        setShowCelebration(false);
        setAttempts(0);
      }
    }, 2500);
  }, [attempts, calculationSlots, score, currentChallenge.target, level, COMPLETION_LEVEL, completeIsland]);

  const handleSubmit = () => {
    // Check if target is in available numbers
    if (availableNumbers.some((token) => token.value === currentChallenge.target)) {
      checkWin();
    } else {
      setFeedback('❌ Not quite! Keep calculating to reach the target.');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleReset = () => {
    setAvailableNumbers(buildTokens(currentChallenge.numbers));
    setCalculationSlots([
      { num1: null, operation: null, num2: null, result: null },
      { num1: null, operation: null, num2: null, result: null },
      { num1: null, operation: null, num2: null, result: null },
      { num1: null, operation: null, num2: null, result: null },
    ]);
    setCurrentSlotIndex(0);
    setSelectedNum1(null);
    setSelectedNum2(null);
    setSelectedOperation(null);
    setFeedback('');
  };

  const resetGame = () => {
    const newChallenge = generateChallenge(1);
    setLevel(1);
    setScore(0);
    setCurrentChallenge(newChallenge);
    setAvailableNumbers(buildTokens(newChallenge.numbers));
    setCalculationSlots([
      { num1: null, operation: null, num2: null, result: null },
      { num1: null, operation: null, num2: null, result: null },
      { num1: null, operation: null, num2: null, result: null },
      { num1: null, operation: null, num2: null, result: null },
    ]);
    setCurrentSlotIndex(0);
    setSelectedNum1(null);
    setSelectedNum2(null);
    setSelectedOperation(null);
    setFeedback('');
    setGameCompleted(false);
    setShowCelebration(false);
    setAttempts(0);
  };

  const pendingExpression = selectedNum1
    ? `${selectedNum1.value}${selectedOperation ? ` ${selectedOperation}` : ''}${
        selectedNum2 ? ` ${selectedNum2.value}` : ''
      }`
    : 'Choose two numbers';
  const pendingResultValue =
    selectedNum1 && selectedNum2 && selectedOperation
      ? calculateResult(selectedNum1.value, selectedNum2.value, selectedOperation)
      : null;
  const canSubmit =
    availableNumbers.some((token) => token.value === currentChallenge.target) && !feedback;
  const totalSlots = calculationSlots.length;

  useEffect(() => {
    if (!selectedNum1 || !selectedNum2 || !selectedOperation) return;
    if (feedback) return;
    if (currentSlotIndex >= totalSlots) return;

    const result = calculateResult(selectedNum1.value, selectedNum2.value, selectedOperation);

    if (result === null || result <= 0) {
      setFeedback('❌ Result must be a positive whole number.');
      setSelectedNum2(null);
      setSelectedOperation(null);
      const timeout = setTimeout(() => setFeedback(''), 2000);
      return () => clearTimeout(timeout);
    }

    setCalculationSlots((prev) => {
      const updated = [...prev];
      updated[currentSlotIndex] = {
        num1: selectedNum1.value,
        operation: selectedOperation,
        num2: selectedNum2.value,
        result,
      };
      return updated;
    });

    setAvailableNumbers((prev) => {
      const filtered = prev.filter(
        (token) => token.id !== selectedNum1.id && token.id !== selectedNum2.id
      );
      return [...filtered, createToken(result)];
    });

    setSelectedNum1(null);
    setSelectedNum2(null);
    setSelectedOperation(null);
    setCurrentSlotIndex((prev) => prev + 1);

    if (result === currentChallenge.target) {
      checkWin();
    }
  }, [
    selectedNum1,
    selectedNum2,
    selectedOperation,
    feedback,
    currentSlotIndex,
    totalSlots,
    currentChallenge.target,
    checkWin,
  ]);

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: Math.random() * 2 + 2 + 's',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-12 max-w-2xl w-full text-center border border-white/20 shadow-2xl">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <h2 className="text-5xl font-bold text-yellow-300 mb-4">Island Complete!</h2>
          <p className="text-3xl text-purple-200 mb-4">Final Score: {score}</p>
          <p className="text-2xl text-purple-300 mb-4">You&apos;ve mastered number targets!</p>
          <p className="text-xl text-purple-200 mb-8">
            {savingProgress ? 'Saving your progress... ✨' : 'The next island awaits! 🎉'}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105"
            >
              Play Again 🔄
            </button>
            <Link
              href="/"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105 inline-block"
            >
              Return to Islands 🏝️
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 2 + 2 + 's',
            }}
          />
        ))}
      </div>

      {/* Celebration */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {celebrationItems.map((item) => (
            <div
              key={item.id}
              className="absolute text-3xl animate-ping"
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-10 space-y-8 max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-purple-200/80">
              Mathador-inspired challenge
            </p>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 drop-shadow-lg">
              Number Target Lab
            </h1>
            <p className="text-purple-100/80 mt-2 max-w-2xl">
              Combine the five tool numbers directly along the tool line. Every calculation sends its result back
              into the lineup—just like in the real Mathador game.
            </p>
          </div>
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105"
          >
            ← Back to Islands
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px,1fr]">
          {/* Tool line */}
          <section className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between text-purple-100 uppercase tracking-wide text-xs">
              <div>
                <p className="text-purple-200/70">Level</p>
                <p className="text-3xl font-black text-yellow-300">{level}/10</p>
              </div>
              <div>
                <p className="text-purple-200/70">Score</p>
                <p className="text-3xl font-black text-green-300">{score}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="relative w-full max-w-[420px] h-32">
                <div className="absolute left-6 right-6 top-1/2 h-1 bg-white/15 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-evenly gap-3 px-4">
                  {availableNumbers.map((token) => {
                    const isSelected =
                      selectedNum1?.id === token.id || selectedNum2?.id === token.id;
                    return (
                      <button
                        key={token.id}
                        onClick={() => handleNumberClick(token)}
                        disabled={!!feedback}
                        className={`w-20 h-20 rounded-2xl border-2 font-extrabold text-3xl shadow-lg transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-yellow-300 to-orange-500 text-gray-900 border-yellow-100 scale-110'
                            : 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-white/20 hover:scale-105'
                        } ${feedback ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        {token.value}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="w-40 h-40 rounded-full border-4 border-yellow-200 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl flex flex-col items-center justify-center text-center text-white">
                <span className="text-[0.5rem] uppercase tracking-[0.5em] text-white/80">
                  Target
                </span>
                <span className="text-6xl font-black">{currentChallenge.target}</span>
              </div>
            </div>
            <p className="text-center text-sm text-purple-100 mt-4">
              Les outils restent alignés sur la ligne horizontale et se mettent à jour après chaque calcul validé.
            </p>

            <div className="mt-6 bg-purple-900/40 border border-white/15 rounded-2xl p-5">
              <p className="text-xs uppercase tracking-wide text-purple-200/70 mb-2">
                Current attempt
              </p>
              <p className="text-4xl font-bold text-white flex flex-wrap items-center gap-2">
                {pendingExpression}
                {selectedNum1 && selectedNum2 && selectedOperation && (
                  <>
                    <span className="text-3xl text-purple-200">=</span>
                    <span
                      className={`px-3 py-1 rounded-xl ${
                        pendingResultValue !== null
                          ? 'bg-green-500/30 text-green-100'
                          : 'bg-red-500/30 text-red-100'
                      }`}
                    >
                      {pendingResultValue ?? 'whole number required'}
                    </span>
                  </>
                )}
              </p>
              <p className="text-sm text-purple-200/80 mt-2">
                Pick two tool numbers and an operation to preview the result—valid positive results are applied automatically.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {operations.map((op, idx) => {
                const colors = [
                  'from-cyan-400 to-blue-500',
                  'from-green-400 to-emerald-500',
                  'from-pink-400 to-rose-500',
                  'from-amber-300 to-orange-500',
                ];
                return (
                  <button
                    key={op}
                    onClick={() => handleOperationClick(op)}
                    disabled={selectedNum1 === null || !!feedback}
                    className={`w-16 h-16 rounded-2xl font-bold text-3xl transition-all shadow-lg border-2 border-white/20 ${
                      selectedOperation === op
                        ? `bg-gradient-to-br ${colors[idx]} text-white scale-110 ring-4 ring-white/60`
                        : `bg-gradient-to-br ${colors[idx]} text-white/90 hover:scale-105`
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {op}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <p className="text-sm text-purple-100 text-center">
                ✅ Every valid positive result is stored automatically. Use reset if you want to try a different plan.
              </p>
              <button
                onClick={handleReset}
                className="px-8 py-3 rounded-full font-semibold text-lg bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-all"
              >
                Reset Round
              </button>
            </div>
          </section>

          {/* Calculation timeline */}
          <section className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl flex flex-col">
            <div className="flex flex-wrap gap-6 justify-between text-purple-100 text-sm uppercase tracking-wide">
              <div>
                <p className="text-purple-200/70">Attempts</p>
                <p className="text-3xl font-black">{attempts}</p>
              </div>
              <div>
                <p className="text-purple-200/70">Steps used</p>
                <p className="text-3xl font-black">
                  {calculationSlots.filter((slot) => slot.result !== null).length}/4
                </p>
              </div>
              <div>
                <p className="text-purple-200/70">Tools left</p>
                <p className="text-3xl font-black">
                  {availableNumbers.length}{' '}
                  {availableNumbers.length === 1 ? 'number' : 'numbers'}
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mt-8">Calculation timeline</h2>
            <p className="text-purple-200/80 text-sm mt-1">
              The right column mirrors the Mathador notebook: follow each calculation and reuse the resulting
              number directly on the tool line.
            </p>

            <div className="mt-6 space-y-4 flex-1 w-full">
              {calculationSlots.map((slot, idx) => {
                const isActive = idx === currentSlotIndex && !feedback;
                const expressionReady =
                  slot.num1 !== null && slot.num2 !== null && slot.operation !== null;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border-2 p-5 transition-all ${
                      slot.result !== null
                        ? 'border-emerald-400/60 bg-emerald-400/10'
                        : isActive
                        ? 'border-purple-300 bg-purple-300/10'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-purple-100/80">
                      <span>Step {idx + 1}</span>
                      <span>
                        {slot.result !== null ? 'Completed' : isActive ? 'Ready' : 'Pending'}
                      </span>
                    </div>
                    <div className="mt-3 text-3xl font-bold text-white flex flex-wrap items-center gap-2">
                      <span>{slot.num1 ?? '...'}</span>
                      <span className="text-purple-300">{slot.operation ?? '?'}</span>
                      <span>{slot.num2 ?? '...'}</span>
                      <span className="text-purple-300">=</span>
                      <span>{slot.result ?? '...'}</span>
                    </div>
                    <p className="text-sm text-purple-200/80 mt-2">
                      {slot.result !== null
                        ? 'Use this new number just like any other tool.'
                        : expressionReady
                        ? 'Tap “Validate Step” to confirm this operation.'
                        : 'Pick two numbers from the tool line to feed this step.'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold text-xl shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Submit Target
              </button>
              <div className="px-5 py-4 rounded-2xl bg-purple-900/30 border border-purple-500/40 text-center">
                <p className="text-xs uppercase tracking-wide text-purple-200/70">Goal</p>
                <p className="text-3xl font-black text-white">{currentChallenge.target}</p>
              </div>
            </div>

            {feedback && (
              <div
                className={`mt-4 text-center text-2xl font-bold ${
                  feedback.includes('Excellent') || feedback.includes('🎉')
                    ? 'text-green-300'
                    : 'text-red-300'
                }`}
              >
                {feedback}
              </div>
            )}

            <div className="mt-6 bg-blue-900/40 rounded-2xl p-5 border border-blue-400/30 text-purple-100 text-sm">
              <p>
                💡 Click two numbers from the horizontal tool line, choose an operation, and let the game auto-confirm every positive whole result. Each validated number replaces the tools you just used. Chain up to four steps to land exactly on the target—just like in Mathador/Number Target!
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NumberTargetGame;
