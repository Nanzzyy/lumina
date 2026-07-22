'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface IframePreviewProps {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
}

/**
 * Renders children inside an iframe for proper viewport isolation.
 * Uses createPortal so the React tree stays in the parent — state updates
 * propagate instantly (real-time preview), while CSS viewport units and
 * position:fixed are scoped to the iframe dimensions.
 */
export function IframePreview({ width, height, children, className }: IframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mountRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const setup = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      // Viewport meta — sets the iframe's CSS viewport width
      const meta = doc.createElement('meta');
      meta.name = 'viewport';
      meta.content = `width=${width}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`;
      doc.head.appendChild(meta);

      // Copy all parent stylesheets (Tailwind + injected styles)
      const parentStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
      parentStyles.forEach((el) => {
        doc.head.appendChild(el.cloneNode(true));
      });

      // Reset body
      doc.body.style.margin = '0';
      doc.body.style.padding = '0';

      // Create mount point for the portal
      const mount = doc.createElement('div');
      doc.body.appendChild(mount);
      mountRef.current = mount;

      setReady(true);

      // Sync dynamically added styles (template injectStyles())
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node instanceof HTMLStyleElement) {
              const existingById = node.id ? doc.getElementById(node.id) : null;
              if (!existingById) {
                doc.head.appendChild(node.cloneNode(true));
              }
            } else if (node instanceof HTMLLinkElement && (node as HTMLLinkElement).rel === 'stylesheet') {
              doc.head.appendChild(node.cloneNode(true));
            }
          }
        }
      });
      observer.observe(document.head, { childList: true });
      (iframe as any).__styleObserver = observer;
    };

    // Wait for iframe to be ready
    if (iframe.contentDocument?.readyState === 'complete') {
      setup();
    } else {
      iframe.addEventListener('load', setup);
    }

    return () => {
      iframe.removeEventListener('load', setup);
      const observer = (iframe as any).__styleObserver as MutationObserver | undefined;
      observer?.disconnect();
      mountRef.current = null;
      setReady(false);
    };
  }, [width, height]);

  return (
    <>
      <iframe
        ref={iframeRef}
        className={className}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: 'none',
          borderRadius: '0 0 12px 12px',
          display: 'block',
        }}
        title="Mobile Preview"
      />
      {ready && mountRef.current && createPortal(children, mountRef.current)}
    </>
  );
}
