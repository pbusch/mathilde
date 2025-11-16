'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(() => generateChallenge(1));
  const [selectedBubbles, setSelectedBubbles] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');
  const [poppedBubbles, setPoppedBubbles] = useState<number[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [celebrationStars] = useState(() =>
    [...Array(30)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 0.5 + Math.random() * 0.5,
    }))
  );

  const completeIsland = async (finalScore: number) => {
    setSavingProgress(true);
    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          islandId: 2,  // Bubble Pop is on Island 2
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
        if (level >= 3) {
          setGameCompleted(true);
          completeIsland(score + points);
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
          <h1 className="text-5xl font-bold text-yellow-300 mb-4">
            Island Complete!
          </h1>
          <p className="text-3xl text-purple-200 mb-4">Final Score: {score}</p>
          <p className="text-2xl text-purple-300 mb-4">
            You&apos;ve mastered bubble math!
          </p>
          <p className="text-xl text-purple-200 mb-8">
            {savingProgress ? 'Saving your progress... ✨' : 'The next island awaits! 🎉'}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105"
            >
              Try Again 🔄
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

      {/* Celebration stars */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-50">
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
              🫧 Bubble Pop Math
            </h1>
            <p className="text-purple-200 text-lg">Find two bubbles that add up to the target!</p>
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

        {/* Target Display */}
        <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 rounded-2xl p-6 mb-8 border-2 border-yellow-400/50 max-w-4xl mx-auto">
          <p className="text-xl font-semibold text-yellow-300 text-center mb-2">
            🎯 Find two bubbles that add up to:
          </p>
          <p className="text-7xl font-bold text-white text-center">
            {currentChallenge.target}
          </p>
        </div>

        {/* Bubble Area */}
        <div className="relative bg-gradient-to-b from-blue-900/30 to-purple-900/30 rounded-2xl p-4 mb-8 h-96 overflow-hidden border-4 border-purple-400/30 max-w-4xl mx-auto backdrop-blur-sm">
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
            className={`text-center text-2xl font-bold mb-6 max-w-4xl mx-auto ${
              feedback.includes('Perfect')
                ? 'text-green-300 animate-bounce'
                : 'text-red-300'
            }`}
          >
            <p>{feedback}</p>
          </div>
        )}

        {/* Instructions and Exit */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-2xl font-bold text-yellow-300 mb-4 text-center">
            ✨ How to Play ✨
          </h3>
          <p className="text-purple-200 text-lg text-center">
            💡 Click two bubbles whose numbers add up to the target number. The bubbles float upward, so catch them quickly!
          </p>
        </div>
      </div>
    </div>
  );
};

export default BubblePopGame;
