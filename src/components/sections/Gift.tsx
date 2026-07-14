'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle, Button, Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

export function Gift(props: SectionComponentProps) {
  const { content, variant } = props;
  const { title = 'Wedding Gift', description, bankName, accountNumber, accountName, enabled, layout } = content.gift;
  const [copied, setCopied] = useState(false);
  const isNoir = variant === 'noir';

  // If disabled or no data, don't render
  if (enabled === false) return null;
  if (!bankName && !description) return null;

  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const giftContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'max-w-sm mx-auto p-6',
        isNoir
          ? 'border border-[var(--colors-border)] bg-[var(--colors-surface)]'
          : 'bg-[var(--colors-surface)] border border-[var(--colors-border-light)] rounded-[var(--radius-lg)] shadow-sm',
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isNoir ? 'border border-[var(--colors-primary)] text-[var(--colors-primary)]' : 'bg-[var(--colors-primary-light)] text-[var(--colors-primary)]',
          )}>
            <Icon name="gift" size={18} />
          </div>
          <div>
            <p className="font-medium text-sm text-[var(--colors-text)]">{title || 'Wedding Gift'}</p>
            {description && <p className="text-xs text-[var(--colors-text-muted)]">{description}</p>}
          </div>
        </div>
        {bankName && accountNumber && (
          <>
            <div className={cn('h-px', isNoir ? 'bg-[var(--colors-border)]' : 'bg-[var(--colors-border-light)]')} />
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--colors-text-muted)] mb-1">Bank</p>
              <p className="text-base font-medium text-[var(--colors-text)]">{bankName}</p>
            </div>
            {accountName && (
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--colors-text-muted)] mb-1">Atas Nama</p>
                <p className="text-base font-medium text-[var(--colors-text)]">{accountName}</p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--colors-text-muted)] mb-1">No. Rekening</p>
              <div className="flex items-center gap-2">
                <code className={cn(
                  'flex-1 text-lg font-bold px-3 py-2 break-all',
                  isNoir
                    ? 'text-[var(--colors-primary)] border border-[var(--colors-border)]'
                    : 'text-[var(--colors-primary)] bg-[var(--colors-primary-light)] rounded-[var(--radius-sm)]',
                )}>
                  {accountNumber}
                </code>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(accountNumber)}>
                  {copied ? <Icon name="check" size={16} className="text-[var(--colors-success)]" />
                    : <Icon name="copy" size={16} />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <Container narrow>
      <SectionTitle title={title || 'Wedding Gift'} subtitle={description} accent />
      {giftContent}
    </Container>
  );
}
