# Lumina — Documentation

> Platform undangan digital premium. Template + layout builder yang setara Figma × Canva.

---

## Arsitektur

```
┌──────────────┐     ┌─────────────────────┐
│   TEMPLATE    │     │       LAYOUT         │
│ (visual skin) │     │ (section arrangement) │
│               │     │                      │
│ • Color palette│    │ • Section list        │
│ • Typography   │    │ • Container types     │
│ • Shadows      │    │ • Ordering            │
│ • Glass/Grad.  │    │ • Responsive rules    │
│ • Decorations  │    │ • Animation preset    │
└──────┬────────┘     └──────────┬───────────┘
       │                         │
       │    ┌────────────────┐    │
       └───→│  INVITATION    │←───┘
            │                │
            │ • template_id  │
            │ • layout_id    │
            │ • content JSON │
            │ • theme_overrides│
            └────────────────┘
```

**Template** = warna, font, dekorasi visual. **Layout** = urutan section, tipe container, animasi.

## Tech Stack

| Category | Tech |
|----------|------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| UI | React 19.2, Tailwind CSS 4 |
| Animation | Framer Motion 12.42 |
| Database | SQLite (better-sqlite3), synchronous API |
| Validation | Zod 4.4 |
| DnD | @dnd-kit/core + @dnd-kit/sortable |
| Package | pnpm 11.12 |

## Routes

| Route | Type | Deskripsi |
|-------|------|-----------|
| `/` | Static | Landing page: navbar, showcase template + layout |
| `/demo` | Client | Preview invitasi dengan template/layout switcher |
| `/login` | Static | Password login (cookie auth) |
| `/studio` | Static | Dashboard: daftar invitasi tersimpan |
| `/studio/templates` | Static | Browser 10 template warna |
| `/studio/layouts` | Static | Browser 5 built-in + custom layouts |
| `/studio/layouts/new` | Static | Layout builder (drag-drop) |
| `/studio/layouts/[id]` | Dynamic | Detail layout |
| `/studio/new` | Static | Wizard 3-step: template → layout → name |
| `/studio/[slug]` | Dynamic | Editor: Content, Theme, Layout, Preview tabs |
| `/api/invitations` | API | GET list, POST create |
| `/api/invitations/[slug]` | API | GET, PUT, DELETE |
| `/api/layouts` | API | GET list, POST create |
| `/api/layouts/[id]` | API | GET, PUT, DELETE |
| `/api/rsvp` | API | POST submit, GET list |
| `/api/wishes` | API | POST submit, GET list |
| `/api/upload` | API | POST upload gambar |

## Database

### invitations
| Kolom | Type | Note |
|-------|------|------|
| id | TEXT PK | cuid-style |
| slug | TEXT UNIQUE | URL-friendly |
| title | TEXT | Display name |
| template_id | TEXT | FK → in-memory template registry |
| layout_id | TEXT | FK → layouts table |
| content | TEXT (JSON) | `InvitationContent` |
| theme_overrides | TEXT (JSON) | `DeepPartial<ThemeConfig>` |
| published | INTEGER | 0/1 |
| created_at, updated_at | TEXT | ISO timestamp |

### layouts
| Kolom | Type | Note |
|-------|------|------|
| id | TEXT PK | 'default', 'modern', etc. |
| name | TEXT | Display name |
| description | TEXT | Brief description |
| config | TEXT (JSON) | `{ sections, containers, animation, wrapper }` |
| is_builtin | INTEGER | 1=bawaan, 0=custom |
| created_at, updated_at | TEXT | ISO timestamp |

### rsvps & wishes
Relasi 1:N ke invitations via `invitation_id` (CASCADE delete).

## Container Types (7)

| Type | Behavior |
|------|----------|
| `hero-banner` | Full viewport height |
| `full-width` | Edge-to-edge |
| `contained` | Max-width + padding |
| `split` | 2 kolom (gambar/teks) |
| `card` | Card inset dengan shadow |
| `grid` | Multi-kolom (1-4) |
| `carousel` | Horizontal scroll snap |

## 10 Templates (Color Only)

| ID | Name | Vibe |
|----|------|------|
| aurora | Aurora | Gold on black |
| fleur | Fleur | Pastel floral |
| luna | Luna | Moonlit navy |
| ivory | Ivory | Cream & gold |
| sakura | Sakura | Cherry blossom |
| nordic | Nordic | Sage minimal |
| royal | Royal | Blue & gold |
| celeste | Celeste | Sky blue glass |
| verona | Verona | Terracotta warm |
| noir | Noir | Monochrome editor |

## 5 Built-in Layouts

| ID | Name | Sections | Distinctive |
|----|------|----------|-------------|
| default | Classic | 12 sections full | All-inclusive |
| modern | Modern | 6 sections | Split story, grid gallery |
| adat-bali | Adat Bali | 8 sections | Schedule-focused |
| romantic | Romantic | 8 sections | Image-heavy, split story |
| minimal | Minimal | 5 sections | Bare essentials |

## Directory Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Landing page
│   ├── invitation-page.tsx  # Demo preview component
│   ├── providers.tsx
│   ├── globals.css       # Design tokens + utilities
│   ├── api/              # REST API routes
│   │   ├── invitations/
│   │   ├── layouts/
│   │   ├── rsvp/
│   │   ├── wishes/
│   │   └── upload/
│   ├── login/
│   └── studio/           # Studio pages
│       ├── templates/
│       ├── layouts/
│       ├── new/
│       └── [slug]/
├── components/
│   ├── containers/       # 7 container wrapper components
│   ├── landing/          # Navbar, Hero, Showcase
│   ├── primitives/       # Button, Glass, Icon, etc.
│   ├── sections/         # 12 invitation section components
│   └── studio/           # LayoutBuilder, OrnamentCanvas
├── lib/
│   ├── content/          # InvitationContent types + defaults
│   ├── db.ts             # SQLite layer (schema, CRUD, migration)
│   ├── layout/           # Layout registry + types
│   ├── registry/         # initializeRegistries()
│   ├── studio/           # useStudioStore()
│   ├── template/         # Template registry + renderer + types
│   ├── theme/            # ThemeProvider + types + defaults
│   ├── tokens/           # Design token constants
│   ├── utils/
│   └── validation.ts     # Zod schemas
├── layouts/
│   └── built-in.ts       # 5 built-in LayoutDefinitions
├── templates/
│   └── all-templates.ts  # 10 TemplateDefinitions (theme only)
└── data/
    └── invitations/      # Demo data (Indonesian wedding)
```

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
```

Database auto-initializes on first request. WAL mode + foreign keys enforced.

## Auth

Cookie-based middleware (`src/proxy.ts`):
- Cookie: `lumina_admin_token`
- Default password: `lumina-studio-2026`
- Env override: `ADMIN_PASSWORD`
- Protected: `/studio/*`, POST/PUT/DELETE API (kecuali RSVP/wishes/upload)
