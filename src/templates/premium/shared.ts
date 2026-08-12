import { createElement, useState, useEffect, useCallback, useRef, type FormEvent, type ReactNode } from 'react';
import type { InvitationContent, SectionBackground } from '@/lib/content/types';
import type { ThemeTypography } from '@/lib/theme/types';

/** Treat common video extensions as video (else image). */
export function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(url);
}

export const STATUS_LABEL: Record<string, string> = {
  hadir: 'Hadir',
  tidak_hadir: 'Tidak Hadir',
  ragu: 'Hadir',
};

export function timeAgo(iso: string): string {
  const normalized = /Z|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso.replace(' ', 'T')}Z`;
  const then = new Date(normalized).getTime();
  if (isNaN(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Now';
  if (min < 60) return `${min}m lalu`;
  const hr = Math.floor(diff / 3_600_000);
  if (hr < 24) return `${hr}h lalu`;
  return `${Math.floor(hr / 24)}d lalu`;
}

export interface WishRow {
  id: string;
  name: string;
  attendance: string;
  guests: string;
  message: string;
  time: string;
}

interface RsvpApiRow {
  id: string;
  name: string;
  status: string;
  guests: number;
  message?: string;
  created_at: string;
}

function toWish(e: RsvpApiRow): WishRow {
  return {
    id: e.id,
    name: e.name,
    attendance: STATUS_LABEL[e.status] ?? 'Hadir',
    guests: String(e.guests ?? 1),
    message: e.message || '',
    time: timeAgo(e.created_at),
  };
}

/** Shared RSVP + wishes wiring against /api/rsvp. */
export function useRsvpWishes(slug?: string) {
  const [wishes, setWishes] = useState<WishRow[]>([]);
  const [rsvpForm, setRsvpForm] = useState({ name: '', guests: '1', attendance: 'Hadir', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  /** Re-fetch the wish list from the server. */
  const refresh = useCallback(() => {
    if (!slug) return;
    fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((list: unknown) => {
        if (!Array.isArray(list)) return;
        setWishes((list as RsvpApiRow[]).map(toWish));
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rsvpForm.name.trim() || !rsvpForm.message.trim() || !slug) return;
    const status = rsvpForm.attendance === 'Tidak Hadir' ? 'tidak_hadir' : 'hadir';
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: rsvpForm.name.trim(),
          status,
          guests: Number(rsvpForm.guests) || 1,
          message: rsvpForm.message.trim(),
        }),
      });
      if (!res.ok) return;
      const created: RsvpApiRow = await res.json();
      setWishes((w) => [{ ...toWish(created), time: 'Now' }, ...w]);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRsvpForm({ name: '', guests: '1', attendance: 'Hadir', message: '' });
      }, 3000);
    } catch { /* ignore */ }
  };

  return { wishes, rsvpForm, setRsvpForm, isSubmitted, submit, refresh };
}

/** Date parser (ISO / English / Indonesian). Logic in @/lib/utils/date. */
import { parseFlexibleDate } from '@/lib/utils/date';
export { parseFlexibleDate };



/** Countdown to an event date (ISO / English / Indonesian). */
export function useCountdown(isoDate: string) {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = parseFlexibleDate(isoDate)?.getTime();
    if (!target || isNaN(target)) return;
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setT({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setT({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isoDate]);
  return t;
}

/** Read `?to=` guest name once. contentGuestName takes priority over URL param. */
export function useGuestName(contentGuestName?: string, fallback = 'Tamu Undangan') {
  const [name] = useState<string>(() => {
    if (contentGuestName) return contentGuestName;
    if (typeof window === 'undefined') return fallback;
    const to = new URLSearchParams(window.location.search).get('to');
    return to ? decodeURIComponent(to) : fallback;
  });
  return name;
}

export function displayDateFrom(iso: string, fallback?: string): string {
  const d = parseFlexibleDate(iso);
  if (!d) return fallback || iso;
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Resolve headline media with fallbacks. */
export function pickMedia(
  content: InvitationContent,
  fallback: { cover: string; hero: string; p1: string; p2: string; video?: string; footerImage?: string },
) {
  return {
    cover: content.media?.cover || fallback.cover,
    hero: content.media?.hero || fallback.hero,
    p1: content.media?.partner1Photo || fallback.p1,
    p2: content.media?.partner2Photo || fallback.p2,
    video: content.media?.video || fallback.video || '',
    footerImage: content.media?.footerImage || fallback.footerImage || '',
  };
}

/**
 * Applies the content-level visual controls to every self-contained premium
 * template. Premium templates intentionally keep their own art direction and
 * inline palette, so these overrides live at the renderer boundary instead of
 * being duplicated in every template component.
 *
 * The standard premium section order is shared by Kaze, Hana, Sakura, Liana,
 * Sora, and the other editorial templates. A template may opt into explicit
 * data-lumina-section attributes later; the positional fallback keeps existing
 * templates backwards compatible.
 */
export function MonolithicCustomization({
  content,
  templateId,
  typography,
  children,
}: {
  content: InvitationContent;
  templateId?: string;
  typography?: Partial<ThemeTypography>;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const setRoot = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const sectionKeys = templateId === 'undangan-bali-modern'
      ? ['hero', 'couple', 'countdown', 'event', 'story', 'gallery', 'gift', 'rsvp']
      : templateId === 'melati'
      ? [
        'hero', 'intro', 'couple', 'countdown', 'story', 'gallery',
        'video', 'quote', 'event', 'dresscode', 'liveStream', 'rundown', 'gift', 'rsvp',
      ]
      : templateId === 'hana'
      ? [
        'hero', 'quote', 'couple', 'countdown', 'story',
        'event', 'gallery', 'gift', 'rsvp',
      ]
      : [
      'hero', 'quote', 'couple', 'countdown', 'story',
      'event', 'gallery', 'rsvp', 'gift',
      ];
    const backgrounds = content.sectionBackgrounds || {};
    const visibility = content.sectionVisibility || {};
    const snapshots = new Map<HTMLElement, Map<string, readonly [string, string, string]>>();
    const snapshot = (element: HTMLElement, properties: string[]) => {
      let values = snapshots.get(element);
      if (!values) { values = new Map(); snapshots.set(element, values); }
      properties.forEach((property) => {
        if (!values?.has(property)) values?.set(property, [property, element.style.getPropertyValue(property), element.style.getPropertyPriority(property)] as const);
      });
    };

    const applyBackground = (element: HTMLElement, background?: SectionBackground) => {
      if (!background) return;
      const properties = [
        'background-color', 'background-image', 'background-size', 'background-position',
        'background-attachment', 'background-blend-mode', 'backdrop-filter',
        '-webkit-backdrop-filter', 'display',
      ];
      snapshot(element, properties);

      if (background.type === 'color' && background.color) {
        element.style.setProperty('background-color', background.color, 'important');
      }
      if (background.type === 'gradient' && background.gradient) {
        element.style.setProperty('background-image', background.gradient, 'important');
      }
      if (background.type === 'image' && background.image) {
        element.style.setProperty('background-image', `url(${JSON.stringify(background.image)})`, 'important');
        element.style.setProperty('background-size', 'cover', 'important');
        element.style.setProperty('background-position', 'center', 'important');
        element.style.setProperty('background-attachment', 'scroll', 'important');
      }
      if (background.overlay === 'darken') {
        const opacity = Math.max(0, Math.min(1, background.overlayOpacity ?? 0.4));
        const overlay = `linear-gradient(rgba(0,0,0,${opacity}), rgba(0,0,0,${opacity}))`;
        element.style.setProperty('background-image', background.type === 'image' && background.image
          ? `${overlay}, url(${JSON.stringify(background.image)})`
          : overlay, 'important');
        element.style.setProperty('background-blend-mode', 'multiply', 'important');
      }
      if (background.overlay === 'blur') {
        element.style.setProperty('backdrop-filter', 'blur(4px)', 'important');
        element.style.setProperty('-webkit-backdrop-filter', 'blur(4px)', 'important');
      }

    };

    const allElements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
    const isFullScreenOverlay = (element: HTMLElement) => {
      const classes = element.className;
      return typeof classes === 'string'
        && classes.includes('fixed')
        && classes.includes('inset-0')
        && classes.includes('z-50');
    };

    // The first full-screen z-50 layer is the opening cover in all premium
    // templates. It is also present in Bali Modern while its main page stays
    // mounted, which makes the cover override work in both architectures.
    const cover = allElements.find(isFullScreenOverlay);
    const coverUrl = content.media?.cover;
    if (cover && coverUrl && !isVideo(coverUrl)) {
      snapshot(cover, ['background-image', 'background-size', 'background-position']);
      cover.style.setProperty('background-image', `linear-gradient(rgba(0,0,0,0.16), rgba(0,0,0,0.16)), url(${JSON.stringify(coverUrl)})`, 'important');
      cover.style.setProperty('background-size', 'cover', 'important');
      cover.style.setProperty('background-position', 'center', 'important');
    }

    // Only count page sections. Some templates may use a nested <section> for
    // a card or an embedded layout; that must not consume a page number or
    // shift the semantic background/visibility mapping.
    const sections = Array.from(root.querySelectorAll<HTMLElement>('section'))
      .filter((section) => !section.parentElement?.closest('section'));
    sections.forEach((section, index) => {
      const declaredKey = section.dataset.luminaSection || section.id;
      const key = {
        'couuple-information': 'couple',
        'save-the-date': 'countdown',
        'wedding-venue': 'event',
        'wedding-gift-section': 'gift',
      }[declaredKey] || declaredKey || sectionKeys[index];
      if (!key) return;
      const background = backgrounds[key];
      applyBackground(section, background);
      if (visibility[key] === false) {
        snapshot(section, ['display']);
        section.style.setProperty('display', 'none', 'important');
      }
    });
    const footer = root.querySelector<HTMLElement>('footer');
    if (footer) {
      applyBackground(footer, backgrounds.footer);
      if (visibility.footer === false) {
        snapshot(footer, ['display']);
        footer.style.setProperty('display', 'none', 'important');
      }
    }

    // Chapter/badge markers are authored by each visual template, but their
    // sequence belongs to the active page. Renumber only marker elements so
    // story-item numbers and countdown digits remain untouched when a section
    // is hidden.
    let chapterNumber = 1;
    sections
      .filter((section) => getComputedStyle(section).display !== 'none')
      .forEach((section) => {
        const markers = section.querySelectorAll<HTMLElement>('[data-lumina-section-number]');
        markers.forEach((marker) => {
          marker.textContent = String(chapterNumber).padStart(2, '0');
          chapterNumber += 1;
        });
      });

    const pageBackground = backgrounds.global || backgrounds.page;
    if (pageBackground) {
      const pageRoot = Array.from(root.children).find((element) =>
        !isFullScreenOverlay(element as HTMLElement) && (element.querySelector('section') || element.tagName === 'MAIN'),
      ) as HTMLElement | undefined;
      if (pageRoot) applyBackground(pageRoot, pageBackground);
    }

    return () => {
      snapshots.forEach((values, element) => {
        values.forEach(([property, value, priority]) => {
          if (value) element.style.setProperty(property, value, priority);
          else element.style.removeProperty(property);
        });
      });
    };
  }, [content, templateId]);

  // Some premium templates mount their main sections only after the cover is
  // opened. Re-apply visibility and chapter numbers when that subtree arrives.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof MutationObserver === 'undefined') return;
    const sectionKeys = templateId === 'undangan-bali-modern'
      ? ['hero', 'couple', 'countdown', 'event', 'story', 'gallery', 'gift', 'rsvp']
      : templateId === 'melati'
      ? ['hero', 'intro', 'couple', 'countdown', 'story', 'gallery', 'video', 'quote', 'event', 'dresscode', 'liveStream', 'rundown', 'gift', 'rsvp']
      : templateId === 'hana'
      ? ['hero', 'quote', 'couple', 'countdown', 'story', 'event', 'gallery', 'gift', 'rsvp']
      : ['hero', 'quote', 'couple', 'countdown', 'story', 'event', 'gallery', 'rsvp', 'gift'];
    const visibility = content.sectionVisibility || {};
    let frame = 0;
    const applyToMountedSections = () => {
      const sections = Array.from(root.querySelectorAll<HTMLElement>('section'))
        .filter((section) => !section.parentElement?.closest('section'));
      sections.forEach((section, index) => {
        const declaredKey = section.dataset.luminaSection || section.id;
        const key = {
          'couuple-information': 'couple',
          'save-the-date': 'countdown',
          'wedding-venue': 'event',
          'wedding-gift-section': 'gift',
        }[declaredKey] || declaredKey || sectionKeys[index];
        if (key && visibility[key] === false) section.style.setProperty('display', 'none', 'important');
      });
      let chapterNumber = 1;
      sections
        .filter((section) => getComputedStyle(section).display !== 'none')
        .forEach((section) => {
          section.querySelectorAll<HTMLElement>('[data-lumina-section-number]').forEach((marker) => {
            const value = String(chapterNumber).padStart(2, '0');
            if (marker.textContent !== value) marker.textContent = value;
            chapterNumber += 1;
          });
        });
    };
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(applyToMountedSections);
    });
    observer.observe(root, { childList: true, subtree: true });
    applyToMountedSections();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [content, templateId]);

  const hasTypographyOverride = Boolean(typography && Object.keys(typography).length > 0);
  const safeFont = (value?: string) => value && /^[a-zA-Z0-9\s,'_-]+$/.test(value) ? value : 'inherit';
  const fontStyles = hasTypographyOverride ? `
