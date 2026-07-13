'use client';

import { motion } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle, Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

function OrnamentDivider({ isNoir }: { isNoir: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 my-8">
      <span className={cn('w-12 h-px', isNoir ? 'bg-[var(--colors-border)]' : 'bg-gradient-to-r from-transparent via-[var(--colors-primary-light)] to-transparent')} />
      <svg viewBox="0 0 24 24" className={cn('w-5 h-5', isNoir ? 'text-[var(--colors-primary)]' : 'text-[var(--colors-primary)]/60')} fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span className={cn('w-12 h-px', isNoir ? 'bg-[var(--colors-border)]' : 'bg-gradient-to-r from-transparent via-[var(--colors-primary-light)] to-transparent')} />
    </div>
  );
}

function ImagePlaceholder({ index }: { index: number }) {
  const gradients = ['from-pink-200 to-rose-300', 'from-purple-200 to-violet-300', 'from-amber-200 to-orange-300'];
  return (
    <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', gradients[index % gradients.length])}>
      <div className="text-center">
        <Icon name="camera" size={32} className="text-white/40" />
        <p className="text-white/30 text-xs mt-2">Your photo here</p>
      </div>
    </div>
  );
}

/** Shared layout: image on one side, text flows beside then continues below */
function StoryLayout({ title, paragraphs, image, imagePosition, isNoir }: {
  title: string;
  paragraphs: string[];
  image?: string;
  imagePosition?: 'left' | 'right';
  isNoir: boolean;
}) {
  const pos = imagePosition || 'left';
  const imageFirst = pos === 'left';

  return (
    <Container>
      <SectionTitle title={title} accent />
      {!isNoir && <OrnamentDivider isNoir={false} />}

      <div className={cn(
        'flex flex-col md:flex-row gap-8 md:gap-12 items-start',
        !imageFirst && 'md:flex-row-reverse',
      )}>
        {/* Image column — fixed width, stays beside text */}
        {image && (
          <motion.div
            initial={{ opacity: 0, x: imageFirst ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className={cn(
              'w-full md:w-80 lg:w-96 flex-shrink-0',
              isNoir ? '' : 'md:sticky md:top-24',
            )}
          >
            <div className={cn(
              'aspect-[3/4] overflow-hidden',
              isNoir ? 'border border-[var(--colors-border)]' : 'rounded-[var(--radius-lg)] shadow-lg border border-[var(--colors-border-light)]',
            )}>
              <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>
          </motion.div>
        )}

        {/* Image-less placeholder — only if no image set */}
        {!image && (
          <motion.div
            initial={{ opacity: 0, x: imageFirst ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-80 lg:w-96 flex-shrink-0"
          >
            <div className={cn(
              'aspect-[3/4] overflow-hidden',
              isNoir ? 'border border-[var(--colors-border)]' : 'rounded-[var(--radius-lg)] shadow-lg border border-[var(--colors-border-light)]',
            )}>
              <ImagePlaceholder index={imageFirst ? 0 : 1} />
            </div>
          </motion.div>
        )}

        {/* Text column — wraps beside image, continues below on mobile */}
        <motion.div
          initial={{ opacity: 0, x: imageFirst ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="flex-1 min-w-0"
        >
          <div className="space-y-5">
            {paragraphs.map((p: string, i: number) => (
              <p key={i} className={cn(
                'leading-relaxed text-base sm:text-lg',
                isNoir ? 'text-[var(--colors-text-secondary)]' : 'text-[var(--colors-text-secondary)] font-[var(--typography-font-body)]',
              )}>
                {p}
              </p>
            ))}
          </div>

          {/* Decorative accent */}
          {!isNoir && (
            <div className="flex justify-center gap-2 mt-8">
              {[0, 1, 2].map((i) => (
                <svg key={i} viewBox="0 0 24 24" className={cn('w-4 h-4', i === 1 ? 'text-[var(--colors-primary)]' : 'text-[var(--colors-primary)]/30')} fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 2C9.24 2 7 4.24 7 7c0 1.04.32 2 .86 2.81C5.38 10.19 4 12.04 4 14c0 2.76 2.24 5 5 5 .86 0 1.68-.22 2.38-.6.46 1.24.82 2.54.92 3.6h1.4c.1-1.06.46-2.36.92-3.6.7.38 1.52.6 2.38.6 2.76 0 5-2.24 5-5 0-1.96-1.38-3.81-3.86-4.19.54-.81.86-1.77.86-2.81 0-2.76-2.24-5-5-5z" />
                </svg>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Container>
  );
}

export function Story(props: SectionComponentProps) {
  const { content, variant } = props;
  const { title, paragraphs, image, imagePosition } = content.story;
  const isNoir = variant === 'noir';

  return (
    <StoryLayout
      title={title}
      paragraphs={paragraphs}
      image={image}
      imagePosition={imagePosition}
      isNoir={isNoir}
    />
  );
}
