# ADR-001: Workspace Hierarchy

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P1 (must be Accepted before P1 starts)

## Context
Lumina is now a multi-product platform (invitations are app 1). The data model must support: one user owning many unrelated sites (wedding, birthday, portfolio), shared libraries (variables, assets, themes) across a user's projects, future multi-tenant collaboration, and marketplace-distributed assets. Rev 1's flat `invitations → layouts → widgets` cannot express scope or sharing and conflates "the site" with "a layout".

## Decision
Adopt a five-level hierarchy:

```
Workspace  →  Project  →  Page  →  Frame  →  Node
```

- **Workspace** — tenant. Owns shared `variables`, `data_sources`, `asset_library`, `theme_library`, memberships, billing. One user has ≥1 workspace.
- **Project** — one site (an invitation, a portfolio…). Owns its resolved node-tree instance + project-scoped variables/data sources + `theme_id`. Has a slug and publish target.
- **Page** — one route (`/`, `/rsvp`). Holds SEO + ≥1 frame.
- **Frame** — editable artboard with a viewport (device size); the unit the canvas renders. Multi-frame = parallel artboards or responsive views.
- **Node** — element. References a `componentId`, carries `props` (literals or bindings), `frame` coords, capabilities, events.

**Scope resolution (widest → narrowest wins, CSS-like):** Workspace → Project → (Node). Variables, data sources, themes, and tokens resolve at the narrowest defined scope. A project variable shadows a workspace variable with the same key; a node binding resolves against the merged set.

## Consequences
- Sharing: a workspace's assets/themes/variables are reusable across all its projects without duplication.
- Migration: each existing `invitation` backfills to (workspace per owner) + project + page + frame; `nodes` = `normalizeLayout(layout)` snapshot.
- DB: new tables `workspaces/projects/pages/frames` (ADR-002 versions them); `invitations` becomes a compatibility view over `projects`.
- Collaboration (P7) and marketplace (P8) attach naturally at workspace and project scope.

## Alternatives
- **Flat (invitation-only):** rejected — cannot express sharing or non-invitation products; the platform framing collapses.
- **Organization-first (Org → Workspace → Project):** deferred — adds a layer we don't need until billing/multi-team; workspace suffices as tenant now, org can wrap it later without schema break.
