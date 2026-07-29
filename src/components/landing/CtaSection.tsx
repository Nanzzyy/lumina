'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';

export function CtaSection() {
  return (
    <section className="bg-stone-50 px-4 py-24 sm:px-6 lg:px-8">
      <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-stone-950 px-8 py-16 text-center sm:px-16 sm:py-20">
        {/* warm glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/25 blur-[100px]" />
          <div className="absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-orange-600/20 blur-[100px]" />
        </div>

        <div className="relative">
          <p className="font-serif text-sm italic tracking-wide text-amber-300">
            Your moment, beautifully announced.
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Ready to craft an invitation
            <span className="italic"> they&apos;ll remember?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-stone-300">
            No design experience needed. Pick a template, make it yours, and share it in minutes.
          </p>
          <Link
            href="/studio/new"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-amber-500/50"
          >
            Start Creating
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
