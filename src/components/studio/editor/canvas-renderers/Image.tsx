import type { FC, CSSProperties } from 'react';
import type { Node } from '@core/document';

const ImageRenderer: FC<{ node: Node }> = ({ node }) => {
  const p = node.props ?? {};
  const radius = p.borderRadius != null ? String(p.borderRadius) : undefined;

  if (!p.image) {
    return <div style={{ width: '100%', height: '100%', background: '#f3f4f6', borderRadius: radius }} />;
  }

  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: (p.objectFit != null ? String(p.objectFit) : 'cover') as CSSProperties['objectFit'],
    borderRadius: radius,
    display: 'block',
  };
  return <img src={String(p.image)} alt="" draggable={false} style={style} />;
};

export default ImageRenderer;
