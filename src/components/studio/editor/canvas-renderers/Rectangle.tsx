import type { FC, CSSProperties } from 'react';
import type { Node } from '@core/document';

const RectangleRenderer: FC<{ node: Node }> = ({ node }) => {
  const p = node.props ?? {};
  const borderWidth = Number(p.borderWidth ?? 0);
  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    background: p.backgroundColor != null ? String(p.backgroundColor) : 'transparent',
    borderRadius: p.borderRadius != null ? String(p.borderRadius) : undefined,
    border: borderWidth > 0
      ? `${borderWidth}px solid ${p.borderColor != null ? String(p.borderColor) : '#000000'}`
      : undefined,
    boxShadow: p.boxShadow != null && p.boxShadow !== 'none' ? String(p.boxShadow) : undefined,
  };
  return <div style={style} />;
};

export default RectangleRenderer;
