'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HardDrive, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await authApi.login({ email: form.email, password: form.password });
      setUser(data.data.user, data.data.accessToken);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neo-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
              <rect x="14" y="14" width="72" height="72" fill="#000000" />
              <rect x="4" y="4" width="72" height="72" fill="#22c55e" stroke="#000000" strokeWidth="6" />
              <path d="M 22 40 L 58 40" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
              <path d="M 22 56 L 46 56" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
              <rect x="22" y="24" width="12" height="12" fill="#FDE047" stroke="#000000" strokeWidth="4" />
            </svg>
          </div>
          <span className="text-3xl font-bold text-black uppercase tracking-widest">AU Drive</span>
        </div>

        <div className="bg-white border-4 border-black p-8 shadow-neo">
          <h1 className="text-2xl font-bold text-black mb-1 uppercase">Welcome back</h1>
          <p className="text-black font-bold text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-white border-2 border-black px-4 py-3 text-sm text-black placeholder-gray-500 focus:outline-none focus:shadow-neo focus:-translate-y-[2px] focus:-translate-x-[2px] font-bold transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-black px-4 py-3 pr-10 text-sm text-black placeholder-gray-500 focus:outline-none focus:shadow-neo focus:-translate-y-[2px] focus:-translate-x-[2px] font-bold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black border-2 border-transparent hover:border-black bg-white p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 stroke-[3]" /> : <Eye className="w-5 h-5 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500 border-2 border-black px-4 py-3 text-sm font-bold text-black shadow-neo-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none px-4 py-3 text-sm transition-all uppercase"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin stroke-[3]" />}
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-black font-bold">
            Don't have an account?{' '}
            <Link href="/register" className="text-black bg-neo-yellow px-2 py-1 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ml-1">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
