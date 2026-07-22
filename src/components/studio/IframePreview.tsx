'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

interface IframePreviewProps {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
}

export function IframePreview({ width, height, children, className }: IframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rootRef = useRef<Root | null>(null);
  const childrenRef = useRef<ReactNode>(children);
  childrenRef.current = children;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const setup = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      // Viewport meta
      const existing = doc.querySelector('meta[name="viewport"]');
      if (existing) existing.remove();
      const meta = doc.createElement('meta');
      meta.name = 'viewport';
      meta.content = `width=${width}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`;
      doc.head.appendChild(meta);

      // Copy all parent stylesheets into iframe
      const parentStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
      parentStyles.forEach((el) => {
        doc.head.appendChild(el.cloneNode(true));
      });

      // Reset body
      doc.body.style.margin = '0';
      doc.body.style.padding = '0';

      // Create React root inside iframe
      const root = createRoot(doc.body);
      rootRef.current = root;
      root.render(childrenRef.current);

      // Sync any dynamically added styles (e.g. template injectStyles())
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node instanceof HTMLStyleElement) {
              const existingById = node.id ? doc.getElementById(node.id) : null;
              if (!existingById) {
                doc.head.appendChild(node.cloneNode(true));
              }
            } else if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
              doc.head.appendChild(node.cloneNode(true));
            }
          }
        }
      });
      observer.observe(document.head, { childList: true });

      // Store observer for cleanup
      (iframe as any).__styleObserver = observer;
    };

    iframe.addEventListener('load', setup);
    // Iframe may already be loaded
    if (iframe.contentDocument?.readyState === 'complete') {
      setup();
    }

    return () => {
      iframe.removeEventListener('load', setup);
      const observer = (iframe as any).__styleObserver as MutationObserver | undefined;
      observer?.disconnect();
      rootRef.current?.unmount();
      rootRef.current = null;
    };
  }, [width, height]);

  // Re-render on content changes
  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.render(children);
    }
  }, [children]);

  return (
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
  );
}
