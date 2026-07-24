'use client';

import { motion } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle } from '@/components/primitives';
import { useCountdown } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { parseFlexibleDate } from '@/lib/utils/date';

function CountdownDisplay({ targetDate, variant }: { targetDate: string; variant?: string }) {
  const timeLeft = useCountdown(targetDate);
  const isNoir = variant === 'noir';

  return (
    <div className={cn('flex justify-center gap-3 sm:gap-6', isNoir && 'gap-4 sm:gap-8')}>
      {Object.entries(timeLeft).map(([key, value], i) => (
        <motion.div key={key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6 }}
          className="text-center">
          <div className={cn(
            isNoir
              ? 'text-3xl sm:text-5xl font-bold text-[var(--colors-primary)]'
              : 'text-2xl sm:text-4xl font-bold text-[var(--colors-primary)] bg-[var(--colors-primary-light)] rounded-[var(--radius-lg)] w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center',
          )}>
            {String(value).padStart(2, '0')}
          </div>
          <div className={cn('text-xs uppercase tracking-wider mt-2', isNoir ? 'text-[var(--colors-text-muted)]' : 'text-[var(--colors-text-muted)]')}>
            {key}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function CountdownSection(props: SectionComponentProps) {
  const { content, variant } = props;
  const isNoir = variant === 'noir';

  return (
    <Container>
      <SectionTitle title={isNoir ? 'The Countdown' : 'Counting Down'}
        subtitle={isNoir ? 'Until we say I do' : "We can't wait to celebrate with you"} accent />
      <CountdownDisplay targetDate={content.event.date} variant={variant} />
      {(() => {
        const d = parseFlexibleDate(content.event.date);
        const when = d ? d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : content.event.date;
        return (
          <p className={cn('text-center text-sm mt-6', isNoir ? 'text-[var(--colors-text-muted)]' : 'text-[var(--colors-text-muted)]')}>
            {when}{content.event.time ? ` at ${content.event.time}` : ''}
          </p>
        );
      })()}
    </Container>
  );
}
