import type { ThemeTypography } from './types';

export interface FontOption {
  id: string;
  label: string;
  family: string;
  importUrl: string;
  category: string;
}

export interface FontPreset {
  id: string;
  name: string;
  description: string;
  heading: string;
  body: string;
  accent: string;
}

const google = (family: string) =>
  `https://fonts.googleapis.com/css2?family=${family}&display=swap`;

export const FONT_OPTIONS: FontOption[] = [
  { id: 'playfair', label: 'Playfair Display', family: "'Playfair Display', Georgia, serif", importUrl: google('Playfair+Display:wght@400;500;600;700'), category: 'Romantis' },
  { id: 'cormorant', label: 'Cormorant Garamond', family: "'Cormorant Garamond', Georgia, serif", importUrl: google('Cormorant+Garamond:wght@400;500;600;700'), category: 'Elegan' },
  { id: 'dm-serif', label: 'DM Serif Display', family: "'DM Serif Display', Georgia, serif", importUrl: google('DM+Serif+Display'), category: 'Klasik' },
  { id: 'marcellus', label: 'Marcellus', family: "'Marcellus', Georgia, serif", importUrl: google('Marcellus'), category: 'Editorial' },
  { id: 'italiana', label: 'Italiana', family: "'Italiana', Georgia, serif", importUrl: google('Italiana'), category: 'Editorial' },
  { id: 'fraunces', label: 'Fraunces', family: "'Fraunces', Georgia, serif", importUrl: google('Fraunces:wght@400;500;600;700'), category: 'Organik' },
  { id: 'cinzel', label: 'Cinzel', family: "'Cinzel', Georgia, serif", importUrl: google('Cinzel:wght@400;500;600;700'), category: 'Luxury' },
  { id: 'spectral', label: 'Spectral', family: "'Spectral', Georgia, serif", importUrl: google('Spectral:wght@400;500;600;700'), category: 'Klasik' },
  { id: 'zilla-slab', label: 'Zilla Slab', family: "'Zilla Slab', Georgia, serif", importUrl: google('Zilla+Slab:wght@400;500;600;700'), category: 'Unik' },
  { id: 'eb-garamond', label: 'EB Garamond', family: "'EB Garamond', Georgia, serif", importUrl: google('EB+Garamond:wght@400;500;600;700'), category: 'Romantis' },
  { id: 'inter', label: 'Inter', family: "'Inter', system-ui, sans-serif", importUrl: google('Inter:wght@400;500;600;700'), category: 'Modern' },
  { id: 'dm-sans', label: 'DM Sans', family: "'DM Sans', system-ui, sans-serif", importUrl: google('DM+Sans:wght@400;500;600;700'), category: 'Modern' },
  { id: 'montserrat', label: 'Montserrat', family: "'Montserrat', system-ui, sans-serif", importUrl: google('Montserrat:wght@400;500;600;700'), category: 'Modern' },
  { id: 'jost', label: 'Jost', family: "'Jost', system-ui, sans-serif", importUrl: google('Jost:wght@400;500;600;700'), category: 'Modern' },
  { id: 'mulish', label: 'Mulish', family: "'Mulish', system-ui, sans-serif", importUrl: google('Mulish:wght@400;500;600;700'), category: 'Modern' },
  { id: 'manrope', label: 'Manrope', family: "'Manrope', system-ui, sans-serif", importUrl: google('Manrope:wght@400;500;600;700'), category: 'Modern' },
  { id: 'plus-jakarta', label: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', system-ui, sans-serif", importUrl: google('Plus+Jakarta+Sans:wght@400;500;600;700'), category: 'Modern' },
  { id: 'great-vibes', label: 'Great Vibes', family: "'Great Vibes', cursive", importUrl: google('Great+Vibes'), category: 'Script' },
  { id: 'parisienne', label: 'Parisienne', family: "'Parisienne', cursive", importUrl: google('Parisienne'), category: 'Script' },
  { id: 'sacramento', label: 'Sacramento', family: "'Sacramento', cursive", importUrl: google('Sacramento'), category: 'Script' },
  { id: 'caveat', label: 'Caveat', family: "'Caveat', cursive", importUrl: google('Caveat:wght@400;500;600;700'), category: 'Script' },
  { id: 'petit-formal', label: 'Petit Formal Script', family: "'Petit Formal Script', cursive", importUrl: google('Petit+Formal+Script'), category: 'Script' },
  { id: 'noto-serif-jp', label: 'Noto Serif JP', family: "'Noto Serif JP', Georgia, serif", importUrl: google('Noto+Serif+JP:wght@400;500;600;700'), category: 'Japanese' },
  { id: 'caprasimo', label: 'Caprasimo', family: "'Caprasimo', Georgia, serif", importUrl: google('Caprasimo'), category: 'Fun' },
  { id: 'karla', label: 'Karla', family: "'Karla', system-ui, sans-serif", importUrl: google('Karla:wght@400;500;600;700'), category: 'Modern' },
];

const byId = Object.fromEntries(FONT_OPTIONS.map((font) => [font.id, font]));

export const FONT_PRESETS: FontPreset[] = [
  { id: 'classic-romance', name: 'Classic Romance', description: 'Timeless, lembut, dan aman untuk hampir semua template.', heading: 'playfair', body: 'inter', accent: 'great-vibes' },
  { id: 'editorial-elegance', name: 'Editorial Elegance', description: 'Kontras serif dan sans yang terasa premium.', heading: 'cormorant', body: 'montserrat', accent: 'great-vibes' },
  { id: 'botanical-soft', name: 'Botanical Soft', description: 'Organik dan hangat untuk tema floral atau earth tone.', heading: 'fraunces', body: 'mulish', accent: 'caveat' },
  { id: 'moonlit-modern', name: 'Moonlit Modern', description: 'Bersih dan dramatis untuk tema malam atau minimal.', heading: 'marcellus', body: 'jost', accent: 'parisienne' },
  { id: 'luxury-gold', name: 'Luxury Gold', description: 'Formal, berkarakter, dan cocok dengan aksen emas.', heading: 'cinzel', body: 'montserrat', accent: 'sacramento' },
  { id: 'japanese-garden', name: 'Japanese Garden', description: 'Tenang dan refined untuk template bernuansa Jepang.', heading: 'noto-serif-jp', body: 'dm-sans', accent: 'petit-formal' },
  { id: 'tropical-joy', name: 'Tropical Joy', description: 'Berani dan ceria untuk undangan pesta atau celebration.', heading: 'caprasimo', body: 'dm-sans', accent: 'great-vibes' },
  { id: 'modern-minimal', name: 'Modern Minimal', description: 'Rapi, ringan, dan sangat mudah dibaca di mobile.', heading: 'dm-serif', body: 'inter', accent: 'caveat' },
];

const recommendedPresetByTemplate: Record<string, string> = {
  aurora: 'luxury-gold', royal: 'luxury-gold', noir: 'editorial-elegance',
  fleur: 'classic-romance', sakura: 'japanese-garden', luna: 'moonlit-modern',
  ivory: 'classic-romance', nordic: 'modern-minimal', verona: 'editorial-elegance', celeste: 'modern-minimal',
  'undangan-premium': 'editorial-elegance', 'undangan-bali-modern': 'moonlit-modern',
  'undangan-terracotta': 'botanical-soft', 'undangan-luxury': 'luxury-gold',
  'undangan-metatah-bali': 'luxury-gold', 'undangan-birthday-gala': 'luxury-gold',
  'undangan-birthday-wish': 'classic-romance', flora: 'botanical-soft', hana: 'classic-romance',
  kaze: 'editorial-elegance', liana: 'botanical-soft', sora: 'moonlit-modern',
  matahari: 'tropical-joy', yuki: 'classic-romance', pasir: 'botanical-soft',
  cinta: 'classic-romance', bumi: 'modern-minimal', awan: 'moonlit-modern',
  ratu: 'luxury-gold', laut: 'moonlit-modern', hutan: 'botanical-soft', melati: 'classic-romance', vino: 'editorial-elegance',
};

export function typographyFromPreset(preset: FontPreset): ThemeTypography {
  return {
    'font-heading': byId[preset.heading].family,
    'font-body': byId[preset.body].family,
    'font-accent': byId[preset.accent].family,
  };
}

export function getRecommendedFontPreset(templateId?: string): FontPreset {
  return FONT_PRESETS.find((preset) => preset.id === (templateId ? recommendedPresetByTemplate[templateId] : undefined)) || FONT_PRESETS[0];
}

export function getRecommendedTypography(templateId?: string): ThemeTypography {
  return typographyFromPreset(getRecommendedFontPreset(templateId));
}

export function getFontImportUrls(typography?: Partial<ThemeTypography>): string[] {
  if (!typography) return [];
  return Array.from(new Set(
    Object.values(typography)
      .map((family) => FONT_OPTIONS.find((font) => font.family === family)?.importUrl)
      .filter((url): url is string => Boolean(url)),
  ));
}
