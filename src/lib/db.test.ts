import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Document } from './core/document';

// db.ts reads LUMINA_DB_PATH at import time — point it at a throwaway file
// before the module is loaded so the suite never touches the dev database.
const TMP_DIR = mkdtempSync(path.join(tmpdir(), 'lumina-db-test-'));
process.env.LUMINA_DB_PATH = path.join(TMP_DIR, 'test.db');

const db = await import('./db');

afterAll(() => {
  rmSync(TMP_DIR, { recursive: true, force: true });
});

const invitation = (slug: string) => ({
  slug,
  title: 'Budi & Ani',
  templateId: 'aria',
  content: { hero: { title: 'Hello' } },
});

let seq = 0;
const uniqueSlug = () => `slug-${seq++}`;

describe('invitation CRUD', () => {
  it('creates and reads an invitation with parsed JSON columns', () => {
    const slug = uniqueSlug();
    const created = db.createInvitation(invitation(slug));
    expect(created).toMatchObject({ slug });
    expect(created.id).toMatch(/^c/);

    const read = db.getInvitation(slug)!;
    expect(read).toMatchObject({
      slug,
      title: 'Budi & Ani',
      templateId: 'aria',
      layoutId: 'default',
      content: { hero: { title: 'Hello' } },
      themeOverrides: {},
      published: 0,
      publishedSnapshot: null,
      rsvps: [],
      wishes: [],
    });
  });

  it('returns null for an unknown slug', () => {
    expect(db.getInvitation('does-not-exist')).toBeNull();
    expect(db.updateInvitation('does-not-exist', { title: 'x' })).toBeNull();
  });

  it('honours explicit layoutId / themeOverrides / published on create', () => {
    const slug = uniqueSlug();
    db.createInvitation({ ...invitation(slug), layoutId: 'noir', themeOverrides: { colors: { text: '#fff' } }, published: true });
    const read = db.getInvitation(slug)!;
    expect(read).toMatchObject({ layoutId: 'noir', published: 1, themeOverrides: { colors: { text: '#fff' } } });
  });

  it('patches only the provided fields', () => {
    const slug = uniqueSlug();
    db.createInvitation(invitation(slug));
    const updated = db.updateInvitation(slug, { title: 'New Title' })!;
    expect(updated.title).toBe('New Title');
    expect(updated.templateId).toBe('aria');
    expect(updated.content).toEqual({ hero: { title: 'Hello' } });

    const withContent = db.updateInvitation(slug, { content: { hero: { title: 'Changed' } }, published: true })!;
    expect(withContent.content).toEqual({ hero: { title: 'Changed' } });
    expect(withContent.published).toBe(1);
    expect(withContent.title).toBe('New Title');
  });

  it('lists invitations and deletes them', () => {
    const slug = uniqueSlug();
    db.createInvitation(invitation(slug));
    expect((db.listInvitations() as { slug: string }[]).some((r) => r.slug === slug)).toBe(true);
    db.deleteInvitation(slug);
    expect(db.getInvitation(slug)).toBeNull();
  });

  it('rejects a duplicate slug (UNIQUE constraint)', () => {
    const slug = uniqueSlug();
    db.createInvitation(invitation(slug));
    expect(() => db.createInvitation(invitation(slug))).toThrow(/UNIQUE/i);
  });
});

describe('publish / unpublish', () => {
  it('snapshots the current state on publish', () => {
    const slug = uniqueSlug();
    db.createInvitation(invitation(slug));
    const published = db.publishInvitation(slug)!;
    expect(published.published).toBe(1);
    expect(published.publishedAt).toBeTruthy();
    expect(published.publishedSnapshot).toEqual({
      title: 'Budi & Ani',
      template_id: 'aria',
      layout_id: 'default',
      content: { hero: { title: 'Hello' } },
      theme_overrides: {},
    });
  });

  it('keeps the snapshot frozen while the draft changes', () => {
    const slug = uniqueSlug();
    db.createInvitation(invitation(slug));
    db.publishInvitation(slug);
    const after = db.updateInvitation(slug, { title: 'Draft Edit' })!;
    expect(after.title).toBe('Draft Edit');
    expect((after.publishedSnapshot as { title: string }).title).toBe('Budi & Ani');
  });

  it('clears the snapshot on unpublish', () => {
    const slug = uniqueSlug();
    db.createInvitation(invitation(slug));
    db.publishInvitation(slug);
    const draft = db.unpublishInvitation(slug)!;
    expect(draft).toMatchObject({ published: 0, publishedSnapshot: null, publishedAt: null });
  });

  it('returns null for an unknown slug', () => {
    expect(db.publishInvitation('nope')).toBeNull();
    expect(db.unpublishInvitation('nope')).toBeNull();
  });
});

