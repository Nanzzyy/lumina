'use client';

import { motion } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle, Icon, SectionDivider } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

function ImagePlaceholder({ index }: { index: number }) {
  const g = ['from-pink-100 to-rose-200', 'from-amber-100 to-orange-200', 'from-sky-100 to-blue-200'];
  return <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', g[index % g.length])}><Icon name="camera" size={32} className="text-white/40" /></div>;
}

// ─── aurora/royal — Side-by-side with sticky image ───
function LuxuryStory({ content }: { content: SectionComponentProps['content'] }) {
  const { title, paragraphs, image, imagePosition } = content.story;
  const pos = imagePosition || 'left';
  const isImageFirst = pos === 'left';
  return (
    <Container>
      <SectionTitle title={title} accent />
      <div className={cn('flex flex-col md:flex-row gap-8 md:gap-12 items-start', !isImageFirst && 'md:flex-row-reverse')}>
        <motion.div initial={{ opacity: 0, x: isImageFirst ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="w-full md:w-72 lg:w-80 flex-shrink-0 md:sticky md:top-24">
          <div className="aspect-[3/4] overflow-hidden rounded-sm border border-[var(--colors-border)]">
            {image ? <img src={image} alt={title} className="w-full h-full object-cover" /> : <ImagePlaceholder index={0} />}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: isImageFirst ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 min-w-0">
          <div className="space-y-5 text-[var(--colors-text-secondary)] leading-relaxed text-sm sm:text-base">
            {paragraphs.map((p: string, i: number) => <p key={i}>{p}</p>)}
          </div>
        </motion.div>
      </div>
    </Container>
  );
}

// ─── fleur/sakura — Centered text with image above ───
function RomanticStory({ content }: { content: SectionComponentProps['content'] }) {
  const { title, paragraphs, image } = content.story;
  return (
    <div className="py-16 sm:py-24 px-4" style={{ backgroundColor: 'var(--colors-background-alt)' }}>
      <Container narrow>
        <SectionTitle title={title} accent />
        <SectionDivider />
        {image && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-md mx-auto mb-10 rounded-xl overflow-hidden shadow-md">
            <img src={image} alt={title} className="w-full aspect-video object-cover" />
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-xl mx-auto space-y-5 text-[var(--colors-text-secondary)] text-center leading-relaxed text-sm sm:text-base">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </motion.div>
      </Container>
    </div>
  );
}

// ─── ivory/nordic/verona — Clean split with numbered text ───
function CleanStory({ content }: { content: SectionComponentProps['content'] }) {
  const { title, paragraphs, image, imagePosition } = content.story;
  const pos = imagePosition || 'left';
  return (
    <Container>
      <SectionTitle title={title} accent />
      <div className={cn('flex flex-col md:flex-row gap-10', pos === 'right' && 'md:flex-row-reverse')}>
        <motion.div initial={{ opacity: 0, x: pos === 'left' ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="w-full md:w-1/3 flex-shrink-0">
          <div className="aspect-[4/5] overflow-hidden rounded-lg shadow-md">
            {image ? <img src={image} alt={title} className="w-full h-full object-cover" /> : <ImagePlaceholder index={1} />}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: pos === 'left' ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 min-w-0 space-y-6">
          {paragraphs.map((p, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-2xl font-bold text-[var(--colors-primary)]/20 font-[var(--typography-font-heading)]">{i + 1}</span>
              <p className="text-sm sm:text-base text-[var(--colors-text-secondary)] leading-relaxed pt-1">{p}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Container>
  );
}

// ─── luna/celeste — Timeline-style story cards ───
function TimelineStory({ content }: { content: SectionComponentProps['content'] }) {
  const { title, paragraphs, image } = content.story;
  return (
    <Container narrow>
      <SectionTitle title={title} accent />
      <div className="relative">
        {image && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-10">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </motion.div>
        )}
        {paragraphs.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className={cn('flex gap-4 mb-6', i % 2 === 1 && 'md:flex-row-reverse md:text-right')}>
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[var(--colors-primary)]/10 flex items-center justify-center text-[var(--colors-primary)] text-xs font-bold">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-[var(--colors-text-secondary)] leading-relaxed">{p}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Container>
  );
}

// ─── noir — Dark minimal with large image ───
function NoirStory({ content }: { content: SectionComponentProps['content'] }) {
  const { title, paragraphs, image, imagePosition } = content.story;
  const pos = imagePosition || 'left';
  return (
    <Container>
      <SectionTitle title={title} accent />
      <div className={cn('flex flex-col md:flex-row gap-8 md:gap-12 items-start', pos === 'right' && 'md:flex-row-reverse')}>
        <motion.div initial={{ opacity: 0, x: pos === 'left' ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="w-full md:w-80 lg:w-96 flex-shrink-0">
          <div className="aspect-[3/4] overflow-hidden border border-[var(--colors-border)]">
            {image ? <img src={image} alt={title} className="w-full h-full object-cover" /> : <ImagePlaceholder index={2} />}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: pos === 'left' ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 min-w-0 space-y-5">
          {paragraphs.map((p, i) => <p key={i} className="text-sm sm:text-base text-[var(--colors-text-secondary)] leading-relaxed">{p}</p>)}
        </motion.div>
      </div>
    </Container>
  );
}

const MAP: Record<string, React.FC<{ content: SectionComponentProps['content'] }>> = {
  aurora: LuxuryStory, royal: LuxuryStory,
  fleur: RomanticStory, sakura: RomanticStory,
  ivory: CleanStory, nordic: CleanStory, verona: CleanStory,
  luna: TimelineStory, celeste: TimelineStory, noir: NoirStory,
};

export function Story(props: SectionComponentProps) {
  const C = MAP[props.variant || 'fleur'];
  if (C) return <C content={props.content} />;
  return <RomanticStory content={props.content} />;
}
