'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface MusicPlayerProps {
  src?: string;
  title?: string;
  autoplay?: boolean;
  variant?: 'default' | 'noir';
}

export function MusicPlayer({ src, title = 'Background Music', autoplay, variant = 'default' }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) return;
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, [src]);

  useEffect(() => {
    if (autoplay && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [autoplay]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  if (!src) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
         onMouseEnter={() => setShowLabel(true)} onMouseLeave={() => setShowLabel(false)}>
      <AnimatePresence>
        {showLabel && (
          <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className={cn('text-xs px-3 py-1.5 rounded-full whitespace-nowrap',
              variant === 'noir' ? 'bg-black/80 text-white/70 border border-white/10' : 'bg-white/90 text-[var(--colors-text-secondary)] shadow-md')}>
            {title} {isPlaying ? '• Playing' : '• Paused'}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.button onClick={toggle} whileTap={{ scale: 0.9 }}
        className={cn('w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors',
          variant === 'noir' ? 'bg-black/80 text-white/80 border border-white/10' : 'bg-white/90 text-[var(--colors-primary)] hover:bg-white')}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}>
        {isPlaying
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
      </motion.button>
      {isPlaying && (
        <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className={cn('absolute -inset-1 rounded-full', variant === 'noir' ? 'ring-1 ring-white/20' : 'ring-2 ring-[var(--colors-primary)]/20')} />
      )}
    </div>
  );
}
