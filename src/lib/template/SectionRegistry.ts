import type { SectionType, AnimationConfig } from './types';
import type { InvitationContent } from '@/lib/content/types';
import type { FC } from 'react';

export interface SectionComponentProps {
  content: InvitationContent;
  variant?: string;
  animation?: AnimationConfig;
  sectionIndex?: number;
  slug?: string;
  [key: string]: unknown;
}

export type SectionComponent = FC<SectionComponentProps>;

const registry: Partial<Record<SectionType, SectionComponent>> = {};

export const SectionRegistry = {
  register(type: SectionType, component: SectionComponent) {
    registry[type] = component;
  },

  get(type: SectionType): SectionComponent {
    const comp = registry[type];
    if (!comp) {
      throw new Error(`[SectionRegistry] Unknown section type: "${type}". Did you call initializeRegistries()?`);
    }
    return comp;
  },

  has(type: SectionType): boolean {
    return type in registry;
  },
};
