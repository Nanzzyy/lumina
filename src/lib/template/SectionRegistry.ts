import type { SectionType, AnimationConfig } from './types';
import type { InvitationContent } from '@/lib/content/types';
import type { FC } from 'react';

/**
 * Section registry — maps section type strings to their React components.
 * This is the single source of truth for the template engine.
 *
 * Each section component receives:
 * - content: InvitationContent (full data — section picks what it needs)
 * - variant?: string
 * - animation?: AnimationConfig
 * - sectionIndex?: number
 */
export interface SectionComponentProps {
  content: InvitationContent;
  variant?: string;
  animation?: AnimationConfig;
  sectionIndex?: number;
  [key: string]: unknown;
}

export type SectionComponent = FC<SectionComponentProps>;

export const SectionRegistry: Partial<Record<SectionType, SectionComponent>> =
  {};
