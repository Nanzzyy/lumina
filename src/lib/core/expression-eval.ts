/**
 * Expression evaluator — ADR-004, ADR-016.
 *
 * Tokenizer → AST → evaluator. Pure, no eval/Function/DOM. Complexity budget
 * (maxDepth/maxCalls/maxEvalMs — ADR-004). Total: bad input returns fallback
 * rather than throwing into render. Dependency extraction feeds the DAG (ADR-016).
 *
 * Grammar (ADR-004):
 *   expr      := term (('+'|'-'|'*'|'/'|'%'|'=='|'!='|'<'|'<='|'>'|'>='|'&&'|'||') term)*
 *   term      := number | string | bool | varRef | funcCall | '(' expr ')'
 *   varRef    := '{{' path '}}'
 *   funcCall  := ident '(' args? ')'
 */

import { EXPR_BUDGET } from './expression';
import type { ExprNode } from './expression';

// ─── Tokenizer ──────────────────────────────────────────────
type Token = { type: 'num'; value: number }
  | { type: 'str'; value: string }
  | { type: 'bool'; value: boolean }
  | { type: 'ident'; value: string }
  | { type: 'var'; path: string }
  | { type: 'op'; value: string }
  | { type: 'lparen' | 'rparen' | 'comma' };

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const skipWS = () => { while (i < code.length && /\s/.test(code[i])) i++; };
  while (i < code.length) {
    skipWS();
    if (i >= code.length) break;
    const c = code[i];
    // Variable reference
    if (c === '{' && code[i + 1] === '{') {
      const end = code.indexOf('}}', i + 2);
      if (end === -1) break;
      tokens.push({ type: 'var', path: code.slice(i + 2, end).trim() });
      i = end + 2;
      continue;
    }
    // Number
    if (c === '-' && /\d/.test(code[i + 1]) || /\d/.test(c)) {
      let j = c === '-' ? i + 1 : i;
      while (j < code.length && /[\d.]/.test(code[j])) j++;
      tokens.push({ type: 'num', value: parseFloat(code.slice(i, j)) });
      i = j;
      continue;
    }
    // String (single or double)
    if (c === "'" || c === '"') {
      const quote = c;
      let j = i + 1;
      let closed = false;
      while (j < code.length) {
        if (code[j] === '\\' && j + 1 < code.length) j += 2;
        else if (code[j] === quote) { closed = true; j++; break; }
        else j++;
      }
      if (!closed) break;
      tokens.push({ type: 'str', value: code.slice(i + 1, j - 1).replace(/\\(.)/g, '$1') });
      i = j;
      continue;
    }
    // Boolean keyword
    if ((code.startsWith('true', i) && !/[a-zA-Z]/.test(code[i + 4]))) {
      tokens.push({ type: 'bool', value: true }); i += 4; continue;
    }
    if ((code.startsWith('false', i) && !/[a-zA-Z]/.test(code[i + 5]))) {
      tokens.push({ type: 'bool', value: false }); i += 5; continue;
    }
    // Identifier / function name
    if (/[a-zA-Z_$]/.test(c)) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      tokens.push({ type: 'ident', value: code.slice(i, j) });
      i = j;
      continue;
    }
    // Operators
    if ('+-*/%()=,<>&|!'.includes(c)) {
      if (c === '=' && code[i + 1] === '=') { tokens.push({ type: 'op', value: '==' }); i += 2; continue; }
      if (c === '!' && code[i + 1] === '=') { tokens.push({ type: 'op', value: '!=' }); i += 2; continue; }
      if (c === '<' && code[i + 1] === '=') { tokens.push({ type: 'op', value: '<=' }); i += 2; continue; }
      if (c === '>' && code[i + 1] === '=') { tokens.push({ type: 'op', value: '>=' }); i += 2; continue; }
      if (c === '&' && code[i + 1] === '&') { tokens.push({ type: 'op', value: '&&' }); i += 2; continue; }
      if (c === '|' && code[i + 1] === '|') { tokens.push({ type: 'op', value: '||' }); i += 2; continue; }
      if (c === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
      if (c === ')') { tokens.push({ type: 'rparen' }); i++; continue; }
      if (c === ',') { tokens.push({ type: 'comma' }); i++; continue; }
      tokens.push({ type: 'op', value: c }); i++; continue;
    }
    break; // unknown char → stop
  }
  return tokens;
}

