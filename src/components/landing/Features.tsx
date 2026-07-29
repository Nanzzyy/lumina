'use client';

import { Sparkles, Smartphone, MapPin, Music, Gift, Share2 } from 'lucide-react';
import { Reveal } from './Reveal';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Fully Customizable',
    body: 'Tune colors, typography, and layout until every detail feels unmistakably yours.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First',
    body: 'Crisp, responsive designs that look flawless on every screen your guests open.',
  },
  {
    icon: Gift,
    title: 'RSVP & Gifts',
    body: 'Collect responses and gift envelopes with built-in, frictionless forms.',
  },
  {
    icon: MapPin,
    title: 'Maps & Location',
    body: 'Embedded maps and directions so no guest ever loses their way.',
  },
  {
    icon: Music,
    title: 'Background Music',
    body: 'Set the mood the moment your invitation opens with a soundtrack you choose.',
  },
  {
    icon: Share2,
    title: 'Share Anywhere',
    body: 'One link, everywhere — WhatsApp, social, email. Beautiful on every platform.',
  },
];

export function Features() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
            Why Lumina
          </span>
          <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Everything you need,
            <span className="italic text-amber-600"> nothing you don&apos;t.</span>
          </h2>
          <p className="mt-4 text-stone-500">
            Thoughtful features that turn a simple invitation into a memorable first impression.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="group h-full rounded-2xl border border-stone-200 bg-stone-50/50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
