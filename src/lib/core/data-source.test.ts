import { describe, it, expect } from 'vitest';
import { resolveDataSources, findDataSource } from './data-source';
import type { DataSource } from './values';

const dataSources: DataSource[] = [
  {
    id: 'ds1', scope: 'project', key: 'rsvps', kind: 'collection',
    schema: { fields: [{ key: 'name', type: 'string' }, { key: 'status', type: 'string' }] },
    source: 'table', config: { table: 'rsvps' },
  },
  {
    id: 'ds2', scope: 'project', key: 'gallery', kind: 'collection',
    schema: { fields: [{ key: 'url', type: 'image' }, { key: 'alt', type: 'string' }] },
    source: 'local',
    rows: [{ url: '/img1.png', alt: 'Photo 1' }, { url: '/img2.png', alt: 'Photo 2' }],
  },
  {
    id: 'ds3', scope: 'project', key: 'gifts', kind: 'collection',
    schema: { fields: [{ key: 'name', type: 'string' }] },
    source: 'plugin',
  },
];

describe('data source resolver (ADR-016 step 3)', () => {
  it('resolves table data sources from injected rows', () => {
    const r = resolveDataSources({
      dataSources,
      tableRows: { rsvps: [{ name: 'Alice', status: 'hadir' }] },
    });
    const ds = findDataSource(r, 'rsvps');
    expect(ds).toBeDefined();
    expect(ds!.rows).toHaveLength(1);
    expect(ds!.rows[0].name).toBe('Alice');
    expect(ds!.dynamic).toBe(true);
  });

  it('resolves local data sources from inline rows', () => {
    const r = resolveDataSources({
      dataSources,
      tableRows: {},
    });
    const ds = findDataSource(r, 'gallery');
    expect(ds).toBeDefined();
    expect(ds!.rows).toHaveLength(2);
    expect(ds!.dynamic).toBe(false);
  });

  it('resolves plugin data sources as empty + dynamic', () => {
    const r = resolveDataSources({
      dataSources,
      tableRows: {},
    });
    const ds = findDataSource(r, 'gifts');
    expect(ds).toBeDefined();
    expect(ds!.rows).toHaveLength(0);
    expect(ds!.dynamic).toBe(true);
  });

  it('returns empty rows for a missing table', () => {
    const r = resolveDataSources({ dataSources, tableRows: {} });
    const ds = findDataSource(r, 'rsvps');
    expect(ds!.rows).toEqual([]);
  });

  it('findDataSource returns undefined for unknown keys', () => {
    const r = resolveDataSources({ dataSources, tableRows: {} });
    expect(findDataSource(r, 'nope')).toBeUndefined();
  });
});
