import { describe, it, expect } from 'vitest';
import {
  createInvitationSchema,
  updateInvitationSchema,
  createRSVPSchema,
  createWishSchema,
  createLayoutSchema,
  updateLayoutSchema,
  createWidgetSchema,
  updateWidgetSchema,
} from './validation';

describe('createInvitationSchema', () => {
  const base = { slug: 'wedding', title: 'Budi & Ani', templateId: 'aria' };

  it('fills defaults for the optional fields', () => {
    const parsed = createInvitationSchema.parse(base);
    expect(parsed).toEqual({ ...base, layoutId: 'default', content: {}, themeOverrides: {} });
  });

  it('keeps explicit values over the defaults', () => {
    const parsed = createInvitationSchema.parse({ ...base, layoutId: 'noir', content: { hero: { title: 'x' } }, published: true });
    expect(parsed.layoutId).toBe('noir');
    expect(parsed.content).toEqual({ hero: { title: 'x' } });
    expect(parsed.published).toBe(true);
  });

  it('rejects missing/blank required fields and over-long strings', () => {
    expect(createInvitationSchema.safeParse({ title: 'T', templateId: 'aria' }).success).toBe(false);
    expect(createInvitationSchema.safeParse({ ...base, slug: '' }).success).toBe(false);
    expect(createInvitationSchema.safeParse({ ...base, slug: 'a'.repeat(101) }).success).toBe(false);
    expect(createInvitationSchema.safeParse({ ...base, title: 'a'.repeat(201) }).success).toBe(false);
    expect(createInvitationSchema.safeParse({ ...base, templateId: '' }).success).toBe(false);
  });
});

describe('updateInvitationSchema', () => {
  it('accepts an empty patch and applies no defaults', () => {
    expect(updateInvitationSchema.parse({})).toEqual({});
  });

  it('accepts a partial patch', () => {
    expect(updateInvitationSchema.parse({ published: false })).toEqual({ published: false });
  });

  it('still validates the fields that are present', () => {
    expect(updateInvitationSchema.safeParse({ title: '' }).success).toBe(false);
    expect(updateInvitationSchema.safeParse({ layoutId: '' }).success).toBe(false);
    expect(updateInvitationSchema.safeParse({ published: 'yes' }).success).toBe(false);
  });
});

describe('createRSVPSchema', () => {
  it('defaults status to hadir, guests to 1 and message to empty', () => {
    expect(createRSVPSchema.parse({ slug: 'wedding', name: 'Budi' })).toEqual({
      slug: 'wedding',
      name: 'Budi',
      status: 'hadir',
      guests: 1,
      message: '',
    });
  });

  it('accepts every allowed status', () => {
    for (const status of ['hadir', 'tidak_hadir', 'ragu'] as const) {
      expect(createRSVPSchema.parse({ slug: 's', name: 'B', status }).status).toBe(status);
    }
  });

  it('rejects unknown statuses and out-of-range guest counts', () => {
    expect(createRSVPSchema.safeParse({ slug: 's', name: 'B', status: 'tidak' }).success).toBe(false);
    expect(createRSVPSchema.safeParse({ slug: 's', name: 'B', guests: 0 }).success).toBe(false);
    expect(createRSVPSchema.safeParse({ slug: 's', name: 'B', guests: 100 }).success).toBe(false);
    expect(createRSVPSchema.safeParse({ slug: 's', name: 'B', guests: 2.5 }).success).toBe(false);
    expect(createRSVPSchema.safeParse({ slug: 's', name: 'B', message: 'a'.repeat(501) }).success).toBe(false);
  });
});

describe('createWishSchema', () => {
  it('requires slug, name and a non-empty message', () => {
    expect(createWishSchema.safeParse({ slug: 's', name: 'B', message: 'Selamat' }).success).toBe(true);
    expect(createWishSchema.safeParse({ slug: 's', name: 'B', message: '' }).success).toBe(false);
    expect(createWishSchema.safeParse({ slug: '', name: 'B', message: 'ok' }).success).toBe(false);
    expect(createWishSchema.safeParse({ slug: 's', name: 'a'.repeat(101), message: 'ok' }).success).toBe(false);
    expect(createWishSchema.safeParse({ slug: 's', name: 'B', message: 'a'.repeat(1001) }).success).toBe(false);
  });
});

