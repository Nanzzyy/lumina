# ADR-007: Event Runtime & Scheduler

- Status: Proposed
- Date: 2026-07-19
- Phase gate: P1 (Runtime API contract Accepted before P1); engine built P6

## Context
Rev 1 had a narrow "Interaction Engine". Real digital products need event chains (`countdown-end → play-music → open-modal`), conditions, scheduling (run every minute, delay, debounce), and a single runtime API every consumer (renderer, plugin, AI) calls identically.

## Decision
**Event Engine** = `Trigger → Condition → Action`, evaluated by a **Runtime** that exposes a stable API.

```ts
interface EventRule { id; trigger: Trigger; condition?: ExprBinding; actions: Action[]; }
// triggers: load | click | hover | scroll | scroll-into-view | countdown-end |
//           data-submit | time | variable-change | custom(plugin)
// actions:  play-music | pause | open-modal | navigate | set-variable |
//           run-animation | show | hide | call-plugin | scroll-to
```

**Runtime API** is split into **Read** and **Mutate** halves (satisfies R1; plugins get only what their permissions grant — a read-only plugin receives the Read API):
```ts
interface RuntimeRead {                       // side-effect free; safe to hand broadly
  resolveVariable(key): Resolved;
  resolveToken(path): string;
  evaluateExpression(expr, ctx?): Resolved;
}
interface RuntimeMutate {                     // requires 'mutate' permission
  applyPatch(patch: DocumentPatch): void;     // routes through history (ADR-010)
  dispatchEvent(trigger: Trigger, payload?): void;
  setVariable(key, value): void;
  runAnimation(id, opts?): CancelHandle;
}
interface Runtime extends RuntimeRead, RuntimeMutate {}
```
- **Condition** is an expression (ADR-004); actions run only if it resolves truthy.
- **Scheduler** (extends triggers): `interval(ms)`, `delay(ms)`, `debounce(ms)`, `throttle(ms)`, `cron(expr)`. Returns cancelable handles. Enables "tick countdown every second", "debounce RSVP submit", "delay modal 5s after countdown-end".
- **Deterministic ordering:** rules sorted by (scope, priority, registration); same trigger fires in defined order. Side-effects batched per tick.
- **Published output:** Runtime ships as the small hydrate bundle that evaluates events + live expressions + animations on the rendered page (ADR-008). Pure Core defines the rule semantics; Runtime implements execution.

## Consequences
- One execution model in editor, preview, and publish.
- Plugins register custom triggers/actions via manifest (ADR-005) → extensible without Core edits.
- Events are document subtree rows → full history (ADR-010).

## Alternatives
- **Per-component imperative handlers:** rejected — not portable, not data-driven, AI/Plugin can't reason globally.
- **Full reactive graph (signals everywhere):** deferred — overkill for P1; the Runtime API can back onto signals later without contract change.
