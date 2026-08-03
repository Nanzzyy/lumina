/**
 * Browser-side `/api/*` access. Studio pages and guest sections each rebuilt the
 * same `fetch` boilerplate (`Content-Type` header, `JSON.stringify`, `r.json()`),
 * which is easy to get subtly wrong — a missing header makes the route reject the
 * body. These helpers reject on a non-2xx response with the server's `{ error }`
 * message so callers can surface it.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (body as { error?: string } | null)?.error || `Request failed (${res.status})`;
    throw new HttpError(res.status, message);
  }
  return body as T;
}

const withJsonBody = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const getJson = <T>(url: string) => request<T>(url);
export const postJson = <T>(url: string, body: unknown) => request<T>(url, withJsonBody('POST', body));
export const putJson = <T>(url: string, body: unknown) => request<T>(url, withJsonBody('PUT', body));
export const deleteJson = <T>(url: string) => request<T>(url, { method: 'DELETE' });

/** Multipart upload to `/api/upload`; resolves to the stored asset payload. */
export const uploadFile = (form: FormData) =>
  request<{ url: string; id: string; hash: string; duplicated: boolean }>('/api/upload', {
    method: 'POST',
    body: form,
  });

/** `getJson` for optional data: resolves to `fallback` instead of rejecting. */
export const getJsonOr = <T>(url: string, fallback: T) => getJson<T>(url).catch(() => fallback);
