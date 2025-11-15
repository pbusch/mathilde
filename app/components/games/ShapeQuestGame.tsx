'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Shape {
  type: 'circle' | 'square' | 'triangle' | 'rectangle' | 'pentagon' | 'hexagon';
  color: string;
  size: number;
  x: number;
  y: number;
  id: number;
  rotation: number;
}

interface Challenge {
  question: string;
  shapes: Shape[];
  correctAnswer: number;
  explanation: string;
  type: 'count' | 'area' | 'perimeter' | 'angles' | 'symmetry';
}

const shapeColors = [
  { hex: '#ef4444', name: 'red' },
  { hex: '#3b82f6', name: 'blue' },
  { hex: '#10b981', name: 'green' },
  { hex: '#f59e0b', name: 'orange' },
  { hex: '#8b5cf6', name: 'purple' },
  { hex: '#ec4899', name: 'pink' },
  { hex: '#06b6d4', name: 'cyan' },
];

const encouragements = [
  "Incredible geometry skills! 🌟",
  "You're a shape master! 🎯",
  "Perfect calculation! 🏆",
  "Outstanding work! ⭐",
  "Brilliant mathematical thinking! 💎",
  "Geometric genius! 🎨",
];

const generateShapes = (count: number): Shape[] => {
  const types: Shape['type'][] = ['circle', 'square', 'triangle', 'rectangle', 'pentagon', 'hexagon'];
  const shapes: Shape[] = [];
  
  for (let i = 0; i < count; i++) {
    const colorObj = shapeColors[Math.floor(Math.random() * shapeColors.length)];
    shapes.push({
      type: types[Math.floor(Math.random() * types.length)],
      color: colorObj.hex,
      size: 40 + Math.random() * 40,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 70,
      id: i,
      rotation: Math.random() * 360,
    });
  }
  
  return shapes;
};

const generateChallenge = (level: number): Challenge => {
  const challengeTypes = ['count', 'area', 'perimeter', 'angles', 'symmetry'] as const;
  let type: typeof challengeTypes[number];
  
  // Progressive difficulty
  if (level <= 3) {
    type = 'count';
  } else if (level <= 6) {
    type = Math.random() > 0.5 ? 'count' : 'area';
  } else if (level <= 9) {
    type = challengeTypes[Math.floor(Math.random() * 3)]; // count, area, perimeter
  } else {
    type = challengeTypes[Math.floor(Math.random() * 5)]; // all types
  }

  const shapes = generateShapes(8 + Math.floor(level / 2));
  let question = '';
  let correctAnswer = 0;
  let explanation = '';

  switch (type) {
    case 'count':
      const targetType = shapes[Math.floor(Math.random() * shapes.length)].type;
      const targetColorHex = Math.random() > 0.5 ? shapes[Math.floor(Math.random() * shapes.length)].color : null;
      
      if (targetColorHex) {
        // Find the color name from hex
        const colorObj = shapeColors.find(c => c.hex === targetColorHex);
        const colorName = colorObj ? colorObj.name : 'colored';
        question = `How many ${colorName} shapes are there?`;
        correctAnswer = shapes.filter(s => s.color === targetColorHex).length;
        explanation = `Count all the shapes with the ${colorName} color`;
      } else {
        const shapeName = targetType + 's';
        question = `How many ${shapeName} are there?`;
        correctAnswer = shapes.filter(s => s.type === targetType).length;
        explanation = `Count all the ${shapeName} in the scene`;
      }
      break;

    case 'area':
      const areaShapes = shapes.filter(s => s.type === 'square' || s.type === 'rectangle');
      if (areaShapes.length === 0) {
        // Add at least one square
        shapes.push({
          type: 'square',
          color: shapeColors[0].hex,
          size: 60,
          x: 50,
          y: 50,
          id: shapes.length,
          rotation: 0,
        });
      }
      const sideLength = Math.floor(5 + Math.random() * 10);
      question = `If each square has a side of ${sideLength} units, what's the total area of all squares?`;
      const squareCount = shapes.filter(s => s.type === 'square').length;
      correctAnswer = squareCount * sideLength * sideLength;
      explanation = `Area of square = side × side = ${sideLength} × ${sideLength} = ${sideLength * sideLength}. Total: ${squareCount} squares × ${sideLength * sideLength} = ${correctAnswer}`;
      break;

    case 'perimeter':
      const perimeterSide = Math.floor(4 + Math.random() * 8);
      question = `If each square has sides of ${perimeterSide} units, what's the perimeter of ONE square?`;
      correctAnswer = perimeterSide * 4;
      explanation = `Perimeter = 4 × side = 4 × ${perimeterSide} = ${correctAnswer}`;
      break;

    case 'angles':
      const angleTypes: { [key: string]: number } = {
        'triangle': 3,
        'square': 4,
        'rectangle': 4,
        'pentagon': 5,
        'hexagon': 6,
      };
      const angleShape = ['triangle', 'square', 'pentagon', 'hexagon'][Math.floor(Math.random() * 4)] as Shape['type'];
      question = `How many corners (vertices) does a ${angleShape} have?`;
      correctAnswer = angleTypes[angleShape];
      explanation = `A ${angleShape} has ${correctAnswer} corners`;
      break;

    case 'symmetry':
      const symQuestions = [
        { q: 'How many lines of symmetry does a square have?', a: 4, e: 'A square has 4 lines of symmetry (2 diagonals + 2 through midpoints)' },
        { q: 'How many lines of symmetry does a circle have?', a: 999, e: 'A circle has infinite lines of symmetry! (Use 999 as answer)' },
        { q: 'How many lines of symmetry does a regular hexagon have?', a: 6, e: 'A regular hexagon has 6 lines of symmetry' },
        { q: 'How many lines of symmetry does an equilateral triangle have?', a: 3, e: 'An equilateral triangle has 3 lines of symmetry' },
      ];
      const symQ = symQuestions[Math.floor(Math.random() * symQuestions.length)];
      question = symQ.q;
      correctAnswer = symQ.a;
      explanation = symQ.e;
      break;
  }

  return {
    question,
    shapes,
    correctAnswer,
    explanation,
    type,
  };
};

