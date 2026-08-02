'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const bgClass = scrolled
    ? 'bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm'
    : 'bg-transparent';

  const textClass = scrolled ? 'text-stone-800' : 'text-white';
  const linkClass = scrolled
    ? 'text-stone-500 hover:text-stone-800'
    : 'text-white/80 hover:text-white';

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 ${bgClass} transition-colors duration-300`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className={`flex items-center gap-2 text-xl font-bold font-serif tracking-tight ${textClass}`}>
          <img src="/icon.png" alt="" className="h-8 w-8 rounded-lg shadow-sm" />
          <span>Lumina</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          <Link href="/studio/templates" className={`px-4 py-2 text-sm rounded-lg transition-colors ${linkClass} hover:bg-white/10`}>
            Templates
          </Link>
          <Link href="/studio/layouts" className={`px-4 py-2 text-sm rounded-lg transition-colors ${linkClass} hover:bg-white/10`}>
            Layouts
          </Link>
          <Link href="/studio" className={`px-4 py-2 text-sm rounded-lg transition-colors ${linkClass} hover:bg-white/10`}>
            Studio
          </Link>
          <Link
            href="/login"
            className={`ms-3 px-5 py-2 text-sm font-medium rounded-full transition-colors ${
              scrolled
                ? 'bg-stone-800 text-white hover:bg-stone-700'
                : 'bg-white/15 text-white border border-white/20 hover:bg-white/25'
            }`}
          >
            Login
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className={`sm:hidden p-2 -me-2 rounded-lg ${scrolled ? 'hover:bg-stone-100 text-stone-800' : 'hover:bg-white/10 text-white'} transition-colors`}
          aria-label={open ? 'Close' : 'Menu'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="sm:hidden bg-white border-t border-stone-200 px-4 pb-5 pt-2 space-y-1 shadow-lg">
          <Link href="/studio/templates" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-stone-500 hover:text-stone-800 rounded-lg">
            Templates
          </Link>
          <Link href="/studio/layouts" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-stone-500 hover:text-stone-800 rounded-lg">
            Layouts
          </Link>
          <Link href="/studio" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-stone-500 hover:text-stone-800 rounded-lg">
            Studio
          </Link>
          <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm bg-stone-800 text-white rounded-lg text-center font-medium hover:bg-stone-700">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
