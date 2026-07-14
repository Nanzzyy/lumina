'use client';

import { useState, useCallback, useRef } from 'react';
import type { SectionConfig, SectionType } from '@/lib/template/types';
import type { ContainerConfig, ContainerType } from '@/lib/layout/types';

// ─── Section Palette ──────────────────────────────────────

const availableSections: { type: SectionType; label: string; icon: string }[] = [
  { type: 'cover', label: 'Cover', icon: '📔' },
  { type: 'hero', label: 'Hero', icon: '✨' },
  { type: 'quote', label: 'Quote', icon: '💬' },
  { type: 'countdown', label: 'Countdown', icon: '⏱️' },
  { type: 'story', label: 'Story', icon: '📖' },
  { type: 'gallery', label: 'Gallery', icon: '🖼️' },
  { type: 'timeline', label: 'Timeline', icon: '📋' },
  { type: 'maps', label: 'Maps', icon: '📍' },
  { type: 'rsvp', label: 'RSVP', icon: '✉️' },
  { type: 'gift', label: 'Gift', icon: '🎁' },
  { type: 'guestbook', label: 'Guestbook', icon: '📝' },
  { type: 'footer', label: 'Footer', icon: '🏁' },
];

const containerTypes: { type: ContainerType; label: string }[] = [
  { type: 'hero-banner', label: 'Hero Banner' },
  { type: 'full-width', label: 'Full Width' },
  { type: 'contained', label: 'Contained' },
  { type: 'split', label: 'Split (2 Col)' },
  { type: 'card', label: 'Card' },
  { type: 'grid', label: 'Grid' },
  { type: 'carousel', label: 'Carousel' },
];

// ─── Default Container ────────────────────────────────────

function defaultContainer(type: SectionType, id: string): ContainerConfig {
  if (type === 'cover' || type === 'hero') return { id, type: 'hero-banner' };
  if (type === 'gallery') return { id, type: 'grid', columns: 3 };
  if (type === 'story') return { id, type: 'contained' };
  if (type === 'quote' || type === 'gift' || type === 'rsvp') return { id, type: 'card' };
  if (type === 'timeline' || type === 'maps' || type === 'guestbook') return { id, type: 'contained' };
  if (type === 'countdown') return { id, type: 'contained' };
  return { id, type: 'contained' };
}

// ─── LayoutBuilder Component ──────────────────────────────

interface LayoutBuilderProps {
  initialSections?: SectionConfig[];
  initialContainers?: ContainerConfig[];
  initialName?: string;
  initialDescription?: string;
  onSave?: (data: { name: string; description: string; sections: SectionConfig[]; containers: ContainerConfig[]; animation?: { preset: string; duration?: number; delay?: number; stagger?: number } }) => void;
  onPreview?: () => void;
  readOnly?: boolean;
}

