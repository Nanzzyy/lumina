'use client';

import type { SectionComponentProps } from '@/lib/template';
import { Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

export function Footer(props: SectionComponentProps) {
  const { content, variant } = props;
  const { text, showCredit = true } = content.footer;
  const isNoir = variant === 'noir';

  return (
    <footer className={cn('py-16 text-center', isNoir ? 'border-t border-[var(--colors-border)]' : 'border-t border-[var(--colors-border-light)]')}>
      <div className="max-w-md mx-auto px-4">
        {!isNoir && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-[var(--colors-primary)]/30" />
            <Icon name="heart" size={14} className="text-[var(--colors-primary)]/40" />
            <span className="w-8 h-px bg-[var(--colors-primary)]/30" />
          </div>
        )}

        {isNoir && (
          <div className="w-px h-8 mx-auto mb-6 bg-[var(--colors-primary)]/50" />
        )}

        <p className={cn('text-lg mb-4',
          isNoir ? 'font-[var(--typography-font-heading)] text-[var(--colors-text-secondary)] tracking-wide' : 'font-[var(--typography-font-accent)] text-[var(--colors-primary)]')}>
          {text}
        </p>

        {showCredit && (
          <p className={cn('text-xs mt-8', isNoir ? 'text-[var(--colors-text-muted)]' : 'text-[var(--colors-text-muted)]')}>
            Made with love &middot; Lumina Invitations
          </p>
        )}
      </div>
    </footer>
  );
}
