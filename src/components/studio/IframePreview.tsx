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
 *
 * Handles CSS sync reliably in both dev (inline <style>) and production
 * (external <link>) by waiting for external stylesheets to load before
 * activating the iframe. Fonts are injected as <link> elements directly
 * into the iframe head (avoids fragile @import-in-clone issues).
 */
export function IframePreview({ width, height, children, className }: IframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mountRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cancelled = false;
    let observer: MutationObserver | null = null;

    const setup = async () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      // 1. Viewport meta — sets the iframe's CSS viewport width
      const meta = doc.createElement('meta');
      meta.name = 'viewport';
      meta.content = `width=${width}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`;
      doc.head.appendChild(meta);

      // 2. Copy parent <link rel="stylesheet"> — wait for them to load
      const linkPromises: Promise<void>[] = [];
      document.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
        const clone = el.cloneNode(true) as HTMLLinkElement;
        doc.head.appendChild(clone);
        // Wait for external stylesheets to actually load
        if (clone.href && !clone.href.startsWith('blob:')) {
          linkPromises.push(new Promise((resolve) => {
            if (clone.sheet) { resolve(); return; }
            clone.onload = () => resolve();
            clone.onerror = () => resolve(); // don't block on failure
          }));
        }
      });

      // 3. Copy parent <style> elements (inline styles like globals.css)
      document.querySelectorAll('style').forEach((el) => {
        const clone = el.cloneNode(true) as HTMLStyleElement;
        doc.head.appendChild(clone);
      });

      // 4. Wait for external CSS to finish loading
      await Promise.all(linkPromises);
      if (cancelled) return;

      // 5. Reset body & create mount point
      doc.body.style.margin = '0';
      doc.body.style.padding = '0';
      const mount = doc.createElement('div');
      doc.body.appendChild(mount);
      mountRef.current = mount;

      setReady(true);

      // 6. Sync dynamically added styles (template injectStyles(), ThemeProvider, etc.)
      observer = new MutationObserver((mutations) => {
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
    };

    if (iframe.contentDocument?.readyState === 'complete') {
      setup();
    } else {
      iframe.addEventListener('load', setup);
    }

    return () => {
      cancelled = true;
      iframe.removeEventListener('load', setup);
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
