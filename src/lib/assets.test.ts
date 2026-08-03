import { describe, it, expect, afterAll } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Both db.ts and assets.ts read their paths at import time — redirect them at a
// throwaway directory before loading either module.
const TMP_DIR = mkdtempSync(path.join(tmpdir(), 'lumina-assets-test-'));
const ASSET_DIR = path.join(TMP_DIR, 'uploads');
process.env.LUMINA_DB_PATH = path.join(TMP_DIR, 'test.db');
process.env.LUMINA_ASSET_DIR = ASSET_DIR;
process.env.LUMINA_ASSET_PUBLIC_BASE = '/assets';

const { storeAsset } = await import('./assets');
const { getAssetByHash } = await import('./db');

afterAll(() => {
  rmSync(TMP_DIR, { recursive: true, force: true });
});

const sha256 = (buf: Buffer) => createHash('sha256').update(buf).digest('hex');

describe('storeAsset', () => {
  it('writes a content-addressed file and indexes it in the DB', async () => {
    const buffer = Buffer.from('first-image-bytes');
    const stored = await storeAsset(buffer, { ext: 'png', mime: 'image/png' });

    const hash = sha256(buffer);
    expect(stored).toMatchObject({
      hash,
      url: `/assets/${hash}.png`,
      bytes: buffer.length,
      mime: 'image/png',
      duplicated: false,
    });
    expect(readFileSync(path.join(ASSET_DIR, `${hash}.png`))).toEqual(buffer);
    expect(getAssetByHash(hash)).toMatchObject({ id: stored.id, url: stored.url, mime: 'image/png' });
  });

  it('creates the asset directory when it does not exist yet', async () => {
    expect(existsSync(ASSET_DIR)).toBe(true);
  });

  it('dedupes identical bytes without writing a second file', async () => {
    const buffer = Buffer.from('dedupe-me');
    const first = await storeAsset(buffer, { ext: 'jpg', mime: 'image/jpeg' });
    const before = readdirSync(ASSET_DIR).length;

    const second = await storeAsset(buffer, { ext: 'jpg', mime: 'image/jpeg' });
    expect(second).toMatchObject({ id: first.id, url: first.url, hash: first.hash, duplicated: true });
    expect(readdirSync(ASSET_DIR)).toHaveLength(before);
  });

  it('reuses the stored row even when the caller passes different metadata', async () => {
    const buffer = Buffer.from('same-bytes-other-meta');
    const first = await storeAsset(buffer, { ext: 'png', mime: 'image/png', bytes: 999 });
    const second = await storeAsset(buffer, { ext: 'webp', mime: 'image/webp' });
    expect(second.url).toBe(first.url);
    expect(second.mime).toBe('image/png');
    expect(second.bytes).toBe(999);
  });

  it('honours an explicit byte count over the buffer length', async () => {
    const stored = await storeAsset(Buffer.from('explicit-bytes'), { ext: 'png', mime: 'image/png', bytes: 42 });
    expect(stored.bytes).toBe(42);
    expect(getAssetByHash(stored.hash)?.bytes).toBe(42);
  });

  it('gives different bytes different hashes and files', async () => {
    const a = await storeAsset(Buffer.from('alpha'), { ext: 'png', mime: 'image/png' });
    const b = await storeAsset(Buffer.from('beta'), { ext: 'png', mime: 'image/png' });
    expect(a.hash).not.toBe(b.hash);
    expect(existsSync(path.join(ASSET_DIR, `${a.hash}.png`))).toBe(true);
    expect(existsSync(path.join(ASSET_DIR, `${b.hash}.png`))).toBe(true);
  });
});
