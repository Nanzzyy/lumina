'use client';

import Link from 'next/link';

/** Elegant botanical line-art sprig — wedding brand accent. */
function Sprig({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M100 190 C100 130 100 80 100 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {[36, 58, 80, 102, 124, 146].map((y, i) => {
        const s = i % 2 === 0 ? 1 : -1;
        return (
          <g key={i}>
            <path d={`M100 ${y} C${100 - 28 * s} ${y - 6} ${100 - 40 * s} ${y + 10} ${100 - 52 * s} ${y + 22}`} stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
            <ellipse cx={100 - 34 * s} cy={y + 12} rx="16" ry="7" fill="currentColor" opacity="0.18" transform={`rotate(${28 * s} ${100 - 34 * s} ${y + 12})`} />
            <ellipse cx={100 + 30 * s} cy={y + 4} rx="13" ry="6" fill="currentColor" opacity="0.14" transform={`rotate(${-24 * s} ${100 + 30 * s} ${y + 4})`} />
          </g>
        );
      })}
      <circle cx="100" cy="18" r="5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

const STATS = [
  { n: '23+', l: 'Premium Templates' },
  { n: 'Mobile', l: 'First Design' },
  { n: 'RSVP', l: 'Wishes & Gift' },
  { n: 'Music', l: 'Countdown & Maps' },
];

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--colors-primary-light)] via-white to-white" />
      <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-[var(--colors-primary)]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-rose-300/20 blur-3xl pointer-events-none" />
      <Sprig className="absolute top-28 left-2 sm:left-10 w-32 h-32 sm:w-44 sm:h-44 text-[var(--colors-primary)]/15 pointer-events-none" />
      <Sprig className="absolute bottom-8 right-2 sm:right-10 w-36 h-36 sm:w-52 sm:h-52 text-[var(--colors-primary)]/15 pointer-events-none -scale-x-100 rotate-12" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-[var(--colors-primary)]/20 text-xs font-medium text-[var(--colors-primary)] tracking-wide shadow-sm">
          <span className="text-sm leading-none">✦</span> Premium Digital Invitations
        </span>

        <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-bold font-[var(--typography-font-heading)] text-zinc-900 leading-[1.04]">
          Create Beautiful
          <br />
          <span className="text-[var(--colors-primary)] italic">Wedding Invitations</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          From elegant minimal to botanical, art-deco, and beyond — craft a one-of-a-kind
          digital invitation. Customize every detail, then share in minutes.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/studio/new"
            className="px-8 py-3.5 bg-[var(--colors-primary)] text-white rounded-full text-sm font-semibold hover:bg-[var(--colors-primary-hover)] transition-all shadow-lg shadow-[var(--colors-primary)]/25 hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Creating
          </Link>
          <Link
            href="/studio/templates"
            className="px-8 py-3.5 bg-white text-zinc-700 rounded-full text-sm font-semibold border border-zinc-200 hover:border-[var(--colors-primary)]/40 hover:text-[var(--colors-primary)] transition-all hover:-translate-y-0.5"
          >
            Browse Templates
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-200/60 rounded-2xl overflow-hidden border border-zinc-200/60 max-w-2xl mx-auto">
          {STATS.map((s) => (
            <div key={s.l} className="bg-white/80 backdrop-blur px-4 py-5 text-center">
              <p className="font-[var(--typography-font-heading)] text-xl sm:text-2xl font-bold text-[var(--colors-primary)]">{s.n}</p>
              <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 tracking-wide">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
