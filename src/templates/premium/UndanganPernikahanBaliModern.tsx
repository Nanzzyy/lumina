'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent } from '@/lib/content/types';
import {
  Heart, Clock, MapPin, Copy, Check,
  ChevronLeft, ChevronRight, Volume2, VolumeX, Gift, MessageSquare, Map,
  CalendarPlus, AtSign, Quote,
} from 'lucide-react';
import { isVideo, useRsvpWishes, useCountdown, useGuestName, displayDateFrom, pickMedia } from './shared';
import { useAutoplayMusic } from './_music';

/**
 * "Bali Modern" — split-screen Bali wedding invitation.
 * Split layout: fixed prewed video on the right 40vw + a static cover panel
 * on the left 60vw (desktop), single column over full-bleed video on mobile.
 * Parisienne +
 * Montserrat + Roboto typography. Signature sections: "Om Swastyastu" couple,
 * Save The Date countdown, venue card, love story slider, "Our Moment" gallery
 * + lightbox, gift cards, RSVP, wedding wish, fullscreen footer and a fixed
 * music player. A "Buka Undangan" gate (which the reference does not have but
 * the product wants) covers the layout until the guest opens it. All data flows
 * from InvitationContent via deriveData() with DEFAULTS fallbacks, so every
 * section stays editable in the Lumina studio. Reference assets ship from
 * /public/bali-modern (1:1 match); studio overrides still win.
 */

