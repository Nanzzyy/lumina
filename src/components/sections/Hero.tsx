'use client';

import { motion } from 'framer-motion';
import { useCountdown } from '@/hooks';
import { Icon, Container } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';
import { parseFlexibleDate } from '@/lib/utils/date';
import type { SectionComponentProps } from '@/lib/template';

/** English long-date display; falls back to the raw string if unparseable. */
const fmtEN = (s: string) =>
  parseFlexibleDate(s)?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) || s;

function HeroCountdown({ date, dense }: { date: string; dense?: boolean }) {
  const timeLeft = useCountdown(date);
  return (
    <div className={cn('flex gap-3 sm:gap-5 justify-center', dense && 'gap-2')}>
      {Object.entries(timeLeft).map(([key, value]) => (
        <div key={key} className="text-center">
          <span className={cn('text-xl sm:text-3xl font-bold text-[var(--colors-primary)] tabular-nums', dense && 'text-lg')}>
            {String(value).padStart(2, '0')}
          </span>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-[var(--colors-text-muted)] mt-1">{key}</p>
        </div>
      ))}
    </div>
  );
}

// ─── aurora / royal — Luxury Dark Cinematic ───
function LuxuryHero({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <section id="section-hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--colors-primary)_0%,_transparent_60%)] opacity-8" />
      <div className="relative z-10 text-center px-6 py-16 max-w-4xl mx-auto">
        <p className="text-[var(--colors-text-muted)] text-xs uppercase tracking-[0.3em] mb-6">Kepada Yth.</p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl md:text-7xl font-bold text-[var(--colors-text)] font-[var(--typography-font-heading)] leading-tight">
          {content.couple.partner1}
          <span className="mx-3 text-[var(--colors-primary)] font-[var(--typography-font-accent)]">&amp;</span>
          {content.couple.partner2}
        </motion.h1>
        <p className="mt-6 text-[var(--colors-text-secondary)] text-sm sm:text-base max-w-lg mx-auto leading-relaxed">{content.hero?.subtitle || 'Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir.'}</p>
        <div className="flex justify-center mt-10"><HeroCountdown date={content.event.date} /></div>
        <p className="mt-8 text-[var(--colors-text-secondary)] text-xs tracking-[0.2em]">{content.event.date} · {content.event.time} · {content.event.location}</p>
      </div>
    </section>
  );
}

// ─── fleur / sakura — Romantic Garden ───
function RomanticHero({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <section id="section-hero" className="relative py-24 sm:py-32 flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--colors-primary-light)_0%,_transparent_60%)]" />
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <Icon name="flower" size={32} className="mx-auto text-[var(--colors-primary)]/30 mb-8" />
        <p className="text-[var(--colors-text-muted)] text-xs uppercase tracking-[0.3em] mb-4">Kepada Yth.</p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl sm:text-5xl md:text-6xl font-bold text-[var(--colors-text)] font-[var(--typography-font-heading)] leading-tight">
          {content.couple.partner1} <span className="text-[var(--colors-primary)]">&amp;</span> {content.couple.partner2}
        </motion.h1>
        <p className="mt-5 text-[var(--colors-text-secondary)] text-sm sm:text-base max-w-md mx-auto leading-relaxed">{content.hero?.subtitle || 'Kami mengundang Anda untuk hadir di hari bahagia kami.'}</p>
        <div className="flex justify-center mt-8"><HeroCountdown date={content.event.date} /></div>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <a href="#rsvp" className="inline-flex items-center justify-center gap-2 bg-[var(--colors-primary)] text-white px-6 py-3 text-sm rounded-full hover:opacity-90 transition-opacity shadow-sm">Konfirmasi Kehadiran</a>
          <a href="#gallery" className="inline-flex items-center justify-center gap-2 border border-[var(--colors-primary)] text-[var(--colors-primary)] px-6 py-3 text-sm rounded-full hover:bg-[var(--colors-primary)]/5 transition-colors">Lihat Galeri</a>
        </div>
      </div>
    </section>
  );
}

// ─── ivory / nordic / verona — Minimal Editorial ───
function MinimalHero({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <section id="section-hero" className="py-20 sm:py-28 bg-[var(--colors-background)]">
      <Container>
        <p className="text-[var(--colors-text-muted)] text-xs uppercase tracking-[0.4em] mb-8 text-center">Kepada Yth.</p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl sm:text-5xl md:text-7xl font-bold text-center text-[var(--colors-text)] font-[var(--typography-font-heading)] leading-tight">
          {content.couple.partner1} &amp; {content.couple.partner2}
        </motion.h1>
        <p className="mt-6 text-[var(--colors-text-secondary)] text-sm sm:text-base max-w-lg mx-auto text-center leading-relaxed">{content.hero?.subtitle || ''}</p>
        <div className="flex justify-center mt-8"><HeroCountdown date={content.event.date} /></div>
        <div className="flex justify-center mt-8 gap-6">
          <div className="text-center"><p className="text-xs text-[var(--colors-text-muted)] uppercase mb-1">Tanggal</p><p className="text-sm font-medium text-[var(--colors-text)]">{content.event.date}</p></div>
          <div className="text-center"><p className="text-xs text-[var(--colors-text-muted)] uppercase mb-1">Waktu</p><p className="text-sm font-medium text-[var(--colors-text)]">{content.event.time}</p></div>
          <div className="text-center"><p className="text-xs text-[var(--colors-text-muted)] uppercase mb-1">Tempat</p><p className="text-sm font-medium text-[var(--colors-text)]">{content.event.location}</p></div>
        </div>
      </Container>
    </section>
  );
}

