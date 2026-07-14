'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle, Button } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

interface Entry {
  name: string;
  message: string;
  timestamp: Date;
}

export function GuestBook(props: SectionComponentProps) {
  const { content, variant } = props;
  const { title = 'Guest Book', description, enabled, showMessages } = content.guestbook;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [formData, setFormData] = useState({ name: '', message: '' });
  const isNoir = variant === 'noir';

  if (!enabled) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) return;
    setEntries(p => [{ ...formData, timestamp: new Date() }, ...p]);
    setFormData({ name: '', message: '' });
  };

  return (
    <Container narrow>
      <SectionTitle title={title} subtitle={description} accent />

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onSubmit={handleSubmit}
        className="max-w-md mx-auto mb-12 space-y-4 px-4"
      >
        <input required value={formData.name}
          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-[var(--colors-border)] text-sm text-[var(--colors-text)] bg-[var(--colors-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] focus:border-transparent"
          placeholder="Nama Anda" />
        <textarea required value={formData.message}
          onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
          rows={3} className="w-full px-4 py-3 rounded-lg border border-[var(--colors-border)] text-sm text-[var(--colors-text)] bg-[var(--colors-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] focus:border-transparent resize-none"
          placeholder="Tulis ucapan dan doa untuk kami..." />
        <Button variant={isNoir ? 'outline' : 'primary'} fullWidth>Kirim Ucapan</Button>
      </motion.form>

      {showMessages !== false && entries.length > 0 && (
        <div className="space-y-4 max-w-md mx-auto px-4">
          <h4 className="text-sm font-semibold text-center text-[var(--colors-text)]">Ucapan ({entries.length})</h4>
          {entries.map((entry, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg bg-[var(--colors-surface)] border border-[var(--colors-border-light)]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-[var(--colors-text)]">{entry.name}</span>
                <span className="text-xs text-[var(--colors-text-muted)]">{entry.timestamp.toLocaleDateString('id-ID')}</span>
              </div>
              <p className="text-sm text-[var(--colors-text-secondary)] leading-relaxed">{entry.message}</p>
            </motion.div>
          ))}
        </div>
      )}
    </Container>
  );
}
