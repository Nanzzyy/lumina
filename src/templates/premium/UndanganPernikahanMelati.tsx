'use client';

import { useState, useRef, useEffect } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent } from '@/lib/content/types';
import {
  Calendar, Clock, MapPin, Send, Gift, Copy, Check, ChevronLeft, ChevronRight,
  Volume2, VolumeX, Map, Play, ExternalLink, Shirt, Sparkles,
} from 'lucide-react';
import { isVideo, useCountdown, useGuestName, displayDateFrom, pickMedia, useRsvpWishes } from './shared';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useAutoplayMusic } from './_music';

/* ─── Motion Tokens ─── */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_SOFT: [number, number, number, number] = [0.4, 0, 0.2, 1];
const DUR = 0.9;

const vUp: Variants = { hidden: { opacity: 0, y: 44 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } } };
const vZoom: Variants = { hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: EASE } } };
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Melati" — Floral Luxury Editorial ───
   Ivory base, antique-gold filigree, sage botanicals, dusty-rose accent.
   Original ornament SVGs (no third-party assets). Fonts: Cormorant Upright + Ovo. */
const IVORY = '#FAF6EF';
const CREAM = '#F3ECDF';
const CREAM_DEEP = '#EADFCD';
const GOLD = '#B8935A';
const GOLD_DEEP = '#9A7842';
const GOLD_SOFT = '#D9BE8C';
const INK = '#3A322A';
const INK_SOFT = '#5A4F42';
const SAGE = '#8A9A7B';
const ROSE = '#C9A0A0';
const MUTED = '#8A8074';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Arya', full: 'Arya Wibisana', father: 'Bpk. Drs. Wibisana Putra', mother: 'Ibu Sri Lestari Wibisana', ig: '@arya.wibisana', desc: 'Seorang yang menemukan keindahan dalam hal-hal sederhana dan percaya bahwa cinta tumbuh dari kesabaran.' },
    p2: { nick: 'Laras', full: 'Laras Ayuningtyas', father: 'Bpk. Agus Ningtyas', mother: 'Ibu Diah Anggrek', ig: '@laras.ayu', desc: 'Pencinta sastra dan kebun yang meyakini setiap bunga memiliki kisah, seperti halnya setiap pertemuan.' },
  },
  date: '2027-06-20T17:00:00',
  hashtag: 'ForeverAryaLaras',
  intro: 'Di antara bunga yang mekar dan doa yang tulus, kami bermaksud memulai babak baru bersama — sebuah janji yang diwarnai cinta dan ketulusan.',
  quote: { text: 'Cinta sejati bukan tentang saling menatap, tetapi tentang bersama memandang ke arah yang sama, menghadapi hari-hari yang akan datang dengan satu hati.', source: 'Seuntai Harapan Pagi' },
  events: [
    { title: 'Upacara Suci', time: '09:00 - 10:30 WIB', venue: 'Balai Kartika', address: 'Jl. Garuda No. 17, Jakarta Selatan', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Balai+Kartika+Jakarta', note: 'Khidmat dan sakral, hadirlah sepuluh menit sebelum dimulai.' },
    { title: 'Resepsi Garden', time: '17:00 - 21:00 WIB', venue: 'Taman Melati Estate', address: 'Jl. Melati Raya No. 57, Jakarta Selatan', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Taman+Melati+Jakarta', note: 'Terbuka untuk seluruh tamu undangan.' },
  ],
  stories: [
    { year: '2021', title: 'Pertemuan Pertama', desc: 'Berawal dari sebuah pameran bunga, dua jiwa yang sama-sama mencintai keindahan alam tanpa sengaja dipersatukan oleh sebuah senyum.' },
    { year: '2023', title: 'Mekar dalam Cinta', desc: 'Taman dan secangkir kopi pagi menjadi saksi tumbuhnya persahabatan menjadi cinta yang tenang, terasa seperti pulang.' },
    { year: '2025', title: 'Janji Suci', desc: 'Di tengah hamparan melati, sebuah pertanyaan sederhana mengubah segalanya — mengubah kisah indah menjadi janji sehidup semati.' },
  ],
  gallery: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1537907690979-ee8e01276184?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80&w=800',
  ],
  gifts: [
    { bank: 'Bank BCA', number: '0283910456', owner: 'Arya Wibisana' },
    { bank: 'Bank Mandiri', number: '1450098765432', owner: 'Laras Ayuningtyas' },
  ],
  dresscode: {
    intro: 'Hadirlah dengan busana yang anggun dan lembut dalam nuansa harmonis yang menyatu dengan keindahan taman.',
    men: 'Garden Formal — setelan tipis berwarna lembut',
    women: 'Garden Party — gaun bunga-bunga berpalet pastel',
    palette: ['#F4ECD8', '#D9BE8C', '#8A9A7B', '#C9A0A0', '#9AA0A6'],
  },
  rundown: {
    title: 'Resepsi Garden',
    items: [
      { time: '17:00', label: 'Kedatangan Tamu' },
      { time: '17:30', label: 'Perayaan Dimulai' },
      { time: '18:00', label: 'Jamuan & Bersilaturahmi' },
      { time: '18:45', label: 'Sesi Hiburan' },
      { time: '19:30', label: 'Kenangan Tercitra' },
      { time: '20:30', label: 'Penutup & Terima Kasih' },
    ],
  },
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
  hero: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1600',
  p1: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=700',
  p2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=700',
};

function deriveData(content: InvitationContent) {
  const c = content.couple;
  const p1 = {
    nick: c.partner1 || DEFAULTS.couple.p1.nick,
    full: c.partner1Title || c.partner1 || DEFAULTS.couple.p1.full,
    father: c.partner1Father || DEFAULTS.couple.p1.father,
    mother: c.partner1Mother || DEFAULTS.couple.p1.mother,
    ig: c.partner1Instagram || DEFAULTS.couple.p1.ig,
    desc: c.partner1Desc || DEFAULTS.couple.p1.desc,
  };
  const p2 = {
    nick: c.partner2 || DEFAULTS.couple.p2.nick,
    full: c.partner2Title || c.partner2 || DEFAULTS.couple.p2.full,
    father: c.partner2Father || DEFAULTS.couple.p2.father,
    mother: c.partner2Mother || DEFAULTS.couple.p2.mother,
    ig: c.partner2Instagram || DEFAULTS.couple.p2.ig,
    desc: c.partner2Desc || DEFAULTS.couple.p2.desc,
  };
  const isoDate = content.event?.date || DEFAULTS.date;
  const displayDate = displayDateFrom(isoDate, 'Sabtu, 20 Juni 2027');
  const location = content.event?.location || 'Jakarta';
  const events = (content.schedule?.items?.length
    ? content.schedule.items.map((it) => ({ title: it.title || '', time: it.time || '', venue: it.venue || '', address: it.address || '', mapsUrl: it.mapsUrl || '', note: it.description || '' }))
    : DEFAULTS.events).filter((e) => e.title);
  const stories = content.stories?.length ? content.stories : [];
  const gallery = content.gallery?.images?.length ? content.gallery.images : DEFAULTS.gallery;
  const gifts = (content.gift?.items?.length
    ? content.gift.items.map((g) => ({ bank: g.bank || g.name || '', number: g.number || '', owner: g.owner || g.note || '' }))
    : DEFAULTS.gifts).filter((g) => g.bank || g.number || g.owner);
  const quote = content.quote?.text ? { text: content.quote.text, source: content.quote.source || '' } : DEFAULTS.quote;
  const audio = content.music?.src || DEFAULTS.audio;
  const intro = content.hero?.subtitle || DEFAULTS.intro;
  const hashtag = DEFAULTS.hashtag;
  const dresscode = {
    intro: content.dresscode?.intro || DEFAULTS.dresscode.intro,
    men: content.dresscode?.men || DEFAULTS.dresscode.men,
    women: content.dresscode?.women || DEFAULTS.dresscode.women,
    palette: content.dresscode?.palette?.length ? content.dresscode.palette : DEFAULTS.dresscode.palette,
  };
  const rundown = {
    title: content.rundown?.title || DEFAULTS.rundown.title,
    items: content.rundown?.items?.length ? content.rundown.items : DEFAULTS.rundown.items,
  };
  const video = content.video?.youtubeId ? { youtubeId: content.video.youtubeId, title: content.video.title || 'Captured in Motion' } : null;
  const liveStream = content.liveStream?.url ? { url: content.liveStream.url, label: content.liveStream.label || 'Tonton Siaran Langsung' } : null;
  const media = pickMedia(content, { cover: DEFAULTS.cover, hero: DEFAULTS.hero, p1: DEFAULTS.p1, p2: DEFAULTS.p2 });
  return { p1, p2, isoDate, displayDate, location, events, stories, gallery, gifts, quote, audio, intro, hashtag, dresscode, rundown, video, liveStream, media };
}

