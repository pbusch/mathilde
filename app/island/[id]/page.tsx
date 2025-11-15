import Link from 'next/link';
import FractionPizzaGame from '@/app/components/games/FractionPizzaGame';

interface IslandPageProps {
  params: Promise<{ id: string }>;
}

export default async function IslandPage({ params }: IslandPageProps) {
  const { id } = await params;

  // Island 1: Fraction Pizza Game
  if (id === '1') {
    return <FractionPizzaGame />;
  }

  // Placeholder for other islands
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full">
        <h1 className="text-5xl font-bold text-gray-800 mb-6 text-center">
          Island {id}
        </h1>
        <div className="text-center mb-8">
          <div className="inline-block bg-yellow-400 rounded-full p-8 mb-6">
            <span className="text-6xl">🏝️</span>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Welcome to Island {id}!
          </p>
          <p className="text-lg text-gray-500">
            The math game for this island will be implemented here.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg transition-colors text-lg"
          >
            ← Back to Game Board
          </Link>
        </div>
      </div>
    </div>
  );
}
