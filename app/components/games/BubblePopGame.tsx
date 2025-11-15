'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Bubble {
  id: number;
  value: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocityY: number;
}

interface Challenge {
  target: number;
  bubbles: Bubble[];
}

const bubbleColors = [
  '#60a5fa', // blue
  '#34d399', // green
  '#fbbf24', // yellow
  '#f472b6', // pink
  '#a78bfa', // purple
  '#fb923c', // orange
];

const generateChallenge = (level: number): Challenge => {
  let target: number;
  let maxNumber: number;
  let bubbleCount: number;

  // Progressive difficulty
  if (level <= 3) {
    // Easy: numbers 1-10, target up to 15
    maxNumber = 10;
    target = Math.floor(Math.random() * 10) + 6; // 6-15
    bubbleCount = 6;
  } else if (level <= 6) {
    // Medium: numbers 1-20, target up to 30
    maxNumber = 20;
    target = Math.floor(Math.random() * 20) + 11; // 11-30
    bubbleCount = 8;
  } else {
    // Hard: numbers 1-30, target up to 50
    maxNumber = 30;
    target = Math.floor(Math.random() * 30) + 21; // 21-50
    bubbleCount = 10;
  }

  // Generate bubbles with at least one valid pair
  const bubbles: Bubble[] = [];

  // First, ensure at least one valid solution exists
  const firstNum = Math.floor(Math.random() * (target - 1)) + 1;
  const secondNum = target - firstNum;

  bubbles.push({
    id: 0,
    value: firstNum,
    x: Math.random() * 80 + 10,
    y: Math.random() * 60 + 20,
    size: 60 + Math.random() * 20,
    color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
    velocityY: -0.3 - Math.random() * 0.3,
  });

  bubbles.push({
    id: 1,
    value: secondNum,
    x: Math.random() * 80 + 10,
    y: Math.random() * 60 + 20,
    size: 60 + Math.random() * 20,
    color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
    velocityY: -0.3 - Math.random() * 0.3,
  });

  // Add remaining bubbles with random numbers
  for (let i = 2; i < bubbleCount; i++) {
    bubbles.push({
      id: i,
      value: Math.floor(Math.random() * maxNumber) + 1,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      size: 60 + Math.random() * 20,
      color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
      velocityY: -0.3 - Math.random() * 0.3,
    });
  }

  return { target, bubbles };
};

