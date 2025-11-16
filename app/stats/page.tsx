'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProgress {
  islandId: number;
  completed: boolean;
  score: number;
  completedAt: string | null;
}

interface Student {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  islandsStarted: number;
  islandsCompleted: number;
  totalScore: number;
  lastActivity: string | null;
  progress: UserProgress[];
}

interface GlobalStats {
  totalStudents: number;
  totalIslandsCompleted: number;
  averageScore: number;
  studentsWithProgress: number;
}

interface StatsData {
  users: Student[];
  globalStats: GlobalStats;
}

export default function StatsPage() {
  const router = useRouter();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'username' | 'totalScore' | 'islandsCompleted' | 'lastActivity'>('totalScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.status === 403) {
        setError('You must be a teacher to view this page');
        return;
      }
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStatsData(data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedUsers = statsData?.users ? [...statsData.users].sort((a, b) => {
    let aVal: any = a[sortBy];
    let bVal: any = b[sortBy];
    
    if (sortBy === 'username') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortBy === 'lastActivity') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  }) : [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-purple-600">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            📊 Student Statistics
          </h1>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105"
          >
            Back to Game
          </button>
        </div>

        {/* Global Stats Cards */}
        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-gray-600 font-semibold mb-2">Total Students</h3>
              <p className="text-4xl font-bold text-purple-600">{statsData.globalStats.totalStudents}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-gray-600 font-semibold mb-2">Active Students</h3>
              <p className="text-4xl font-bold text-green-600">{statsData.globalStats.studentsWithProgress}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-gray-600 font-semibold mb-2">Islands Completed</h3>
              <p className="text-4xl font-bold text-blue-600">{statsData.globalStats.totalIslandsCompleted}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <h3 className="text-gray-600 font-semibold mb-2">Average Score</h3>
              <p className="text-4xl font-bold text-yellow-600">{statsData.globalStats.averageScore}</p>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th 
                    className="px-6 py-4 text-left font-bold cursor-pointer hover:bg-purple-700 transition"
                    onClick={() => handleSort('username')}
                  >
                    Username {sortBy === 'username' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4 text-left font-bold">Email</th>
                  <th className="px-6 py-4 text-center font-bold">Islands Started</th>
                  <th 
                    className="px-6 py-4 text-center font-bold cursor-pointer hover:bg-purple-700 transition"
                    onClick={() => handleSort('islandsCompleted')}
                  >
                    Completed {sortBy === 'islandsCompleted' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center font-bold cursor-pointer hover:bg-purple-700 transition"
                    onClick={() => handleSort('totalScore')}
                  >
                    Total Score {sortBy === 'totalScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-left font-bold cursor-pointer hover:bg-purple-700 transition"
                    onClick={() => handleSort('lastActivity')}
                  >
                    Last Activity {sortBy === 'lastActivity' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4 text-center font-bold">Island Progress</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((student, index) => (
                    <tr 
                      key={student.id}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-purple-50 transition`}
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">{student.username}</td>
                      <td className="px-6 py-4 text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                          {student.islandsStarted}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                          {student.islandsCompleted}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                          {student.totalScore}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(student.lastActivity)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 justify-center">
                          {[1, 2, 3, 4, 5].map((islandId) => {
                            const progress = student.progress.find(p => p.islandId === islandId);
                            return (
                              <div
                                key={islandId}
                                className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                                  progress?.completed
                                    ? 'bg-green-500 text-white'
                                    : progress
                                    ? 'bg-yellow-400 text-gray-800'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                                title={`Island ${islandId}: ${
                                  progress?.completed
                                    ? `Completed (${progress.score} pts)`
                                    : progress
                                    ? `In Progress (${progress.score} pts)`
                                    : 'Not Started'
                                }`}
                              >
                                {islandId}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-gray-700 mb-3">Island Progress Legend:</h3>
          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded"></div>
              <span className="text-gray-700">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded"></div>
              <span className="text-gray-700">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <span className="text-gray-700">Not Started</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
