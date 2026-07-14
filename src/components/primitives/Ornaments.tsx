'use client';

import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { OrnamentConfig } from '@/lib/content/types';

const ornamentSvgs: Record<string, string> = {
  flower: 'M12 2C9.24 2 7 4.24 7 7c0 1.04.32 2 .86 2.81C5.38 10.19 4 12.04 4 14c0 2.76 2.24 5 5 5 .86 0 1.68-.22 2.38-.6.46 1.24.82 2.54.92 3.6h1.4c.1-1.06.46-2.36.92-3.6.7.38 1.52.6 2.38.6 2.76 0 5-2.24 5-5 0-1.96-1.38-3.81-3.86-4.19.54-.81.86-1.77.86-2.81 0-2.76-2.24-5-5-5z',
  heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  leaf: 'M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 6-2 9-6 3-4 4-8 0-6z',
  swirl: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
  dots: 'M12 6m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0 -3 0M12 12m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0 -3 0M12 18m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0 -3 0',
  divider: 'M3 12h18M3 6h18M3 18h18',
  frame: 'M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm1 2h12v12H6V6zm1 1h10v10H7V7z',
};

const positionClasses: Record<string, string> = {
  'top': 'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'bottom': 'absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
  'center': 'flex justify-center',
  'top-left': 'absolute top-4 left-4',
  'top-right': 'absolute top-4 right-4',
  'bottom-left': 'absolute bottom-4 left-4',
  'bottom-right': 'absolute bottom-4 right-4',
  'left': 'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2',
  'right': 'absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
};

const sizeMap: Record<string, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

const entranceVariants = {
  fadeIn: { initial: { opacity: 0 } as const, animate: { opacity: 1 } as const },
  slideUp: { initial: { opacity: 0, y: 30 } as const, animate: { opacity: 1, y: 0 } as const },
  slideDown: { initial: { opacity: 0, y: -30 } as const, animate: { opacity: 1, y: 0 } as const },
  slideLeft: { initial: { opacity: 0, x: 30 } as const, animate: { opacity: 1, x: 0 } as const },
  slideRight: { initial: { opacity: 0, x: -30 } as const, animate: { opacity: 1, x: 0 } as const },
  scaleIn: { initial: { opacity: 0, scale: 0 } as const, animate: { opacity: 1, scale: 1 } as const },
  rotateIn: { initial: { opacity: 0, rotate: -180 } as const, animate: { opacity: 1, rotate: 0 } as const },
  bounceIn: { initial: { opacity: 0, scale: 0.3 } as const, animate: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300 } } as const },
} as const;

const exitVariants = {
  fadeOut: { opacity: 0 },
  slideUp: { opacity: 0, y: -30 },
  slideDown: { opacity: 0, y: 30 },
  slideLeft: { opacity: 0, x: -30 },
  slideRight: { opacity: 0, x: 30 },
  scaleOut: { opacity: 0, scale: 0 },
  rotateOut: { opacity: 0, rotate: 180 },
  bounceOut: { opacity: 0, scale: 0.3 },
} as const;

function getOrnamentSize(size: OrnamentConfig['size']): number {
  if (typeof size === 'number') return size;
  return sizeMap[size || 'md'];
}

