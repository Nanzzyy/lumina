'use client';

import type { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  duration?: number;
  delay?: number;
  distance?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  direction = 'up',
  duration = 0.7,
  delay = 0,
  distance = 40,
  className,
  once = true,
}: ScrollRevealProps) {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...(direction === 'up' && { y: distance }),
      ...(direction === 'down' && { y: -distance }),
      ...(direction === 'left' && { x: -distance }),
      ...(direction === 'right' && { x: distance }),
      ...(direction === 'scale' && { scale: 0.9 }),
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { duration, delay, ease: 'easeOut' },
    },
  };

  return (
    <div className={className}>
      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-80px' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