const ShapeRenderer = ({ shape }: { shape: Shape }) => {
  const baseStyle = {
    position: 'absolute' as const,
    left: `${shape.x}%`,
    top: `${shape.y}%`,
    width: `${shape.size}px`,
    height: `${shape.size}px`,
    backgroundColor: shape.color,
    transform: `rotate(${shape.rotation}deg)`,
    transition: 'all 0.3s ease',
  };

  switch (shape.type) {
    case 'circle':
      return <div style={{ ...baseStyle, borderRadius: '50%' }} />;
    case 'square':
      return <div style={baseStyle} />;
    case 'triangle':
      return (
        <div
          style={{
            ...baseStyle,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderLeft: `${shape.size / 2}px solid transparent`,
            borderRight: `${shape.size / 2}px solid transparent`,
            borderBottom: `${shape.size}px solid ${shape.color}`,
          }}
        />
      );
    case 'rectangle':
      return <div style={{ ...baseStyle, width: `${shape.size * 1.5}px` }} />;
    case 'pentagon':
      return (
        <div
          style={{
            ...baseStyle,
            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
          }}
        />
      );
    case 'hexagon':
      return (
        <div
          style={{
            ...baseStyle,
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          }}
        />
      );
    default:
      return <div style={baseStyle} />;
  }
};

