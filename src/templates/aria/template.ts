import type { TemplateDefinition } from '@/lib/template/types';

/**
 * Aria – A romantic, elegant wedding invitation template.
 *
 * Identity:
 * - Serif typography (Playfair Display + Great Vibes)
 * - Pink-to-purple gradient palette
 * - Ornamental decorations (floral accents, curved dividers)
 * - Fade-up entrance animations
 * - Full-screen hero with countdown
 * - Open invitation CTA reveal
 *
 * Pure presentation – no logic, no content. The engine handles everything.
 */
export const ariaTemplate: TemplateDefinition = {
  id: 'aria',
  name: 'Aria',
  description: 'Romantic and elegant wedding invitation with floral accents',

  theme: {
    colors: {
      primary: '#db2777',
      'primary-hover': '#be185d',
      'primary-light': '#fdf2f8',
      secondary: '#7c3aed',
      background: '#ffffff',
      'background-alt': '#faf5ff',
    },
    typography: {
      'font-heading': "'Playfair Display', Georgia, serif",
      'font-accent': "'Great Vibes', handwriting, cursive",
    },
    gradient: {
      primary: 'linear-gradient(135deg, #db2777, #7c3aed)',
      secondary: 'linear-gradient(135deg, #fdf2f8, #faf5ff)',
    },
  },

  sections: [
    { id: 'hero', type: 'hero', variant: 'aria' },
    { id: 'quote', type: 'quote' },
    { id: 'countdown', type: 'countdown', variant: 'aria' },
    { id: 'story', type: 'story' },
    { id: 'gallery', type: 'gallery', variant: 'grid' },
    { id: 'timeline', type: 'timeline' },
    { id: 'maps', type: 'maps' },
    { id: 'rsvp', type: 'rsvp' },
    { id: 'gift', type: 'gift' },
    { id: 'guestbook', type: 'guestbook' },
    { id: 'footer', type: 'footer' },
  ],

  decorations: [
    {
      id: 'floral-top-right',
      type: 'floral-decoration',
      layer: 'behind',
      anchor: 0,
      props: { position: 'top-right' },
    },
    {
      id: 'floral-bottom-left',
      type: 'floral-decoration',
      layer: 'behind',
      anchor: 3,
      props: { position: 'bottom-left', opacity: 0.06 },
    },
    {
      id: 'floral-top-left',
      type: 'floral-decoration',
      layer: 'behind',
      anchor: 6,
      props: { position: 'top-left', opacity: 0.06 },
    },
  ],

  animation: {
    preset: 'fade-up',
    duration: 0.8,
  },

  layout: {
    wrapperClass: 'bg-[var(--colors-background)]',
    containerClass: '',
  },
};
