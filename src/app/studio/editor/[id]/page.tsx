'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEditorStore } from '@editor/store';
import Viewport from '@/components/studio/editor/Viewport';
import CanvasFrame from '@/components/studio/editor/CanvasFrame';
import Inspector from '@/components/studio/editor/Inspector';
import DataSourcePanel from '@/components/studio/editor/DataSourcePanel';
import TimelinePanel from '@/components/studio/editor/TimelinePanel';
import ThemePanel from '@/components/studio/editor/ThemePanel';
// TODO: golden-project is a local dev artifact, not committed to git
// import { GOLDEN_SPEC, buildGoldenProject } from '../../../../../bench/golden-project';
const GOLDEN_SPEC = {};
function buildGoldenProject() { return {}; }
import { resolveResponsiveFrame } from '@core/responsive';
import { DEVICE_VIEWPORTS } from '@core/responsive';
import type { DeviceKey } from '@core/responsive';
import { resolveConstraintFrame } from '@core/constraints';
import type { Document } from '@core/document';
import { findNode } from '@core/document';
import { listComponents, createNodeFromDef } from '@editor/component-registry';
import { registerBuiltinComponents } from '@/components/studio/editor/register-builtin-components';
import LayerPanel from '@/components/studio/editor/LayerPanel';
import { buildSampleInvitation } from '@/lib/os/sample-invitation';

