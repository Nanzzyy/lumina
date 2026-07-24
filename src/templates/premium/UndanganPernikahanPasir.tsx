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
const EASE: [number, number, number, number] = [0.22, 0.85, 0.32, 1];
const EASE_BLOCK: [number, number, number, number] = [0.5, 0, 0.2, 1];
const DUR = 0.8;

/* Variant library — geometric block reveals, distinct from Kaze/Liana. */
const vUp: Variants = { hidden: { opacity: 0, y: 38 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1, ease: 'easeOut' } } };
const vReveal: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  visible: { clipPath: 'inset(0 0 0% 0)', transition: { duration: 0.95, ease: EASE_BLOCK } },
};
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.12 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Pasir" (Sand) — Adobe Desert Southwestern ───
   Warm earth on sand, single turquoise tile accent, geometric blocky forms. */
const ADOBE = '#C17A4B';
const ADOBE2 = '#A86238';
const ROSE = '#D98C7C';
const TURQ = '#3FA9A0';
const SAND = '#F0E4D0';
const SAND2 = '#E4D2B4';
const INK = '#3A2820';
const MUTED = '#8A6E58';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Bima', full: 'Bima Surya Pratama, S.Sos.', father: 'Bpk. H. Surya Wijaya', mother: 'Ibu Hj. Kartika Ningsih', ig: '@bimasurya', desc: 'Pengarung padang luas yang meyakini setiap jejak langkah di tanah kering menumbuhkan akar paling dalam.' },
    p2: { nick: 'Kirana', full: 'Kirana Maheswari Putri, S.Pd.', father: 'Bpk. H. Maheswari Hadi', mother: 'Ibu Hj. Lestari Wulandari', ig: '@kiranamaheswari', desc: 'Pencinta senja dan tanah sabana — tempat panas menyimpan kehangatan paling tulus di setiap musim.' },
  },
  date: '2027-08-21T16:00:00',
  quote: { text: 'Dua jalanan panjang yang membentang di tanah luas, akhirnya bertemu pada satu kiblat. Cinta bukan lautan yang gelap, melainkan padang yang hangat — tempat dua jejak melangkah pelan, bersama, menuju matahari yang sama.', source: 'Sebuah harapan' },
  events: [
    { title: 'Akad Nikah', time: '09:00 - 11:00 WITA', venue: 'Rumah Adat Waiyelu', address: 'Jl. Savanna Praijing, Sumba Timur, NTT', mapsUrl: 'https://maps.google.com', note: 'Khidmat dan sakral, khusus keluarga inti dan kerabat dekat' },
    { title: 'Resepsi', time: '16:00 - 20:00 WITA', venue: 'Pondok Padang Savanna', address: 'Jl. Tanah Air, Waitabula, Sumba Barat Daya', mapsUrl: 'https://maps.google.com', note: 'Terbuka untuk seluruh tamu undangan' },
  ],
  stories: [
    { year: '2021', title: 'Jejak Pertama', desc: 'Berjumpa di puncak bukit savana saat senja membakar ufuk barat. Bima berbagi bekal air minumnya; Kirana menunjukkan arah pulang. Sejak itu dua jejak berjalan beriringan.' },
    { year: '2023', title: 'Mengarungi Padang', desc: 'Mereka menempuh jarak kota-kota, melintasi hutan jati dan tanah kering. Setiap musim kemarau dan hujan ditemani, setiap ufuk menjadi saksi langkah yang tak lagi sendiri.' },
    { year: '2026', title: 'Satu Kiblat', desc: 'Dengan restu kedua keluarga, dua jalanan menyatu menjadi satu jalan. Di tanah leluhur, di bawah matahari yang sama, ikatan suci dikukuhkan — hangat, tenang, dan berakar.' },
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
    { bank: 'Bank Mandiri', number: '1180023491820', owner: 'Bima Surya Pratama' },
    { bank: 'Bank BCA', number: '0359871120', owner: 'Kirana Maheswari Putri' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600',
  hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600',
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
  const displayDate = displayDateFrom(isoDate, 'Sabtu, 21 Agustus 2027');
  const location = content.event?.location || 'Sumba Timur';
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
  if (typeof window === 'undefined' || document.getElementById('pasir-inv')) return;
  const s = document.createElement('style');
  s.id = 'pasir-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@400;500;600;700&family=Karla:wght@300;400;500;600;700&display=swap');
.font-display { font-family: 'Zilla Slab', serif; }
.font-body { font-family: 'Karla', sans-serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: adobe desert, southwestern geometric ─── */

/** Tribal stair/zigzag border divider — blocky step pattern stretched horizontally. */
function StepPattern({ className = 'w-full h-3', color = ADOBE }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 10" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 10 L10 0 L20 10 L30 0 L40 10 L50 0 L60 10 L70 0 L80 10 L90 0 L100 10 L110 0 L120 10 L130 0 L140 10 L150 0 L160 10 L170 0 L180 10 L190 0 L200 10" stroke={color} strokeWidth="1.6" strokeLinejoin="miter" />
      <path d="M0 4 L10 8 L20 4 L30 8 L40 4 L50 8 L60 4 L70 8 L80 4 L90 8 L100 4 L110 8 L120 4 L130 8 L140 4 L150 8 L160 4 L170 8 L180 4 L190 8 L200 4" stroke={color} strokeWidth="0.7" opacity="0.4" />
    </svg>
  );
}

/** Circular southwestern sun symbol — stepped rays around a center disc. */
function SunMotif({ className = 'w-24 h-24', color = ADOBE, opacity = 1 }: { className?: string; color?: string; opacity?: number }) {
  const rays = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ opacity }}>
      <circle cx="50" cy="50" r="16" fill="none" stroke={color} strokeWidth="2.4" />
      <circle cx="50" cy="50" r="6" fill={color} />
      {rays.map((i) => {
        const a = (i * 30 * Math.PI) / 180;
        const long = i % 2 === 0;
        const r1 = 20;
        const r2 = long ? 36 : 28;
        return (
          <line key={i}
            x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1}
            x2={50 + Math.cos(a) * r2} y2={50 + Math.sin(a) * r2}
            stroke={color} strokeWidth="2.4" strokeLinecap="square" />
        );
      })}
      {rays.map((i) => {
        const a = (i * 30 * Math.PI) / 180 + (15 * Math.PI) / 180;
        return (
          <circle key={i} cx={50 + Math.cos(a) * 22} cy={50 + Math.sin(a) * 22} r="1.4" fill={color} />
        );
      })}
    </svg>
  );
}

