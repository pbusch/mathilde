'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PatternChallenge {
  sequence: (number | null)[];
  rule: string;
  ruleType: 'addition' | 'multiplication' | 'fibonacci' | 'squares' | 'alternating';
  missingIndices: number[];
  correctAnswers: number[];
}

const wizardPhrases = [
  "Excellent magic! ✨",
  "Spectacular spell! 🌟",
  "Brilliant pattern magic! 🔮",
  "Magnificent work, wizard! 🎩",
  "Outstanding enchantment! ⚡",
];

const generatePattern = (level: number): PatternChallenge => {
  const types = ['addition', 'multiplication', 'fibonacci', 'squares', 'alternating'] as const;
  let ruleType: typeof types[number];
  
  // Progressive difficulty
  if (level <= 3) {
    ruleType = Math.random() > 0.5 ? 'addition' : 'multiplication';
  } else if (level <= 6) {
    ruleType = types[Math.floor(Math.random() * 3)]; // addition, multiplication, fibonacci
  } else {
    ruleType = types[Math.floor(Math.random() * 5)]; // all types
  }

  let sequence: number[] = [];
  let rule = '';
  const sequenceLength = 7;

  switch (ruleType) {
    case 'addition':
      const step = level <= 3 ? Math.floor(Math.random() * 5) + 2 : Math.floor(Math.random() * 10) + 2;
      const start = Math.floor(Math.random() * 10) + 1;
      for (let i = 0; i < sequenceLength; i++) {
        sequence.push(start + step * i);
      }
      rule = `Add ${step} each time`;
      break;

    case 'multiplication':
      const multiplier = level <= 3 ? 2 : Math.floor(Math.random() * 3) + 2;
      const baseStart = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < sequenceLength; i++) {
        sequence.push(baseStart * Math.pow(multiplier, i));
      }
      rule = `Multiply by ${multiplier} each time`;
      break;

    case 'fibonacci':
      sequence = [1, 1];
      for (let i = 2; i < sequenceLength; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2]);
      }
      rule = 'Add the previous two numbers';
      break;

    case 'squares':
      for (let i = 1; i <= sequenceLength; i++) {
        sequence.push(i * i);
      }
      rule = 'Square numbers (n²)';
      break;

    case 'alternating':
      const add = Math.floor(Math.random() * 5) + 3;
      const subtract = Math.floor(Math.random() * 3) + 1;
      let current = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < sequenceLength; i++) {
        sequence.push(current);
        if (i % 2 === 0) {
          current += add;
        } else {
          current -= subtract;
        }
      }
      rule = `Alternating: +${add}, -${subtract}`;
      break;
  }

  // Determine how many blanks based on difficulty
  const numBlanks = level <= 3 ? 2 : level <= 6 ? 3 : 4;
  const missingIndices: number[] = [];
  
  // Always include at least one from the last 3 positions for challenge
  const lastThree = [sequenceLength - 3, sequenceLength - 2, sequenceLength - 1];
  missingIndices.push(lastThree[Math.floor(Math.random() * lastThree.length)]);
  
  // Fill remaining blanks
  while (missingIndices.length < numBlanks) {
    const randomIndex = Math.floor(Math.random() * sequenceLength);
    if (!missingIndices.includes(randomIndex)) {
      missingIndices.push(randomIndex);
    }
  }

  missingIndices.sort((a, b) => a - b);

  const correctAnswers = missingIndices.map(idx => sequence[idx]);
  const sequenceWithBlanks = sequence.map((val, idx) => 
    missingIndices.includes(idx) ? null : val
  );

  return {
    sequence: sequenceWithBlanks,
    rule,
    ruleType,
    missingIndices,
    correctAnswers,
  };
};

