'use client';

import { useState, useCallback, useEffect } from 'react';
import type { InvitationContent } from '@/lib/content/types';
import type { DeepPartial, ThemeConfig } from '@/lib/theme/types';

export interface StudioInvitation {
  slug: string;
  templateId: string;
  layoutId?: string;
  title: string;
  content: InvitationContent;
  themeOverrides?: DeepPartial<ThemeConfig>;
  createdAt: string;
  updatedAt: string;
}

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'API error');
  }
  return res.json();
}

async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('API error');
  return res.json();
}

async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('API error');
}

export function useStudioStore() {
  const [invitations, setInvitations] = useState<StudioInvitation[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await apiGet<any[]>('/api/invitations');
      setInvitations(list.map((i: any) => ({
        slug: i.slug,
        templateId: i.templateId,
        layoutId: i.layoutId,
        title: i.title,
        content: i.content,
        themeOverrides: i.themeOverrides,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })));
    } catch { /* will retry on next action */ }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoaded(true));
  }, [refresh]);

  const create = useCallback(async (invitation: StudioInvitation) => {
    await apiPost('/api/invitations', {
      slug: invitation.slug,
      title: invitation.title,
      templateId: invitation.templateId,
      layoutId: invitation.layoutId || 'default',
      content: invitation.content,
      themeOverrides: invitation.themeOverrides,
    });
    await refresh();
  }, [refresh]);

  const update = useCallback(async (slug: string, updates: Partial<StudioInvitation>) => {
    await apiPut(`/api/invitations/${slug}`, {
      title: updates.title,
      templateId: updates.templateId,
      layoutId: updates.layoutId,
      content: updates.content,
      themeOverrides: updates.themeOverrides,
    });
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (slug: string) => {
    await apiDelete(`/api/invitations/${slug}`);
    await refresh();
  }, [refresh]);

  const get = useCallback((slug: string): StudioInvitation | undefined => {
    return invitations.find((inv) => inv.slug === slug);
  }, [invitations]);

  return { invitations, loaded, create, update, remove, get };
}

export function exportInvitationJSON(invitation: StudioInvitation): string {
  return JSON.stringify({
    slug: invitation.slug,
    template: invitation.templateId,
    title: invitation.title,
    content: invitation.content,
    theme: invitation.themeOverrides,
  }, null, 2);
}
