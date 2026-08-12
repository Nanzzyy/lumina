import { headers } from 'next/headers';

/** Resolve the public origin used in crawler-facing metadata. */
export async function getPublicBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');

  const h = await headers();
  const host = h.get('x-forwarded-host')?.split(',')[0].trim() || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto')?.split(',')[0].trim() || 'http';
  return `${proto}://${host}`;
}

export function toAbsoluteUrl(value: string | undefined, baseUrl: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value, baseUrl);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