describe('createLayoutSchema', () => {
  it('accepts a legacy config (sections + containers) and defaults description', () => {
    const parsed = createLayoutSchema.parse({
      name: 'Classic',
      config: {
        engine: 'legacy',
        sections: [{ id: 'hero', type: 'hero', variant: 'a', props: { title: 'x' }, hidden: false }],
        containers: [{ id: 'c1', type: 'hero-banner', columns: 2 }],
      },
    });
    expect(parsed.description).toBe('');
    expect(parsed.config.sections?.[0].id).toBe('hero');
  });

  it('accepts a tree config with animation and wrapper', () => {
    const parsed = createLayoutSchema.parse({
      name: 'Tree',
      config: {
        engine: 'tree',
        nodes: [{ id: 'n1', kind: 'section' }],
        animation: { preset: 'fade-up', duration: 0.4, delay: 0, stagger: 0.1 },
        wrapper: { bgClass: 'bg-black', maxWidth: '1200px' },
      },
    });
    expect(parsed.config.animation?.preset).toBe('fade-up');
    expect(parsed.config.wrapper?.bgClass).toBe('bg-black');
  });

  it('rejects an unknown container type, out-of-range columns and unknown animation preset', () => {
    const cfg = (config: unknown) => createLayoutSchema.safeParse({ name: 'X', config }).success;
    expect(cfg({ containers: [{ id: 'c', type: 'sidebar' }] })).toBe(false);
    expect(cfg({ containers: [{ id: 'c', type: 'grid', columns: 7 }] })).toBe(false);
    expect(cfg({ containers: [{ id: 'c', type: 'grid', columns: 0 }] })).toBe(false);
    expect(cfg({ animation: { preset: 'zoom-out' } })).toBe(false);
    expect(cfg({ engine: 'canvas' })).toBe(false);
  });

  it('requires config to be present', () => {
    expect(createLayoutSchema.safeParse({ name: 'X' }).success).toBe(false);
  });
});

describe('updateLayoutSchema', () => {
  it('accepts an empty patch and reuses the create schema config shape', () => {
    expect(updateLayoutSchema.parse({})).toEqual({});
    expect(updateLayoutSchema.safeParse({ config: { engine: 'tree' } }).success).toBe(true);
    expect(updateLayoutSchema.safeParse({ config: { engine: 'nope' } }).success).toBe(false);
    expect(updateLayoutSchema.safeParse({ name: '' }).success).toBe(false);
  });
});

describe('createWidgetSchema', () => {
  const definition = {
    id: 'root',
    kind: 'composite' as const,
    type: 'hero-split',
    placement: { x: 0, y: 0, w: 12, h: 6 },
    children: [
      { id: 'left', kind: 'section' as const, type: 'hero', children: [{ id: 'deep', kind: 'section' as const }] },
    ],
  };

  it('accepts a recursively nested definition and applies defaults', () => {
    const parsed = createWidgetSchema.parse({ name: 'Hero Split', definition });
    expect(parsed).toMatchObject({ description: '', thumbnail: '', category: 'section' });
    expect(parsed.definition.children?.[0].children?.[0].id).toBe('deep');
  });

  it('requires a definition and a name', () => {
    expect(createWidgetSchema.safeParse({ name: 'X' }).success).toBe(false);
    expect(createWidgetSchema.safeParse({ definition: {} }).success).toBe(false);
  });

  it('rejects invalid nested nodes', () => {
    expect(createWidgetSchema.safeParse({ name: 'X', definition: { kind: 'widget' } }).success).toBe(false);
    expect(
      createWidgetSchema.safeParse({ name: 'X', definition: { children: [{ placement: { x: 0, y: 0, w: 1 } }] } }).success,
    ).toBe(false);
  });
});

describe('updateWidgetSchema', () => {
  it('accepts an empty patch and a definition-only patch', () => {
    expect(updateWidgetSchema.parse({})).toEqual({});
    expect(updateWidgetSchema.safeParse({ definition: { id: 'n' } }).success).toBe(true);
    expect(updateWidgetSchema.safeParse({ category: 'a'.repeat(51) }).success).toBe(false);
  });
});
