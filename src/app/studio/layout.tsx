'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { initializeRegistries } from '@/lib/registry';

const navItems = [
  { href: '/studio', label: 'Dashboard', icon: 'grid' },
  { href: '/studio/new', label: 'New Invitation', icon: 'plus' },
];

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { initializeRegistries(); }, []);

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-5 border-b border-zinc-100">
          <button onClick={() => router.push('/studio')} className="text-lg font-bold font-[var(--typography-font-heading)] text-[var(--colors-primary)] tracking-tight">
            Lumina Studio
          </button>
          <p className="text-xs text-zinc-400 mt-0.5">Invitation Builder</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => router.push('/studio')}
            className={cn(
              'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
              pathname === '/studio'
                ? 'bg-[var(--colors-primary-light)] text-[var(--colors-primary)] font-medium'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
            )}
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Dashboard
            </span>
          </button>
          <button
            onClick={() => router.push('/studio/new')}
            className={cn(
              'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
              pathname === '/studio/new'
                ? 'bg-[var(--colors-primary-light)] text-[var(--colors-primary)] font-medium'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
            )}
          >
            <span className="flex items-center gap-2.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Invitation
            </span>
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={() => router.push('/')}
            className="w-full text-left px-3 py-2 rounded-md text-xs text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Site
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