const A = '/bali-modern';
const DEFAULTS = {
  couple: {
    p1: { nick: 'Wardana', full: 'I Kadek Wardana', father: 'Bapak I Ketut Sadia', mother: 'Ibu Ni Made Murniati', ig: 'wardana.87', childOrder: 'Anak Kedua', desc: 'Tumbuh di antara sawah dan senyum keluarga.' },
    p2: { nick: 'Moni', full: 'Ni Made Moni Melia Santi, S.Kep', father: 'Bapak Drg. I Wayan Nik Arsana, S.KG', mother: 'Ibu Ni Nyoman Kariani', ig: 'moniimeliaa', childOrder: 'Anak Kedua', desc: 'Tumbuh dari keluarga yang hangat, dengan mimpi besar dan hati yang tulus.' },
  },
  date: '2026-06-03T13:00:00',
  quote: { text: 'Wahai pasangan suami-istri, bersatulah dalam cinta, dan semoga keturunanmu penuh kebahagiaan.', source: 'Rg Veda : X.85.42' },
  events: [
    { title: 'Resepsi', time: '13:00 WITA - Selesai', venue: 'Jabon Homestay', address: 'Gg. Anila no 1, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571', mapsUrl: 'https://maps.google.com', note: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.' },
  ],
  heroSlides: [`${A}/ABP_2608.jpg`, `${A}/ABZ_8666.jpg`, `${A}/ABP_2239.jpg`, `${A}/ABP_2124.jpg`],
  stories: [
    { year: '2018', title: 'Awal Cerita', desc: 'Perjalanan kami dimulai dengan pertemuan sederhana yang akhirnya mengikat dua hati.', image: `${A}/ABP_2095.jpg` },
    { year: '2022', title: 'Delapan Tahun Bersama', desc: 'Setiap musim yang kami lalui bersama menguatkan janji yang tumbuh pelan namun pasti.', image: `${A}/ABP_2277.jpg` },
    { year: '2026', title: 'Menuju Jenjang Pernikahan', desc: 'Dengan restu keluarga, kami melangkah menuju ikatan suci Manusa Yadnya Pawiwahan.', image: `${A}/ABP_2288.jpg` },
  ],
  gallery: [
    `${A}/ABP_2608.jpg`, `${A}/ABZ_8666.jpg`, `${A}/ABP_2239.jpg`, `${A}/ABP_2124.jpg`,
    `${A}/ABP_2095.jpg`, `${A}/ABP_2277.jpg`, `${A}/ABP_2288.jpg`, `${A}/ABP_2323.jpg`,
    `${A}/ABP_2513.jpg`, `${A}/ABP_2662.jpg`, `${A}/ABP_2690.jpg`, `${A}/ABZ_8315.jpg`,
    `${A}/ABZ_8353.jpg`, `${A}/ABZ_8602.jpg`, `${A}/ABZ_8605.jpg`, `${A}/ABZ_8606.jpg`,
    `${A}/ABZ_8707.jpg`, `${A}/ABZ_8786.jpg`, `${A}/ABZ_8877.jpg`, `${A}/ABZ_9205.jpg`,
    `${A}/ABZ_9312.jpg`, `${A}/ABZ_9337.jpg`, `${A}/ABZ_9390.jpg`,
  ],
  gifts: [
    { bank: 'Bank BRI', number: '059001018136505', owner: 'I Kadek Wardana' },
    { bank: 'Bank BCA', number: '1350703311', owner: 'Ni Made Moni Melia Santi' },
  ],
  audio: `${A}/music-westlife.mp3`,
  cover: `${A}/cover-desktop.webp`,
  hero: `${A}/cover-desktop.webp`,
  footer: `${A}/footer.webp`,
  p1: `${A}/wardana.webp`,
  p2: `${A}/moni.webp`,
};

function deriveData(content: InvitationContent) {
  const c = content.couple;
  const p1 = {
    nick: c.partner1 || DEFAULTS.couple.p1.nick,
    full: c.partner1Title || c.partner1 || DEFAULTS.couple.p1.full,
    father: c.partner1Father || DEFAULTS.couple.p1.father,
    mother: c.partner1Mother || DEFAULTS.couple.p1.mother,
    ig: c.partner1Instagram || DEFAULTS.couple.p1.ig,
    childOrder: c.partner1ChildOrder ?? DEFAULTS.couple.p1.childOrder,
    desc: c.partner1Desc || DEFAULTS.couple.p1.desc,
  };
  const p2 = {
    nick: c.partner2 || DEFAULTS.couple.p2.nick,
    full: c.partner2Title || c.partner2 || DEFAULTS.couple.p2.full,
    father: c.partner2Father || DEFAULTS.couple.p2.father,
    mother: c.partner2Mother || DEFAULTS.couple.p2.mother,
    ig: c.partner2Instagram || DEFAULTS.couple.p2.ig,
    childOrder: c.partner2ChildOrder ?? DEFAULTS.couple.p2.childOrder,
    desc: c.partner2Desc || DEFAULTS.couple.p2.desc,
  };
  const isoDate = content.event?.date || DEFAULTS.date;
  const displayDate = displayDateFrom(isoDate, DEFAULTS.date);
  const events = (content.schedule?.items?.length
    ? content.schedule.items.map((it) => ({ title: it.title || '', time: it.time || '', venue: it.venue || '', address: it.address || '', mapsUrl: it.mapsUrl || 'https://maps.google.com', note: it.description || '' }))
    : []).filter((e) => e.title);
  const heroSlideOverrides = content.media?.heroSlides?.filter(Boolean) || [];
  const heroSlides = heroSlideOverrides.length ? heroSlideOverrides : [];
  // Story timeline and gallery are intentionally independent data sources.
  // Do not fall back from one to the other: an empty story must not hide or
  // rename the gallery section through the customization layer.
  const stories = (content.stories || [])
    .filter((story) => story.title || story.desc || story.image)
    .map((s, i) => ({ ...s, image: s.image || DEFAULTS.stories[i % DEFAULTS.stories.length]?.image }));
  const gallery = (content.gallery?.images || [])
    .filter((src): src is string => typeof src === 'string' && src.trim().length > 0);
  const gifts = (content.gift?.items?.length
    ? content.gift.items.map((g) => ({ bank: g.bank || g.name || '', number: g.number || '', owner: g.owner || g.note || '' }))
    : []).filter((g) => g.bank || g.number);
  const quote = content.quote?.text ? { text: content.quote.text, source: content.quote.source || '' } : null;
  const audio = content.music?.src || DEFAULTS.audio;
  const media = pickMedia(content, { cover: DEFAULTS.cover, hero: DEFAULTS.hero, p1: DEFAULTS.p1, p2: DEFAULTS.p2, video: `${A}/video-prewed.mp4`, footerImage: DEFAULTS.footer });
  const footerMedia = media.footerImage;
  const bgVideo = media.video;
  const youtubeIds = [content.video?.youtubeId, content.video?.title].filter((v): v is string => !!v && /^[a-zA-Z0-9_-]{6,}$/.test(v));
  return { p1, p2, isoDate, displayDate, events, heroSlides, stories, gallery, gifts, quote, audio, media, footerMedia, bgVideo, youtubeIds };
}

function injectStyles() {
  if (typeof window === 'undefined') return;
  const id = 'wedding-theme-bali-modern';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Parisienne&family=Roboto:wght@300;400;500;700;900&family=Montserrat:wght@300;400;500;600&display=swap';
  document.head.appendChild(link);
  const style = document.createElement('style');
  style.innerHTML = `
    .font-bm-parisienne { font-family: 'Parisienne', cursive; }
    .font-bm-montserrat { font-family: 'Montserrat', system-ui, sans-serif; }
    .font-bm-roboto { font-family: 'Roboto', system-ui, sans-serif; }
    @keyframes bm-heartbeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.15); } 28% { transform: scale(1); } 42% { transform: scale(1.15); } 70% { transform: scale(1); } }
    .bm-heartbeat { animation: bm-heartbeat 1.5s ease-in-out infinite; }
    @keyframes bm-fade-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    .bm-fade-in { opacity: 0; animation: bm-fade-in 0.9s ease-out forwards; }
    /* Gate entrance stagger */
    @keyframes bm-gate-enter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .bm-gate-child { opacity: 0; animation: bm-gate-enter 0.8s cubic-bezier(0.25,0.1,0.25,1) forwards; }
    .bm-gate-child:nth-child(1) { animation-delay: 0.2s; }
    .bm-gate-child:nth-child(2) { animation-delay: 0.5s; }
    .bm-gate-child:nth-child(3) { animation-delay: 0.7s; }
    .bm-gate-child:nth-child(4) { animation-delay: 0.9s; }
    .bm-gate-child:nth-child(5) { animation-delay: 1.1s; }
    .bm-gate-child:nth-child(6) { animation-delay: 1.3s; }
    /* Lightbox entrance */
    @keyframes bm-lb-enter { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
    .bm-lightbox { animation: bm-lb-enter 0.35s cubic-bezier(0.25,0.1,0.25,1) forwards; }
    /* Story crossfade */
    .bm-crossfade { position: absolute; inset: 0; transition: opacity 0.8s ease-in-out; }
    .bm-crossfade-active { opacity: 1; } .bm-crossfade-inactive { opacity: 0; }
    .bm-no-scrollbar::-webkit-scrollbar { display: none; }
    .bm-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    /* AOS-style scroll reveal (matches reference: ease, 1000ms) */
    [data-bm-reveal] { opacity: 0; transition: opacity 1s cubic-bezier(0.25,0.1,0.25,1), transform 1s cubic-bezier(0.25,0.1,0.25,1); will-change: opacity, transform; }
    [data-bm-reveal].is-visible { opacity: 1; transform: none; }
    [data-bm-reveal="up"] { transform: translateY(40px); }
    [data-bm-reveal="down"] { transform: translateY(-40px); }
    [data-bm-reveal="zoom-out-up"] { transform: translateY(40px) scale(1.08); }
    [data-bm-reveal="zoom-in"] { transform: scale(0.92); }
    [data-bm-reveal="fade"] { transform: none; }
    @media (prefers-reduced-motion: reduce) {
      [data-bm-reveal] { transform: none !important; transition: opacity 0.3s ease; }
    }
  `;
  document.head.appendChild(style);
}

const extractYoutubeId = (url: string) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
};

function supporterInstagramUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.instagram.com/${trimmed.replace(/^@+/, '')}`;
}

function supporterInstagramLabel(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/instagram\.com\/([^/?#]+)/i);
  const handle = (match?.[1] || trimmed).replace(/^@+/, '');
  return handle ? `@${handle}` : trimmed;
}

function InstagramMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2m0-2.2C8.7 0 8.3 0 7.1.1 5.9.1 5 .3 4.2.6c-.8.3-1.5.8-2.1 1.4C1.5 2.6 1 3.3.7 4.2.3 5 .2 5.9.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.2.3 2.1.6 2.9.3.8.8 1.5 1.4 2.1.6.6 1.3 1.1 2.1 1.4.8.3 1.7.5 2.9.6 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c1.2-.1 2.1-.3 2.9-.6.8-.3 1.5-.8 2.1-1.4.6-.6 1.1-1.3 1.4-2.1.3-.8.5-1.7.6-2.9.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.2-.3-2.1-.6-2.9-.3-.8-.8-1.5-1.4-2.1-.6-.6-1.3-1.1-2.1-1.4C18.9.3 18 .2 16.9.1 15.7 0 15.3 0 12 0zM12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    </svg>
  );
}

export function UndanganPernikahanBaliModern({ content, slug, preview }: MonolithicTemplateProps) {
  const data = deriveData(content);
  const { p1, p2, isoDate, displayDate, events, heroSlides, stories, gallery, gifts, quote, audio, media, footerMedia, bgVideo, youtubeIds } = data;
  const youtubeMusicId = extractYoutubeId(audio);
  const supporters = (content.footer?.supporters || []).filter((supporter) => supporter.enabled !== false && supporter.name?.trim());

  const [inIframe] = useState(() => typeof window !== 'undefined' && window.self !== window.top);
  const [isOpen, setIsOpen] = useState(false);
  // Gate shows on the public route AND inside the iframe-scoped mobile/tablet
  // studio preview. It stays hidden in the inline desktop studio preview, where
  // a fixed full-viewport gate would cover the editor chrome.
  const gateMounted = !preview || inIframe;
  const gateVisible = gateMounted && !isOpen;
  const isStudioPreview = !!preview;
  const isInlineDesktopPreview = isStudioPreview && !inIframe;
  const rootHeight = isInlineDesktopPreview ? 'h-full min-h-0' : 'min-h-dvh lg:h-dvh';
  const desktopHeight = isInlineDesktopPreview ? 'lg:h-full' : 'lg:h-dvh';
  const leftWidth = isInlineDesktopPreview ? 'lg:w-[55%] 2xl:w-[60%]' : 'lg:w-[55vw] 2xl:w-[60vw]';
  const rightWidth = isInlineDesktopPreview ? 'lg:w-[45%] 2xl:w-[40%]' : 'lg:w-[45vw] 2xl:w-[40vw]';
  const heroHeight = isInlineDesktopPreview ? 'min-h-full' : 'min-h-dvh';
  const videoBgClass = `fixed top-0 right-0 z-0 object-cover bg-black w-full ${rightWidth} h-dvh pointer-events-none select-none`;
  const [isPlaying, setIsPlaying] = useState(false);
  const guestName = useGuestName(content.guestName, 'Tamu Undangan');
  const countdown = useCountdown(isoDate);
  const [heroIdx, setHeroIdx] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [wishText, setWishText] = useState('');
  const [wishName, setWishName] = useState('');
  const [wishPage, setWishPage] = useState(1);
  const [rsvpChoice, setRsvpChoice] = useState<'hadir' | 'tidak'>('hadir');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const { wishes, rsvpForm, setRsvpForm, refresh } = useRsvpWishes(slug);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubeMusicRef = useRef<HTMLIFrameElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useAutoplayMusic(audioRef, setIsPlaying);

  useEffect(() => { injectStyles(); }, []);

  // AOS-style scroll reveal — observe [data-bm-reveal] once the gate is open.
  useEffect(() => {
    if (typeof window === 'undefined' || !rootRef.current || gateVisible) return;
    const els = rootRef.current.querySelectorAll<HTMLElement>('[data-bm-reveal]');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [gateVisible]);

  // Lock body scroll while the cover gate covers the viewport. Public route only
  // — in the iframe studio preview `document.body` is the editor, not the invite.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = gateVisible && !inIframe ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [gateVisible, inIframe]);

  // Hero + gallery auto-advance (replaces swiper autoplay)
  useEffect(() => {
    if (!isOpen || (heroSlides.length < 2 && gallery.length < 2)) return;
    const id = setInterval(() => {
      if (heroSlides.length > 1) setHeroIdx((i) => (i + 1) % heroSlides.length);
      if (gallery.length > 1) setGalleryIdx((i) => (i + 1) % gallery.length);
    }, 4000);
    return () => clearInterval(id);
  }, [isOpen, heroSlides.length, gallery.length]);

  useEffect(() => {
    if (!isOpen || stories.length < 2) return;
    const id = setInterval(() => setStoryIdx((i) => (i + 1) % stories.length), 6000);
    return () => clearInterval(id);
  }, [isOpen, stories.length]);

  // Group gallery into blocks of 4 (3 squares + 1 banner).
  // Hero and love-story slides are separate fields, not reused from gallery.
  const galleryGroups: string[][] = [];
  for (let i = 0; i < gallery.length; i += 4) galleryGroups.push(gallery.slice(i, i + 4));
  const youtubeCommand = (func: 'playVideo' | 'pauseVideo') => {
    youtubeMusicRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  };
  const open = () => {
    setIsOpen(true);
    setIsPlaying(true);
    if (youtubeMusicId) window.setTimeout(() => youtubeCommand('playVideo'), 250);
    else audioRef.current?.play().catch(() => {});
  };
  const toggleMusic = () => {
    if (youtubeMusicId) {
      if (isPlaying) youtubeCommand('pauseVideo'); else youtubeCommand('playVideo');
      setIsPlaying(!isPlaying);
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };
  const copy = (text: string, index: number) => { navigator.clipboard?.writeText(text); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 2500); };
  const activeEvent = events[0];
  const calendarUrl = useMemo(() => {
    const d = new Date(isoDate);
    const start = isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10).replace(/-/g, '');
    const end = start ? start : '';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`The Wedding of ${p1.nick} & ${p2.nick}`)}&dates=${start}/${end}&details=${encodeURIComponent(quote?.text || '')}&location=${encodeURIComponent(activeEvent?.venue || '')}`;
  }, [isoDate, p1.nick, p2.nick, quote, activeEvent?.venue]);

  const wishesPerPage = 5;
  const filteredWishes = wishes.filter(w => w.message && w.message.trim() !== '');
  const wishPages = Math.max(1, Math.ceil(filteredWishes.length / wishesPerPage));
  const pageWishes = filteredWishes.slice((wishPage - 1) * wishesPerPage, wishPage * wishesPerPage);
  useEffect(() => { setWishPage(1); }, [wishes.length]);

  const submitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !wishName.trim() || !wishText.trim()) return;
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: wishName.trim(),
          status: 'hadir',
          guests: 1,
          message: wishText.trim(),
        }),
      });
      if (res.ok) {
        setWishText('');
        setWishName('');
        refresh();
      }
    } catch { /* ignore */ }
  };

  return (
    <div ref={rootRef} className={`font-bm-roboto text-white ${rootHeight} relative bg-black lg:overflow-hidden`}>
      {youtubeMusicId ? (
        <iframe
          ref={youtubeMusicRef}
          src={`https://www.youtube.com/embed/${youtubeMusicId}?enablejsapi=1&autoplay=0&loop=1&playlist=${youtubeMusicId}&controls=0&rel=0`}
          title="Lagu undangan"
          allow="autoplay; encrypted-media"
          className="fixed left-0 top-0 h-px w-px opacity-0 pointer-events-none"
        />
      ) : <audio ref={audioRef} src={audio} loop />}

      {/* ── MOBILE & DESKTOP KANAN: full-bleed bg video ── */}
      <video
        className={videoBgClass}
        autoPlay muted loop playsInline disablePictureInPicture controlsList="nodownload noplaybackrate nofullscreen"
        poster={media.cover}
        tabIndex={-1}
        onContextMenu={(e) => e.preventDefault()}
        ref={(el) => {
          if (!el) return;
          const resume = () => { if (el.paused) el.play().catch(() => {}); };
          document.addEventListener('visibilitychange', () => { if (!document.hidden) resume(); });
          el.addEventListener('pause', () => { setTimeout(resume, 100); });
          const noPiP = (e: Event) => e.preventDefault();
          el.addEventListener('enterpictureinpicture', noPiP as EventListener);
          el.addEventListener('leavepictureinpicture', noPiP as EventListener);
        }}
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* DESKTOP: bg kanan statis dihapus untuk memakai video */}

      {/* ── DESKTOP: 2 kolom berdampingan (kiri statis + kanan mobile view scroll) ── */}
      <div className={`relative z-10 lg:flex ${desktopHeight} min-h-dvh lg:min-h-0`}>

        {/* Kiri: cover image statis (sticky, tak ikut scroll) — hidden mobile */}
        <div className={`hidden lg:block ${leftWidth} ${desktopHeight} flex-shrink-0 relative overflow-hidden`}>
          <img src={media.cover} alt="cover" className="object-cover object-bottom w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/50 flex flex-col justify-end p-16 xl:p-[100px]">
            <p className="font-bm-montserrat text-base text-white uppercase font-light tracking-[6px] mb-4">The Wedding of</p>
            <h1 className="font-bm-parisienne text-6xl xl:text-7xl text-white leading-none">{p1.nick} <span className="text-white/60">&amp;</span> {p2.nick}</h1>
            <p className="mt-4 font-bm-montserrat text-xs uppercase tracking-[6px] text-white/70">{displayDate}</p>
          </div>
        </div>

        {/* Kanan: mobile view scroll — desktop 45vw, mobile full width */}
        <div className={`relative w-full ${rightWidth} ${desktopHeight} lg:flex-shrink-0 lg:overflow-y-auto overflow-x-hidden`}>
          <div className="relative z-10">

        {/* ── HERO ── */}
        <section id="hero" data-lumina-section="hero" className={`relative ${heroHeight} flex flex-col justify-center px-6 md:px-12 py-20 bg-black/40`}>
          <div className="relative z-10 text-center">
            <p data-bm-reveal="down" className="font-bm-montserrat text-[11px] md:text-xs uppercase tracking-[6px] text-white/80 font-light">The Wedding of</p>
            <h1 data-bm-reveal="down" style={{ transitionDelay: '200ms' }} className="mt-5 font-bm-parisienne text-5xl md:text-6xl text-white leading-none">{p1.nick} <span className="text-3xl text-white/60 italic">&amp;</span> {p2.nick}</h1>
            <p data-bm-reveal="up" style={{ transitionDelay: '400ms' }} className="mt-5 font-bm-roboto text-xs md:text-sm uppercase tracking-[6px] text-white/70 font-light">{displayDate}</p>
            {heroSlides.length > 0 && (
              <div data-bm-reveal="zoom-out-up" style={{ transitionDelay: '500ms' }} className="mt-10 relative">
                <div className="relative h-[300px] md:h-[500px] overflow-hidden rounded-tl-3xl rounded-br-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                  {heroSlides.map((src, i) => (
                    <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
                      {isVideo(src) ? <video src={src} muted loop playsInline className="w-full h-full object-cover bg-black lg:object-cover" /> : <img src={src} alt={`slide ${i + 1}`} className="w-full h-full object-cover bg-black lg:object-cover" />}
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  {heroSlides.map((_, i) => (
                    <button key={i} onClick={() => setHeroIdx(i)} className={`h-1.5 rounded-full transition-all cursor-pointer ${i === heroIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} aria-label={`slide ${i + 1}`} />
                  ))}
                </div>
              </div>
            )}
            {quote && (
              <p className="mt-8 font-bm-roboto text-sm text-white/80 italic max-w-md mx-auto">&ldquo;{quote.text}&rdquo;</p>
            )}
          </div>
        </section>

        {/* ── COUPLE INFO — Om Swastyastu ── */}
        <section id="couuple-information" data-lumina-section="couple" className="relative py-14 md:py-24 px-6 bg-black/50">
          <div className="max-w-3xl mx-auto text-center">
            <p data-bm-reveal="up" className="font-bm-montserrat text-[10px] uppercase tracking-[6px] text-white/60 font-light">Om Swastyastu</p>
            <h2 data-bm-reveal="up" style={{ transitionDelay: '150ms' }} className="mt-3 font-bm-parisienne text-4xl md:text-5xl text-white">Om Awighnam Astu Namo Sidham</h2>
            <p data-bm-reveal="up" style={{ transitionDelay: '300ms' }} className="mt-6 font-bm-roboto text-sm md:text-base text-white/75 leading-relaxed max-w-xl mx-auto font-light">
              Atas Asung Kertha Wara Nugraha Ida Sang Hyang Widhi Wasa/Tuhan Yang Maha Esa, kami bermaksud mengundang Bapak/Ibu/Saudara/i pada Upacara Manusa Yadnya Pawiwahan (Pernikahan) putra-putri kami.
            </p>
            <div className="mt-14 space-y-16">
              {[{ d: p1, role: 'The Groom' }, { d: p2, role: 'The Bride' }].map(({ d, role }) => (
                <div key={role} data-bm-reveal="up" className="flex flex-col items-center text-center space-y-4">
                  <div className="w-48 h-48 md:w-56 md:h-56 xl:w-64 xl:h-64 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    {isVideo(role === 'The Groom' ? media.p1 : media.p2) ? <video src={role === 'The Groom' ? media.p1 : media.p2} muted loop playsInline className="w-full h-full object-cover bg-black lg:object-cover" /> : <img src={role === 'The Groom' ? media.p1 : media.p2} alt={d.full} className="w-full h-full object-cover bg-black lg:object-cover" />}
                  </div>
                  <span className="font-bm-montserrat text-[11px] md:text-xs uppercase tracking-[6px] text-white/50 font-medium">{role}</span>
                  <h3 className="font-bm-parisienne text-4xl md:text-5xl xl:text-6xl text-white">{d.full}</h3>
                  <p className="font-bm-roboto text-sm md:text-base text-white/65 font-light">{d.childOrder ? `${d.childOrder} dari` : role === 'The Groom' ? 'Putra dari' : 'Putri dari'}<br /><span className="text-white/90">{d.father}</span> &amp; <span className="text-white/90">{d.mother}</span></p>
                  {d.desc && <p className="font-bm-roboto text-xs md:text-sm text-white/55 font-light max-w-md leading-relaxed">{d.desc}</p>}
                  {d.ig && <a href={`https://instagram.com/${d.ig.replace('@', '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bm-montserrat text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors"><AtSign className="w-4 h-4" />{d.ig.replace('@', '')}</a>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SAVE THE DATE + COUNTDOWN ── */}
        <section id="save-the-date" data-lumina-section="countdown" className="relative py-14 md:py-24 px-6 bg-black/40">
          <div className="max-w-xl mx-auto text-center">
            <p data-bm-reveal="up" className="font-bm-montserrat text-[10px] uppercase tracking-[6px] text-white/60 font-light">Save The Date</p>
            <h2 data-bm-reveal="up" style={{ transitionDelay: '150ms' }} className="mt-3 font-bm-parisienne text-4xl md:text-5xl text-white">{displayDate}</h2>
            <div data-bm-reveal="zoom-out-up" style={{ transitionDelay: '250ms' }} className="mt-10 grid grid-cols-4 gap-3">
              {[{ l: 'Days', v: countdown.days }, { l: 'Hours', v: countdown.hours }, { l: 'Minutes', v: countdown.minutes }, { l: 'Seconds', v: countdown.seconds }].map((it) => (
                <div key={it.l} className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-lg py-4">
                  <span className="block text-xl md:text-3xl font-bold text-white tabular-nums font-bm-roboto">{String(it.v).padStart(2, '0')}</span>
                  <span className="block mt-1 font-bm-montserrat text-[9px] uppercase tracking-widest text-white/50 font-medium">{it.l}</span>
                </div>
              ))}
            </div>
            <a href={calendarUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bm-montserrat text-xs font-medium uppercase tracking-[3px] rounded-full hover:bg-white/80 transition-all duration-300 cursor-pointer">
              <CalendarPlus className="w-4 h-4" /> Add to Calendar
            </a>
          </div>
        </section>

        {/* ── WEDDING VENUE / RESEPSI ── */}
        {activeEvent && (
          <section id="wedding-venue" data-lumina-section="event" className="relative py-14 md:py-24 px-6 bg-black/50">
            <div className="max-w-xl mx-auto text-center">
              <p data-bm-reveal="up" className="font-bm-montserrat text-[10px] uppercase tracking-[6px] text-white/60 font-light">Wedding Venue</p>
              <h2 data-bm-reveal="up" style={{ transitionDelay: '150ms' }} className="mt-3 font-bm-parisienne text-4xl md:text-5xl text-white">{activeEvent.title}</h2>
              <div data-bm-reveal="zoom-out-up" style={{ transitionDelay: '250ms' }} className="mt-10 bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <p className="font-bm-montserrat text-sm uppercase tracking-[3px] text-white/70 font-light">{displayDate}</p>
                <p className="mt-3 font-bm-roboto text-xs text-white/60 font-light">{activeEvent.time}</p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-center gap-2 text-white"><MapPin className="w-4 h-4 text-white/50" /><span className="font-medium">{activeEvent.venue}</span></div>
                  <p className="font-bm-roboto text-xs text-white/60 font-light leading-relaxed max-w-md mx-auto">{activeEvent.address}</p>
                  {activeEvent.note && <p className="font-bm-roboto text-[11px] text-white/55 font-light italic max-w-md mx-auto">{activeEvent.note}</p>}
                </div>
                <a href={activeEvent.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 border border-white/40 text-white font-bm-montserrat text-xs font-medium uppercase tracking-[3px] rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer">
                  <Map className="w-4 h-4" /> View Maps
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ── LOVE STORY ── */}
        {stories.length > 0 && (
          <section data-lumina-section="story" className="relative py-14 md:py-24 px-6 bg-black/40">
            <div className="max-w-xl mx-auto text-center">
              <p data-bm-reveal="up" className="font-bm-montserrat text-[10px] uppercase tracking-[6px] text-white/60 font-light">Our Love Story</p>
              <h2 data-bm-reveal="up" style={{ transitionDelay: '150ms' }} className="mt-3 font-bm-parisienne text-4xl md:text-5xl text-white">{p1.nick} &amp; {p2.nick}</h2>
              <div data-bm-reveal="zoom-out-up" style={{ transitionDelay: '250ms' }} className="mt-10 relative">
                <div className="relative h-[360px] md:h-[440px] overflow-hidden rounded-tl-3xl rounded-br-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                  {stories.map((s, si) => (
                    <div key={si} className={`bm-crossfade ${si === storyIdx ? 'bm-crossfade-active' : 'bm-crossfade-inactive'}`}>
                      {s.image && isVideo(s.image)
                        ? <video src={s.image} muted loop playsInline autoPlay className="w-full h-full object-cover bg-black lg:object-cover" />
                        : <img src={s.image || media.cover} alt={s.title} className="w-full h-full object-cover bg-black lg:object-cover" />}
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <span className="font-bm-montserrat text-[10px] uppercase tracking-[6px] text-white/70 font-medium">{stories[storyIdx].year}</span>
                    <h3 className="mt-2 font-bm-parisienne text-3xl md:text-4xl text-white transition-opacity duration-700">{stories[storyIdx].title}</h3>
                    <p className="mt-3 font-bm-roboto text-xs md:text-sm text-white/85 font-light max-w-md transition-opacity duration-700">{stories[storyIdx].desc}</p>
                  </div>
                </div>
                {stories.length > 1 && (
                  <>
                    <button onClick={() => setStoryIdx((storyIdx - 1 + stories.length) % stories.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur border border-white/20 text-white hover:bg-black/80 transition-colors cursor-pointer" aria-label="previous story">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setStoryIdx((storyIdx + 1) % stories.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur border border-white/20 text-white hover:bg-black/80 transition-colors cursor-pointer" aria-label="next story">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="mt-4 flex justify-center gap-2">
                      {stories.map((_, i) => (
                        <button key={i} onClick={() => setStoryIdx(i)} className={`h-1.5 rounded-full transition-all cursor-pointer ${i === storyIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} aria-label={`story ${i + 1}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── OUR MOMENT — gallery (ref 6-col grid) + lightbox ── */}
        {gallery.length > 0 && (
          <section data-lumina-section="gallery" className="relative py-14 md:py-24 px-6 bg-black/50">
            <div className="max-w-xl mx-auto">
              <div className="flex flex-col text-center">
                <h2 data-bm-reveal="up" className="font-bm-parisienne text-3xl md:text-4xl leading-none tracking-wider text-white mb-3">Our Moment</h2>
                <p data-bm-reveal="up" className="font-bm-roboto text-sm leading-relaxed text-white/85 mb-8">Setiap detik yang kami lewati adalah bukti cinta yang tak terhingga. Melalui galeri ini, momen-momen berharga kami diabadikan.</p>
              </div>
              {youtubeIds.map((id) => (
                <div key={id} data-bm-reveal="zoom-out-up" className="w-full overflow-hidden aspect-video mb-2">
                  <iframe src={`https://www.youtube.com/embed/${id}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                </div>
              ))}
              {galleryGroups.map((group, gi) => (
                <div key={gi} data-bm-reveal="zoom-out-up" className="grid grid-cols-6 gap-2 mt-2">
                  {group.map((src, i) => {
                    const idx = gi * 4 + i;
                    const square = i < 3;
                    const ytId = extractYoutubeId(src);

                    return (
                      <div key={i} onClick={() => !ytId && setLightboxIndex(idx)} className={`${square ? 'col-span-2 row-span-2' : 'col-span-6'} overflow-hidden ${!ytId ? 'cursor-pointer' : ''}`}>
                        {ytId ? (
                          <div className={`w-full h-full ${square ? 'h-[180px] lg:h-[200px] md:h-[300px]' : 'h-[200px] lg:h-[250px] md:h-[350px]'}`}>
                            <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full pointer-events-none" />
                          </div>
                        ) : isVideo(src)
                          ? <video src={src} muted loop playsInline autoPlay className={`object-cover bg-black object-center w-full hover:scale-105 transition-transform ease-in-out duration-500 ${square ? 'h-[180px] lg:h-[200px] md:h-[300px]' : 'h-[200px] lg:h-[250px] md:h-[350px]'}`} />
                          : <img src={src} alt={`Moment ${idx + 1}`} loading="lazy" className={`object-cover bg-black object-center w-full hover:scale-105 transition-transform ease-in-out duration-500 ${square ? 'h-[180px] lg:h-[200px] md:h-[300px]' : 'h-[200px] lg:h-[250px] md:h-[350px]'}`} />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── WEDDING GIFT ── */}
        {content.gift?.enabled !== false && gifts.length > 0 && (
          <section id="wedding-gift-section" data-lumina-section="gift" className="relative py-14 md:py-24 px-6 bg-black/40">
            <div className="max-w-xl mx-auto text-center">
              <div data-bm-reveal="zoom-out-up" className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-white/20 bg-black/50 backdrop-blur text-white mb-6">
                <Gift className="w-6 h-6" />
              </div>
              <p data-bm-reveal="up" className="font-bm-montserrat text-[10px] uppercase tracking-[6px] text-white/60 font-light">Wedding Gift</p>
              <h2 data-bm-reveal="up" style={{ transitionDelay: '150ms' }} className="mt-3 font-bm-parisienne text-4xl md:text-5xl text-white">Tanda Kasih</h2>
              <p data-bm-reveal="up" style={{ transitionDelay: '300ms' }} className="mt-4 font-bm-roboto text-xs text-white/65 font-light max-w-md mx-auto">Doa restu Anda adalah karunia terindah. Namun jika memberi tanda kasih adalah caranya, kami menyediakan:</p>
              <div data-bm-reveal="zoom-out-up" style={{ transitionDelay: '350ms' }} className="mt-10 grid grid-cols-1 gap-4">
                {gifts.map((g, idx) => (
                  <div key={idx} className="bg-black/55 backdrop-blur-lg border border-white/15 rounded-3xl p-8 flex flex-col items-center">
                    <span className="font-bm-montserrat text-[10px] font-bold text-white/75 tracking-widest uppercase">{g.bank}</span>
                    <div className="w-6 h-[1.5px] bg-white/30 my-4"></div>
                    {g.number && <p className="font-bm-roboto text-xl font-bold text-white tracking-wider">{g.number}</p>}
                    {g.owner && <p className="mt-2 font-bm-montserrat text-[10px] text-white/60 uppercase tracking-widest">Atas Nama: {g.owner}</p>}
                    <button onClick={() => copy(g.number, idx)} className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-white text-black font-bm-montserrat text-xs font-semibold rounded-full hover:bg-white/80 transition-all duration-300 cursor-pointer">
                      {copiedIndex === idx ? <><Check className="w-4 h-4 text-green-700" /><span>Nomor Disalin</span></> : <><Copy className="w-4 h-4" /><span>Salin Nomor</span></>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── RSVP / WEDDING WISH — Gabungan konfirmasi & ucapan ── */}
        <section data-lumina-section="rsvp" className="relative py-14 md:py-24 px-6 bg-black/40">
          <div className="max-w-xl mx-auto text-center">
            <p data-bm-reveal="up" className="font-bm-montserrat text-[10px] uppercase tracking-[6px] text-white/60 font-light">Wedding Wish</p>
            <h2 data-bm-reveal="up" style={{ transitionDelay: '150ms' }} className="mt-3 font-bm-parisienne text-4xl md:text-5xl text-white">Ucapan &amp; Doa</h2>
            <p data-bm-reveal="up" style={{ transitionDelay: '300ms' }} className="mt-4 font-bm-roboto text-xs text-white/65 font-light max-w-md mx-auto">Silakan tuliskan doa dan harapan Anda untuk kami di sini.</p>
            <form onSubmit={submitWish} data-bm-reveal="zoom-out-up" style={{ transitionDelay: '250ms' }} className="mt-8 space-y-4 text-left">
              <input type="text" placeholder="Nama Anda" value={wishName} onChange={(e) => setWishName(e.target.value)} maxLength={100} className="w-full px-5 py-3.5 bg-black/50 backdrop-blur border border-white/15 rounded-xl font-bm-roboto text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-all" />
              <div className="relative">
                <textarea placeholder="Tuliskan ucapan dan doa terbaik Anda..." value={wishText} onChange={(e) => setWishText(e.target.value)} maxLength={500} rows={4} className="w-full px-5 py-3.5 bg-black/50 backdrop-blur border border-white/15 rounded-xl font-bm-roboto text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-all resize-none" />
                <span className="absolute bottom-3 right-4 font-bm-roboto text-[10px] text-white/40">{wishText.length}/500</span>
              </div>
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-bm-montserrat text-xs font-medium uppercase tracking-[3px] rounded-xl hover:bg-white/80 transition-all duration-300 cursor-pointer">
                <MessageSquare className="w-4 h-4" /> Send Wish
              </button>
            </form>
            <div className="mt-10 space-y-3 text-left">
              {pageWishes.map((w) => (
                <div key={w.id} className="bg-black/45 backdrop-blur border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bm-roboto font-medium text-sm text-white">{w.name}</span>
                    {w.time && <span className="font-bm-roboto text-[10px] text-white/40">{w.time}</span>}
                  </div>
                  <p className="mt-2 font-bm-roboto text-xs text-white/75 font-light leading-relaxed">{w.message}</p>
                </div>
              ))}
              {filteredWishes.length === 0 && <p className="text-center font-bm-roboto text-xs text-white/40 py-6 font-light">Belum ada ucapan. Jadilah yang pertama!</p>}
            </div>
            {wishPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4 font-bm-roboto text-xs text-white/60">
                <button onClick={() => setWishPage(Math.max(1, wishPage - 1))} disabled={wishPage === 1} className="px-4 py-2 border border-white/20 rounded-full hover:bg-white/10 disabled:opacity-40 transition-all cursor-pointer">Previous</button>
                <span className="text-white/50">Page {wishPage} of {wishPages}</span>
                <button onClick={() => setWishPage(Math.min(wishPages, wishPage + 1))} disabled={wishPage === wishPages} className="px-4 py-2 border border-white/20 rounded-full hover:bg-white/10 disabled:opacity-40 transition-all cursor-pointer">Next</button>
              </div>
            )}
          </div>
        </section>

        {/* ── FOOTER (matches ref: footer bg + "Kami Yang Berbahagia" + logo + copyright) ── */}
        <footer className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
          <img src={footerMedia} alt="" className="absolute inset-0 w-full h-full object-cover bg-black lg:object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/50"></div>
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <p data-bm-reveal="up" className="font-bm-parisienne text-lg md:text-xl text-white">Om Shanti Shanti Shanti Om</p>
            <p className="font-bm-roboto text-xs text-white/80 font-light max-w-md mx-auto leading-relaxed">{content.footer?.text || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu dan doa.'}</p>
            <div className="flex flex-col items-center pt-2">
              <p className="font-bm-montserrat text-[10px] uppercase tracking-[6px] text-white/60">Kami Yang Berbahagia</p>
              <h4 className="mt-2 font-bm-parisienne text-3xl md:text-4xl text-white">{p1.nick} &amp; {p2.nick}</h4>
            </div>
            <div className="flex flex-col items-center pt-6">
              <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
                <img src="/icon.png" alt="" className="h-8 w-8 rounded-lg opacity-85" />
                <p className="font-bm-montserrat text-[11px] uppercase tracking-[5px] text-white/60">Lumina</p>
                {supporters.map((supporter, index) => (
                  <div key={`${supporter.name}-${index}`} className="inline-flex items-center gap-2 text-white/75">
                    <span className="text-white/40" aria-hidden="true">|</span>
                    {supporter.instagram && supporter.showInstagram !== false ? (
                      <a href={supporterInstagramUrl(supporter.instagram)} target="_blank" rel="noreferrer" aria-label={`Instagram ${supporter.name}`} className="inline-flex items-center gap-1.5 font-bm-montserrat text-[10px] tracking-[2px] hover:text-white transition-colors duration-300">
                        <InstagramMark />
                        <span>{supporterInstagramLabel(supporter.instagram)}</span>
                      </a>
                    ) : (
                      <span className="font-bm-montserrat text-[10px] tracking-[2px]">{supporter.name}</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="font-bm-roboto pb-2 text-xs text-center text-white/70">© {new Date().getFullYear()} <span className="font-semibold">Lumina</span>. All rights reserved.</p>
              <div className="flex flex-row gap-3">
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-white/70 hover:text-white transition-colors duration-300">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2m0-2.2C8.7 0 8.3 0 7.1.1 5.9.1 5 .3 4.2.6c-.8.3-1.5.8-2.1 1.4C1.5 2.6 1 3.3.7 4.2.3 5 .2 5.9.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.2.3 2.1.6 2.9.3.8.8 1.5 1.4 2.1.6.6 1.3 1.1 2.1 1.4.8.3 1.7.5 2.9.6 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c1.2-.1 2.1-.3 2.9-.6.8-.3 1.5-.8 2.1-1.4.6-.6 1.1-1.3 1.4-2.1.3-.8.5-1.7.6-2.9.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.2-.3-2.1-.6-2.9-.3-.8-.8-1.5-1.4-2.1-.6-.6-1.3-1.1-2.1-1.4C18.9.3 18 .2 16.9.1 15.7 0 15.3 0 12 0zM12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>
                </a>
                <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" aria-label="TikTok" className="text-white/70 hover:text-white transition-colors duration-300">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.6 6.7a4.8 4.8 0 0 1-3.5-1.6A4.8 4.8 0 0 1 14.8 1h-3.2v12.7a2.8 2.8 0 0 1-2.8 2.8 2.8 2.8 0 0 1-2.8-2.8 2.8 2.8 0 0 1 2.8-2.8c.2 0 .4 0 .6.1V7.9a6 6 0 0 0-.6 0A6 6 0 0 0 2.2 13.9a6 6 0 0 0 6 6 6 6 0 0 0 6-6V8.9a8 8 0 0 0 4.8 1.5V7.2c-.5 0-1-.2-1.4-.5z"/></svg>
                </a>
              </div>
              {supporters.length > 0 && (
                <div className="hidden">
                  <p className="font-bm-montserrat text-[9px] uppercase tracking-[4px] text-white/45">Supporter / Pihak Lain</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                    {supporters.map((supporter, index) => (
                      <div key={`${supporter.name}-${index}`} className="inline-flex items-center gap-2 text-white/75">
                        {index > 0 && <span className="text-white/35" aria-hidden="true">|</span>}
                        <span className="font-bm-montserrat text-[10px] uppercase tracking-[2px]">{supporter.name}</span>
                        {supporter.instagram && supporter.showInstagram !== false && (
                          <a href={supporterInstagramUrl(supporter.instagram)} target="_blank" rel="noreferrer" aria-label={`Instagram ${supporter.name}`} className="text-white/65 hover:text-white transition-colors duration-300">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.4-.6.8-1 1.4-1.4.4-.4 1-.6 2.2-.8C8.4 2.2 8.8 2.2 12 2.2m0-2.2C8.7 0 8.3 0 7.1.1 5.9.1 5 .3 4.2.6c-.8.3-1.5.8-2.1 1.4C1.5 2.6 1 3.3.7 4.2.3 5 .2 5.9.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.2.3 2.1.6 2.9.3.8.8 1.5 1.4 2.1.6.6 1.3 1.1 2.1 1.4.8.3 1.7.5 2.9.6 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c1.2-.1 2.1-.3 2.9-.6.8-.3 1.5-.8 2.1-1.4.6-.6 1.1-1.3 1.4-2.1.3-.8.5-1.7.6-2.9.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.2-.3-2.1-.6-2.9-.3-.8-1.1-1.4-2.1-1.4C18.9.3 18 .2 16.9.1 15.7 0 15.3 0 12 0zM12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" /></svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </footer>

        </div>
      </div>
      </div>

      {/* ── MUSIC TOGGLE ── */}
      {isOpen && (
        <button onClick={toggleMusic} className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-black/60 backdrop-blur-lg border border-white/20 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer">
          {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-white/80" />}
        </button>
      )}

      {/* ── COVER GATE / "Buka Undangan" ── */}
      {gateMounted && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'opacity-0 scale-110 blur-sm pointer-events-none' : 'opacity-100 scale-100 blur-0'}`}>
          <img src={media.cover} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/75"></div>
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <Heart className="w-10 h-10 text-white/90 bm-heartbeat bm-gate-child" fill="currentColor" />
            <p className="mt-6 font-bm-montserrat text-[11px] uppercase tracking-[6px] text-white/70 font-light bm-gate-child">The Wedding of</p>
            <h1 className="mt-3 font-bm-parisienne text-6xl md:text-7xl text-white leading-none bm-gate-child">{p1.nick} <span className="text-white/50 text-4xl">&amp;</span> {p2.nick}</h1>
            <p className="mt-4 font-bm-roboto text-xs uppercase tracking-[4px] text-white/60 font-light bm-gate-child">{displayDate}</p>
            <button onClick={open} className="mt-10 px-10 py-4 bg-white text-black font-bm-montserrat text-xs font-medium uppercase tracking-[3px] rounded-full hover:bg-white/80 transition-all duration-300 transform active:scale-95 cursor-pointer bm-gate-child">
              Buka Undangan
            </button>
            <p className="mt-8 font-bm-montserrat text-[10px] tracking-[3px] text-white/50 uppercase bm-gate-child">
              Kepada Yth. <span className="text-white font-bold tracking-widest bg-white/10 px-2 py-1 rounded-sm ml-1">{guestName}</span>
            </p>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 bm-lightbox">
          <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-white/80 hover:text-white text-4xl font-light cursor-pointer transition-colors duration-300">&times;</button>
          <button onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)} className="absolute left-4 p-2 text-white/70 hover:text-white cursor-pointer transition-colors duration-300" aria-label="previous"><ChevronLeft className="w-10 h-10" /></button>
          {isVideo(gallery[lightboxIndex]) ? <video src={gallery[lightboxIndex]} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" /> : <img src={gallery[lightboxIndex]} alt="Zoomed" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300" />}
          <button onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)} className="absolute right-4 p-2 text-white/70 hover:text-white cursor-pointer transition-colors duration-300" aria-label="next"><ChevronRight className="w-10 h-10" /></button>
        </div>
      )}
    </div>
  );
}

export default UndanganPernikahanBaliModern;