describe('rsvps and wishes', () => {
  let slug: string;

  beforeEach(() => {
    slug = uniqueSlug();
    db.createInvitation(invitation(slug));
  });

  it('stores an RSVP against the invitation', () => {
    const created = db.createRSVP({ slug, name: 'Budi', status: 'hadir', guests: 2, message: 'Datang!' }) as { id: string };
    expect(created.id).toBeTruthy();
    expect(db.listRSVPs(slug)).toHaveLength(1);
    expect(db.getInvitation(slug)!.rsvps).toHaveLength(1);
  });

  it('stores a wish against the invitation', () => {
    db.createWish({ slug, name: 'Ani', message: 'Selamat!' });
    expect(db.listWishes(slug)).toMatchObject([{ name: 'Ani', message: 'Selamat!' }]);
  });

  it('ignores writes for an unknown slug and lists nothing', () => {
    expect(db.createRSVP({ slug: 'nope', name: 'x', status: 'hadir', guests: 1, message: '' })).toBeNull();
    expect(db.createWish({ slug: 'nope', name: 'x', message: 'y' })).toBeNull();
    expect(db.listRSVPs('nope')).toEqual([]);
    expect(db.listWishes('nope')).toEqual([]);
  });

  it('cascades deletes to rsvps and wishes', () => {
    db.createRSVP({ slug, name: 'Budi', status: 'hadir', guests: 1, message: '' });
    db.createWish({ slug, name: 'Ani', message: 'Selamat!' });
    db.deleteInvitation(slug);
    expect(db.listRSVPs(slug)).toEqual([]);
    expect(db.listWishes(slug)).toEqual([]);
  });
});

describe('layout CRUD', () => {
  it('seeds builtin layouts and lists them first', () => {
    const layouts = db.listLayouts();
    expect(layouts.length).toBeGreaterThan(0);
    expect(layouts[0].is_builtin).toBe(1);
    expect(db.getLayout('default')).toMatchObject({ id: 'default', is_builtin: 1 });
    expect(db.getLayout('default')!.config).toBeTypeOf('object');
  });

  it('creates, updates and deletes a custom layout', () => {
    const created = db.createLayout({ id: `custom-${seq++}`, name: 'Custom', config: { engine: 'tree', nodes: [] } })!;
    expect(created).toMatchObject({ name: 'Custom', description: '', is_builtin: 0 });
    expect(created.config).toEqual({ engine: 'tree', nodes: [] });

    const updated = db.updateLayout(created.id, { name: 'Renamed' })!;
    expect(updated).toMatchObject({ name: 'Renamed' });
    expect(updated.config).toEqual({ engine: 'tree', nodes: [] });

    expect(db.deleteLayout(created.id)).toBe(true);
    expect(db.getLayout(created.id)).toBeNull();
  });

  it('refuses to delete builtin layouts', () => {
    expect(db.deleteLayout('default')).toBe(false);
    expect(db.getLayout('default')).not.toBeNull();
  });

  it('returns null/false for unknown ids', () => {
    expect(db.getLayout('nope')).toBeNull();
    expect(db.updateLayout('nope', { name: 'x' })).toBeNull();
    expect(db.deleteLayout('nope')).toBe(false);
  });
});

describe('widget CRUD', () => {
  it('seeds builtin widgets with parsed definitions', () => {
    const widgets = db.listWidgets();
    expect(widgets.map((w) => w.id)).toContain('hero-bali');
    expect(db.getWidget('hero-bali')!.definition).toMatchObject({ kind: 'composite', type: 'hero-bali' });
  });

  it('creates, updates and deletes a custom widget', () => {
    const created = db.createWidget({ id: `w-${seq++}`, name: 'Custom Widget', definition: { kind: 'section' } })!;
    expect(created).toMatchObject({ name: 'Custom Widget', category: 'section', thumbnail: '', is_builtin: 0 });

    const updated = db.updateWidget(created.id, { category: 'hero', definition: { kind: 'composite' } })!;
    expect(updated).toMatchObject({ name: 'Custom Widget', category: 'hero' });
    expect(updated.definition).toEqual({ kind: 'composite' });

    expect(db.deleteWidget(created.id)).toBe(true);
    expect(db.getWidget(created.id)).toBeNull();
  });

  it('refuses to delete builtin widgets and handles unknown ids', () => {
    expect(db.deleteWidget('hero-bali')).toBe(false);
    expect(db.getWidget('nope')).toBeNull();
    expect(db.updateWidget('nope', { name: 'x' })).toBeNull();
    expect(db.deleteWidget('nope')).toBe(false);
  });
});