function injectStyles() {
  if (typeof window === 'undefined' || document.getElementById('melati-inv')) return;
  const s = document.createElement('style');
  s.id = 'melati-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Upright:wght@300;400;500;600;700&family=Ovo&family=Inter:wght@300;400;500;600&display=swap');
.font-display { font-family: 'Cormorant Upright', Georgia, serif; }
.font-accent { font-family: 'Ovo', Georgia, serif; }
.font-body { font-family: 'Inter', system-ui, sans-serif; }
@keyframes melati-flap { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(0.45)} }
.melati-wing-l { transform-box: fill-box; transform-origin: right center; animation: melati-flap 0.34s ease-in-out infinite; }
.melati-wing-r { transform-box: fill-box; transform-origin: left center; animation: melati-flap 0.34s ease-in-out infinite; }
@keyframes melati-sway { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
.melati-sway { transform-box: fill-box; transform-origin: bottom center; animation: melati-sway 5.5s ease-in-out infinite; }
@keyframes melati-twinkle { 0%,100%{opacity:0.2; transform:scale(0.8)} 50%{opacity:1; transform:scale(1.15)} }
.melati-twinkle { transform-box: fill-box; transform-origin: center; animation: melati-twinkle 2.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .melati-wing-l, .melati-wing-r, .melati-sway, .melati-twinkle { animation: none !important; }
}
`;
  document.head.appendChild(s);
}

/* ─── Original SVG ornaments (floral luxury editorial) ─── */

/** Symmetric horizontal gold filigree divider with a central blossom motif. */
function FiligreeDivider({ className = 'w-full h-5', color = GOLD }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path d="M2 12 H100" stroke={color} strokeWidth="1" opacity="0.6" />
      <path d="M2 12 C30 8 60 8 100 12" stroke={color} strokeWidth="0.6" opacity="0.35" />
      <path d="M258 12 H160" stroke={color} strokeWidth="1" opacity="0.6" />
      <path d="M258 12 C230 16 200 16 160 12" stroke={color} strokeWidth="0.6" opacity="0.35" />
      <g transform="translate(130 12)">
        <circle cx="0" cy="0" r="3.2" fill={color} />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="0" cy="-7" rx="2.1" ry="5.5" fill="none" stroke={color} strokeWidth="0.9" transform={`rotate(${a})`} opacity="0.85" />
        ))}
        <circle cx="0" cy="0" r="1" fill={IVORY} />
      </g>
      <path d="M104 12 q4 -6 8 0 q4 6 8 0" stroke={color} strokeWidth="0.7" fill="none" opacity="0.5" />
      <path d="M156 12 q4 -6 8 0 q4 6 8 0" stroke={color} strokeWidth="0.7" fill="none" opacity="0.5" />
    </svg>
  );
}

/** L-shaped corner flourish (rotate for the four corners). */
function CornerFlourish({ className = 'w-24 h-24', color = GOLD, flip = false }: { className?: string; color?: string; flip?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M2 98 C2 50 2 22 2 22 C2 10 10 2 22 2 L70 2" stroke={color} strokeWidth="1.4" opacity="0.9" />
      <path d="M10 98 C10 60 10 40 18 30 C26 20 40 14 60 14" stroke={color} strokeWidth="0.8" opacity="0.55" />
      <circle cx="22" cy="22" r="2.4" fill={color} />
      <path d="M22 22 C30 18 40 14 50 12" stroke={color} strokeWidth="0.7" opacity="0.6" />
      <ellipse cx="34" cy="26" rx="3" ry="6" transform="rotate(-30 34 26)" stroke={color} strokeWidth="0.7" opacity="0.6" />
      <ellipse cx="28" cy="38" rx="3" ry="6" transform="rotate(-55 28 38)" stroke={color} strokeWidth="0.7" opacity="0.6" />
      <circle cx="62" cy="6" r="1.4" fill={color} opacity="0.8" />
      <circle cx="74" cy="4" r="1" fill={color} opacity="0.6" />
    </svg>
  );
}

/** Small botanical leaf-and-blossom spray. */
function BotanicalSpray({ className = 'w-20 h-20', color = SAGE, accent = ROSE }: { className?: string; color?: string; accent?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M40 75 C40 50 40 30 40 12" stroke={color} strokeWidth="0.9" opacity="0.8" />
      {[-20, 20, -45, 45].map((rot, i) => (
        <ellipse key={i} cx="26" cy={20 + i * 6} rx="7" ry="3" transform={`rotate(${rot} 40 ${20 + i * 6})`} stroke={color} strokeWidth="0.7" opacity="0.55" />
      ))}
      <circle cx="40" cy="10" r="3" fill={accent} opacity="0.85" />
      <circle cx="32" cy="16" r="2" fill={accent} opacity="0.7" />
      <circle cx="48" cy="16" r="2" fill={accent} opacity="0.7" />
    </svg>
  );
}

/** Gentle twinkle sparkle. */
function Sparkle({ className = 'w-5 h-5', color = GOLD }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2 C12.6 8 14 9.4 20 12 C14 14.6 12.6 16 12 22 C11.4 16 10 14.6 4 12 C10 9.4 11.4 8 12 2 Z" fill={color} opacity="0.85" />
    </svg>
  );
}

/** Original butterfly (no third-party asset). Wings flap via CSS, body floats via parent. */
function Butterfly({ className = 'w-12 h-12', color = ROSE, gold = GOLD, flip = false }: { className?: string; color?: string; gold?: string; flip?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <g className="melati-wing-l">
        <path d="M40 36 C30 14 14 8 8 18 C3 27 12 38 24 40 C16 44 10 56 18 60 C28 64 38 52 40 44 Z" fill={color} opacity="0.55" />
        <path d="M40 36 C32 22 22 18 14 22" stroke={gold} strokeWidth="0.8" fill="none" opacity="0.7" />
        <circle cx="20" cy="24" r="2.4" fill={gold} opacity="0.85" />
      </g>
      <g className="melati-wing-r">
        <path d="M40 36 C50 14 66 8 72 18 C77 27 68 38 56 40 C64 44 70 56 62 60 C52 64 42 52 40 44 Z" fill={color} opacity="0.55" />
        <path d="M40 36 C48 22 58 18 66 22" stroke={gold} strokeWidth="0.8" fill="none" opacity="0.7" />
        <circle cx="60" cy="24" r="2.4" fill={gold} opacity="0.85" />
      </g>
      <ellipse cx="40" cy="38" rx="2.6" ry="12" fill={INK} opacity="0.7" />
      <path d="M40 26 q-3 -6 -6 -8 M40 26 q3 -6 6 -8" stroke={INK} strokeWidth="0.8" opacity="0.7" />
    </svg>
  );
}

/** Ornate gold-filigree photo frame — gradient gold border + inner line + corner scrolls + medallion. */
function GoldFrame({ children, className = '', aspect = '4/5' }: { children: React.ReactNode; className?: string; aspect?: string }) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: aspect, padding: 14, backgroundColor: IVORY }}>
      <div className="absolute inset-0 pointer-events-none" style={{ border: '2px solid transparent', backgroundImage: `linear-gradient(${IVORY}, ${IVORY}), linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD}, ${GOLD_DEEP})`, backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }} />
      <div className="absolute inset-2 pointer-events-none" style={{ border: `1px solid ${GOLD_SOFT}66` }} />
      <div className="relative w-full h-full overflow-hidden">{children}</div>
      <FloralCorner className="absolute -top-2 -left-2 w-10 h-10 z-10" />
      <FloralCorner className="absolute -top-2 -right-2 w-10 h-10 z-10" flip />
      <FloralCorner className="absolute -bottom-2 -left-2 w-10 h-10 z-10" flip />
      <FloralCorner className="absolute -bottom-2 -right-2 w-10 h-10 z-10" />
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 block w-2.5 h-2.5 rotate-45" style={{ background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD_DEEP})` }} />
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 block w-2.5 h-2.5 rotate-45" style={{ background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD_DEEP})` }} />
    </div>
  );
}

