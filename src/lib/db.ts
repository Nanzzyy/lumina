import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'dev.db');

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
  // Seed built-in layouts if table is empty
  const count = d.prepare('SELECT COUNT(*) as count FROM layouts').get() as { count: number };
  if (count.count === 0) {
    seedBuiltinLayouts(d);
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
