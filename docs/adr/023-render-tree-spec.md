# ADR-023: Render Tree Specification

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P7 (must be Accepted before any P7 code)

## Context
P6.1 established a Render Tree IR (`src/lib/publish/render-tree.ts`) with 15+ node kinds, but the IR grew organically alongside the HTML adapter. Without a formal spec, future adapters (React, Flutter, PDF) and plugin transforms would interpret the tree differently, causing drift. The Render Tree needs to become a **versioned, documented contract** — the boundary between the Resolution Pipeline and every Publish Target.

## Decision
Formalize the Render Tree IR as a self-standing specification with versioned schema, node taxonomy, style model, and serialization format. The spec lives alongside the code; the TypeScript types are the source of truth, mirrored in a JSON Schema for cross-language use.

### Node taxonomy
```
RenderNode (base)
├── Frame         — page-level artboard; carries viewport + seo
├── Section       — semantic region (hero, cover, footer, story)
├── Container     — generic grouping (flex, grid, stack)
├── Text          — heading, paragraph, quote, label
├── Image         — single image (carries srcset + lqip from manifest)
├── Video         — video player (src, poster, controls)
├── Audio         — music player (src, autoplay, loop, controls)
├── Button        — clickable action (link, submit, custom)
├── Form          — RSVP/wish/contact form (fields, submit endpoint, validation schema)
├── Grid          — CSS-grid / masonry layout
├── Stack         — flex-column / row layout with gap
├── Divider       — horizontal rule / separator
├── Shape         — decorative rect/circle/triangle with fill/stroke
├── Icon          — SVG icon reference
├── Countdown     — live timer to target date (needs hydration)
├── Map           — embedded map iframe
└── Custom        — plugin-defined (render entry from plugin manifest)
```

### Style model
Each RenderNode carries a resolved `style: Record<string, string>` map. Keys are kebab-case CSS properties. Values are resolved tokens (ADT-018) or computed values. No shorthands — each property is explicit (e.g. `border-width`, `border-style`, `border-color` instead of `border`). This keeps adapter conversion trivial.

### Versioning
The IR version (`RENDER_TREE_VERSION`) increments when:
- A node kind is added, removed, or renamed.
- A mandatory field is added to R ermodellde.
- The style model changes semantics.

Version is negotiated at build time: the adapter reads `tree.version` and asserts compatibility.

### Serialization
The Render Tree is always serializable to JSON via `serializeRenderTree`/`deserializeRenderTree`. A JSON Schema (`render-tree.schema.json`) validates external inputs (plugin transforms, AI proposals, collab patches).

## Consequences
- Every target adapter (HTML, React, Flutter, PDF) consumes the *same typed* representation — no ambiguity.
- Plugins transforming the Render Tree (P7) have a documented node set to work with.
- JSON Schema enables validation of AI-generated Render Trees (P8) before they enter the publish pipeline.
- Version increments are rare; the initial taxonomy is designed for extensibility.

## Alternatives
- **Keep IR as internal types only:** rejected — adapter drift, plugin uncertainty, AI can't validate output.
- **One monolithic node type with a "kind" discriminator only:** the current approach is fine for P6; the ADR formalizes it but does not restructure it.
