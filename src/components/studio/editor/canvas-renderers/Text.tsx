import type { FC, CSSProperties } from 'react';
import type { Node } from '@core/document';

const TextRenderer: FC<{ node: Node }> = ({ node }) => {
  const p = node.props ?? {};
  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: p.color != null ? String(p.color) : '#111827',
    fontSize: p.fontSize != null ? String(p.fontSize) : '16px',
    fontFamily: p.fontFamily != null ? String(p.fontFamily) : undefined,
    textAlign: p.textAlign != null ? (String(p.textAlign) as CSSProperties['textAlign']) : undefined,
    padding: 8,
    boxSizing: 'border-box',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };
  return <div style={style}>{String(p.text ?? '')}</div>;
};

export default TextRenderer;
