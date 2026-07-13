'use client';

import { useState, useCallback, useEffect } from 'react';
import type { InvitationContent } from '@/lib/content/types';
import type { DeepPartial, ThemeConfig } from '@/lib/theme/types';

export interface StudioInvitation {
  slug: string;
  templateId: string;
  title: string;
  content: InvitationContent;
  themeOverrides?: DeepPartial<ThemeConfig>;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'lumina-studio-invitations';

function loadInvitations(): StudioInvitation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveInvitations(invitations: StudioInvitation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invitations));
  } catch { /* storage full or unavailable */ }
}

export function useStudioStore() {
  const [invitations, setInvitations] = useState<StudioInvitation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setInvitations(loadInvitations());
    setLoaded(true);
  }, []);

  const persist = useCallback((items: StudioInvitation[]) => {
    setInvitations(items);
    saveInvitations(items);
  }, []);

  const create = useCallback((invitation: StudioInvitation) => {
    persist([...loadInvitations(), invitation]);
  }, [persist]);

  const update = useCallback((slug: string, updates: Partial<StudioInvitation>) => {
    const items = loadInvitations().map((inv) =>
      inv.slug === slug ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv,
    );
    persist(items);
  }, [persist]);

  const remove = useCallback((slug: string) => {
    persist(loadInvitations().filter((inv) => inv.slug !== slug));
  }, [persist]);

  const get = useCallback((slug: string): StudioInvitation | undefined => {
    return loadInvitations().find((inv) => inv.slug === slug);
  }, []);

  return { invitations, loaded, create, update, remove, get };
}

/** Stub for exporting — generates a JSON config file content */
export function exportInvitationJSON(invitation: StudioInvitation): string {
  return JSON.stringify(
    {
      slug: invitation.slug,
      template: invitation.templateId,
      title: invitation.title,
      content: invitation.content,
      theme: invitation.themeOverrides,
    },
    null,
    2,
  );
}
