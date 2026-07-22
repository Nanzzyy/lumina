# ADR-009: Asset Pipeline

- Status: Proposed
- Date: 2026-07-19
- Phase gate: P1 (storage abstraction); full stages P2/P6

## Context
Today `/api/upload` writes raw files to `public/uploads/{timestamp}-*.{ext}` with no DB record, no optimization, no responsive variants. A user uploads an 8 MB wedding photo and Lighthouse collapses. The platform needs a real asset pipeline: optimized multi-format variants, thumbnails, responsive srcset, CDN, immutable cache.

## Decision
Multi-stage pipeline; every asset is **content-addressed** and recorded in the `assets` table.

```
Upload
  → Validate (mime magic, size cap, dimensions)        ADR-013
  → Hash (sha-256) → content-addressed path {hash}.{ext}
  → Optimize (strip metadata, normalize color profile)
  → Encode variants: original · WebP · AVIF
  → Generate responsive widths (e.g. 480/768/1024/1920) per format
  → Thumbnail (editor picker)
  → Store (filesystem today; S3-compatible via env, abstracted behind storeAsset())
  → Index in assets table (id, kind, url, hash, w/h/bytes/mime, variants JSON, alt)
  → Emit <img srcset/sizes loading=lazy> in renderer
```

- **Immutable cache:** content-addressed names → `Cache-Control: immutable, max-age=31536000`.
- **Worker offload:** optimize/encode run in a Web Worker (build) or server worker (upload) — never block the main/editor thread.
- **Storage abstraction:** `storeAsset(buf, meta) → AssetRef`. Filesystem default; `S3_ENDPOINT`/`R2` env flips to object storage without code change. CDN in front (`ASSET_CDN_BASE`).
- **Asset as variable/binding:** images bind like any variable (ADR-003), so swapping a photo updates every node using it.
- **DB record replaces orphaned files:** deletes cascade; upload always inserts the row.

## Consequences
- Replaces `Date.now()`-prefix uploads; old files kept during migration, new path side-by-side.
- Adds an image-processing dependency (sharp) — vetted against Turbopack/Next 16 in P1 spike.
- Asset cost (storage/CDN) becomes real — reserve for billing (P8).

## Alternatives
- **On-the-fly resize at request time (imgproxy/Next image):** viable layer; we still pre-generate the common widths to keep publish zero-JS and CDN-cacheable. Next/Image is an option for SSR target only (ADR-008).
- **Single format (WebP only):** rejected — AVIF gives meaningful size wins on photographic invitations.
