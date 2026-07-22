'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export function Navbar() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const links = [
    { href: '/studio/templates', label: 'Templates' },
    { href: '/studio/layouts', label: 'Layouts' },
    { href: '/studio', label: 'Studio' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/60" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold font-[var(--typography-font-heading)] text-[var(--colors-primary)] tracking-tight">
          Lumina
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {links.map((item) => (
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
            className="ms-2 px-4 py-2 text-sm bg-[var(--colors-primary)] text-white rounded-lg hover:bg-[var(--colors-primary-hover)] transition-colors"
          >
            Login
          </Link>
        </div>

        {/* Mobile hamburger + chevron for overlay */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden p-2 -me-2 rounded-md hover:bg-zinc-100 transition-colors"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="sm:hidden border-t border-zinc-100 bg-white/95 backdrop-blur-md px-4 pb-5 pt-2 space-y-1">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="block px-3 py-2.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={close}
            className="block px-3 py-2.5 text-sm bg-[var(--colors-primary)] text-white rounded-lg text-center hover:bg-[var(--colors-primary-hover)] transition-colors"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
