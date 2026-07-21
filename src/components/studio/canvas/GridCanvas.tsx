'use client';

import 'gridstack/dist/gridstack.min.css';

import { useEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { GridStack, GridStackWidget } from 'gridstack';
import type { LayoutNode } from '@/lib/layout/tree';
import { nodeToWidget, widgetToPlacement } from './convert';
import { WidgetContent } from './WidgetContent';

interface GridCanvasProps {
  nodes: LayoutNode[];
  mode?: 'basic' | 'advanced';
  selectedId?: string | null;
  selectedChildId?: string | null;
  onChange: (next: LayoutNode[]) => void;
  onSelect: (id: string | null) => void;
  onSwap?: (id: string) => void;
}

/**
 * gridstack.js wrapper (pattern A: gridstack-owns-shell).
 * - gridstack creates/moves/resizes `.grid-stack-item` shells.
 * - Each shell's `.grid-stack-item-content` hosts a per-item React `createRoot`
 *   rendering <WidgetContent/>. gridstack never touches that inner DOM → no reconcile fight.
 * - React `nodes` is the single source of truth. User drags flow gridstack→onChange→parent.
 *   Parent/panel edits flow nodes-prop→grid.load(). `syncingRef` breaks the echo loop.
 *
 * Client-only: host page loads this via next/dynamic({ssr:false}); gridstack JS is imported
 * inside the effect so it never evaluates during SSR/build.
 */
export function GridCanvas({ nodes, mode = 'basic', selectedId, selectedChildId, onChange, onSelect, onSwap }: GridCanvasProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<GridStack | null>(null);
  const rootsRef = useRef<Map<string, Root>>(new Map());
  const syncingRef = useRef(false);            // true while we're driving gridstack (ignore its events)
  const nodesRef = useRef<LayoutNode[]>(nodes); // latest nodes for event-read metadata
  const onChangeRef = useRef(onChange);
  const onSelectRef = useRef(onSelect);
  const onSwapRef = useRef(onSwap);
  const selectedIdRef = useRef(selectedId);
  const selectedChildIdRef = useRef(selectedChildId);

  useEffect(() => {
    onChangeRef.current = onChange;
    onSelectRef.current = onSelect;
    onSwapRef.current = onSwap;
    selectedIdRef.current = selectedId;
    selectedChildIdRef.current = selectedChildId;
    nodesRef.current = nodes;
  }, [onChange, onSelect, onSwap, selectedId, selectedChildId, nodes]);

  // render React content into each shell, keyed by node id
  function syncContent(next: LayoutNode[]) {
    const grid = gridRef.current;
    if (!grid) return;
    const seen = new Set<string>();

    for (const gs of grid.engine.nodes) {
      if (!gs.id) continue;
      const node = next.find((n) => n.id === gs.id);
      if (!node) continue;
      seen.add(node.id);
      const host = gs.el?.querySelector<HTMLElement>('.grid-stack-item-content');
      if (!host) continue;

      let root = rootsRef.current.get(node.id);
      if (!root) {
        root = createRoot(host);
        rootsRef.current.set(node.id, root);
      }
      root.render(
        <WidgetContent
          node={node}
          selected={selectedIdRef.current === node.id}
          selectedChildId={selectedChildIdRef.current}
          onSelect={onSelectRef.current}
          onSwap={onSwapRef.current}
        />,
      );
    }

    // unmount roots for removed nodes
    for (const [id, root] of rootsRef.current) {
      if (!seen.has(id)) {
        setTimeout(() => root.unmount(), 0);
        rootsRef.current.delete(id);
      }
    }
  }

  // mount-once
  useEffect(() => {
    const currentMode = mode;
    let grid: import('gridstack').GridStack | null = null;
    let cancelled = false;

    (async () => {
      const { GridStack } = await import('gridstack');
      if (cancelled || !elRef.current) return;

      grid = GridStack.init(
        {
          column: 12,
          cellHeight: 56,
          margin: 6,
          // advanced = free positioning (float); cellHeight stays constant so
          // switching modes never rescales existing widgets.
          float: currentMode === 'advanced',
          acceptWidgets: true,
          minRow: 6,
        },
        elRef.current,
      );
      gridRef.current = grid;

      grid.load(nodesRef.current.map(nodeToWidget));
      syncContent(nodesRef.current);

      const readBack = () => {
        if (syncingRef.current || !grid) return;
        const engineNodes = grid.engine.nodes;
        const byId = new Map(nodesRef.current.map((n) => [n.id, n]));
        const next: LayoutNode[] = engineNodes.map((gs) => {
          const existing = gs.id ? byId.get(gs.id) : undefined;
          const placement = widgetToPlacement(gs);
          return existing
            ? { ...existing, placement }
            : {
                id: gs.id ?? `node-${Math.random().toString(36).slice(2, 9)}`,
                kind: 'section' as const,
                type: 'quote',
                placement,
              };
        });
        nodesRef.current = next;
        syncingRef.current = true;
        onChangeRef.current(next);
        syncingRef.current = false;
      };

      grid.on('change added removed dragstop resizestop', readBack);
    })();

    return () => {
      cancelled = true;
      if (grid) grid.destroy();
      gridRef.current = null;
      rootsRef.current.forEach((r) => setTimeout(() => r.unmount(), 0));
      rootsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync mode updates — only float toggles; cellHeight/margin stay constant
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    grid.float(mode === 'advanced');
  }, [mode]);

  // sync nodes-prop → grid (external edits from palette/properties panel)
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    nodesRef.current = nodes;

    // placement-equal? skip the (no-op) load, still refresh content/metadata.
    const engine = grid.engine.nodes;
    const samePlacement =
      engine.length === nodes.length &&
      engine.every((gs, i) => {
        const n = nodes[i];
        return n && gs.id === n.id && gs.x === n.placement.x && gs.y === n.placement.y && gs.w === n.placement.w && gs.h === n.placement.h;
      });

    syncingRef.current = true;
    if (!samePlacement) {
      grid.load(nodes.map(nodeToWidget) as GridStackWidget[]);
    }
    syncContent(nodes);
    syncingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);



  return (
    <div
      className={`grid-stack lumina-canvas bg-zinc-50 rounded-lg border border-zinc-200 p-2 min-h-[60vh]${mode === 'advanced' ? ' show-grid' : ''}`}
      ref={elRef}
      onClick={() => onSelectRef.current(null)}
    />
  );
}
