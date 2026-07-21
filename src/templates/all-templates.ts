import type { TemplateDefinition } from '@/lib/template/types';

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    'primary-hover': string;
    'primary-light': string;
    secondary: string;
    'secondary-hover': string;
    accent: string;
    background: string;
    'background-alt': string;
    surface: string;
    text: string;
    'text-secondary': string;
    'text-muted': string;
    border: string;
    'border-light': string;
  };
  decorations?: TemplateDefinition['decorations'];
}

function makeTemplate(c: TemplateConfig): TemplateDefinition {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    theme: {
      colors: { ...c.colors, error: '#dc2626', success: '#16a34a' },
      typography: {
        'font-heading': '"Playfair Display", Georgia, serif',
        'font-body': '"Inter", system-ui, sans-serif',
        'font-accent': '"Playfair Display", Georgia, serif',
      },
    },
    decorations: c.decorations || [
      { id: `${c.id}-bg`, type: 'floral-decoration', layer: 'behind', anchor: 'global', props: { position: 'top-right', color: c.colors.primary, opacity: 0.06 } },
    ],
  };
}

// ─── All 10 Templates ─────────────────────────────────────────────

export const auroraTemplate = makeTemplate({
  id: 'aurora', name: 'Aurora', description: 'Luxury gold on black — cinematic elegance',
  colors: {
    primary: '#c9a84c', 'primary-hover': '#b8953a', 'primary-light': '#faf6eb',
    secondary: '#e8d48b', 'secondary-hover': '#d4bc6a', accent: '#a8883a',
    background: '#0a0a0a', 'background-alt': '#111111', surface: '#1a1a1a',
    text: '#fafaf9', 'text-secondary': '#a8a29e', 'text-muted': '#57534e',
    border: '#292524', 'border-light': '#1c1917',
  },
  decorations: [
    { id: 'aurora-gold-top', type: 'floral-decoration', layer: 'behind', anchor: 'global', props: { position: 'top-right', color: '#c9a84c', opacity: 0.08 } },
    { id: 'aurora-gold-bottom', type: 'floral-decoration', layer: 'behind', anchor: 8, props: { position: 'bottom-left', color: '#c9a84c', opacity: 0.06 } },
  ],
});

export const fleurTemplate = makeTemplate({
  id: 'fleur', name: 'Fleur', description: 'Floral pastel — romantic garden wedding',
  colors: {
    primary: '#e8a0b4', 'primary-hover': '#d4889e', 'primary-light': '#fdf2f5',
    secondary: '#d4a0c8', 'secondary-hover': '#c080b4', accent: '#c8a8e0',
    background: '#ffffff', 'background-alt': '#fdf6f5', surface: '#ffffff',
    text: '#3d1a2e', 'text-secondary': '#7a4a5e', 'text-muted': '#b090a0',
    border: '#f0dce4', 'border-light': '#f8eaf0',
  },
});

export const lunaTemplate = makeTemplate({
  id: 'luna', name: 'Luna', description: 'Moonlit navy — dreamlike starry night',
  colors: {
    primary: '#c0c8e0', 'primary-hover': '#a0acc8', 'primary-light': '#1e2540',
    secondary: '#8b9dc3', 'secondary-hover': '#7080a8', accent: '#d4bc8a',
    background: '#0d1321', 'background-alt': '#141c2e', surface: '#1a2540',
    text: '#e8ecf4', 'text-secondary': '#a0acc8', 'text-muted': '#6078a0',
    border: '#2a3a5c', 'border-light': '#1e2e4a',
  },
});

export const ivoryTemplate = makeTemplate({
  id: 'ivory', name: 'Ivory', description: 'Timeless ivory white — classic wedding',
  colors: {
    primary: '#d4a853', 'primary-hover': '#c49640', 'primary-light': '#faf3e6',
    secondary: '#e8dcc8', 'secondary-hover': '#d8c8a8', accent: '#b8956a',
    background: '#fdf8f0', 'background-alt': '#faf3e6', surface: '#ffffff',
    text: '#3d2e1a', 'text-secondary': '#7a6040', 'text-muted': '#b89870',
    border: '#e8d8c0', 'border-light': '#f0e8d8',
  },
});

