/**
 * Server-side invitation renderer — the wired caller of the OS publish circuit:
 * Document → Resolution Pipeline → Render Tree → HTML.
 *
 * DB-backed: any published project renders here. The hand-authored sample is a
 * fallback for SAMPLE_SLUG when no DB row exists (dev fixture / deterministic test).
 * The /os/[slug] route calls this and serves the resulting HTML.
 */

import { DEFAULT_THEME } from '../core/theme';
import { resolveDocument, type ResolveContext } from '../core/resolve';
import type { VarScopeInput } from '../core/variable';
import type { DataResolverInput } from '../core/data-source';
import type { Document } from '../core/document';
import { buildRenderTree } from './render-tree';
import { renderHtml, type HtmlOutput } from './html-adapter';
import { buildSampleInvitation, SAMPLE_SLUG } from '../os/sample-invitation';
import { loadDocumentBySlug } from '../db';

export { SAMPLE_SLUG };

/**
 * Render an invitation to a full HTML document via the OS publish path.
 * Looks up the project by slug in the DB; falls back to the sample for SAMPLE_SLUG.
 * Returns null if the slug is unknown.
 */
export function renderInvitationHtml(slug: string): HtmlOutput | null {
  const dbDoc = loadDocumentBySlug(slug);
  if (dbDoc) return renderDocument(dbDoc);
  if (slug === SAMPLE_SLUG) return renderDocument(buildSampleInvitation());
  return null;
}

/** Render any Document through the full publish pipeline (pure, no DB). */
export function renderDocument(doc: Document, title?: string): HtmlOutput {
  // Literal props → minimal context. DEFAULT_THEME drives the 3-layer token
  // cascade; `$token:` refs in node props resolve via step 5.
  const ctx: ResolveContext = {
    variables: {
      workspace: [], project: [], page: [], frame: [], runtime: [], system: [],
    } satisfies VarScopeInput,
    dataInput: { dataSources: [], tableRows: {} } satisfies DataResolverInput,
    theme: { defaultTheme: DEFAULT_THEME },
    tokens: {},
  };

  const resolved = resolveDocument(doc, ctx);
  const frameViewport = doc.project.pages[0]?.frames[0]?.viewport;
  const tree = buildRenderTree(resolved, '/', {
    viewport: frameViewport ? { w: frameViewport.w, h: frameViewport.h } : undefined,
  });
  return renderHtml(tree, { title: title ?? `${doc.project.name} — Undangan` });
}