describe('assets', () => {
  it('creates an asset with defaults and finds it by hash', () => {
    const hash = `hash-${seq++}`;
    const asset = db.createAsset({ url: '/uploads/a.png', hash });
    expect(asset).toMatchObject({ url: '/uploads/a.png', kind: 'image', hash, variants: '{}' });
    expect(asset.workspace_id).toBeNull();
    expect(db.getAssetByHash(hash)!.id).toBe(asset.id);
  });

  it('stores the provided metadata and variants', () => {
    const hash = `hash-${seq++}`;
    const asset = db.createAsset({
      url: '/uploads/b.webp',
      hash,
      kind: 'photo',
      width: 800,
      height: 600,
      bytes: 1234,
      mime: 'image/webp',
      alt: 'B',
      variants: { thumb: '/uploads/b-thumb.webp' },
    });
    expect(asset).toMatchObject({ kind: 'photo', width: 800, height: 600, bytes: 1234, mime: 'image/webp', alt: 'B' });
    expect(JSON.parse(asset.variants)).toEqual({ thumb: '/uploads/b-thumb.webp' });
  });

  it('returns undefined for an unknown hash', () => {
    expect(db.getAssetByHash('nope')).toBeUndefined();
  });
});

describe('document persistence (ADR-001)', () => {
  const doc = (slug: string): Document => ({
    schemaVersion: 1,
    workspace: { id: 'ws-1', schemaVersion: 1, name: 'WS', variables: [], dataSources: [] },
    project: {
      id: `proj-${slug}`,
      schemaVersion: 1,
      workspaceId: 'ws-1',
      name: 'Project',
      slug,
      status: 'draft',
      pages: [
        {
          id: `page-${slug}`,
          projectId: `proj-${slug}`,
          name: 'Home',
          route: '/',
          ordinal: 0,
          seo: { title: 'Home' },
          frames: [
            {
              id: `frame-${slug}`,
              pageId: `page-${slug}`,
              name: 'Mobile',
              viewport: { w: 384, h: 728, device: 'mobile' },
              nodes: [{ id: 'n1', frame: { x: 0, y: 0, w: 100, h: 50 } }],
              ordinal: 0,
            },
          ],
        },
      ],
      variables: [],
      dataSources: [],
    },
  });

  it('returns null for an unknown project slug', () => {
    expect(db.loadDocumentBySlug('nope')).toBeNull();
  });

  it('round-trips a document through save and load', () => {
    const slug = `proj-slug-${seq++}`;
    db.saveDocument(doc(slug));
    const loaded = db.loadDocumentBySlug(slug)!;
    expect(loaded.project).toMatchObject({ slug, name: 'Project', status: 'draft', workspaceId: 'ws-1' });
    expect(loaded.project.pages).toHaveLength(1);
    expect(loaded.project.pages[0]).toMatchObject({ name: 'Home', route: '/', seo: { title: 'Home' } });
    const frame = loaded.project.pages[0].frames[0];
    expect(frame).toMatchObject({ name: 'Mobile', viewport: { w: 384, h: 728, device: 'mobile' } });
    expect(frame.nodes).toEqual([{ id: 'n1', frame: { x: 0, y: 0, w: 100, h: 50 } }]);
  });

  it('replaces pages/frames on re-save (document is the source of truth)', () => {
    const slug = `proj-slug-${seq++}`;
    db.saveDocument(doc(slug));

    const next = doc(slug);
    next.project.status = 'published';
    next.project.pages[0].id = `page2-${slug}`;
    next.project.pages[0].name = 'Landing';
    next.project.pages[0].frames = [];
    db.saveDocument(next);

    const loaded = db.loadDocumentBySlug(slug)!;
    expect(loaded.project.status).toBe('published');
    expect(loaded.project.pages).toHaveLength(1);
    expect(loaded.project.pages[0]).toMatchObject({ name: 'Landing', frames: [] });
  });
});
