# ADR-006: AI Provider Contract & Safety Layer

- Status: Accepted (minor notes integrated 2026-07-19)
- Date: 2026-07-19
- Phase gate: P1 (contract Accepted before P1); MVP provider in P6

## Context
AI is a core module, not a bolt-on. It must operate on the semantic Document (not HTML), be provider-agnostic, and never corrupt user work. The model will sometimes propose invalid or unwanted changes; the architecture must make unsafe application impossible by construction.

## Decision
AI interacts with the document **only** through a versioned Contract — it never sees engine internals, never mutates objects, never imports Core directly.

```ts
type AICapability =
 | 'generate-document' | 'suggest-theme' | 'suggest-typography' | 'suggest-color'
 | 'improve-layout' | 'fix-responsive' | 'generate-copy' | 'generate-component'
 | 'audit-accessibility' | 'audit-seo' | 'animate';

interface AIRequest  { intent: AICapability; doc: AIDocumentView; prompt?: string; selection?: id[]; }
interface AIResult   { patch: DocumentPatch;        // ADR-010
                       explanation: string; warnings?: string[];
                       confidence: number;          // 0..1 — UI: "AI 93% sure"
                       risk: 'low'|'medium'|'high'; // blast radius if patch is wrong
                       reason: string;              // why, one line
                       estimatedImpact?: string; }  // e.g. "12 nodes, 4 bindings"
interface AIProvider { id: string; capabilities: AICapability[]; run(req: AIRequest): Promise<AIResult>; }
```

- `AIDocumentView` is a **projection** of the document (resolved variables/tokens, schema, capabilities) — enough to reason, nothing about engine plumbing. Satisfies Rule R3.
- **Safety pipeline (never bypassed):**
  ```
  Provider → proposedPatch
    → SchemaValidator   (patch shape + target schema; reject if invalid)
    → Simulation        (dry-run resolve: does it render? expression valid? bindings resolve?)
    → Diff              (human-readable preview: "add 3 nodes, bind Hero.title → couple.bride")
    → user accepts
    → History command   (ADR-010; undoable)
    → Apply
  ```
- Invalid patches are rejected before the user sees them; the provider is asked to retry with the validation error.
- Every accepted patch is a normal history entry → undo works exactly like a manual edit.
- Default provider: Claude (latest Sonnet/Opus). Additional providers register via plugin manifest (ADR-005).

## Consequences
- AI features are uniform across surfaces (command palette, inspector "suggest", onboarding generator).
- We can swap/add providers (local model, other vendor) without touching engines.
- Telemetry records accept-rate, reject-reason, latency (ADR-012).

## Alternatives
- **AI emits HTML / direct JSON mutate:** rejected — bypasses schema, no undo, corruption risk, provider lock-in.
- **AI calls engine internals for "richer" context:** rejected — violates R3, couples provider to Core version.
