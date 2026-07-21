import { useState, useEffect, type FormEvent } from 'react';
import type { InvitationContent } from '@/lib/content/types';

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
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const diff = Date.now() - then;
  const hr = Math.floor(diff / 3_600_000);
  if (hr < 1) return 'Baru saja';
  if (hr < 24) return `${hr} jam yang lalu`;
  return `${Math.floor(hr / 24)} hari yang lalu`;
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

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((list: unknown) => {
        if (!Array.isArray(list)) return;
        setWishes((list as RsvpApiRow[]).map(toWish));
      })
      .catch(() => {});
  }, [slug]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rsvpForm.name.trim() || !rsvpForm.message.trim() || !slug) return;
    const status = rsvpForm.attendance === 'Tidak Hadir' ? 'tidak_hadir' : 'hadir';
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: rsvpForm.name.trim(),
          status,
          guests: Number(rsvpForm.guests) || 1,
          message: rsvpForm.message.trim(),
        }),
      });
      if (!res.ok) return;
      const created: RsvpApiRow = await res.json();
      setWishes((w) => [{ ...toWish(created), time: 'Baru saja' }, ...w]);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRsvpForm({ name: '', guests: '1', attendance: 'Hadir', message: '' });
      }, 3000);
    } catch { /* ignore */ }
  };

  return { wishes, rsvpForm, setRsvpForm, isSubmitted, submit };
}

/** Countdown to an ISO date. */
export function useCountdown(isoDate: string) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date(isoDate).getTime();
    if (isNaN(target)) return;
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setT({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setT({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isoDate]);
  return t;
}

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
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback || iso;
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Resolve headline media with fallbacks. */
export function pickMedia(
  content: InvitationContent,
  fallback: { cover: string; hero: string; p1: string; p2: string },
) {
  return {
    cover: content.media?.cover || fallback.cover,
    hero: content.media?.hero || fallback.hero,
    p1: content.media?.partner1Photo || fallback.p1,
    p2: content.media?.partner2Photo || fallback.p2,
  };
}
