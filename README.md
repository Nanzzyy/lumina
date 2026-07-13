# Lumina ✨

**Digital invitation builder** — buat undangan digital (wedding/event) dengan template Aria & Noir.

Dibangun dengan Next.js 16, TypeScript, Tailwind CSS v4, dan Framer Motion.

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 |
| **Animasi** | Framer Motion |
| **Package Manager** | pnpm |

## Cara Menjalankan di Local

### Prerequisites

- **Node.js** v20+
- **pnpm** — install jika belum ada:
  ```bash
  npm install -g pnpm
  ```

### 1. Install dependencies

```bash
pnpm install
```

### 2. Jalankan development server

```bash
pnpm dev
```

Server akan berjalan di **[http://localhost:3000](http://localhost:3000)**.

Untuk port lain:
```bash
pnpm dev -p 3001
```

### 3. Production build

```bash
pnpm build
pnpm start
```

## Struktur Proyek

```
src/
├── app/              # App Router (page, studio)
├── components/       # UI primitives & section components
├── data/             # Demo invitation data
├── hooks/            # Custom hooks (countdown, scroll reveal)
├── lib/              # Core logic (content, registry, template engine, theme)
└── templates/        # Template definitions (Aria, Noir)
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server (port 3000) |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | ESLint check |

## Arsitektur Theme

### Theme Isolation

Theme CSS variables di-scope ke container undangan (`.lumina-invitation-scope`), **bukan ke `:root`**. Ini memastikan:

- **Edit theme di Studio** → hanya preview & undangan yang berubah
- **Studio UI** (sidebar, dashboard, editor panel) → tetap pakai default theme, tidak terpengaruh
- **Demo page** (`/`) → tetap konsisten, tidak kena spill dari studio

Flow: `ThemeProvider` → inject `<style>.lumina-invitation-scope { --colors-primary: ... }</style>` → CSS vars hanya berlaku di dalam container dengan class tersebut.
