import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  registerLayout,
  getLayout,
  getAllLayouts,
  clearLayoutRegistry,
  syncLayoutsFromDB,
} from './registry';
import type { LayoutDefinition } from './types';

const layout = (id: string, over: Partial<LayoutDefinition> = {}): LayoutDefinition => ({
  id,
  name: id.toUpperCase(),
  description: '',
  sections: [],
  containers: [],
  ...over,
});

describe('layout registry', () => {
  beforeEach(() => {
    clearLayoutRegistry();
  });

  afterEach(() => {
    clearLayoutRegistry();
    vi.unstubAllGlobals();
  });

  it('registers and reads back a layout by id', () => {
    const l = layout('default');
    registerLayout(l);
    expect(getLayout('default')).toBe(l);
  });

  it('returns undefined for an unknown id', () => {
    expect(getLayout('nope')).toBeUndefined();
  });

  it('re-registering the same id replaces the previous definition', () => {
    registerLayout(layout('default', { name: 'first' }));
    registerLayout(layout('default', { name: 'second' }));
    expect(getAllLayouts()).toHaveLength(1);
    expect(getLayout('default')?.name).toBe('second');
  });

  it('lists all layouts in registration order and clears them', () => {
    registerLayout(layout('a'));
    registerLayout(layout('b'));
    expect(getAllLayouts().map((l) => l.id)).toEqual(['a', 'b']);
    clearLayoutRegistry();
    expect(getAllLayouts()).toEqual([]);
  });
});

describe('syncLayoutsFromDB', () => {
  beforeEach(() => {
    clearLayoutRegistry();
  });

  afterEach(() => {
    clearLayoutRegistry();
    vi.unstubAllGlobals();
  });

  const stubFetch = (payload: unknown) => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => payload });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  it('maps DB rows into layout definitions', async () => {
    const fetchMock = stubFetch([
      {
        id: 'db-1',
        name: 'From DB',
        description: 'desc',
        config: {
          engine: 'tree',
          sections: [{ id: 's', type: 'hero' }],
          containers: [{ id: 'c', type: 'contained' }],
          animation: { preset: 'fade-in' },
          wrapper: { bgClass: 'bg-black' },
          nodes: [{ id: 'n', kind: 'section', placement: { x: 0, y: 0, w: 12, h: 3 } }],
        },
      },
    ]);

    await syncLayoutsFromDB();

    expect(fetchMock).toHaveBeenCalledWith('/api/layouts');
    expect(getLayout('db-1')).toMatchObject({
      id: 'db-1',
      name: 'From DB',
      description: 'desc',
      engine: 'tree',
      animation: { preset: 'fade-in' },
      wrapper: { bgClass: 'bg-black' },
    });
    expect(getLayout('db-1')?.nodes).toHaveLength(1);
  });

  it('defaults sections/containers to empty arrays when the config omits them', async () => {
    stubFetch([{ id: 'db-2', name: 'Bare', description: '', config: {} }]);
    await syncLayoutsFromDB();
    expect(getLayout('db-2')).toMatchObject({ sections: [], containers: [] });
  });

  it('does not overwrite layouts already registered in memory', async () => {
    registerLayout(layout('db-3', { name: 'in-memory' }));
    stubFetch([{ id: 'db-3', name: 'from-db', description: '', config: {} }]);
    await syncLayoutsFromDB();
    expect(getLayout('db-3')?.name).toBe('in-memory');
  });

  it('silently falls back to the in-memory registry when the fetch fails', async () => {
    registerLayout(layout('kept'));
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(syncLayoutsFromDB()).resolves.toBeUndefined();
    expect(getAllLayouts().map((l) => l.id)).toEqual(['kept']);
  });

  it('swallows a non-iterable payload instead of throwing', async () => {
    stubFetch({ error: 'boom' });
    await expect(syncLayoutsFromDB()).resolves.toBeUndefined();
    expect(getAllLayouts()).toEqual([]);
  });
});
