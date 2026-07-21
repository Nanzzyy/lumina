import { describe, it, expect } from 'vitest';
import { isVarBinding, isExprBinding, isBound } from './values';

describe('binding guards (ADR-003)', () => {
  it('isVarBinding detects $var', () => {
    expect(isVarBinding({ $var: 'couple.bride' })).toBe(true);
    expect(isVarBinding({ $expr: '1+1' })).toBe(false);
    expect(isVarBinding('literal')).toBe(false);
    expect(isVarBinding(null)).toBe(false);
  });

  it('isExprBinding detects $expr', () => {
    expect(isExprBinding({ $expr: 'count(rsvps)' })).toBe(true);
    expect(isExprBinding({ $var: 'x' })).toBe(false);
  });

  it('isBound matches either', () => {
    expect(isBound({ $var: 'x' })).toBe(true);
    expect(isBound({ $expr: 'x' })).toBe(true);
    expect(isBound(42)).toBe(false);
  });
});
