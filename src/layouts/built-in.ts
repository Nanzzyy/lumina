import type { LayoutDefinition } from '@/lib/layout/types';
import type { SectionConfig } from '@/lib/template/types';

function sections(...list: [string, string, string?][]): SectionConfig[] {
  return list.map(([id, type, variant]) => ({ id, type: type as SectionConfig['type'], variant }));
}

function layout(id: string, name: string, description: string, secs: SectionConfig[]): LayoutDefinition {
  const containers = secs.map((s) => ({
    id: s.id,
    type: s.type === 'cover' || s.type === 'hero' ? 'hero-banner' as const :
          s.type === 'gallery' ? 'grid' as const :
          s.type === 'story' ? 'contained' as const :
          'contained' as const,
  }));
  return { id, name, description, sections: secs, containers };
}

// ─── 5 Built-in Layouts ─────────────────────────────────────────

export const defaultLayout = layout(
  'default', 'Classic', 'Standard 12-section flow with all sections included.',
  sections(
    ['cover', 'cover'],
    ['hero', 'hero'],
    ['quote', 'quote'],
    ['countdown', 'countdown'],
    ['story', 'story'],
    ['gallery', 'gallery', 'grid'],
    ['timeline', 'timeline'],
    ['maps', 'maps'],
    ['rsvp', 'rsvp'],
    ['gift', 'gift'],
    ['guestbook', 'guestbook'],
    ['footer', 'footer'],
  ),
);

export const modernLayout = layout(
  'modern', 'Modern', 'Minimal 6-section flow with split story and grid gallery.',
  sections(
    ['hero', 'hero'],
    ['story', 'story'],
    ['gallery', 'gallery', 'grid'],
    ['quote', 'quote'],
    ['rsvp', 'rsvp'],
    ['footer', 'footer'],
  ),
);

export const adatBaliLayout = layout(
  'adat-bali', 'Adat Bali', 'Indonesian traditional flow emphasizing schedule and gift.',
  sections(
    ['cover', 'cover'],
    ['quote', 'quote'],
    ['hero', 'hero'],
    ['timeline', 'timeline'],
    ['gallery', 'gallery', 'grid'],
    ['rsvp', 'rsvp'],
    ['gift', 'gift'],
    ['footer', 'footer'],
  ),
);

export const romanticLayout = layout(
  'romantic', 'Romantic', 'Image-heavy romantic flow with split story and gallery.',
  sections(
    ['cover', 'cover'],
    ['hero', 'hero'],
    ['story', 'story'],
    ['quote', 'quote'],
    ['gallery', 'gallery', 'grid'],
    ['countdown', 'countdown'],
    ['rsvp', 'rsvp'],
    ['footer', 'footer'],
  ),
);

export const minimalLayout = layout(
  'minimal', 'Minimal', 'Bare essentials — hero, countdown, quote, RSVP, footer.',
  sections(
    ['hero', 'hero'],
    ['countdown', 'countdown'],
    ['quote', 'quote'],
    ['rsvp', 'rsvp'],
    ['footer', 'footer'],
  ),
);
