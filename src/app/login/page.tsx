'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { HttpError, postJson } from '@/lib/utils/api-client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const redirect = searchParams.get('redirect') || '/studio';

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await postJson('/api/auth/login', { password });
      router.push(redirect);
    } catch (e) {
      setError(e instanceof HttpError ? e.message : 'Network error. Try again.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="" className="h-10 w-10 rounded-xl" />
          <h1 className="font-[var(--typography-font-heading)] text-2xl text-zinc-800">Lumina Studio</h1>
        </div>
        <p className="mt-2 text-sm text-zinc-500">Masukkan password studio untuk melanjutkan.</p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs text-zinc-500">Password</label>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base sm:text-sm text-zinc-700 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300"
              placeholder="••••••••" autoFocus />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <button type="submit"
            className="w-full rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
            Masuk
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