const BubblePopGame = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(() => generateChallenge(1));
  const [selectedBubbles, setSelectedBubbles] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');
  const [poppedBubbles, setPoppedBubbles] = useState<number[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStars] = useState(() =>
    [...Array(30)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 0.5 + Math.random() * 0.5,
    }))
  );

  // Animate bubbles floating
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChallenge((prev) => ({
        ...prev,
        bubbles: prev.bubbles.map((bubble) => {
          if (poppedBubbles.includes(bubble.id)) return bubble;

          let newY = bubble.y + bubble.velocityY;
          // Reset to bottom if bubble goes off top
          if (newY < -10) {
            newY = 110;
          }
          return { ...bubble, y: newY };
        }),
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [poppedBubbles]);

  const handleBubbleClick = (bubbleId: number) => {
    if (feedback || poppedBubbles.includes(bubbleId)) return;

    if (selectedBubbles.includes(bubbleId)) {
      // Deselect
      setSelectedBubbles(selectedBubbles.filter((id) => id !== bubbleId));
    } else if (selectedBubbles.length < 2) {
      // Select (max 2)
      const newSelection = [...selectedBubbles, bubbleId];
      setSelectedBubbles(newSelection);

      // Auto-check when 2 bubbles are selected
      if (newSelection.length === 2) {
        setTimeout(() => checkAnswer(newSelection), 300);
      }
    }
  };

  const checkAnswer = (selection: number[]) => {
    setAttempts(attempts + 1);

    const bubble1 = currentChallenge.bubbles.find((b) => b.id === selection[0]);
    const bubble2 = currentChallenge.bubbles.find((b) => b.id === selection[1]);

    if (!bubble1 || !bubble2) return;

    const sum = bubble1.value + bubble2.value;

    if (sum === currentChallenge.target) {
      // Correct!
      const points = Math.max(150 - attempts * 25, 50);
      setScore(score + points);
      setFeedback(`🎉 Perfect! ${bubble1.value} + ${bubble2.value} = ${currentChallenge.target}!`);
      setPoppedBubbles([...poppedBubbles, ...selection]);
      setShowCelebration(true);

      setTimeout(() => {
        if (level >= 10) {
          setGameCompleted(true);
        } else {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          setCurrentChallenge(generateChallenge(nextLevel));
          setSelectedBubbles([]);
          setPoppedBubbles([]);
          setFeedback('');
          setAttempts(0);
          setShowCelebration(false);
        }
      }, 2000);
    } else {
      // Wrong
      setFeedback(`❌ Oops! ${bubble1.value} + ${bubble2.value} = ${sum}, not ${currentChallenge.target}. Try again!`);
      setSelectedBubbles([]);
      setTimeout(() => {
        setFeedback('');
      }, 2000);
    }
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setSelectedBubbles([]);
    setPoppedBubbles([]);
    setFeedback('');
    setGameCompleted(false);
    setAttempts(0);
    setShowCelebration(false);
    setCurrentChallenge(generateChallenge(1));
  };

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-500 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Bubble Master!
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            You&apos;ve completed all levels!
          </p>
          <div className="bg-blue-100 rounded-2xl p-6 mb-8">
            <p className="text-4xl font-bold text-blue-600">
              Final Score: {score} points
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-colors text-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Celebration stars */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {celebrationStars.map((star) => (
            <div
              key={star.id}
              className="absolute text-3xl animate-ping"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-6xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">🫧 Bubble Pop Math</h1>
            <p className="text-gray-600 mt-2">Find two bubbles that add up to the target!</p>
          </div>
          <div className="text-right">
            <div className="bg-blue-100 rounded-2xl px-6 py-3 mb-2">
              <p className="text-sm text-blue-600 font-semibold">Level</p>
              <p className="text-3xl font-bold text-blue-600">{level}/10</p>
            </div>
            <div className="bg-yellow-100 rounded-2xl px-6 py-3">
              <p className="text-sm text-yellow-600 font-semibold">Score</p>
              <p className="text-2xl font-bold text-yellow-600">{score}</p>
            </div>
          </div>
        </div>

        {/* Target Display */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
          <p className="text-xl font-semibold text-gray-800 text-center mb-2">
            🎯 Find two bubbles that add up to:
          </p>
          <p className="text-7xl font-bold text-purple-600 text-center">
            {currentChallenge.target}
          </p>
        </div>

        {/* Bubble Area */}
        <div className="relative bg-gradient-to-b from-blue-50 to-cyan-50 rounded-2xl p-4 mb-6 h-96 overflow-hidden border-4 border-blue-200">
          {currentChallenge.bubbles.map((bubble) => {
            const isPopped = poppedBubbles.includes(bubble.id);
            const isSelected = selectedBubbles.includes(bubble.id);

            if (isPopped) {
              return (
                <div
                  key={bubble.id}
                  className="absolute transition-all duration-500 opacity-0 text-4xl"
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                  }}
                >
                  💥
                </div>
              );
            }

            return (
              <div
                key={bubble.id}
                onClick={() => handleBubbleClick(bubble.id)}
                className={`absolute cursor-pointer transition-all duration-200 flex items-center justify-center rounded-full shadow-lg hover:scale-110 ${
                  isSelected ? 'ring-4 ring-yellow-400 scale-110' : ''
                }`}
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  backgroundColor: bubble.color,
                  transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.1)' : 'scale(1)'}`,
                }}
              >
                <div className="absolute inset-0 rounded-full bg-white opacity-30" />
                <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full opacity-60" />
                <span className="text-white font-bold text-2xl drop-shadow-lg z-10">
                  {bubble.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`text-center p-4 rounded-2xl mb-6 ${
              feedback.includes('Perfect')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <p className="text-xl font-semibold">{feedback}</p>
          </div>
        )}

        {/* Instructions and Exit */}
        <div className="flex justify-between items-center">
          <div className="p-4 bg-blue-50 rounded-xl flex-1 mr-4">
            <p className="text-sm text-gray-600 text-center">
              💡 <strong>How to play:</strong> Click two bubbles whose numbers add up to the target number. The bubbles float upward, so catch them quickly!
            </p>
          </div>
          <Link
            href="/"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-colors"
          >
            ← Exit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BubblePopGame;
