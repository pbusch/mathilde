'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(() => generateChallenge(1));
  const [availableNumbers, setAvailableNumbers] = useState<number[]>(() => currentChallenge.numbers);
  const [selectedNum1, setSelectedNum1] = useState<number | null>(null);
  const [selectedNum2, setSelectedNum2] = useState<number | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [calculationHistory, setCalculationHistory] = useState<CalculationStep[]>([]);
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [attempts, setAttempts] = useState(0);
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

    const result = calculateResult(selectedNum1, selectedNum2, selectedOperation);

    if (result === null) {
      setFeedback('❌ Invalid operation! Division must result in a whole number.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }

    // Add to calculation history
    const step: CalculationStep = {
      num1: selectedNum1,
      num2: selectedNum2,
      operation: selectedOperation,
      result,
    };
    setCalculationHistory([...calculationHistory, step]);

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
    setCurrentResult(result);

    // Reset selection
    setSelectedNum1(null);
    setSelectedNum2(null);
    setSelectedOperation(null);

    // Check if target reached
    if (result === currentChallenge.target) {
      checkWin();
    }
  };

  const checkWin = () => {
    setAttempts(attempts + 1);
    const points = Math.max(200 - calculationHistory.length * 30, 100);
    setScore(score + points);
    setFeedback(`🎉 Excellent! You reached ${currentChallenge.target}!`);
    setShowCelebration(true);

    setTimeout(() => {
      if (level >= 10) {
        setGameCompleted(true);
      } else {
        const nextLevel = level + 1;
        const newChallenge = generateChallenge(nextLevel);
        setLevel(nextLevel);
        setCurrentChallenge(newChallenge);
        setAvailableNumbers(newChallenge.numbers);
        setCalculationHistory([]);
        setCurrentResult(null);
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
    // Check if current result equals target
    if (currentResult === currentChallenge.target) {
      checkWin();
    } else if (availableNumbers.includes(currentChallenge.target)) {
      // Target is in available numbers
      checkWin();
    } else {
      setFeedback('❌ Not quite! Keep calculating to reach the target.');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleReset = () => {
    setAvailableNumbers(currentChallenge.numbers);
    setCalculationHistory([]);
    setCurrentResult(null);
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
    setCalculationHistory([]);
    setCurrentResult(null);
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Number Master!
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            You&apos;ve mastered the Number Target game!
          </p>
          <div className="bg-purple-100 rounded-2xl p-6 mb-8">
            <p className="text-4xl font-bold text-purple-600">
              Final Score: {score} points
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-colors text-lg"
            >
              🔄 Play Again
            </button>
            <Link
              href="/"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-colors text-lg"
            >
              🏝️ Back to Islands
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Celebration */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {celebrationItems.map((item) => (
            <div
              key={item.id}
              className="absolute text-3xl animate-bounce"
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-5xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">🎯 Number Target</h1>
            <p className="text-gray-600 mt-2">Use the numbers to reach the target!</p>
          </div>
          <div className="text-right">
            <div className="bg-purple-100 rounded-2xl px-6 py-3 mb-2">
              <p className="text-sm text-purple-600 font-semibold">Level</p>
              <p className="text-3xl font-bold text-purple-600">{level}/10</p>
            </div>
            <div className="bg-yellow-100 rounded-2xl px-6 py-3">
              <p className="text-sm text-yellow-600 font-semibold">Score</p>
              <p className="text-2xl font-bold text-yellow-600">{score}</p>
            </div>
          </div>
        </div>

        {/* Target Display */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 mb-6">
          <p className="text-xl font-semibold text-gray-800 text-center mb-2">
            🎯 Reach this target number:
          </p>
          <p className="text-7xl font-bold text-purple-600 text-center">
            {currentChallenge.target}
          </p>
        </div>

        {/* Available Numbers */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-700 mb-3 text-center">
            Available Numbers:
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {availableNumbers.map((num, idx) => (
              <button
                key={`${num}-${idx}`}
                onClick={() => handleNumberClick(num)}
                disabled={!!feedback}
                className={`w-20 h-20 rounded-2xl font-bold text-2xl transition-all shadow-lg hover:scale-110 disabled:cursor-not-allowed ${
                  selectedNum1 === num || selectedNum2 === num
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white scale-110 ring-4 ring-yellow-300'
                    : 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Operations */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-700 mb-3 text-center">
            Choose an operation:
          </p>
          <div className="flex justify-center gap-3">
            {operations.map((op) => (
              <button
                key={op}
                onClick={() => handleOperationClick(op)}
                disabled={selectedNum1 === null || !!feedback}
                className={`w-16 h-16 rounded-xl font-bold text-3xl transition-all shadow-lg hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed ${
                  selectedOperation === op
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white scale-110 ring-4 ring-green-300'
                    : 'bg-gradient-to-br from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600'
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Current Calculation Display */}
        {selectedNum1 !== null && (
          <div className="bg-gray-100 rounded-2xl p-4 mb-6">
            <p className="text-center text-2xl font-bold text-gray-700">
              {selectedNum1}
              {selectedOperation && ` ${selectedOperation}`}
              {selectedNum2 !== null && ` ${selectedNum2}`}
              {selectedNum1 !== null && selectedNum2 !== null && selectedOperation &&
                ` = ${calculateResult(selectedNum1, selectedNum2, selectedOperation) ?? '❌'}`}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={handleCalculate}
            disabled={selectedNum1 === null || selectedNum2 === null || selectedOperation === null || !!feedback}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all text-lg"
          >
            ➕ Calculate
          </button>
          <button
            onClick={handleSubmit}
            disabled={currentResult === null || !!feedback}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all text-lg"
          >
            ✓ Submit
          </button>
          <button
            onClick={handleReset}
            disabled={calculationHistory.length === 0 || !!feedback}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all"
          >
            🔄 Reset
          </button>
          <Link
            href="/"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all"
          >
            ← Exit
          </Link>
        </div>

        {/* Calculation History */}
        {calculationHistory.length > 0 && (
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-700 mb-3 text-center">
              Your Calculations:
            </p>
            <div className="bg-indigo-50 rounded-2xl p-4 max-h-32 overflow-y-auto">
              {calculationHistory.map((step, idx) => (
                <div key={idx} className="text-center text-lg text-gray-700 mb-2">
                  {step.num1} {step.operation} {step.num2} = <span className="font-bold text-indigo-600">{step.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            className={`text-center p-4 rounded-2xl mb-6 ${
              feedback.includes('Excellent') || feedback.includes('🎉')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <p className="text-xl font-semibold">{feedback}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-purple-50 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>How to play:</strong> Select two numbers, choose an operation (+, -, ×, ÷), and click Calculate.
            Keep combining numbers until you reach the target. Click Submit when you&apos;ve reached it!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NumberTargetGame;
