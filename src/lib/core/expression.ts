/**
 * Expression DSL — ADR-004. Type + budget contract for P1; evaluator ships in P3.
 *
 * Tokenizer → AST → evaluator, pure, no eval/Function/DOM. Total: bad input
 * returns fallback rather than throwing into render. Complexity budget (below)
 * prevents pathological expressions from stalling editor/publish.
 */

// ─── AST ────────────────────────────────────────────────────
export type ExprOperator =
  | '+' | '-' | '*' | '/' | '%'
  | '==' | '!=' | '<' | '<=' | '>' | '>='
  | '&&' | '||';

export interface LiteralNode {
  type: 'literal';
  value: string | number | boolean | null;
}
export interface VarRefNode {
  type: 'var';
  path: string; // resolved against Variables (ADR-003)
}
export interface UnaryNode {
  type: 'unary';
  op: '!' | '-';
  operand: ExprNode;
}
export interface BinaryNode {
  type: 'binary';
  op: ExprOperator;
  left: ExprNode;
  right: ExprNode;
}
export interface CallNode {
  type: 'call';
  callee: string; // allowlist of fns (ADR-004)
  args: ExprNode[];
}
export type ExprNode = LiteralNode | VarRefNode | UnaryNode | BinaryNode | CallNode;

// ─── Complexity budget (ADR-004 §complexity) ────────────────
export const EXPR_BUDGET = {
  maxDepth: 8,
  maxCalls: 20,
  maxRepeatRows: 1000,
  /** Wall-time cap in ms per evaluation. Exceeding → fallback + telemetry. */
  maxEvalMs: 5,
} as const;

/** Built-in function allowlist (versioned; additions are additive). */
export const EXPR_FUNCTIONS = [
  'if', 'format', 'duration', 'now', 'count', 'sum', 'list', 'first', 'last',
  'upper', 'lower', 'concat', 'default', 'coalesce', 'repeat',
] as const;
export type ExprFunction = (typeof EXPR_FUNCTIONS)[number];

/** Variables an expression reads — feeds the resolver dependency graph. */
export function exprDependencies(node: ExprNode): string[] {
  const out: string[] = [];
  const walk = (n: ExprNode): void => {
    if (n.type === 'var') out.push(n.path);
    else if (n.type === 'unary') walk(n.operand);
    else if (n.type === 'binary') {
      walk(n.left);
      walk(n.right);
    } else if (n.type === 'call') n.args.forEach(walk);
  };
  walk(node);
  return Array.from(new Set(out));
}
