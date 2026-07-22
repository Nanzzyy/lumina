# ADR-018: Design Token System (3-layer)

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P4 (must be Accepted before any P4 code)

## Context
Today, ThemeConfig (`src/lib/theme/types.ts`) defines colors, typography, spacing, radius, shadow, glass, and gradient as a flat TypeScript interface. Bootstrap values are hardcoded in `defaults.ts`. This works for one theme but doesn't scale to thousands of templates and user-editable designs. The 3-layer token model (raw → semantic → component) was outlined in the bible §3.4 but never formalized as an ADR. P4 needs this binding.

## Decision
Adopt 3-layer design tokens as the platform's styling substrate.

### Layer definitions
```
Raw tokens         — primitive values (color-blue-500, space-4, radius-8, font-size-16)
     ↓ alias
Semantic tokens    — functional meaning (color-primary, space-section, radius-card, font-body)
     ↓ alias
Component tokens   — per-component override (button-bg, hero-spacing, card-shadow)
```

- A **Theme** is a mapping raw→semantic + semantic→component defaults. Changing one raw cascades through semantic→component via CSS variable aliasing.
- Component schemas reference **semantic/component tokens** only, never raws directly. This ensures "change primary → all buttons update" is automatic.
- **Token references (aliasing):** a token may alias another token (e.g. `Button.Primary.Background → color.primary → #0066FF`). Aliasing is resolved transitively during ADR-016 step 5. Cycles are detected/rejected (same as ADR-016 R9). This makes rename and re-branding cheap: change the raw, every alias follows.
- **Computed token cache:** resolved tokens are cached by (key, layer, themeId). Cache is invalidated when the DependencyGraph (ADR-016) detects a change in any token key that feeds the resolved value. This prevents re-resolving the same token chain on every frame of a theme-editor interaction.
- Token values produce CSS custom properties at publish (via `PropertyDef.toStyle`, ADR-017); in-editor they're in-memory maps.

### Official token groups
Borrowed and extended from ThemeConfig + design-system conventions, these are the canonical token groups:

| Group | Examples | Source |
|---|---|---|
| `colors` | primary, text, background, border, surface, error, success | extended from ThemeConfig |
| `typography` | font-heading, font-body, font-size-base, line-height-body | extended from ThemeConfig |
| `spacing` | section-padding, gap-element, container-max | extended from ThemeConfig |
| `radius` | sm, md, lg, xl, full | extended from ThemeConfig |
| `shadow` | sm, md, lg, xl, glow | extended from ThemeConfig |
| `motion` | duration-fast, easing-default, spring-bounce | new |
| `elevation` | z-dock, z-overlay, z-modal, z-dropdown, z-canvas-handle | new |
| `opacity` | opacity-skip, opacity-dim, opacity-disabled | new |
| `glass` | opacity, blur, border | from ThemeConfig |
| `gradient` | primary, secondary, accent | from ThemeConfig |

### Source of truth
- `themes` table holds the mapping per theme (one row).
- `tokens` table supports per-layer override (raw/semantic/component).
- A theme pack may ship as a JSON file in `data/library/` or as a plugin manifest token pack (ADR-005).

### Resolution order
ADR-016 step 5 (Token Resolver) is the single entry point. The cascade:
1. defaultTheme (built-in, always available)
2. workspace theme (if set)
3. project theme (`project.themeId`)
4. component token overrides from the node's component schema
5. node-level overrides (`node.props` with token-ref prefix)

### Migration
Existing `theme_overrides` on invitations are lifted into `themes` rows with `mode: 'custom'`. The old `defaultTheme` constant becomes the raw→semantic seed. P4 implements the migration in the existing `backfillInvitationsToProjects`.

## Consequences
- A new design token group can be added by defining it in the token registry; no migration unless a component schema references it.
- The `PropertyDef.toStyle` adapter (ADR-017) resolves token refs to their computed value at render time (CSS var for web, inline value for PDF export).
- Theme marketplace (P8) distributes token packs as `themes` rows.

## Alternatives
- **Flat ThemeConfig forever:** rejected — doesn't scale to thousands of templates; no component-level customization.
- **Two layers only (raw + semantic):** rejected — component tokens are the key mechanism for "change button-primary without affecting hero-primary" (the user's design-system requirement).
