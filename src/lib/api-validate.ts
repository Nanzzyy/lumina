/**
 * API input validation — P10-WS1.2.
 * Zod schemas for all POST/PUT endpoints. Run before route handler.
 */
import { z } from 'zod';

// ─── Auth ──────────────────────────────────────────────────
export const loginSchema = z.object({
  password: z.string().min(1, 'Password required'),
});

// ─── Invitations ───────────────────────────────────────────
export const createInvitationSchema = z.object({
  slug: z.string().min(2).max(100),
  title: z.string().min(1).max(200),
  templateId: z.string().optional(),
});

// ─── Layouts ───────────────────────────────────────────────
export const createLayoutSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

// ─── RSVP ──────────────────────────────────────────────────
export const rsvpSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(2, 'Name required (min 2 characters)'),
  status: z.enum(['hadir', 'tidak', 'ragu']),
  guests: z.number().int().min(1).max(10),
  message: z.string().max(1000).optional(),
});

// ─── Wishes ────────────────────────────────────────────────
export const wishSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(2, 'Name required'),
  message: z.string().min(5, 'Message required (min 5 characters)'),
});

// ─── Generic validation helper ─────────────────────────────
import { NextResponse } from 'next/server';

export async function validateBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return { error: NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 },
      )};
    }
    return { data: result.data };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) };
  }
}
