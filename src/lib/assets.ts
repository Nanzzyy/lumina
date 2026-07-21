import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createAsset, getAssetByHash } from './db';

/**
 * Asset storage abstraction — ADR-009.
 *
 * Content-addressed: writes `{sha256}.{ext}` so names are immutable and dedup-able
 * (Cache-Control: immutable in front). Filesystem now; S3/object storage later via
 * env (LUMINA_ASSET_STORE=s3) without changing the call site.
 *
 * ponytail: optimize/encode(WebP/AVIF)/responsive srcset/thumbnail pipeline + the S3
 * backend + Web Worker offload land in P2/P6. sharp compat to be vetted then.
 */

const ASSET_DIR = process.env.LUMINA_ASSET_DIR ?? path.join(process.cwd(), 'public', 'uploads');
const PUBLIC_BASE = process.env.LUMINA_ASSET_PUBLIC_BASE ?? '/uploads';

export interface StoredAsset {
  id: string;
  url: string;
  hash: string;
  bytes: number;
  mime: string;
  /** true when an existing asset with the same hash was reused (no new file written). */
  duplicated: boolean;
}

export async function storeAsset(
  buffer: Buffer,
  meta: { ext: string; mime: string; bytes?: number },
): Promise<StoredAsset> {
  const hash = createHash('sha256').update(buffer).digest('hex');

  const existing = getAssetByHash(hash);
  if (existing) {
    return {
      id: existing.id,
      url: existing.url,
      hash,
      bytes: existing.bytes ?? buffer.length,
      mime: existing.mime ?? meta.mime,
      duplicated: true,
    };
  }

  const filename = `${hash}.${meta.ext}`;
  await mkdir(ASSET_DIR, { recursive: true });
  await writeFile(path.join(ASSET_DIR, filename), buffer);

  const url = `${PUBLIC_BASE}/${filename}`;
  const row = createAsset({ url, hash, bytes: meta.bytes ?? buffer.length, mime: meta.mime });
  return {
    id: row.id,
    url,
    hash,
    bytes: row.bytes ?? buffer.length,
    mime: row.mime ?? meta.mime,
    duplicated: false,
  };
}
