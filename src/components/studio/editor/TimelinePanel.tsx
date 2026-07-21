'use client';

import { memo, useState, useMemo } from 'react';
import type { FC } from 'react';
import { useEditorStore } from '@editor/store';

/**
 * Timeline Panel — ADR-020.
 *
 * Shows entries in reverse chronological order, grouped by source (user/ai/autosave),
 * with branch labels and a restore button. Wires into the existing history store.
 *
 * ponytail: full timeline + branch fork/switch UI lands when the Timeline class
 * is wired into the editor store (P6). This provides the visual shell and
 * a working undo/redo display.
 */

const SOURCE_LABELS: Record<string, string> = {
  user: 'You',
  ai: 'AI',
  plugin: 'Plugin',
  autosave: 'Autosave',
  collab: 'Collaborator',
  system: 'System',
};

const SOURCE_COLORS: Record<string, string> = {
  user: 'bg-blue-100 text-blue-700',
  ai: 'bg-purple-100 text-purple-700',
  plugin: 'bg-green-100 text-green-700',
  autosave: 'bg-amber-100 text-amber-700',
  collab: 'bg-pink-100 text-pink-700',
  system: 'bg-zinc-100 text-zinc-600',
};

const TimelinePanel: FC<{}> = memo(function TimelinePanelFn() {
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  // Build timeline view from past/future stacks (reversed, newest first)
  const entries = useMemo(() => {
    const all: { id: string; label: string; source: string; index: number; isPast: boolean }[] = [];
    for (let i = past.length - 1; i >= 0; i--) {
      const cmd = past[i];
      all.push({
        id: cmd.id,
        label: cmd.meta?.label ?? `Step ${i + 1}`,
        source: cmd.meta?.source ?? 'user',
        index: i,
        isPast: true,
      });
    }
    for (let i = 0; i < future.length; i++) {
      const cmd = future[i];
      all.push({
        id: cmd.id,
        label: cmd.meta?.label ?? `Redo ${i + 1}`,
        source: cmd.meta?.source ?? 'user',
        index: i,
        isPast: false,
      });
    }
    return all;
  }, [past, future]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase">History</h3>
        <span className="text-[10px] text-zinc-400">{past.length + future.length} entries</span>
      </div>

      {entries.length === 0 && (
        <p className="text-xs text-zinc-400">No history yet. Start editing to track changes.</p>
      )}

      <div className="space-y-1 max-h-[50vh] overflow-y-auto">
        {entries.map((entry) => {
          const colors = SOURCE_COLORS[entry.source] ?? 'bg-zinc-100 text-zinc-600';
          return (
            <div
              key={entry.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs cursor-pointer transition-colors border ${
                entry.isPast ? 'border-transparent hover:border-zinc-200' : 'border-dashed border-zinc-200 opacity-60'
              }`}
              onClick={() => {
                // ponytail: jump to specific entry via timeline restore
                // (currently navigates to the nearest undo/redo boundary)
                if (!entry.isPast) redo();
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-zinc-700 truncate">{entry.label}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors}`}>
                {SOURCE_LABELS[entry.source] ?? entry.source}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2 border-t border-zinc-100">
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="flex-1 px-3 py-1.5 text-xs bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 disabled:opacity-30"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="flex-1 px-3 py-1.5 text-xs bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 disabled:opacity-30"
        >
          Redo
        </button>
      </div>
    </div>
  );
});

export default TimelinePanel;