/** A single decorative ornament with optional animation. */
function OrnamentItem({ config, isCanvas }: { config: OrnamentConfig; isCanvas?: boolean }) {
  const path = ornamentSvgs[config.type] || ornamentSvgs.heart;
  const rawSize = getOrnamentSize(config.size);
  const opacity = config.opacity ?? 0.5;
  const color = config.color || 'currentColor';
  const rotation = config.rotation ?? 0;

  // Determine if using free positioning (x/y) or legacy position
  const hasFreePosition = config.x !== undefined || config.y !== undefined;

  const svg = (
    <svg
      width={config.type === 'divider' ? rawSize * 2 : rawSize}
      height={rawSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={config.type === 'divider' ? 1 : 1.5}
      opacity={opacity}
      className="flex-shrink-0"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {config.type === 'custom' && config.customSvg ? (
        <path d={config.customSvg} />
      ) : (
        <path d={path} />
      )}
    </svg>
  );

  const content = (
    <div
      className={cn(
        'pointer-events-none',
        !hasFreePosition && (positionClasses[config.position || 'center'] || 'flex justify-center'),
      )}
      style={hasFreePosition ? {
        position: 'absolute',
        left: `${config.x ?? 50}%`,
        top: `${config.y ?? 50}%`,
        transform: `translate(-50%, -50%)`,
      } : undefined}
    >
      {svg}
    </div>
  );

  // Optional animation wrapper
  const anim = config.animation;
  const entranceKey = anim?.entrance && anim.entrance !== 'none' ? anim.entrance : null;
  const exitKey = anim?.exit && anim.exit !== 'none' ? anim.exit : null;

  if (entranceKey || exitKey) {
    const duration = anim?.duration ?? 0.5;
    const delay = anim?.delay ?? 0;
    const variant = entranceKey ? entranceVariants[entranceKey] : null;

    return (
      <AnimatePresence>
        <motion.div
          key={config.id}
          initial={variant?.initial}
          animate={variant?.animate}
          exit={exitKey ? exitVariants[exitKey] : undefined}
          transition={{ duration, delay }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  }

  return content;
}

/** Renders a list of ornament configs */
export function OrnamentGroup({ ornaments, className, isCanvas }: { ornaments: OrnamentConfig[]; className?: string; isCanvas?: boolean }) {
  if (!ornaments || ornaments.length === 0) return null;
  return (
    <div className={cn('relative', className)} aria-hidden>
      {ornaments.map((ornament, idx) => (
        <OrnamentItem key={ornament.id || idx} config={ornament} isCanvas={isCanvas} />
      ))}
    </div>
  );
}

/** Divider ornament for sections */
export function SectionDivider({ variant }: { variant?: string }) {
  const isNoir = variant === 'noir';
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <span className={cn('w-16 h-px', isNoir ? 'bg-[var(--colors-border)]' : 'bg-gradient-to-r from-transparent via-[var(--colors-primary-light)] to-transparent')} />
      <svg viewBox="0 0 24 24" className={cn('w-5 h-5', isNoir ? 'text-[var(--colors-primary)]' : 'text-[var(--colors-primary)]/60')}
        fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d={ornamentSvgs.heart} />
      </svg>
      <span className={cn('w-16 h-px', isNoir ? 'bg-[var(--colors-border)]' : 'bg-gradient-to-r from-transparent via-[var(--colors-primary-light)] to-transparent')} />
    </div>
  );
}

/** Global floating decoration for template backgrounds */
export function FloralDecoration({ position = 'top-right', color, opacity = 0.08 }: {
  position?: string;
  color?: string;
  opacity?: number;
}) {
  const posMap: Record<string, string> = {
    'top-right': '-top-20 -right-20',
    'top-left': '-top-20 -left-20',
    'bottom-right': '-bottom-20 -right-20',
    'bottom-left': '-bottom-20 -left-20',
  };
  return (
    <div className={cn('absolute w-64 h-64 pointer-events-none', posMap[position] || posMap['top-right'])}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke={color || 'currentColor'} strokeWidth={0.5} opacity={opacity}>
        <circle cx="50" cy="50" r="40" />
        <circle cx="50" cy="50" r="25" />
        <circle cx="50" cy="50" r="10" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line key={angle}
            x1={50 + 40 * Math.cos(angle * Math.PI / 180)}
            y1={50 + 40 * Math.sin(angle * Math.PI / 180)}
            x2={50 + 25 * Math.cos(angle * Math.PI / 180)}
            y2={50 + 25 * Math.sin(angle * Math.PI / 180)}
          />
        ))}
      </svg>
    </div>
  );
}
