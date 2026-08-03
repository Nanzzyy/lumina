import { describe, it, expect } from 'vitest';
import { parseFlexibleDate } from './date';

describe('parseFlexibleDate', () => {
  it('returns null for empty input', () => {
    expect(parseFlexibleDate()).toBeNull();
    expect(parseFlexibleDate(null)).toBeNull();
    expect(parseFlexibleDate('')).toBeNull();
  });

  it('parses ISO dates natively', () => {
    const d = parseFlexibleDate('2027-08-28T10:00:00.000Z');
    expect(d?.toISOString()).toBe('2027-08-28T10:00:00.000Z');
  });

  it('parses English dates natively', () => {
    const d = parseFlexibleDate('August 28, 2027');
    expect(d?.getFullYear()).toBe(2027);
    expect(d?.getMonth()).toBe(7);
    expect(d?.getDate()).toBe(28);
  });

  it('parses Indonesian free-form dates with weekday prefix', () => {
    const d = parseFlexibleDate('Sabtu, 28 Agustus 2027');
    expect(d?.getFullYear()).toBe(2027);
    expect(d?.getMonth()).toBe(7);
    expect(d?.getDate()).toBe(28);
  });

  it('accepts Indonesian month abbreviations, case-insensitively', () => {
    expect(parseFlexibleDate('1 des 2030')?.getMonth()).toBe(11);
    expect(parseFlexibleDate('5 AGT 2030')?.getMonth()).toBe(7);
    expect(parseFlexibleDate('9 Okt 2030')?.getMonth()).toBe(9);
  });

  it('parses DD/MM/YYYY as day-first (not the US month-first reading)', () => {
    const d = parseFlexibleDate('28/08/2027');
    expect(d?.getMonth()).toBe(7);
    expect(d?.getDate()).toBe(28);
  });

  it('returns null when the month name is not recognised', () => {
    expect(parseFlexibleDate('28 Foobaruary 2027')).toBeNull();
  });

  it('returns null for unparseable text', () => {
    expect(parseFlexibleDate('besok sore')).toBeNull();
  });

  it('trims surrounding whitespace', () => {
    expect(parseFlexibleDate('  28 Agustus 2027  ')?.getDate()).toBe(28);
  });
});
