'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HardDrive, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const { data } = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setUser(data.data.user, data.data.accessToken);
      toast.success('Account created! Welcome to EchoDrive 🚀');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neo-bg px-4">
      <div className="w-full max-w-md my-8">
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
          <span className="text-3xl font-bold text-black uppercase tracking-widest">EchoDrive</span>
        </div>

        <div className="bg-white border-4 border-black p-8 shadow-neo">
          <h1 className="text-2xl font-bold text-black mb-1 uppercase">Create account</h1>
          <p className="text-black font-bold text-sm mb-8">Start your AI-powered drive for free</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Johnson"
                className="w-full bg-white border-2 border-black px-4 py-3 text-sm text-black placeholder-gray-500 focus:outline-none focus:shadow-neo focus:-translate-y-[2px] focus:-translate-x-[2px] font-bold transition-all"
              />
            </div>

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
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white border-2 border-black px-4 py-3 text-sm text-black placeholder-gray-500 focus:outline-none focus:shadow-neo focus:-translate-y-[2px] focus:-translate-x-[2px] font-bold transition-all"
              />
            </div>

            {/* Password strength hint */}
            {form.password.length > 0 && (
              <div className="flex gap-1 border-2 border-black p-1 shadow-neo-sm">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 transition-colors border-r-2 border-black last:border-r-0 ${
                      form.password.length >= (i + 1) * 3
                        ? form.password.length >= 12
                          ? 'bg-neo-blue'
                          : 'bg-neo-yellow'
                        : 'bg-white'
                    }`}
                  />
                ))}
              </div>
            )}

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
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-black font-bold">
            Already have an account?{' '}
            <Link href="/login" className="text-black bg-neo-yellow px-2 py-1 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