.lumina-monolithic-customization { --lumina-font-heading: ${safeFont(typography?.['font-heading'])}; --lumina-font-body: ${safeFont(typography?.['font-body'])}; --lumina-font-accent: ${safeFont(typography?.['font-accent'])}; font-family: var(--lumina-font-body) !important; }
.lumina-monolithic-customization h1,
.lumina-monolithic-customization h2,
.lumina-monolithic-customization h3,
.lumina-monolithic-customization h4,
.lumina-monolithic-customization h5,
.lumina-monolithic-customization h6,
.lumina-monolithic-customization .font-display,
.lumina-monolithic-customization .font-title,
.lumina-monolithic-customization .font-serif,
.lumina-monolithic-customization .font-serif-wedding,
.lumina-monolithic-customization .font-serif-terracotta,
.lumina-monolithic-customization .font-luxury-serif,
.lumina-monolithic-customization .font-header-deco,
.lumina-monolithic-customization .font-bm-parisienne { font-family: var(--lumina-font-heading) !important; }
.lumina-monolithic-customization p,
.lumina-monolithic-customization li,
.lumina-monolithic-customization label,
.lumina-monolithic-customization input,
.lumina-monolithic-customization textarea,
.lumina-monolithic-customization select,
.lumina-monolithic-customization button,
.lumina-monolithic-customization a,
.lumina-monolithic-customization .font-body,
.lumina-monolithic-customization .font-sans,
.lumina-monolithic-customization .font-sans-wedding,
.lumina-monolithic-customization .font-sans-terracotta,
.lumina-monolithic-customization .font-sans-clean,
.lumina-monolithic-customization .font-bm-montserrat,
.lumina-monolithic-customization .font-bm-roboto { font-family: var(--lumina-font-body) !important; }
.lumina-monolithic-customization .font-accent,
.lumina-monolithic-customization .font-cursive,
.lumina-monolithic-customization .font-cursive-love,
.lumina-monolithic-customization .font-script,
.lumina-monolithic-customization .font-display-accent { font-family: var(--lumina-font-accent) !important; }
` : '';

  return createElement(
    'div',
    { ref: setRoot, className: 'lumina-monolithic-customization' },
    hasTypographyOverride ? createElement('style', null, fontStyles) : null,
    children,
  );
}
