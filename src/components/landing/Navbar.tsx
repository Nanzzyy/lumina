'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold font-[var(--typography-font-heading)] text-[var(--colors-primary)] tracking-tight">
          Lumina
        </Link>

        <div className="flex items-center gap-1">
          {[
            { href: '/studio/templates', label: 'Templates' },
            { href: '/studio/layouts', label: 'Layouts' },
            { href: '/studio', label: 'Studio' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-2 px-4 py-2 text-sm bg-[var(--colors-primary)] text-white rounded-lg hover:bg-[var(--colors-primary-hover)] transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