export default function ShapeQuestGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    startNewChallenge();
  }, [level]);

  const startNewChallenge = () => {
    const newChallenge = generateChallenge(level);
    setChallenge(newChallenge);
    setUserAnswer('');
    setFeedback('');
    setShowExplanation(false);
  };

  const checkAnswer = () => {
    if (!challenge || userAnswer.trim() === '') {
      setFeedback('Please enter an answer! 🎯');
      return;
    }

    const answer = parseInt(userAnswer);
    
    if (isNaN(answer)) {
      setFeedback('Please enter a valid number! 🔢');
      return;
    }

    if (answer === challenge.correctAnswer) {
      const points = 15 * level + (streak * 8);
      setScore(prev => {
        const newScore = prev + points;
        if (newScore > highScore) {
          setHighScore(newScore);
        }
        return newScore;
      });
      setStreak(prev => prev + 1);
      setFeedback(encouragements[Math.floor(Math.random() * encouragements.length)]);
      setShowExplanation(true);
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowCelebration(false);
        if (level < 15) {
          setLevel(prev => prev + 1);
        } else {
          startNewChallenge();
        }
      }, 2500);
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      setFeedback(`Not quite! The correct answer is ${challenge.correctAnswer}`);
      setShowExplanation(true);
      
      if (lives <= 1) {
        setGameOver(true);
        setFeedback(`Game Over! The correct answer was ${challenge.correctAnswer}`);
      }
      
      setTimeout(() => {
        if (lives > 1) {
          startNewChallenge();
        }
      }, 3000);
    }
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setStreak(0);
    startNewChallenge();
  };

  const skipChallenge = () => {
    if (!gameOver) {
      startNewChallenge();
    }
  };

  if (!challenge) {
    return <div className="min-h-screen flex items-center justify-center">Loading geometric quest...</div>;
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

      {/* Celebration effects */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-ping"
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDuration: '1s',
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 mb-2 drop-shadow-lg">
              🔷 Shape Quest 🔶
            </h1>
            <p className="text-purple-200 text-lg">Master the art of geometry!</p>
          </div>
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105"
          >
            ← Back to Islands
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-between items-center mb-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex gap-6">
            <div>
              <p className="text-purple-200 text-xs">Level</p>
              <p className="text-3xl font-bold text-yellow-300">{level}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs">Score</p>
              <p className="text-3xl font-bold text-green-300">{score}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs">High Score</p>
              <p className="text-3xl font-bold text-purple-300">{highScore}</p>
            </div>
            <div>
              <p className="text-purple-200 text-xs">Streak</p>
              <p className="text-3xl font-bold text-orange-300">{streak} 🔥</p>
            </div>
          </div>
          <div className="flex gap-2">
            <p className="text-purple-200 text-sm mr-2">Lives:</p>
            {[...Array(3)].map((_, i) => (
              <span key={i} className="text-2xl">
                {i < lives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>

        {/* Game Area */}
        {!gameOver ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shape Display Area */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl relative overflow-hidden" style={{ minHeight: '500px' }}>
              <div className="absolute top-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-sm z-10">
                Shape Arena 🎨
              </div>
              <div className="relative w-full h-full mt-12">
                {challenge.shapes.map(shape => (
                  <ShapeRenderer key={shape.id} shape={shape} />
                ))}
              </div>
            </div>

            {/* Question and Answer Area */}
            <div className="flex flex-col gap-6">
              {/* Challenge Question */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 rounded-2xl p-6 mb-6 border-2 border-yellow-400/50">
                  <p className="text-center text-xl font-bold text-yellow-300 mb-3">
                    📐 Challenge #{level} 📐
                  </p>
                  <p className="text-center text-2xl text-white font-semibold">
                    {challenge.question}
                  </p>
                </div>

                {/* Answer Input */}
                <div className="mb-6">
                  <label className="block text-purple-200 text-lg font-semibold mb-3">
                    Your Answer:
                  </label>
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                    className="w-full px-6 py-4 text-2xl font-bold text-center bg-white text-purple-900 rounded-xl border-4 border-purple-500 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-400"
                    placeholder="Enter number..."
                    disabled={gameOver || showExplanation}
                  />
                </div>

                {/* Feedback */}
                {feedback && (
                  <div className={`text-center text-xl font-bold mb-4 p-4 rounded-xl ${
                    feedback.includes('Not quite') || feedback.includes('enter') || feedback.includes('Game Over')
                      ? 'bg-red-500/20 text-red-200' 
                      : 'bg-green-500/20 text-green-200'
                  } ${!showExplanation && 'animate-bounce'}`}>
                    {feedback}
                  </div>
                )}

                {/* Explanation */}
                {showExplanation && (
                  <div className="bg-blue-900/50 border-2 border-blue-400 rounded-xl p-4 mb-4">
                    <p className="text-blue-200 text-lg">
                      💡 <strong>Explanation:</strong> {challenge.explanation}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {!showExplanation && !gameOver && (
                  <div className="flex gap-3">
                    <button
                      onClick={checkAnswer}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105"
                    >
                      Submit 🎯
                    </button>
                    
                    <button
                      onClick={skipChallenge}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105"
                    >
                      Skip ⏭️
                    </button>
                  </div>
                )}
              </div>

              {/* Challenge Type Badge */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-center text-purple-200">
                  <span className="font-bold text-yellow-300">Challenge Type:</span>{' '}
                  {challenge.type === 'count' && '🔢 Counting'}
                  {challenge.type === 'area' && '📐 Area'}
                  {challenge.type === 'perimeter' && '📏 Perimeter'}
                  {challenge.type === 'angles' && '📐 Angles & Vertices'}
                  {challenge.type === 'symmetry' && '🪞 Symmetry'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Game Over Screen */
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl max-w-2xl mx-auto text-center">
            <div className="text-8xl mb-6 animate-bounce">🏆</div>
            <h2 className="text-5xl font-bold text-purple-300 mb-4">Quest Complete!</h2>
            <p className="text-3xl text-purple-200 mb-2">Final Score: {score}</p>
            <p className="text-2xl text-purple-300 mb-2">You reached Level {level}!</p>
            {score === highScore && score > 0 && (
              <p className="text-xl text-yellow-300 mb-6 animate-pulse">🌟 NEW HIGH SCORE! 🌟</p>
            )}
            <div className="flex justify-center gap-4 mt-8">
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
        )}

        {/* Instructions */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-2xl font-bold text-yellow-300 mb-4 text-center">
            ✨ How to Play ✨
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-200">
            <ul className="space-y-2">
              <li>🔢 <strong>Counting:</strong> Count specific shapes or colors</li>
              <li>📐 <strong>Area:</strong> Calculate the area of squares</li>
              <li>📏 <strong>Perimeter:</strong> Find the perimeter of shapes</li>
            </ul>
            <ul className="space-y-2">
              <li>📐 <strong>Angles:</strong> Count vertices (corners)</li>
              <li>🪞 <strong>Symmetry:</strong> Find lines of symmetry</li>
              <li>🔥 <strong>Build streaks</strong> for bonus points!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
