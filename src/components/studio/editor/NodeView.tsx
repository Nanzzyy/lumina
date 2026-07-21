'use client';

import { memo } from 'react';
import type { FC, CSSProperties } from 'react';
import type { Node } from '@core/document';
import { getCanvasRenderer } from './canvas-renderers/registry';

// ADR-014 §5: NodeView is a positioning + selection shell; content dispatched to
// the node's registered canvas renderer. E2: renders children recursively so
// nested/grouped nodes are visible and hittable on the canvas.

interface NodeViewProps {
  node: Node;
  selection: Set<string>;
  hoveredId: string | null;
  onPointerDown: (e: React.PointerEvent, nodeId: string) => void;
  onClick?: (nodeId: string) => void;
}

const NodeView: FC<NodeViewProps> = memo(function NodeViewFn({ node, selection, hoveredId, onPointerDown, onClick }) {
  if (node.hidden) return null;

  const Renderer = getCanvasRenderer(node.componentId);
  const isSelected = selection.has(node.id);
  const isHovered = hoveredId === node.id;
  const flipH = Boolean(node.props?.flipH);
  const flipV = Boolean(node.props?.flipV);
  const transform = node.frame.rotation
    ? `rotate(${node.frame.rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`
    : (flipH || flipV ? `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})` : undefined);
  const style: CSSProperties = {
    position: 'absolute',
    left: node.frame.x,
    top: node.frame.y,
    width: node.frame.w,
    height: node.frame.h,
    transform,
    opacity: Number(node.props?.opacity ?? node.frame.opacity ?? 1),
    cursor: node.locked ? 'default' : 'pointer',
    userSelect: 'none',
    overflow: 'hidden',
    outline: isSelected ? '2px solid #3b82f6' : isHovered ? '2px solid #93c5fd' : 'none',
    outlineOffset: 1,
    zIndex: node.z ?? 0,
  };

  return (
    <div
      id={`node-${node.id}`}
      style={style}
      onPointerDown={(e) => onPointerDown(e, node.id)}
      onClick={() => onClick?.(node.id)}
      data-node-id={node.id}
    >
      {Renderer ? <Renderer node={node} /> : <FallbackLabel node={node} />}
      {node.children?.map((child) => (
        <NodeView
          key={child.id}
          node={child}
          selection={selection}
          hoveredId={hoveredId}
          onPointerDown={onPointerDown}
          onClick={onClick}
        />
      ))}
    </div>
  );
});

function FallbackLabel({ node }: { node: Node }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        color: '#9ca3af',
        background: 'rgba(0,0,0,0.03)',
      }}
    >
      {node.componentId ?? node.name ?? node.id.slice(0, 8)}
    </div>
  );
}

export default NodeView;
