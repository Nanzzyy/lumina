'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

const STATS: [string, string][] = [
  ['23+', 'Premium Templates'],
  ['Mobile-First', 'Responsive'],
  ['RSVP & Gifts', 'Built-in'],
  ['Maps & Music', 'Rich Media'],
];

/**
 * Invitation-card mockup (pure CSS, no asset) — gives the hero a real product
 * visual instead of a wall of text. Floats gently.
 */
function InvitationCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative w-80 rounded-[2rem] bg-gradient-to-br from-stone-50 to-stone-200 p-10 shadow-2xl shadow-black/40 ring-1 ring-white/40 ${className}`}
    >
      <div className="absolute inset-x-10 top-6 h-px bg-amber-300/60" />
      <p className="text-center text-[0.65rem] tracking-[0.35em] uppercase text-amber-700">
        The Wedding Of
      </p>
      <h3 className="mt-7 text-center font-serif text-4xl leading-tight text-stone-900">
        Ananda
        <span className="block font-serif italic text-2xl text-amber-600 my-1">&</span>
        Maya
      </h3>
      <div className="mx-auto my-6 h-px w-12 bg-amber-400" />
      <p className="text-center font-serif italic text-stone-500">Saturday, 14 June 2026</p>
      <p className="mt-2 text-center text-[0.7rem] tracking-wide text-stone-400">
        Bali, Indonesia
      </p>
      <div className="absolute inset-x-10 bottom-6 h-px bg-amber-300/60" />
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-stone-950 text-white">
      {/* Warm radial glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-32 h-[44rem] w-[44rem] rounded-full bg-amber-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-[36rem] w-[36rem] rounded-full bg-orange-600/15 blur-[110px]" />
        <div className="absolute -bottom-40 right-1/4 h-[30rem] w-[30rem] rounded-full bg-rose-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 pb-24 pt-36 sm:px-6 lg:grid-cols-2 lg:pb-32 lg:pt-44 lg:px-8">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200"
          >
            ✦ Premium Digital Invitations
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
            className="mt-8 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Beautiful
            <br />
            invitations,
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300 bg-clip-text italic text-transparent">
              effortlessly.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
            className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-stone-300 sm:text-lg lg:mx-0"
          >
            From intimate gatherings to grand celebrations — design, customize,
            and share stunning digital invitations in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: EASE }}
            className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link
              href="/studio/new"
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-amber-500/40"
            >
              Start Creating
            </Link>
            <Link
              href="/studio/templates"
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              Browse Templates
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12 lg:justify-start"
          >
            {STATS.map(([n, l]) => (
              <div key={l} className="text-center lg:text-left">
                <dt className="font-serif text-2xl font-semibold text-white">{n}</dt>
                <dd className="mt-0.5 text-xs tracking-wide text-stone-400">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="relative hidden lg:block"
        >
          <div className="absolute left-6 top-10 rotate-[-8deg]">
            <InvitationCard className="opacity-60 blur-[1px]" />
          </div>
          <div className="relative rotate-[4deg]">
            <InvitationCard className="animate-float" />
          </div>
        </motion.div>
      </div>

      {/* bottom fade into next (light) section */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-stone-50" aria-hidden="true" />
    </section>
  );
}
