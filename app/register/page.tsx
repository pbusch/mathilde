'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, isTeacher }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful, now log in
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (loginResponse.ok) {
          router.push('/');
          router.refresh();
        } else {
          // Registration succeeded but login failed, redirect to login page
          router.push('/login?message=registered');
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-12 max-w-md w-full border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏝️</div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 mb-2">
            Join Mathilde
          </h1>
          <p className="text-purple-200 text-lg">Create your adventure account!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800 border-2 border-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Choose a username"
              required
              disabled={isLoading}
              minLength={3}
              maxLength={50}
            />
            <p className="text-purple-300 text-xs mt-1">3-50 characters, letters, numbers, and underscores only</p>
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800 border-2 border-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="your@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800 border-2 border-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="At least 6 characters"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800 border-2 border-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Confirm your password"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-purple-400/30">
            <input
              type="checkbox"
              id="isTeacher"
              checked={isTeacher}
              onChange={(e) => setIsTeacher(e.target.checked)}
              className="w-5 h-5 rounded border-purple-400 text-pink-600 focus:ring-2 focus:ring-pink-400"
              disabled={isLoading}
            />
            <label htmlFor="isTeacher" className="text-purple-200 text-sm font-semibold cursor-pointer">
              I am a teacher 👨‍🏫
            </label>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Creating Account...' : 'Create Account 🎉'}
          </button>
        </form>

        <p className="text-center text-purple-200 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-yellow-300 hover:underline font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
