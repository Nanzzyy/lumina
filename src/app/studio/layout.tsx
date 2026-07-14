'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { initializeRegistries } from '@/lib/registry';

const navItems = [
  { href: '/studio', label: 'Dashboard', icon: 'grid' },
  { href: '/studio/templates', label: 'Templates', icon: 'palette' },
  { href: '/studio/layouts', label: 'Layouts', icon: 'layout' },
  { href: '/studio/new', label: 'New Invitation', icon: 'plus', highlight: true },
];

function NavIcon({ name }: { name: string }) {
  switch (name) {
    case 'grid':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case 'palette':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    case 'layout':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      );
    case 'plus':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      );
    default:
      return null;
  }
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { initializeRegistries(); }, []);

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <aside className="w-56 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-5 border-b border-zinc-100">
          <button onClick={() => router.push('/studio')} className="text-lg font-bold font-[var(--typography-font-heading)] text-[var(--colors-primary)] tracking-tight">
            Lumina Studio
          </button>
          <p className="text-xs text-zinc-400 mt-0.5">Invitation Builder</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/studio' && pathname.startsWith(item.href));
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2.5',
                  isActive
                    ? 'bg-[var(--colors-primary-light)] text-[var(--colors-primary)] font-medium'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
                  item.highlight && !isActive && 'border border-[var(--colors-primary)]/20',
                )}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={() => router.push('/')}
            className="w-full text-left px-3 py-2 rounded-md text-xs text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Site
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
