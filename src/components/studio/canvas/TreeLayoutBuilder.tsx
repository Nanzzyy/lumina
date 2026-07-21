'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { SectionType } from '@/lib/template/types';
import type { ContainerType } from '@/lib/layout/types';
import type { LayoutNode, Placement } from '@/lib/layout/tree';
import { clampPlacement } from '@/lib/layout/migrate';
import { SectionPalette, PALETTE_SECTIONS } from './SectionPalette';
import { findEmptySlot } from './convert';
import { findNodeDeep, findWithParent, replaceNodeDeep, removeNodeDeep } from './treeUtils';

const GridCanvas = dynamic(() => import('./GridCanvas').then((m) => m.GridCanvas), {
  ssr: false,
  loading: () => <div className="flex-1 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-center text-sm text-zinc-400">Loading canvas…</div>,
});

const CONTAINER_TYPES: { type: ContainerType; label: string }[] = [
  { type: 'full-width', label: 'Full Width' },
  { type: 'contained', label: 'Contained' },
  { type: 'split', label: 'Split' },
  { type: 'card', label: 'Card' },
  { type: 'hero-banner', label: 'Hero Banner' },
  { type: 'grid', label: 'Grid' },
  { type: 'carousel', label: 'Carousel' },
];

const DEFAULT_H: Record<SectionType, number> = {
  cover: 6, hero: 6, countdown: 3, story: 4, gallery: 4, timeline: 4,
  quote: 2, rsvp: 3, gift: 2, guestbook: 3, maps: 3, footer: 2,
};

function rid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextY(nodes: LayoutNode[]): number {
  return nodes.reduce((m, n) => Math.max(m, n.placement.y + n.placement.h), 0);
}

export interface TreeLayoutBuilderProps {
  initialNodes?: LayoutNode[];
  initialName?: string;
  initialDescription?: string;
  initialMode?: 'basic' | 'advanced';
  widgets?: { id: string; name: string; thumbnail?: string; definition?: LayoutNode }[];
  onSave?: (data: { name: string; description: string; nodes: LayoutNode[]; animation?: { preset: string }; mode?: 'basic' | 'advanced' }) => void;
  onEditWidget?: (widgetId: string) => void;
  onPreview?: () => void;
  readOnly?: boolean;
}

