'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { OrnamentConfig } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';

interface OrnamentCanvasProps {
  ornaments: OrnamentConfig[];
  onChange: (ornaments: OrnamentConfig[]) => void;
  children: React.ReactNode;
  readOnly?: boolean;
}

const ornamentTypes: OrnamentConfig['type'][] = [
  'flower', 'heart', 'leaf', 'swirl', 'dots', 'divider', 'frame', 'custom',
];

const ANIMATION_ENTRANCE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideDown', label: 'Slide Down' },
  { value: 'slideLeft', label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
  { value: 'scaleIn', label: 'Scale In' },
  { value: 'rotateIn', label: 'Rotate In' },
  { value: 'bounceIn', label: 'Bounce In' },
];

const ANIMATION_EXIT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'fadeOut', label: 'Fade Out' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideDown', label: 'Slide Down' },
  { value: 'slideLeft', label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
  { value: 'scaleOut', label: 'Scale Out' },
  { value: 'rotateOut', label: 'Rotate Out' },
  { value: 'bounceOut', label: 'Bounce Out' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

/** Interactive canvas — drag ornaments, click to select, floating panel. */
export function OrnamentCanvas({ ornaments, onChange, children, readOnly }: OrnamentCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [panelPos, setPanelPos] = useState({ x: 40, y: 40 });

  // Refs kept in sync for stable drag listener (no dep cycles)
  const ornamentsRef = useRef(ornaments);
  const onChangeRef = useRef(onChange);
  ornamentsRef.current = ornaments;
  onChangeRef.current = onChange;

  // Drag state (ref, no re-render during drag)
  const drag = useRef<{
    id: string;
    origPctX: number;
    origPctY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  // Auto-migrate legacy ornaments without id
  useEffect(() => {
    let changed = false;
    const migrated = ornaments.map((o) => {
      if (!o.id) {
        changed = true;
        return { ...o, id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2) };
      }
      return o;
    });
    if (changed) onChange(migrated);
  }, []);

  const selected = ornaments.find((o) => o.id === selectedId) ?? null;

  const updateOrnament = useCallback((id: string, patch: Partial<OrnamentConfig>) => {
    onChange(ornaments.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, [ornaments, onChange]);

  const moveLayer = useCallback((id: string, dir: 'up' | 'down') => {
    const idx = ornaments.findIndex((o) => o.id === id);
    if (idx === -1) return;
    const next = [...ornaments];
    const swap = dir === 'up' ? idx + 1 : idx - 1;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  }, [ornaments, onChange]);

  const removeOrnament = useCallback((id: string) => {
    onChange(ornaments.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [ornaments, onChange, selectedId]);

  // Add ornament at the center of the full preview
  const addOrnament = useCallback((type: OrnamentConfig['type']) => {
    const id = crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
    // Always place at x:50, y:50 (center of the invitation).
    // User can then drag to desired position.
    const y = 50;
    onChange([...ornaments, { id, type, x: 50, y, size: 24, opacity: 0.6 }]);
    setSelectedId(id);
  }, [ornaments, onChange]);

  // Drag system — uses refs, never re-installs
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (!d.moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) d.moved = true;
      if (!d.moved) return;

      const wrap = wrapperRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const pctX = d.origPctX + (dx / rect.width) * 100;
      const pctY = d.origPctY + (dy / rect.height) * 100;
      const clampedX = Math.round(Math.max(0, Math.min(100, pctX)) * 10) / 10;
      const clampedY = Math.round(Math.max(0, Math.min(100, pctY)) * 10) / 10;

      const list = ornamentsRef.current;
      const idx = list.findIndex((o) => o.id === d.id);
      if (idx === -1) return;
      const updated = [...list];
      updated[idx] = { ...updated[idx], x: clampedX, y: clampedY };
      onChangeRef.current(updated);

      // Update origin for next frame so drag continues smoothly
      d.origPctX = clampedX;
      d.origPctY = clampedY;
      d.startX = e.clientX;
      d.startY = e.clientY;
    };

    const onUp = () => {
      if (drag.current && !drag.current.moved) {
        // Click without dragging — select
        setSelectedId(drag.current.id);
      }
      drag.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []); // ⭐ Stable — never re-installs during drag

  const startDrag = useCallback((e: React.MouseEvent, ornament: OrnamentConfig) => {
    e.preventDefault();
    drag.current = {
      id: ornament.id,
      origPctX: ornament.x ?? 50,
      origPctY: ornament.y ?? 50,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  }, []);

  const sizeToPx = (size: OrnamentConfig['size']): number =>
    typeof size === 'number' ? size : ({ sm: 16, md: 24, lg: 32 })[size || 'md'];

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Preview */}
      <div className="relative">
        <div className="relative">{children}</div>

        {/* Canvas overlay — ornaments rendered here, pass through clicks */}
        <div className="absolute inset-0 z-10" style={{ pointerEvents: 'none' }}>
          {ornaments.map((ornament, idx) => (
            <div
              key={ornament.id || idx}
              data-ornament-id={ornament.id}
              onMouseDown={readOnly ? undefined : (e) => startDrag(e, ornament)}
              onClick={readOnly ? undefined : (e) => { e.stopPropagation(); setSelectedId(ornament.id); }}
              style={{
                position: 'absolute',
                left: `${ornament.x ?? 50}%`,
                top: `${ornament.y ?? 50}%`,
                transform: 'translate(-50%, -50%) rotate(' + (ornament.rotation ?? 0) + 'deg)',
                opacity: ornament.opacity ?? 0.5,
                zIndex: idx + 1,
                cursor: readOnly ? 'default' : 'grab',
                pointerEvents: 'auto',
              }}
              className={selectedId === ornament.id ? 'z-30' : ''}
            >
              <div
                className={cn(
                  'transition-shadow rounded',
                  selectedId === ornament.id && 'ring-2 ring-[var(--colors-primary)] ring-offset-2',
                )}
                style={{ padding: 10, margin: -10 }}
              >
                <OrnamentPreview type={ornament.type} size={ornament.size} color={ornament.color} customSvg={ornament.customSvg} />
              </div>

              {/* Inline resize slider + delete + rotate controls */}
              {selectedId === ornament.id && !readOnly && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-zinc-200 rounded-full shadow-sm px-2 py-1" 
                  onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}
                  style={{ pointerEvents: 'auto' }}>
                  <button onClick={() => updateOrnament(ornament.id, { rotation: ((ornament.rotation ?? 0) - 45) % 360 })}
                    className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500" title="Rotate -45°">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M1 4v6h6M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                  </button>
                  <button onClick={() => updateOrnament(ornament.id, { rotation: ((ornament.rotation ?? 0) + 45) % 360 })}
                    className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500" title="Rotate +45°">
                    <svg className="w-3.5 h-3.5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M1 4v6h6M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                  </button>
                  <div className="w-px h-4 bg-zinc-200 mx-0.5" />
                  <button onClick={() => { removeOrnament(ornament.id); }}
                    className="w-6 h-6 rounded-full hover:bg-red-100 flex items-center justify-center text-zinc-500 hover:text-red-500" title="Delete ornament">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <div className="w-px h-4 bg-zinc-200 mx-0.5" />
                  <input type="range" min={8} max={400} value={sizeToPx(ornament.size)}
                    onChange={(e) => updateOrnament(ornament.id, { size: Number(e.target.value) })}
                    className="w-16 h-1" />
                  <span className="text-[9px] text-zinc-400 w-8 text-right tabular-nums">{sizeToPx(ornament.size)}px</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {ornaments.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <p className="text-xs text-zinc-400 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">Click + to add an ornament, then drag to position</p>
        </div>
      )}

      {/* Floating properties panel */}
      {selected && (
        <div ref={panelRef} className="fixed z-50 bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden" style={{ width: 280, left: panelPos.x, top: panelPos.y }}>
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 border-b border-zinc-200 cursor-move select-none"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX, startY = e.clientY;
              const origX = panelPos.x, origY = panelPos.y;
              const onMove = (ev: MouseEvent) => {
                setPanelPos({ x: origX + (ev.clientX - startX), y: origY + (ev.clientY - startY) });
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          >
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">{selected.type} · {sizeToPx(selected.size)}px</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => moveLayer(selected.id, 'down')} className="w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600" title="Send backward">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button onClick={() => moveLayer(selected.id, 'up')} className="w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600" title="Bring forward">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
              </button>
              <div className="w-px h-4 bg-zinc-200 mx-1" />
              <button onClick={() => setPanelMinimized(!panelMinimized)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {panelMinimized ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />}
                </svg>
              </button>
              <button onClick={() => setSelectedId(null)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 text-zinc-400 hover:text-red-500" title="Close panel">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {!panelMinimized && (
            <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <Field label="Type">
                <select value={selected.type} onChange={(e) => updateOrnament(selected.id, { type: e.target.value as OrnamentConfig['type'] })}
                  className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 text-sm">
                  {ornamentTypes.map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="X %">
                  <input type="number" min={0} max={100} value={Math.round(selected.x ?? 50)}
                    onChange={(e) => updateOrnament(selected.id, { x: Math.max(0, Math.min(100, Number(e.target.value))) })}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 text-sm" />
                </Field>
                <Field label="Y %">
                  <input type="number" min={0} max={100} value={Math.round(selected.y ?? 50)}
                    onChange={(e) => updateOrnament(selected.id, { y: Math.max(0, Math.min(100, Number(e.target.value))) })}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 text-sm" />
                </Field>
              </div>
              <Field label="Rotation">
                <input type="range" min={-180} max={180} value={selected.rotation ?? 0}
                  onChange={(e) => updateOrnament(selected.id, { rotation: Number(e.target.value) })} className="w-full" />
                <span className="text-xs text-zinc-400">{selected.rotation ?? 0}°</span>
              </Field>
              <Field label="Size">
                <div className="flex items-center gap-2">
                  <input type="range" min={8} max={400} value={sizeToPx(selected.size)}
                    onChange={(e) => updateOrnament(selected.id, { size: Number(e.target.value) })} className="flex-1" />
                  <input type="number" min={8} max={400} value={sizeToPx(selected.size)}
                    onChange={(e) => updateOrnament(selected.id, { size: Number(e.target.value) })}
                    className="w-14 px-2 py-1 rounded-lg border border-zinc-300 text-sm text-center" />
                </div>
              </Field>
              <Field label="Opacity">
                <input type="range" min={0} max={1} step={0.05} value={selected.opacity ?? 0.5}
                  onChange={(e) => updateOrnament(selected.id, { opacity: Number(e.target.value) })} className="w-full" />
                <span className="text-xs text-zinc-400">{selected.opacity ?? 0.5}</span>
              </Field>
              <Field label="Color">
                <input type="color" value={selected.color || '#000000'}
                  onChange={(e) => updateOrnament(selected.id, { color: e.target.value })}
                  className="w-full h-8 rounded-lg border border-zinc-300 cursor-pointer" />
              </Field>
              {selected.type === 'custom' && (
                <Field label="Custom SVG Path">
                  <textarea value={selected.customSvg || ''}
                    onChange={(e) => updateOrnament(selected.id, { customSvg: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 text-sm font-mono resize-none" rows={3} placeholder="M12 2..." />
                </Field>
              )}
              <div className="border-t border-zinc-200 pt-2">
                <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Animation</h4>
                <Field label="Entrance">
                  <select value={selected.animation?.entrance || 'none'}
                    onChange={(e) => updateOrnament(selected.id, { animation: { ...selected.animation, entrance: e.target.value as NonNullable<OrnamentConfig['animation']>['entrance'] } })}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 text-sm">
                    {ANIMATION_ENTRANCE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </Field>
                <Field label="Exit">
                  <select value={selected.animation?.exit || 'none'}
                    onChange={(e) => updateOrnament(selected.id, { animation: { ...selected.animation, exit: e.target.value as NonNullable<OrnamentConfig['animation']>['exit'] } })}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 text-sm">
                    {ANIMATION_EXIT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Dur (s)">
                    <input type="number" min={0.1} max={5} step={0.1} value={selected.animation?.duration ?? 0.5}
                      onChange={(e) => updateOrnament(selected.id, { animation: { ...selected.animation, duration: Number(e.target.value) } })}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 text-sm" />
                  </Field>
                  <Field label="Delay (s)">
                    <input type="number" min={0} max={5} step={0.1} value={selected.animation?.delay ?? 0}
                      onChange={(e) => updateOrnament(selected.id, { animation: { ...selected.animation, delay: Number(e.target.value) } })}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 text-sm" />
                  </Field>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Tiny SVG preview. */
export function OrnamentPreview({ type, size, color, customSvg }: {
  type: OrnamentConfig['type'];
  size?: OrnamentConfig['size'];
  color?: string;
  customSvg?: string;
}) {
  const svgs: Record<string, string> = {
    flower: 'M12 2C9.24 2 7 4.24 7 7c0 1.04.32 2 .86 2.81C5.38 10.19 4 12.04 4 14c0 2.76 2.24 5 5 5 .86 0 1.68-.22 2.38-.6.46 1.24.82 2.54.92 3.6h1.4c.1-1.06.46-2.36.92-3.6.7.38 1.52.6 2.38.6 2.76 0 5-2.24 5-5 0-1.96-1.38-3.81-3.86-4.19.54-.81.86-1.77.86-2.81 0-2.76-2.24-5-5-5z',
    heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    leaf: 'M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 6-2 9-6 3-4 4-8 0-6z',
    swirl: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
    dots: 'M12 6m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0 -3 0M12 12m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0 -3 0M12 18m-1.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0 -3 0',
    divider: 'M3 12h18M3 6h18M3 18h18',
    frame: 'M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm1 2h12v12H6V6zm1 1h10v10H7V7z',
  };
  const sizeMap: Record<string, number> = { sm: 16, md: 24, lg: 32 };
  const px = typeof size === 'number' ? size : (sizeMap[size || 'md']);
  return (
    <svg width={type === 'divider' ? px * 2 : px} height={px} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth={1.5} className="flex-shrink-0" style={{ pointerEvents: 'none' }}>
      {type === 'custom' && customSvg ? <path d={customSvg} /> : <path d={svgs[type] || svgs.heart} />}
    </svg>
  );
}
