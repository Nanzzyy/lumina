'use client';

import { useState, useRef, useEffect } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent } from '@/lib/content/types';
import {
  Heart, Calendar, Clock, MapPin, Send, Gift, Copy, Check, ChevronLeft, ChevronRight,
  Volume2, VolumeX, Map,
} from 'lucide-react';
import { isVideo, useCountdown, useGuestName, displayDateFrom, pickMedia, useRsvpWishes } from './shared';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

/* ─── Motion Tokens ─── */
const EASE: [number, number, number, number] = [0.7, 0, 0.3, 1];
const EASE_DECO: [number, number, number, number] = [0.83, 0, 0.17, 1];
const DUR = 1;

/* Variant library — symmetric center-outward wipes give Ratu its regal character. */
const vUp: Variants = { hidden: { opacity: 0, y: 42 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.1, ease: 'easeOut' } } };
const vWipeCV: Variants = {
  hidden: { clipPath: 'inset(50% 50% 50% 50%)' },
  visible: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1, ease: EASE_DECO } },
};
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Ratu" (Queen) — Art Deco Emerald-Gold ───
   Gatsby-era geometric luxury: deep emerald grounds, gold hairlines, ivory type.
   Symmetry, sharp corners, thin parallel lines, octagon + diamond forms. */
const EMERALD = '#0F5132';
const EMERALD2 = '#0A3D26';
const GOLD = '#C9A227';
const GOLD2 = '#E0C050';
const BLACK = '#0A0A0A';
const CREAM = '#F5EEDC';
const CREAM2 = '#E8DEC4';
const IVORY = '#FBF6EA';
const MUTED = '#A89870';

