'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle, Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

const gradients = [
  'from-pink-200 to-rose-300',
  'from-purple-200 to-violet-300',
  'from-amber-200 to-orange-300',
  'from-sky-200 to-blue-300',
  'from-emerald-200 to-teal-300',
  'from-fuchsia-200 to-pink-300',
];

export function Gallery(props: SectionComponentProps) {
  const { content, variant } = props;
  const images = content.gallery.images;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isNoir = variant === 'noir';

  if (images.length === 0) return null;

  return (
    <Container className="overflow-hidden">
      <SectionTitle title="Gallery" subtitle="Our special moments" accent />

      {/* Noir: 3-col clean grid, Aria: grid with gaps */}
      <div className={cn(
        isNoir
          ? 'grid grid-cols-2 sm:grid-cols-3 gap-3'
          : 'grid grid-cols-2 md:grid-cols-3 gap-4',
      )}>
        {images.map((_src: string, i: number) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            onClick={() => setSelectedIndex(i)}
            className={cn(
              'overflow-hidden cursor-pointer group relative',
              isNoir
                ? 'aspect-square border border-[var(--colors-border)] hover:border-[var(--colors-primary)] transition-colors'
                : 'aspect-square rounded-[var(--radius-md)]',
            )}
          >
            <div className={cn(
              'w-full h-full bg-gradient-to-br flex items-center justify-center transition-transform duration-500 group-hover:scale-105',
              gradients[i % gradients.length],
            )}>
              <div className="text-center">
                <Icon name="camera" size={24} className="text-white/50 mb-1" />
                <p className="text-white/30 text-xs">Photo {i + 1}</p>
              </div>
            </div>
            {/* Noir overlay on hover */}
            {isNoir && (
              <div className="absolute inset-0 bg-[var(--colors-primary)]/0 group-hover:bg-[var(--colors-primary)]/10 transition-colors flex items-center justify-center">
                <span className="text-white/0 group-hover:text-white/80 text-xs uppercase tracking-wider transition-all duration-300">
                  View
                </span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            className={cn(
              'fixed inset-0 z-50 flex items-center justify-center p-4',
              isNoir ? 'bg-black/95' : 'bg-black/80',
            )}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl"
            >
              {/* Image */}
              <div className={cn(
                'w-full aspect-[4/3] bg-gradient-to-br flex items-center justify-center',
                gradients[selectedIndex % gradients.length],
                isNoir ? '' : 'rounded-[var(--radius-lg)]',
              )}>
                <div className="text-center">
                  <Icon name="camera" size={48} className="text-white/40 mx-auto mb-2" />
                  <p className="text-white/30 text-sm">Photo {selectedIndex + 1}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setSelectedIndex((p) => (p! - 1 + images.length) % images.length)}
                  className={cn(
                    'transition-colors',
                    isNoir ? 'text-[var(--colors-primary)] hover:text-white' : 'text-white/50 hover:text-white',
                  )}
                >
                  <Icon name="chevron-left" size={28} />
                </button>

                <span className={cn(
                  'text-sm',
                  isNoir ? 'text-[var(--colors-text-muted)]' : 'text-white/50',
                )}>
                  {selectedIndex + 1} / {images.length}
                </span>

                <button
                  onClick={() => setSelectedIndex((p) => (p! + 1) % images.length)}
                  className={cn(
                    'transition-colors',
                    isNoir ? 'text-[var(--colors-primary)] hover:text-white' : 'text-white/50 hover:text-white',
                  )}
                >
                  <Icon name="chevron-right" size={28} />
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
              >
                <Icon name="x" size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}
