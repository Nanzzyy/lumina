'use client';

import { memo } from 'react';
import type { FC } from 'react';
import type { Field } from '@core/schema';
import type { Node, LayoutProps, ConstraintPin, NodeFrame, BreakpointKey } from '@core/document';
import { resolveResponsiveFrame, BREAKPOINT_ORDER, DEVICE_VIEWPORTS } from '@core/responsive';
import type { DeviceKey } from '@core/responsive';
import { useEditorStore } from '@editor/store';
import { getComponent } from '@editor/component-registry';

// E1.5: Inspector reads the node's ComponentDef.schema (ADR-005) — fully registry-driven.
// No switch on component type; adding a field to a manifest shows it here automatically.

interface InspectorProps {
  node: Node;
  /** E7: current preview device (toolbar switcher) — responsive section edits its breakpoint. */
  device: DeviceKey;
  onDeviceChange: (d: DeviceKey) => void;
}

const Inspector: FC<InspectorProps> = memo(function InspectorFn({ node, device, onDeviceChange }) {
  const setProp = useEditorStore((s) => s.setProp);
  const renameNode = useEditorStore((s) => s.renameNode);
  const def = node.componentId ? getComponent(node.componentId) : undefined;
  const fields = def?.schema?.fields ?? [];
  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-3 overflow-y-auto max-h-full">
      {/* E4: node-level name — rename any node (incl. groups), independent of component. */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-zinc-500">Name</span>
        <input
          type="text"
          value={node.name ?? ''}
          onChange={(e) => renameNode(node.id, e.target.value)}
          className={inputCls}
        />
      </div>
      <LayoutSection node={node} />
      <ConstraintSection node={node} />
      <ResponsiveSection node={node} device={device} onDeviceChange={onDeviceChange} />
      {def ? (
        <>
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{def.name}</h4>
          {fields.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">No editable properties.</p>
          ) : (
            fields.map((field) => (
              <FieldControl key={field.key} field={field} node={node} onChange={(v) => setProp(node.id, field.key, v)} />
            ))
          )}
        </>
      ) : (
        <p className="text-xs text-zinc-400 text-center py-4">
          Unknown component &ldquo;{node.componentId ?? 'none'}&rdquo;.
        </p>
      )}
    </div>
  );
});

function FieldControl({
  field,
  node,
  onChange,
}: {
  field: Field;
  node: Node;
  onChange: (v: unknown) => void;
}) {
  const value = node.props?.[field.key] ?? field.default;
  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{field.label}</span>
        {field.bindable && <span className="text-[9px] text-zinc-300" title="Bindable to a variable">⬡</span>}
      </label>
      {renderWidget(field, value, onChange, inputCls)}
    </div>
  );
}