const OCTAGON = 'polygon(50% 0%, 85% 15%, 100% 50%, 85% 85%, 50% 100%, 15% 85%, 0% 50%, 15% 15%)';
const DIAMOND = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Arka', full: 'Arka Pradipta Nuriman, S.T., M.M.', father: 'Bpk. Ir. H. Pradipta Nuriman, M.B.A.', mother: 'Ibu Hj. Ratna Wijayanti', ig: '@arkanuriman', desc: 'Pewaris sebuah nama besar yang meyakini kemegahan sejati lahir dari keteguhan hati dan kemuliaan budi.' },
    p2: { nick: 'Syahrini', full: 'Syahrini Maharani Wibowo, S.Sos.', father: 'Bpk. Drs. H. Gunawan Wibowo, M.Si.', mother: 'Ibu Hj. Lestari Anggraini', ig: '@syahrinimhrni', desc: 'Putri yang menambahkan sinar dalam tiap ruang — anggun, berbudi, dan berhati mulia bak seorang ratu.' },
  },
  date: '2027-09-18T19:00:00',
  quote: { text: 'Dua mahkota bertemu dalam satu singgasana. Cinta yang agung bukan menguasai, melainkan saling memahkotai — mengangkat satu sama lain dalam kehormatan, dalam kemuliaan, selama hidup.', source: 'Janji Kemegahan' },
  events: [
    { title: 'Akad Nikah', time: '08:00 - 10:00 WIB', venue: 'Ballroom The Royal Maharani', address: 'Jl. Sudirman No. 1, Jakarta Pusat', mapsUrl: 'https://maps.google.com', note: 'Khidmat, sakral, khusus keluarga inti dan kerabat terdekat' },
    { title: 'Resepsi Malam', time: '19:00 - 23:00 WIB', venue: 'Grand Ballroom The Aurelia', address: 'Jl. Thamrin No. 88, Jakarta Pusat', mapsUrl: 'https://maps.google.com', note: 'Gala dinner bergengsi, terbuka untuk seluruh tamu undangan' },
  ],
  stories: [
    { year: '2022', title: 'Pertemuan Kemegahan', desc: 'Berjumpa dalam sebuah gala amal bergengsi. Arka tersihir oleh keluhuran Syahrini; sejak malam itu, tak ada kemegahan dunia yang cukup untuk melupakan senyumnya.' },
    { year: '2024', title: 'Janji Singgasana', desc: 'Di tengah gemerlap pesta dan perjalanan, keduanya sepakat menempa takdir mulia — berdiri sejajar, saling mahkotai, berbagi satu singgasana hati.' },
    { year: '2026', title: 'Mahkota Abadi', desc: 'Dengan restu keluarga, dihadapan para kerabat, dua nama besar disatukan. Bukan sekadar pernikahan — sebuah penyatuan dinasti cinta yang abadi.' },
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
    { bank: 'Bank Mandiri', number: '1180023491820', owner: 'Arka Pradipta Nuriman' },
    { bank: 'Bank BCA', number: '0359871120', owner: 'Syahrini Maharani Wibowo' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600',
  hero: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1600',
  p1: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
  p2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
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
  const displayDate = displayDateFrom(isoDate, 'Sabtu, 18 September 2027');
  const location = content.event?.location || 'Jakarta';
  const events = (content.schedule?.items?.length
    ? content.schedule.items.map((it) => ({ title: it.title || '', time: it.time || '', venue: it.venue || '', address: it.address || '', mapsUrl: it.mapsUrl || '', note: it.description || '' }))
    : DEFAULTS.events).filter((e) => e.title);
  const stories = content.stories?.length ? content.stories : DEFAULTS.stories;
  const gallery = content.gallery?.images?.length ? content.gallery.images : DEFAULTS.gallery;
  const gifts = (content.gift?.items?.length
    ? content.gift.items.map((g) => ({ bank: g.bank || g.name || '', number: g.number || '', owner: g.owner || g.note || '' }))
    : DEFAULTS.gifts).filter((g) => g.bank || g.number || g.owner);
  const quote = content.quote?.text ? { text: content.quote.text, source: content.quote.source || '' } : DEFAULTS.quote;
  const audio = content.music?.src || DEFAULTS.audio;
  const media = pickMedia(content, { cover: DEFAULTS.cover, hero: DEFAULTS.hero, p1: DEFAULTS.p1, p2: DEFAULTS.p2 });
  return { p1, p2, isoDate, displayDate, location, events, stories, gallery, gifts, quote, audio, media };
}

function injectStyles() {
  if (typeof window === 'undefined' || document.getElementById('ratu-inv')) return;
  const s = document.createElement('style');
  s.id = 'ratu-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Poiret+One&family=Josefin+Sans:wght@300;400;500;600&display=swap');
.font-display { font-family: 'Poiret One', 'Josefin Sans', cursive; }
.font-body { font-family: 'Josefin Sans', sans-serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: art deco emerald-gold ─── */

/** Art-deco fan / sunburst — symmetrical radiating gold lines with fan arc. */
function DecoFan({ className = 'w-16 h-16', color = GOLD }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* rays */}
      {[-44, -28, -14, 0, 14, 28, 44].map((deg, i) => (
        <line key={i} x1="50" y1="50" x2="50" y2="6" stroke={color} strokeWidth="1" opacity={0.85}
          transform={`rotate(${deg} 50 50)`} />
      ))}
      {/* fan arc */}
      <path d="M10 54 A40 40 0 0 1 90 54" stroke={color} strokeWidth="1.6" fill="none" />
      <path d="M18 56 A32 32 0 0 1 82 56" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="50" cy="50" r="3.5" stroke={color} strokeWidth="1.2" fill="none" />
      <line x1="50" y1="60" x2="50" y2="94" stroke={color} strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

/** Thin parallel sunburst lines — radial deco accent. */
function SunburstLines({ className = 'w-40 h-40', color = GOLD, opacity = 0.22 }: { className?: string; color?: string; opacity?: number }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ opacity }}>
      {Array.from({ length: 24 }).map((_, i) => {
        const deg = i * 15;
        return <line key={i} x1="100" y1="100" x2="100" y2="2" stroke={color} strokeWidth="0.7"
          transform={`rotate(${deg} 100 100)`} opacity={0.5} />;
      })}
      <circle cx="100" cy="100" r="44" stroke={color} strokeWidth="0.8" fill="none" opacity="0.7" />
      <circle cx="100" cy="100" r="52" stroke={color} strokeWidth="0.5" fill="none" opacity="0.4" />
    </svg>
  );
}

/** Chevron zigzag gold line divider — symmetric. */
function Chevron({ className = 'w-full h-3', color = GOLD }: { className?: string; color?: string }) {
  const pts = '0,8 14,0 28,8 42,0 56,8 70,0 84,8 98,0 112,8 126,0 140,8';
  return (
    <svg className={className} viewBox="0 0 140 8" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts} stroke={color} strokeWidth="1.2" fill="none" />
      <polyline points={pts} stroke={color} strokeWidth="1.2" fill="none" transform="translate(0, 0)" opacity="0.5" />
    </svg>
  );
}

