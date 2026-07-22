import type { TemplateDefinition } from '@/lib/template/types';

export type { MonolithicTemplateProps } from '@/lib/template/types';
import { UndanganPernikahanPremium } from './UndanganPernikahanPremium';
import { UndanganPernikahanTerracotta } from './UndanganPernikahanTerracotta';
import { UndanganPernikahanLuxury } from './UndanganPernikahanLuxury';
import { UndanganMetatahBali, UndanganBirthdayGala } from './UndanganCelebrationPremium';
import { UndanganBirthdayWish } from './UndanganBirthdayWish';
import { UndanganPernikahanFlora } from './UndanganPernikahanFlora';
import { UndanganPernikahanHana } from './UndanganPernikahanHana';
import { UndanganPernikahanSakura } from './UndanganPernikahanSakura';

/**
 * Monolithic premium templates — a single self-contained component renders the
 * whole page from InvitationContent. No theme/layout/sections.
 * Register via registerTemplate() in src/lib/registry/index.ts.
 */
export const premiumWeddingTemplate: TemplateDefinition = {
  id: 'undangan-premium',
  name: 'Undangan Pernikahan Premium',
  description: 'Template premium siap pakai — cover, countdown, mempelai, love story, acara, galeri, RSVP, gift.',
  kind: 'monolithic',
  category: 'wedding',
  component: UndanganPernikahanPremium,
};

export const terracottaWeddingTemplate: TemplateDefinition = {
  id: 'undangan-terracotta',
  name: 'Pernikahan Terracotta',
  description: 'Editorial arch — earth tone terracotta, arsitektur, font Italiana, cover asimetris.',
  kind: 'monolithic',
  category: 'wedding',
  component: UndanganPernikahanTerracotta,
};

export const luxuryWeddingTemplate: TemplateDefinition = {
  id: 'undangan-luxury',
  name: 'Pernikahan Luxury Gold',
  description: 'Nuansa emas mewah & hijau gelap — Cinzel, foto lingkaran, ornamen emas.',
  kind: 'monolithic',
  category: 'wedding',
  component: UndanganPernikahanLuxury,
};

export const metatahBaliTemplate: TemplateDefinition = {
  id: 'undangan-metatah-bali',
  name: 'Metatah / Mepandes (Bali)',
  description: 'Upacara Manusa Yadna — terracotta Bali & emas, ornamen Bali, nuansa spiritual Hindu.',
  kind: 'monolithic',
  category: 'event',
  component: UndanganMetatahBali,
};

export const birthdayGalaTemplate: TemplateDefinition = {
  id: 'undangan-birthday-gala',
  name: 'Birthday Gala',
  description: 'Celebration mewah — cosmic gold & platinum, font Playfair, vibe pesta malam elegan.',
  kind: 'monolithic',
  category: 'event',
  mode: 'solo',
  component: UndanganBirthdayGala,
};

export const birthdayWishTemplate: TemplateDefinition = {
  id: 'undangan-birthday-wish',
  name: 'Birthday Wish',
  description: 'Halaman kirim ucapan & hadiah — tanpa cover, tanpa countdown. Langsung galeri, form ucapan, dan gift.',
  kind: 'monolithic',
  category: 'event',
  mode: 'solo',
  component: UndanganBirthdayWish,
};

export const floraWeddingTemplate: TemplateDefinition = {
  id: 'undangan-flora',
  name: 'Pernikahan Floral',
  description: 'Mobile-first dengan ornamen bunga, daun, kelopak jatuh — palet warm earth peach, 10 animasi CSS unik, scroll reveal.',
  kind: 'monolithic',
  category: 'mobile',
  component: UndanganPernikahanFlora,
};

export const hanaWeddingTemplate: TemplateDefinition = {
  id: 'hana',
  name: 'Hana 花',
  description: 'Minimalist luxury — warm ivory & gold, font Playfair + Outfit, clean editorial elegance, shadow-lightbox gallery, all sections editable.',
  kind: 'monolithic',
  category: 'mobile',
  component: UndanganPernikahanHana,
};

export const sakuraWeddingTemplate: TemplateDefinition = {
  id: 'sakura',
  name: 'Sakura 桜',
  description: 'Cherry blossom elegance — palet plum & pink, font Petit Formal Script + DM Sans, ornamen bunga sakura, floating petals, animasi smooth.',
  kind: 'monolithic',
  category: 'mobile',
  component: UndanganPernikahanSakura,
};

