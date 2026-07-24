/**
 * Server-side initialization for external template packages.
 *
 * This module MUST remain server-only — it imports Node.js `fs`.
 * It is imported only by server entry points (not client components).
 *
 * External templates are JSON manifest files in the `templates/` directory:
 *   templates/
 *     my-template/
 *       manifest.json    # id, name, description, colors, fonts, decorations
 *
 * Configure via TEMPLATES_PATH environment variable.
 * Default: process.cwd() + '/templates'
 */

import fs from 'fs';
import path from 'path';
import { registerTemplate, getTemplate } from '@/lib/template';

interface ExternalTemplateManifest {
  id: string;
  name: string;
  description: string;
  kind?: 'composed';
  category?: 'wedding' | 'event' | 'mobile';
  mode?: 'couple' | 'solo';
  colors: Record<string, string>;
  fonts?: { heading?: string; body?: string; accent?: string };
  decorations?: Array<{
    id: string;
    type: string;
    layer: 'behind' | 'overlay' | 'floating';
    anchor: 'global' | number;
    props?: Record<string, unknown>;
    hiddenMobile?: boolean;
  }>;
}

function getTemplatesDir(): string {
  return process.env.TEMPLATES_PATH ?? path.join(process.cwd(), 'templates');
}

/**
 * Load all external template packages into the registry.
 * Silently skips invalid/missing packages.
 */
export function loadExternalTemplates(): void {
  const dir = getTemplatesDir();
  if (!fs.existsSync(dir)) {
    console.log(`[ExternalTemplates] Directory not found: ${dir} (skipping)`);
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;

    const pkgDir = path.join(dir, entry.name);
    const manifestPath = path.join(pkgDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) continue;

    try {
      const raw = fs.readFileSync(manifestPath, 'utf-8');
      const manifest: ExternalTemplateManifest = JSON.parse(raw);

      if (!manifest.id || !manifest.name || !manifest.colors) continue;
      if (getTemplate(manifest.id)) {
        console.warn(`[ExternalTemplates] Skipping "${entry.name}": id "${manifest.id}" already registered`);
        continue;
      }

      const headingFont = manifest.fonts?.heading || '"Playfair Display", Georgia, serif';
      const bodyFont = manifest.fonts?.body || '"Inter", system-ui, sans-serif';

      registerTemplate({
        id: manifest.id,
        name: manifest.name,
        description: manifest.description,
        kind: 'composed',
        category: manifest.category ?? 'wedding',
        mode: manifest.mode ?? 'couple',
        theme: {
          colors: { ...manifest.colors, error: '#dc2626', success: '#16a34a' },
          typography: {
            'font-heading': headingFont,
            'font-body': bodyFont,
            'font-accent': manifest.fonts?.accent || headingFont,
          },
        },
        decorations: manifest.decorations?.length
          ? manifest.decorations
          : [{
              id: `${manifest.id}-bg`,
              type: 'floral-decoration',
              layer: 'behind',
              anchor: 'global',
              props: { position: 'top-right', color: manifest.colors.primary, opacity: 0.06 },
            }],
      });

      count++;
      console.log(`[ExternalTemplates] Loaded: "${manifest.id}" (${manifest.name})`);
    } catch (err) {
      console.warn(`[ExternalTemplates] Error loading "${entry.name}":`, err);
    }
  }

  if (count > 0) {
    console.log(`[ExternalTemplates] Loaded ${count} external template(s)`);
  }
}
