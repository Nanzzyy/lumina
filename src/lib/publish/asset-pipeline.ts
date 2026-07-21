/**
 * Asset Pipeline — ADR-022.
 *
 * Extends the content-addressed storage (ADR-009) with optimization, encoding
 * variants (WebP/AVIF), responsive width generation, LQIP blur placeholder,
 * and an Asset Manifest for the publisher.
 *
 * sharp is used for server-side image processing. Worker offload deferred to P7.
 */

import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { getAssetByHash, createAsset } from '../db';

// ─── Types ──────────────────────────────────────────────────
export interface AssetVariant {
  format: 'original' | 'webp' | 'avif';
  width: number;
  url: string;
  bytes: number;
}

export interface AssetManifest {
  hash: string;
  original: string;
  variants: AssetVariant[];
  thumbnail?: { url: string; bytes: number };
  lqip?: string;      // base64-encoded 16×16 blur placeholder
  width: number;
  height: number;
  mime: string;
  bytes: number;
}

export interface PipelineOptions {
  /** Generate WebP variant. Default: true. */
  webp?: boolean;
  /** Generate AVIF variant. Default: true. */
  avif?: boolean;
  /** Responsive widths to generate. Default: [480, 768, 1024, 1920]. */
  widths?: number[];
  /** Generate thumbnail (150px). Default: true. */
  thumbnail?: boolean;
  /** Generate LQIP blur placeholder. Default: true. */
  lqip?: boolean;
  /** Override asset storage directory. */
  assetDir?: string;
  /** Override public base URL. */
  publicBase?: string;
}

const ASSET_DIR = process.env.LUMINA_ASSET_DIR ?? path.join(process.cwd(), 'public', 'uploads');
const PUBLIC_BASE = process.env.LUMINA_ASSET_PUBLIC_BASE ?? '/uploads';
const DEFAULT_WIDTHS = [480, 768, 1024, 1920];

// ─── Pipeline ───────────────────────────────────────────────
/**
 * Run the full asset pipeline on an image buffer. Returns an AssetManifest
 * with all variants, a thumbnail, and an LQIP.
 */
export async function processImage(
  buffer: Buffer,
  filename: string,
  options?: PipelineOptions,
): Promise<AssetManifest> {
  const opts = {
    webp: true, avif: true, widths: DEFAULT_WIDTHS,
    thumbnail: true, lqip: true,
    assetDir: ASSET_DIR, publicBase: PUBLIC_BASE,
    ...options,
  };

  const hash = createHash('sha256').update(buffer).digest('hex');
  const ext = filename.split('.').pop()?.toLowerCase() || 'png';

  // Check if already processed
  const existing = getAssetByHash(hash);
  if (existing) {
    return JSON.parse(process.env[`_ASSET_MANIFEST_${hash}`] ?? 'null') ?? buildManifestFromExisting(existing, hash, opts);
  }

  await mkdir(opts.assetDir, { recursive: true });

  // Metadata extraction
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const variants: AssetVariant[] = [];
  let thumbnail: { url: string; bytes: number } | undefined;
  let lqip: string | undefined;

  // Store original
  const origName = `${hash}.${ext}`;
  await writeFile(path.join(opts.assetDir, origName), buffer);
  variants.push({ format: 'original', width, url: `${opts.publicBase}/${origName}`, bytes: buffer.length });

  // Generate responsive widths
  for (const w of opts.widths) {
    if (w >= width) continue;

    // WebP
    if (opts.webp) {
      const webpBuf = await sharp(buffer).resize(w).webp({ quality: 80 }).toBuffer();
      const name = `${hash}_w${w}.webp`;
      await writeFile(path.join(opts.assetDir, name), webpBuf);
      variants.push({ format: 'webp', width: w, url: `${opts.publicBase}/${name}`, bytes: webpBuf.length });
    }

    // AVIF
    if (opts.avif) {
      const avifBuf = await sharp(buffer).resize(w).avif({ quality: 65 }).toBuffer();
      const name = `${hash}_w${w}.avif`;
      await writeFile(path.join(opts.assetDir, name), avifBuf);
      variants.push({ format: 'avif', width: w, url: `${opts.publicBase}/${name}`, bytes: avifBuf.length });
    }
  }

  // Thumbnail (150px)
  if (opts.thumbnail) {
    const thumbBuf = await sharp(buffer).resize(150).jpeg({ quality: 70 }).toBuffer();
    const name = `${hash}_thumb.jpg`;
    await writeFile(path.join(opts.assetDir, name), thumbBuf);
    thumbnail = { url: `${opts.publicBase}/${name}`, bytes: thumbBuf.length };
  }

  // LQIP (16×16 blur placeholder, base64)
  if (opts.lqip) {
    const lqipBuf = await sharp(buffer).resize(16, 16, { fit: 'cover' }).jpeg({ quality: 20 }).toBuffer();
    lqip = `data:image/jpeg;base64,${lqipBuf.toString('base64')}`;
  }

  const manifest: AssetManifest = { hash, original: `${opts.publicBase}/${origName}`, variants, thumbnail, lqip, width, height, mime: `image/${ext}`, bytes: buffer.length };

  // DB record
  createAsset({
    url: manifest.original,
    hash,
    width, height, bytes: buffer.length,
    mime: `image/${ext}`,
    variants: { manifest },
  });

  // Cache manifest in env for dedup (avoids re-reading DB)
  process.env[`_ASSET_MANIFEST_${hash}`] = JSON.stringify(manifest);

  return manifest;
}

function buildManifestFromExisting(existing: { variants: string; url?: string }, hash: string, opts: PipelineOptions): AssetManifest {
  // Reconstruct from stored variants JSON
  const parsed = JSON.parse(existing.variants || '{}');
  return parsed.manifest ?? {
    hash,
    original: existing.url ?? '',
    variants: [],
    width: 0, height: 0, mime: '', bytes: 0,
  };
}

// ─── Helpers ────────────────────────────────────────────────
export function srcsetFromVariants(variants: AssetVariant[]): string {
  return variants
    .filter((v) => v.format !== 'original')
    .map((v) => `${v.url} ${v.width}w`)
    .join(', ');
}
