'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Challenge {
  customerName: string;
  numerator: number;
  denominator: number;
  slicesNeeded: number;
}

const customers = [
  '👦 Alex', '👧 Emma', '👨 Marcus', '👩 Sofia', '🧑 Jordan',
  '👴 Mr. Chen', '👵 Mrs. Garcia', '🧒 Lily'
];

const generateChallenge = (currentLevel: number): Challenge => {
  let numerator: number;
  let denominator: number;

  // Difficulty progression
  if (currentLevel <= 3) {
    // Easy: halves and quarters
    denominator = Math.random() > 0.5 ? 2 : 4;
    numerator = Math.floor(Math.random() * denominator) + 1;
  } else if (currentLevel <= 6) {
    // Medium: up to eighths
    denominator = [2, 4, 8][Math.floor(Math.random() * 3)];
    numerator = Math.floor(Math.random() * denominator) + 1;
  } else {
    // Hard: up to twelfths
    denominator = [4, 6, 8, 12][Math.floor(Math.random() * 4)];
    numerator = Math.floor(Math.random() * denominator) + 1;
  }

  // Ensure proper fraction
  if (numerator >= denominator) {
    numerator = denominator - 1;
  }
  if (numerator === 0) {
    numerator = 1;
  }

  return {
    customerName: customers[Math.floor(Math.random() * customers.length)],
    numerator,
    denominator,
    slicesNeeded: numerator,
  };
};

