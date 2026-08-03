import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  loginSchema,
  createInvitationSchema,
  createLayoutSchema,
  rsvpSchema,
  wishSchema,
  validateBody,
} from './api-validate';

const jsonRequest = (body: unknown): Request =>
  new Request('http://localhost/api/rsvp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('api-validate schemas', () => {
  it('loginSchema requires a non-empty password', () => {
    expect(loginSchema.safeParse({ password: 'hunter2' }).success).toBe(true);
    expect(loginSchema.safeParse({ password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({}).success).toBe(false);
  });

  it('createInvitationSchema enforces slug/title bounds and optional templateId', () => {
    expect(createInvitationSchema.safeParse({ slug: 'ab', title: 'T' }).success).toBe(true);
    expect(createInvitationSchema.safeParse({ slug: 'a', title: 'T' }).success).toBe(false);
    expect(createInvitationSchema.safeParse({ slug: 'a'.repeat(101), title: 'T' }).success).toBe(false);
    expect(createInvitationSchema.safeParse({ slug: 'ab', title: '' }).success).toBe(false);
    expect(createInvitationSchema.safeParse({ slug: 'ab', title: 'a'.repeat(201) }).success).toBe(false);
  });

  it('createLayoutSchema accepts an arbitrary config record', () => {
    const parsed = createLayoutSchema.parse({ name: 'Grid', config: { engine: 'tree', nodes: [] } });
    expect(parsed.config).toEqual({ engine: 'tree', nodes: [] });
    expect(createLayoutSchema.safeParse({ name: 'Grid' }).success).toBe(true);
    expect(createLayoutSchema.safeParse({ description: 'no name' }).success).toBe(false);
  });

  it('rsvpSchema restricts status to the API enum and guests to 1..10', () => {
    const base = { slug: 'wedding', name: 'Budi', status: 'hadir' as const, guests: 2 };
    expect(rsvpSchema.safeParse(base).success).toBe(true);
    // 'tidak_hadir' is the DB-layer value; the API enum uses 'tidak'.
    expect(rsvpSchema.safeParse({ ...base, status: 'tidak_hadir' }).success).toBe(false);
    expect(rsvpSchema.safeParse({ ...base, status: 'tidak' }).success).toBe(true);
    expect(rsvpSchema.safeParse({ ...base, guests: 0 }).success).toBe(false);
    expect(rsvpSchema.safeParse({ ...base, guests: 11 }).success).toBe(false);
    expect(rsvpSchema.safeParse({ ...base, guests: 1.5 }).success).toBe(false);
    expect(rsvpSchema.safeParse({ ...base, name: 'B' }).success).toBe(false);
  });

  it('wishSchema requires a name and a message of at least 5 characters', () => {
    expect(wishSchema.safeParse({ slug: 's', name: 'Budi', message: 'Selamat!' }).success).toBe(true);
    expect(wishSchema.safeParse({ slug: 's', name: 'Budi', message: 'hi' }).success).toBe(false);
    expect(wishSchema.safeParse({ slug: 's', name: 'B', message: 'Selamat!' }).success).toBe(false);
  });
});

describe('validateBody', () => {
  it('returns parsed data for a valid body', async () => {
    const result = await validateBody(jsonRequest({ password: 'secret' }), loginSchema);
    expect(result).toEqual({ data: { password: 'secret' } });
  });

  it('applies schema transforms/defaults to the returned data', async () => {
    const schema = z.object({ n: z.coerce.number(), tag: z.string().default('x') });
    const result = await validateBody(jsonRequest({ n: '42' }), schema);
    expect('data' in result && result.data).toEqual({ n: 42, tag: 'x' });
  });

  it('returns a 400 with field errors when validation fails', async () => {
    const result = await validateBody(jsonRequest({ slug: 's', name: 'B', message: 'hi' }), wishSchema);
    expect('error' in result).toBe(true);
    if (!('error' in result)) return;
    expect(result.error.status).toBe(400);
    const body = await result.error.json();
    expect(body.error).toBe('Validation failed');
    expect(Object.keys(body.details)).toEqual(expect.arrayContaining(['name', 'message']));
  });

  it('returns a 400 "Invalid JSON body" when the body is not JSON', async () => {
    const req = new Request('http://localhost/api/rsvp', { method: 'POST', body: 'not json' });
    const result = await validateBody(req, loginSchema);
    expect('error' in result).toBe(true);
    if (!('error' in result)) return;
    expect(result.error.status).toBe(400);
    expect(await result.error.json()).toEqual({ error: 'Invalid JSON body' });
  });
});
