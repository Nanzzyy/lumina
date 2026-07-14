/**
 * Central registry — wires templates, sections, layouts, and content together.
 * Run once at app startup to register everything.
 */
import { SectionRegistry, registerTemplate } from '@/lib/template';
import { registerLayout, syncLayoutsFromDB } from '@/lib/layout';
import { Hero } from '@/components/sections/Hero';
import { Cover } from '@/components/sections/Cover';
import { Story } from '@/components/sections/Story';
import { Gallery } from '@/components/sections/Gallery';
import { Timeline } from '@/components/sections/Timeline';
import { Quote } from '@/components/sections/Quote';
import { RSVP } from '@/components/sections/RSVP';
import { Gift } from '@/components/sections/Gift';
import { GuestBook } from '@/components/sections/GuestBook';
import { Maps } from '@/components/sections/Maps';
import { Footer } from '@/components/sections/Footer';
import { CountdownSection } from '@/components/sections/Countdown';
import {
  auroraTemplate, fleurTemplate, lunaTemplate, ivoryTemplate,
  sakuraTemplate, nordicTemplate, royalTemplate, celesteTemplate,
  veronaTemplate, noirTemplate,
} from '@/templates/all-templates';
import {
  defaultLayout, modernLayout, adatBaliLayout,
  romanticLayout, minimalLayout,
} from '@/layouts/built-in';

export function registerAllSections() {
  SectionRegistry.register('hero', Hero);
  SectionRegistry.register('cover', Cover);
  SectionRegistry.register('story', Story);
  SectionRegistry.register('gallery', Gallery);
  SectionRegistry.register('timeline', Timeline);
  SectionRegistry.register('quote', Quote);
  SectionRegistry.register('rsvp', RSVP);
  SectionRegistry.register('gift', Gift);
  SectionRegistry.register('guestbook', GuestBook);
  SectionRegistry.register('maps', Maps);
  SectionRegistry.register('footer', Footer);
  SectionRegistry.register('countdown', CountdownSection);
}

export function registerAllTemplates() {
  registerTemplate(auroraTemplate);
  registerTemplate(fleurTemplate);
  registerTemplate(lunaTemplate);
  registerTemplate(ivoryTemplate);
  registerTemplate(sakuraTemplate);
  registerTemplate(nordicTemplate);
  registerTemplate(royalTemplate);
  registerTemplate(celesteTemplate);
  registerTemplate(veronaTemplate);
  registerTemplate(noirTemplate);
}

export function registerAllLayouts() {
  registerLayout(defaultLayout);
  registerLayout(modernLayout);
  registerLayout(adatBaliLayout);
  registerLayout(romanticLayout);
  registerLayout(minimalLayout);
}

export function initializeRegistries() {
  registerAllSections();
  registerAllTemplates();
  registerAllLayouts();
  // Sync any custom layouts from DB into memory registry
  syncLayoutsFromDB().catch(() => {});
}
