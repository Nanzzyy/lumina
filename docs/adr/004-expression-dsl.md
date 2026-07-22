# ADR-004: Expression DSL Specification

- Status: Proposed
- Date: 2026-07-19
- Phase gate: P3; grammar finalized in P1

## Context
Bindings (ADR-003) need computed values: countdown (`event.date - now`), counts (`count(rsvps)`), conditionals (`if(rsvp.enabled)`), formatting (`format(event.date,'long')`), and list iteration (`repeat(gallery.images)`). We need a small, safe, AI-emittable expression language evaluated by Core — never `eval`.

## Decision
A tiny typed DSL: **tokenizer → AST → evaluator**, pure functions, no `eval`/`Function`/dynamic import.

**Grammar (subset):**
```
expr      := term (('+'|'-'|'*'|'/'|'%'|'=='|'!='|'<'|'<='|'>'|'>='|'&&'|'||') term)*
term      := number | string | bool | varRef | funcCall | '(' expr ')'
varRef    := '{{' path '}}'                      // e.g. {{couple.bride}}
funcCall  := ident '(' args? ')'
args      := expr (',' expr)*
```
**Built-in functions (allowlist, versioned):** `if(c,a,b)`, `format(date,fmt)`, `duration(date)`, `now()`, `count(list)`, `sum/list/first/last`, `upper/lower/concat`, `default(v,fb)`, `coalesce(...)`. No file, network, or DOM access.

- **Evaluation is sandboxed and total:** unknown var → `fallback`; type mismatch → `fallback`/`undefined` (never throws into render). Errors are telemetry events (ADR-012/013), not crashes.
- **Dependency graph:** static analysis of an expression yields the variable keys it reads → feeds the resolver's incremental recompute (ADR-003 cascade).
- **`repeat`:** a node/child may declare `repeatSource` (a list-valued binding); the renderer iterates, cloning the subtree with an injected loop variable (e.g. `{{item}}`, `{{index}}`).
- **AI contract:** expressions are plain strings the model emits; Core validates against the grammar before apply (ADR-006).
- **Complexity budget (hard caps):** max AST depth (e.g. 8), max function-call count (e.g. 20), max evaluation wall-time (e.g. 5 ms) per expression. Breaching any cap returns `fallback` + a telemetry event (ADR-012) instead of stalling the editor or publish. `repeat` adds its own row-count cap.

## Consequences
- New functions require a migrator if they change semantics (ADR-002); additions are additive.
- The DSL is versioned (`dslVersion`); old expressions evaluate under their original semantics.
- Performance: expressions memoize by `(exprText, dependencyValues)`.

## Alternatives
- **Full JS sandbox (e.g. quickjs-emscripten):** rejected for P1 — heavy, hard to audit; revisit only if the DSL proves too limiting.
- **JSONata / expr-eval library:** viable; we author our own only if the dependency is undesirable. `expr-eval` is the fallback if build cost is high.