/** Falling-petals ambient layer — sparse, soft, slow. */
function FallingPetals({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const petals = [
    { left: '12%', delay: 0, dur: 13, size: 7 }, { left: '30%', delay: 4, dur: 16, size: 6 },
    { left: '52%', delay: 2, dur: 14, size: 8 }, { left: '70%', delay: 6, dur: 17, size: 6 },
    { left: '86%', delay: 1.5, dur: 15, size: 7 }, { left: '42%', delay: 8, dur: 18, size: 6 },
    { left: '64%', delay: 3.5, dur: 16, size: 7 }, { left: '22%', delay: 9.5, dur: 14, size: 6 },
  ];
  const palette = [`${ROSE}55`, `${GOLD_SOFT}55`, `${SAGE}55`];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((p, i) => (
        <motion.span key={i} className="absolute top-0 block"
          style={{ left: p.left, width: p.size, height: p.size, borderRadius: '50% 0 50% 0', background: palette[i % 3] }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: [0, 0.55, 0], y: [0, 320, 640], rotate: [0, 180, 360], x: [0, 16, -8, 16] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }} />
      ))}
    </div>
  );
}

/** Gold-filigree corner ornament — gradient stroke, organic bezier scrolls, subtle buds. */
function FloralCorner({ className = 'w-28 h-28', color = GOLD, accent = ROSE, leaf = SAGE, flip = false }: { className?: string; color?: string; accent?: string; leaf?: string; flip?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <defs>
        <linearGradient id="melatiGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD_SOFT} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={GOLD_DEEP} />
        </linearGradient>
      </defs>
      <path d="M4 116 C4 56 8 26 18 16 C30 4 50 2 78 4" stroke="url(#melatiGold)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M4 116 C12 74 22 48 36 32 C52 14 74 6 96 4" stroke="url(#melatiGold)" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M10 104 C18 76 28 56 40 44" stroke="url(#melatiGold)" strokeWidth="0.6" fill="none" opacity="0.4" />
      <path d="M44 46 C52 38 62 40 62 50 C62 58 52 58 50 52" stroke="url(#melatiGold)" strokeWidth="1" fill="none" opacity="0.85" />
      <path d="M30 40 C22 36 20 28 26 22 C34 26 36 34 30 40 Z" fill={leaf} opacity="0.38" />
      <path d="M22 60 C14 58 10 50 16 44 C24 46 28 54 22 60 Z" fill={leaf} opacity="0.38" />
      <circle cx="58" cy="28" r="2" fill={accent} opacity="0.5" />
      <circle cx="80" cy="14" r="1.6" fill={accent} opacity="0.45" />
      <circle cx="44" cy="20" r="1.4" fill={color} opacity="0.5" />
    </svg>
  );
}

/** Flowing leafy vine for section edges — sways gently. */
function LeafyVine({ className = 'w-10 h-40', color = SAGE, accent = GOLD }: { className?: string; color?: string; accent?: string }) {
  return (
    <svg className={`melati-sway ${className}`} viewBox="0 0 40 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 158 C20 120 14 90 20 60 C26 30 18 14 20 4" stroke={color} strokeWidth="1" opacity="0.7" />
      {[40, 72, 104, 136].map((y, i) => (
        <g key={i}>
          <ellipse cx={i % 2 ? 28 : 12} cy={y} rx="8" ry="3.5" transform={`rotate(${i % 2 ? 40 : -40} ${i % 2 ? 28 : 12} ${y})`} fill={color} opacity="0.45" />
          <circle cx={i % 2 ? 28 : 12} cy={y} r="1.6" fill={accent} opacity="0.7" />
        </g>
      ))}
      <circle cx="20" cy="6" r="3" fill={accent} opacity="0.8" />
    </svg>
  );
}

/** Horizontal floral garland swag — section divider accent. */
function Garland({ className = 'w-full h-8', color = GOLD, accent = ROSE, leaf = SAGE }: { className?: string; color?: string; accent?: string; leaf?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 32" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path d="M4 22 Q80 2 160 22 T316 22" stroke={color} strokeWidth="0.9" fill="none" opacity="0.6" />
      <path d="M4 26 Q80 8 160 26 T316 26" stroke={leaf} strokeWidth="0.7" fill="none" opacity="0.4" />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 20 + i * 35;
        const y = 22 - 8 * Math.sin((i / 8) * Math.PI);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="2.6" fill={i % 2 ? accent : color} opacity="0.75" />
            <ellipse cx={x - 5} cy={y + 2} rx="3" ry="1.4" fill={leaf} opacity="0.4" transform={`rotate(-30 ${x - 5} ${y + 2})`} />
            <ellipse cx={x + 5} cy={y + 2} rx="3" ry="1.4" fill={leaf} opacity="0.4" transform={`rotate(30 ${x + 5} ${y + 2})`} />
          </g>
        );
      })}
    </svg>
  );
}

/** Dense 4-corner floral framing with bloom-in scroll reveal + optional swaying side vines. */
function SectionFlorals({ reduce, sides = false }: { reduce: boolean; sides?: boolean }) {
  const corners = [
    { c: 'top-1 left-1', flip: false },
    { c: 'top-1 right-1', flip: true },
    { c: 'bottom-1 left-1', flip: true },
    { c: 'bottom-1 right-1', flip: false },
  ];
  return (
    <>
      {corners.map((cn, i) => (
        <motion.div key={i} className={`absolute ${cn.c} z-0 pointer-events-none`}
          initial={{ opacity: 0, scale: 0.4, rotate: cn.flip ? 24 : -24 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: EASE, delay: i * 0.09 }}>
          <FloralCorner className="w-20 h-20 md:w-28 md:h-28" flip={cn.flip} />
        </motion.div>
      ))}
      {sides && !reduce && (
        <>
          <LeafyVine className="absolute left-1 top-12 h-36 w-9 z-0 opacity-70" />
          <LeafyVine className="absolute right-1 top-12 h-36 w-9 z-0 opacity-70" />
        </>
      )}
    </>
  );
}

/** Shared layered-petal rose shape, origin-centered (composed by FlowerBloom / FlowerCluster). */
function BloomShape({ color = ROSE, gold = GOLD }: { color?: string; gold?: string }) {
  const ring = (r: number, op: number, ry: number) => [0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
    <ellipse key={`${a}-${r}`} cx="0" cy={-r} rx="9" ry={ry} fill={color} opacity={op} transform={`rotate(${a})`} />
  ));
  return <>{ring(20, 0.32, 18)}{ring(13, 0.48, 13)}{ring(6, 0.62, 8)}<circle cx="0" cy="0" r="5" fill={gold} opacity="0.85" /><circle cx="0" cy="0" r="2" fill={IVORY} /></>;
}

/** Single rose bloom — layered petals, top view. */
function FlowerBloom({ className = 'w-16 h-16', color = ROSE, gold = GOLD }: { className?: string; color?: string; gold?: string }) {
  return (
    <svg className={className} viewBox="-40 -40 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <BloomShape color={color} gold={gold} />
    </svg>
  );
}