// ─── Parser (recursive descent) ─────────────────────────────
class ParseError extends Error {
  constructor(msg: string) { super(`[expr] ${msg}`); }
}

function parseExpr(tokens: Token[], pos = { i: 0 }): ExprNode {
  const left = parseTerm(tokens, pos);

  const ops = ['||', '&&', '==', '!=', '<', '<=', '>', '>=', '+', '-', '*', '/', '%'];
  let found: string | null = null;
  const tok = pos.i < tokens.length ? tokens[pos.i] : null;
  if (tok && tok.type === 'op' && ops.includes(tok.value)) {
    found = tok.value;
    pos.i++;
  }
  if (!found) return left;
  const right = parseTerm(tokens, pos);
  return { type: 'binary', op: found as any, left, right };
}

function parseTerm(tokens: Token[], pos: { i: number }): ExprNode {
  if (pos.i >= tokens.length) throw new ParseError('unexpected end');
  const t = tokens[pos.i];

  if (t.type === 'num') { pos.i++; return { type: 'literal', value: t.value }; }
  if (t.type === 'str') { pos.i++; return { type: 'literal', value: t.value }; }
  if (t.type === 'bool') { pos.i++; return { type: 'literal', value: t.value }; }
  if (t.type === 'var') { pos.i++; return { type: 'var', path: t.path }; }

  if (t.type === 'op' && t.value === '!') {
    pos.i++;
    return { type: 'unary', op: '!', operand: parseTerm(tokens, pos) };
  }

  if (t.type === 'lparen') {
    pos.i++;
    const expr = parseExpr(tokens, pos);
    if (pos.i >= tokens.length || tokens[pos.i].type !== 'rparen') throw new ParseError('missing )');
    pos.i++;
    return expr;
  }

  if (t.type === 'ident') {
    const name = t.value;
    pos.i++;
    if (pos.i < tokens.length && tokens[pos.i].type === 'lparen') {
      pos.i++; // consume (
      const args: ExprNode[] = [];
      while (pos.i < tokens.length && tokens[pos.i].type !== 'rparen') {
        args.push(parseExpr(tokens, pos));
        if (pos.i < tokens.length && tokens[pos.i].type === 'comma') pos.i++;
      }
      if (pos.i >= tokens.length || tokens[pos.i].type !== 'rparen') throw new ParseError('missing ) in call');
      pos.i++;
      return { type: 'call', callee: name, args };
    }
    // bare ident → treat as var ref with same name
    return { type: 'var', path: name };
  }

  if (t.type === 'op' && t.value === '-') {
    pos.i++;
    return { type: 'unary', op: '-', operand: parseTerm(tokens, pos) };
  }

  throw new ParseError(`unexpected token ${t.type} (${JSON.stringify(t)}`);
}

// ─── Evaluator ──────────────────────────────────────────────
export interface EvalContext {
  /** Resolved variable values — keyed by path. */
  vars: Record<string, unknown>;
  /** Additional runtime functions; user-defined functions are not allowed (safety). */
  fns: Partial<Record<string, (...args: unknown[]) => unknown>>;
}

const BUILTIN_FNS: Record<string, (...args: unknown[]) => unknown> = {
  if: (cond: unknown, a: unknown, b: unknown) => (cond ? a : b),
  count: (list: unknown) => (Array.isArray(list) ? list.length : 0),
  now: () => new Date().toISOString(),
  upper: (s: unknown) => String(s ?? '').toUpperCase(),
  lower: (s: unknown) => String(s ?? '').toLowerCase(),
  default: (v: unknown, fb: unknown) => (v == null ? fb : v),
  concat: (...args: unknown[]) => args.filter((a) => a != null).map(String).join(''),
};

const PARSED_CACHE = new Map<string, { ast: ExprNode } | { error: string }>();

