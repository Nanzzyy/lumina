'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle, Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

function GalleryImage({ src, alt, onClick, className }: { src: string; alt: string; onClick?: () => void; className?: string }) {
  const [err, setErr] = useState(false);
  if (err || !src) return <div className={cn('w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200', className)}><Icon name="camera" size={24} className="text-zinc-300" /></div>;
  return <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} onClick={onClick} className={cn('w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105', className)} />;
}

export function Gallery(props: SectionComponentProps) {
  const { content, variant } = props;
  const images = content.gallery.images;
  const layout = content.gallery.layout || 'grid';
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isNoir = variant === 'noir';
  if (images.length === 0) return null;

  const borderClass = isNoir ? 'border border-[var(--colors-border)]' : 'rounded-lg overflow-hidden';

  return (
    <Container>
      <SectionTitle title="Gallery" subtitle="Momen Spesial" accent />

      {/* Grid */}
      {layout === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {images.map((src, i) => (
            <motion.button key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedIndex(i)} className={cn('overflow-hidden aspect-square', borderClass)}>
              <GalleryImage src={src} alt={`Foto ${i + 1}`} />
            </motion.button>
          ))}
        </div>
      )}

      {/* Masonry */}
      {layout === 'masonry' && (
        <div className="columns-2 md:columns-3 gap-3 sm:gap-4">
          {images.map((src, i) => (
            <motion.button key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedIndex(i)} className={cn('mb-3 sm:mb-4 w-full overflow-hidden block', borderClass)}>
              <div className={i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'}>
                <GalleryImage src={src} alt={`Foto ${i + 1}`} />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Carousel */}
      {layout === 'carousel' && (
        <div className="relative">
          <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-3 -mx-2 px-2 pb-4">
            {images.map((src, i) => (
              <motion.button key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                onClick={() => setSelectedIndex(i)} className="flex-shrink-0 w-[85%] sm:w-[60%] md:w-[45%] snap-center cursor-pointer">
                <div className="aspect-video overflow-hidden rounded-lg">
                  <GalleryImage src={src} alt={`Foto ${i + 1}`} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
            <motion.div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-3xl">
              <img src={images[selectedIndex]} alt={`Foto ${selectedIndex + 1}`} className="w-full max-h-[80vh] object-contain rounded-lg" />
              <div className="flex justify-between items-center mt-4">
                <button onClick={() => setSelectedIndex((p) => (p! - 1 + images.length) % images.length)} className="p-2 text-white/60 hover:text-white"><Icon name="chevron-left" size={24} /></button>
                <span className="text-white/50 text-sm">{selectedIndex + 1} / {images.length}</span>
                <button onClick={() => setSelectedIndex((p) => (p! + 1) % images.length)} className="p-2 text-white/60 hover:text-white"><Icon name="chevron-right" size={24} /></button>
              </div>
              <button onClick={() => setSelectedIndex(null)} className="absolute -top-10 right-0 text-white/50 hover:text-white"><Icon name="x" size={24} /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}
