/**
 * HTML Target Adapter — ADR-021.
 *
 * Converts Render Tree IR → HTML string with inlined CSS + asset references.
 * Wraps the zero-JS TreeRenderer engine under the hood. Produces a complete
 * HTML document suitable for static hosting or further bundling (zip/pwa/amp).
 *
 * Pure: no React runtime at publish time.
 */

import type { RenderTree, RenderNode, RenderPage } from './render-tree';

export interface HtmlOutput {
  /** Full HTML document as a string. */
  html: string;
  /** External CSS links (if not inlined). */
  cssLinks: string[];
  /** JS runtime bundle requirements. */
  needsRuntime: boolean;
  /** Pages generated (one per render page). */
  pages: { route: string; content: string }[];
}

export interface HtmlOptions {
  /** Title for the HTML <title> element. */
  title?: string;
  /** Base URL for asset paths. */
  baseUrl?: string;
  /** Inline CSS (<style>) vs external (<link>). Default: inline. */
  inlineCss?: boolean;
  /** Minify HTML output. Default: false. */
  minify?: boolean;
}

const DEFAULTS: HtmlOptions = {
  baseUrl: '/',
  inlineCss: true,
  minify: false,
};

/**
 * Build an HTML document from the Render Tree.
 * Generates one <section> per render node, wrapped in a CSS-grid layout
 * matching the existing TreeRenderer output style.
 */
export function renderHtml(tree: RenderTree, options?: HtmlOptions): HtmlOutput {
  const opts = { ...DEFAULTS, ...options };
  const pages: { route: string; content: string }[] = [];

  for (const page of tree.pages) {
    const body = page.nodes.map((node) => renderNodeHtml(node, 0, opts)).join('\n');
    const styles = buildGlobalStyles(page);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${page.seo?.title ? `<title>${escapeHtml(page.seo.title)}</title>` : ''}
  ${page.seo?.description ? `<meta name="description" content="${escapeHtml(page.seo.description)}" />` : ''}
  ${opts.inlineCss ? `<style>${styles}</style>` : `<link rel="stylesheet" href="/style.css" />`}
</head>
<body>
  <div class="lumina-root">${body}</div>
  ${needsRuntime(page) ? '<script src="/runtime.js" defer></script>' : ''}
</body>
</html>`;

    pages.push({ route: page.route ?? '/', content: opts.minify ? minifyHtml(html) : html });
  }

  return {
    html: pages[0]?.content ?? '',
    cssLinks: opts.inlineCss ? [] : ['/style.css'],
    needsRuntime: tree.pages.some((p) => needsRuntime(p)),
    pages,
  };
}

function needsRuntime(page: RenderPage): boolean {
  const walk = (nodes: RenderNode[]): boolean => {
    for (const n of nodes) {
      if (n.needsHydration) return true;
      if (n.children && walk(n.children)) return true;
    }
    return false;
  };
  return walk(page.nodes);
}

function renderNodeHtml(node: RenderNode, depth: number, opts: HtmlOptions): string {
  const tag = nodeTag(node);
  const attrs = nodeAttrs(node);
  const children = node.children?.map((c) => renderNodeHtml(c, depth + 1, opts)).join('\n') ?? '';
  const content = node.content?.text ?? node.content?.title ?? '';

  if (!children && !content) {
    return `<${tag}${attrs}></${tag}>`;
  }

  return `<${tag}${attrs}>${escapeHtml(String(content))}${children ? `\n${children}` : ''}</${tag}>`;
}

function nodeTag(node: RenderNode): string {
  switch (node.kind) {
    case 'frame': return 'section';
    case 'section': return 'section';
    case 'container': return 'div';
    case 'text': return node.content?.title ? 'h2' : 'p';
    case 'image': return 'img';
    case 'video': return 'video';
    case 'button': return 'button';
    case 'stack': return 'div';
    case 'grid': return 'div';
    case 'divider': return 'hr';
    case 'shape': return 'div';
    case 'icon': return 'span';
    case 'countdown': return 'div';
    case 'music': return 'div';
    case 'rsvp-form': return 'div';
    default: return 'div';
  }
}

function nodeAttrs(node: RenderNode): string {
  const parts: string[] = [];
  const s = node.style;

  // Style as inline or data attributes
  const styleStr = Object.entries(s)
    .filter(([_, v]) => v != null && v !== '')
    .map(([k, v]) => `${cssProp(k)}: ${v}`)
    .join('; ');

  if (styleStr) parts.push(`style="${escapeHtml(styleStr)}"`);

  // Data attributes for runtime hydration
  if (node.needsHydration) {
    parts.push('data-lumina-hydrate');
  }
  if (node.aria?.label) parts.push(`aria-label="${escapeHtml(node.aria.label)}"`);
  if (node.aria?.hidden) parts.push('aria-hidden="true"');
  if (node.aria?.role) parts.push(`role="${escapeHtml(node.aria.role)}"`);
  if (node.id) parts.push(`id="${escapeHtml(node.id)}"`);

  // Self-closing
  if (node.kind === 'image' && node.content?.image) {
    parts.push(`src="${escapeHtml(String(node.content.image))}"`);
    parts.push('alt=""'); // ponytail: real alt text
  }
  if (node.kind === 'video' && node.content?.video) {
    parts.push(`src="${escapeHtml(String(node.content.video))}"`);
  }

  // Class
  parts.push(`class="lumina-node lumina-${node.kind}"`);

  return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

function buildGlobalStyles(page: RenderPage): string {
  return page.nodes
    .map((node) => nodeToCss(node))
    .concat('.lumina-root { position: relative; width: 384px; max-width: 100%; min-height: 728px; margin: 0 auto; box-sizing: border-box; overflow: hidden; }')
    .concat('.lumina-node { box-sizing: border-box; }')
    .concat('.lumina-button { display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: none; text-decoration: none; }')
    .join('\n');
}

function nodeToCss(node: RenderNode): string {
  let css = '';
  const childrenCss = node.children?.map((c) => nodeToCss(c)).join('\n') ?? '';
  return css + childrenCss;
}

function cssProp(k: string): string {
  // Convert camelCase to kebab-case
  return k.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function minifyHtml(html: string): string {
  return html
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n/g, '');
}
