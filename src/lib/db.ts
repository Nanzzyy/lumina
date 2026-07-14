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
  `);
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

// Invitation CRUD
export function listInvitations() {
  return getDb().prepare('SELECT id, slug, title, template_id, content, theme_overrides, published, created_at, updated_at FROM invitations ORDER BY updated_at DESC').all();
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
  content: unknown;
  themeOverrides?: unknown;
  published?: boolean;
}) {
  const id = cuid();
  getDb().prepare(`
    INSERT INTO invitations (id, slug, title, template_id, content, theme_overrides, published)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.slug, data.title, data.templateId, JSON.stringify(data.content), JSON.stringify(data.themeOverrides || {}), data.published ? 1 : 0);
  return { id, slug: data.slug };
}

export function updateInvitation(slug: string, data: {
  title?: string;
  templateId?: string;
  content?: unknown;
  themeOverrides?: unknown;
  published?: boolean;
}) {
  const inv = getDb().prepare('SELECT * FROM invitations WHERE slug = ?').get(slug) as InvitationRow | undefined;
  if (!inv) return null;

  getDb().prepare(`
    UPDATE invitations SET
      title = ?, template_id = ?, content = ?, theme_overrides = ?, published = ?,
      updated_at = datetime('now')
    WHERE slug = ?
  `).run(
    data.title ?? inv.title,
    data.templateId ?? inv.template_id,
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
