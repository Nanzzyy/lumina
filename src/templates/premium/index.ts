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
import { UndanganPernikahanKaze } from './UndanganPernikahanKaze';
import { UndanganPernikahanLiana } from './UndanganPernikahanLiana';
import { UndanganPernikahanSora } from './UndanganPernikahanSora';
import { UndanganPernikahanMatahari } from './UndanganPernikahanMatahari';
import { UndanganPernikahanYuki } from './UndanganPernikahanYuki';
import { UndanganPernikahanPasir } from './UndanganPernikahanPasir';
import { UndanganPernikahanCinta } from './UndanganPernikahanCinta';
import { UndanganPernikahanBumi } from './UndanganPernikahanBumi';
import { UndanganPernikahanAwan } from './UndanganPernikahanAwan';
import { UndanganPernikahanRatu } from './UndanganPernikahanRatu';
import { UndanganPernikahanLaut } from './UndanganPernikahanLaut';
import { UndanganPernikahanHutan } from './UndanganPernikahanHutan';

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

export const kazeWeddingTemplate: TemplateDefinition = {
  id: 'kaze',
  name: 'Kaze 風',
  description: 'Indigo storm — paper & indigo, vermillion accent, gold wave ornament, font Cormorant Garamond + Inter, Japanese grid aesthetic.',
  kind: 'monolithic',
  category: 'mobile',
  component: UndanganPernikahanKaze,
};

export const lianaWeddingTemplate: TemplateDefinition = {
  id: 'liana',
  name: 'Liana 藤',
  description: 'Botanical sage — pine & parchment, clay-coral accent, daun (leaf) ornaments, swaying falling leaves, font Fraunces + Mulish + Caveat, asymmetric organic editorial.',
  kind: 'monolithic',
  category: 'mobile',
  component: UndanganPernikahanLiana,
};

export const soraWeddingTemplate: TemplateDefinition = {
  id: 'sora', name: 'Sora 空',
  description: 'Midnight Aurora — deep midnight + aurora teal/violet, glassmorphism cards, constellation & crescent moon ornaments, twinkle/aurora-drift motion, Marcellus + Jost.',
  kind: 'monolithic', category: 'mobile', component: UndanganPernikahanSora,
};

export const matahariWeddingTemplate: TemplateDefinition = {
  id: 'matahari', name: 'Matahari',
  description: 'Tropical Vibrant — sunset coral, golden & ocean teal, sunburst/palm/hibiscus ornaments, arched cards, bouncy spring motion, Caprasimo + DM Sans.',
  kind: 'monolithic', category: 'mobile', component: UndanganPernikahanMatahari,
};

export const yukiWeddingTemplate: TemplateDefinition = {
  id: 'yuki', name: 'Yuki 雪',
  description: 'Winter Crystal — ice white, frost blue & lavender, snowflake/frost-edge ornaments, diamond-framed photos, gentle falling-snow motion, Spectral + Manrope.',
  kind: 'monolithic', category: 'mobile', component: UndanganPernikahanYuki,
};

export const pasirWeddingTemplate: TemplateDefinition = {
  id: 'pasir', name: 'Pasir',
  description: 'Adobe Desert — adobe clay, desert rose & turquoise, tribal step-pattern/sun-motif ornaments, adobe-arch photos, geometric clip reveal, Zilla Slab + Karla.',
  kind: 'monolithic', category: 'mobile', component: UndanganPernikahanPasir,
};

export const cintaWeddingTemplate: TemplateDefinition = {
  id: 'cinta', name: 'Cinta',
  description: 'Burgundy Wine Romance — deep burgundy, blush & champagne, rose line-art & wine-swirl ornaments, arched portraits, velvet fade + gold shimmer, EB Garamond + Lora.',
  kind: 'monolithic', category: 'mobile', component: UndanganPernikahanCinta,
};

export const bumiWeddingTemplate: TemplateDefinition = {
  id: 'bumi', name: 'Bumi',
  description: 'Terrazzo Clay Pop — clay, olive & mustard, terrazzo confetti & squiggle ornaments, blob-masked photos, bouncy spring pop, Bricolage Grotesque + Plus Jakarta Sans.',
  kind: 'monolithic', category: 'mobile', component: UndanganPernikahanBumi,
};

export const awanWeddingTemplate: TemplateDefinition = {
  id: 'awan', name: 'Awan',
  description: 'Soft Dreamy Pastel — periwinkle, butter & mint on cloud-white, cloud/balloon ornaments, circle photos on clouds, float-drift motion, Quicksand + Nunito.',
  kind: 'monolithic', category: 'mobile', component: UndanganPernikahanAwan,
};

export const ratuWeddingTemplate: TemplateDefinition = {
  id: 'ratu', name: 'Ratu',
  description: 'Art Deco Emerald-Gold — emerald, gold & black, deco-fan/chevron ornaments, octagon/diamond photos, symmetric center-outward wipe + gold shimmer, Poiret One + Josefin Sans.',
  kind: 'monolithic', category: 'mobile', component: UndanganPernikahanRatu,
};

export const lautWeddingTemplate: TemplateDefinition = {
  id: 'laut', name: 'Laut',
  description: 'Mediterranean Coastal — deep teal, coral & sand, wave/shell/coral ornaments, dome-arch photos, wave-motion & ripple expand, Cardo + Work Sans.',
  kind: 'monolithic', category: 'mobile', component: UndanganPernikahanLaut,
};

export const hutanWeddingTemplate: TemplateDefinition = {
  id: 'hutan', name: 'Hutan',
  description: 'Moody Enchanted Forest — deep forest, copper & amber glow, firefly/pine-sprig ornaments, amber-glow-ring photos, firefly pulse & glow throb, Prata + Manrope.',
  kind: 'monolithic', category: 'mobile', component: UndanganPernikahanHutan,
};

