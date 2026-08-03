import { useState, useEffect, useCallback, type FormEvent } from 'react';
import type { InvitationContent } from '@/lib/content/types';
import { getJsonOr, postJson } from '@/lib/utils/api-client';
import { useCountdown } from '@/hooks';

/** Treat common video extensions as video (else image). */
export function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(url);
}

export const STATUS_LABEL: Record<string, string> = {
  hadir: 'Hadir',
  tidak_hadir: 'Tidak Hadir',
  ragu: 'Hadir',
};

export function timeAgo(iso: string): string {
  const normalized = /Z|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso.replace(' ', 'T')}Z`;
  const then = new Date(normalized).getTime();
  if (isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Now';
  if (min < 60) return `${min}m lalu`;
  const hr = Math.floor(diff / 3_600_000);
  if (hr < 24) return `${hr}h lalu`;
  return `${Math.floor(hr / 24)}d lalu`;
}

export interface WishRow {
  id: string;
  name: string;
  attendance: string;
  guests: string;
  message: string;
  time: string;
}

interface RsvpApiRow {
  id: string;
  name: string;
  status: string;
  guests: number;
  message?: string;
  created_at: string;
}

function toWish(e: RsvpApiRow): WishRow {
  return {
    id: e.id,
    name: e.name,
    attendance: STATUS_LABEL[e.status] ?? 'Hadir',
    guests: String(e.guests ?? 1),
    message: e.message || '',
    time: timeAgo(e.created_at),
  };
}

/** Shared RSVP + wishes wiring against /api/rsvp. */
export function useRsvpWishes(slug?: string) {
  const [wishes, setWishes] = useState<WishRow[]>([]);
  const [rsvpForm, setRsvpForm] = useState({ name: '', guests: '1', attendance: 'Hadir', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  /** Re-fetch the wish list from the server. */
  const refresh = useCallback(() => {
    if (!slug) return;
    getJsonOr<RsvpApiRow[]>(`/api/rsvp?slug=${encodeURIComponent(slug)}`, []).then((list) => {
      if (!Array.isArray(list)) return;
      setWishes(list.map(toWish));
    });
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rsvpForm.name.trim() || !rsvpForm.message.trim() || !slug) return;
    const status = rsvpForm.attendance === 'Tidak Hadir' ? 'tidak_hadir' : 'hadir';
    try {
      const created = await postJson<RsvpApiRow>('/api/rsvp', {
        slug,
        name: rsvpForm.name.trim(),
        status,
        guests: Number(rsvpForm.guests) || 1,
        message: rsvpForm.message.trim(),
      });
      setWishes((w) => [{ ...toWish(created), time: 'Now' }, ...w]);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRsvpForm({ name: '', guests: '1', attendance: 'Hadir', message: '' });
      }, 3000);
    } catch { /* ignore */ }
  };

  return { wishes, rsvpForm, setRsvpForm, isSubmitted, submit, refresh };
}

/** Date parser (ISO / English / Indonesian). Logic in @/lib/utils/date. */
import { parseFlexibleDate } from '@/lib/utils/date';
export { parseFlexibleDate };



/** Countdown to an event date (ISO / English / Indonesian). Logic in @/hooks. */
export { useCountdown };

/** Read `?to=` guest name once. contentGuestName takes priority over URL param. */
export function useGuestName(contentGuestName?: string, fallback = 'Tamu Undangan') {
  const [name] = useState<string>(() => {
    if (contentGuestName) return contentGuestName;
    if (typeof window === 'undefined') return fallback;
    const to = new URLSearchParams(window.location.search).get('to');
    return to ? decodeURIComponent(to) : fallback;
  });
  return name;
}

export function displayDateFrom(iso: string, fallback?: string): string {
  const d = parseFlexibleDate(iso);
  if (!d) return fallback || iso;
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Resolve headline media with fallbacks. */
export function pickMedia(
  content: InvitationContent,
  fallback: { cover: string; hero: string; p1: string; p2: string; video?: string; footerImage?: string },
) {
  return {
    cover: content.media?.cover || fallback.cover,
    hero: content.media?.hero || fallback.hero,
    p1: content.media?.partner1Photo || fallback.p1,
    p2: content.media?.partner2Photo || fallback.p2,
    video: content.media?.video || fallback.video || '',
    footerImage: content.media?.footerImage || fallback.footerImage || '',
  };
}
