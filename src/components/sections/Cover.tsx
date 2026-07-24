'use client';

import { motion } from 'framer-motion';
import { Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';
import { parseFlexibleDate } from '@/lib/utils/date';
import type { SectionComponentProps } from '@/lib/template';

/** Indonesian date display; falls back to the raw string if unparseable. */
const fmtID = (s: string) =>
  parseFlexibleDate(s)?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) || s;

// ─── Variant: aurora/royal (Luxury Dark Gold) ───
function LuxuryCover({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--colors-primary)_0%,_transparent_60%)] opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--colors-secondary)_0%,_transparent_50%)] opacity-5" />

      <motion.div className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        initial="hidden" animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.25 } } }}>
        
        <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-[var(--colors-text-muted)] text-xs sm:text-sm uppercase tracking-[0.3em] mb-8">
          The Wedding Of
        </motion.p>

        <motion.h1 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          className="text-5xl sm:text-7xl md:text-8xl font-bold text-[var(--colors-text)] font-[var(--typography-font-heading)] leading-none">
          {content.couple.partner1}
        </motion.h1>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="flex items-center justify-center gap-6 my-8">
          <span className="w-20 h-px bg-[var(--colors-primary)]/50" />
          <span className="text-[var(--colors-primary)] font-[var(--typography-font-accent)] text-2xl">&amp;</span>
          <span className="w-20 h-px bg-[var(--colors-primary)]/50" />
        </motion.div>

        <motion.h2 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          className="text-5xl sm:text-7xl md:text-8xl font-bold text-[var(--colors-text)] font-[var(--typography-font-heading)] leading-none">
          {content.couple.partner2}
        </motion.h2>

        <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mt-10 text-[var(--colors-text-secondary)] text-sm sm:text-base tracking-widest">
          {fmtID(content.event.date)}
          {' · '}{content.event.time}
        </motion.p>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mt-14">
          <a href="#section-hero" className="inline-block border border-[var(--colors-primary)]/30 text-[var(--colors-primary)] px-10 py-4 text-xs uppercase tracking-[0.3em] hover:bg-[var(--colors-primary)]/10 transition-all duration-500 rounded-sm">
            Buka Undangan
          </a>
        </motion.div>
      </motion.div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
        <Icon name="arrow-down" size={16} className="text-[var(--colors-text-muted)]" />
      </motion.div>
    </section>
  );
}

