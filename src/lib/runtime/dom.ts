/**
 * Runtime DOM — ADR-021 §runtime-dom.
 *
 * Hydrates interactive nodes on the published page. Scans for `[data-lumina-hydrate]`,
 * initializes countdown timers, music players, RSVP forms, and wish forms.
 * Each interactive component class attaches to its DOM element.
 *
 * Designed to be built into a single ~15 KB gzipped JS bundle.
 */

import { EventBus } from './core';

// ─── DOM runtime ────────────────────────────────────────────
export class DOMRuntime {
  bus = new EventBus();
  private timers: ReturnType<typeof setInterval>[] = [];

  /** Scan and hydrate all interactive nodes. */
  init(root: HTMLElement | Document = document): void {
    const hydratable = root.querySelectorAll('[data-lumina-hydrate]');
    hydratable.forEach((el) => {
      const id = el.getAttribute('id') ?? '';
      if (el.classList.contains('lumina-countdown')) this.initCountdown(el as HTMLElement, id);
      if (el.classList.contains('lumina-music')) this.initMusic(el as HTMLElement, id);
      if (el.classList.contains('lumina-rsvp-form')) this.initRSVP(el as HTMLElement, id);
    });
  }

  /** Stop all timers and clean up. */
  destroy(): void {
    this.timers.forEach(clearInterval);
    this.timers = [];
    this.bus.clear();
  }

  // ── Countdown ────────────────────────────────────────────
  private initCountdown(el: HTMLElement, _id: string): void {
    const target = el.getAttribute('data-target') ?? '';
    if (!target) return;

    const update = () => {
      const { computeCountdown, formatCountdown } = require('./core');
      const state = computeCountdown(target);
      el.textContent = formatCountdown(state);
      if (state.expired) this.bus.emit('countdown-end', { type: 'countdown-end', nodeId: _id });
    };

    update();
    this.timers.push(setInterval(update, 1000));
  }

  // ── Music player ─────────────────────────────────────────
  private initMusic(el: HTMLElement, _id: string): void {
    const src = el.getAttribute('data-src') ?? '';
    const autoplay = el.getAttribute('data-autoplay') === 'true';
    if (!src) return;

    const audio = document.createElement('audio');
    audio.src = src;
    audio.loop = el.getAttribute('data-loop') === 'true';
    audio.volume = parseFloat(el.getAttribute('data-volume') ?? '1');

    let playing = false;

    const toggle = () => {
      if (playing) { audio.pause(); playing = false; }
      else { audio.play().catch(() => {}); playing = true; }
      el.classList.toggle('playing', playing);
    };

    el.addEventListener('click', toggle);
    if (autoplay) { audio.play().catch(() => {}); playing = true; el.classList.add('playing'); }
  }

  // ── RSVP form ────────────────────────────────────────────
  private initRSVP(el: HTMLElement, _id: string): void {
    const slug = el.getAttribute('data-slug') ?? '';

    el.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = {
        name: (form.querySelector('[name="name"]') as HTMLInputElement)?.value ?? '',
        status: (form.querySelector('[name="status"]') as HTMLSelectElement)?.value ?? 'hadir',
        guests: parseInt((form.querySelector('[name="guests"]') as HTMLInputElement)?.value ?? '1', 10),
        message: (form.querySelector('[name="message"]') as HTMLTextAreaElement)?.value ?? '',
      };

      const { validateRSVP } = require('./core');
      const errors = validateRSVP(data);
      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }

      try {
        const res = await fetch(`/api/rsvp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, ...data }),
        });
        if (!res.ok) throw new Error('RSVP failed');
        form.innerHTML = '<p class="text-sm text-green-600">Thank you! Your RSVP has been received.</p>';
      } catch {
        alert('Failed to submit RSVP. Please try again.');
      }
    });
  }
}