const FractionPizzaGame = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedSlices, setSelectedSlices] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(() => generateChallenge(1));
  const [feedback, setFeedback] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [confettiItems] = useState(() =>
    [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 0.5 + Math.random() * 0.5,
      emoji: ['🎉', '⭐', '🌟', '✨', '🎊'][Math.floor(Math.random() * 5)],
    }))
  );

  const handleSliceClick = (sliceIndex: number) => {
    if (feedback || gameCompleted) return;

    const newSelectedSlices = sliceIndex + 1;
    setSelectedSlices(newSelectedSlices);
  };

  const handleSubmit = () => {
    if (gameCompleted) return;

    setAttempts(attempts + 1);

    if (selectedSlices === currentChallenge.slicesNeeded) {
      // Correct answer!
      const points = Math.max(100 - (attempts * 20), 20); // Fewer points for more attempts
      setScore(score + points);
      setFeedback(`🎉 Perfect! ${currentChallenge.customerName} got exactly ${currentChallenge.numerator}/${currentChallenge.denominator} of the pizza!`);
      setShowConfetti(true);

      setTimeout(() => {
        if (level >= 10) {
          setGameCompleted(true);
        } else {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          setCurrentChallenge(generateChallenge(nextLevel));
          setSelectedSlices(0);
          setFeedback('');
          setShowConfetti(false);
          setAttempts(0);
        }
      }, 2000);
    } else {
      // Wrong answer
      setFeedback(`Not quite! ${currentChallenge.customerName} needs ${currentChallenge.numerator}/${currentChallenge.denominator} of the pizza. Try again!`);
      setTimeout(() => {
        setFeedback('');
      }, 2000);
    }
  };

  const handleReset = () => {
    setSelectedSlices(0);
    setFeedback('');
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setSelectedSlices(0);
    setFeedback('');
    setShowConfetti(false);
    setGameCompleted(false);
    setAttempts(0);
    setCurrentChallenge(generateChallenge(1));
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
          <h1 className="text-5xl font-bold text-purple-300 mb-6">
            Congratulations!
          </h1>
          <p className="text-2xl text-purple-200 mb-4">
            You&apos;ve mastered Fraction Pizza!
          </p>
          <div className="bg-purple-600/50 rounded-2xl p-6 mb-8 border-2 border-purple-400">
            <p className="text-4xl font-bold text-yellow-300">
              Final Score: {score} points
            </p>
          </div>
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

      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {confettiItems.map((item) => (
            <div
              key={item.id}
              className="absolute text-2xl animate-bounce"
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
              🍕 Fraction Pizza Party
            </h1>
            <p className="text-purple-200 text-lg">Help serve the right amount of pizza!</p>
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

        {/* Main Game Area */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl max-w-4xl mx-auto">
          {/* Challenge */}
          <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 rounded-2xl p-6 mb-8 border-2 border-yellow-400/50">
            <p className="text-2xl font-semibold text-yellow-300 mb-2 text-center">
              {currentChallenge.customerName} wants:
            </p>
            <p className="text-6xl font-bold text-white text-center my-4">
              {currentChallenge.numerator}/{currentChallenge.denominator}
            </p>
            <p className="text-lg text-purple-200 text-center">
              of a pizza
            </p>
          </div>

          {/* Pizza Display */}
          <div className="mb-8">
            <p className="text-xl font-semibold text-purple-200 mb-4 text-center">
              Click the pizza slices to select {currentChallenge.numerator}/{currentChallenge.denominator}:
            </p>
          <div className="flex justify-center">
            <div className="relative w-80 h-80">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Pizza base */}
                <circle cx="100" cy="100" r="90" fill="#ffcc80" stroke="#ff9800" strokeWidth="3" />

                {/* Pizza slices */}
                {[...Array(currentChallenge.denominator)].map((_, i) => {
                  const angle = (360 / currentChallenge.denominator) * i;
                  const nextAngle = (360 / currentChallenge.denominator) * (i + 1);
                  const isSelected = i < selectedSlices;

                  // Calculate slice path
                  const startX = 100 + 85 * Math.cos((angle - 90) * Math.PI / 180);
                  const startY = 100 + 85 * Math.sin((angle - 90) * Math.PI / 180);
                  const endX = 100 + 85 * Math.cos((nextAngle - 90) * Math.PI / 180);
                  const endY = 100 + 85 * Math.sin((nextAngle - 90) * Math.PI / 180);

                  const largeArc = (nextAngle - angle) > 180 ? 1 : 0;

                  const pathData = `M 100 100 L ${startX} ${startY} A 85 85 0 ${largeArc} 1 ${endX} ${endY} Z`;

                  return (
                    <g key={i}>
                      <path
                        d={pathData}
                        fill={isSelected ? '#ff6b6b' : '#ffd54f'}
                        stroke="#ff9800"
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleSliceClick(i)}
                      />
                      {/* Pepperoni decorations */}
                      {[...Array(3)].map((_, j) => {
                        const pepAngle = angle + (nextAngle - angle) / 2 + (j - 1) * 5;
                        const pepRadius = 30 + j * 15;
                        const pepX = 100 + pepRadius * Math.cos((pepAngle - 90) * Math.PI / 180);
                        const pepY = 100 + pepRadius * Math.sin((pepAngle - 90) * Math.PI / 180);
                        return (
                          <circle
                            key={j}
                            cx={pepX}
                            cy={pepY}
                            r="4"
                            fill="#c62828"
                            className="pointer-events-none"
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Center circle */}
                <circle cx="100" cy="100" r="15" fill="#ffab40" />
              </svg>
            </div>
          </div>

          {/* Selection Display */}
          <div className="text-center mt-6">
            <p className="text-xl font-semibold text-purple-200">
              Selected: <span className="text-3xl font-bold text-yellow-300">{selectedSlices}/{currentChallenge.denominator}</span>
            </p>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`text-center text-2xl font-bold mb-6 ${
            feedback.includes('Perfect')
              ? 'text-green-300 animate-bounce'
              : 'text-red-300'
          }`}>
            <p>{feedback}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleReset}
            disabled={selectedSlices === 0 || !!feedback}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105"
          >
            Reset 🔄
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedSlices === 0 || !!feedback}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105"
          >
            Serve Pizza ✓
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/50 rounded-xl p-4 border-2 border-blue-400/50">
          <p className="text-purple-200 text-center">
            💡 <strong>How to play:</strong> Click on the pizza slices to select the fraction shown, then click &quot;Serve Pizza&quot; to check your answer!
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default FractionPizzaGame;
