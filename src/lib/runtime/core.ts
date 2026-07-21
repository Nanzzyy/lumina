/**
 * Runtime Core — ADR-021 §runtime.
 *
 * Browser-side engine: evaluates live expressions, manages countdown tick,
 * handles music playback, RSVP/wish form submission. Runs as a lazy-hydrated
 * island on the published page (zero-JS by default, hydrates only interactive
 * nodes marked `data-lumina-hydrate`).
 *
 * All DOM I/O is in runtime-dom.ts. This file is pure logic (testable in Node).
 */

// ─── Countdown ──────────────────────────────────────────────
export interface CountdownConfig {
  target: string;  // ISO date string
  labels?: { days?: string; hours?: string; minutes?: string; seconds?: string };
}

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export function computeCountdown(target: string): CountdownState {
  const now = Date.now();
  const targetMs = new Date(target).getTime();
  const diff = Math.max(0, targetMs - now);
  const expired = diff <= 0;
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    expired,
  };
}

export function formatCountdown(state: CountdownState): string {
  if (state.expired) return '🎉';
  return `${state.days}d ${state.hours}h ${state.minutes}m ${state.seconds}s`;
}

// ─── Music player ───────────────────────────────────────────
export interface MusicConfig {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  volume?: number;
}

export interface MusicState {
  playing: boolean;
  currentTime: number;
  duration: number;
}

// ─── RSVP form ──────────────────────────────────────────────
export interface RSVPData {
  name: string;
  status: string;
  guests: number;
  message?: string;
}

export function validateRSVP(data: RSVPData): string[] {
  const errors: string[] = [];
  if (!data.name || data.name.trim().length < 2) errors.push('Name is required (min 2 characters)');
  if (!['hadir', 'tidak', 'ragu'].includes(data.status)) errors.push('Invalid attendance status');
  if (data.guests < 1 || data.guests > 10) errors.push('Guest count must be 1–10');
  return errors;
}

// ─── Wish form ──────────────────────────────────────────────
export interface WishData {
  name: string;
  message: string;
}

export function validateWish(data: WishData): string[] {
  const errors: string[] = [];
  if (!data.name || data.name.trim().length < 2) errors.push('Name is required');
  if (!data.message || data.message.trim().length < 5) errors.push('Message is required (min 5 characters)');
  return errors;
}

// ─── Event / Expression runtime ─────────────────────────────
export interface EventPayload {
  type: string;
  nodeId?: string;
  data?: unknown;
}

export type EventHandler = (payload: EventPayload) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on(type: string, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);
    return () => {
      const list = this.handlers.get(type);
      if (list) {
        const idx = list.indexOf(handler);
        if (idx >= 0) list.splice(idx, 1);
      }
    };
  }

  emit(type: string, payload: EventPayload): void {
    const list = this.handlers.get(type);
    if (list) list.forEach((h) => h(payload));
  }

  clear(): void {
    this.handlers.clear();
  }
}
