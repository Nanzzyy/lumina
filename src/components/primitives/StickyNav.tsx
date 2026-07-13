'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  id: string;
  label: string;
}

interface StickyNavProps {
  items: NavItem[];
  variant?: 'default' | 'noir';
}

export function StickyNav({ items, variant = 'default' }: StickyNavProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    items.forEach((item, i) => {
      const el = document.getElementById(`section-${item.id}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveIndex(i);
          });
        },
        { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      className={cn(
        'fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3',
        'opacity-30 hover:opacity-100 transition-opacity duration-300',
      )}
      aria-label="Section navigation"
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          onClick={() => scrollTo(item.id)}
          className="group relative flex items-center justify-center p-1"
          aria-label={`Go to ${item.label}`}
        >
          <span
            className={cn(
              'block w-2.5 h-2.5 rounded-full transition-all duration-300',
              i === activeIndex
                ? variant === 'noir'
                  ? 'bg-[var(--colors-text)] scale-125'
                  : 'bg-[var(--colors-primary)] scale-125'
                : 'bg-[var(--colors-text-muted)]',
            )}
          />
          <span
            className={cn(
              'absolute right-full mr-3 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
              variant === 'noir' ? 'text-[var(--colors-text-secondary)]' : 'text-[var(--colors-text-muted)]',
            )}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
