'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle, Button, Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

interface RSVPEntry {
  id: string;
  name: string;
  status: string;
  guests: number;
  message: string;
  created_at: string;
}

export function RSVP(props: SectionComponentProps) {
  const { content, variant, slug } = props;
  const { title = 'Will You Attend?', description, deadline, showConfirmationList } = content.rsvp;
  const [submitted, setSubmitted] = useState(false);
  const [confirmations, setConfirmations] = useState<RSVPEntry[]>([]);
  const [submittedName, setSubmittedName] = useState('');
  const [formData, setFormData] = useState({ name: '', message: '' });
  const isNoir = variant === 'noir';

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setConfirmations(data);
      })
      .catch(() => {});
  }, [slug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !slug) return;
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name: formData.name.trim(), message: formData.message.trim(), status: 'hadir', guests: 1 }),
      });
      if (res.ok) {
        const newEntry = await res.json();
        setConfirmations(p => [newEntry, ...p]);
        setSubmittedName(formData.name.trim());
        setSubmitted(true);
      }
    } catch {}
  };

  // After submit: show thank you + full confirmation list
  if (submitted) {
    const showList = showConfirmationList !== false;
    return (
      <Container narrow>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Thank you header */}
          <div className={cn('text-center py-6', isNoir && 'border border-[var(--colors-border)] p-8 mb-8')}>
            <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
              isNoir
                ? 'border border-[var(--colors-primary)] text-[var(--colors-primary)]'
                : 'bg-[var(--colors-success)]/10 text-[var(--colors-success)]')}>
              <Icon name="check" size={24} />
            </div>
            <h3 className={cn('text-2xl font-bold font-[var(--typography-font-heading)] mb-2',
              isNoir ? 'text-[var(--colors-text)]' : 'text-[var(--colors-text)]')}>
              Terima Kasih, {submittedName}!
            </h3>
            <p className="text-[var(--colors-text-secondary)]">Kedatangan Anda sudah dikonfirmasi.</p>
          </div>

          {/* Confirmation list */}
          {showList && confirmations.length > 0 && (
            <div>
              <h4 className={cn('text-base font-semibold mb-4 text-center',
                isNoir ? 'text-[var(--colors-primary)]' : 'text-[var(--colors-text)]')}>
                Daftar Tamu yang Hadir ({confirmations.length})
              </h4>
              <div className={cn('space-y-3 max-w-md mx-auto', isNoir ? '' : '')}>
                {confirmations.map((c, i) => (
                  <motion.div
                    key={c.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn('p-4', isNoir
                      ? 'border border-[var(--colors-border)] bg-[var(--colors-surface)]'
                      : 'rounded-[var(--radius-md)] bg-[var(--colors-surface)] border border-[var(--colors-border-light)] shadow-sm')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                          isNoir ? 'bg-[var(--colors-border)] text-[var(--colors-text)]' : 'bg-[var(--colors-primary-light)] text-[var(--colors-primary)]',
                        )}>
                          {c.name.charAt(0)}
                        </span>
                        <span className="font-medium text-sm text-[var(--colors-text)]">{c.name}</span>
                      </div>
                      <span className="text-xs text-[var(--colors-text-muted)]">
                        {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {c.message && (
                      <p className="text-sm text-[var(--colors-text-secondary)] leading-relaxed ml-10">{c.message}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </Container>
    );
  }

  // Form view
  const inputClass = cn(
    'w-full px-4 py-3 transition-shadow',
    isNoir
      ? 'bg-[var(--colors-surface)] border border-[var(--colors-border)] text-[var(--colors-text)] focus:outline-none focus:border-[var(--colors-primary)]'
      : 'rounded-[var(--radius-md)] border border-[var(--colors-border)] bg-[var(--colors-surface)] text-[var(--colors-text)] focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] focus:border-transparent',
  );

  return (
    <Container narrow>
      <SectionTitle title={title} subtitle={description} accent />
      {deadline && (
        <p className={cn('text-center text-sm mb-8', isNoir ? 'text-[var(--colors-text-muted)]' : 'text-[var(--colors-text-muted)]')}>
          Konfirmasi sebelum {new Date(deadline).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onSubmit={handleSubmit}
        className="max-w-md mx-auto space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-[var(--colors-text)] mb-1.5">Nama *</label>
          <input
            required
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
            className={inputClass}
            placeholder="Masukkan nama Anda"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--colors-text)] mb-1.5">Pesan (Opsional)</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
            rows={3}
            className={cn(inputClass, 'resize-none')}
            placeholder="Tulis pesan untuk kami..."
          />
        </div>
        <Button variant={isNoir ? 'outline' : 'primary'} fullWidth size="lg">Konfirmasi Kehadiran</Button>
      </motion.form>

      {/* Live confirmation list (shown even before submit if others confirmed) */}
      {showConfirmationList !== false && confirmations.length > 0 && (
        <div className="mt-12 max-w-md mx-auto">
          <h4 className={cn('text-sm font-semibold mb-4 text-center',
            isNoir ? 'text-[var(--colors-primary)]' : 'text-[var(--colors-text)]')}>
            Yang sudah Konfirmasi ({confirmations.length})
          </h4>
          <div className="space-y-3">
            {confirmations.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn('p-3', isNoir
                  ? 'border border-[var(--colors-border)] bg-[var(--colors-surface)]'
                  : 'rounded-[var(--radius-md)] bg-[var(--colors-surface)] border border-[var(--colors-border-light)]')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-[var(--colors-text)]">{c.name}</span>
                  <span className="text-xs text-[var(--colors-text-muted)]">
                    {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {c.message && (
                  <p className="text-sm text-[var(--colors-text-secondary)] leading-relaxed">{c.message}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