export function LayoutBuilder({
  initialSections,
  initialContainers,
  initialName,
  initialDescription,
  onSave,
  onPreview,
  readOnly,
}: LayoutBuilderProps) {
  const [sections, setSections] = useState<SectionConfig[]>(initialSections || []);
  const [containers, setContainers] = useState<ContainerConfig[]>(initialContainers || []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [animation, setAnimation] = useState('fade-up');
  const [name, setName] = useState(initialName || '');
  const [description, setDescription] = useState(initialDescription || '');

  const addSection = useCallback((type: SectionType, atIndex?: number) => {
    const id = `${type}-${Date.now().toString(36)}`;
    const newSection: SectionConfig = { id, type };
    const newContainer = defaultContainer(type, id);

    setSections((prev) => {
      const next = [...prev];
      if (atIndex !== undefined && atIndex >= 0 && atIndex <= next.length) {
        next.splice(atIndex, 0, newSection);
      } else {
        next.push(newSection);
      }
      return next;
    });

    setContainers((prev) => {
      const next = [...prev];
      if (atIndex !== undefined && atIndex >= 0 && atIndex <= next.length) {
        next.splice(atIndex, 0, newContainer);
      } else {
        next.push(newContainer);
      }
      return next;
    });

    setSelectedIndex(atIndex ?? sections.length);
  }, [sections.length]);

  const removeSection = useCallback((index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
    setContainers((prev) => prev.filter((_, i) => i !== index));
    setSelectedIndex(null);
  }, []);

  const moveSection = useCallback((from: number, to: number) => {
    setSections((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setContainers((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setSelectedIndex(to);
  }, []);

  const updateContainer = useCallback((index: number, patch: Partial<ContainerConfig>) => {
    setContainers((prev) => prev.map((c, i) => i === index ? { ...c, ...patch } : c));
  }, []);

  const toggleHidden = useCallback((index: number) => {
    setSections((prev) => prev.map((s, i) => i === index ? { ...s, hidden: !s.hidden } : s));
  }, []);

  const selectedSection = selectedIndex !== null ? sections[selectedIndex] : null;
  const selectedContainer = selectedIndex !== null ? containers[selectedIndex] : null;

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Section Palette */}
      <div className="w-48 flex-shrink-0 bg-white border border-zinc-200 rounded-xl p-3 overflow-y-auto">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sections</h3>
        <div className="space-y-1">
          {availableSections.map((s) => (
            <button
              key={s.type}
              onClick={() => addSection(s.type)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-[var(--colors-primary-light)] hover:text-[var(--colors-primary)] transition-colors flex items-center gap-2"
              disabled={readOnly}
            >
              <span className="text-base">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layout Canvas + Preview */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-xl flex flex-col">
        <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Layout name..."
              className="px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] w-48"
              disabled={readOnly}
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              className="px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] w-64 text-zinc-500"
              disabled={readOnly}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={animation}
              onChange={(e) => setAnimation(e.target.value)}
              className="px-2 py-1 text-xs border border-zinc-300 rounded-lg"
              disabled={readOnly}
            >
              <option value="fade-up">Fade Up</option>
              <option value="fade-in">Fade In</option>
              <option value="scale-in">Scale In</option>
              <option value="slide-up">Slide Up</option>
              <option value="none">None</option>
            </select>
            {onPreview && (
              <button onClick={onPreview} className="px-3 py-1.5 text-xs bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200">
                Preview
              </button>
            )}
            {!readOnly && onSave && (
              <button
                onClick={() => onSave({ name, description, sections, containers, animation: { preset: animation } })}
                className="px-4 py-1.5 text-xs bg-[var(--colors-primary)] text-white rounded-lg hover:bg-[var(--colors-primary-hover)]"
              >
                Save Layout
              </button>
            )}
          </div>
        </div>

        {/* Drop zone */}
        <div
          className="flex-1 overflow-y-auto p-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('section-type') as SectionType;
            if (type) {
              const dropIndex = dragOverIndex ?? sections.length;
              addSection(type, dropIndex);
              setDragOverIndex(null);
            }
          }}
        >
          {sections.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-zinc-400 text-sm mb-2">Drag sections from the palette here</p>
                <p className="text-xs text-zinc-300">Or click sections in the palette to add them</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => {
                const container = containers[index];
                return (
                  <div
                    key={section.id}
                    draggable={!readOnly}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(index));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDragOverIndex(index);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = parseInt(e.dataTransfer.getData('text/plain'));
                      if (!isNaN(from) && from !== index) {
                        moveSection(from, index);
                      }
                      setDragOverIndex(null);
                    }}
                    onClick={() => setSelectedIndex(index)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedIndex === index
                        ? 'border-[var(--colors-primary)] bg-[var(--colors-primary-light)]/50'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    } ${section.hidden ? 'opacity-50' : ''} ${
                      dragOverIndex === index ? 'border-dashed border-[var(--colors-primary)]/50 bg-[var(--colors-primary-light)]/20' : ''
                    }`}
                  >
                    {/* Drag handle */}
                    <div className="flex items-center gap-1 text-zinc-300 cursor-grab" title="Drag to reorder">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>
                    </div>

                    {/* Up/Down arrows */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (index > 0) moveSection(index, index - 1); }}
                        disabled={index === 0 || readOnly}
                        className="text-zinc-300 hover:text-zinc-500 disabled:opacity-20"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (index < sections.length - 1) moveSection(index, index + 1); }}
                        disabled={index === sections.length - 1 || readOnly}
                        className="text-zinc-300 hover:text-zinc-500 disabled:opacity-20"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>

                    {/* Index number */}
                    <span className="w-6 h-6 rounded-full bg-[var(--colors-primary)]/10 text-[var(--colors-primary)] text-xs font-medium flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>

                    {/* Section info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-800 capitalize">{section.type}</span>
                        {section.hidden && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">Hidden</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {container && (
                          <span className="text-[10px] text-zinc-400">{container.type}</span>
                        )}
                        {container?.columns && container.columns !== 3 && (
                          <span className="text-[10px] text-zinc-400">{container.columns} cols</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleHidden(index)}
                        className="p-1 text-zinc-300 hover:text-zinc-500 rounded"
                        title={section.hidden ? 'Show' : 'Hide'}
                        disabled={readOnly}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {section.hidden
                            ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></>
                            : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                          }
                        </svg>
                      </button>
                      <button
                        onClick={() => removeSection(index)}
                        className="p-1 text-zinc-300 hover:text-red-500 rounded"
                        title="Remove"
                        disabled={readOnly}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Container Property Panel */}
      <div className="w-64 flex-shrink-0 bg-white border border-zinc-200 rounded-xl p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Properties</h3>

        {selectedSection && selectedContainer ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Section</label>
              <p className="text-sm font-medium text-zinc-800 capitalize">{selectedSection.type}</p>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Container Type</label>
              <select
                value={selectedContainer.type}
                onChange={(e) => updateContainer(selectedIndex!, { type: e.target.value as ContainerType })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]"
                disabled={readOnly}
              >
                {containerTypes.map((ct) => (
                  <option key={ct.type} value={ct.type}>{ct.label}</option>
                ))}
              </select>
            </div>

            {selectedContainer.type === 'grid' && (
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Columns</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateContainer(selectedIndex!, { columns: n })}
                      disabled={readOnly}
                      className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                        (selectedContainer.columns || 3) === n
                          ? 'bg-[var(--colors-primary)] text-white border-[var(--colors-primary)]'
                          : 'border-zinc-300 text-zinc-500 hover:border-zinc-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedContainer.type === 'split' && (
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Variant</label>
                <select
                  value={selectedContainer.variant || 'image-left'}
                  onChange={(e) => updateContainer(selectedIndex!, { variant: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]"
                  disabled={readOnly}
                >
                  <option value="image-left">Image Left</option>
                  <option value="image-right">Image Right</option>
                  <option value="text-left">Text Left</option>
                  <option value="text-right">Text Right</option>
                </select>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">Click a section to edit its properties.</p>
        )}
      </div>
    </div>
  );
}