/** Saguaro cactus silhouette. */
function Cactus({ className = 'w-10 h-16', color = INK }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="26" y="14" width="8" height="86" rx="4" fill={color} />
      <rect x="13" y="44" width="7" height="26" rx="3.5" fill={color} />
      <rect x="13" y="44" width="14" height="7" rx="3.5" fill={color} />
      <rect x="40" y="34" width="7" height="24" rx="3.5" fill={color} />
      <rect x="33" y="34" width="14" height="7" rx="3.5" fill={color} />
      {/* ground line */}
      <line x1="6" y1="99" x2="54" y2="99" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

/** Diamond chain — row of filled diamond rhombuses. */
function DiamondRow({ className = 'w-full h-3', color = ADOBE, count = 14 }: { className?: string; color?: string; count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <svg className={className} viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
      {items.map((i) => {
        const step = 200 / count;
        const cx = step / 2 + i * step;
        const half = Math.min(step / 2 - 1, 6);
        return <path key={i} d={`M${cx - half} 6 L${cx} ${6 - half} L${cx + half} 6 L${cx} ${6 + half} Z`} fill={color} opacity={0.55 + (i % 2) * 0.45} />;
      })}
    </svg>
  );
}

/** Divider: thin rules flanking a centered sun motif. */
function SunDivider({ color = ADOBE }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-4 my-7">
      <span className="h-px w-16" style={{ background: `linear-gradient(to left, ${color}, transparent)` }} />
      <SunMotif className="w-9 h-9" color={color} />
      <span className="h-px w-16" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
    </div>
  );
}

