import Database from 'better-sqlite3';
import path from 'path';
import { normalizeLayout } from './layout/migrate';
import type { LayoutDefinition } from './layout/types';
import type { Document, Page, Frame, ProjectStatus, Node } from './core/document';

/** ADR-001/009: DB path is env-configurable (externalize for prod / object storage later). */
const DB_PATH = process.env.LUMINA_DB_PATH ?? path.join(process.cwd(), 'dev.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    migrate();
  }
  return db;
}

function initSchema() {
  const d = db!;
  d.exec(`
    CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      template_id TEXT NOT NULL DEFAULT 'aurora',
      layout_id TEXT NOT NULL DEFAULT 'default',
      content TEXT NOT NULL DEFAULT '{}',
      theme_overrides TEXT NOT NULL DEFAULT '{}',
      published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_invitations_slug ON invitations(slug);

    CREATE TABLE IF NOT EXISTS rsvps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'hadir',
      guests INTEGER NOT NULL DEFAULT 1,
      message TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      invitation_id TEXT NOT NULL,
      FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_id ON rsvps(invitation_id);

    CREATE TABLE IF NOT EXISTS wishes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      invitation_id TEXT NOT NULL,
      FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_wishes_invitation_id ON wishes(invitation_id);

    CREATE TABLE IF NOT EXISTS layouts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      config TEXT NOT NULL DEFAULT '{}',
      is_builtin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_layouts_builtin ON layouts(is_builtin);

    CREATE TABLE IF NOT EXISTS widgets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      thumbnail TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'section',
      definition TEXT NOT NULL DEFAULT '{}',
      is_builtin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_widgets_builtin ON widgets(is_builtin);

    -- ── Lumina OS platform (ADR-001 hierarchy: Workspace→Project→Page→Frame) ──
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_id TEXT,
      variables TEXT NOT NULL DEFAULT '[]', data_sources TEXT NOT NULL DEFAULT '[]',
      theme_library_id TEXT, asset_library_id TEXT,
      schema_version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL,
      theme_id TEXT, status TEXT NOT NULL DEFAULT 'draft',
      nodes TEXT, variables TEXT NOT NULL DEFAULT '[]', data_sources TEXT NOT NULL DEFAULT '[]',
      schema_version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, route TEXT NOT NULL,
      ordinal INTEGER NOT NULL DEFAULT 0, seo TEXT,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_pages_project ON pages(project_id);
    CREATE TABLE IF NOT EXISTS frames (
      id TEXT PRIMARY KEY, page_id TEXT NOT NULL, name TEXT NOT NULL,
      viewport TEXT NOT NULL DEFAULT '{}', nodes TEXT NOT NULL DEFAULT '[]', ordinal INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_frames_page ON frames(page_id);

    -- ── Engines (ADR-003/004/005/006/007) ──
    CREATE TABLE IF NOT EXISTS variables (
      id TEXT PRIMARY KEY, scope TEXT NOT NULL, scope_id TEXT NOT NULL, key TEXT NOT NULL,
      type TEXT NOT NULL, value TEXT NOT NULL DEFAULT 'null', meta TEXT, ordinal INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_variables_scope ON variables(scope, scope_id);
    CREATE TABLE IF NOT EXISTS data_sources (
      id TEXT PRIMARY KEY, scope TEXT NOT NULL, scope_id TEXT NOT NULL, key TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'collection', schema TEXT NOT NULL DEFAULT '{}',
      source TEXT NOT NULL DEFAULT 'local', config TEXT
    );
    CREATE TABLE IF NOT EXISTS themes (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, tokens TEXT NOT NULL DEFAULT '{}', mode TEXT,
      is_builtin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tokens (
      id TEXT PRIMARY KEY, theme_id TEXT, layer TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL,
      alias TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_tokens_theme ON tokens(theme_id);
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY, workspace_id TEXT, kind TEXT NOT NULL DEFAULT 'image',
      url TEXT NOT NULL, hash TEXT, width INTEGER, height INTEGER, bytes INTEGER, mime TEXT, alt TEXT,
      variants TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_assets_hash ON assets(hash);
    CREATE TABLE IF NOT EXISTS components (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'section',
      thumbnail TEXT NOT NULL DEFAULT '', schema TEXT NOT NULL DEFAULT '{}',
      definition TEXT NOT NULL DEFAULT '{}', plugin_id TEXT, is_builtin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS animations (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, keyframes TEXT NOT NULL DEFAULT '{}',
      is_builtin INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY, scope TEXT NOT NULL, scope_id TEXT NOT NULL,
      trigger TEXT NOT NULL, condition TEXT, actions TEXT NOT NULL DEFAULT '[]'
    );
    CREATE INDEX IF NOT EXISTS idx_events_scope ON events(scope, scope_id);
    CREATE TABLE IF NOT EXISTS plugins (
      id TEXT PRIMARY KEY, manifest_id TEXT NOT NULL, name TEXT NOT NULL, version TEXT NOT NULL,
      manifest TEXT NOT NULL DEFAULT '{}', enabled_scopes TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS ai_sessions (
      id TEXT PRIMARY KEY, project_id TEXT, provider TEXT NOT NULL, intent TEXT NOT NULL,
      request TEXT, result TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'snapshot',
      patch TEXT, author_id TEXT, label TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_history_project ON history(project_id);

    -- ── Platform roadmap (reserved schema now, built P7+) ──
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT UNIQUE, name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS memberships (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, user_id TEXT NOT NULL, role TEXT NOT NULL,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS marketplace_listings (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL, ref_id TEXT NOT NULL, author_id TEXT,
      price TEXT, license TEXT, status TEXT NOT NULL DEFAULT 'active'
    );
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY, listing_id TEXT NOT NULL, workspace_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS presence (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL, user_id TEXT, cursor TEXT,
      ts TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function migrate() {
  const d = db!;
  // Drop old duplicate tables from previous Prisma-based schema
  d.exec('DROP TABLE IF EXISTS "Invitation"');
  d.exec('DROP TABLE IF EXISTS "RSVP"');
  d.exec('DROP TABLE IF EXISTS "Wish"');
  // Add layout_id column if it doesn't exist (migration for existing databases)
  const cols = d.prepare("PRAGMA table_info(invitations)").all() as { name: string }[];
  if (!cols.some((c) => c.name === 'layout_id')) {
    d.exec("ALTER TABLE invitations ADD COLUMN layout_id TEXT NOT NULL DEFAULT 'default'");
  }
  // ADR-001: additive columns on invitations (nullable — existing rows + reads unaffected).
  for (const [col, type] of [
    ['workspace_id', 'TEXT'],
    ['project_id', 'TEXT'],
    ['nodes', 'TEXT'],
    ['theme_id', 'TEXT'],
    ['asset_refs', "TEXT NOT NULL DEFAULT '[]'"],
  ] as [string, string][]) {
    if (!cols.some((c) => c.name === col)) {
      d.exec(`ALTER TABLE invitations ADD COLUMN ${col} ${type}`);
    }
  }
  // Seed default workspace + backfill existing invitations into the new hierarchy.
  ensureDefaultWorkspace(d);
  backfillInvitationsToProjects(d);
  // Seed built-in layouts if table is empty
  const count = d.prepare('SELECT COUNT(*) as count FROM layouts').get() as { count: number };
  if (count.count === 0) {
    seedBuiltinLayouts(d);
  }
  // Seed built-in widgets if table is empty
  const wcount = d.prepare('SELECT COUNT(*) as count FROM widgets').get() as { count: number };
  if (wcount.count === 0) {
    seedBuiltinWidgets(d);
  }
}

/** Single-admin default workspace (multi-user RBAC lands in P7). Idempotent. */
function ensureDefaultWorkspace(d: Database.Database): string {
  const row = d.prepare("SELECT id FROM workspaces WHERE id = 'default'").get() as { id: string } | undefined;
  if (!row) {
    d.prepare("INSERT INTO workspaces (id, name) VALUES ('default', 'My Workspace')").run();
    return 'default';
  }
  return row.id;
}

/**
 * Backfill existing invitations into the ADR-001 hierarchy (one project + page + frame each),
 * resolving a structural node tree from the invitation's layout. Idempotent: only invitations
 * with NULL project_id are processed. nodes are resolved best-effort (legacy tree shape);
 * P3 reconciles them into the new Core node model + variables when the new renderer consumes them.
 */
function backfillInvitationsToProjects(d: Database.Database): void {
  const invs = d
    .prepare('SELECT id, slug, title, layout_id FROM invitations WHERE project_id IS NULL')
    .all() as { id: string; slug: string; title: string; layout_id: string }[];
  if (invs.length === 0) return;
  ensureDefaultWorkspace(d);
  const insProject = d.prepare(
    "INSERT INTO projects (id, workspace_id, name, slug, status, nodes) VALUES (?, 'default', ?, ?, 'draft', ?)",
  );
  const insPage = d.prepare(
    'INSERT INTO pages (id, project_id, name, route, ordinal) VALUES (?, ?, ?, ?, 0)',
  );
  const insFrame = d.prepare(
    'INSERT INTO frames (id, page_id, name, viewport, nodes, ordinal) VALUES (?, ?, ?, ?, ?, 0)',
  );
  const setProjectId = d.prepare('UPDATE invitations SET project_id = ? WHERE id = ?');
  const viewport = JSON.stringify({ w: 384, h: 728, device: 'mobile' });
  for (const inv of invs) {
    let nodes: unknown[] = [];
    try {
      const layoutRow = d.prepare('SELECT config FROM layouts WHERE id = ?').get(inv.layout_id) as
        | { config: string }
        | undefined;
      if (layoutRow) {
        nodes = normalizeLayout(JSON.parse(layoutRow.config) as LayoutDefinition).nodes as unknown[];
      }
    } catch {
      // Leave nodes empty; resolved when consumed (P3).
    }
    const projectId = cuid();
    const pageId = cuid();
    insProject.run(projectId, inv.title || inv.slug, inv.slug, JSON.stringify(nodes));
    insPage.run(pageId, projectId, inv.slug || 'Home', '/');
    insFrame.run(cuid(), pageId, 'Mobile', viewport, JSON.stringify(nodes));
    setProjectId.run(projectId, inv.id);
  }
}

function seedBuiltinLayouts(d: Database.Database) {
  const builtins = [
    {
      id: 'default', name: 'Classic', description: 'Standard 12-section flow with all sections included.',
      config: JSON.stringify({
        sections: [
          { id: 'cover', type: 'cover' }, { id: 'hero', type: 'hero' }, { id: 'quote', type: 'quote' },
          { id: 'countdown', type: 'countdown' }, { id: 'story', type: 'story' },
          { id: 'gallery', type: 'gallery', variant: 'grid' }, { id: 'timeline', type: 'timeline' },
          { id: 'maps', type: 'maps' }, { id: 'rsvp', type: 'rsvp' }, { id: 'gift', type: 'gift' },
          { id: 'guestbook', type: 'guestbook' }, { id: 'footer', type: 'footer' },
        ],
        containers: [
          { id: 'cover', type: 'hero-banner' }, { id: 'hero', type: 'hero-banner' },
          { id: 'quote', type: 'card' }, { id: 'countdown', type: 'contained' },
          { id: 'story', type: 'contained' }, { id: 'gallery', type: 'grid', columns: 3 },
          { id: 'timeline', type: 'contained' }, { id: 'maps', type: 'contained' },
          { id: 'rsvp', type: 'card' }, { id: 'gift', type: 'card' },
          { id: 'guestbook', type: 'contained' }, { id: 'footer', type: 'contained' },
        ],
        animation: { preset: 'fade-up', duration: 0.8 },
      }),
    },
    {
      id: 'modern', name: 'Modern', description: 'Minimal 6-section flow with split story and grid gallery.',
      config: JSON.stringify({
        sections: [
          { id: 'hero', type: 'hero' }, { id: 'story', type: 'story' },
          { id: 'gallery', type: 'gallery', variant: 'grid' }, { id: 'quote', type: 'quote' },
          { id: 'rsvp', type: 'rsvp' }, { id: 'footer', type: 'footer' },
        ],
        containers: [
          { id: 'hero', type: 'hero-banner' }, { id: 'story', type: 'split' },
          { id: 'gallery', type: 'grid', columns: 3 }, { id: 'quote', type: 'card' },
          { id: 'rsvp', type: 'card' }, { id: 'footer', type: 'contained' },
        ],
        animation: { preset: 'fade-up', duration: 0.7 },
      }),
    },
    {
      id: 'adat-bali', name: 'Adat Bali', description: 'Indonesian traditional flow emphasizing schedule and gift.',
      config: JSON.stringify({
        sections: [
          { id: 'cover', type: 'cover' }, { id: 'quote', type: 'quote' }, { id: 'hero', type: 'hero' },
          { id: 'timeline', type: 'timeline' }, { id: 'gallery', type: 'gallery', variant: 'grid' },
          { id: 'rsvp', type: 'rsvp' }, { id: 'gift', type: 'gift' }, { id: 'footer', type: 'footer' },
        ],
        containers: [
          { id: 'cover', type: 'hero-banner' }, { id: 'quote', type: 'card' },
          { id: 'hero', type: 'hero-banner' }, { id: 'timeline', type: 'contained' },
          { id: 'gallery', type: 'grid', columns: 3 }, { id: 'rsvp', type: 'card' },
          { id: 'gift', type: 'card' }, { id: 'footer', type: 'contained' },
        ],
        animation: { preset: 'fade-in', duration: 0.8 },
      }),
    },
    {
      id: 'romantic', name: 'Romantic', description: 'Image-heavy romantic flow with split story and gallery.',
      config: JSON.stringify({
        sections: [
          { id: 'cover', type: 'cover' }, { id: 'hero', type: 'hero' }, { id: 'story', type: 'story' },
          { id: 'quote', type: 'quote' }, { id: 'gallery', type: 'gallery', variant: 'grid' },
          { id: 'countdown', type: 'countdown' }, { id: 'rsvp', type: 'rsvp' }, { id: 'footer', type: 'footer' },
        ],
        containers: [
          { id: 'cover', type: 'hero-banner' }, { id: 'hero', type: 'hero-banner' },
          { id: 'story', type: 'split' }, { id: 'quote', type: 'card' },
          { id: 'gallery', type: 'grid', columns: 3 }, { id: 'countdown', type: 'contained' },
          { id: 'rsvp', type: 'card' }, { id: 'footer', type: 'contained' },
        ],
        animation: { preset: 'fade-up', duration: 0.8 },
      }),
    },
    {
      id: 'minimal', name: 'Minimal', description: 'Bare essentials — hero, countdown, quote, RSVP, footer.',
      config: JSON.stringify({
        sections: [
          { id: 'hero', type: 'hero' }, { id: 'countdown', type: 'countdown' },
          { id: 'quote', type: 'quote' }, { id: 'rsvp', type: 'rsvp' }, { id: 'footer', type: 'footer' },
        ],
        containers: [
          { id: 'hero', type: 'hero-banner' }, { id: 'countdown', type: 'contained' },
          { id: 'quote', type: 'card' }, { id: 'rsvp', type: 'card' }, { id: 'footer', type: 'contained' },
        ],
        animation: { preset: 'fade-in', duration: 0.6 },
      }),
    },
  ];

  const stmt = d.prepare(
    'INSERT INTO layouts (id, name, description, config, is_builtin) VALUES (?, ?, ?, ?, 1)',
  );
  for (const l of builtins) {
    stmt.run(l.id, l.name, l.description, l.config);
  }
}

function cuid(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `c${t}${r}`;
}

export interface InvitationRow {
  id: string;
  slug: string;
  title: string;
  template_id: string;
  layout_id: string;
  content: string;
  theme_overrides: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface RSVPRow {
  id: string;
  name: string;
  status: string;
  guests: number;
  message: string;
  created_at: string;
  invitation_id: string;
}

export interface WishRow {
  id: string;
  name: string;
  message: string;
  created_at: string;
  invitation_id: string;
}

export interface LayoutRow {
  id: string;
  name: string;
  description: string;
  config: string;
  is_builtin: number;
  created_at: string;
  updated_at: string;
}

// Invitation CRUD
export function listInvitations() {
  return getDb().prepare('SELECT id, slug, title, template_id, layout_id, content, theme_overrides, published, created_at, updated_at FROM invitations ORDER BY updated_at DESC').all();
}

export function getInvitation(slug: string) {
  const inv = getDb().prepare('SELECT * FROM invitations WHERE slug = ?').get(slug) as InvitationRow | undefined;
  if (!inv) return null;
  const rsvps = getDb().prepare('SELECT * FROM rsvps WHERE invitation_id = ? ORDER BY created_at DESC').all(inv.id);
  const wishes = getDb().prepare('SELECT * FROM wishes WHERE invitation_id = ? ORDER BY created_at DESC').all(inv.id);
  return {
    ...inv,
    content: JSON.parse(inv.content),
    themeOverrides: JSON.parse(inv.theme_overrides),
    templateId: inv.template_id,
    layoutId: inv.layout_id,
    createdAt: inv.created_at,
    updatedAt: inv.updated_at,
    rsvps,
    wishes,
  };
}

export function createInvitation(data: {
  slug: string;
  title: string;
  templateId: string;
  layoutId?: string;
  content: unknown;
  themeOverrides?: unknown;
  published?: boolean;
}) {
  const id = cuid();
  getDb().prepare(`
    INSERT INTO invitations (id, slug, title, template_id, layout_id, content, theme_overrides, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.slug, data.title, data.templateId, data.layoutId || 'default', JSON.stringify(data.content), JSON.stringify(data.themeOverrides || {}), data.published ? 1 : 0);
  return { id, slug: data.slug };
}

export function updateInvitation(slug: string, data: {
  title?: string;
  templateId?: string;
  layoutId?: string;
  content?: unknown;
  themeOverrides?: unknown;
  published?: boolean;
}) {
  const inv = getDb().prepare('SELECT * FROM invitations WHERE slug = ?').get(slug) as InvitationRow | undefined;
  if (!inv) return null;

  getDb().prepare(`
    UPDATE invitations SET
      title = ?, template_id = ?, layout_id = ?, content = ?, theme_overrides = ?, published = ?,
      updated_at = datetime('now')
    WHERE slug = ?
  `).run(
    data.title ?? inv.title,
    data.templateId ?? inv.template_id,
    data.layoutId ?? inv.layout_id,
    data.content ? JSON.stringify(data.content) : inv.content,
    data.themeOverrides ? JSON.stringify(data.themeOverrides) : inv.theme_overrides,
    data.published !== undefined ? (data.published ? 1 : 0) : inv.published,
    slug,
  );
  return getInvitation(slug);
}

export function deleteInvitation(slug: string) {
  getDb().prepare('DELETE FROM invitations WHERE slug = ?').run(slug);
}

// Layout CRUD
export function listLayouts() {
  const rows = getDb().prepare('SELECT * FROM layouts ORDER BY is_builtin DESC, name ASC').all() as LayoutRow[];
  return rows.map((r) => ({
    ...r,
    config: JSON.parse(r.config),
  }));
}

export function getLayout(id: string) {
  const row = getDb().prepare('SELECT * FROM layouts WHERE id = ?').get(id) as LayoutRow | undefined;
  if (!row) return null;
  return {
    ...row,
    config: JSON.parse(row.config),
  };
}

export function createLayout(data: {
  id?: string;
  name: string;
  description?: string;
  config: unknown;
  isBuiltin?: boolean;
}) {
  const id = data.id || cuid();
  getDb().prepare('INSERT INTO layouts (id, name, description, config, is_builtin) VALUES (?, ?, ?, ?, ?)').run(
    id, data.name, data.description || '', JSON.stringify(data.config), data.isBuiltin ? 1 : 0,
  );
  return getLayout(id);
}

export function updateLayout(id: string, data: {
  name?: string;
  description?: string;
  config?: unknown;
}) {
  const row = getDb().prepare('SELECT * FROM layouts WHERE id = ?').get(id) as LayoutRow | undefined;
  if (!row) return null;
  getDb().prepare("UPDATE layouts SET name = ?, description = ?, config = ?, updated_at = datetime('now') WHERE id = ?").run(
    data.name ?? row.name, data.description ?? row.description, data.config ? JSON.stringify(data.config) : row.config, id,
  );
  return getLayout(id);
}

export function deleteLayout(id: string) {
  const row = getDb().prepare('SELECT * FROM layouts WHERE id = ?').get(id) as LayoutRow | undefined;
  if (!row || row.is_builtin) return false;
  getDb().prepare('DELETE FROM layouts WHERE id = ?').run(id);
  return true;
}

// ─── Widgets (reusable component library) ───────────────────

function seedBuiltinWidgets(d: Database.Database) {
  const builtins = [
    {
      id: 'hero-bali', name: 'Hero Bali', category: 'hero',
      description: 'Composite hero: slot gambar + slot teks, swap kiri/kanan.',
      definition: {
        kind: 'composite', type: 'hero-bali', variant: 'image-left', wrapper: { container: 'split' },
        placement: { x: 0, y: 0, w: 12, h: 5 },
        children: [
          { id: 'img', kind: 'section', type: 'gallery', placement: { x: 0, y: 0, w: 6, h: 5 } },
          { id: 'txt', kind: 'section', type: 'story', placement: { x: 6, y: 0, w: 6, h: 5 } },
        ],
      },
    },
    {
      id: 'quote-card', name: 'Quote Card', category: 'section',
      description: 'Kartu quote tunggal.',
      definition: {
        kind: 'composite', type: 'quote-card', wrapper: { container: 'card' },
        placement: { x: 0, y: 0, w: 12, h: 3 },
        children: [
          { id: 'q', kind: 'section', type: 'quote', placement: { x: 0, y: 0, w: 12, h: 3 } },
        ],
      },
    },
    {
      id: 'hero-countdown', name: 'Hero + Countdown', category: 'hero',
      description: 'Hero dengan countdown di bawah.',
      definition: {
        kind: 'composite', type: 'hero-countdown', wrapper: { container: 'hero-banner' },
        placement: { x: 0, y: 0, w: 12, h: 6 },
        children: [
          { id: 'h', kind: 'section', type: 'hero', placement: { x: 0, y: 0, w: 12, h: 4 } },
          { id: 'c', kind: 'section', type: 'countdown', placement: { x: 0, y: 4, w: 12, h: 2 } },
        ],
      },
    },
  ];

  const stmt = d.prepare(
    'INSERT INTO widgets (id, name, description, thumbnail, category, definition, is_builtin) VALUES (?, ?, ?, ?, ?, ?, 1)',
  );
  for (const w of builtins) {
    stmt.run(w.id, w.name, w.description, '', w.category, JSON.stringify(w.definition));
  }
}

export interface WidgetRow {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  definition: string;
  is_builtin: number;
  created_at: string;
  updated_at: string;
}

export function listWidgets() {
  const rows = getDb().prepare('SELECT * FROM widgets ORDER BY is_builtin DESC, name ASC').all() as WidgetRow[];
  return rows.map((r) => ({ ...r, definition: JSON.parse(r.definition) }));
}

export function getWidget(id: string) {
  const row = getDb().prepare('SELECT * FROM widgets WHERE id = ?').get(id) as WidgetRow | undefined;
  if (!row) return null;
  return { ...row, definition: JSON.parse(row.definition) };
}

export function createWidget(data: {
  id?: string; name: string; description?: string; thumbnail?: string; category?: string; definition: unknown;
}) {
  const id = data.id || cuid();
  getDb().prepare(
    'INSERT INTO widgets (id, name, description, thumbnail, category, definition, is_builtin) VALUES (?, ?, ?, ?, ?, ?, 0)',
  ).run(id, data.name, data.description || '', data.thumbnail || '', data.category || 'section', JSON.stringify(data.definition));
  return getWidget(id);
}

export function updateWidget(id: string, data: { name?: string; description?: string; thumbnail?: string; category?: string; definition?: unknown }) {
  const row = getDb().prepare('SELECT * FROM widgets WHERE id = ?').get(id) as WidgetRow | undefined;
  if (!row) return null;
  getDb().prepare("UPDATE widgets SET name = ?, description = ?, thumbnail = ?, category = ?, definition = ?, updated_at = datetime('now') WHERE id = ?").run(
    data.name ?? row.name,
    data.description ?? row.description,
    data.thumbnail ?? row.thumbnail,
    data.category ?? row.category,
    data.definition ? JSON.stringify(data.definition) : row.definition,
    id,
  );
  return getWidget(id);
}

export function deleteWidget(id: string) {
  const row = getDb().prepare('SELECT * FROM widgets WHERE id = ?').get(id) as WidgetRow | undefined;
  if (!row || row.is_builtin) return false;
  getDb().prepare('DELETE FROM widgets WHERE id = ?').run(id);
  return true;
}

// ─── Assets (ADR-009: content-addressed, DB-indexed) ───────────────
export interface AssetRow {
  id: string;
  workspace_id: string | null;
  kind: string;
  url: string;
  hash: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  mime: string | null;
  alt: string | null;
  variants: string;
  created_at: string;
}

export function getAssetByHash(hash: string): AssetRow | undefined {
  return getDb().prepare('SELECT * FROM assets WHERE hash = ?').get(hash) as AssetRow | undefined;
}

export function createAsset(data: {
  workspaceId?: string;
  kind?: string;
  url: string;
  hash?: string;
  width?: number;
  height?: number;
  bytes?: number;
  mime?: string;
  alt?: string;
  variants?: unknown;
}): AssetRow {
  const id = cuid();
  getDb().prepare(
    `INSERT INTO assets (id, workspace_id, kind, url, hash, width, height, bytes, mime, alt, variants)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    data.workspaceId ?? null,
    data.kind ?? 'image',
    data.url,
    data.hash ?? null,
    data.width ?? null,
    data.height ?? null,
    data.bytes ?? null,
    data.mime ?? null,
    data.alt ?? null,
    JSON.stringify(data.variants ?? {}),
  );
  return getDb().prepare('SELECT * FROM assets WHERE id = ?').get(id) as AssetRow;
}

// RSVP
export function createRSVP(data: { slug: string; name: string; status: string; guests: number; message: string }) {
  const inv = getDb().prepare('SELECT id FROM invitations WHERE slug = ?').get(data.slug) as { id: string } | undefined;
  if (!inv) return null;
  const id = cuid();
  getDb().prepare('INSERT INTO rsvps (id, name, status, guests, message, invitation_id) VALUES (?, ?, ?, ?, ?, ?)').run(id, data.name, data.status, data.guests, data.message, inv.id);
  return getDb().prepare('SELECT * FROM rsvps WHERE id = ?').get(id);
}

export function listRSVPs(slug: string) {
  const inv = getDb().prepare('SELECT id FROM invitations WHERE slug = ?').get(slug) as { id: string } | undefined;
  if (!inv) return [];
  return getDb().prepare('SELECT * FROM rsvps WHERE invitation_id = ? ORDER BY created_at DESC').all(inv.id);
}

// Wishes
export function createWish(data: { slug: string; name: string; message: string }) {
  const inv = getDb().prepare('SELECT id FROM invitations WHERE slug = ?').get(data.slug) as { id: string } | undefined;
  if (!inv) return null;
  const id = cuid();
  getDb().prepare('INSERT INTO wishes (id, name, message, invitation_id) VALUES (?, ?, ?, ?)').run(id, data.name, data.message, inv.id);
  return getDb().prepare('SELECT * FROM wishes WHERE id = ?').get(id);
}

export function listWishes(slug: string) {
  const inv = getDb().prepare('SELECT id FROM invitations WHERE slug = ?').get(slug) as { id: string } | undefined;
  if (!inv) return [];
  return getDb().prepare('SELECT * FROM wishes WHERE invitation_id = ? ORDER BY created_at DESC').all(inv.id);
}

// ─── OS Document model (ADR-001): project/page/frame ↔ Document ──
// frames.nodes (JSON) is the canonical node tree; projects.nodes is left null.
// ponytail: wire variables/data_sources/themes tables into the assemble once the
// editor persists them (today they default to []).
interface ProjectRow {
  id: string; workspace_id: string; name: string; slug: string;
  status: string; schema_version: number;
}
interface PageRow { id: string; project_id: string; name: string; route: string; ordinal: number; seo?: string | null; }
interface FrameRow { id: string; page_id: string; name: string; viewport: string; nodes: string; ordinal: number; }

function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

/** Load a full Document by project slug (reader for the /os/[slug] publish path). */
export function loadDocumentBySlug(slug: string): Document | null {
  const d = getDb();
  const project = d.prepare('SELECT id, workspace_id, name, slug, status, schema_version FROM projects WHERE slug = ?')
    .get(slug) as ProjectRow | undefined;
  if (!project) return null;

  const pageRows = d.prepare('SELECT id, project_id, name, route, ordinal, seo FROM pages WHERE project_id = ? ORDER BY ordinal')
    .all(project.id) as PageRow[];
  const pages: Page[] = pageRows.map((p) => {
    const frameRows = d.prepare('SELECT id, page_id, name, viewport, nodes, ordinal FROM frames WHERE page_id = ? ORDER BY ordinal')
      .all(p.id) as FrameRow[];
    const frames: Frame[] = frameRows.map((f) => ({
      id: f.id,
      pageId: p.id,
      name: f.name,
      viewport: safeParse(f.viewport, { w: 384, h: 728, device: 'mobile' as const }),
      nodes: safeParse<Node[]>(f.nodes, []),
      ordinal: f.ordinal,
    }));
    const page: Page = {
      id: p.id, projectId: project.id, name: p.name, route: p.route, ordinal: p.ordinal, frames,
    };
    if (p.seo) page.seo = safeParse(p.seo, undefined);
    return page;
  });

  return {
    schemaVersion: project.schema_version ?? 1,
    workspace: { id: project.workspace_id, schemaVersion: 1, name: 'Workspace', variables: [], dataSources: [] },
    project: {
      id: project.id,
      schemaVersion: project.schema_version ?? 1,
      workspaceId: project.workspace_id,
      name: project.name,
      slug: project.slug,
      status: (project.status === 'published' ? 'published' : 'draft') as ProjectStatus,
      pages,
      variables: [],
      dataSources: [],
    },
  };
}

/**
 * Persist a Document (writer for the editor Publish action). Upserts the project
 * by slug, then replaces its pages/frames from the doc (doc is source of truth).
 * Atomic via a transaction.
 */
export function saveDocument(doc: Document): void {
  const d = getDb();
  const slug = doc.project.slug;
  const existing = d.prepare('SELECT id FROM projects WHERE slug = ?').get(slug) as { id: string } | undefined;
  const projectId = existing?.id ?? doc.project.id;
  const workspaceId = doc.project.workspaceId ?? 'default';
  const status = doc.project.status ?? 'draft';

  const tx = d.transaction(() => {
    // Ensure the workspace row exists (FK target); idempotent.
    d.prepare(
      "INSERT OR IGNORE INTO workspaces (id, name, variables, data_sources, schema_version) VALUES (?, ?, '[]', '[]', 1)",
    ).run(workspaceId, doc.workspace?.name ?? 'Workspace');

    d.prepare(
      `INSERT INTO projects (id, workspace_id, name, slug, status, schema_version, variables, data_sources)
       VALUES (?, ?, ?, ?, ?, ?, '[]', '[]')
       ON CONFLICT(id) DO UPDATE SET
         workspace_id=excluded.workspace_id, name=excluded.name, status=excluded.status,
         schema_version=excluded.schema_version, updated_at=datetime('now')`,
    ).run(projectId, workspaceId, doc.project.name, slug, status, doc.project.schemaVersion ?? 1);

    // Cascade (FK ON DELETE) wipes frames when pages go.
    d.prepare('DELETE FROM pages WHERE project_id = ?').run(projectId);

    for (const page of doc.project.pages) {
      const pageId = page.id ?? cuid();
      d.prepare('INSERT INTO pages (id, project_id, name, route, ordinal, seo) VALUES (?, ?, ?, ?, ?, ?)')
        .run(pageId, projectId, page.name, page.route, page.ordinal ?? 0, page.seo ? JSON.stringify(page.seo) : null);
      for (const frame of page.frames) {
        d.prepare('INSERT INTO frames (id, page_id, name, viewport, nodes, ordinal) VALUES (?, ?, ?, ?, ?, ?)')
          .run(frame.id ?? cuid(), pageId, frame.name, JSON.stringify(frame.viewport), JSON.stringify(frame.nodes ?? []), frame.ordinal ?? 0);
      }
    }
  });
  tx();
}
