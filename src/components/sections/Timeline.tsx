'use client';

import { motion } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle, Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

const eventIcons: Record<string, string> = {
  'cocktail': 'glass', 'drinks': 'glass', 'welcome': 'glass',
  'ceremony': 'ring', 'ceremonial': 'ring',
  'dinner': 'cake', 'reception': 'cake',
  'dancing': 'music', 'party': 'music', 'music': 'music',
  'toast': 'heart',
};

function getIcon(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, icon] of Object.entries(eventIcons)) {
    if (lower.includes(key)) return icon;
  }
  return 'clock';
}

export function Timeline(props: SectionComponentProps) {
  const { content, variant } = props;
  const { title, items, note } = content.schedule;
  const isNoir = variant === 'noir';

  if (!items.length) return null;

  if (isNoir) {
    return (
      <Container>
        <SectionTitle title={title} subtitle="The evening's programme" accent />
        <div className="max-w-2xl mx-auto space-y-0">
          {items.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex gap-6 pb-8 last:pb-0 relative">
              {/* Timeline line */}
              {i < items.length - 1 && <div className="absolute left-[19px] top-10 bottom-0 w-px bg-[var(--colors-border)]" />}
              <div className="flex-shrink-0 w-10 h-10 rounded-full border border-[var(--colors-primary)] flex items-center justify-center bg-[var(--colors-background)] z-10">
                <span className="text-xs font-bold text-[var(--colors-primary)]">{i + 1}</span>
              </div>
              <div className="flex-1 pt-1">
                <span className="text-xs uppercase tracking-widest text-[var(--colors-primary)]">{item.time}</span>
                <h3 className="text-lg font-semibold text-[var(--colors-text)] mt-1">{item.title}</h3>
                {item.description && <p className="text-sm text-[var(--colors-text-secondary)] mt-1">{item.description}</p>}
              </div>
            </motion.div>
          ))}
        </div>
        {note && <p className="text-center text-sm text-[var(--colors-text-muted)] mt-8 italic">{note}</p>}
      </Container>
    );
  }

  return (
    <Container>
      <SectionTitle title={title} subtitle="Join us in celebrating our special day" accent />
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute left-[18px] sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--colors-primary)]/40 via-[var(--colors-primary)]/20 to-transparent -translate-x-1/2" />
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, delay: i * 0.15 }}
            className={cn('relative flex items-start gap-6 pb-12 last:pb-0', i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse')}>
            <div className="absolute left-[10px] sm:left-1/2 w-[18px] h-[18px] rounded-full border-[3px] border-[var(--colors-primary)] bg-white -translate-x-1/2 z-10" />
            <div className={cn('ml-10 sm:ml-0 sm:w-[calc(50%-2rem)]', i % 2 === 0 ? 'sm:pr-0 sm:text-right' : 'sm:pl-0')}>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--colors-primary)] bg-[var(--colors-primary-light)] px-3 py-1 rounded-full mb-2">
                <Icon name={getIcon(item.title) as any} size={12} />
                {item.time}
              </span>
              <h3 className="text-lg font-semibold text-[var(--colors-text)] font-[var(--typography-font-heading)]">{item.title}</h3>
              {item.description && <p className="text-sm text-[var(--colors-text-secondary)] mt-1 leading-relaxed">{item.description}</p>}
            </div>
          </motion.div>
        ))}
        {note && <p className="text-center text-sm text-[var(--colors-text-muted)] mt-4 italic">{note}</p>}
      </div>
    </Container>
  );
}
