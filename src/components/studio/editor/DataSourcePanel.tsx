'use client';

import { memo } from 'react';
import type { FC } from 'react';

/**
 * Data Sources panel — powered by the Data Source Engine (ADR-016 step 3).
 *
 * Shows a list of data sources for the current project (RSVP rows, gallery images,
 * gift items…). The user can add/edit/delete rows. Binding a node to a data source
 * creates an expression (ADR-004).
 *
 * ponytail: full CRUD + binding UI lands in P4 alongside the Variables panel;
 * this is a minimal shell for P3 parity.
 */

const DataSourcePanel: FC<{}> = memo(function DataSourcePanelFn() {
  // ponytail: real data source list from editor store
  // const dataSources = useEditorStore((s) => s.doc?.project?.dataSources ?? []);
  const dataSources: any[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase">Data Sources</h3>
        <button className="text-[10px] text-blue-600 hover:underline">+ Add</button>
      </div>

      {dataSources.length === 0 && (
        <p className="text-xs text-zinc-400">No data sources yet. Add one to store guest lists, gallery items, or gift data.</p>
      )}

      <div className="space-y-2">
        {dataSources.map((ds) => (
          <div key={ds.id} className="border border-zinc-200 rounded-lg p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-700">{ds.key}</span>
              <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">{ds.kind}</span>
            </div>
            <p className="text-zinc-400 mt-1">{ds.schema?.fields?.length ?? 0} fields · {ds.rows?.length ?? 0} rows</p>
          </div>
        ))}
      </div>
    </div>
  );
});

export default DataSourcePanel;
