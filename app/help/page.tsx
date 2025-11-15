import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-3xl w-full">
        <h1 className="text-5xl font-bold text-gray-800 mb-8 text-center">
          Help & Instructions
        </h1>

        <div className="space-y-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center gap-3">
              <span className="text-3xl">🎮</span>
              How to Play
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Navigate through the Math Adventure by visiting different islands.
              Each island contains a unique math game designed to help you practice
              and improve your math skills.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center gap-3">
              <span className="text-3xl">🏝️</span>
              The Islands
            </h2>
            <p className="text-gray-700 leading-relaxed">
              There are 5 islands to explore, each with its own math challenge.
              Start with Island 1 (shown in green) and unlock the other islands
              as you progress through your adventure.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center gap-3">
              <span className="text-3xl">🖱️</span>
              Controls
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Use your mouse to rotate and zoom the game board. Click on an
              accessible island (shown in green) to start the math game.
              Use the Help button anytime you need assistance.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-full font-semibold shadow-lg transition-colors text-lg"
          >
            ← Back to Game Board
          </Link>
        </div>
      </div>
    </div>
  );
}
