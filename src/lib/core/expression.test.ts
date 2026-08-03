import { describe, it, expect } from 'vitest';
import { exprDependencies, EXPR_BUDGET, EXPR_FUNCTIONS } from './expression';
import type { ExprNode } from './expression';

const lit = (value: string | number | boolean | null): ExprNode => ({ type: 'literal', value });
const v = (path: string): ExprNode => ({ type: 'var', path });

describe('EXPR_BUDGET / EXPR_FUNCTIONS (ADR-004)', () => {
  it('exposes the documented complexity budget', () => {
    expect(EXPR_BUDGET).toEqual({ maxDepth: 8, maxCalls: 20, maxRepeatRows: 1000, maxEvalMs: 5 });
  });

  it('allowlists the built-in functions', () => {
    expect(EXPR_FUNCTIONS).toContain('if');
    expect(EXPR_FUNCTIONS).toContain('coalesce');
    expect(new Set(EXPR_FUNCTIONS).size).toBe(EXPR_FUNCTIONS.length);
  });
});

describe('exprDependencies', () => {
  it('returns no dependencies for a literal', () => {
    expect(exprDependencies(lit(1))).toEqual([]);
  });

  it('returns the path of a var reference', () => {
    expect(exprDependencies(v('event.date'))).toEqual(['event.date']);
  });

  it('walks unary operands', () => {
    expect(exprDependencies({ type: 'unary', op: '!', operand: v('flags.locked') })).toEqual(['flags.locked']);
  });

  it('walks both sides of a binary node', () => {
    expect(
      exprDependencies({ type: 'binary', op: '+', left: v('a'), right: v('b') }),
    ).toEqual(['a', 'b']);
  });

  it('walks call arguments', () => {
    const node: ExprNode = {
      type: 'call',
      callee: 'if',
      args: [v('cond'), v('then'), lit('else')],
    };
    expect(exprDependencies(node)).toEqual(['cond', 'then']);
  });

  it('de-duplicates repeated paths while preserving first-seen order', () => {
    const node: ExprNode = {
      type: 'call',
      callee: 'concat',
      args: [
        v('couple.groom'),
        { type: 'binary', op: '+', left: v('couple.bride'), right: v('couple.groom') },
      ],
    };
    expect(exprDependencies(node)).toEqual(['couple.groom', 'couple.bride']);
  });

  it('walks deeply nested expressions', () => {
    const node: ExprNode = {
      type: 'binary',
      op: '&&',
      left: { type: 'unary', op: '!', operand: { type: 'call', callee: 'count', args: [v('rsvp.list')] } },
      right: {
        type: 'call',
        callee: 'default',
        args: [{ type: 'binary', op: '>', left: v('rsvp.total'), right: lit(0) }],
      },
    };
    expect(exprDependencies(node)).toEqual(['rsvp.list', 'rsvp.total']);
  });

  it('returns no dependencies for a call with no var args', () => {
    expect(exprDependencies({ type: 'call', callee: 'now', args: [] })).toEqual([]);
  });
});
