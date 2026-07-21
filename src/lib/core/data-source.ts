/**
 * Data Source resolver — ADR-016 step 3.
 *
 * Data Sources provide typed collections (RSVP rows, gallery images, gift items…).
 * Three backing modes: `local` (inline rows in the document), `table` (DB tables
 * like rsvps/wishes/guests), `plugin` (external, stubbed until P6).
 *
 * Pure: table resolution requires DB access — the caller (Pipeline or server-side
 * renderer) injects resolved rows; this module is pure logic over received data.
 * Plugin data sources resolve to empty stubs.
 */

import type { DataSource, RecordField } from './values';

export type DataRow = Record<string, unknown>;

export interface ResolvedDataSource {
  id: string;
  key: string;
  kind: 'collection' | 'record';
  schema: RecordField[];
  rows: DataRow[];
  /** True if data comes from a live runtime source (table/plugin). */
  dynamic: boolean;
}

export interface DataResolverInput {
  dataSources: DataSource[];
  /** Injected table rows keyed by table name (`rsvps`, `wishes`, …). */
  tableRows: Record<string, DataRow[]>;
}

/**
 * Resolve all data sources in a scope. `local` → uses inline rows; `table` →
 * looks up injected tableRows; `plugin` → empty stub (resolved at runtime in P6).
 */
export function resolveDataSources(input: DataResolverInput): ResolvedDataSource[] {
  return input.dataSources.map((ds) => {
    const fields = ds.schema.fields ?? [];
    switch (ds.source) {
      case 'table': {
        const tableName = ds.config?.table ?? ds.key;
        const rows = input.tableRows[tableName] ?? [];
        return {
          id: ds.id,
          key: ds.key,
          kind: ds.kind,
          schema: fields,
          rows,
          dynamic: true,
        };
      }
      case 'plugin':
        // Stubbed until P6 plugin engine
        return {
          id: ds.id,
          key: ds.key,
          kind: ds.kind,
          schema: fields,
          rows: [],
          dynamic: true,
        };
      case 'local':
      default:
        return {
          id: ds.id,
          key: ds.key,
          kind: ds.kind,
          schema: fields,
          rows: (ds.rows ?? []) as DataRow[],
          dynamic: false,
        };
    }
  });
}

/**
 * Find a specific data source by key within a resolved list.
 */
export function findDataSource(
  resolved: ResolvedDataSource[],
  key: string,
): ResolvedDataSource | undefined {
  return resolved.find((ds) => ds.key === key);
}