export function TreeLayoutBuilder({ initialNodes, initialName, initialDescription, initialMode, widgets, onSave, onEditWidget, onPreview, readOnly }: TreeLayoutBuilderProps) {
  const widgetDefs = new Map((widgets ?? []).filter((w) => w.definition).map((w) => [w.id, w.definition!]));
  const [nodes, setNodes] = useState<LayoutNode[]>(initialNodes ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState(initialName ?? '');
  const [description, setDescription] = useState(initialDescription ?? '');
  const [animation, setAnimation] = useState('fade-up');
  const [mode, setMode] = useState<'basic' | 'advanced'>(initialMode ?? 'basic');

  const nodesLength = nodes.length;
  // One-time sync from API data if initialNodes arrive after mount
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0 && nodesLength === 0) {
      setNodes(initialNodes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNodes, nodesLength]);

  const addSection = useCallback((type: SectionType) => {
    const adv = mode === 'advanced';
    const h = DEFAULT_H[type] ?? 3;
    const w = adv ? 6 : 12;
    setNodes((prev) => [...prev, {
      id: rid(type),
      kind: 'section',
      type,
      placement: adv ? findEmptySlot(prev, w, h) : clampPlacement({ x: 0, y: nextY(prev), w, h }),
      wrapper: { container: type === 'hero' || type === 'cover' ? 'hero-banner' : 'contained' },
    }]);
  }, [mode]);

  const addComposite = useCallback((templateId: string) => {
    const adv = mode === 'advanced';
    const w = adv ? 6 : 12;
    setNodes((prev) => {
      const id = rid('comp');
      let children: LayoutNode[] = [];

      if (templateId === 'group-default') {
        // empty group
        children = [];
      } else {
        // hero-split or others
        children = [
          { id: `${id}-img`, kind: 'section' as const, type: 'gallery', placement: { x: 0, y: 0, w: 6, h: 4 } },
          { id: `${id}-txt`, kind: 'section' as const, type: 'story', placement: { x: 6, y: 0, w: 6, h: 4 } },
        ];
      }

      return [...prev, {
        id,
        kind: 'composite' as const,
        type: templateId,
        placement: adv ? findEmptySlot(prev, w, 5) : clampPlacement({ x: 0, y: nextY(prev), w, h: 5 }),
        wrapper: { container: templateId === 'group-default' ? 'full-width' : 'split' as ContainerType },
        children,
      }];
    });
  }, [mode]);

  const addWidgetInstance = useCallback((widgetId: string) => {
    const adv = mode === 'advanced';
    setNodes((prev) => {
      const def = widgetDefs.get(widgetId);
      const id = rid('w');
      // Snapshot the definition into the instance so the canvas can show/edit slots inline.
      // ponytail: live-link (library edits propagate) — swap snapshot for resolveNode+overrides later.
      const children = def?.children?.map((c) => ({ ...c, id: `${id}__${c.id}` }));
      const w = def?.placement?.w ?? (adv ? 6 : 12);
      const h = def?.placement?.h ?? 5;
      return [...prev, {
        id,
        kind: 'composite' as const,
        widgetId,
        type: def?.type ?? widgetId,
        variant: def?.variant,
        placement: adv ? findEmptySlot(prev, w, h) : clampPlacement({ x: 0, y: nextY(prev), w, h }),
        wrapper: def?.wrapper ?? { container: 'contained' as ContainerType },
        ...(children ? { children } : {}),
      }];
    });
  }, [widgetDefs, mode]);

  const swapSlots = useCallback((id: string) => {
    setNodes((prev) => replaceNodeDeep(prev, id, (n) => n.children ? { ...n, children: [...n.children].reverse() } : n));
  }, []);

  const addChildSlot = useCallback((parentId: string) => {
    setNodes((prev) => replaceNodeDeep(prev, parentId, (n) => ({
      ...n,
      children: [...(n.children ?? []), { id: rid('slot'), kind: 'section' as const, type: 'quote', placement: { x: 0, y: 0, w: 6, h: 3 } }],
    })));
  }, []);

  const patchNode = useCallback((id: string, patch: Omit<Partial<LayoutNode>, 'placement'> & { placement?: Partial<Placement> }) => {
    setNodes((prev) => replaceNodeDeep(prev, id, (n) => {
      const { placement, ...rest } = patch;
      return {
        ...n,
        ...rest,
        ...(placement ? { placement: clampPlacement({ ...n.placement, ...placement }) } : {}),
      };
    }));
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => removeNodeDeep(prev, id));
    setSelectedId((s) => (s === id ? null : s));
  }, []);

  const selected = selectedId ? findNodeDeep(nodes, selectedId) : null;
  const loc = selectedId ? findWithParent(nodes, selectedId) : undefined;

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      <SectionPalette
        onAdd={addSection}
        onAddComposite={addComposite}
        onAddWidget={widgets && widgets.length ? addWidgetInstance : undefined}
        widgets={widgets}
        readOnly={readOnly}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Layout name…" disabled={readOnly}
              className="px-3 py-1.5 text-base sm:text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] w-48" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description…" disabled={readOnly}
              className="px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] w-56 text-zinc-500" />
          </div>
          <div className="flex items-center gap-2">
            <select value={mode} onChange={(e) => setMode(e.target.value as 'basic' | 'advanced')} disabled={readOnly} className="px-2 py-1 text-xs border border-zinc-300 rounded-lg">
              <option value="basic">Basic (Grid Snap)</option>
              <option value="advanced">Advanced (Free Pixel)</option>
            </select>
            <select value={animation} onChange={(e) => setAnimation(e.target.value)} disabled={readOnly} className="px-2 py-1 text-xs border border-zinc-300 rounded-lg">
              <option value="fade-up">Fade Up</option>
              <option value="fade-in">Fade In</option>
              <option value="scale-in">Scale In</option>
              <option value="slide-up">Slide Up</option>
              <option value="none">None</option>
            </select>
            {onPreview && <button onClick={onPreview} className="px-3 py-1.5 text-xs bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200">Preview</button>}
            {!readOnly && onSave && (
              <button onClick={() => onSave({ name, description, nodes, animation: { preset: animation }, mode })}
                className="px-4 py-1.5 text-xs bg-[var(--colors-primary)] text-white rounded-lg hover:bg-[var(--colors-primary-hover)]">
                Save Layout
              </button>
            )}
          </div>
        </div>

        <GridCanvas
          nodes={nodes}
          mode={mode}
          selectedId={selectedId}
          selectedChildId={loc?.parent ? selectedId : null}
          onChange={setNodes}
          onSelect={setSelectedId}
          onSwap={swapSlots}
        />
      </div>

      {/* Properties */}
      <div className="w-64 flex-shrink-0 bg-white border border-zinc-200 rounded-xl p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Properties</h3>
        {!selected ? (
          <p className="text-xs text-zinc-400">Klik widget / slot di canvas untuk edit properti.</p>
        ) : loc?.parent ? (
          <SlotEditor selected={selected} parent={loc.parent} readOnly={readOnly}
            onPatch={patchNode} onRemove={removeNode} onBack={() => setSelectedId(loc.parent!.id)} />
        ) : selected.kind === 'composite' ? (
          <CompositeEditor selected={selected} readOnly={readOnly}
            onPatch={patchNode} onAddSlot={addChildSlot} onRemove={removeNode} onSwap={swapSlots}
            onSelectSlot={setSelectedId} onEditWidget={onEditWidget} />
        ) : (
          <SectionEditor selected={selected} readOnly={readOnly} onPatch={patchNode} onRemove={removeNode} />
        )}
      </div>
    </div>
  );
}

