'use client';

import Link from 'next/link';
import { ArrowRight, Bot, Search, Shield, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const user = useAuthStore(s => s.user);

  return (
    <div className="min-h-screen bg-neo-bg flex flex-col font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b-4 border-black bg-white relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
              <rect x="14" y="14" width="72" height="72" fill="#000000" />
              <rect x="4" y="4" width="72" height="72" fill="#22c55e" stroke="#000000" strokeWidth="6" />
              <path d="M 22 40 L 58 40" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
              <path d="M 22 56 L 46 56" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
              <rect x="22" y="24" width="12" height="12" fill="#FDE047" stroke="#000000" strokeWidth="4" />
            </svg>
          </div>
          <span className="text-2xl font-black text-black uppercase tracking-widest">AU Drive</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-brand-500 text-black font-bold uppercase text-sm border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-block px-6 py-2.5 text-black font-bold uppercase text-sm border-2 border-transparent hover:border-black hover:bg-neo-yellow transition-all"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-brand-500 text-black font-bold uppercase text-sm border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Start for free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 py-12 md:py-20 flex flex-col items-center text-center border-b-4 border-black bg-neo-yellow overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-10 left-10 w-16 h-16 bg-neo-pink border-4 border-black rounded-full shadow-neo hidden md:block"></div>
          <div className="absolute bottom-10 right-20 w-24 h-24 bg-neo-blue border-4 border-black rotate-12 shadow-neo hidden lg:block"></div>
          <div className="absolute top-20 right-10 w-12 h-12 bg-brand-500 border-4 border-black rotate-45 shadow-neo hidden md:block"></div>
          
          <div className="max-w-4xl relative z-10 space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-black uppercase leading-[1.15] tracking-tight">
              The File Storage <br className="hidden md:block" />
              <span className="bg-white px-4 py-2 border-4 border-black shadow-neo inline-block mt-4 -rotate-2">
                That Talks Back.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl font-bold text-black max-w-2xl mx-auto leading-relaxed">
              Ditch the boring folders. Store, search, and chat directly with your files using next-gen AI. It's like a brain for your drive.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              {user ? (
                <Link
                  href="/dashboard"
                  className="group flex items-center gap-2 px-8 py-4 bg-brand-500 text-black font-black uppercase text-lg border-4 border-black shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="w-6 h-6 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="group flex items-center gap-2 px-6 py-3 bg-brand-500 text-black font-black uppercase text-base border-4 border-black shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 stroke-[3] group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="px-6 py-3 bg-white text-black font-black uppercase text-base border-4 border-black shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Marquee */}
        <div className="flex overflow-x-hidden border-b-4 border-black bg-white py-4 whitespace-nowrap">
          <div className="animate-marquee flex gap-8 items-center font-black uppercase text-xl">
            {/* Repeated items for infinite effect */}
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className={i % 2 === 0 ? "text-neo-pink" : "text-neo-blue"}>★</span>
                <span>AI File Summaries</span>
                <span className={i % 2 === 0 ? "text-neo-pink" : "text-neo-blue"}>★</span>
                <span>Semantic Search</span>
              </span>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <section className="px-6 py-24 bg-neo-bg">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-black uppercase mb-16 text-center underline decoration-8 underline-offset-8 decoration-brand-500">
              Why AU Drive?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white border-4 border-black p-8 shadow-neo hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-neo-pink border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-neo-sm">
                  <Bot className="w-8 h-8 text-black stroke-[3]" />
                </div>
                <h3 className="text-2xl font-black text-black uppercase mb-4">Chat with Files</h3>
                <p className="font-bold text-black leading-relaxed">
                  Ask questions, extract data, and summarize long PDFs instantly with our built-in AI assistant.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white border-4 border-black p-8 shadow-neo hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-neo-blue border-4 border-black rounded-none flex items-center justify-center mb-6 shadow-neo-sm">
                  <Search className="w-8 h-8 text-black stroke-[3]" />
                </div>
                <h3 className="text-2xl font-black text-black uppercase mb-4">Semantic Search</h3>
                <p className="font-bold text-black leading-relaxed">
                  Don't remember the file name? No problem. Search by meaning, concepts, and inside document text.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white border-4 border-black p-8 shadow-neo hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-brand-500 border-4 border-black rounded-lg flex items-center justify-center mb-6 shadow-neo-sm">
                  <Shield className="w-8 h-8 text-black stroke-[3]" />
                </div>
                <h3 className="text-2xl font-black text-black uppercase mb-4">Secure Storage</h3>
                <p className="font-bold text-black leading-relaxed">
                  Enterprise-grade encryption and secure access links keep your sensitive data safe from prying eyes.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white border-4 border-black p-8 shadow-neo hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 bg-neo-yellow border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-neo-sm">
                  <Zap className="w-8 h-8 text-black stroke-[3]" />
                </div>
                <h3 className="text-2xl font-black text-black uppercase mb-4">Lightning Fast</h3>
                <p className="font-bold text-black leading-relaxed">
                  Built on Cloudflare R2 for zero-egress fee, ultra-fast uploads and downloads from anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-black uppercase tracking-widest">AU Drive</span>
          </div>
          <p className="font-bold text-black text-sm uppercase">
            © {new Date().getFullYear()} AU Drive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
