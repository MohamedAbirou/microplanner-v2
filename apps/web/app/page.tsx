export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            MicroPlanner
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Mobile-first AI weekly planner that crushes ReclaimAI
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-glow transition-all">
              Get Started Free
            </button>
            <button className="px-8 py-3 border border-gray-700 rounded-lg font-semibold hover:border-gray-500 transition-all">
              View Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Mobile-First</h3>
            <p className="text-gray-400">
              Native iOS & Android apps. Plan your week anywhere, anytime.
            </p>
          </div>

          <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-400">
              GPT-4o creates optimal schedules that respect your energy patterns.
            </p>
          </div>

          <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Perfect Sync</h3>
            <p className="text-gray-400">
              Calendar sync that actually works. Zero duplicates, guaranteed.
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="text-center p-8 bg-gray-900/30 rounded-2xl border border-gray-800">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">System Status</span>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div>
              <div className="text-2xl font-bold text-blue-500">99.9%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">&lt;5s</div>
              <div className="text-sm text-gray-400">Plan Generation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">$5/mo</div>
              <div className="text-sm text-gray-400">Starting Price</div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-16 text-center">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400">
              🚀 Web app coming soon! Mobile apps in development.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
