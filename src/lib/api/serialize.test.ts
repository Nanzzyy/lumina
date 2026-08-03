import { describe, it, expect } from 'vitest';
import { serializeInvitationRow, serializeLayoutRow, serializeWidgetRow } from './serialize';

const stamps = { created_at: '2026-01-01 00:00:00', updated_at: '2026-01-02 00:00:00' };

describe('serializeInvitationRow', () => {
  it('camelCases columns, parses JSON text and coerces the published flag', () => {
    expect(
      serializeInvitationRow({
        id: 'inv1',
        slug: 'raka-dewi',
        title: 'Raka & Dewi',
        template_id: 'premium',
        layout_id: 'classic',
        content: '{"guestName":"Tamu"}',
        theme_overrides: '{"colors":{"primary":"#000"}}',
        published: 1,
        published_snapshot: null,
        published_at: null,
        ...stamps,
      }),
    ).toEqual({
      id: 'inv1',
      slug: 'raka-dewi',
      title: 'Raka & Dewi',
      templateId: 'premium',
      layoutId: 'classic',
      content: { guestName: 'Tamu' },
      themeOverrides: { colors: { primary: '#000' } },
      published: true,
      createdAt: stamps.created_at,
      updatedAt: stamps.updated_at,
    });
  });
});

describe('serializeLayoutRow', () => {
  it('keeps the already-parsed config and exposes isBuiltin', () => {
    expect(
      serializeLayoutRow({
        id: 'l1',
        name: 'Classic',
        description: 'Built in',
        config: { nodes: [] },
        is_builtin: 0,
        ...stamps,
      }),
    ).toEqual({
      id: 'l1',
      name: 'Classic',
      description: 'Built in',
      config: { nodes: [] },
      isBuiltin: false,
      createdAt: stamps.created_at,
      updatedAt: stamps.updated_at,
    });
  });
});

describe('serializeWidgetRow', () => {
  it('maps widget columns including the parsed definition', () => {
    expect(
      serializeWidgetRow({
        id: 'w1',
        name: 'Hero',
        description: 'Hero widget',
        thumbnail: '/thumb.png',
        category: 'hero',
        definition: { type: 'box' },
        is_builtin: 1,
        ...stamps,
      }),
    ).toEqual({
      id: 'w1',
      name: 'Hero',
      description: 'Hero widget',
      thumbnail: '/thumb.png',
      category: 'hero',
      definition: { type: 'box' },
      isBuiltin: true,
      createdAt: stamps.created_at,
      updatedAt: stamps.updated_at,
    });
  });
});
