'use client';

import { motion } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

export function Quote(props: SectionComponentProps) {
  const { content, variant } = props;
  const { text, source } = content.quote;
  if (!text) return null;

  if (variant === 'noir') {
    return (
      <div className="py-20 sm:py-28 text-center px-4 bg-[var(--colors-background-alt)]">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="max-w-3xl mx-auto">
          <div className="w-px h-12 mx-auto mb-10 bg-[var(--colors-primary)]/50" />
          <blockquote className="text-2xl sm:text-3xl md:text-4xl font-[var(--typography-font-heading)] text-[var(--colors-text)] leading-snug font-light tracking-tight">
            &ldquo;{text}&rdquo;
          </blockquote>
          {source && (
            <cite className="block mt-6 text-sm text-[var(--colors-text-muted)] not-italic tracking-wider uppercase">
              &mdash; {source}
            </cite>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-24 text-center px-4 bg-gradient-to-r from-[var(--colors-primary-light)] via-transparent to-[var(--colors-primary-light)]">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="max-w-2xl mx-auto">
        <Icon name="quote" size={32} className="mx-auto mb-6 text-[var(--colors-primary)]/30" />
        <blockquote className="text-xl sm:text-2xl md:text-3xl font-[var(--typography-font-accent)] text-[var(--colors-text)] leading-relaxed">
          {text}
        </blockquote>
        {source && (
          <cite className="block mt-4 text-sm text-[var(--colors-text-secondary)] not-italic">&mdash; {source}</cite>
        )}
      </motion.div>
    </div>
  );
}
