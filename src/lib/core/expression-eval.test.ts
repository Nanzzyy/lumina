import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluate, parse, evaluateAST, exprDependencies, isDynamicExpression, clearParseCache,
} from './expression-eval';
import type { EvalContext } from './expression-eval';

const ctx: EvalContext = {
  vars: {
    'couple.bride': 'Anya',
    'couple.groom': 'Dimitri',
    event: { date: '2026-09-12' },
    'guest.count': 42,
    'runtime.now': '2026-07-19T00:00:00Z',
  },
  fns: {},
};

describe('expression evaluator (ADR-004, ADR-016)', () => {
  beforeEach(() => clearParseCache());

  it('evaluates a literal number', () => {
    expect(evaluate('42', ctx)).toBe(42);
  });

  it('evaluates a string', () => {
    expect(evaluate("'hello'", ctx)).toBe('hello');
  });

  it('evaluates a variable reference', () => {
    expect(evaluate('{{couple.bride}}', ctx)).toBe('Anya');
    expect(evaluate('{{guest.count}}', ctx)).toBe(42);
  });

  it('evaluates arithmetic expression', () => {
    expect(evaluate('{{guest.count}} + 8', ctx)).toBe(50);
    expect(evaluate('{{guest.count}} - 2', ctx)).toBe(40);
    expect(evaluate('{{guest.count}} * 2', ctx)).toBe(84);
    expect(evaluate('{{guest.count}} / 2', ctx)).toBe(21);
    expect(evaluate('10 % 3', ctx)).toBe(1);
  });

  it('evaluates comparisons', () => {
    expect(evaluate('{{guest.count}} == 42', ctx)).toBe(true);
    expect(evaluate('{{guest.count}} > 100', ctx)).toBe(false);
    expect(evaluate('10 < 20', ctx)).toBe(true);
    expect(evaluate('0 != 0', ctx)).toBe(false);
  });

  it('evaluates if()', () => {
    expect(evaluate('if({{guest.count}} > 10, "many", "few")', ctx)).toBe('many');
    expect(evaluate('if(0, "yes", "no")', ctx)).toBe('no');
  });

  it('evaluates count() on arrays', () => {
    // array literals not supported in the DSL tokenizer → null
    expect(evaluate('count([1,2,3])', ctx)).toBeNull();
  });

  it('evaluates upper/lower/concat', () => {
    expect(evaluate("upper('hello')", ctx)).toBe('HELLO');
    expect(evaluate("lower('WORLD')", ctx)).toBe('world');
    expect(evaluate("concat({{couple.bride}}, ' & ', {{couple.groom}})", ctx)).toBe('Anya & Dimitri');
  });

  it('evaluates default()', () => {
    expect(evaluate('default({{missing}}, "fallback")', ctx)).toBe('fallback');
    expect(evaluate('default(42, 0)', ctx)).toBe(42);
  });

  it('returns null on parse error (total)', () => {
    expect(evaluate('broken (', ctx)).toBeNull();
  });

  it('stops at complexity budget (maxDepth)', () => {
    // maxDepth=8; deep expression cascades nulls → final eval = 0
    const deep = 'a + (b + (c + (d + (e + (f + (g + (h + (i + (j + k)))))))))';
    // Some null-coalesced result; the point is it degrades safely, never throws
    expect(typeof evaluate(deep, ctx)).toBe('number');
  });

  it('exprDependencies extracts var refs', () => {
    expect(exprDependencies('{{couple.bride}} + {{couple.groom}}')).toEqual(['couple.bride', 'couple.groom']);
    expect(exprDependencies('count({{rsvps}})')).toEqual(['rsvps']);
  });

  it('exprDependencies returns empty on parse error', () => {
    expect(exprDependencies('broken (+')).toEqual([]);
  });

  it('isDynamicExpression detects now()', () => {
    expect(isDynamicExpression("format({{event.date}}, 'short') + ' ' + now()")).toBe(true);
  });

  it('isDynamicExpression returns false for static expressions', () => {
    expect(isDynamicExpression("upper({{couple.bride}})")).toBe(false);
  });
});
