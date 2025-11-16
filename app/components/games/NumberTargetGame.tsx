'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Challenge {
  numbers: number[];
  target: number;
  usedNumbers: number[];
}

const operations = ['+', '-', '×', '÷'] as const;
type Operation = typeof operations[number];

interface CalculationStep {
  num1: number;
  num2: number;
  operation: Operation;
  result: number;
}

interface CalculationSlot {
  num1: number | null;
  operation: Operation | null;
  num2: number | null;
  result: number | null;
}

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
  const [availableNumbers, setAvailableNumbers] = useState<number[]>(() => currentChallenge.numbers);
  const [selectedNum1, setSelectedNum1] = useState<number | null>(null);
  const [selectedNum2, setSelectedNum2] = useState<number | null>(null);
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

  const completeIsland = async (finalScore: number) => {
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
  };

  const handleNumberClick = (num: number) => {
    if (feedback) return;

    if (selectedNum1 === null) {
      setSelectedNum1(num);
    } else if (selectedNum2 === null && num !== selectedNum1) {
      setSelectedNum2(num);
    } else if (selectedNum1 === num) {
      setSelectedNum1(null);
      setSelectedOperation(null);
    } else if (selectedNum2 === num) {
      setSelectedNum2(null);
    }
  };

  const handleOperationClick = (op: Operation) => {
    if (feedback) return;
    if (selectedNum1 !== null) {
      setSelectedOperation(op);
    }
  };

  const calculateResult = (num1: number, num2: number, op: Operation): number | null => {
    switch (op) {
      case '+':
        return num1 + num2;
      case '-':
        return num1 - num2;
      case '×':
        return num1 * num2;
      case '÷':
        // Only allow division if result is a whole number
        if (num2 === 0 || num1 % num2 !== 0) return null;
        return num1 / num2;
      default:
        return null;
    }
  };

  const handleCalculate = () => {
    if (selectedNum1 === null || selectedNum2 === null || selectedOperation === null) return;
    if (currentSlotIndex >= calculationSlots.length) return;

    const result = calculateResult(selectedNum1, selectedNum2, selectedOperation);

    if (result === null) {
      setFeedback('❌ Invalid operation! Division must result in a whole number.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }

    // Update the current calculation slot
    const newSlots = [...calculationSlots];
    newSlots[currentSlotIndex] = {
      num1: selectedNum1,
      operation: selectedOperation,
      num2: selectedNum2,
      result,
    };
    setCalculationSlots(newSlots);

    // Remove used numbers and add result
    const newAvailable = availableNumbers.filter(
      (n, idx) => {
        const firstIdx = availableNumbers.indexOf(selectedNum1);
        const secondIdx = availableNumbers.indexOf(selectedNum2, firstIdx + 1);
        return idx !== firstIdx && idx !== secondIdx;
      }
    );
    newAvailable.push(result);
    setAvailableNumbers(newAvailable);

    // Reset selection
    setSelectedNum1(null);
    setSelectedNum2(null);
    setSelectedOperation(null);

    // Move to next slot
    setCurrentSlotIndex(currentSlotIndex + 1);

    // Check if target reached
    if (result === currentChallenge.target) {
      checkWin();
    }
  };

  const checkWin = () => {
    setAttempts(attempts + 1);
    const stepsUsed = calculationSlots.filter(slot => slot.result !== null).length;
    const points = Math.max(200 - stepsUsed * 30, 100);
    setScore(score + points);
    setFeedback(`🎉 Excellent! You reached ${currentChallenge.target}!`);
    setShowCelebration(true);

    setTimeout(() => {
      if (level >= COMPLETION_LEVEL) {
        setGameCompleted(true);
        completeIsland(score + points);
      } else {
        const nextLevel = level + 1;
        const newChallenge = generateChallenge(nextLevel);
        setLevel(nextLevel);
        setCurrentChallenge(newChallenge);
        setAvailableNumbers(newChallenge.numbers);
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
  };

  const handleSubmit = () => {
    // Check if target is in available numbers
    if (availableNumbers.includes(currentChallenge.target)) {
      checkWin();
    } else {
      setFeedback('❌ Not quite! Keep calculating to reach the target.');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleReset = () => {
    setAvailableNumbers(currentChallenge.numbers);
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
    setAvailableNumbers(newChallenge.numbers);
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 mb-2 drop-shadow-lg">
              🎯 Number Target
            </h1>
            <p className="text-purple-200 text-lg">Use the numbers to reach the target!</p>
          </div>
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105"
          >
            ← Back to Islands
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-between items-center mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex gap-8">
            <div>
              <p className="text-purple-200 text-sm">Level</p>
              <p className="text-4xl font-bold text-yellow-300">{level}/10</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm">Score</p>
              <p className="text-4xl font-bold text-green-300">{score}</p>
            </div>
          </div>
        </div>

        {/* Main Game Area - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Rosace/Octagon with Numbers */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex flex-col items-center justify-center min-h-[600px]">
              {/* Octagonal Number Display */}
              <div className="relative w-96 h-96 mb-8">
                {/* Center Target */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                    <span className="text-5xl font-bold text-white">{currentChallenge.target}</span>
                  </div>
                </div>

                {/* Octagonal segments with numbers */}
                {availableNumbers.map((num, idx) => {
                  const angle = (idx * 360) / availableNumbers.length - 90;
                  const radius = 140;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  const isSelected = selectedNum1 === num || selectedNum2 === num;
                  
                  return (
                    <button
                      key={`${num}-${idx}`}
                      onClick={() => handleNumberClick(num)}
                      disabled={!!feedback}
                      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-xl font-bold text-2xl transition-all shadow-lg hover:scale-110 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white scale-110 ring-4 ring-yellow-300 z-20'
                          : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700'
                      }`}
                      style={{
                        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                      }}
                    >
                      {num}
                    </button>
                  );
                })}

                {/* Decorative octagon outline */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
                  <polygon
                    points="200,40 280,90 330,170 330,230 280,310 200,360 120,310 70,230 70,170 120,90"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="3"
                    strokeDasharray="10,5"
                  />
                </svg>
              </div>

              {/* Operation Buttons */}
              <div className="flex gap-3 mb-6">
                {operations.map((op, idx) => {
                  const colors = [
                    'from-cyan-400 to-blue-500',
                    'from-green-400 to-emerald-500', 
                    'from-pink-400 to-red-500',
                    'from-yellow-400 to-orange-500'
                  ];
                  
                  return (
                    <button
                      key={op}
                      onClick={() => handleOperationClick(op)}
                      disabled={selectedNum1 === null || !!feedback}
                      className={`w-16 h-16 rounded-xl font-bold text-3xl transition-all shadow-lg hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed ${
                        selectedOperation === op
                          ? `bg-gradient-to-br ${colors[idx]} text-white scale-110 ring-4 ring-white`
                          : `bg-gradient-to-br ${colors[idx]} text-white hover:scale-105`
                      }`}
                    >
                      {op}
                    </button>
                  );
                })}
              </div>

              {/* Current Selection Display */}
              {selectedNum1 !== null && (
                <div className="bg-purple-900/50 rounded-2xl p-4 mb-4 border-2 border-purple-400/50 w-full">
                  <p className="text-center text-2xl font-bold text-white">
                    {selectedNum1}
                    {selectedOperation && ` ${selectedOperation}`}
                    {selectedNum2 !== null && ` ${selectedNum2}`}
                    {selectedNum1 !== null && selectedNum2 !== null && selectedOperation &&
                      ` = ${calculateResult(selectedNum1, selectedNum2, selectedOperation) ?? '❌'}`}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCalculate}
                  disabled={selectedNum1 === null || selectedNum2 === null || selectedOperation === null || !!feedback}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105"
                >
                  Calculate
                </button>
                <button
                  onClick={handleReset}
                  disabled={currentSlotIndex === 0 || !!feedback}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105"
                >
                  Reset 🔄
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Calculation Slots */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-purple-200 mb-6 text-center">Calculations</h2>
            
            <div className="space-y-6">
              {calculationSlots.map((slot, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    idx === currentSlotIndex && !feedback
                      ? 'bg-purple-600/30 border-purple-400 scale-105'
                      : 'bg-purple-900/30 border-purple-600/50'
                  }`}
                >
                  {/* First Number Diamond */}
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 transform rotate-45 rounded-lg shadow-lg"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white z-10">
                        {slot.num1 ?? '?'}
                      </span>
                    </div>
                  </div>

                  {/* Operation Circle */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {slot.operation ?? '?'}
                    </span>
                  </div>

                  {/* Second Number Diamond */}
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 transform rotate-45 rounded-lg shadow-lg"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white z-10">
                        {slot.num2 ?? '?'}
                      </span>
                    </div>
                  </div>

                  {/* Equals Sign */}
                  <span className="text-3xl font-bold text-purple-300">=</span>

                  {/* Result Diamond */}
                  <div className="relative w-20 h-20">
                    <div className={`absolute inset-0 transform rotate-45 rounded-lg shadow-lg ${
                      slot.result !== null 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white z-10">
                        {slot.result ?? '?'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!availableNumbers.includes(currentChallenge.target) || !!feedback}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105"
              >
                Submit Answer ✓
              </button>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`text-center text-2xl font-bold mt-6 ${
                  feedback.includes('Excellent') || feedback.includes('🎉')
                    ? 'text-green-300 animate-bounce'
                    : 'text-red-300'
                }`}
              >
                <p>{feedback}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 bg-blue-900/50 rounded-xl p-4 border-2 border-blue-400/50">
              <p className="text-purple-200 text-sm text-center">
                💡 <strong>How to play:</strong> Click numbers from the rosace, choose an operation, and calculate. 
                The result appears in the calculation slots and returns to the rosace. 
                Reach the target number to win!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberTargetGame;
