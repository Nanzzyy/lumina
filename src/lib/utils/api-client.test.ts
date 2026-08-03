import { describe, it, expect, vi, afterEach } from 'vitest';
import { HttpError, deleteJson, getJson, getJsonOr, postJson, putJson } from './api-client';

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch;
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock as unknown as ReturnType<typeof vi.fn>;
}

afterEach(() => vi.unstubAllGlobals());

describe('api-client', () => {
  it('returns the parsed body on success', async () => {
    mockFetch(200, { id: 'l1' });
    await expect(getJson('/api/layouts/l1')).resolves.toEqual({ id: 'l1' });
  });

  it('sends JSON bodies with the content-type the routes require', async () => {
    const fetchMock = mockFetch(201, { id: 'w1' });
    await postJson('/api/widgets', { name: 'Hero' });
    expect(fetchMock).toHaveBeenCalledWith('/api/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"Hero"}',
    });

    await putJson('/api/widgets/w1', { name: 'Hero 2' });
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'PUT' });

    await deleteJson('/api/widgets/w1');
    expect(fetchMock.mock.calls[2][1]).toEqual({ method: 'DELETE' });
  });

  it('rejects with the server error message and status', async () => {
    mockFetch(409, { error: 'Slug already exists' });
    await expect(getJson('/api/invitations')).rejects.toMatchObject({
      name: 'HttpError',
      status: 409,
      message: 'Slug already exists',
    });
  });

  it('falls back to a generic message when the body carries no error', async () => {
    mockFetch(500, null);
    await expect(getJson('/api/layouts')).rejects.toThrow('Request failed (500)');
  });

  it('getJsonOr swallows failures and yields the fallback', async () => {
    mockFetch(404, { error: 'Not found' });
    await expect(getJsonOr('/api/layouts', [])).resolves.toEqual([]);
  });

  it('exposes HttpError for status-specific handling', () => {
    expect(new HttpError(401, 'Unauthorized')).toBeInstanceOf(Error);
  });
});
