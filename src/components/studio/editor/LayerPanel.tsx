'use client';

import { memo } from 'react';
import type { FC } from 'react';
import type { Node } from '@core/document';
import { useEditorStore } from '@editor/store';

// E1: recursive scene-graph tree. Click = select; eye = toggle hidden; padlock =
// toggle locked. Nested children indented. Reorder/drag comes with E2 (grouping).

interface LayerPanelProps {
  nodes: Node[];
  depth?: number;
}

const LayerPanel: FC<LayerPanelProps> = memo(function LayerPanelFn({ nodes, depth = 0 }) {
  const selection = useEditorStore((s) => s.selection);
  const select = useEditorStore((s) => s.select);
  const setNodeFlag = useEditorStore((s) => s.setNodeFlag);

  if (nodes.length === 0) {
    return <p className="text-xs text-zinc-400 px-2 py-3">No layers yet. Insert a node.</p>;
  }

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => {
        const sel = selection.has(node.id);
        const name = node.name ?? node.componentId ?? node.id.slice(0, 10);
        return (
          <div key={node.id}>
            <div
              className={`group flex items-center gap-1 py-1 pr-1 rounded text-xs cursor-pointer ${sel ? 'bg-blue-100 text-blue-700' : 'hover:bg-zinc-100 text-zinc-600'}`}
              style={{ paddingLeft: 6 + depth * 12 }}
              onClick={() => select([node.id])}
            >
              <span className={`flex-1 truncate ${node.hidden ? 'opacity-40 line-through' : ''}`}>{name}</span>
              <button
                title={node.hidden ? 'Show' : 'Hide'}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 w-5 text-center"
                onClick={(e) => { e.stopPropagation(); setNodeFlag(node.id, 'hidden', !node.hidden); }}
              >
                {node.hidden ? '◌' : '◉'}
              </button>
              <button
                title={node.locked ? 'Unlock' : 'Lock'}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 w-5 text-center"
                onClick={(e) => { e.stopPropagation(); setNodeFlag(node.id, 'locked', !node.locked); }}
              >
                {node.locked ? '🔒' : '🔓'}
              </button>
            </div>
            {node.children && node.children.length > 0 && (
              <LayerPanel nodes={node.children} depth={depth + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
});

export default LayerPanel;
