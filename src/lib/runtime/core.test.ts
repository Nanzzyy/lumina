import { describe, it, expect, vi } from 'vitest';
import { computeCountdown, validateRSVP, validateWish, EventBus } from './core';

describe('runtime core (ADR-021)', () => {
  it('computeCountdown returns correct remaining time', () => {
    const future = new Date(Date.now() + 86400000 * 3 + 3600000 * 2 + 60000 * 30 + 15000).toISOString();
    const state = computeCountdown(future);
    expect(state.days).toBe(3);
    expect(state.hours).toBe(2);
    expect(state.minutes).toBe(30);
    expect(state.expired).toBe(false);
  });

  it('computeCountdown detects expired date', () => {
    const past = new Date(Date.now() - 10000).toISOString();
    const state = computeCountdown(past);
    expect(state.expired).toBe(true);
  });

  it('validateRSVP checks required fields', () => {
    expect(validateRSVP({ name: '', status: 'hadir', guests: 1 })).toHaveLength(1);
    expect(validateRSVP({ name: 'A', status: 'hadir', guests: 1 })).toHaveLength(1);
    expect(validateRSVP({ name: 'Alice', status: 'unknown', guests: 1 })).toHaveLength(1);
    expect(validateRSVP({ name: 'Alice', status: 'hadir', guests: 0 })).toHaveLength(1);
    expect(validateRSVP({ name: 'Alice', status: 'hadir', guests: 1 })).toHaveLength(0);
  });

  it('validateWish checks name and message', () => {
    expect(validateWish({ name: '', message: 'Hi' })).toHaveLength(2);
    expect(validateWish({ name: 'Bob', message: 'Great event!' })).toHaveLength(0);
  });

  it('EventBus fires and unsubscribes', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    const unsub = bus.on('countdown-end', fn);
    bus.emit('countdown-end', { type: 'countdown-end' });
    expect(fn).toHaveBeenCalledOnce();
    unsub();
    bus.emit('countdown-end', { type: 'countdown-end' });
    expect(fn).toHaveBeenCalledOnce();
  });
});
