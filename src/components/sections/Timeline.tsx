'use client';

import { motion } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle, Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

const eventIcons: Record<string, string> = {
  'cocktail': 'glass', 'drinks': 'glass', 'welcome': 'glass',
  'ceremony': 'ring', 'reception': 'cake', 'dinner': 'cake',
  'dancing': 'music', 'party': 'music', 'toast': 'heart',
};

function getIcon(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, icon] of Object.entries(eventIcons)) if (lower.includes(key)) return icon;
  return 'clock';
}

// ─── aurora/royal — Centered alternating with gold dots ───
function LuxuryTimeline({ content }: { content: SectionComponentProps['content'] }) {
  const { title, items, note } = content.schedule;
  return (
    <Container>
      <SectionTitle title={title} subtitle="Rangkaian Acara" accent />
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--colors-primary)]/40 via-[var(--colors-primary)]/20 to-transparent -translate-x-1/2" />
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
            className={cn('relative flex gap-6 pb-10 last:pb-0', i % 2 === 0 ? 'flex-row sm:flex-row' : 'flex-row sm:flex-row-reverse')}>
            <div className="absolute left-[9px] sm:left-1/2 w-[10px] h-[10px] rounded-full bg-[var(--colors-primary)] border-2 border-[var(--colors-background)] -translate-x-1/2 z-10" />
            <div className={cn('ml-8 sm:ml-0 sm:w-[calc(50%-2rem)]', i % 2 === 0 ? 'sm:pr-0 sm:text-right' : 'sm:pl-0')}>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--colors-primary)] bg-[var(--colors-primary-light)] px-3 py-1 rounded-full mb-2"><Icon name={getIcon(item.title) as any} size={11} />{item.time}</span>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--colors-text)] font-[var(--typography-font-heading)]">{item.title}</h3>
              {item.description && <p className="text-xs sm:text-sm text-[var(--colors-text-secondary)] mt-1 leading-relaxed">{item.description}</p>}
            </div>
          </motion.div>
        ))}
        {note && <p className="text-center text-sm text-[var(--colors-text-muted)] mt-6 italic">{note}</p>}
      </div>
    </Container>
  );
}

// ─── fleur/sakura/ivory/nordic — Clean left-aligned vertical ───
function CleanTimeline({ content }: { content: SectionComponentProps['content'] }) {
  const { title, items, note } = content.schedule;
  return (
    <Container narrow>
      <SectionTitle title={title} accent />
      <div className="space-y-6">
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="flex gap-4 items-start border-l-2 border-[var(--colors-primary)]/20 pl-5 pb-6 last:pb-0">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--colors-primary-light)] flex items-center justify-center text-[var(--colors-primary)]">
              <Icon name={getIcon(item.title) as any} size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[var(--colors-primary)] uppercase tracking-wider">{item.time}</span>
              <h3 className="text-base font-semibold text-[var(--colors-text)] mt-1">{item.title}</h3>
              {item.description && <p className="text-sm text-[var(--colors-text-secondary)] mt-1">{item.description}</p>}
            </div>
          </motion.div>
        ))}
        {note && <p className="text-center text-sm text-[var(--colors-text-muted)] mt-4 italic">{note}</p>}
      </div>
    </Container>
  );
}

// ─── luna/celeste — Card-based horizontal stack on desktop ───
function CardTimeline({ content }: { content: SectionComponentProps['content'] }) {
  const { title, items, note } = content.schedule;
  return (
    <Container>
      <SectionTitle title={title} subtitle="Acara" accent />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="p-5 rounded-xl border border-[var(--colors-border-light)] bg-[var(--colors-surface)] text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-[var(--colors-primary-light)] flex items-center justify-center text-[var(--colors-primary)] mb-3">
              <Icon name={getIcon(item.title) as any} size={16} />
            </div>
            <span className="text-xs font-semibold text-[var(--colors-primary)] uppercase tracking-wider">{item.time}</span>
            <h3 className="text-base font-semibold text-[var(--colors-text)] mt-1">{item.title}</h3>
            {item.description && <p className="text-xs text-[var(--colors-text-secondary)] mt-1">{item.description}</p>}
          </motion.div>
        ))}
      </div>
      {note && <p className="text-center text-sm text-[var(--colors-text-muted)] mt-6 italic">{note}</p>}
    </Container>
  );
}

// ─── noir — Numbered vertical with line ───
function NoirTimeline({ content }: { content: SectionComponentProps['content'] }) {
  const { title, items, note } = content.schedule;
  return (
    <Container>
      <SectionTitle title={title} subtitle="The evening's programme" accent />
      <div className="max-w-2xl mx-auto">
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
            className="flex gap-6 pb-8 last:pb-0 relative">
            {i < items.length - 1 && <div className="absolute left-[19px] top-10 bottom-0 w-px bg-[var(--colors-border)]" />}
            <div className="flex-shrink-0 w-10 h-10 rounded-full border border-[var(--colors-primary)] flex items-center justify-center bg-[var(--colors-background)] z-10"><span className="text-xs font-bold text-[var(--colors-primary)]">{i + 1}</span></div>
            <div className="flex-1 pt-1"><span className="text-xs uppercase tracking-widest text-[var(--colors-primary)]">{item.time}</span><h3 className="text-lg font-semibold text-[var(--colors-text)] mt-1">{item.title}</h3>{item.description && <p className="text-sm text-[var(--colors-text-secondary)] mt-1">{item.description}</p>}</div>
          </motion.div>
        ))}
        {note && <p className="text-center text-sm text-[var(--colors-text-muted)] mt-8 italic">{note}</p>}
      </div>
    </Container>
  );
}

const MAP: Record<string, React.FC<{ content: SectionComponentProps['content'] }>> = {
  aurora: LuxuryTimeline, royal: LuxuryTimeline,
  fleur: CleanTimeline, sakura: CleanTimeline, ivory: CleanTimeline, nordic: CleanTimeline, verona: CleanTimeline,
  luna: CardTimeline, celeste: CardTimeline, noir: NoirTimeline,
};

export function Timeline(props: SectionComponentProps) {
  if (!props.content.schedule.items.length) return null;
  const C = MAP[props.variant || 'fleur'];
  if (C) return <C content={props.content} />;
  return <CleanTimeline content={props.content} />;
}