// Register first-party primitive plugins once (idempotent).
registerBuiltinComponents();

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const setDoc = useEditorStore((s) => s.setDoc);
  const doc = useEditorStore((s) => s.doc);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past.length);
  const future = useEditorStore((s) => s.future.length);
  const selection = useEditorStore((s) => s.selection);
  const camera = useEditorStore((s) => s.camera);
  const tool = useEditorStore((s) => s.ui.tool);
  const setTool = useEditorStore((s) => s.setTool);
  const addNode = useEditorStore((s) => s.addNode);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);
  const alignSelected = useEditorStore((s) => s.alignSelected);
  const distributeSelected = useEditorStore((s) => s.distributeSelected);
  const flipSelected = useEditorStore((s) => s.flipSelected);

  const [loaded, setLoaded] = useState(false);
  const [projectId] = useState(params.id);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [currentDevice, setCurrentDevice] = useState<DeviceKey>('base');

  // E1: load saved doc from localStorage; else the sample invitation (real 6-node
  // content). `benchmark` id loads the 1000-node golden fixture for perf checks.
  // ponytail: real DB-backed project loader (read projects/pages/frames).
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => {
    const key = `lumina:doc:${projectId}`;
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (saved) {
      try { setDoc(JSON.parse(saved) as Document); setLoaded(true); return; } catch { /* fall through */ }
    }
    const doc = projectId === 'benchmark' ? buildGoldenProject(GOLDEN_SPEC) : buildSampleInvitation();
    setDoc(doc);
    setLoaded(true);
  }, [projectId, setDoc]);

  const handleSave = useCallback(async () => {
    if (saving || !doc) return;
    setSaving(true);
    try {
      // Draft auto-save stays local; Publish writes the DB (live at /os/[slug]).
      window.localStorage.setItem(`lumina:doc:${projectId}`, JSON.stringify(doc));
    } catch {
      console.error('[editor] save failed');
    } finally {
      setSaving(false);
    }
  }, [doc, saving, projectId]);

  // Publish: persist the Document to the DB via the auth-gated save API so it
  // renders at /os/[slug]. localStorage continues to hold the working draft.
  const handlePublish = useCallback(async () => {
    if (publishing || !doc) return;
    setPublishing(true);
    setPublishStatus(null);
    const slug = doc.project.slug;
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.status === 401) setPublishStatus('Login required');
      else if (!res.ok) setPublishStatus('Publish failed');
      else setPublishStatus(`Live → /os/${slug}`);
    } catch {
      setPublishStatus('Publish failed');
    } finally {
      setPublishing(false);
    }
  }, [doc, publishing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        const st = useEditorStore.getState();
        if (e.shiftKey) st.ungroupSelected();
        else st.groupSelected();
      }
      if (e.key === 'Escape') {
        useEditorStore.getState().clearSelection();
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const sel = useEditorStore.getState().selection;
        if (sel.size > 0) {
          e.preventDefault();
          useEditorStore.getState().deleteSelected();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  const activeFrame = doc?.project?.pages?.[0]?.frames?.[0];
  const activeNodeId = selection.size === 1 ? Array.from(selection)[0] : null;
  // E2: recursive lookup so selecting a nested child (via canvas or LayerPanel)
  // resolves to the right node for the Inspector.
  const activeNode = activeNodeId && doc ? findNode(doc, activeNodeId) : null;

  // ADR-019: Resolve frame against the selected device's responsive overrides,
  // then apply constraint pins (E6) so pinned nodes reposition on device resize.
  // All hooks run unconditionally BEFORE the `!loaded` early return so the hook
  // order is stable across renders (Rules of Hooks).
  const resolvedNodes = useMemo(() => {
    if (!activeFrame) return [];
    const baseW = activeFrame.viewport.w;
    const baseH = activeFrame.viewport.h;
    const dv = currentDevice === 'base' ? null : DEVICE_VIEWPORTS[currentDevice];
    return activeFrame.nodes.map((node) => {
      let frame = resolveResponsiveFrame(node.frame, node.responsive, currentDevice);
      if (node.constraints && dv && (dv.w !== baseW || dv.h !== baseH)) {
        frame = resolveConstraintFrame(frame, node.constraints, baseW, baseH, dv.w, dv.h);
      }
      return { ...node, frame };
    });
  }, [activeFrame, currentDevice]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen text-sm text-zinc-400">
        Loading editor…
      </div>
    );
  }

  // Device viewport
  const deviceVw = currentDevice === 'base' ? 390 : (DEVICE_VIEWPORTS[currentDevice]?.w ?? 390);
  const deviceVh = currentDevice === 'base' ? 844 : (DEVICE_VIEWPORTS[currentDevice]?.h ?? 844);

  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 bg-white text-xs text-zinc-600">
        <span className="font-medium text-zinc-800 mr-2">Lumina Studio</span>
        <ToolBtn active={tool === 'select'} onClick={() => setTool('select')}>Select</ToolBtn>
        <ToolBtn active={tool === 'pan'} onClick={() => setTool('pan')}>Pan</ToolBtn>
        <div className="w-px h-4 bg-zinc-200 mx-1" />
        {listComponents().map((def) => (
          <button
            key={def.id}
            onClick={() => addNode(createNodeFromDef(def))}
            className="px-2 py-1 rounded hover:bg-zinc-100"
          >
            + {def.name}
          </button>
        ))}
        <div className="w-px h-4 bg-zinc-200 mx-1" />
        {/* E3 Arrange: align/distribute (≥2), flip (≥1) */}
        {selection.size >= 2 && (
          <>
            <ArrangeBtn title="Align left" onClick={() => alignSelected('left')}>L</ArrangeBtn>
            <ArrangeBtn title="Align center H" onClick={() => alignSelected('centerH')}>C</ArrangeBtn>
            <ArrangeBtn title="Align right" onClick={() => alignSelected('right')}>R</ArrangeBtn>
            <ArrangeBtn title="Align top" onClick={() => alignSelected('top')}>T</ArrangeBtn>
            <ArrangeBtn title="Align middle" onClick={() => alignSelected('middle')}>M</ArrangeBtn>
            <ArrangeBtn title="Align bottom" onClick={() => alignSelected('bottom')}>B</ArrangeBtn>
            <div className="w-px h-4 bg-zinc-200 mx-1" />
            <ArrangeBtn title="Distribute horizontal" onClick={() => distributeSelected('h')}>⇆</ArrangeBtn>
            <ArrangeBtn title="Distribute vertical" onClick={() => distributeSelected('v')}>⇅</ArrangeBtn>
            <div className="w-px h-4 bg-zinc-200 mx-1" />
          </>
        )}
        {selection.size >= 1 && (
          <>
            <ArrangeBtn title="Flip horizontal" onClick={() => flipSelected('h')}>Mirror H</ArrangeBtn>
            <ArrangeBtn title="Flip vertical" onClick={() => flipSelected('v')}>Mirror V</ArrangeBtn>
            <div className="w-px h-4 bg-zinc-200 mx-1" />
          </>
        )}
        <button onClick={undo} disabled={past === 0} className="px-2 py-1 rounded hover:bg-zinc-100 disabled:opacity-30">↩</button>
        <button onClick={redo} disabled={future === 0} className="px-2 py-1 rounded hover:bg-zinc-100 disabled:opacity-30">↪</button>
        <div className="w-px h-4 bg-zinc-200 mx-1" />
        {/* ADR-019: Device switcher */}
        <select
          value={currentDevice}
          onChange={(e) => setCurrentDevice(e.target.value as DeviceKey)}
          className="px-2 py-1 rounded border border-zinc-300 text-xs"
        >
          {Object.entries(DEVICE_VIEWPORTS).map(([key, dv]) => (
            <option key={key} value={key}>{dv.label} ({dv.w}×{dv.h})</option>
          ))}
          <option value="custom">Custom</option>
        </select>
        <div className="w-px h-4 bg-zinc-200 mx-1" />
        <span className="text-zinc-400">{Math.round(camera.zoom * 100)}%</span>
        <div className="w-px h-4 bg-zinc-200 mx-1" />
        <span className="text-zinc-400">{selection.size} selected</span>
        <div className="flex-1" />
        <button onClick={handleSave} disabled={saving}
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 text-xs">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={handlePublish} disabled={publishing}
          className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 text-xs">
          {publishing ? 'Publishing…' : 'Publish'}
        </button>
        {publishStatus && <span className="text-[10px] text-zinc-400">{publishStatus}</span>}
      </div>

      {/* Main area: layers + canvas + right panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Layers (scene-graph tree) */}
        <div className="w-56 flex-shrink-0 bg-white border-r border-zinc-200 overflow-y-auto p-3">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Layers</h3>
          {activeFrame && <LayerPanel nodes={activeFrame.nodes} />}
        </div>
        <div className="flex-1 overflow-hidden">
          {/* Canvas world == frame size; the frame sits at world (0,0) so
              Viewport's zoomToFit (which centers [0..w]×[0..h]) actually aligns
              with the content. CanvasFrame self-styles (white bg + shadow). */}
          <Viewport worldW={deviceVw} worldH={deviceVh} framesAreaW={deviceVw} framesAreaH={deviceVh}>
            {activeFrame && (
              <CanvasFrame
                nodes={resolvedNodes}
                doc={doc}
                viewportW={deviceVw}
                viewportH={deviceVh}
              />
            )}
          </Viewport>
        </div>

        {/* Right sidebar with panels */}
        <div className="w-72 flex-shrink-0 bg-white border-l border-zinc-200 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Inspector */}
            {activeNode && (
              <Inspector
                node={activeNode}
                device={currentDevice}
                onDeviceChange={setCurrentDevice}
              />
            )}
            {!activeNode && (
              <p className="text-xs text-zinc-400 text-center py-8">Select a node to edit properties</p>
            )}

            {/* Data Sources */}
            <div className="border-t border-zinc-100 pt-4">
              <DataSourcePanel />
            </div>

            {/* Theme */}
            <div className="border-t border-zinc-100 pt-4">
              <ThemePanel />
            </div>

            {/* Timeline */}
            <div className="border-t border-zinc-100 pt-4">
              <TimelinePanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs ${active ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-zinc-100'}`}
    >
      {children}
    </button>
  );
}

function ArrangeBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="px-1.5 py-1 rounded hover:bg-zinc-100 text-xs text-zinc-600"
    >
      {children}
    </button>
  );
}