// ─── Section (top-level leaf) ─────────────────────────────
function SectionEditor({ selected, readOnly, onPatch, onRemove }: {
  selected: LayoutNode; readOnly?: boolean;
  onPatch: (id: string, patch: Omit<Partial<LayoutNode>, 'placement'> & { placement?: Partial<Placement> }) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Section</label>
        <p className="text-sm font-medium text-zinc-800 capitalize">{selected.type}</p>
      </div>
      <TypeSelect value={selected.type} disabled={readOnly} onChange={(t) => onPatch(selected.id, { type: t as SectionType })} />
      <Field label="Variant">
        <input value={selected.variant ?? ''} onChange={(e) => onPatch(selected.id, { variant: e.target.value })} disabled={readOnly}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]" placeholder="e.g. grid / image-left" />
      </Field>
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Placement (12-col grid)</label>
        <div className="grid grid-cols-2 gap-2">
          <NumField label="x" value={selected.placement.x} max={11} disabled={readOnly} onChange={(v) => onPatch(selected.id, { placement: { x: v } })} />
          <NumField label="y" value={selected.placement.y} max={99} disabled={readOnly} onChange={(v) => onPatch(selected.id, { placement: { y: v } })} />
          <NumField label="w" value={selected.placement.w} max={12} disabled={readOnly} onChange={(v) => onPatch(selected.id, { placement: { w: v } })} />
          <NumField label="h" value={selected.placement.h} max={20} disabled={readOnly} onChange={(v) => onPatch(selected.id, { placement: { h: v } })} />
        </div>
      </div>
      <Field label="Wrapper (cosmetic)">
        <select value={selected.wrapper?.container ?? 'contained'} disabled={readOnly}
          onChange={(e) => onPatch(selected.id, { wrapper: { container: e.target.value as ContainerType, columns: selected.wrapper?.columns } })}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]">
          {CONTAINER_TYPES.map((ct) => <option key={ct.type} value={ct.type}>{ct.label}</option>)}
        </select>
      </Field>
      {!readOnly && <button onClick={() => onRemove(selected.id)} className="w-full px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Remove section</button>}
    </div>
  );
}