/** Symmetric chevron + diamond divider — the signature section rule. */
function DecoDivider({ color = GOLD }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-8">
      <span className="block w-16" style={{ height: 1, background: `linear-gradient(to left, ${color}, transparent)` }} />
      <span className="inline-block" style={{ width: 8, height: 8, background: color, transform: 'rotate(45deg)' }} />
      <Chevron className="w-20 h-2.5" color={color} />
      <span className="inline-block" style={{ width: 10, height: 10, border: `1px solid ${color}`, transform: 'rotate(45deg)' }} />
      <Chevron className="w-20 h-2.5" color={color} />
      <span className="inline-block" style={{ width: 8, height: 8, background: color, transform: 'rotate(45deg)' }} />
      <span className="block w-16" style={{ height: 1, background: `linear-gradient(to right, ${color}, transparent)` }} />
    </div>
  );
}

/** Geometric deco corner frame — four sharp stepped brackets. */
function DecoFrame({ className = '', color = GOLD, width = 'inset-4' }: { className?: string; color?: string; width?: string }) {
  return (
    <div className={`absolute ${width} pointer-events-none z-10 ${className}`} aria-hidden="true">
      {/* corners — sharp stepped L's */}
      <span className="absolute top-0 left-0" style={{ width: 36, height: 36, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <span className="absolute top-0 left-0" style={{ width: 14, height: 14, top: 8, left: 8, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}`, opacity: 0.7 }} />
      <span className="absolute top-0 right-0" style={{ width: 36, height: 36, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      <span className="absolute top-0 right-0" style={{ width: 14, height: 14, top: 8, right: 8, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}`, opacity: 0.7 }} />
      <span className="absolute bottom-0 left-0" style={{ width: 36, height: 36, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <span className="absolute bottom-0 left-0" style={{ width: 14, height: 14, bottom: 8, left: 8, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}`, opacity: 0.7 }} />
      <span className="absolute bottom-0 right-0" style={{ width: 36, height: 36, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      <span className="absolute bottom-0 right-0" style={{ width: 14, height: 14, bottom: 8, right: 8, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}`, opacity: 0.7 }} />
    </div>
  );
}

/** Gold shimmer sweep overlay — symmetric highlight pass for buttons/cards. */
function GoldShimmer({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  return (
    <motion.span className="absolute inset-0 pointer-events-none"
      style={{ background: `linear-gradient(110deg, transparent 0%, ${GOLD2}55 48%, transparent 56%, transparent 100%)`, backgroundSize: '250% 100%' }}
      initial={{ backgroundPosition: '-150% center' }}
      animate={{ backgroundPosition: '250% center' }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }} />
  );
}

/** Symmetric shimmering sunbursts in the field — the signature ambient motion. */
function AmbientBursts({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const bursts = [
    { top: '8%', left: '10%', size: 140, delay: 0, dur: 8 },
    { top: '14%', right: '8%', size: 170, delay: 1.2, dur: 9, flip: true },
    { top: '60%', left: '4%', size: 120, delay: 0.6, dur: 7.5 },
    { top: '76%', right: '6%', size: 150, delay: 2, dur: 8.5, flip: true },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {bursts.map((b, i) => (
        <motion.div key={i} className="absolute" style={{ top: b.top, left: b.left, right: (b as { right?: string }).right }}
          initial={{ opacity: 0, rotate: -8 }}
          animate={{ opacity: [0, 0.5, 0.35, 0.5], rotate: [0, 6, -6, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}>
          <SunburstLines color={GOLD} opacity={0.18} className="" />
          <div style={{ width: b.size, height: b.size }} />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanRatu({ content, slug, preview }: MonolithicTemplateProps) {
  const data = deriveData(content);
  const { p1, p2, isoDate, displayDate, location, events, stories, gallery, gifts, quote, audio, media } = data;

  const [isOpen, setIsOpen] = useState(preview ?? false);
  const [isPlaying, setIsPlaying] = useState(false);
  const guestName = useGuestName(content.guestName, 'Tamu Undangan');
  const countdown = useCountdown(isoDate);
  const [activeTab, setActiveTab] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { wishes, rsvpForm, setRsvpForm, isSubmitted, submit } = useRsvpWishes(slug);
  const reduce = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { injectStyles(); }, []);

  const open = () => { setIsOpen(true); setIsPlaying(true); audioRef.current?.play().catch(() => {}); };
  const toggleMusic = () => { if (!audioRef.current) return; if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(() => {}); setIsPlaying(!isPlaying); };
  const copy = (text: string, idx: number) => { navigator.clipboard?.writeText(text); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2500); };
  const activeEvt = events[activeTab] || events[0];

  /* ── COVER ── */
  if (!isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${EMERALD2} 0%, ${EMERALD} 50%, ${EMERALD2} 100%)` }}>
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `linear-gradient(${GOLD} 1px, transparent 1px), linear-gradient(90deg, ${GOLD} 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
        <SunburstLines className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180vmin] h-[180vmin]" color={GOLD} opacity={0.05} />

        <DecoFrame width="inset-5" color={GOLD} />

        <motion.div className="relative z-20 text-center px-6 max-w-md w-full"
          variants={stagC} initial="hidden" animate="visible">
          <motion.div variants={stagI} className="flex justify-center mb-7">
            <DecoFan className="w-16 h-16" color={GOLD} />
          </motion.div>
          <motion.p variants={stagI} className="text-[10px] uppercase font-body font-light" style={{ color: GOLD2, letterSpacing: '0.6em' }}>The Wedding of</motion.p>
          <motion.h1 variants={stagI} className="font-display text-6xl leading-[1] font-normal mt-5" style={{ color: IVORY, letterSpacing: '0.04em' }}>
            {p1.nick}
            <span className="block font-body font-light text-xl my-2" style={{ color: GOLD }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.div variants={stagI} className="max-w-[180px] mx-auto mt-6"><Chevron color={GOLD} /></motion.div>
          <motion.p variants={stagI} className="font-display text-sm font-normal mt-5" style={{ color: CREAM, letterSpacing: '0.15em' }}>{displayDate}</motion.p>
          <motion.div variants={stagI} className="mt-9 space-y-2">
            <p className="text-[9px] uppercase font-body font-light" style={{ color: `${GOLD2}CC`, letterSpacing: '0.4em' }}>Kepada Yth.</p>
            <p className="font-display text-lg font-normal" style={{ color: IVORY, letterSpacing: '0.05em' }}>{guestName}</p>
          </motion.div>
          <motion.div variants={stagI} className="mt-9">
            <button onClick={open}
              className="group relative px-12 py-4 text-xs uppercase font-body font-medium transition-all duration-300 overflow-hidden"
              style={{ color: EMERALD2, backgroundColor: GOLD, letterSpacing: '0.35em' }}>
              <span className="relative z-10 flex items-center gap-2.5"><Heart className="w-3.5 h-3.5" /> Buka Undangan</span>
              <GoldShimmer reduce={!!reduce} />
            </button>
          </motion.div>
        </motion.div>
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[7px] uppercase font-body z-20 font-light" style={{ color: `${GOLD2}99`, letterSpacing: '0.5em' }}>#{p1.nick}{p2.nick}Ratu</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: IVORY, color: BLACK }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: EMERALD2, border: `2px solid ${GOLD}` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: GOLD2 }} /> : <VolumeX className="w-5 h-5" style={{ color: GOLD2, opacity: 0.6 }} />}
      </button>

      {/* ═══ 1. HERO — symmetric centered, deco framed ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: EMERALD2 }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1.02, 1.08, 1.02] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-35" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-35" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${EMERALD2}E6 0%, ${EMERALD2}99 45%, ${EMERALD2}E6 100%)` }} />
        <AmbientBursts reduce={!!reduce} />
        <SunburstLines className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vmin] h-[120vmin]" color={GOLD} opacity={0.05} />

        <DecoFrame width="inset-5" color={GOLD} />

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.25 }}>
            <DecoFan className="w-14 h-14 mx-auto mb-6" color={GOLD} />
          </motion.div>
          <motion.p className="text-[10px] uppercase font-body font-light" style={{ color: GOLD2, letterSpacing: '0.55em' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.9 }}>Undangan Pernikahan</motion.p>
          <motion.h1 className="font-display text-6xl md:text-7xl leading-[1] font-normal mt-5" style={{ color: IVORY, letterSpacing: '0.04em' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.55 }}>
            {p1.nick}
            <span className="block font-body font-light text-3xl my-1" style={{ color: GOLD }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.div className="max-w-[200px] mx-auto mt-7" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, ease: EASE_DECO, delay: 0.8 }}>
            <Chevron color={GOLD} />
          </motion.div>
          <motion.p className="font-display text-base font-normal mt-5" style={{ color: CREAM, letterSpacing: '0.15em' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: DUR, ease: EASE }}>{displayDate}</motion.p>
          <motion.p className="text-[10px] uppercase font-body font-light mt-1" style={{ color: GOLD2, letterSpacing: '0.35em' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05, duration: DUR, ease: EASE }}>{location}</motion.p>

          {guestName && (
            <motion.div className="mt-8 inline-block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: DUR, ease: EASE }}>
              <div className="px-6 py-2.5" style={{ border: `1px solid ${GOLD}55`, backgroundColor: `${GOLD}11` }}>
                <p className="text-[9px] uppercase font-body font-light" style={{ color: `${GOLD2}CC`, letterSpacing: '0.3em' }}>Kepada Yth.</p>
                <p className="font-display text-base font-normal mt-0.5" style={{ color: IVORY, letterSpacing: '0.04em' }}>{guestName}</p>
              </div>
            </motion.div>
          )}
          <motion.div className="mt-12 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <span className="text-[8px] uppercase font-body font-light" style={{ color: `${GOLD2}99`, letterSpacing: '0.4em' }}>Scroll</span>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <AmbientBursts reduce={!!reduce} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <DecoDivider color={GOLD} />
          <motion.p className="font-display text-5xl leading-none font-normal" style={{ color: `${GOLD}88` }} variants={vFade}>&ldquo;</motion.p>
          <motion.p className="font-display text-2xl md:text-3xl leading-relaxed font-normal px-2" style={{ color: EMERALD2, letterSpacing: '0.02em' }}
            variants={vWipeCV}>{quote.text}</motion.p>
          <motion.p className="font-display text-5xl leading-none font-normal" style={{ color: `${GOLD}88` }} variants={vFade}>&rdquo;</motion.p>
          <DecoDivider color={GOLD} />
          <p className="font-display text-sm mt-5" style={{ color: GOLD, letterSpacing: '0.25em' }}>— {quote.source}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE — octagon + diamond framed portraits ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: EMERALD }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SunburstLines className="absolute -right-10 top-10 w-72 h-72" color={GOLD} opacity={0.08} />
        <SunburstLines className="absolute -left-10 bottom-10 w-72 h-72" color={GOLD} opacity={0.08} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <DecoDivider color={GOLD} />
          <p className="font-display text-sm uppercase font-normal" style={{ color: GOLD2, letterSpacing: '0.3em' }}>Kedua Mempelai</p>
          <h2 className="font-display text-4xl md:text-5xl font-normal mt-3 mb-3" style={{ color: IVORY, letterSpacing: '0.04em' }}>Dengan Cinta &amp; Restu</h2>
          <p className="text-sm max-w-md mx-auto font-body leading-relaxed mb-16" style={{ color: `${CREAM}AA` }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-14 md:gap-24">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria' },
              { person: p2, img: media.p2, label: 'Mempelai Wanita' },
            ].map(({ person, img, label }, idx) => (
              <motion.div key={label} className="flex flex-col items-center max-w-[300px]"
                initial={{ opacity: 0, x: idx === 0 ? -28 : 28 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.18 }}>
                <motion.div className="relative mb-6" style={{ width: 220, height: 220 }}
                  variants={vWipeCV}>
                  {/* outer diamond outline */}
                  <span className="absolute inset-0" style={{ clipPath: DIAMOND, background: GOLD, transform: 'scale(1.08)' }} />
                  <span className="absolute" style={{ clipPath: DIAMOND, inset: 0, transform: 'scale(1.08)', background: EMERALD2 }} />
                  {/* octagon photo */}
                  <div className="absolute inset-0 overflow-hidden" style={{ clipPath: OCTAGON, backgroundColor: GOLD }}>
                    <div className="absolute inset-[3px] overflow-hidden" style={{ clipPath: OCTAGON }}>
                      <img src={img} alt={person.nick} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </motion.div>
                <p className="text-[10px] uppercase font-body font-normal mb-2" style={{ color: GOLD, letterSpacing: '0.4em' }}>{label}</p>
                <h3 className="font-display text-xl font-normal mb-2" style={{ color: IVORY, letterSpacing: '0.03em' }}>{person.full}</h3>
                <p className="text-sm leading-relaxed font-body mb-4 px-2" style={{ color: `${CREAM}AA` }}>{person.desc}</p>
                <div className="max-w-[60px] mx-auto mb-4"><Chevron color={GOLD} /></div>
                <p className="text-xs font-body" style={{ color: `${CREAM}99` }}>
                  Putra/i dari:<br /><span className="font-semibold" style={{ color: GOLD2 }}>{person.father}</span><br />&amp; {person.mother}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN — gold numeral deco tiles with chevron underlines ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <AmbientBursts reduce={!!reduce} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <DecoDivider color={GOLD} />
          <p className="font-display text-sm uppercase font-normal" style={{ color: EMERALD2, letterSpacing: '0.3em' }}>Menuju Hari Bahagia</p>
          <h2 className="font-display text-4xl font-normal mt-3 mb-14" style={{ color: EMERALD2, letterSpacing: '0.04em' }}>Hitung Mundur</h2>
          <div className="grid grid-cols-4 gap-3 md:gap-5">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="relative flex flex-col items-center py-7 px-2"
                style={{ backgroundColor: EMERALD2, clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE, delay: idx * 0.12 }}>
                <span className="absolute inset-0 pointer-events-none" style={{ border: `1px solid ${GOLD}66`, margin: 4, clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }} />
                <motion.span className="font-display font-normal block tabular-nums leading-none" style={{ color: item.accent ? GOLD2 : IVORY, fontSize: 'clamp(2rem, 7vw, 3.4rem)', letterSpacing: '0.02em' }}
                  key={item.val} initial={reduce ? false : { y: -14, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
                  {String(item.val).padStart(2, '0')}
                </motion.span>
                <span className="block w-6 my-2.5" style={{ height: 1, background: GOLD }} />
                <span className="text-[8px] uppercase font-body font-light" style={{ color: GOLD2, letterSpacing: '0.3em' }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-12">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 px-9 py-3.5 text-xs uppercase font-body font-medium transition-all duration-300 overflow-hidden"
              style={{ color: EMERALD2, backgroundColor: GOLD, letterSpacing: '0.3em' }}>
              <span className="relative z-10 flex items-center gap-2"><Calendar className="w-4 h-4" /> Simpan Tanggal</span>
              <GoldShimmer reduce={!!reduce} />
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY — symmetric mirrored chapters ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: CREAM2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <SunburstLines className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-96" color={GOLD} opacity={0.07} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <DecoDivider color={GOLD} />
            <p className="font-display text-sm uppercase font-normal" style={{ color: EMERALD2, letterSpacing: '0.3em' }}>Perjalanan Cinta</p>
            <h2 className="font-display text-4xl font-normal mt-3" style={{ color: EMERALD2, letterSpacing: '0.04em' }}>Cerita Kami</h2>
          </div>
          <div className="relative">
            {/* center gold rail */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, ${GOLD}88, ${GOLD}88, transparent)` }} />
            <div className="space-y-14">
              {stories.length > 0 && stories.map((story, idx) => {
                const left = idx % 2 === 0;
                return (
                  <motion.div key={idx} className="relative"
                    initial={{ opacity: 0, x: left ? -28 : 28 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                    {/* center diamond node */}
                    <div className="absolute left-1/2 top-1.5 -translate-x-1/2 z-10">
                      <motion.span className="block" style={{ width: 14, height: 14, background: GOLD, transform: 'rotate(45deg)', boxShadow: `0 0 0 3px ${IVORY}, 0 0 0 4px ${GOLD}55` }}
                        initial={{ scale: 0, rotate: 45 }} whileInView={{ scale: 1, rotate: 45 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.15, ease: EASE }} />
                    </div>
                    <div className={`md:w-1/2 ${left ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                      <span className="font-display text-sm font-normal" style={{ color: GOLD, letterSpacing: '0.3em' }}>{story.year}</span>
                      <h4 className="font-display text-2xl font-normal mt-1 mb-2" style={{ color: EMERALD2, letterSpacing: '0.03em' }}>{story.title}</h4>
                      <p className="text-sm leading-relaxed font-body" style={{ color: `${BLACK}AA` }}>{story.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: EMERALD2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <DecoFrame width="inset-6" color={GOLD} />
        <SunburstLines className="absolute -right-12 -bottom-12 w-80 h-80" color={GOLD} opacity={0.06} />
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <DecoDivider color={GOLD} />
          <p className="font-display text-sm uppercase font-normal" style={{ color: GOLD2, letterSpacing: '0.3em' }}>Informasi Acara</p>
          <h2 className="font-display text-4xl font-normal mt-3 mb-12" style={{ color: IVORY, letterSpacing: '0.04em' }}>Waktu &amp; Lokasi</h2>
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-7 py-2.5 text-xs font-body font-medium uppercase transition-all duration-200"
                style={activeTab === idx
                  ? { backgroundColor: GOLD, color: EMERALD2, letterSpacing: '0.25em', clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }
                  : { color: GOLD2, letterSpacing: '0.25em', border: `1px solid ${GOLD}55`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="relative p-9 text-left" style={{ backgroundColor: EMERALD, clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))' }}
            key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
            <span className="absolute pointer-events-none" style={{ inset: 6, border: `1px solid ${GOLD}44`, clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }} />
            <h3 className="font-display text-2xl font-normal tracking-wide mb-4" style={{ color: IVORY, letterSpacing: '0.03em' }}>{activeEvt.title}</h3>
            <div className="space-y-2.5 font-body text-sm" style={{ color: `${CREAM}CC` }}>
              <div className="flex items-center gap-2.5"><Clock className="w-4 h-4" style={{ color: GOLD }} /> {activeEvt.time}</div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: GOLD }} /> <span>{activeEvt.venue}<br />{activeEvt.address}</span></div>
            </div>
            {activeEvt.note && <p className="text-[11px] italic font-body mt-3" style={{ color: `${GOLD2}CC` }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 mt-6 px-6 py-2.5 text-xs font-body font-medium uppercase transition-all duration-200 overflow-hidden"
                style={{ color: EMERALD2, backgroundColor: GOLD, letterSpacing: '0.25em' }}>
                <span className="relative z-10 flex items-center gap-2"><Map className="w-3.5 h-3.5" /> Buka Google Maps</span>
                <GoldShimmer reduce={!!reduce} />
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY — symmetric deco grid ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <AmbientBursts reduce={!!reduce} />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <DecoDivider color={GOLD} />
            <p className="font-display text-sm uppercase font-normal" style={{ color: EMERALD2, letterSpacing: '0.3em' }}>Galeri Foto</p>
            <h2 className="font-display text-4xl font-normal mt-3" style={{ color: EMERALD2, letterSpacing: '0.04em' }}>Kenangan Indah</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden"
                style={idx === 0
                  ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1', clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))' }
                  : { aspectRatio: '1' }}
                variants={vWipeCV}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 pointer-events-none" style={{ border: `1px solid ${GOLD}44`, margin: 2 }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${EMERALD2}CC, transparent 60%)` }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${BLACK}F0`, backdropFilter: 'blur(6px)' }} onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 text-2xl font-light" style={{ color: GOLD2 }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2" style={{ color: GOLD2 }} aria-label="Sebelumnya"><ChevronLeft className="w-7 h-7" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2" style={{ color: GOLD2 }} aria-label="Berikutnya"><ChevronRight className="w-7 h-7" /></button>
          <motion.div className="relative max-w-[90vw] max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: EASE_DECO }}
            style={{ border: `2px solid ${GOLD}`, padding: 6, backgroundColor: EMERALD2 }}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[82vh] max-w-full" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[82vh] max-w-full object-contain" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 8. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <SunburstLines className="absolute -left-10 -top-10 w-72 h-72" color={GOLD} opacity={0.07} />
        <div className="max-w-xl mx-auto relative z-10 text-center">
          <DecoDivider color={GOLD} />
          <p className="font-display text-sm uppercase font-normal" style={{ color: EMERALD2, letterSpacing: '0.3em' }}>Doa &amp; Ucapan</p>
          <h2 className="font-display text-4xl font-normal mt-3 mb-10" style={{ color: EMERALD2, letterSpacing: '0.04em' }}>Kirim Ucapan</h2>

          {isSubmitted ? (
            <motion.div className="relative p-10" style={{ backgroundColor: IVORY, clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))' }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <span className="absolute pointer-events-none" style={{ inset: 6, border: `1px solid ${GOLD}66`, clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }} />
              <DecoFan className="w-12 h-12 mx-auto mb-4" color={GOLD} />
              <p className="font-display text-base font-normal" style={{ color: EMERALD2, letterSpacing: '0.03em' }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="relative p-7 space-y-4 text-left" style={{ backgroundColor: IVORY, border: `1px solid ${GOLD}44` }}>
              <span className="absolute pointer-events-none" style={{ top: -1, left: -1, width: 24, height: 24, borderTop: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
              <span className="absolute pointer-events-none" style={{ top: -1, right: -1, width: 24, height: 24, borderTop: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />
              <span className="absolute pointer-events-none" style={{ bottom: -1, left: -1, width: 24, height: 24, borderBottom: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
              <span className="absolute pointer-events-none" style={{ bottom: -1, right: -1, width: 24, height: 24, borderBottom: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm font-body outline-none transition-colors bg-transparent border-b"
                  style={{ color: BLACK, borderColor: `${GOLD}88` }}
                  onFocus={(e) => e.target.style.borderColor = GOLD} onBlur={(e) => e.target.style.borderColor = `${GOLD}88`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-4 py-3 text-sm font-body outline-none bg-transparent border-b" style={{ color: BLACK, borderColor: `${GOLD}88` }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-4 py-3 text-sm font-body outline-none transition-colors resize-none h-24 bg-transparent border-b"
                style={{ color: BLACK, borderColor: `${GOLD}88` }}
                onFocus={(e) => e.target.style.borderColor = GOLD} onBlur={(e) => e.target.style.borderColor = `${GOLD}88`} />
              <div className="text-center pt-2">
                <button type="submit"
                  className="group relative inline-flex items-center gap-2 px-9 py-3.5 text-xs uppercase font-body font-medium transition-all duration-300 overflow-hidden"
                  style={{ color: IVORY, backgroundColor: EMERALD2, letterSpacing: '0.3em' }}>
                  <span className="relative z-10 flex items-center gap-2"><Send className="w-4 h-4" /> Kirim Ucapan</span>
                  <GoldShimmer reduce={!!reduce} />
                </button>
              </div>
            </form>
          )}

          {content.guestbook?.enabled !== false && wishes.length === 0 && (
            <p className="text-center text-sm font-body italic mt-8" style={{ color: MUTED }}>Belum ada ucapan — jadilah yang pertama mengirim doa restu.</p>
          )}

          {content.guestbook?.enabled !== false && wishes.length > 0 && (
            <div className="mt-10 space-y-4 max-h-[400px] overflow-y-auto pr-2 text-left">
              {wishes.slice(0, 20).map((w) => (
                <div key={w.id} className="relative p-5" style={{ backgroundColor: IVORY, borderLeft: `2px solid ${GOLD}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-base font-normal" style={{ color: EMERALD2, letterSpacing: '0.03em' }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1 font-body font-semibold uppercase" style={{ color: GOLD, letterSpacing: '0.2em' }}>{w.attendance === 'Hadir' ? '✓ Hadir' : '✕ Tidak Hadir'}</p>
                  <p className="text-sm leading-relaxed font-body" style={{ color: `${BLACK}AA` }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: EMERALD }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <SunburstLines className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vmin] h-[100vmin]" color={GOLD} opacity={0.05} />
          <div className="max-w-2xl mx-auto relative z-10 text-center">
            <DecoDivider color={GOLD} />
            <p className="font-display text-sm uppercase font-normal" style={{ color: GOLD2, letterSpacing: '0.3em' }}>Tanda Kasih</p>
            <h2 className="font-display text-4xl font-normal mt-3 mb-4" style={{ color: IVORY, letterSpacing: '0.04em' }}>Kado Digital</h2>
            <p className="text-sm max-w-md mx-auto font-body leading-relaxed mb-12" style={{ color: `${CREAM}AA` }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="relative p-7" style={{ backgroundColor: EMERALD2, border: `1px solid ${GOLD}44`, clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: DUR, ease: EASE, delay: idx * 0.12 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4" style={{ color: GOLD }} />
                    <p className="text-[10px] font-bold uppercase font-body" style={{ color: GOLD, letterSpacing: '0.25em' }}>{g.bank}</p>
                  </div>
                  <div className="w-8 my-2" style={{ height: 1, background: GOLD }} />
                  <p className="font-display text-xl font-normal tabular-nums my-2" style={{ color: IVORY, letterSpacing: '0.03em' }}>{g.number}</p>
                  <p className="text-xs font-body mb-4" style={{ color: `${GOLD2}CC` }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 text-[10px] font-body font-medium uppercase transition-all hover:gap-2.5"
                    style={{ color: GOLD, letterSpacing: '0.25em' }}>
                    {copiedIdx === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="relative px-6 py-32 text-center overflow-hidden" style={{ backgroundColor: EMERALD2 }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `linear-gradient(${GOLD} 1px, transparent 1px), linear-gradient(90deg, ${GOLD} 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
        <SunburstLines className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vmin] h-[120vmin]" color={GOLD} opacity={0.05} />
        <AmbientBursts reduce={!!reduce} />
        <DecoFrame width="inset-6" color={GOLD} />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="flex justify-center mb-9" initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <DecoFan className="w-16 h-16" color={GOLD} />
          </motion.div>
          <motion.h2 className="font-display text-3xl md:text-4xl font-normal leading-snug max-w-xl mx-auto" style={{ color: IVORY, letterSpacing: '0.04em' }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </motion.h2>
          <motion.div className="max-w-[180px] mx-auto my-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE_DECO }}>
            <Chevron color={GOLD} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="text-[10px] uppercase font-body font-light" style={{ color: GOLD, letterSpacing: '0.4em' }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl font-normal mt-3" style={{ color: IVORY, letterSpacing: '0.05em' }}>{p1.nick} <span className="font-body font-light text-2xl" style={{ color: GOLD }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase font-body font-light mt-2" style={{ color: `${GOLD2}99`, letterSpacing: '0.3em' }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="relative z-10 mt-16 pt-8 text-center" style={{ borderTop: `1px solid ${GOLD}22` }}>
          <p className="text-[8px] uppercase font-body font-light" style={{ color: `${GOLD2}66`, letterSpacing: '0.4em' }}>© 2027 {p1.nick} &amp; {p2.nick}. Ratu Series.</p>
        </div>
      </footer>
    </div>
  );
}
