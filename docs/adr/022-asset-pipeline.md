# ADR-022: Asset Pipeline

- Status: Accepted (2026-07-19)
- Date: 2026-07-19
- Phase gate: P6 (must be Accepted before any P6 code)

## Context
P1 established content-addressed storage (ADR-009 `storeAsset`) and the `assets` DB table, but the pipeline is minimal: upload → hash → store. No optimization, no encoding variants (WebP/AVIF), no responsive srcset, no thumbnails, no CDN, no cleanup. As P6 (Publish Runtime) starts bundling output for real deployment, an asset that arrives as 8 MB JPEG must be served as right-sized WebP/AVIF at the correct resolution — Lighthouse will fail otherwise.

## Decision

### Full pipeline
```
Upload
  → Validate (mime magic, dimensions, size cap)
  → Hash (SHA-256 content-addressed)
  → Optimize (strip metadata, recompress)
  → Encode (original + WebP + AVIF)
  → Generate widths (480, 768, 1024, 1920) per format
  → Thumbnail (editor picker crop, 150×150)
  → Record in assets table (id, hash, url, width, height, bytes, mime, variants JSON, alt)
  → Store (filesystem default; S3-compatible via env)
  → Cache edge (asset URL → Cache-Control: immutable, max-age=31536000)
  → Emit in renderer as <img srcset sizes loading=lazy />
```

### Asset types
| Type | Handling | Future |
|---|---|---|
| Image (JPEG, PNG, WebP) | Optimize → encode WebP + AVIF → responsive widths | HEIF, JPEG XL |
| SVG | Sanitize (strip script/event handlers, CSS injection) → store as-is | — |
| GIF | Optimize → store (no WebP conversion — animated) | WebP animated |
| Video (MP4, WebM) | Check duration/size cap → store → optional thumbnail poster | HLS, DASH |
| Audio (MP3, OGG) | Check duration/size cap → store | — |
| Font (WOFF2, TTF) | Subset (extract used chars) → WOFF2 convert → store | — |
| Icon (SVG, PNG) | Sanitize (SVG) → optimize → store; inline-capable SVGs get a `data:` variant | Icon sprite |

### Storage abstraction (existing, extended)
```ts
storeAsset(buf, meta): StoredAsset     // ADR-009, unchanged interface
storeVariant(hash, variant, buf): void // new: variant record in assets.variants JSON
```
Filesystem by default (`LUMINA_ASSET_DIR`). Setting `LUMINA_ASSET_STORE=s3` switches to S3-compatible without code changes. CDN in front via `LUMINA_ASSET_CDN_BASE`.

### Dependency graph
Assets referenced by a node's `props.image` or a binding are resolved by the Asset Graph collector (ADR-021 step). The collector walks the resolved document, finds all asset URLs, deduplicates by hash, and includes them in the publish bundle.

### Cleanup
- Orphaned assets (hash not referenced by any project) are garbage-collectable via a background script.
- Assets referenced by a snapshot or autosave entry (ADR-020) are kept.

## Consequences
- Existing `/api/upload` gains processing stages but maintains backward compatibility (returns `{url, id, hash, duplicated}` as before).
- Assets table rows now carry `variants` JSON with width×format entries — the publish target adapter reads these to emit `<source>` / `srcset`.
- Content-addressed names mean asset URLs are immutable → perfect CDN cache hit rate.
- `sharp` dep is required (already vetted in P1 spike); image ops run in a server-side worker (not blocking the main thread in the editor).

## Alternatives
- **Client-side optimization only (browser's built-in):** rejected — no AVIF, no srcset generation, Lighthouse fails.
- **On-the-fly resize at request time (Next/Image, imgproxy):** viable layer above; pre-generation of common widths keeps CDN origin fast and avoids cold-start latency.
