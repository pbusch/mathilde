'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProgressData {
  completed: boolean;
  score: number;
}

interface IslandInfo {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const islands: IslandInfo[] = [
  {
    id: 1,
    name: 'Number Target Island',
    description: 'Master basic arithmetic operations to hit target numbers',
    icon: '🎯',
    color: 'from-red-500 to-pink-500',
  },
  {
    id: 2,
    name: 'Bubble Pop Island',
    description: 'Pop bubbles by solving multiplication problems',
    icon: '🫧',
    color: 'from-pink-500 to-purple-500',
  },
  {
    id: 3,
    name: 'Shape Quest Island',
    description: 'Identify and learn about geometric shapes',
    icon: '🔷',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 4,
    name: 'Pattern Wizard Island',
    description: 'Recognize and complete number patterns',
    icon: '🪄',
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 5,
    name: 'Fraction Pizza Island',
    description: 'Learn fractions through delicious pizza slices',
    icon: '🍕',
    color: 'from-yellow-500 to-orange-500',
  },
];

export default function ProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<{ [key: number]: ProgressData }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/progress');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProgress(data.progress);
      } else {
        // Not authenticated, redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    const completedCount = Object.values(progress).filter(p => p.completed).length;
    return Math.round((completedCount / islands.length) * 100);
  };

  const getTotalScore = () => {
    return Object.values(progress).reduce((sum, p) => sum + (p.score || 0), 0);
  };

  const getStatusBadge = (islandId: number) => {
    const islandProgress = progress[islandId];
    
    if (!islandProgress) {
      return (
        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold">
          Not Started
        </span>
      );
    }
    
    if (islandProgress.completed) {
      return (
        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
          ✓ Completed
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold">
        In Progress
      </span>
    );
  };

  const getScoreDisplay = (islandId: number) => {
    const islandProgress = progress[islandId];
    if (!islandProgress || islandProgress.score === 0) {
      return '—';
    }
    return islandProgress.score;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-2xl font-bold text-purple-600 animate-pulse">
          Loading your progress...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors"
          >
            <span className="text-xl">←</span> Back to Islands
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Your Progress Report
                </h1>
                {user && (
                  <p className="text-xl text-gray-700 mt-2">
                    Welcome back, <span className="font-bold text-purple-600">{user.username}</span>! 
                    {user.isTeacher && ' 👨‍🏫'}
                  </p>
                )}
              </div>
              <div className="text-6xl">📊</div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold">{getTotalScore()}</div>
                <div className="text-blue-100">Total Points</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="text-3xl mb-2">✓</div>
                <div className="text-2xl font-bold">
                  {Object.values(progress).filter(p => p.completed).length}/{islands.length}
                </div>
                <div className="text-green-100">Islands Completed</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
                <div className="text-purple-100">Overall Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Adventure Progress</span>
                <span>{getCompletionPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                  style={{ width: `${getCompletionPercentage()}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Islands Progress */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Island Progress</h2>
          
          {islands.map((island) => {
            const islandProgress = progress[island.id];
            const isAccessible = island.id === 1 || progress[island.id - 1]?.completed;
            
            return (
              <div
                key={island.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all ${
                  isAccessible ? 'hover:shadow-xl hover:scale-[1.01]' : 'opacity-60'
                }`}
              >
                <div className={`h-2 bg-gradient-to-r ${island.color}`} />
                
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-5xl">{island.icon}</div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-800">
                            {island.name}
                          </h3>
                          {!isAccessible && (
                            <span className="px-3 py-1 bg-gray-300 text-gray-600 rounded-full text-sm font-semibold">
                              🔒 Locked
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{island.description}</p>
                        
                        <div className="flex items-center gap-6">
                          <div>
                            <div className="text-sm text-gray-500">Status</div>
                            <div className="mt-1">{getStatusBadge(island.id)}</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-500">Best Score</div>
                            <div className="mt-1 text-2xl font-bold text-purple-600">
                              {getScoreDisplay(island.id)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isAccessible && (
                      <button
                        onClick={() => router.push(`/island/${island.id}`)}
                        className={`px-6 py-3 bg-gradient-to-r ${island.color} text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                      >
                        {islandProgress?.completed ? 'Play Again' : 'Start Quest'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Encouragement Message */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-xl p-8 text-white text-center">
          <div className="text-4xl mb-4">🌟</div>
          {getCompletionPercentage() === 100 ? (
            <>
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-lg">
                You've completed all islands! You're a Math Master! 🎉
              </p>
            </>
          ) : getCompletionPercentage() >= 50 ? (
            <>
              <h3 className="text-2xl font-bold mb-2">Great Progress!</h3>
              <p className="text-lg">
                You're more than halfway there! Keep up the amazing work! 💪
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold mb-2">Keep Going!</h3>
              <p className="text-lg">
                Every island you complete makes you stronger at math! 🚀
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