export default function PatternWizardGame() {
  const router = useRouter();
  const COMPLETION_LEVEL = process.env.NEXT_PUBLIC_GAME_COMPLETION_LEVEL 
    ? parseInt(process.env.NEXT_PUBLIC_GAME_COMPLETION_LEVEL) 
    : 12;
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [challenge, setChallenge] = useState<PatternChallenge | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [streak, setStreak] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    startNewChallenge();
  }, [level]);

  const startNewChallenge = () => {
    const newChallenge = generatePattern(level);
    setChallenge(newChallenge);
    setUserAnswers({});
    setFeedback('');
    setShowHint(false);
  };

  const handleInputChange = (index: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [index]: value,
    }));
  };

  const completeIsland = async (finalScore: number) => {
    setSavingProgress(true);
    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          islandId: 1,  // Pattern Wizard is on Island 1
          score: finalScore 
        }),
      });

      if (response.ok) {
        setGameWon(true);
        setFeedback('🎉 Island Complete! Returning to the map... 🎉');
        
        // Redirect to gameboard after celebration
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        console.error('Failed to save progress');
        // Still show celebration even if save failed
        setGameWon(true);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      // Still show celebration even if save failed
      setGameWon(true);
    } finally {
      setSavingProgress(false);
    }
  };

  const checkAnswers = () => {
    if (!challenge) return;

    const allAnswered = challenge.missingIndices.every(
      idx => userAnswers[idx] && userAnswers[idx].trim() !== ''
    );

    if (!allAnswered) {
      setFeedback('Please fill in all the blanks! 🔮');
      return;
    }

    const allCorrect = challenge.missingIndices.every(
      idx => parseInt(userAnswers[idx]) === challenge.correctAnswers[challenge.missingIndices.indexOf(idx)]
    );

    if (allCorrect) {
      const points = 10 * level + (streak * 5);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setFeedback(wizardPhrases[Math.floor(Math.random() * wizardPhrases.length)]);
      setShowCelebration(true);
      
      setTimeout(() => {
        setShowCelebration(false);
        if (level < COMPLETION_LEVEL) {
          setLevel(prev => prev + 1);
        } else {
          // Player completed all levels! Mark island as complete
          const finalScore = score + points;
          completeIsland(finalScore);
        }
      }, 2000);
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
      setFeedback('Not quite right. Try again! 🪄');
      
      if (lives <= 1) {
        setGameOver(true);
        setFeedback('The magic has faded... Game Over! 🌙');
      }
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

  const getHint = () => {
    if (!challenge) return '';
    return challenge.rule;
  };

  if (!challenge) {
    return <div className="min-h-screen flex items-center justify-center">Loading magical patterns...</div>;
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

      {/* Celebration sparkles */}
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 mb-2 drop-shadow-lg">
              🧙 Pattern Wizard 🔮
            </h1>
            <p className="text-purple-200 text-lg">Complete the magical number patterns!</p>
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
              <p className="text-4xl font-bold text-yellow-300">{level}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm">Score</p>
              <p className="text-4xl font-bold text-green-300">{score}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm">Streak</p>
              <p className="text-4xl font-bold text-orange-300">{streak} 🔥</p>
            </div>
          </div>
          <div className="flex gap-2">
            <p className="text-purple-200 text-sm mr-2">Lives:</p>
            {[...Array(3)].map((_, i) => (
              <span key={i} className="text-3xl">
                {i < lives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>

        {/* Game Area */}
        {gameWon ? (
          /* Victory Screen */
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl max-w-2xl mx-auto text-center">
            <div className="text-8xl mb-6 animate-bounce">🏆</div>
            <h2 className="text-5xl font-bold text-yellow-300 mb-4">Island Complete!</h2>
            <p className="text-3xl text-green-300 mb-4">Final Score: {score}</p>
            <p className="text-2xl text-purple-300 mb-4">You've mastered all patterns!</p>
            <p className="text-xl text-purple-200 mb-8">
              {savingProgress ? 'Saving your progress... ✨' : 'The next island awaits! 🎉'}
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105 inline-block"
              >
                Return to Islands 🏝️
              </Link>
            </div>
          </div>
        ) : !gameOver ? (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl max-w-4xl mx-auto">
            {/* Pattern Rule - Hidden */}
            <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 rounded-2xl p-6 mb-8 border-2 border-yellow-400/50">
              <p className="text-center text-2xl font-bold text-yellow-300 mb-2">
                📜 Mystery Pattern 📜
              </p>
              <p className="text-center text-xl text-white font-semibold">
                Can you discover the hidden rule?
              </p>
            </div>

            {/* Pattern Sequence */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {challenge.sequence.map((value, index) => (
                <div key={index} className="flex flex-col items-center">
                  {value === null ? (
                    <input
                      type="number"
                      value={userAnswers[index] || ''}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      className="w-20 h-20 text-2xl font-bold text-center bg-yellow-300 text-purple-900 rounded-xl border-4 border-yellow-500 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-400 transform hover:scale-105 transition-all"
                      placeholder="?"
                      disabled={gameOver}
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-xl border-4 border-purple-600 shadow-lg">
                      {value}
                    </div>
                  )}
                  <span className="text-purple-200 text-sm mt-2">#{index + 1}</span>
                </div>
              ))}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`text-center text-2xl font-bold mb-6 ${
                feedback.includes('Not quite') || feedback.includes('fill in') 
                  ? 'text-red-300' 
                  : 'text-green-300'
              } animate-bounce`}>
                {feedback}
              </div>
            )}

            {/* Hint Section */}
            {showHint && (
              <div className="bg-blue-900/50 border-2 border-blue-400 rounded-xl p-4 mb-6 text-center">
                <p className="text-blue-200 text-lg">💡 Magic Rule: {getHint()}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={checkAnswers}
                disabled={gameOver}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cast Spell ⚡
              </button>
              
              <button
                onClick={() => setShowHint(!showHint)}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105"
              >
                {showHint ? 'Hide Hint 🔮' : 'Get Hint 💡'}
              </button>

              <button
                onClick={startNewChallenge}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl transition-all transform hover:scale-105"
              >
                Skip 🌀
              </button>
            </div>
          </div>
        ) : (
          /* Game Over Screen */
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl max-w-2xl mx-auto text-center">
            <div className="text-8xl mb-6 animate-bounce">🌙</div>
            <h2 className="text-5xl font-bold text-red-300 mb-4">Game Over!</h2>
            <p className="text-3xl text-purple-200 mb-4">Final Score: {score}</p>
            <p className="text-2xl text-purple-300 mb-8">You reached Level {level}!</p>
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
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-yellow-300 mb-4 text-center">
            ✨ How to Play ✨
          </h3>
          <ul className="text-purple-200 space-y-2 text-lg">
            <li>🔮 Study the visible numbers and discover the pattern</li>
            <li>🪄 Fill in the missing numbers in the sequence</li>
            <li>⚡ Cast your spell to check if you're correct</li>
            <li>💡 Use hints to reveal the magic rule if you're stuck</li>
            <li>🔥 Build a streak for bonus points!</li>
            <li>❤️ You have 3 lives - use them wisely!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
