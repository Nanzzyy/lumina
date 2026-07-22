# ADR-019: Responsive Layout Engine

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P5 (must be Accepted before any P5 code)

## Context
P4 established Property Engine + Theme Tokens, but responsive behavior still relies on today's blanket `md:` breakpoint approach (Tailwind `@media ≤768px` stacking in `TreeRenderer`). The user's requirement: "never manually redesign for mobile." The current approach is insufficient: it lacks per-device-frame overrides, container queries, fluid scaling, and a unified responsive constraint system. After P4's property system, we can now build responsive as a **first-class layout transform**: a set of per-breakpoint Frame overrides derived from the base frame, not a separate document copy.

## Decision

### Architecture
```
Resolved Base Document
        ↓
Breakpoint Selector  (device/vw input)
        ↓
Frame Transformer   (applies overrides per breakpoint)
        ↓
Constraint Solver   (pin, aspect, min/max, safe-area, container-query)
        ↓
Responsive Frame    (one frame per device, rendered by the same TreeRenderer)
```

### Per-breakpoint overrides (lightweight, no copy)
A Frame carries a `responsive` map (already defined in core/document.ts `PerBreakpoint`):
```ts
interface PerBreakpoint {
  sm?: Partial<NodeFrame> & { layoutProps?: LayoutProps };
  md?: Partial<NodeFrame> & { layoutProps?: LayoutProps };
  lg?: Partial<NodeFrame> & { layoutProps?: LayoutProps };
  xl?: Partial<NodeFrame> & { layoutProps?: LayoutProps };
  '2xl'?: Partial<NodeFrame> & { layoutProps?: LayoutProps };
}
```
Override is a **partial diff** — only what changes per device. The base frame provides defaults. This contrasts with "copy the whole document per device" (Framer) which creates sync drift.

### Devices
| Key | Label | Viewport (default) |
|---|---|---|
| `base` | Phone | 390×844 |
| `sm` | Phone Landscape | 640×360 |
| `md` | Tablet | 768×1024 |
| `lg` | Desktop | 1024×768 |
| `xl` | Wide | 1280×800 |
| `2xl` | Ultra-wide | 1536×864 |
| `custom` | Custom | user-defined |

### Constraint Solver (extends §16.2)
Per-node constraints remain in `Node.constraints`: `pin`, `aspect`, `minW/maxW/minH/maxH`, `safeArea`, `container`. The solver runs as a pure function during the Resolution Pipeline step 6, consuming the per-breakpoint frame + resolved props and emitting CSS (via `toStyle` adapters, ADR-017). Container queries (`container: 'query'`) use the parent container's actual width at render time rather than viewport width — implemented via CSS `@container` in the renderer.

### Fluid tokens
Theme tokens with responsive values (e.g. `--space-section: clamp(2.5rem, 5vw, 5rem)`) are emitted by the Token Resolver (ADR-018) when a token is flagged as fluid. No manual duplication.

### Editor experience
- Device switcher in the toolbar (mobile/tablet/desktop/wide) — exists in P2 as `ui.devicePreview`.
- Selecting a device shows the corresponding `Frame` with its responsive overrides applied.
- Editing a property while a non-base device is active creates a **breakpoint override** (lightning bolt indicator in the Inspector); removing it falls back to base.
- The canvas remains the same frame tree — the viewport device is a preview transform, not a separate layout.

## Consequences
- No separate mobile layout to maintain: overrides are per-property diffs.
- The existing `PerBreakpoint` type on Node (P1 document.ts) is the source of truth — no new document model needed.
- Constraint Solver and fluid tokens are pure functions that slot into the existing Resolution Pipeline step 6.
- Device preview uses the same Camera/Viewport layers (ADR-014) — no new canvas code.

## Alternatives
- **Full copy per device (Framer model):** rejected — creates sync drift, duplicate effort, large JSON bloat.
- **CSS-only responsive (current approach):** rejected — manual, no per-property override visible in the editor, no constraint-based scaling.
