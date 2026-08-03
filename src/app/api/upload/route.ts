import { storeAsset } from '@/lib/assets';
import { ApiError, authedRoute, badRequest, json } from '@/lib/api/respond';

// SVG excluded: served verbatim from /uploads with no CSP → embedded <script> = stored XSS.
// ponytail: re-enable via a sanitizing proxy (DOMPurify) if SVG upload is ever needed.
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_SIZE = 10 * 1024 * 1024;

export const POST = authedRoute(async (req) => {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) throw badRequest('No file');

  if (file.size > MAX_SIZE) throw new ApiError(413, 'File too large. Max 10MB.');

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) throw new ApiError(415, 'Invalid file type');
  if (file.type && !ALLOWED_TYPES.includes(file.type)) throw new ApiError(415, 'Invalid file type');

  // ADR-009: content-addressed storage + DB index (dedup by sha256, immutable path).
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await storeAsset(buffer, {
    ext,
    mime: file.type || 'application/octet-stream',
    bytes: file.size,
  });

  return json({
    url: stored.url,
    id: stored.id,
    hash: stored.hash,
    duplicated: stored.duplicated,
  });
});