export const sakuraTemplate = makeTemplate({
  id: 'sakura', name: 'Sakura', description: 'Cherry blossom pink — Japanese elegance',
  colors: {
    primary: '#f0a0b0', 'primary-hover': '#e08898', 'primary-light': '#fef5f7',
    secondary: '#f0c0c8', 'secondary-hover': '#e0a8b0', accent: '#e8b8d0',
    background: '#ffffff', 'background-alt': '#fef5f7', surface: '#ffffff',
    text: '#4a1a2e', 'text-secondary': '#8a4a5e', 'text-muted': '#c090a0',
    border: '#f8dce4', 'border-light': '#fceaf0',
  },
});

export const nordicTemplate = makeTemplate({
  id: 'nordic', name: 'Nordic', description: 'Scandinavian minimal — organic warmth',
  colors: {
    primary: '#7a8b8b', 'primary-hover': '#6a7a7a', 'primary-light': '#f0f4f4',
    secondary: '#9bab8b', 'secondary-hover': '#8a9a7a', accent: '#b8a878',
    background: '#f4f4f0', 'background-alt': '#eaeae6', surface: '#ffffff',
    text: '#2a3028', 'text-secondary': '#6a7068', 'text-muted': '#a0a898',
    border: '#d8dcd4', 'border-light': '#e8ece4',
  },
});

export const royalTemplate = makeTemplate({
  id: 'royal', name: 'Royal', description: 'Majestic blue & gold — palatial grandeur',
  colors: {
    primary: '#c9a84c', 'primary-hover': '#b8953a', 'primary-light': '#1a2540',
    secondary: '#d4bc6a', 'secondary-hover': '#c4a850', accent: '#a8883a',
    background: '#0a1628', 'background-alt': '#0e1e38', surface: '#162848',
    text: '#f0f4fc', 'text-secondary': '#b0c0dc', 'text-muted': '#6880a8',
    border: '#2a3a5c', 'border-light': '#1e2e4a',
  },
});

export const celesteTemplate = makeTemplate({
  id: 'celeste', name: 'Celeste', description: 'Celestial sky blue — ethereal beauty',
  colors: {
    primary: '#7ab8d4', 'primary-hover': '#68a4c0', 'primary-light': '#f0f8fc',
    secondary: '#90c8e0', 'secondary-hover': '#7ab8d0', accent: '#b8d8e8',
    background: '#ffffff', 'background-alt': '#f0f6fa', surface: '#ffffff',
    text: '#1a3040', 'text-secondary': '#5a7888', 'text-muted': '#98b0c0',
    border: '#d0e4f0', 'border-light': '#e0eef4',
  },
});

export const veronaTemplate = makeTemplate({
  id: 'verona', name: 'Verona', description: 'Italian romance — warm terracotta',
  colors: {
    primary: '#b85c5c', 'primary-hover': '#a04848', 'primary-light': '#faf3ec',
    secondary: '#c88060', 'secondary-hover': '#b87050', accent: '#d4a880',
    background: '#faf3ec', 'background-alt': '#f5e8d8', surface: '#ffffff',
    text: '#3d2018', 'text-secondary': '#7a4830', 'text-muted': '#b88868',
    border: '#e8d4c0', 'border-light': '#f0e0d0',
  },
});

export const noirTemplate = makeTemplate({
  id: 'noir', name: 'Noir', description: 'Monochrome dark — fashion editorial',
  colors: {
    primary: '#e0e0e0', 'primary-hover': '#c8c8c8', 'primary-light': '#2a2a2a',
    secondary: '#b0b0b0', 'secondary-hover': '#989898', accent: '#ffffff',
    background: '#0d0d0d', 'background-alt': '#1a1a1a', surface: '#1a1a1a',
    text: '#f0f0f0', 'text-secondary': '#b0b0b0', 'text-muted': '#707070',
    border: '#333333', 'border-light': '#2a2a2a',
  },
});

// Monolithic (self-contained) templates — bypass makeTemplate (no theme/layout).
export {
  premiumWeddingTemplate,
  terracottaWeddingTemplate,
  luxuryWeddingTemplate,
  metatahBaliTemplate,
  birthdayGalaTemplate,
  birthdayWishTemplate,
  floraWeddingTemplate,
  hanaWeddingTemplate,
} from "./premium";

// Mobile-canvas meta-template.
export const mobileCanvasTemplate: TemplateDefinition = {
  id: 'mobile-canvas',
  name: 'Mobile Canvas',
  description: 'Canva-like builder — posisikan teks, gambar, tombol bebas di kanvas mobile. Cocok untuk ucapan, pengumuman, dan undangan sederhana.',
  kind: 'mobile-canvas',
  category: 'event',
  mode: 'solo',
};
