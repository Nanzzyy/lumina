'use client';

import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { useCountdown } from '@/hooks';
import { Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

const variants: Record<string, Variants> = {
  romantic: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: 'easeOut' } },
  },
  aria: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.25 } },
  },
  noir: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.2 } },
  },
};

const childVariants: Record<string, Variants> = {
  aria: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  },
  noir: {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  },
};

function AriaHero({ content }: { content: SectionComponentProps['content'] }) {
  const [opened, setOpened] = useState(false);
  const cv = childVariants.aria;

  // Scroll lock until opened
  useEffect(() => {
    if (!opened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [opened]);

  if (!opened) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[var(--colors-primary)]/90 to-[var(--colors-secondary)]/90">
        <div className="absolute inset-0">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-white/5 blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-white/5 blur-3xl animate-pulse delay-700" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="text-center z-10 px-6"
        >
          <p className="text-white/50 text-sm uppercase tracking-[0.3em] mb-4">You are cordially invited to</p>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-[var(--typography-font-heading)] text-white mb-6 leading-tight">
            {content.couple.partner1} <span className="text-white/60">&</span> {content.couple.partner2}
          </h1>
          <p className="text-white/60 text-base sm:text-lg mb-10">
            {new Date(content.event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpened(true)}
            className="px-10 py-4 rounded-full border-2 border-white/30 text-white/90 text-sm uppercase tracking-[0.2em]
                       hover:bg-white/10 hover:border-white/50 transition-all duration-500"
          >
            <span className="flex items-center gap-3">
              Open Invitation
              <Icon name="arrow-down" size={16} />
            </span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[var(--colors-primary)]/90 to-[var(--colors-secondary)]/90">
      <div className="absolute inset-0">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-white/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-white/5 blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 text-center px-4 py-20 max-w-4xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={variants.aria}>
          <motion.p variants={cv} className="text-white/70 text-sm sm:text-base uppercase tracking-[0.3em] mb-6 font-[var(--typography-font-body)]">
            Wedding Invitation
          </motion.p>
          <motion.h1 variants={cv} className="text-5xl sm:text-6xl md:text-7xl font-bold text-white font-[var(--typography-font-heading)] leading-tight">
            {content.couple.partner1}
          </motion.h1>
          <motion.div variants={cv} className="flex items-center justify-center gap-4 my-6">
            <span className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <Icon name="heart" size={20} className="text-white/60" />
            <span className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </motion.div>
          <motion.h2 variants={cv} className="text-5xl sm:text-6xl md:text-7xl font-bold text-white font-[var(--typography-font-heading)] leading-tight">
            {content.couple.partner2}
          </motion.h2>

          <motion.div variants={cv} className="mt-10">
            <HeroCountdown date={content.event.date} />
          </motion.div>

          <motion.div variants={cv} className="mt-8 text-white/70 space-y-1">
            <p className="text-lg font-[var(--typography-font-accent)]">
              {new Date(content.event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm opacity-60">{content.event.time} · {content.event.location}</p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <Icon name="arrow-down" size={20} className="text-white/50" />
      </motion.div>
    </div>
  );
}

function NoirHero({ content }: { content: SectionComponentProps['content'] }) {
  const cv = childVariants.noir;

  return (
    <div className="relative min-h-screen flex items-center bg-[var(--colors-background)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--colors-background)] via-[var(--colors-background)] to-[var(--colors-background)]" />
      <div className="absolute top-0 right-0 w-1/2 h-full">
        <div className="w-full h-full bg-gradient-to-bl from-[var(--colors-primary)]/5 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="visible" variants={variants.noir}>
            <motion.p variants={cv} className="text-[var(--colors-primary)] text-sm uppercase tracking-[0.35em] mb-6">
              Save the Date
            </motion.p>
            <motion.h1 variants={cv} className="text-6xl sm:text-7xl md:text-8xl font-bold font-[var(--typography-font-heading)] leading-[0.9] text-[var(--colors-text)] mb-4">
              {content.couple.partner1}
            </motion.h1>
            <motion.div variants={cv} className="text-4xl sm:text-5xl md:text-6xl font-[var(--typography-font-heading)] text-[var(--colors-primary)] my-4">
              &
            </motion.div>
            <motion.h2 variants={cv} className="text-6xl sm:text-7xl md:text-8xl font-bold font-[var(--typography-font-heading)] leading-[0.9] text-[var(--colors-text)] mb-8">
              {content.couple.partner2}
            </motion.h2>

            <motion.div variants={cv} className="space-y-3 mb-10">
              <div className="flex items-center gap-3 text-[var(--colors-text-secondary)]">
                <Icon name="calendar" size={16} className="text-[var(--colors-primary)]" />
                <span className="text-sm tracking-wide">{new Date(content.event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--colors-text-secondary)]">
                <Icon name="clock" size={16} className="text-[var(--colors-primary)]" />
                <span className="text-sm tracking-wide">{content.event.time}</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--colors-text-secondary)]">
                <Icon name="map-pin" size={16} className="text-[var(--colors-primary)]" />
                <span className="text-sm tracking-wide">{content.event.location}</span>
              </div>
            </motion.div>

            <motion.div variants={cv}>
              <HeroCountdown date={content.event.date} noir />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="hidden md:block aspect-[3/4] rounded-sm overflow-hidden border border-[var(--colors-border)]"
          >
            <div className="w-full h-full bg-gradient-to-br from-[var(--colors-primary)]/10 via-[var(--colors-surface)] to-[var(--colors-secondary)]/10" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function HeroCountdown({ date, noir }: { date: string; noir?: boolean }) {
  const timeLeft = useCountdown(date);
  return (
    <div className={cn('flex gap-4 sm:gap-6', noir && 'justify-start')}>
      {Object.entries(timeLeft).map(([key, value]) => (
        <div key={key} className={cn('text-center', noir ? 'text-left' : '')}>
          <div className={cn(
            'font-bold',
            noir ? 'text-3xl sm:text-4xl text-[var(--colors-primary)]' : 'text-2xl sm:text-3xl text-white drop-shadow-lg',
          )}>
            {String(value).padStart(2, '0')}
          </div>
          <div className={cn('text-xs uppercase tracking-widest mt-1', noir ? 'text-[var(--colors-text-muted)]' : 'text-white/60')}>
            {key}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Hero(props: SectionComponentProps) {
  const { variant } = props;
  if (variant === 'noir') return <NoirHero content={props.content} />;
  if (variant === 'aria') return <AriaHero content={props.content} />;
  return <AriaHero content={props.content} />;
}
