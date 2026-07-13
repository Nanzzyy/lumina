import type { TemplateDefinition } from '@/lib/template/types';

/**
 * Noir – A bold, editorial wedding invitation template.
 *
 * Identity:
 * - Dark charcoal backgrounds
 * - Warm gold/ivory accents
 * - Oversized typography (Playfair Display)
 * - Minimal ornamentation, maximal whitespace
 * - Asymmetric layouts, full-bleed sections
 * - Scale-in + slide-up animations
 *
 * Pure presentation – no logic, no content.
 */
export const noirTemplate: TemplateDefinition = {
  id: 'noir',
  name: 'Noir',
  description: 'Bold and editorial wedding invitation with dark aesthetic',

  theme: {
    colors: {
      primary: '#c9a84c',
      'primary-hover': '#b8953a',
      'primary-light': '#faf6eb',
      secondary: '#8b2f3a',
      'secondary-hover': '#7a2932',
      background: '#1a1a1a',
      'background-alt': '#222222',
      surface: '#2a2a2a',
      text: '#f0f0f0',
      'text-secondary': '#b0b0b0',
      'text-muted': '#707070',
      border: '#333333',
      'border-light': '#2a2a2a',
    },
    typography: {
      'font-heading': "'Playfair Display', Georgia, serif",
      'font-body': "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      'font-accent': "'Playfair Display', Georgia, serif",
    },
    gradient: {
      primary: 'linear-gradient(135deg, #c9a84c, #8b2f3a)',
      secondary: 'linear-gradient(135deg, #222222, #1a1a1a)',
      accent: 'linear-gradient(135deg, #c9a84c, #f0e6c0)',
    },
  },

  sections: [
    { id: 'hero', type: 'hero', variant: 'noir' },
    { id: 'quote', type: 'quote', variant: 'noir' },
    { id: 'countdown', type: 'countdown', variant: 'noir' },
    { id: 'story', type: 'story', variant: 'noir' },
    { id: 'gallery', type: 'gallery', variant: 'noir' },
    { id: 'timeline', type: 'timeline', variant: 'noir' },
    { id: 'maps', type: 'maps', variant: 'noir' },
    { id: 'rsvp', type: 'rsvp', variant: 'noir' },
    { id: 'gift', type: 'gift', variant: 'noir' },
    { id: 'guestbook', type: 'guestbook', variant: 'noir' },
    { id: 'footer', type: 'footer', variant: 'noir' },
  ],

  decorations: [
    {
      id: 'noir-geometric-top',
      type: 'floral-decoration',
      layer: 'behind',
      anchor: 0,
      props: { position: 'top-right', color: '#c9a84c', opacity: 0.05 },
    },
  ],

  animation: {
    preset: 'scale-in',
    duration: 0.8,
  },

  layout: {
    wrapperClass: 'bg-[var(--colors-background)] text-[var(--colors-text)]',
    containerClass: '',
  },
};
