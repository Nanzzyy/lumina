'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CanvasElement, CanvasAnimation } from '@/lib/content/canvas-types';
import { createDefaultElement } from '@/lib/content/canvas-types';
import type { InvitationContent } from '@/lib/content/types';
import { motion } from 'framer-motion';
import {
  Type, Image, Square, MousePointerClick, Video, Minus, Heart,
  ChevronUp, ChevronDown, Trash2, Copy, Eye, EyeOff, GripVertical,
  Undo, Redo,
} from 'lucide-react';

/* ─── Helpers ─── */

let uid = () => Math.random().toString(36).slice(2, 9);

interface EditorProps {
  content: InvitationContent;
  onChange: (c: InvitationContent) => void;
}

/* ─── MobileBuilderEditor ─── */

export function MobileBuilderEditor({ content, onChange }: EditorProps) {
  const elements = content.canvasElements || [];
  const dim = content.canvasDimensions || { w: 375, h: 667 };

  const setElements = useCallback(
    (next: CanvasElement[]) => {
      onChange({ ...content, canvasElements: next });
    },
    [content, onChange],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);
  const [resize, setResize] = useState<{ id: string; handle: string; startX: number; startY: number; elW: number; elH: number } | null>(null);

  const selected = elements.find((e) => e.id === selectedId) || null;

  const addElement = useCallback(
    (type: CanvasElement['type']) => {
      const el = createDefaultElement(type, 60, 200);
      const maxZ = elements.reduce((m, e) => Math.max(m, e.zIndex || 0), 0);
      el.zIndex = maxZ + 1;
      setElements([...elements, el]);
      setSelectedId(el.id);
    },
    [elements, setElements],
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<CanvasElement>) => {
      setElements(elements.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    },
    [elements, setElements],
  );

  const removeElement = useCallback(
    (id: string) => {
      setElements(elements.filter((e) => e.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [elements, selectedId, setElements],
  );

  const duplicateElement = useCallback(
    (id: string) => {
      const el = elements.find((e) => e.id === id);
      if (!el) return;
      const copy = { ...el, id: `el-${uid()}`, x: el.x + 16, y: el.y + 16 };
      const maxZ = elements.reduce((m, e) => Math.max(m, e.zIndex || 0), 0);
      copy.zIndex = maxZ + 1;
      setElements([...elements, copy]);
      setSelectedId(copy.id);
    },
    [elements, setElements],
  );

  const bringForward = useCallback(
    (id: string) => {
      const el = elements.find((e) => e.id === id);
      if (!el) return;
      const maxZ = elements.reduce((m, e) => Math.max(m, e.zIndex || 0), 0);
      updateElement(id, { zIndex: maxZ + 1 });
    },
    [elements, updateElement],
  );

  const sendBackward = useCallback(
    (id: string) => {
      const el = elements.find((e) => e.id === id);
      if (!el) return;
      const minZ = elements.reduce((m, e) => Math.min(m, e.zIndex || 0), Infinity);
      updateElement(id, { zIndex: (minZ || 1) - 1 });
    },
    [elements, updateElement],
  );

  /* ─── Pointer handlers ─── */

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, elId: string) => {
      if (drag || resize) return;
      e.stopPropagation();
      setSelectedId(elId);
      const el = elements.find((ev) => ev.id === elId);
      if (!el) return;
      setDrag({ id: elId, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y });
    },
    [elements, drag, resize],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (drag) {
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        // Scale: canvas is 375px wide, but rendered at some scale. We assume 1:1.
        // In the actual editor the canvas is 375px, so client coords = canvas coords.
        updateElement(drag.id, {
          x: Math.max(0, Math.min(375 - 20, drag.elX + dx)),
          y: Math.max(0, Math.min(667 - 20, drag.elY + dy)),
        });
      }
      if (resize) {
        const dx = e.clientX - resize.startX;
        const dy = e.clientY - resize.startY;
        const h = resize.handle;
        let nw = resize.elW;
        let nh = resize.elH;
        if (h.includes('e')) nw = Math.max(20, resize.elW + dx);
        if (h.includes('w')) nw = Math.max(20, resize.elW - dx);
        if (h.includes('s')) nh = Math.max(20, resize.elH + dy);
        if (h.includes('n')) nh = Math.max(20, resize.elH - dy);
        updateElement(resize.id, { w: nw, h: nh });
      }
    },
    [drag, resize, updateElement],
  );

  const handlePointerUp = useCallback(() => {
    setDrag(null);
    setResize(null);
  }, []);

  const startResize = useCallback(
    (e: React.PointerEvent, elId: string, handle: string) => {
      e.stopPropagation();
      e.preventDefault();
      const el = elements.find((ev) => ev.id === elId);
      if (!el) return;
      setResize({ id: elId, handle, startX: e.clientX, startY: e.clientY, elW: el.w, elH: el.h });
    },
    [elements],
  );

  /* ─── Render element on canvas ─── */

  const renderPreview = (el: CanvasElement) => {
    const p = el.props;

    switch (el.type) {
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center break-words leading-tight"
            style={{
              fontSize: (p.fontSize as number) || 16,
              color: (p.color as string) || '#ffffff',
              fontWeight: (p.fontWeight as string) || '400',
              textAlign: p.textAlign as React.CSSProperties['textAlign'] || 'left',
            }}
          >
            {(p.text as string) || ''}
          </div>
        );

      case 'image':
        return p.src ? (
          <img src={p.src as string} alt="" className="w-full h-full pointer-events-none" style={{ objectFit: p.fit as React.CSSProperties['objectFit'] || 'cover' }} />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-[10px]">No image</div>
        );

      case 'shape':
        return (
          <div className="w-full h-full" style={{
            borderRadius: (p.shape as string) === 'circle' ? '50%' : (p.shape as string) === 'rounded' ? 12 : 0,
            backgroundColor: (p.fill as string) || '#D4AF37',
            borderWidth: (p.borderWidth as number) || 0,
            borderStyle: 'solid',
            borderColor: (p.borderColor as string) || '#fff',
          }} />
        );

      case 'button':
        return (
          <button className="w-full h-full flex items-center justify-center text-xs font-semibold pointer-events-none"
            style={{
              backgroundColor: (p.bgColor as string) || '#D4AF37',
              color: (p.textColor as string) || '#000',
              borderRadius: (p.borderRadius as number) || 24,
            }}>{(p.text as string) || 'Button'}</button>
        );

      case 'video':
        return p.src ? (
          <video src={p.src as string} muted loop playsInline className="w-full h-full object-cover pointer-events-none" />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-[10px]">No video</div>
        );

      case 'divider':
        return <div className="w-full h-full" style={{ backgroundColor: (p.color as string) || '#fff', opacity: (p.opacity as number) ?? 0.3 }} />;

      case 'icon':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <Heart size={(p.size as number) || 24} color={(p.color as string) || '#D4AF37'} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="flex flex-col min-h-0 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT: Element Palette ─── */}
        <div className="w-48 flex-shrink-0 bg-white border-r border-zinc-200 overflow-y-auto p-3">
          <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Elements</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'text' as const, label: 'Text', icon: Type },
              { type: 'image' as const, label: 'Image', icon: Image },
              { type: 'shape' as const, label: 'Shape', icon: Square },
              { type: 'button' as const, label: 'Button', icon: MousePointerClick },
              { type: 'video' as const, label: 'Video', icon: Video },
              { type: 'divider' as const, label: 'Divider', icon: Minus },
              { type: 'icon' as const, label: 'Icon', icon: Heart },
            ].map((item) => (
              <button key={item.type} onClick={() => addElement(item.type)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-zinc-200 hover:border-[var(--colors-primary)] hover:bg-[var(--colors-primary-light)]/30 transition-all text-zinc-600 hover:text-[var(--colors-primary)]">
                <item.icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── CENTER: Canvas ─── */}
        <div className="flex-1 flex items-start justify-center p-6 bg-zinc-100 overflow-auto">
          <div
            className="relative overflow-hidden shadow-2xl rounded-xl"
            style={{ width: dim.w, height: dim.h, backgroundColor: content.canvasSettings?.backgroundColor || '#0B0F19', flexShrink: 0 }}
          >
            {elements
              .filter((e) => e.visible !== false)
              .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
              .map((el) => (
                <div key={el.id}
                  onPointerDown={(e) => handlePointerDown(e, el.id)}
                  className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${selectedId === el.id ? 'ring-2 ring-[var(--colors-primary)] ring-offset-1' : 'hover:ring-1 hover:ring-white/30'}`}
                  style={{
                    left: el.x, top: el.y, width: el.w, height: el.h,
                    zIndex: el.zIndex ?? 0, opacity: el.opacity ?? 1,
                    rotate: `${el.rotation ?? 0}deg`,
                  }}
                >
                  {renderPreview(el)}

                  {/* Resize handles — shown only when selected */}
                  {selectedId === el.id && (
                    <>
                      {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((h) => (
                        <div key={h}
                          onPointerDown={(e) => startResize(e, el.id, h)}
                          className="absolute w-3 h-3 bg-white border-2 border-[var(--colors-primary)] rounded-full"
                          style={{
                            ...(h.includes('n') ? { top: -6 } : h.includes('s') ? { bottom: -6 } : { top: '50%', marginTop: -6 }),
                            ...(h.includes('w') ? { left: -6 } : h.includes('e') ? { right: -6 } : { left: '50%', marginLeft: -6 }),
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* ─── RIGHT: Properties Panel ─── */}
        <div className="w-72 flex-shrink-0 bg-white border-l border-zinc-200 overflow-y-auto p-4">
          {!selected ? (
            <div className="text-center py-12">
              <p className="text-xs text-zinc-400">Klik elemen di kanvas untuk edit properti</p>
            </div>
          ) : (
            <PropertiesPanel
              element={selected}
              onChange={(patch) => updateElement(selected.id, patch)}
              onRemove={() => removeElement(selected.id)}
              onDuplicate={() => duplicateElement(selected.id)}
              onBringForward={() => bringForward(selected.id)}
              onSendBackward={() => sendBackward(selected.id)}
            />
          )}
        </div>
      </div>

      {/* ─── BOTTOM: Layer Strip ─── */}
      <div className="h-28 bg-white border-t border-zinc-200 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Layers ({elements.length})</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[...elements]
            .sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0))
            .map((el) => (
              <div key={el.id}
                onClick={() => setSelectedId(el.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedId === el.id
                    ? 'border-[var(--colors-primary)] bg-[var(--colors-primary-light)]/30'
                    : 'border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <span className="text-[10px] text-zinc-400 w-4">{el.zIndex}</span>
                <span className="text-zinc-600 capitalize">{el.type}</span>
                <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: !el.visible }); }}
                  className="text-zinc-400 hover:text-zinc-600">{el.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}</button>
                <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                  className="text-zinc-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Properties Panel ─── */

function PropertiesPanel({
  element, onChange, onRemove, onDuplicate, onBringForward, onSendBackward,
}: {
  element: CanvasElement;
  onChange: (patch: Partial<CanvasElement>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}) {
  const p = element.props;
  const setProp = (key: string, value: string | number | boolean) => {
    onChange({ props: { ...element.props, [key]: value } });
  };

  const NumField = ({ label, value, onChange: set, min = 0, max = 999 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) => (
    <label className="block">
      <span className="text-[10px] text-zinc-400">{label}</span>
      <input type="number" min={min} max={max} value={value}
        onChange={(e) => set(Number(e.target.value) || 0)}
        className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]" />
    </label>
  );

  const ColField = ({ label, value }: { label: string; value: string | number | boolean }) => (
    <label className="block">
      <span className="text-[10px] text-zinc-400">{label}</span>
      <input type="color" value={String(value) || '#000000'}
        onChange={(e) => setProp(label.toLowerCase(), e.target.value)}
        className="w-full h-8 rounded-md border border-zinc-300 cursor-pointer" />
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-700 uppercase capitalize">{element.type}</h3>
        <div className="flex gap-1">
          <button onClick={onDuplicate} title="Duplicate" className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded hover:bg-zinc-100"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={onRemove} title="Delete" className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Position & Size */}
      <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
        <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Position & Size</h4>
        <div className="grid grid-cols-2 gap-2">
          <NumField label="x" value={element.x} onChange={(v) => onChange({ x: v })} max={375} />
          <NumField label="y" value={element.y} onChange={(v) => onChange({ y: v })} max={667} />
          <NumField label="w" value={element.w} onChange={(v) => onChange({ w: v })} />
          <NumField label="h" value={element.h} onChange={(v) => onChange({ h: v })} />
        </div>
      </div>

      {/* Transform */}
      <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
        <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Transform</h4>
        <div className="grid grid-cols-2 gap-2">
          <NumField label="rotation" value={element.rotation} onChange={(v) => onChange({ rotation: v })} />
          <div>
            <span className="text-[10px] text-zinc-400">opacity</span>
            <input type="range" min="0" max="1" step="0.05" value={element.opacity}
              onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
              className="w-full" />
            <span className="text-[10px] text-zinc-400">{element.opacity}</span>
          </div>
        </div>
        <div className="flex gap-1 pt-1">
          <button onClick={onBringForward} className="flex-1 text-[10px] px-2 py-1 bg-zinc-200 rounded hover:bg-zinc-300 flex items-center justify-center gap-1"><ChevronUp className="w-3 h-3" /> Forward</button>
          <button onClick={onSendBackward} className="flex-1 text-[10px] px-2 py-1 bg-zinc-200 rounded hover:bg-zinc-300 flex items-center justify-center gap-1"><ChevronDown className="w-3 h-3" /> Backward</button>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400">z-index: {element.zIndex}</span>
          <input type="number" value={element.zIndex} onChange={(e) => onChange({ zIndex: Number(e.target.value) || 0 })}
            className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs" />
        </div>
      </div>

      {/* Type-specific props */}
      <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
        <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Content</h4>
        {element.type === 'text' && (
          <div className="space-y-2">
            <textarea value={(p.text as string) || ''} onChange={(e) => setProp('text', e.target.value)}
              className="w-full px-2 py-1.5 rounded-md border border-zinc-300 text-xs resize-none" rows={3} placeholder="Text content..." />
            <div className="grid grid-cols-2 gap-2">
              <label><span className="text-[10px] text-zinc-400">Font size</span>
                <input type="number" value={(p.fontSize as number) || 16} onChange={(e) => setProp('fontSize', Number(e.target.value))}
                  className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs" /></label>
              <label><span className="text-[10px] text-zinc-400">Color</span>
                <input type="color" value={(p.color as string) || '#ffffff'} onChange={(e) => setProp('color', e.target.value)}
                  className="w-full h-8 rounded-md border border-zinc-300 cursor-pointer" /></label>
              <label><span className="text-[10px] text-zinc-400">Weight</span>
                <select value={(p.fontWeight as string) || '400'} onChange={(e) => setProp('fontWeight', e.target.value)}
                  className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs">
                  <option value="300">Light</option>
                  <option value="400">Regular</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                </select></label>
              <label><span className="text-[10px] text-zinc-400">Align</span>
                <select value={(p.textAlign as string) || 'left'} onChange={(e) => setProp('textAlign', e.target.value)}
                  className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select></label>
            </div>
          </div>
        )}

        {element.type === 'image' && (
          <div className="space-y-2">
            <label><span className="text-[10px] text-zinc-400">Image URL</span>
              <input value={(p.src as string) || ''} onChange={(e) => setProp('src', e.target.value)}
                className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs" placeholder="https://..." /></label>
            <label><span className="text-[10px] text-zinc-400">Object fit</span>
              <select value={(p.fit as string) || 'cover'} onChange={(e) => setProp('fit', e.target.value)}
                className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs">
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
              </select></label>
          </div>
        )}

        {element.type === 'shape' && (
          <div className="space-y-2">
            <label><span className="text-[10px] text-zinc-400">Shape</span>
              <select value={(p.shape as string) || 'circle'} onChange={(e) => setProp('shape', e.target.value)}
                className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs">
                <option value="circle">Circle</option>
                <option value="rect">Rectangle</option>
                <option value="rounded">Rounded</option>
              </select></label>
            <ColField label="Fill" value={(p.fill as string) || '#D4AF37'} />
            <div className="grid grid-cols-2 gap-2">
              <label><span className="text-[10px] text-zinc-400">Border width</span>
                <input type="number" value={(p.borderWidth as number) || 0} onChange={(e) => setProp('borderWidth', Number(e.target.value))}
                  className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs" /></label>
              <ColField label="Border color" value={(p.borderColor as string) || '#ffffff'} />
            </div>
          </div>
        )}

        {element.type === 'button' && (
          <div className="space-y-2">
            <label><span className="text-[10px] text-zinc-400">Button text</span>
              <input value={(p.text as string) || ''} onChange={(e) => setProp('text', e.target.value)}
                className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs" /></label>
            <div className="grid grid-cols-2 gap-2">
              <ColField label="Bg color" value={(p.bgColor as string) || '#D4AF37'} />
              <ColField label="Text color" value={(p.textColor as string) || '#000000'} />
            </div>
            <label><span className="text-[10px] text-zinc-400">Border radius</span>
              <input type="number" value={(p.borderRadius as number) || 24} onChange={(e) => setProp('borderRadius', Number(e.target.value))}
                className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs" /></label>
          </div>
        )}

        {element.type === 'video' && (
          <label><span className="text-[10px] text-zinc-400">Video URL</span>
            <input value={(p.src as string) || ''} onChange={(e) => setProp('src', e.target.value)}
              className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs" placeholder="https://... .mp4" /></label>
        )}

        {element.type === 'divider' && (
          <ColField label="Color" value={(p.color as string) || '#ffffff'} />
        )}

        {element.type === 'icon' && (
          <div className="grid grid-cols-2 gap-2">
            <ColField label="Color" value={(p.color as string) || '#D4AF37'} />
            <label><span className="text-[10px] text-zinc-400">Size</span>
              <input type="number" value={(p.size as number) || 24} onChange={(e) => setProp('size', Number(e.target.value))}
                className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs" /></label>
          </div>
        )}
      </div>

      {/* Animation */}
      <div className="bg-zinc-50 rounded-lg p-3 space-y-2">
        <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Animation</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="col-span-2"><span className="text-[10px] text-zinc-400">Entrance</span>
            <select value={element.animation?.entrance || 'none'}
              onChange={(e) => {
                const anim: CanvasAnimation = element.animation || { entrance: 'fadeIn', duration: 0.5, delay: 0 };
                onChange({ animation: { ...anim, entrance: e.target.value as CanvasAnimation['entrance'] } });
              }}
              className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs">
              <option value="none">None</option>
              <option value="fadeIn">Fade In</option>
              <option value="slideUp">Slide Up</option>
              <option value="slideDown">Slide Down</option>
              <option value="slideLeft">Slide Left</option>
              <option value="slideRight">Slide Right</option>
              <option value="scaleIn">Scale In</option>
              <option value="rotateIn">Rotate In</option>
              <option value="bounceIn">Bounce In</option>
            </select></label>
          <label><span className="text-[10px] text-zinc-400">Duration (s)</span>
            <input type="number" step="0.1" min="0.1" value={element.animation?.duration ?? 0.5}
              onChange={(e) => onChange({ animation: { ...(element.animation || { entrance: 'fadeIn', delay: 0 }), duration: parseFloat(e.target.value) } })}
              className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs" /></label>
          <label><span className="text-[10px] text-zinc-400">Delay (s)</span>
            <input type="number" step="0.1" min="0" value={element.animation?.delay ?? 0}
              onChange={(e) => onChange({ animation: { ...(element.animation || { entrance: 'fadeIn', duration: 0.5 }), delay: parseFloat(e.target.value) } })}
              className="w-full px-2 py-1 rounded-md border border-zinc-300 text-xs" /></label>
        </div>
      </div>
    </div>
  );
}

export default MobileBuilderEditor;
