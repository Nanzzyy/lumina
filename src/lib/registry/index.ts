/**
 * Central registry — wires templates, sections, and content together.
 * Run once at app startup to register everything.
 */
import { SectionRegistry, registerTemplate } from '@/lib/template';
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

export function registerAllSections() {
  SectionRegistry.hero = Hero;
  SectionRegistry.cover = Cover;
  SectionRegistry.story = Story;
  SectionRegistry.gallery = Gallery;
  SectionRegistry.timeline = Timeline;
  SectionRegistry.quote = Quote;
  SectionRegistry.rsvp = RSVP;
  SectionRegistry.gift = Gift;
  SectionRegistry.guestbook = GuestBook;
  SectionRegistry.maps = Maps;
  SectionRegistry.footer = Footer;
  SectionRegistry.countdown = CountdownSection;
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

export function initializeRegistries() {
  registerAllSections();
  registerAllTemplates();
}