/** Multi-flower bouquet cluster (roses) — parametrized colors so each section's tone differs. */
function FlowerCluster({ className = 'w-28 h-28', flip = false, rose = ROSE, soft = GOLD_SOFT, gold = GOLD, sage = SAGE }: { className?: string; flip?: boolean; rose?: string; soft?: string; gold?: string; sage?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <ellipse cx="30" cy="82" rx="22" ry="9" transform="rotate(-30 30 82)" fill={sage} opacity="0.4" />
      <ellipse cx="90" cy="88" rx="20" ry="8" transform="rotate(35 90 88)" fill={sage} opacity="0.4" />
      <ellipse cx="60" cy="102" rx="26" ry="9" fill={sage} opacity="0.35" />
      <path d="M30 82 Q40 52 44 38" stroke={sage} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M90 88 Q78 56 70 42" stroke={sage} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M60 102 Q60 62 60 46" stroke={sage} strokeWidth="1" fill="none" opacity="0.6" />
      <g transform="translate(44 38) scale(0.5)"><BloomShape color={rose} gold={gold} /></g>
      <g transform="translate(70 42) scale(0.45)"><BloomShape color={soft} gold={gold} /></g>
      <g transform="translate(58 46) scale(0.55)"><BloomShape color={rose} gold={gold} /></g>
      <circle cx="26" cy="52" r="3" fill={rose} opacity="0.7" />
      <circle cx="94" cy="56" r="2.5" fill={gold} opacity="0.7" />
      <circle cx="60" cy="30" r="2" fill={rose} opacity="0.6" />
    </svg>
  );
}

/** Daisy (narrow-petal) bloom shape, origin-centered. */
function DaisyShape({ petal = IVORY, center = GOLD }: { petal?: string; center?: string }) {
  return (<>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <ellipse key={a} cx="0" cy="-12" rx="3.5" ry="11" fill={petal} opacity="0.88" transform={`rotate(${a})`} />
    ))}
    <circle cx="0" cy="0" r="5" fill={center} />
    <circle cx="0" cy="0" r="2" fill={INK} opacity="0.25" />
  </>);
}

/** Daisy bouquet cluster — distinct silhouette from the rose cluster. */
function DaisyCluster({ className = 'w-28 h-28', flip = false, petal = IVORY, center = GOLD, sage = SAGE }: { className?: string; flip?: boolean; petal?: string; center?: string; sage?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <ellipse cx="32" cy="84" rx="22" ry="9" transform="rotate(-30 32 84)" fill={sage} opacity="0.4" />
      <ellipse cx="88" cy="88" rx="20" ry="8" transform="rotate(35 88 88)" fill={sage} opacity="0.4" />
      <path d="M32 84 Q42 56 46 42" stroke={sage} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M88 88 Q76 58 68 46" stroke={sage} strokeWidth="1" fill="none" opacity="0.6" />
      <g transform="translate(46 42)"><DaisyShape petal={petal} center={center} /></g>
      <g transform="translate(72 48) scale(0.82)"><DaisyShape petal={petal} center={center} /></g>
      <g transform="translate(58 58) scale(0.65)"><DaisyShape petal={petal} center={center} /></g>
      <circle cx="26" cy="56" r="2.5" fill={center} opacity="0.6" />
    </svg>
  );
}

/** Tulip cup shape, origin-centered. */
function TulipShape({ color = ROSE }: { color?: string }) {
  return (<>
    <path d="M0 8 C-11 8 -13 -8 -9 -15 C-4 -8 4 -8 9 -15 C13 -8 11 8 0 8 Z" fill={color} opacity="0.82" />
    <path d="M0 8 C-3 3 -3 -4 0 -11" stroke={INK} strokeWidth="0.5" opacity="0.25" fill="none" />
  </>);
}

/** Tulip bouquet cluster — third silhouette variant for variety. */
function TulipCluster({ className = 'w-28 h-28', flip = false, color = ROSE, sage = SAGE }: { className?: string; flip?: boolean; color?: string; sage?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <ellipse cx="34" cy="86" rx="22" ry="9" transform="rotate(-28 34 86)" fill={sage} opacity="0.4" />
      <ellipse cx="86" cy="90" rx="20" ry="8" transform="rotate(32 86 90)" fill={sage} opacity="0.4" />
      <path d="M46 84 Q46 60 46 48" stroke={sage} strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M70 88 Q70 62 68 50" stroke={sage} strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M58 92 Q58 64 58 52" stroke={sage} strokeWidth="1.2" fill="none" opacity="0.6" />
      <g transform="translate(46 48)"><TulipShape color={color} /></g>
      <g transform="translate(68 50)"><TulipShape color={GOLD_SOFT} /></g>
      <g transform="translate(58 52) scale(0.85)"><TulipShape color={color} /></g>
    </svg>
  );
}

/** Color tones cycle per section so no two adjacent sections share the same palette. */
const TONES = [
  { rose: ROSE, soft: '#E8B0B0', petal: '#E8B0B0', center: GOLD, fly: ROSE, spark: GOLD },          // 0 dusty rose
  { rose: GOLD_SOFT, soft: '#E8D4A8', petal: '#EFDDB6', center: GOLD_DEEP, fly: GOLD_SOFT, spark: ROSE }, // 1 champagne
  { rose: '#A8B89A', soft: '#C2D0B0', petal: '#D2DCC2', center: GOLD, fly: '#9AAB8C', spark: GOLD }, // 2 sage
  { rose: '#C98A8A', soft: '#E0B5B5', petal: '#E6C3B8', center: GOLD_DEEP, fly: ROSE, spark: GOLD_DEEP }, // 3 deep rose
];

/** Corner ornament dispatcher — renders a gold-filigree FloralCorner with a tone-tinted accent. */
function Cluster({ tone = 0, flip = false }: { tone?: number; flip?: boolean }) {
  const t = TONES[tone % TONES.length];
  return <FloralCorner className="w-24 h-24 md:w-32 md:h-32" flip={flip} accent={t.rose} leaf={SAGE} />;
}

/**
 * Per-section floral garden — everything absolute (scrolls WITH the section, never fixed).
 * `tone` rotates flower silhouette (roses/daisies/tulips) + color palette per section.
 * `density`: 'full' = 4 corners + vines + 2 butterflies + 3 sparkles; 'corners' = 4 corners +
 *   1 butterfly + 2 sparkles; 'minimal' = 2 diagonal corners + 1 butterfly + 1 sparkle.
 * Corners hug the outer edge (negative offset, clipped by overflow-hidden) so they frame
 * the section without crowding centered content.
 */
