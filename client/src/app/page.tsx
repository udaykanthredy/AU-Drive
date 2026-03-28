import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
          AU Drive
        </h1>
        <p className="text-xl text-gray-400 max-w-md">
          AI-powered cloud file storage — store, search, and chat with your files.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Get Started
        </Link>
      </div>

      {/* TODO Phase 1: Add landing page hero, features section */}
    </main>
  );
}
