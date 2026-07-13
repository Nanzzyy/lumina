/**
 * Central registry — wires templates, sections, and content together.
 * Run once at app startup to register everything.
 */
import { SectionRegistry, registerTemplate } from '@/lib/template';
import { Hero } from '@/components/sections/Hero';
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
import { ariaTemplate } from '@/templates/aria';
import { noirTemplate } from '@/templates/noir';

/**
 * Register all section components.
 * The template engine uses this map to find components by section type.
 */
export function registerAllSections() {
  SectionRegistry.hero = Hero;
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

/**
 * Register all templates.
 * New templates should be added here.
 */
export function registerAllTemplates() {
  registerTemplate(ariaTemplate);
  registerTemplate(noirTemplate);
}

/**
 * Initialize all registries.
 */
export function initializeRegistries() {
  registerAllSections();
  registerAllTemplates();
}
