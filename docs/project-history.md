# Project History

Chronological log of all significant changes to the Lumina codebase.  
For architecture overview, see [README.md](./README.md).

---

## 2026-07-14 — Template vs Layout Separation (Major Redesign)

### What changed

**Concept change**: Template and Layout are now SEPARATE concepts.  
Before: `TemplateDefinition` contained both color theme AND section ordering.  
After: `TemplateDefinition` = color theme only. `LayoutDefinition` = section ordering + container types.

### Architecture

```
Template (visual skin)          Layout (section arrangement)
├── colors, typography          ├── section list (ordered)
├── shadows, glass, gradient    ├── container type per section
├── decorations                 ├── animation preset
└── (NO sections anymore)       └── wrapper config

Both independently selectable when creating an invitation.
```

### Database changes

- **New table**: `layouts` — stores layout definitions (5 built-in seeded at startup)
- **New column**: `invitations.layout_id` (default 'default')
- **Migration**: Auto-applied on first DB access, backward-compatible
- **Cleanup**: Old Prisma tables (`Invitation`, `RSVP`, `Wish`) auto-dropped

### New files created (28)

```
src/lib/layout/types.ts              — LayoutDefinition, ContainerConfig, ContainerType
src/lib/layout/registry.ts           — In-memory layout registry with syncLayoutsFromDB()
src/lib/layout/index.ts              — Barrel exports
src/lib/validation.ts                — Zod schemas for all API inputs

src/layouts/built-in.ts              — 5 built-in layouts: default, modern, adat-bali, romantic, minimal

src/components/containers/           — 7 container wrapper components:
  FullWidthContainer, ContainedContainer, SplitContainer, CardContainer,
  HeroBannerContainer, GridContainer, CarouselContainer

src/components/landing/              — Landing page components:
  Navbar, HeroSection, TemplateShowcase, LayoutShowcase

src/components/studio/LayoutBuilder.tsx  — Drag-drop layout builder

src/app/studio/templates/page.tsx    — Template browser (10 color themes)
src/app/studio/layouts/page.tsx      — Layout browser (built-in + custom)
src/app/studio/layouts/new/page.tsx  — Layout builder page
src/app/studio/layouts/[id]/page.tsx — Layout detail page
src/app/api/layouts/route.ts         — GET list + POST create
src/app/api/layouts/[id]/route.ts    — GET, PUT, DELETE
```

### Modified files (14)

```
src/lib/template/types.ts            — Stripped sections, layout, animation from TemplateDefinition
src/lib/template/TemplateRenderer.tsx — Now accepts layout, uses layout.sections
src/lib/template/SectionRegistry.ts  — register()/get() pattern (was Partial<Record<>>)
src/lib/template/index.ts            — Updated exports
src/lib/db.ts                        — layouts table, migration, seed, CRUD
src/lib/studio/store.ts              — Added layoutId to StudioInvitation
src/lib/registry/index.ts            — registerAllLayouts() + syncLayoutsFromDB()
src/lib/content/types.ts             — Added HeroContent interface

src/app/page.tsx                     — Rewritten as landing page (was invitation preview)
src/app/invitation-page.tsx          — Added layoutId + layout switcher bar
src/app/studio/layout.tsx            — Sidebar: Templates, Layouts, New Invitation
src/app/studio/new/page.tsx          — 3-step wizard: template → layout → name
src/app/studio/[slug]/page.tsx       — Added Layout tab + selector + LayoutTab component

src/templates/all-templates.ts       — Theme-only (stripped sections/animation/layout)
src/app/api/invitations/route.ts     — layoutId + Zod validation
src/app/api/invitations/[slug]/route.ts — layoutId + Zod validation
src/proxy.ts                         — Allow public GET for /api/layouts
```

### Bug fixes in this session

1. **Built-in layouts not seeded to DB** — Added `seedBuiltinLayouts()` in DB migration. 5 built-in layouts auto-inserted on first cold start.
2. **Layout pages read from stale in-memory registry** — All pages now fetch from `/api/layouts` API for real-time data.
3. **Old duplicate Prisma tables** — Auto-dropped during migration.
4. **Layout builder save flow fragile** — Name/description now passed via state props, not DOM querySelector.
5. **Auth blocked POST /api/layouts** — Added to public GET rules in middleware.
6. **Tailwind dynamic class bug** — `makeTemplate()` no longer uses template literal classes (layout.wrapperClass -> LayoutDefinition).
7. **Missing route /studio/layouts/[id]** — Created detail page.

### New dependencies

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

### Verification

- `pnpm build` — zero type errors, 17 routes compiled
- DB: 6 layouts (5 built-in + 1 custom saved via API test)
- API: All layout CRUD endpoints functional
- Landing page: Navbar + Template + Layout showcase rendering
- Layout builder: Drag-drop, save to DB, re-edit works
- Backward compatible: Existing invitations auto-migrated to `layout_id = 'default'`

---

## 2026-07-14 — Initial System (Pre-Redesign)

Original Lumina setup. Single Next.js app with:
- 10 templates defined in `src/templates/all-templates.ts`
- Each template had identical 12-section ordering
- In-memory template registry
- SQLite database with invitations, rsvps, wishes tables
- Studio editor with Content/Theme/Preview tabs
- OrnamentCanvas for WYSIWYG ornament editing
- Cookie-based auth via middleware
- Zod imported but unused
- Sections as separable React components with variant maps