// ─── Variant: fleur/sakura (Romantic Floral Light) ───
function RomanticCover({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--colors-primary)_0%,_transparent_50%)] opacity-[0.04]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--colors-primary)]/20" />

      <motion.div className="relative z-10 text-center px-6 max-w-2xl mx-auto"
        initial="hidden" animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } } }}>
        
        <motion.div variants={{ hidden: { scale: 0 }, visible: { scale: 1, transition: { type: 'spring', stiffness: 200 } } }}
          className="mb-10">
          <Icon name="flower" size={40} className="mx-auto text-[var(--colors-primary)]/40" />
        </motion.div>

        <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="text-[var(--colors-text-muted)] text-[11px] uppercase tracking-[0.35em] mb-6">
          You are invited to celebrate
        </motion.p>

        <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold text-[var(--colors-text)] font-[var(--typography-font-heading)] leading-tight">
          {content.couple.partner1} <span className="text-[var(--colors-primary)]">&</span> {content.couple.partner2}
        </motion.h1>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="flex items-center justify-center gap-4 my-8">
          <span className="w-12 h-[1px] bg-[var(--colors-primary)]/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--colors-primary)]/40" />
          <span className="w-12 h-[1px] bg-[var(--colors-primary)]/30" />
        </motion.div>

        <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="text-[var(--colors-text-secondary)] text-sm tracking-wide">
          {fmtID(content.event.date)}
        </motion.p>

        <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="text-[var(--colors-text-secondary)] text-sm tracking-wide mt-1">
          {content.event.time} · {content.event.location}
        </motion.p>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mt-12">
          <a href="#section-hero" className="inline-block bg-[var(--colors-primary)] text-white px-8 py-3 text-sm rounded-full hover:opacity-90 transition-opacity shadow-md">
            Buka Undangan
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Variant: ivory/nordic/verona (Minimal Clean) ───
function MinimalCover({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--colors-background)' }}>
      <motion.div className="relative z-10 text-center px-6 max-w-2xl mx-auto"
        initial="hidden" animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.25 } } }}>
        
        <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
          className="text-[var(--colors-text-muted)] text-xs tracking-[0.4em] uppercase mb-12 font-medium">
          Wedding Invitation
        </motion.p>

        <motion.h1 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          className="text-6xl sm:text-7xl md:text-9xl font-bold text-[var(--colors-text)] font-[var(--typography-font-heading)] leading-[0.9]">
          {content.couple.partner1}
        </motion.h1>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="flex items-center justify-center gap-5 my-5">
          <div className="w-10 h-[1px] bg-[var(--colors-text-muted)]" />
          <span className="text-[var(--colors-primary)] text-2xl font-[var(--typography-font-accent)]">&amp;</span>
          <div className="w-10 h-[1px] bg-[var(--colors-text-muted)]" />
        </motion.div>

        <motion.h2 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          className="text-6xl sm:text-7xl md:text-9xl font-bold text-[var(--colors-text)] font-[var(--typography-font-heading)] leading-[0.9]">
          {content.couple.partner2}
        </motion.h2>

        <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mt-12 text-[var(--colors-text-secondary)] text-sm font-medium tracking-[0.2em]">
          {fmtID(content.event.date)}
          {' — '}{content.event.location}
        </motion.p>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mt-14">
          <a href="#section-hero" className="inline-block border-b-2 border-[var(--colors-primary)] text-[var(--colors-text)] px-2 py-2 text-xs uppercase tracking-[0.3em] font-medium hover:text-[var(--colors-primary)] transition-colors">
            Open
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Variant: luna (Moonlit Starry) ───
function LunaCover({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d1321]">
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px', height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%', top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.1,
              animationDelay: Math.random() * 3 + 's', animationDuration: (Math.random() * 3 + 2) + 's',
            }} />
        ))}
      </div>

      <motion.div className="relative z-10 text-center px-6 max-w-2xl mx-auto"
        initial="hidden" animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.3 } } }}>
        
        <motion.div variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { duration: 1.5 } } }}
          className="mb-12">
          <div className="w-20 h-20 mx-auto rounded-full border border-white/10 flex items-center justify-center">
            <span className="text-white/20 text-3xl">☽</span>
          </div>
        </motion.div>

        <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-4xl sm:text-5xl md:text-6xl font-light text-white font-[var(--typography-font-heading)] leading-tight tracking-wide">
          {content.couple.partner1} <span className="text-[var(--colors-primary)]/60">&amp;</span> {content.couple.partner2}
        </motion.h1>

        <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="mt-10 text-white/40 text-xs uppercase tracking-[0.4em]">
          {fmtID(content.event.date)}
        </motion.p>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mt-14">
          <a href="#section-hero" className="inline-block border border-white/10 text-white/60 px-8 py-3 text-xs uppercase tracking-[0.2em] hover:border-white/30 hover:text-white/90 transition-all duration-500 rounded-full">
            Buka Undangan
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Variant: celeste (Sky Blue Ethereal) ───
function CelesteCover({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#f0f8fc] via-white to-[#e8f4fa]">
      <div className="absolute inset-0 opacity-20">
        {[20, 40, 60].map((x, i) => (
          <div key={i} className="absolute rounded-full bg-[var(--colors-primary)]/20 blur-3xl"
            style={{ width: i === 0 ? '60vw' : i === 1 ? '40vw' : '50vw', height: '40vh', left: x + '%', top: (i * 25 + 10) + '%' }} />
        ))}
      </div>

      <motion.div className="relative z-10 text-center px-6 max-w-2xl mx-auto"
        initial="hidden" animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } }}>
        
        <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="text-[var(--colors-primary)] text-xs uppercase tracking-[0.4em] mb-8 font-medium">
          The Wedding
        </motion.p>

        <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-5xl sm:text-6xl md:text-8xl font-[var(--typography-font-heading)] text-[var(--colors-text)] leading-tight">
          {content.couple.partner1}
          <br />
          <span className="text-4xl sm:text-5xl md:text-6xl text-[var(--colors-primary)] font-[var(--typography-font-accent)]">&amp;</span>
          <br />
          {content.couple.partner2}
        </motion.h1>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="w-16 h-px bg-[var(--colors-primary)]/30 mx-auto my-8" />

        <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="text-[var(--colors-text-secondary)] text-sm">
          {fmtID(content.event.date)}
        </motion.p>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mt-12">
          <a href="#section-hero" className="inline-block bg-[var(--colors-primary)] text-white px-8 py-3 text-sm rounded-lg hover:opacity-90 transition-opacity shadow-md">
            Buka Undangan
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Main Cover dispatcher ───
const VARIANT_MAP: Record<string, React.FC<{ content: SectionComponentProps['content'] }>> = {
  aurora: LuxuryCover, royal: LuxuryCover,
  fleur: RomanticCover, sakura: RomanticCover,
  ivory: MinimalCover, nordic: MinimalCover, verona: MinimalCover,
  luna: LunaCover,
  celeste: CelesteCover,
};

export function Cover(props: SectionComponentProps) {
  const variant = props.variant || 'aurora';
  const Component = VARIANT_MAP[variant];

  if (Component) return <Component content={props.content} />;
  return <RomanticCover content={props.content} />;
}