// ─── Composite (top-level) ────────────────────────────────
function CompositeEditor({ selected, readOnly, onPatch, onAddSlot, onRemove, onSwap, onSelectSlot, onEditWidget }: {
  selected: LayoutNode; readOnly?: boolean;
  onPatch: (id: string, patch: Omit<Partial<LayoutNode>, 'placement'> & { placement?: Partial<Placement> }) => void;
  onAddSlot: (parentId: string) => void; onRemove: (id: string) => void; onSwap: (id: string) => void;
  onSelectSlot: (id: string) => void; onEditWidget?: (widgetId: string) => void;
}) {
  const slotCount = selected.children?.length ?? 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Composite</label>
          <p className="text-sm font-medium text-zinc-800 capitalize">{selected.type ?? 'composite'}</p>
        </div>
        {selected.widgetId && onEditWidget && (
          <button onClick={() => onEditWidget(selected.widgetId!)} className="text-[10px] text-[var(--colors-primary)] hover:underline">edit library →</button>
        )}
      </div>

      {selected.widgetId && (
        <p className="text-[10px] text-zinc-400 bg-zinc-50 rounded p-2">Instance widget library <span className="font-mono">{selected.widgetId}</span>. Edit di sini jadi override per-instance.</p>
      )}

      {!readOnly && (
        <button onClick={() => onSwap(selected.id)} disabled={slotCount < 2}
          className="w-full px-3 py-2 text-xs bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 disabled:opacity-40 flex items-center justify-center gap-2">
          ↔ Swap slot order (image left ↔ right)
        </button>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs text-zinc-500">Slots ({slotCount})</label>
          {!readOnly && <button onClick={() => onAddSlot(selected.id)} className="text-[10px] text-[var(--colors-primary)] hover:underline">+ add slot</button>}
        </div>
        <div className="space-y-1">
          {(selected.children ?? []).map((c, i) => (
            <button key={c.id} onClick={() => onSelectSlot(c.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md border border-zinc-200 hover:border-zinc-300 text-left text-xs">
              <span className="text-zinc-400">{i + 1}.</span>
              <span className="text-zinc-700 capitalize flex-1">{c.type}</span>
              <span className="text-zinc-300">edit →</span>
            </button>
          ))}
        </div>
      </div>

      {!readOnly && <button onClick={() => onRemove(selected.id)} className="w-full px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Remove composite</button>}
    </div>
  );
}

// ─── Slot (child of composite) ────────────────────────────
function SlotEditor({ selected, parent, readOnly, onPatch, onRemove, onBack }: {
  selected: LayoutNode; parent: LayoutNode; readOnly?: boolean;
  onPatch: (id: string, patch: Omit<Partial<LayoutNode>, 'placement'> & { placement?: Partial<Placement> }) => void;
  onRemove: (id: string) => void; onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-[10px] text-zinc-400 hover:text-zinc-600 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        back to {parent.type ?? 'composite'}
      </button>
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Slot</label>
        <p className="text-sm font-medium text-zinc-800">Di dalam composite</p>
      </div>
      <TypeSelect value={selected.type} disabled={readOnly} onChange={(t) => onPatch(selected.id, { type: t as SectionType })} />
      <Field label="Variant">
        <input value={selected.variant ?? ''} onChange={(e) => onPatch(selected.id, { variant: e.target.value })} disabled={readOnly}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]" placeholder="optional" />
      </Field>
      <p className="text-[10px] text-zinc-400">Slot di-render berurutan. Mobile: stack vertikal.</p>
      {!readOnly && <button onClick={() => onRemove(selected.id)} className="w-full px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Remove slot</button>}
    </div>
  );
}

// ─── shared inputs ────────────────────────────────────────
function TypeSelect({ value, disabled, onChange }: { value?: string; disabled?: boolean; onChange: (v: string) => void }) {
  return (
    <Field label="Section type">
      <select value={value ?? ''} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-base sm:text-sm capitalize focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]">
        {PALETTE_SECTIONS.map((s) => <option key={s.type} value={s.type}>{s.label}</option>)}
      </select>
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function NumField({ label, value, max, disabled, onChange }: { label: string; value: number; max: number; disabled?: boolean; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] text-zinc-400">{label}</span>
      <input type="number" min={0} max={max} value={value} disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]" />
    </label>
  );
}
