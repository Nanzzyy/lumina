# ADR-021: Publish Runtime

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P6 (must be Accepted before any P6 code)

## Context
Today, publishing is one hardcoded path: Next SSR → `TreeRenderer` → hydrated islands. This works for the invitation app but blocks multi-target output (static, AMP, PWA, ZIP, React, Flutter, PDF) as envisioned in ADR-008 and the user's requirement to make Lumina a platform, not just a Next app.

P5 has delivered a fully resolved document (pipelines: resolution → property → theme → responsive → constraints) as a pure, serializable value. Publish can now be built as a **target adapter** over this resolved document — the same pipeline that powers the editor preview also powers every publish output.

## Decision

### Pipeline
```
Resolved Document (from Resolution Pipeline ADR-016)
        ↓
Render Tree Builder   (converts frame→node graph to a flat render tree)
        ↓
Asset Graph           (collects all referenced assets: images, fonts, icons)
        ↓
Target Adapter        (chooses output format based on configuration)
        ↓
Output Bundle         (files, HTML, CSS bundle, runtime JS, manifest)
```

### Target adapters
Each target implements:
```ts
interface PublishTarget {
  id: string;
  label: string;
  build(resolved: ResolvedDocument, ctx: PublishContext): Promise<PublishArtifact[]>;
}

interface PublishContext {
  assets: AssetGraph;
  runtimeBundle?: string;   // minified Runtime JS (event engine, countdown, RSVP, music)
  baseUrl: string;
}

interface PublishArtifact {
  path: string;             // e.g. index.html, style.css, assets/img-xxx.webp
  content: Buffer | string;
  contentType: string;
}
```

### Phase targets

| Phase | Target | Notes |
|---|---|---|
| P6.1 | `static-html` | Zero-JS HTML + inlined CSS (default, matches today's TreeRenderer output). Keeps `TreeRenderer.tsx` as the internal engine. |
| P6.2 | `zip-export` | static-html + assets bundled into a download ZIP (first marketplace-able output). |
| P6.3 | `pwa` | static-html + service worker + manifest + offline page. |
| P6.4 | `ssr` | Next.js SSR output (current path; formalized as a target). |
| P6.5 | `amp` | Subset: only statically-bakeable bindings allowed; strict validators. |
| P6.6 | `spa` | Full client-side bundle with all bindings evaluated at runtime. |

### No new renderer
`TreeRenderer.tsx` (zero-JS CSS grid) is *the* renderer for HTML-family targets. It remains the single source of truth for how a resolved document becomes visual HTML. The `static-html` adapter wraps it in a build step that pre-computes binding values and inlines CSS variables.

Asset optimization (images to WebP/AVIF, hashing, responsive srcset) is delegated to ADR-022 (Asset Pipeline). The publish runtime invokes the asset pipeline as a build step.

### Runtime bundle
The minimal Runtime JS (`src/lib/runtime/`, ~15 KB gzipped target) contains:
- Event engine (countdown tick, click handlers)
- Live expression evaluation (countdown diff, dynamic data)
- Music player, RSVP form submit, wish form
- Lazy hydration: only mount interactive components after load

The Runtime is **shared across all HTML-family targets** — static, SSR, SPA, AMP all load the same Runtime for their interactive islands. This prevents divergence.

## Consequences
- Adding a new target = writing a `PublishTarget` adapter. No changes to the pipeline or renderer.
- Existing Next SSR output continues to work (it maps to the `ssr` adapter).
- The `zip-export` target makes Lumina invitation exportable without any server dependency — the whole site runs from a file.
- Each target can add its own validators (e.g. AMP forbids inline script; `spa` forbids static-only bindings).

## Alternatives
- **One target forever (Next SSR):** rejected — blocks platform growth.
- **One renderer per target:** rejected — renderers diverge; the single render tree + adapter is lower-risk.
