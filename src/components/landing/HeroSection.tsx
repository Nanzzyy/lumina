'use client';

import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--colors-primary-light)] to-white" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--colors-primary)]/5 to-transparent" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-[var(--typography-font-heading)] text-zinc-900 leading-tight">
          Create Beautiful
          <br />
          <span className="text-[var(--colors-primary)]">Wedding Invitations</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          Premium digital invitations with stunning templates and flexible layouts.
          Design, customize, and share in minutes.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/studio/new"
            className="px-8 py-3.5 bg-[var(--colors-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--colors-primary-hover)] transition-colors shadow-lg shadow-[var(--colors-primary)]/20"
          >
            Start Creating
          </Link>
          <Link
            href="/studio/templates"
            className="px-8 py-3.5 bg-white text-zinc-700 rounded-xl text-sm font-medium border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all"
          >
            Browse Templates
          </Link>
        </div>
      </div>
    </section>
  );
}
