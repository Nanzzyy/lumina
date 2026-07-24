/**
 * Central registry — wires templates, sections, layouts, and content together.
 * Run once at app startup to register everything.
 */
import { SectionRegistry, registerTemplate } from '@/lib/template';
import { registerLayout, syncLayoutsFromDB } from '@/lib/layout';
import { PluginHost } from '@/lib/plugin/host';
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
import { heroManifest, heroHooks } from '@/data/library/plugins/hero';
import { countdownManifest } from '@/data/library/plugins/countdown';
import { rsvpManifest } from '@/data/library/plugins/rsvp';
import {
  auroraTemplate, fleurTemplate, lunaTemplate, ivoryTemplate,
  sakuraTemplate, nordicTemplate, royalTemplate, celesteTemplate,
  veronaTemplate, noirTemplate, premiumWeddingTemplate, terracottaWeddingTemplate,
  luxuryWeddingTemplate, metatahBaliTemplate, birthdayGalaTemplate,
  birthdayWishTemplate, mobileCanvasTemplate, floraWeddingTemplate,
  hanaWeddingTemplate, sakuraWeddingTemplate, kazeWeddingTemplate,
  lianaWeddingTemplate, soraWeddingTemplate, matahariWeddingTemplate,
  yukiWeddingTemplate, pasirWeddingTemplate, cintaWeddingTemplate,
  bumiWeddingTemplate, awanWeddingTemplate, ratuWeddingTemplate,
  lautWeddingTemplate, hutanWeddingTemplate,
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
  registerTemplate(premiumWeddingTemplate);
  registerTemplate(terracottaWeddingTemplate);
  registerTemplate(luxuryWeddingTemplate);
  registerTemplate(metatahBaliTemplate);
  registerTemplate(birthdayGalaTemplate);
  registerTemplate(birthdayWishTemplate);
  registerTemplate(floraWeddingTemplate);
  registerTemplate(hanaWeddingTemplate);
  registerTemplate(sakuraWeddingTemplate);
  registerTemplate(kazeWeddingTemplate);
  registerTemplate(lianaWeddingTemplate);
  registerTemplate(soraWeddingTemplate);
  registerTemplate(matahariWeddingTemplate);
  registerTemplate(yukiWeddingTemplate);
  registerTemplate(pasirWeddingTemplate);
  registerTemplate(cintaWeddingTemplate);
  registerTemplate(bumiWeddingTemplate);
  registerTemplate(awanWeddingTemplate);
  registerTemplate(ratuWeddingTemplate);
  registerTemplate(lautWeddingTemplate);
  registerTemplate(hutanWeddingTemplate);
  registerTemplate(mobileCanvasTemplate);
}

export function registerAllLayouts() {
  registerLayout(defaultLayout);
  registerLayout(modernLayout);
  registerLayout(adatBaliLayout);
  registerLayout(romanticLayout);
  registerLayout(minimalLayout);
}

export let pluginHost: PluginHost | null = null;

export function initializeRegistries() {
  registerAllSections();
  registerAllTemplates();
  registerAllLayouts();

  // External template packages are loaded server-side — see server-init.ts.
  // On the client, only built-in templates are available for editing/preview.
  // This keeps the client bundle free of fs-dependent code.

  // Sync any custom layouts from DB into memory registry
  syncLayoutsFromDB().catch(() => {});

  // Initialize plugin host with builtin plugins (P7)
  initBuiltinPlugins().catch(() => {});
}

async function initBuiltinPlugins() {
  const host = new PluginHost();
  host.register(heroManifest, heroHooks);
  host.register(countdownManifest, {});
  host.register(rsvpManifest, {});
  const mockRuntime = {
    doc: { getProject: () => ({}), getPage: () => ({}), getNode: () => ({}) },
    renderTree: { getTree: () => ({}), getNode: () => undefined },
    registry: { listComponents: () => [], getComponent: () => undefined, listProperties: () => [] },
    assets: { resolve: (url: string) => url, getManifest: () => ({}) },
    bus: { on: () => () => {}, emit: () => {} },
    applyPatch: () => {},
    setVariable: () => {},
    transformRenderTree: () => {},
  };
  for (const id of ['lumina.hero', 'lumina.countdown', 'lumina.rsvp']) {
    await host.activate(id, mockRuntime as any);
  }
  pluginHost = host;
}
