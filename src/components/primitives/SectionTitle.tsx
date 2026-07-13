import { cn } from '@/lib/utils/cn';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  accent?: boolean;
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  align = 'center',
  accent,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        'mb-[var(--spacing-gap-section)]',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className,
      )}
    >
      <h2
        className="text-[var(--typography-font-size-4xl)] sm:text-[var(--typography-font-size-5xl)] 
                     font-bold font-[var(--typography-font-heading)] leading-[var(--typography-line-height-tight)]
                     text-[var(--colors-text)]"
      >
        {title}
      </h2>
      {accent && (
        <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-[var(--colors-primary)]" 
             style={{ marginInline: align === 'center' ? 'auto' : align === 'right' ? '0' : undefined }} />
      )}
      {subtitle && (
        <p
          className="mt-4 text-[var(--typography-font-size-lg)] 
                     text-[var(--colors-text-secondary)] 
                     font-[var(--typography-font-body)]
                     max-w-xl mx-auto"
          style={{ marginInline: align === 'center' ? 'auto' : undefined }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