/** Slow rising heat + sand motes — the signature ambient motion. */
function HeatShimmer({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const motes = [
    { left: '10%', size: 3, dur: 11, delay: 0, rise: 280 },
    { left: '24%', size: 2, dur: 14, delay: 2.5, rise: 360 },
    { left: '40%', size: 4, dur: 9, delay: 1.1, rise: 240 },
    { left: '58%', size: 2, dur: 13, delay: 3.4, rise: 320 },
    { left: '72%', size: 3, dur: 10, delay: 0.6, rise: 300 },
    { left: '88%', size: 2, dur: 15, delay: 4.2, rise: 380 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${ADOBE}1F, transparent 60%)` }}
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      {motes.map((m, i) => (
        <motion.span key={i} className="absolute rounded-full"
          style={{ left: m.left, bottom: -10, width: m.size, height: m.size, background: ADOBE }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.45, 0], y: [0, -m.rise / 2, -m.rise] }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: 'linear' }} />
      ))}
    </div>
  );
}

/** Outlined blocky chapter numeral. */
function ChapterNo({ n }: { n: string }) {
  return (
    <span className="font-display font-semibold leading-none" style={{ color: ADOBE, fontSize: '2.6rem', WebkitTextStroke: `1px ${ADOBE}`, WebkitTextFillColor: 'transparent' }} aria-hidden="true">
      {n}
    </span>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanPasir({ content, slug, preview }: MonolithicTemplateProps) {
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden" style={{ backgroundColor: SAND }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `linear-gradient(${INK} 1px, transparent 1px), linear-gradient(90deg, ${INK} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <SunMotif className="absolute right-4 top-4 w-28 h-28" color={ADOBE} opacity={0.14} />
        <SunMotif className="absolute -left-6 bottom-4 w-24 h-24" color={ADOBE2} opacity={0.12} />
        <Cactus className="absolute left-8 bottom-10 w-12 h-20" color={`${INK}22`} />
        <Cactus className="absolute right-10 bottom-12 w-9 h-16" color={`${INK}22`} />

        {/* top diamond row rail */}
        <motion.div className="absolute top-0 left-0 right-0 pt-3 z-20" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: EASE_BLOCK }}>
          <DiamondRow color={ADOBE} />
        </motion.div>

        <motion.div className="mt-16 z-20" variants={stagI} initial="hidden" animate="visible">
          <SunMotif className="w-16 h-16 mx-auto" color={ADOBE} />
        </motion.div>

        <motion.div className="my-auto px-6 max-w-md w-full text-center relative z-20" variants={stagC} initial="hidden" animate="visible">
          <motion.div variants={stagI}>
            <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.4em] font-body font-bold" style={{ color: SAND, backgroundColor: ADOBE }}>The Wedding of</span>
          </motion.div>
          <motion.h1 variants={stagI} className="font-display text-6xl leading-[0.95] font-semibold tracking-tight mt-6" style={{ color: INK }}>
            {p1.nick}
            <span className="block font-display font-light text-3xl my-1" style={{ color: ADOBE }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.div variants={stagI} className="max-w-[240px] mx-auto mt-5"><StepPattern color={ADOBE} /></motion.div>
          <motion.p variants={stagI} className="font-display text-base font-medium mt-4" style={{ color: INK }}>{displayDate}</motion.p>
          <motion.div variants={stagI} className="mt-8">
            <p className="text-[9px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: MUTED }}>Kepada Yth.</p>
            <p className="font-display text-lg font-semibold mt-1" style={{ color: INK }}>{guestName}</p>
          </motion.div>
          <motion.div variants={stagI} className="mt-9">
            <button onClick={open}
              className="group relative inline-flex items-center gap-2.5 px-10 py-4 text-xs uppercase tracking-[0.35em] font-body font-bold transition-all duration-300"
              style={{ color: SAND, backgroundColor: INK, border: `2px solid ${INK}` }}>
              <Heart className="w-4 h-4" /> Buka Undangan
              <motion.span className="absolute inset-0 -z-0" style={{ backgroundColor: ADOBE }}
                initial={{ scaleY: 0 }} whileHover={{ scaleY: 1 }} transition={{ duration: 0.32, ease: EASE }} />
              <span className="absolute inset-0 pointer-events-none" style={{ border: `2px solid ${ADOBE}`, transform: 'translate(5px, 5px)', zIndex: -1 }} />
            </button>
          </motion.div>
        </motion.div>
        <motion.div className="absolute bottom-0 left-0 right-0 pb-3 z-20" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: EASE_BLOCK, delay: 0.3 }}>
          <DiamondRow color={ADOBE} />
        </motion.div>
        <p className="text-[7px] tracking-[0.5em] uppercase mb-10 z-20 font-body font-bold" style={{ color: MUTED }}>#{p1.nick}{p2.nick}Pasir</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: SAND, color: INK }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: INK, border: `2px solid ${ADOBE}` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: SAND }} /> : <VolumeX className="w-5 h-5" style={{ color: SAND, opacity: 0.6 }} />}
      </button>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: INK }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1.04, 1, 1.04] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-55" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-55" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(110deg, ${INK}E6 0%, ${INK}66 50%, transparent 85%)` }} />
        <HeatShimmer reduce={!!reduce} />
        <SunMotif className="absolute right-6 top-6 w-36 h-36" color={ADOBE} opacity={0.32} />
        <motion.div className="absolute left-0 right-0 top-0" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, ease: EASE_BLOCK, delay: 0.2 }}>
          <DiamondRow color={ADOBE} />
        </motion.div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20 pt-32">
          <motion.p className="text-[10px] uppercase tracking-[0.5em] font-body font-bold" style={{ color: ADOBE }}
            initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>Undangan Pernikahan</motion.p>
          <motion.h1 className="font-display text-7xl md:text-8xl leading-[0.9] font-semibold tracking-tight mt-4" style={{ color: SAND }}
            initial={{ opacity: 0, y: 38 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.45 }}>
            {p1.nick}<br /><span className="font-display font-light" style={{ color: ADOBE }}>&amp;</span> {p2.nick}
          </motion.h1>
          <motion.div className="flex flex-wrap items-end justify-between gap-6 mt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 0.7 }}>
            <div>
              <p className="font-display text-lg font-medium" style={{ color: SAND }}>{displayDate}</p>
              <p className="text-[10px] tracking-[0.3em] uppercase font-body font-bold mt-1" style={{ color: ADOBE }}>{location}</p>
            </div>
            {guestName && (
              <div className="px-5 py-2.5" style={{ border: `2px solid ${SAND}40` }}>
                <p className="text-[9px] uppercase tracking-[0.3em] font-body font-bold" style={{ color: `${SAND}99` }}>Kepada Yth.</p>
                <p className="font-display text-base font-semibold mt-0.5" style={{ color: SAND }}>{guestName}</p>
              </div>
            )}
          </motion.div>
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-[8px] uppercase tracking-[0.4em] font-body font-bold" style={{ color: `${SAND}77` }}>Scroll</span>
        </motion.div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: SAND }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <HeatShimmer reduce={!!reduce} />
        <SunMotif className="absolute -left-10 -top-10 w-72 h-72" color={ADOBE} opacity={0.06} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <SunDivider color={ADOBE} />
          <motion.p className="font-display text-2xl md:text-3xl leading-relaxed font-medium italic" style={{ color: INK }} variants={vUp}>{quote.text}</motion.p>
          <SunDivider color={ADOBE} />
          <p className="font-display text-sm mt-3 tracking-wide font-bold uppercase" style={{ color: ADOBE }}>{quote.source ? '— ' + quote.source : ''}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE — adobe arch frames ═══ */}
      <motion.section className="relative overflow-hidden" style={{ backgroundColor: SAND2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <div className="max-w-5xl mx-auto px-6 py-28 relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <ChapterNo n="01" />
            <div className="flex-1"><StepPattern color={ADOBE} /></div>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3" style={{ color: INK }}>Dua Jiwa, Satu Kiblat</h2>
          <p className="text-sm max-w-md font-body leading-relaxed mb-16" style={{ color: MUTED }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>

          <div className="space-y-20">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria', flip: false },
              { person: p2, img: media.p2, label: 'Mempelai Wanita', flip: true },
            ].map(({ person, img, label, flip }, idx) => (
              <motion.div key={label} className={`grid md:grid-cols-2 gap-8 items-center ${flip ? 'md:[&>*:first-child]:order-2' : ''}`}
                initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                <motion.div className="relative isolate" style={{ aspectRatio: '3/4' }} variants={vReveal}>
                  {/* adobe arch: rounded top */}
                  <div className="absolute inset-0 overflow-hidden" style={{ border: `2px solid ${ADOBE}`, borderRadius: '50% 50% 6px 6px / 38% 38% 6px 6px', backgroundColor: SAND }}>
                    <img src={img} alt={person.nick} className="w-full h-full object-cover object-top" />
                  </div>
                  {/* offset shadow block — southwestern stacking */}
                  <div className="absolute inset-0 pointer-events-none" style={{ border: `2px solid ${ADOBE2}`, borderRadius: '50% 50% 6px 6px / 38% 38% 6px 6px', transform: 'translate(8px, 8px)', zIndex: -1, backgroundColor: ADOBE2 }} />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2"><DiamondRow className="w-24 h-3" color={ADOBE} count={8} /></div>
                </motion.div>
                <div className={flip ? 'md:text-left md:pl-4' : 'md:text-right md:pr-4'}>
                  <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold mb-3" style={{ color: ADOBE }}>{label}</p>
                  <h3 className="font-display text-3xl font-semibold tracking-tight mb-3" style={{ color: INK }}>{person.full}</h3>
                  <p className="text-sm leading-relaxed font-body mb-4" style={{ color: MUTED }}>{person.desc}</p>
                  <div className={`flex items-center gap-3 ${flip ? '' : 'md:justify-end'}`}>
                    <span className="block w-8 h-px" style={{ background: ADOBE }} />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-body font-bold" style={{ color: MUTED }}>Putra/i dari</p>
                      <p className="text-xs font-body font-semibold mt-0.5" style={{ color: INK }}>{person.father}</p>
                      <p className="text-xs font-body" style={{ color: MUTED }}>&amp; {person.mother}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN — blocky tiles + step underline ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: SAND }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <HeatShimmer reduce={!!reduce} />
        <Cactus className="absolute left-6 bottom-6 w-12 h-20" color={`${INK}11`} />
        <Cactus className="absolute right-8 bottom-8 w-9 h-16" color={`${INK}11`} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="flex items-center gap-4 mb-10 justify-center">
            <ChapterNo n="02" />
            <p className="font-display text-sm uppercase tracking-[0.3em] font-bold" style={{ color: INK }}>Menuju Hari Bahagia</p>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="relative px-1"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: idx * 0.1 }}>
                <div className="p-4 md:p-6" style={{ backgroundColor: idx === 3 ? TURQ : SAND2, border: `2px solid ${ADOBE}` }}>
                  <motion.span className="font-display font-semibold block tabular-nums leading-none"
                    style={{ color: item.accent ? SAND : INK, fontSize: 'clamp(2.2rem, 8vw, 4.4rem)' }}
                    key={item.val} initial={reduce ? false : { y: -14, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45, ease: EASE }}>
                    {String(item.val).padStart(2, '0')}
                  </motion.span>
                  <span className="text-[9px] uppercase tracking-[0.3em] font-body font-bold mt-2 block" style={{ color: item.accent ? `${SAND}DD` : MUTED }}>{item.label}</span>
                </div>
                <div className="mt-1.5"><StepPattern color={ADOBE} /></div>
              </motion.div>
            ))}
          </div>
          <div className="mt-12">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-bold transition-all duration-300 hover:tracking-[0.4em]"
              style={{ color: SAND, backgroundColor: INK, border: `2px solid ${INK}` }}>
              <Calendar className="w-4 h-4" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY — alternating journey chapters ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: SAND2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <ChapterNo n="03" />
            <p className="font-display text-sm uppercase tracking-[0.3em] font-bold" style={{ color: INK }}>Perjalanan Cinta</p>
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-tight mb-16" style={{ color: INK }}>Mengarungi Padang</h2>
          <div className="space-y-14">
            {stories.length > 0 && stories.map((story, idx) => {
              const left = idx % 2 === 0;
              return (
                <motion.div key={idx} className="relative pl-14"
                  initial={{ opacity: 0, x: left ? -26 : 26 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                  {/* diamond node */}
                  <span className="absolute left-0 top-1 w-9 h-9 rotate-45 flex items-center justify-center" style={{ border: `2px solid ${ADOBE}`, backgroundColor: SAND }}>
                    <span className="font-display font-bold text-sm -rotate-45" style={{ color: ADOBE }}>{idx + 1}</span>
                  </span>
                  <span className="font-body text-xs tracking-[0.3em] uppercase font-bold" style={{ color: ADOBE }}>{story.year}</span>
                  <h4 className="font-display text-2xl font-semibold tracking-tight mt-1 mb-2" style={{ color: INK }}>{story.title}</h4>
                  <p className="text-sm leading-relaxed font-body max-w-lg" style={{ color: MUTED }}>{story.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: INK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SunMotif className="absolute -right-8 bottom-0 w-72 h-72" color={SAND} opacity={0.05} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <ChapterNo n="04" />
            <p className="font-display text-sm uppercase tracking-[0.3em] font-bold" style={{ color: `${SAND}99` }}>Informasi Acara</p>
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-tight mb-12" style={{ color: SAND }}>Waktu &amp; Lokasi</h2>
          <div className="flex gap-3 mb-10 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-6 py-2.5 text-xs font-body font-bold uppercase tracking-[0.2em] transition-all duration-200"
                style={activeTab === idx
                  ? { backgroundColor: ADOBE, color: SAND, border: `2px solid ${ADOBE}` }
                  : { color: `${SAND}99`, border: `2px solid ${SAND}33`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="p-7" style={{ border: `2px solid ${ADOBE}`, backgroundColor: `${INK}` }}
            key={activeTab} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: EASE }}>
            <h3 className="font-display text-2xl font-semibold tracking-tight mb-4" style={{ color: SAND }}>{activeEvt.title}</h3>
            <div className="space-y-2.5 font-body text-sm" style={{ color: `${SAND}BB` }}>
              <div className="flex items-center gap-2.5"><Clock className="w-4 h-4" style={{ color: ADOBE }} /> {activeEvt.time}</div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: ADOBE }} /> <span>{activeEvt.venue}<br />{activeEvt.address}</span></div>
            </div>
            {activeEvt.note && <p className="text-[11px] italic font-body mt-3" style={{ color: MUTED }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 text-xs font-body font-bold uppercase tracking-[0.2em] transition-all duration-200 hover:gap-3"
                style={{ color: INK, backgroundColor: ADOBE, border: `2px solid ${ADOBE}` }}>
                <Map className="w-3.5 h-3.5" /> Buka Google Maps
              </a>
            )}
            <div className="mt-5"><StepPattern color={ADOBE} /></div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY — geometric grid ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: SAND }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <HeatShimmer reduce={!!reduce} />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <ChapterNo n="05" />
            <p className="font-display text-sm uppercase tracking-[0.3em] font-bold" style={{ color: INK }}>Galeri Foto</p>
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-tight mb-12" style={{ color: INK }}>Kenangan Indah</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1', border: `2px solid ${ADOBE}` } : { aspectRatio: '1', border: `2px solid ${ADOBE}66` }}
                variants={vReveal}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${INK}99, transparent 60%)` }} />
                <span className="absolute top-2 left-2 w-4 h-4 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: ADOBE }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${INK}F2`, backdropFilter: 'blur(6px)' }} onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 text-2xl font-light" style={{ color: SAND }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2" style={{ color: SAND }} aria-label="Sebelumnya"><ChevronLeft className="w-7 h-7" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2" style={{ color: SAND }} aria-label="Berikutnya"><ChevronRight className="w-7 h-7" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden" style={{ border: `2px solid ${ADOBE}` }} onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE }}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[85vh] max-w-full" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 8. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: SAND2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <ChapterNo n="06" />
            <p className="font-display text-sm uppercase tracking-[0.3em] font-bold" style={{ color: INK }}>Doa &amp; Ucapan</p>
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-tight mb-10" style={{ color: INK }}>Kirim Ucapan</h2>

          {isSubmitted ? (
            <motion.div className="p-10 text-center" style={{ border: `2px solid ${ADOBE}`, backgroundColor: SAND }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <SunMotif className="w-14 h-14 mx-auto mb-4" color={ADOBE} />
              <p className="font-display text-base font-semibold" style={{ color: INK }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4 p-6" style={{ border: `2px solid ${ADOBE}`, backgroundColor: SAND }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-3 py-3 text-sm font-body outline-none transition-colors bg-transparent"
                  style={{ color: INK, border: `2px solid ${MUTED}55` }}
                  onFocus={(e) => e.target.style.borderColor = ADOBE} onBlur={(e) => e.target.style.borderColor = `${MUTED}55`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-3 py-3 text-sm font-body outline-none bg-transparent" style={{ color: INK, border: `2px solid ${MUTED}55` }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-3 py-3 text-sm font-body outline-none transition-colors resize-none h-24 bg-transparent"
                style={{ color: INK, border: `2px solid ${MUTED}55` }}
                onFocus={(e) => e.target.style.borderColor = ADOBE} onBlur={(e) => e.target.style.borderColor = `${MUTED}55`} />
              <button type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-bold transition-all duration-300"
                style={{ color: SAND, backgroundColor: INK, border: `2px solid ${INK}` }}>
                <Send className="w-4 h-4" /> Kirim Ucapan
              </button>
            </form>
          )}

          {content.guestbook?.enabled !== false && wishes.length === 0 && (
            <p className="text-center text-sm font-body italic mt-8" style={{ color: MUTED }}>Belum ada ucapan — jadilah yang pertama mengirim doa restu.</p>
          )}

          {content.guestbook?.enabled !== false && wishes.length > 0 && (
            <div className="mt-10 space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {wishes.slice(0, 20).map((w) => (
                <div key={w.id} className="p-4" style={{ border: `2px solid ${ADOBE}44`, backgroundColor: SAND }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-base font-semibold" style={{ color: INK }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1 font-body font-bold uppercase tracking-wider" style={{ color: ADOBE }}>{w.attendance === 'Hadir' ? '✓ Hadir' : '✕ Tidak Hadir'}</p>
                  <p className="text-sm leading-relaxed font-body" style={{ color: MUTED }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: SAND }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <ChapterNo n="07" />
              <p className="font-display text-sm uppercase tracking-[0.3em] font-bold" style={{ color: INK }}>Tanda Kasih</p>
            </div>
            <h2 className="font-display text-4xl font-semibold tracking-tight mb-4" style={{ color: INK }}>Kado Digital</h2>
            <p className="text-sm max-w-md font-body leading-relaxed mb-10" style={{ color: MUTED }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-7" style={{ backgroundColor: SAND2, border: `2px solid ${ADOBE}` }}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4" style={{ color: ADOBE }} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: ADOBE }}>{g.bank}</p>
                  </div>
                  <p className="font-display text-xl font-semibold tabular-nums my-2" style={{ color: INK }}>{g.number}</p>
                  <p className="text-xs font-body mb-4" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <div className="mb-4"><DiamondRow className="w-full h-2" color={ADOBE} count={10} /></div>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-body font-bold uppercase tracking-[0.2em] transition-all"
                    style={{ color: SAND, backgroundColor: ADOBE }}>
                    {copiedIdx === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="relative px-6 py-32 text-center overflow-hidden" style={{ backgroundColor: INK }}>
        <SunMotif className="absolute left-1/2 -translate-x-1/2 -bottom-24 w-[28rem] h-[28rem]" color={SAND} opacity={0.04} />
        <HeatShimmer reduce={!!reduce} />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="flex justify-center mb-10" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <SunMotif className="w-16 h-16" color={ADOBE} />
          </motion.div>
          <motion.h2 className="font-display text-3xl md:text-4xl font-medium italic leading-snug tracking-tight max-w-xl mx-auto" style={{ color: SAND }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </motion.h2>
          <motion.div className="max-w-[200px] mx-auto my-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE_BLOCK }}>
            <StepPattern color={ADOBE} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold" style={{ color: ADOBE }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl font-semibold tracking-tight mt-3" style={{ color: SAND }}>{p1.nick} <span className="font-light italic" style={{ color: ADOBE }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-[0.3em] font-body font-bold mt-2" style={{ color: `${SAND}77` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t mt-16 pt-8 text-center" style={{ borderColor: `${SAND}11` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body font-bold" style={{ color: `${SAND}44` }}>© 2027 {p1.nick} &amp; {p2.nick}. Pasir Series.</p>
        </div>
      </footer>
    </div>
  );
}