function renderWidget(field: Field, value: unknown, onChange: (v: unknown) => void, inputCls: string) {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          value={String(value ?? '')}
          rows={2}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} resize-none`}
        />
      );
    case 'css':
      return (
        <textarea
          value={String(value ?? '')}
          rows={2}
          placeholder="property: value;"
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} font-mono resize-none`}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          value={Number(value ?? 0)}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          onChange={(e) => onChange(Number(e.target.value))}
          className={inputCls}
        />
      );
    case 'range':
      return (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 1000}
            step={field.step ?? 1}
            value={typeof value === 'number' ? value : 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-zinc-500 w-12 text-right">{String(value ?? '')}</span>
        </div>
      );
    case 'color':
      return (
        <div className="flex gap-2">
          <input
            type="color"
            value={String(value ?? '#000000')}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 p-0.5 rounded border border-zinc-300 cursor-pointer"
          />
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
        </div>
      );
    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-zinc-500">{field.label}</span>
        </label>
      );
    case 'select':
      return (
        <select
          value={String(value ?? field.default ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        >
          {field.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case 'image':
      return (
        <div className="flex gap-2">
          {!!value && (
            <img src={String(value)} alt="" className="w-10 h-10 rounded object-cover" />
          )}
          <input
            type="text"
            value={String(value ?? '')}
            placeholder="Image URL…"
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
        </div>
      );
    case 'shadow': {
      const m = String(value ?? 'none').match(/(-?\d+)\s*px\s+(-?\d+)\s*px\s+(\d+)\s*px\s+(.+)$/);
      const x = m ? m[1] : '0';
      const y = m ? m[2] : '0';
      const blur = m ? m[3] : '0';
      const color = m ? m[4] : '#000000';
      const compose = (nx: string, ny: string, nb: string, nc: string) =>
        onChange(`${nx}px ${ny}px ${nb}px ${nc}`);
      return (
        <div className="grid grid-cols-4 gap-1">
          <input type="number" value={x} title="X" onChange={(e) => compose(e.target.value, y, blur, color)} className={inputCls} />
          <input type="number" value={y} title="Y" onChange={(e) => compose(x, e.target.value, blur, color)} className={inputCls} />
          <input type="number" value={blur} title="Blur" onChange={(e) => compose(x, y, e.target.value, color)} className={inputCls} />
          <input type="text" value={color} title="Color" onChange={(e) => compose(x, y, blur, e.target.value)} className={inputCls} />
        </div>
      );
    }
    case 'spacing': {
      const raw = String(value ?? '').split(/\s+/).filter(Boolean);
      const g = (i: number) => raw[i] ?? raw[0] ?? '0';
      const compose = (t: string, r: string, b: string, l: string) => onChange(`${t} ${r} ${b} ${l}`);
      return (
        <div className="grid grid-cols-4 gap-1">
          <input type="number" value={g(0)} title="Top" onChange={(e) => compose(e.target.value, g(1), g(2), g(3))} className={inputCls} />
          <input type="number" value={g(1)} title="Right" onChange={(e) => compose(g(0), e.target.value, g(2), g(3))} className={inputCls} />
          <input type="number" value={g(2)} title="Bottom" onChange={(e) => compose(g(0), g(1), e.target.value, g(3))} className={inputCls} />
          <input type="number" value={g(3)} title="Left" onChange={(e) => compose(g(0), g(1), g(2), e.target.value)} className={inputCls} />
        </div>
      );
    }
    // ponytail: dedicated radius/gradient pickers; text/font/radius/gradient fall back to text.
    case 'text':
    case 'font':
    case 'radius':
    case 'gradient':
    default:
      return (
        <input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      );
  }
}

/** E5: Auto Layout controls (node-level, applies to any node). */
function LayoutSection({ node }: { node: Node }) {
  const setLayoutMode = useEditorStore((s) => s.setLayoutMode);
  const setLayoutProps = useEditorStore((s) => s.setLayoutProps);
  const lp = node.layoutProps ?? {};
  const isFlex = node.layout === 'flex';
  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const selCls = (active: boolean) =>
    `px-2 py-1 rounded text-xs ${active ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-zinc-100 text-zinc-600'}`;

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3">
      <span className="text-xs text-zinc-500">Layout</span>
      <div className="flex gap-1">
        <button className={selCls(!isFlex)} onClick={() => setLayoutMode(node.id, 'none')}>None</button>
        <button className={selCls(isFlex)} onClick={() => setLayoutMode(node.id, 'flex')}>Flex</button>
      </div>
      {isFlex && (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400">Direction</span>
            <select value={lp.direction ?? 'row'} onChange={(e) => setLayoutProps(node.id, { direction: e.target.value as LayoutProps['direction'] })} className={inputCls}>
              <option value="row">Row</option>
              <option value="column">Column</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column-reverse">Col Reverse</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400">Gap</span>
            <input type="number" value={lp.gap ?? 0} onChange={(e) => setLayoutProps(node.id, { gap: Number(e.target.value) })} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400">Align</span>
            <select value={lp.align ?? 'start'} onChange={(e) => setLayoutProps(node.id, { align: e.target.value as LayoutProps['align'] })} className={inputCls}>
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="stretch">Stretch</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400">Justify</span>
            <select value={lp.justify ?? 'start'} onChange={(e) => setLayoutProps(node.id, { justify: e.target.value as LayoutProps['justify'] })} className={inputCls}>
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="between">Between</option>
              <option value="around">Around</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400">Padding</span>
            <input type="number" value={Array.isArray(lp.padding) ? lp.padding[0] : (lp.padding ?? 0)} onChange={(e) => setLayoutProps(node.id, { padding: Number(e.target.value) })} className={inputCls} />
          </label>
          <label className="flex items-center gap-2 pt-5">
            <input type="checkbox" checked={!!lp.wrap} onChange={(e) => setLayoutProps(node.id, { wrap: e.target.checked })} className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-xs text-zinc-500">Wrap</span>
          </label>
        </div>
      )}
    </div>
  );
}

/** E6: Constraint pins (how a node repositions when its container resizes). */
function ConstraintSection({ node }: { node: Node }) {
  const setConstraintPin = useEditorStore((s) => s.setConstraintPin);
  const c = node.constraints;
  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const H_OPTS: ConstraintPin[] = ['left', 'right', 'centerX', 'scale', 'fixed'];
  const V_OPTS: ConstraintPin[] = ['top', 'bottom', 'centerY', 'scale', 'fixed'];

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3">
      <span className="text-xs text-zinc-500">Constraints</span>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-zinc-400">Horizontal</span>
          <select
            value={c?.horizontal?.pin ?? ''}
            onChange={(e) => setConstraintPin(node.id, 'horizontal', (e.target.value || undefined) as ConstraintPin | undefined)}
            className={inputCls}
          >
            <option value="">None</option>
            {H_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-zinc-400">Vertical</span>
          <select
            value={c?.vertical?.pin ?? ''}
            onChange={(e) => setConstraintPin(node.id, 'vertical', (e.target.value || undefined) as ConstraintPin | undefined)}
            className={inputCls}
          >
            <option value="">None</option>
            {V_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}

/**
 * E7: Per-breakpoint frame overrides (Responsive Engine, ADR-019).
 * The breakpoint tabs drive the toolbar device preview (onDeviceChange) so the
 * canvas reflects the override being edited. Inputs show the RESOLVED frame for
 * the active breakpoint (base + cascade); typing writes a delta into
 * node.responsive[bp]. Resolve happens at preview, so NodeView stays unchanged.
 */
function ResponsiveSection({
  node,
  device,
  onDeviceChange,
}: {
  node: Node;
  device: DeviceKey;
  onDeviceChange: (d: DeviceKey) => void;
}) {
  const setResponsiveOverride = useEditorStore((s) => s.setResponsiveOverride);
  const clearResponsiveBreakpoint = useEditorStore((s) => s.clearResponsiveBreakpoint);
  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  // Active breakpoint = previewed device when it's a real breakpoint, else 'sm'.
  const bp: BreakpointKey =
    device !== 'base' && device !== 'custom' ? (device as BreakpointKey) : 'sm';
  const resolved = resolveResponsiveFrame(node.frame, node.responsive, bp);
  const hasOverride = !!node.responsive?.[bp];

  const fields: { key: keyof NodeFrame; label: string }[] = [
    { key: 'x', label: 'X' },
    { key: 'y', label: 'Y' },
    { key: 'w', label: 'W' },
    { key: 'h', label: 'H' },
    { key: 'rotation', label: 'Rotation' },
  ];
  const tabCls = (b: BreakpointKey) =>
    `relative px-2 py-1 rounded text-[10px] ${b === bp ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-zinc-100 text-zinc-500'}`;

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3">
      <span className="text-xs text-zinc-500">Responsive</span>
      <div className="flex gap-1">
        {BREAKPOINT_ORDER.map((b) => (
          <button
            key={b}
            className={tabCls(b)}
            onClick={() => onDeviceChange(b)}
            title={DEVICE_VIEWPORTS[b]?.label}
          >
            {b}
            {node.responsive?.[b] && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {fields.map((f) => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400">{f.label}</span>
            <input
              type="number"
              value={Math.round(resolved[f.key] ?? 0)}
              onChange={(e) =>
                setResponsiveOverride(node.id, bp, { [f.key]: Number(e.target.value) } as Partial<NodeFrame>)
              }
              className={inputCls}
            />
          </label>
        ))}
      </div>
      {hasOverride && (
        <button
          className="text-[10px] text-zinc-400 hover:text-red-500 self-end"
          onClick={() => clearResponsiveBreakpoint(node.id, bp)}
        >
          Clear {bp} override
        </button>
      )}
    </div>
  );
}

export default Inspector;