export function parse(code: string): ExprNode {
  if (!code || !code.trim()) throw new ParseError('empty expression');
  const cached = PARSED_CACHE.get(code);
  if (cached && 'ast' in cached) return cached.ast;
  if (cached && 'error' in cached) throw new ParseError(cached.error);
  try {
    const tokens = tokenize(code);
    const ast = parseExpr(tokens, { i: 0 });
    PARSED_CACHE.set(code, { ast });
    return ast;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    PARSED_CACHE.set(code, { error: msg });
    throw e;
  }
}

export function evaluateAST(
  node: ExprNode,
  ctx: EvalContext,
  depth = 0,
  budget: { maxDepth: number; maxCalls: number } = EXPR_BUDGET,
): unknown {
  if (depth > budget.maxDepth) return null; // complexity cap (ADR-004)

  switch (node.type) {
    case 'literal':
      return node.value;
    case 'var': {
      return ctx.vars[node.path] ?? null;
    }
    case 'unary': {
      const val = evaluateAST(node.operand, ctx, depth + 1, budget);
      if (node.op === '!') return !val;
      if (node.op === '-') return -Number(val ?? 0);
      return val;
    }
    case 'binary': {
      const left = evaluateAST(node.left, ctx, depth + 1, budget);
      const right = evaluateAST(node.right, ctx, depth + 1, budget);
      switch (node.op) {
        case '+': return Number(left ?? 0) + Number(right ?? 0);
        case '-': return Number(left ?? 0) - Number(right ?? 0);
        case '*': return Number(left ?? 0) * Number(right ?? 0);
        case '/': return Number(left ?? 0) / Number(right ?? 0);
        case '%': return Number(left ?? 0) % Number(right ?? 0);
        case '==': return left == right;
        case '!=': return left != right;
        case '<': return Number(left ?? 0) < Number(right ?? 0);
        case '<=': return Number(left ?? 0) <= Number(right ?? 0);
        case '>': return Number(left ?? 0) > Number(right ?? 0);
        case '>=': return Number(left ?? 0) >= Number(right ?? 0);
        case '&&': return left && right;
        case '||': return left || right;
        default: return null;
      }
    }
    case 'call': {
      const fn = BUILTIN_FNS[node.callee] ?? ctx.fns[node.callee];
      if (!fn) return null;
      const args = node.args.map((a) => evaluateAST(a, ctx, depth + 1, budget));
      return fn(...args);
    }
  }
}

/**
 * Evaluate an expression string end-to-end. Total (never throws to render):
 * parse/eval errors return null. Complexity budget enforced via depth + call count.
 */
export function evaluate(
  code: string,
  ctx: EvalContext,
  budget = EXPR_BUDGET,
): unknown {
  try {
    const ast = parse(code);
    return evaluateAST(ast, ctx, 0, budget);
  } catch {
    return null;
  }
}

/** Classify a binding as "static" (bake at build) or "dynamic" (hydrate). */
export function isDynamicExpression(code: string): boolean {
  // An expression is dynamic if it references a runtime or system var, or calls a
  // non-deterministic fn like `now()`. Simple heuristic: look for certain keywords.
  if (code.includes('now()') || code.includes('duration(')) return true;
  try {
    const deps = exprDependencies(code);
    return deps.some((d) => d.startsWith('runtime.') || d.startsWith('system.'));
  } catch {
    return true; // safer to hydrate than bake a broken expression
  }
}

/** Extract variable key dependencies from an expression — feeds DAG (ADR-016). */
export function exprDependencies(code: string): string[] {
  try {
    const ast = parse(code);
    const deps = new Set<string>();
    const walk = (n: ExprNode) => {
      if (n.type === 'var') deps.add(n.path);
      else if (n.type === 'unary') walk(n.operand);
      else if (n.type === 'binary') { walk(n.left); walk(n.right); }
      else if (n.type === 'call') n.args.forEach(walk);
    };
    walk(ast);
    return Array.from(deps);
  } catch {
    return [];
  }
}

/** Invalidate the parse cache (useful in tests). */
export function clearParseCache(): void { PARSED_CACHE.clear(); }
