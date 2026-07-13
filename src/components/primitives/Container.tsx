import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  as?: 'div' | 'section' | 'article' | 'footer';
  id?: string;
}

export function Container({
  children,
  className,
  narrow,
  as: Tag = 'section',
  id,
}: ContainerProps) {
  return (
    <Tag
      id={id}
      className={cn(
        'mx-auto px-4 sm:px-6 py-[var(--spacing-section-padding-mobile)] lg:py-[var(--spacing-section-padding)]',
        narrow ? 'max-w-[var(--spacing-container-narrow)]' : 'max-w-[var(--spacing-container-max)]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