// ─── luna — Moonlit Stargazing ───
function LunaHero({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <section id="section-hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0d1321]">
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full" style={{
            width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px',
            left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', opacity: Math.random() * 0.3 + 0.1,
          }} />
        ))}
      </div>
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto py-20">
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl sm:text-5xl md:text-6xl font-light text-white font-[var(--typography-font-heading)] leading-tight tracking-wide">
          {content.couple.partner1}
        </motion.h1>
        <p className="text-white/20 text-2xl my-3 font-[var(--typography-font-accent)]">&amp;</p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl sm:text-5xl md:text-6xl font-light text-white font-[var(--typography-font-heading)] leading-tight tracking-wide">
          {content.couple.partner2}
        </motion.h2>
        <p className="mt-8 text-white/40 text-sm max-w-md mx-auto leading-relaxed">{content.hero?.subtitle || ''}</p>
        <div className="flex justify-center mt-10"><HeroCountdown date={content.event.date} /></div>
        <p className="mt-8 text-white/30 text-xs tracking-[0.2em]">{content.event.date} · {content.event.time} · {content.event.location}</p>
      </div>
    </section>
  );
}

// ─── celeste — Ethereal Sky ───
function CelesteHero({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <section id="section-hero" className="relative py-24 sm:py-32 bg-gradient-to-b from-[var(--colors-background-alt)] to-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {[30, 60, 80].map((x, i) => (
          <div key={i} className="absolute rounded-full bg-[var(--colors-primary)]/30 blur-3xl"
            style={{ width: '50vw', height: '30vh', left: x + '%', top: (i * 20 + 10) + '%' }} />
        ))}
      </div>
      <Container>
        <p className="text-[var(--colors-primary)] text-xs uppercase tracking-[0.4em] mb-6 text-center">Wedding Invitation</p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl sm:text-5xl md:text-7xl font-[var(--typography-font-heading)] text-center text-[var(--colors-text)] leading-tight">
          {content.couple.partner1}
          <br />
          <span className="text-2xl sm:text-4xl md:text-5xl text-[var(--colors-primary)] font-[var(--typography-font-accent)]">&amp;</span>
          <br />
          {content.couple.partner2}
        </motion.h1>
        <p className="mt-6 text-[var(--colors-text-secondary)] text-sm max-w-md mx-auto text-center">{content.hero?.subtitle || ''}</p>
        <div className="flex justify-center mt-8"><HeroCountdown date={content.event.date} dense /></div>
        <div className="mt-8 text-center text-[var(--colors-text-muted)] text-xs tracking-wide">{content.event.date} · {content.event.time} · {content.event.location}</div>
      </Container>
    </section>
  );
}

// ─── noir — Dark Editorial Split (existing, referenced) ───
function NoirHero({ content }: { content: SectionComponentProps['content'] }) {
  return (
    <div className="relative min-h-screen flex items-center" style={{ backgroundColor: 'var(--colors-background)' }}>
      <div className="absolute top-0 right-0 w-1/2 h-full hidden md:block opacity-5" style={{ background: `linear-gradient(to left, var(--colors-primary), transparent)` }} />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-12 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } }}>
            <motion.p variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="text-[var(--colors-primary)] text-sm uppercase tracking-[0.35em] mb-6">Save the Date</motion.p>
            <motion.h1 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="text-3xl sm:text-6xl md:text-7xl font-bold font-[var(--typography-font-heading)] leading-tight text-[var(--colors-text)] mb-2">{content.couple.partner1}</motion.h1>
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="text-2xl sm:text-4xl md:text-5xl font-[var(--typography-font-heading)] text-[var(--colors-primary)] my-2 sm:my-4">&amp;</motion.div>
            <motion.h2 variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="text-3xl sm:text-6xl md:text-7xl font-bold font-[var(--typography-font-heading)] leading-tight text-[var(--colors-text)] mb-6 sm:mb-8">{content.couple.partner2}</motion.h2>
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="space-y-3 mb-10 text-[var(--colors-text-secondary)] text-sm">
              <div className="flex items-center gap-3"><Icon name="calendar" size={14} className="text-[var(--colors-primary)]" />{fmtEN(content.event.date)}</div>
              <div className="flex items-center gap-3"><Icon name="clock" size={14} className="text-[var(--colors-primary)]" />{content.event.time}</div>
              <div className="flex items-center gap-3"><Icon name="map-pin" size={14} className="text-[var(--colors-primary)]" />{content.event.location}</div>
            </motion.div>
            <HeroCountdown date={content.event.date} />
          </motion.div>
          <div className="hidden md:block aspect-[3/4] rounded-sm overflow-hidden border border-[var(--colors-border)]">
            <div className="w-full h-full" style={{ background: `linear-gradient(to bottom right, var(--colors-primary), var(--colors-secondary))`, opacity: 0.1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dispatcher ───
const HERO_MAP: Record<string, React.FC<{ content: SectionComponentProps['content'] }>> = {
  aurora: LuxuryHero, royal: LuxuryHero,
  fleur: RomanticHero, sakura: RomanticHero,
  ivory: MinimalHero, nordic: MinimalHero, verona: MinimalHero,
  luna: LunaHero, celeste: CelesteHero, noir: NoirHero,
};

export function Hero(props: SectionComponentProps) {
  const v = props.variant || 'aurora';
  const Component = HERO_MAP[v];
  if (Component) return <Component content={props.content} />;
  return <RomanticHero content={props.content} />;
}
