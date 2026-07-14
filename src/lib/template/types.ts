import type { DeepPartial, ThemeConfig } from '@/lib/theme/types';
import type { InvitationContent } from '@/lib/content/types';

/** Known section types — extend as new sections are added. */
export type SectionType =
  | 'hero'
  | 'cover'
  | 'countdown'
  | 'story'
  | 'gallery'
  | 'timeline'
  | 'quote'
  | 'rsvp'
  | 'gift'
  | 'guestbook'
  | 'maps'
  | 'footer';

/**
 * Section configuration within a layout.
 * Layouts declare which sections exist, in what order, with which variant.
 */
export interface SectionConfig {
  /** Unique id within the layout */
  id: string;
  /** Which section component to render */
  type: SectionType;
  /** Which visual variant of that section */
  variant?: string;
  /** Additional props forwarded to the section component */
  props?: Record<string, unknown>;
  /** Hide this section (for conditional sections) */
  hidden?: boolean;
}

/**
 * Animation preset applied to section entrance.
 */
export interface AnimationConfig {
  preset: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-up' | 'none';
  duration?: number;
  delay?: number;
  stagger?: number;
}

/**
 * Decoration component — pure visual flair rendered behind or around sections.
 */
export interface DecorationConfig {
  id: string;
  /** z-index placement: 'behind' | 'overlay' | 'floating' */
  layer: 'behind' | 'overlay' | 'floating';
  /** Position within the page (section index or 'global') */
  anchor: 'global' | number;
  /** Decoration type — resolved by the renderer */
  type: string;
  /** Props forwarded to the decoration component */
  props?: Record<string, unknown>;
  /** Hide on mobile */
  hiddenMobile?: boolean;
}

/** Template definition — pure visual theme (colors, typography, decorations). */
export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  /** Theme overrides applied when this template is active */
  theme?: DeepPartial<ThemeConfig>;
  /** Decorative elements */
  decorations?: DecorationConfig[];
}

/**
 * Resolved invitation — a template + layout + content merged together.
 * This is what the renderer consumes.
 */
export interface ResolvedInvitation {
  template: TemplateDefinition;
  content: InvitationContent;
}