function SectionGarden({ reduce, tone = 0, density = 'minimal' }: { reduce: boolean; tone?: number; density?: 'full' | 'corners' | 'minimal' }) {
  const t = TONES[tone % TONES.length];
  const allCorners = [
    { c: '-top-3 -left-3', flip: false },
    { c: '-top-3 -right-3', flip: true },
    { c: '-bottom-3 -left-3', flip: true },
    { c: '-bottom-3 -right-3', flip: false },
  ];
  const corners = density === 'minimal' ? [allCorners[0], allCorners[3]] : allCorners;
  const flies = density === 'full'
    ? [{ c: 'top-[16%] right-[12%]', dur: 8, delay: 0.4, size: 'w-8 h-8', flip: false }]
    : density === 'corners'
      ? [{ c: 'top-[20%] left-[16%]', dur: 8.5, delay: 0.8, size: 'w-7 h-7', flip: true }]
      : [];
  const sparks = density === 'full' ? ['top-[30%] left-[26%]', 'bottom-[28%] right-[28%]'] : density === 'corners' ? ['top-[36%] right-[30%]'] : [];
  return (
    <>
      {corners.map((x, i) => (
        <motion.div key={`c${i}`} className={`absolute ${x.c} z-0 pointer-events-none`}
          initial={{ opacity: 0, scale: 0.5, rotate: x.flip ? 18 : -18 }}
          whileInView={{ opacity: 0.8, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1, ease: EASE, delay: i * 0.1 }}>
          <Cluster tone={tone} flip={x.flip} />
        </motion.div>
      ))}
      {!reduce && flies.map((b, i) => (
        <motion.div key={`b${i}`} className={`absolute ${b.c} z-0 pointer-events-none`}
          initial={{ opacity: 0 }} whileInView={{ opacity: 0.75 }} viewport={{ once: true }}
          animate={{ y: [0, -12, 4, -8, 0], x: [0, 6, -3, 4, 0], rotate: [0, 7, -4, 3, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}>
          <Butterfly className={b.size} color={t.fly} gold={GOLD} flip={b.flip} />
        </motion.div>
      ))}
      {!reduce && sparks.map((s, i) => (
        <div key={`s${i}`} className={`melati-twinkle absolute ${s} z-0`}><Sparkle className="w-2.5 h-2.5" color={t.spark} /></div>
      ))}
    </>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanMelati({ content, slug, preview }: MonolithicTemplateProps) {
  const data = deriveData(content);
  const { p1, p2, isoDate, displayDate, location, events, stories, gallery, gifts, quote, audio, intro, hashtag, dresscode, rundown, video, liveStream, media } = data;

  const [isOpen, setIsOpen] = useState(preview ?? false);
  const [isPlaying, setIsPlaying] = useState(false);
  const guestName = useGuestName(content.guestName, 'Tamu Undangan');
  const countdown = useCountdown(isoDate);
  const [storyIdx, setStoryIdx] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const { wishes, rsvpForm, setRsvpForm, isSubmitted, submit } = useRsvpWishes(slug);
  const reduce = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useAutoplayMusic(audioRef, setIsPlaying);

  useEffect(() => { injectStyles(); }, []);

  const open = () => { setIsOpen(true); setIsPlaying(true); audioRef.current?.play().catch(() => {}); };
  const toggleMusic = () => { if (!audioRef.current) return; if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(() => {}); setIsPlaying(!isPlaying); };
  const copy = (text: string, idx: number) => { navigator.clipboard?.writeText(text); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2500); };
  const ytThumb = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const ytEmbed = (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

  /* ── 1. COVER GATE ── */
  if (!isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex overflow-y-auto" style={{ backgroundColor: IVORY }}>
        <motion.div className="absolute top-0 left-0 right-0 z-10" initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.2 }}><Garland className="w-full h-7 opacity-80" /></motion.div>
        <FloralCorner className="absolute top-2 left-2 w-24 h-24 z-10" />
        <FloralCorner className="absolute top-2 right-2 w-24 h-24 z-10" flip />
        <FloralCorner className="absolute bottom-2 left-2 w-24 h-24 z-10" flip />
        <FloralCorner className="absolute bottom-2 right-2 w-24 h-24 z-10" />
        <motion.div className="absolute top-10 right-16 z-0" animate={reduce ? {} : { y: [0, -12, 0], rotate: [4, -3, 4] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <Butterfly className="w-14 h-14" color={ROSE} />
        </motion.div>
        <motion.div className="absolute bottom-24 left-16 z-0" animate={reduce ? {} : { y: [0, 10, 0], rotate: [-6, 4, -6] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
          <Butterfly className="w-11 h-11" color={GOLD_SOFT} flip />
        </motion.div>

        <motion.div className="m-auto px-6 py-16 max-w-md w-full text-center relative z-20" variants={stagC} initial="hidden" animate="visible">
          <motion.div variants={stagI} className="flex justify-center mb-6 relative">
            <Sparkle className="w-6 h-6 absolute -left-2 -top-1" color={GOLD} />
            <GoldFrame className="w-36 mx-auto" aspect="1/1">
              <img src={media.cover} alt="Cover" className="w-full h-full object-cover" />
            </GoldFrame>
            <Sparkle className="w-5 h-5 absolute -right-1 bottom-2" color={ROSE} />
          </motion.div>
          <motion.p variants={stagI} className="font-accent text-[11px] uppercase tracking-[0.45em]" style={{ color: GOLD_DEEP }}>The Wedding of</motion.p>
          <motion.h1 variants={stagI} className="font-display text-6xl leading-[0.95] mt-4" style={{ color: INK }}>
            {p1.nick}
            <span className="block font-accent text-2xl italic my-1" style={{ color: GOLD }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.div variants={stagI} className="max-w-[200px] mx-auto mt-5"><FiligreeDivider color={GOLD} /></motion.div>
          <motion.p variants={stagI} className="font-accent text-sm mt-5" style={{ color: INK_SOFT }}>{displayDate}</motion.p>
          <motion.div variants={stagI} className="mt-8">
            <p className="text-[9px] uppercase tracking-[0.4em] font-body" style={{ color: MUTED }}>Kepada Yth.</p>
            <p className="font-display text-xl mt-1" style={{ color: INK }}>{guestName}</p>
          </motion.div>
          <motion.div variants={stagI} className="mt-8">
            <button onClick={open} type="button"
              className="group relative inline-flex items-center gap-2.5 px-10 py-4 text-xs uppercase tracking-[0.35em] font-body font-semibold transition-all duration-300 hover:tracking-[0.42em]"
              style={{ color: IVORY, backgroundColor: INK, border: `1px solid ${GOLD}` }}>
              Buka Undangan
            </button>
          </motion.div>
        </motion.div>
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] tracking-[0.5em] uppercase z-20 font-body" style={{ color: MUTED }}>#{hashtag}</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: IVORY, color: INK }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic} type="button"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: INK, border: `1px solid ${GOLD}`, borderRadius: '50%' }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: IVORY }} /> : <VolumeX className="w-5 h-5" style={{ color: IVORY, opacity: 0.6 }} />}
      </button>

      {/* ═══ 2. HERO — "Bound by Love" ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: CREAM }}>
        <div className="absolute inset-0 opacity-[0.5]">
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover" /> : <img src={media.hero} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${IVORY}E6 0%, ${CREAM}99 40%, ${CREAM}F2 100%)` }} />
        <FallingPetals reduce={!!reduce} />
        <FloralCorner className="absolute top-3 left-3 w-24 h-24 z-10" />
        <FloralCorner className="absolute bottom-3 right-3 w-24 h-24 z-10" flip />
        <LeafyVine className="absolute left-2 bottom-12 h-40 w-9 z-0 opacity-70" />
        <div className="melati-twinkle absolute top-1/3 left-1/4 z-10"><Sparkle className="w-4 h-4" color={GOLD} /></div>
        <div className="melati-twinkle absolute top-2/3 right-1/4 z-10"><Sparkle className="w-3 h-3" color={ROSE} /></div>
        <motion.div className="absolute top-12 right-8 z-10" animate={reduce ? {} : { y: [0, -14, 0], rotate: [5, -4, 5] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}>
          <Butterfly className="w-16 h-16" color={ROSE} />
        </motion.div>
        <motion.div className="absolute bottom-20 left-10 z-10" animate={reduce ? {} : { y: [0, 12, 0], rotate: [-6, 5, -6] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
          <Butterfly className="w-12 h-12" color={GOLD_SOFT} flip />
        </motion.div>

        <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-32 text-center">
          <motion.p className="font-accent text-[11px] uppercase tracking-[0.5em]" style={{ color: GOLD_DEEP }}
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>Bound by Love</motion.p>
          <motion.h1 className="font-display text-7xl md:text-8xl leading-[0.9] mt-5" style={{ color: INK }}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}>
            {p1.nick}<br /><span className="font-accent italic text-3xl" style={{ color: GOLD }}>&amp;</span> {p2.nick}
          </motion.h1>
          <motion.div className="max-w-[220px] mx-auto mt-7" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.7 }}>
            <FiligreeDivider color={GOLD} />
          </motion.div>
          <motion.p className="font-accent text-base mt-6" style={{ color: INK_SOFT }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 0.9 }}>{displayDate} &nbsp;·&nbsp; {location}</motion.p>
          <motion.p className="font-accent text-xs tracking-[0.3em] uppercase mt-3" style={{ color: ROSE }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 1.05 }}>#{hashtag}</motion.p>
        </div>
      </section>

      {/* ═══ 3. EVER AFTER BEGINS — intro bridge ═══ */}
      <motion.section className="relative px-6 py-24 overflow-hidden text-center" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SectionGarden reduce={!!reduce} tone={0} density="minimal" />
        <BotanicalSpray className="absolute left-4 top-2 w-16 h-16 opacity-70" />
        <BotanicalSpray className="absolute right-4 top-2 w-16 h-16 opacity-70" />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="max-w-[160px] mx-auto mb-6"><FiligreeDivider color={GOLD} /></div>
          <motion.h2 variants={vUp} className="font-display text-4xl md:text-5xl" style={{ color: INK }}>Ever After Begins</motion.h2>
          <motion.p variants={vUp} className="font-accent text-base leading-relaxed mt-5" style={{ color: INK_SOFT }}>{intro}</motion.p>
          <div className="max-w-[160px] mx-auto mt-6"><FiligreeDivider color={GOLD} /></div>
        </div>
      </motion.section>

      {/* ═══ 4. COUPLE — framed portraits, parents, IG ═══ */}
      <motion.section className="relative px-6 py-24 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SectionGarden reduce={!!reduce} tone={1} density="minimal" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>Dua Hati Yang Dipersatukan</p>
            <h2 className="font-display text-4xl mt-3" style={{ color: INK }}>Mempelai Kami</h2>
            <div className="max-w-[160px] mx-auto mt-5"><FiligreeDivider color={GOLD} /></div>
          </div>
          <div className="space-y-20">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria' },
              { person: p2, img: media.p2, label: 'Mempelai Wanita' },
            ].map(({ person, img, label }, idx) => (
              <motion.div key={label} className="text-center" variants={vUp}>
                <div className="flex justify-center mb-6">
                  <GoldFrame className="w-48">
                    <img src={img} alt={person.nick} className="w-full h-full object-cover object-top" />
                  </GoldFrame>
                </div>
                <p className="font-accent text-[10px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>{label}</p>
                <h3 className="font-display text-3xl mt-2" style={{ color: INK }}>{person.full}</h3>
                {person.desc && <p className="font-accent text-sm leading-relaxed mt-3 max-w-sm mx-auto" style={{ color: INK_SOFT }}>{person.desc}</p>}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className="block w-8 h-px" style={{ background: GOLD }} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-body" style={{ color: MUTED }}>Putra/i dari</p>
                    <p className="text-xs font-body font-medium mt-0.5" style={{ color: INK }}>{person.father}</p>
                    <p className="text-xs font-body" style={{ color: INK_SOFT }}>&amp; {person.mother}</p>
                  </div>
                  <span className="block w-8 h-px" style={{ background: GOLD }} />
                </div>
                {person.ig && <p className="font-body text-xs mt-3" style={{ color: ROSE }}>{person.ig}</p>}
                {idx === 0 && <p className="font-accent italic text-3xl mt-10" style={{ color: GOLD }}>&amp;</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. COUNTDOWN — Save the Date ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden text-center" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <FallingPetals reduce={!!reduce} />
        <SectionGarden reduce={!!reduce} tone={2} density="corners" />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="max-w-[160px] mx-auto mb-5"><FiligreeDivider color={GOLD} /></div>
          <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>Save the Date</p>
          <h2 className="font-display text-3xl mt-2 mb-10" style={{ color: INK }}>Menuju Hari Bahagia</h2>
          <div className="grid grid-cols-4 gap-2 md:gap-6">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="relative"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE, delay: idx * 0.08 }}>
                <div className="border p-3 md:p-5" style={{ borderColor: `${GOLD_SOFT}99`, backgroundColor: CREAM }}>
                  <motion.span className="font-display block tabular-nums leading-none" style={{ color: item.accent ? GOLD_DEEP : INK, fontSize: 'clamp(2rem, 8vw, 3.4rem)' }}
                    key={item.val} initial={reduce ? false : { y: -14, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: EASE }}>
                    {String(item.val).padStart(2, '0')}
                  </motion.span>
                  <span className="text-[9px] uppercase tracking-[0.3em] font-body mt-2 block" style={{ color: MUTED }}>{item.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T130000Z&location=${encodeURIComponent(location)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300 hover:gap-3"
              style={{ color: IVORY, backgroundColor: INK, border: `1px solid ${GOLD}` }}>
              <Calendar className="w-4 h-4" /> Add to Calendar
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. LOVE STORY — carousel "Where It All Began" ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SectionGarden reduce={!!reduce} tone={3} density="full" />
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>Our Journey</p>
          <h2 className="font-display text-4xl mt-2" style={{ color: INK }}>Where It All Began</h2>
          <div className="max-w-[160px] mx-auto mt-5 mb-12"><FiligreeDivider color={GOLD} /></div>

          {stories.length > 0 && (
            <div className="relative">
              <motion.div key={storyIdx}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2}
                onDragEnd={(_, info) => { if (info.offset.x < -60) setStoryIdx((i) => Math.min(i + 1, stories.length - 1)); if (info.offset.x > 60) setStoryIdx((i) => Math.max(i - 1, 0)); }}>
                <div className="flex justify-center mb-6">
                  <GoldFrame className="w-64" aspect="4/3">
                    <img src={gallery[storyIdx % gallery.length]} alt={stories[storyIdx].title} className="w-full h-full object-cover" />
                  </GoldFrame>
                </div>
                <p className="font-accent text-[10px] tracking-[0.4em] uppercase" style={{ color: ROSE }}>{stories[storyIdx].year}</p>
                <h3 className="font-display text-3xl mt-2" style={{ color: INK }}>{stories[storyIdx].title}</h3>
                <p className="font-accent text-base leading-relaxed mt-4 max-w-md mx-auto" style={{ color: INK_SOFT }}>{stories[storyIdx].desc}</p>
              </motion.div>

              <div className="flex items-center justify-center gap-4 mt-10">
                <button onClick={() => setStoryIdx((i) => Math.max(i - 1, 0))} type="button" disabled={storyIdx === 0}
                  className="p-2 transition-opacity" style={{ color: GOLD_DEEP, opacity: storyIdx === 0 ? 0.3 : 1 }} aria-label="Sebelumnya"><ChevronLeft className="w-6 h-6" /></button>
                <p className="font-display text-lg tabular-nums" style={{ color: INK }}>
                  <span style={{ color: GOLD_DEEP }}>{String(storyIdx + 1).padStart(2, '0')}</span> / {String(stories.length).padStart(2, '0')}
                </p>
                <button onClick={() => setStoryIdx((i) => Math.min(i + 1, stories.length - 1))} type="button" disabled={storyIdx === stories.length - 1}
                  className="p-2 transition-opacity" style={{ color: GOLD_DEEP, opacity: storyIdx === stories.length - 1 ? 0.3 : 1 }} aria-label="Berikutnya"><ChevronRight className="w-6 h-6" /></button>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY — "Forever in Frames" + lightbox ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <SectionGarden reduce={!!reduce} tone={0} density="minimal" />
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>Captured Moments</p>
          <h2 className="font-display text-4xl mt-2 mb-12" style={{ color: INK }}>Forever in Frames</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {gallery.slice(0, 9).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button" variants={vZoom}
                className="relative group cursor-pointer overflow-hidden" style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1' } : { aspectRatio: '1' }}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${INK}99, transparent 60%)`, border: `1px solid ${GOLD_SOFT}` }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${INK}F2`, backdropFilter: 'blur(6px)' }} onClick={() => setLightboxIndex(null)} data-lumina-lightbox>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 text-2xl font-light" style={{ color: IVORY }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2" style={{ color: IVORY }} aria-label="Sebelumnya"><ChevronLeft className="w-7 h-7" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2" style={{ color: IVORY }} aria-label="Berikutnya"><ChevronRight className="w-7 h-7" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE }}
            style={{ border: `1px solid ${GOLD}` }}>
            <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain" />
          </motion.div>
        </div>
      )}

      {/* ═══ 8. VIDEO — "Captured in Motion" ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SectionGarden reduce={!!reduce} tone={1} density="corners" />
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>A Moving Memory</p>
          <h2 className="font-display text-4xl mt-2 mb-10" style={{ color: INK }}>Captured in Motion</h2>
          <motion.button onClick={() => video && setVideoOpen(true)} type="button" variants={vZoom}
            className="relative w-full overflow-hidden block group" style={{ aspectRatio: '16/9', border: `1px solid ${GOLD_SOFT}` }}>
            {video ? (
              <img src={ytThumb(video.youtubeId)} alt="Video thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${CREAM_DEEP}, ${GOLD_SOFT}55)` }} />
            )}
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${INK}33` }}>
              <span className="flex items-center justify-center w-16 h-16 rounded-full transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${IVORY}E6`, border: `1px solid ${GOLD}` }}>
                <Play className="w-6 h-6 ml-0.5" style={{ color: GOLD_DEEP, fill: GOLD_DEEP }} />
              </span>
            </div>
          </motion.button>
          <p className="font-accent text-sm mt-5" style={{ color: INK_SOFT }}>{video?.title || 'Video cinematic pernikahan kami akan segera hadir.'}</p>
        </div>
      </motion.section>

      {/* Video modal */}
      {videoOpen && video && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${INK}F2`, backdropFilter: 'blur(6px)' }} onClick={() => setVideoOpen(false)}>
          <button onClick={() => setVideoOpen(false)} className="absolute top-4 right-4 z-10 p-2 text-2xl font-light" style={{ color: IVORY }} aria-label="Tutup">&times;</button>
          <motion.div className="w-[90vw] max-w-3xl" style={{ aspectRatio: '16/9', border: `1px solid ${GOLD}` }} onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE }}>
            <iframe src={ytEmbed(video.youtubeId)} title={video.title} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
          </motion.div>
        </div>
      )}

      {/* ═══ 9. QUOTE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden text-center" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SectionGarden reduce={!!reduce} tone={2} density="full" />
        <BotanicalSpray className="absolute left-6 top-8 w-20 h-20 opacity-70" />
        <BotanicalSpray className="absolute right-6 bottom-8 w-20 h-20 opacity-70" />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="max-w-[160px] mx-auto mb-6"><FiligreeDivider color={GOLD} /></div>
          <motion.p variants={vUp} className="font-display text-2xl md:text-3xl italic leading-relaxed" style={{ color: INK }}>&ldquo;{quote.text}&rdquo;</motion.p>
          <div className="max-w-[160px] mx-auto mt-6"><FiligreeDivider color={GOLD} /></div>
          <p className="font-accent text-sm mt-5" style={{ color: GOLD_DEEP }}>{quote.source ? '— ' + quote.source : ''}</p>
        </div>
      </motion.section>

      {/* ═══ 10. EVENTS — "Join Our Celebration" ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SectionGarden reduce={!!reduce} tone={3} density="full" />
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>Save the Date</p>
          <h2 className="font-display text-4xl mt-2" style={{ color: INK }}>Join Our Celebration</h2>
          <p className="font-accent text-base mt-4 max-w-md mx-auto" style={{ color: INK_SOFT }}>Kami akan sangat senang apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan doa restu.</p>
          <p className="font-display text-2xl mt-3" style={{ color: GOLD_DEEP }}>{displayDate}</p>
          <div className="max-w-[160px] mx-auto mt-5 mb-12"><FiligreeDivider color={GOLD} /></div>

          <div className="grid gap-6">
            {events.map((evt, idx) => (
              <motion.div key={idx} variants={vUp} className="relative p-8 border" style={{ backgroundColor: IVORY, borderColor: `${GOLD_SOFT}99` }}>
                <CornerFlourish className="absolute -top-1 -left-1 w-8 h-8" color={GOLD} />
                <CornerFlourish className="absolute -bottom-1 -right-1 w-8 h-8" color={GOLD} />
                <h3 className="font-display text-2xl" style={{ color: INK }}>{evt.title}</h3>
                <div className="flex items-center justify-center gap-2 mt-3 font-accent text-sm" style={{ color: GOLD_DEEP }}>
                  <Clock className="w-4 h-4" /> {evt.time}
                </div>
                <div className="flex items-start justify-center gap-2 mt-2 font-body text-sm" style={{ color: INK_SOFT }}>
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: GOLD_DEEP }} />
                  <span>{evt.venue}{evt.address ? `, ${evt.address}` : ''}</span>
                </div>
                {evt.note && <p className="font-accent text-xs italic mt-3" style={{ color: MUTED }}>{evt.note}</p>}
                {evt.mapsUrl && (
                  <a href={evt.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 text-[11px] font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200 hover:gap-3"
                    style={{ color: IVORY, backgroundColor: INK, border: `1px solid ${GOLD}` }}>
                    <Map className="w-3.5 h-3.5" /> View Maps
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 11. DRESSCODE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden text-center" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SectionGarden reduce={!!reduce} tone={0} density="corners" />
        <div className="max-w-xl mx-auto relative z-10">
          <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>Attire Guide</p>
          <h2 className="font-display text-4xl mt-2 mb-3" style={{ color: INK }}>Dresscode</h2>
          <p className="font-accent text-base max-w-md mx-auto" style={{ color: INK_SOFT }}>{dresscode.intro}</p>
          <div className="grid grid-cols-2 gap-6 mt-12">
            <motion.div variants={vUp}>
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3" style={{ border: `1px solid ${GOLD_SOFT}`, backgroundColor: CREAM }}>
                <Shirt className="w-7 h-7" style={{ color: GOLD_DEEP }} />
              </span>
              <p className="font-accent text-[10px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>Men</p>
              <p className="font-display text-lg" style={{ color: INK }}>{dresscode.men.split(' — ')[0]}</p>
              <p className="font-body text-xs mt-1" style={{ color: INK_SOFT }}>{dresscode.men.split(' — ')[1] || ''}</p>
            </motion.div>
            <motion.div variants={vUp}>
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3" style={{ border: `1px solid ${GOLD_SOFT}`, backgroundColor: CREAM }}>
                <Shirt className="w-7 h-7" style={{ color: ROSE }} />
              </span>
              <p className="font-accent text-[10px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>Women</p>
              <p className="font-display text-lg" style={{ color: INK }}>{dresscode.women.split(' — ')[0]}</p>
              <p className="font-body text-xs mt-1" style={{ color: INK_SOFT }}>{dresscode.women.split(' — ')[1] || ''}</p>
            </motion.div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-10">
            {dresscode.palette.map((hex, i) => (
              <motion.span key={i} className="block w-9 h-9 rounded-full" style={{ backgroundColor: hex, border: `1px solid ${GOLD_SOFT}66` }}
                initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} />
            ))}
          </div>
          <p className="font-accent text-xs italic mt-4" style={{ color: MUTED }}>Nuansa lembut yang menyatu dengan keindahan taman.</p>
        </div>
      </motion.section>

      {/* ═══ 12. LIVE STREAM ═══ */}
      {liveStream && (
        <motion.section className="relative px-6 py-24 overflow-hidden text-center" style={{ backgroundColor: CREAM }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vZoom}>
          <SectionGarden reduce={!!reduce} tone={1} density="minimal" />
          <div className="max-w-xl mx-auto relative z-10">
            <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>For Our Distant Loved Ones</p>
            <h2 className="font-display text-4xl mt-2 mb-6" style={{ color: INK }}>Live Streaming</h2>
            <a href={liveStream.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300 hover:gap-3.5"
              style={{ color: IVORY, backgroundColor: INK, border: `1px solid ${GOLD}` }}>
              <Play className="w-4 h-4" style={{ fill: IVORY }} /> {liveStream.label}
            </a>
          </div>
        </motion.section>
      )}

      {/* ═══ 13. RUNDOWN ═══ */}
      {rundown.items.length > 0 && (
        <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: IVORY }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
          <SectionGarden reduce={!!reduce} tone={2} density="corners" />
          <div className="max-w-xl mx-auto relative z-10 text-center">
            <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>Susunan Acara</p>
            <h2 className="font-display text-4xl mt-2" style={{ color: INK }}>Rundown</h2>
            <p className="font-accent text-sm mt-2" style={{ color: GOLD_DEEP }}>{rundown.title}</p>
            <div className="max-w-[140px] mx-auto mt-5 mb-10"><FiligreeDivider color={GOLD} /></div>
            <div className="relative max-w-md mx-auto">
              <span className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px" style={{ background: `${GOLD_SOFT}99` }} />
              {rundown.items.map((it, idx) => (
                <motion.div key={idx} className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-6"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.08 }}>
                  <div className="text-right">
                    <p className="font-display text-xl tabular-nums" style={{ color: GOLD_DEEP }}>{it.time}</p>
                  </div>
                  <span className="block w-3 h-3 rounded-full z-10" style={{ backgroundColor: GOLD, border: `2px solid ${IVORY}`, boxShadow: `0 0 0 1px ${GOLD}` }} />
                  <div className="text-left">
                    <p className="font-accent text-sm" style={{ color: INK }}>{it.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 14. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
          <SectionGarden reduce={!!reduce} tone={3} density="full" />
          <div className="max-w-2xl mx-auto relative z-10 text-center">
            <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>Tanda Kasih</p>
            <h2 className="font-display text-4xl mt-2 mb-4" style={{ color: INK }}>Wedding Gift</h2>
            <p className="font-accent text-sm max-w-md mx-auto mb-10" style={{ color: INK_SOFT }}>Doa restu Anda adalah hadiah terindah. Jika ingin memberi tanda kasih nontunai, silakan salin nomor rekening berikut.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((g, idx) => (
                <motion.div key={idx} variants={vUp} className="p-7 border" style={{ backgroundColor: IVORY, borderColor: `${GOLD_SOFT}99` }}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Gift className="w-4 h-4" style={{ color: GOLD_DEEP }} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: GOLD_DEEP }}>{g.bank}</p>
                  </div>
                  <p className="font-display text-2xl tabular-nums my-2" style={{ color: INK }}>{g.number}</p>
                  <p className="font-body text-xs mb-4" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.2em] transition-all hover:gap-2.5"
                    style={{ color: GOLD_DEEP }}>
                    {copiedIdx === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin Nomor</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 15. RSVP — "Leave a Loving Note" ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SectionGarden reduce={!!reduce} tone={0} density="corners" />
        <div className="max-w-xl mx-auto relative z-10 text-center">
          <p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }}>Ucapan &amp; Doa</p>
          <h2 className="font-display text-4xl mt-2 mb-4" style={{ color: INK }}>Leave a Loving Note</h2>
          <p className="font-accent text-sm max-w-md mx-auto mb-10" style={{ color: INK_SOFT }}>Sungguh suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan memberikan doa restu.</p>

          {isSubmitted ? (
            <motion.div className="p-10 border" style={{ borderColor: `${GOLD}99`, backgroundColor: CREAM }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: GOLD }} />
              <p className="font-display text-lg" style={{ color: INK }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="text-left max-w-md mx-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-3 py-3 text-sm font-body outline-none transition-colors bg-transparent border-b"
                  style={{ color: INK, borderColor: `${GOLD_SOFT}99` }}
                  onFocus={(e) => (e.target.style.borderColor = GOLD)} onBlur={(e) => (e.target.style.borderColor = `${GOLD_SOFT}99`)} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-3 py-3 text-sm font-body outline-none bg-transparent border-b" style={{ color: INK, borderColor: `${GOLD_SOFT}99` }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-3 py-3 text-sm font-body outline-none transition-colors resize-none h-24 bg-transparent border-b"
                style={{ color: INK, borderColor: `${GOLD_SOFT}99` }}
                onFocus={(e) => (e.target.style.borderColor = GOLD)} onBlur={(e) => (e.target.style.borderColor = `${GOLD_SOFT}99`)} />
              <div className="text-center">
                <button type="submit"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300 hover:tracking-[0.35em]"
                  style={{ color: IVORY, backgroundColor: INK, border: `1px solid ${GOLD}` }}>
                  <Send className="w-4 h-4" /> Kirim Ucapan
                </button>
              </div>
            </form>
          )}

          {content.guestbook?.enabled !== false && wishes.length === 0 && (
            <p className="font-accent text-sm italic mt-8" style={{ color: MUTED }}>Belum ada ucapan — jadilah yang pertama mengirim doa restu.</p>
          )}
          {content.guestbook?.enabled !== false && wishes.length > 0 && (
            <div className="mt-10 space-y-4 max-h-[400px] overflow-y-auto pr-2 text-left max-w-md mx-auto">
              {wishes.slice(0, 20).map((w) => (
                <div key={w.id} className="pl-5 border-l" style={{ borderColor: `${GOLD}55` }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-base" style={{ color: INK }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1 font-body font-semibold" style={{ color: GOLD_DEEP }}>{w.attendance === 'Hadir' ? '✓ Hadir' : '✕ Tidak Hadir'}</p>
                  <p className="font-accent text-sm leading-relaxed" style={{ color: INK_SOFT }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 16. FOOTER — "From Our Hearts" ═══ */}
      <footer className="relative px-6 py-28 text-center overflow-hidden" style={{ backgroundColor: CREAM }}>
        <FallingPetals reduce={!!reduce} />
        <FloralCorner className="absolute top-2 left-2 w-24 h-24 z-0" />
        <FloralCorner className="absolute top-2 right-2 w-24 h-24 z-0" flip />
        <FloralCorner className="absolute bottom-2 left-2 w-24 h-24 z-0" flip />
        <FloralCorner className="absolute bottom-2 right-2 w-24 h-24 z-0" />
        <motion.div className="absolute top-16 left-12 z-0" animate={reduce ? {} : { y: [0, 10, 0], rotate: [-5, 4, -5] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
          <Butterfly className="w-12 h-12" color={ROSE} />
        </motion.div>
        <motion.div className="absolute top-20 right-12 z-0" animate={reduce ? {} : { y: [0, -12, 0], rotate: [5, -4, 5] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
          <Butterfly className="w-10 h-10" color={GOLD_SOFT} flip />
        </motion.div>
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="flex justify-center mb-8" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <GoldFrame className="w-28" aspect="1/1">
              <img src={media.cover} alt="Cover" className="w-full h-full object-cover" />
            </GoldFrame>
          </motion.div>
          <motion.p className="font-accent text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD_DEEP }} variants={vUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>From Our Hearts</motion.p>
          <motion.h2 className="font-display text-2xl md:text-3xl italic leading-snug max-w-lg mx-auto mt-4" style={{ color: INK }} variants={vUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Dengan tulus kami mengucapkan terima kasih atas doa, restu, dan kehadiran Anda di hari bahagia kami.
          </motion.h2>
          <div className="max-w-[160px] mx-auto my-8"><FiligreeDivider color={GOLD} /></div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="font-accent text-[10px] uppercase tracking-[0.4em]" style={{ color: MUTED }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl mt-3" style={{ color: INK }}>{p1.nick} <span className="font-accent italic text-2xl" style={{ color: GOLD }}>&amp;</span> {p2.nick}</h4>
            <p className="font-accent text-xs tracking-[0.3em] uppercase mt-3" style={{ color: ROSE }}>#{hashtag}</p>
          </motion.div>
        </div>
        <div className="border-t mt-14 pt-8 text-center" style={{ borderColor: `${GOLD_SOFT}44` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: MUTED }}>© {new Date().getFullYear()} {p1.nick} &amp; {p2.nick}. Melati Series.</p>
        </div>
      </footer>
    </div>
  );
}
