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

/* ─── Motion Tokens — bouncy spring pop, playful 0.5–0.8s ─── */
const EASE: [number, number, number, number] = [0.34, 1.4, 0.64, 1]; // slight overshoot
const EASE_SOFT: [number, number, number, number] = [0.25, 0.8, 0.4, 1];
const DUR = 0.65;

/* Variant library — spring pops + confetti-in stagger give Bumi its handmade bounce. */
const vPop: Variants = { hidden: { opacity: 0, scale: 0.85, y: 18 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 16 } } };
const vUp: Variants = { hidden: { opacity: 0, y: 42 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8, ease: EASE_SOFT } } };
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 20, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } } };

/* ─── Palette: "Bumi" (earth) — Terrazzo Clay Pop, playful handmade minimalist ───
   Warm clay pop on cream, olive + mustard confetti, rounded flat color blocks.
   Distinct from Kaze (sumi ink), Liana (botanical sage). */
const CLAY = '#D98460';
const CLAY2 = '#C26B4A';
const OLIVE = '#7A8450';
const MUSTARD = '#E0B250';
const CREAM = '#F5EBDC';
const CREAM2 = '#EDE0CC';
const INK = '#2E2820';
const MUTED = '#857866';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Bima', full: 'Bima Saputra Nurcahya, S.Sn.', father: 'Bpk. Saputra Nurcahya', mother: 'Ibu Ratna Mulyani', ig: '@bima.tanah', desc: 'Tukang kayu sekaligus tukang bercerita; percaya tangan yang sabar membuat barang yang bertenaga.' },
    p2: { nick: 'Rara', full: 'Rara Anggraini Lestari, S.Pd.', father: 'Bpk. Drs. Joko Anggraini', mother: 'Ibu Wulan Asmarani', ig: '@rara.tanaman', desc: 'Penanam tanaman dan penikmat kopi pagi; meyakini hal indah tumbuh perlahan, seperti roti yang mengembang.' },
  },
  date: '2027-08-21T09:00:00',
  quote: { text: 'Rumah bukan hanya tembok dan atap. Rumah adalah dua tangan yang menanam, menumbuhkan, dan tetap memilih satu sama lain di setiap musim.', source: 'Doa kami' },
  events: [
    { title: 'Akad Nikah', time: '09:00 - 10:30 WIB', venue: 'Sasana Tani Tirta', address: 'Jl. Bumi Asri No. 12, Lembang', mapsUrl: 'https://maps.google.com', note: 'Khidmat dan hangat, khusus keluarga inti' },
    { title: 'Resepsi', time: '11:30 - 15:00 WIB', venue: 'Kebun Bumi Raya', address: 'Jl. Tanah Liek, Lembang, Bandung', mapsUrl: 'https://maps.google.com', note: 'Terbuka untuk seluruh tamu undangan — pakai sepatu yang nyaman!' },
  ],
  stories: [
    { year: '2022', title: 'Tanah Liat yang Sama', desc: 'Berkenalan di kelas keramik saat jari-jari kami penuh tanah liat. Sebuah cangkir retak jadi dua, dan satu cerita mulai terbentuk dari tangannya yang ceroboh dan tangannya yang sabar.' },
    { year: '2024', title: 'Dua Tangan, Satu Meja', desc: 'Dua tahun menanam tanaman, memasak berdampingan, dan merajut selimut untuk musim hujan. Dua tangan yang biasa membentuk tanah liat kini mulai membangun sebuah rumah.' },
    { year: '2026', title: 'Ditanam & Dirajut', desc: 'Dengan restu keluarga, kami merajut janji. Bukan sekadar cinta — tapi akar yang dalam, tangan yang ringan, dan rumah kecil yang kami buat satu bata demi satu bata.' },
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
    { bank: 'Bank Mandiri', number: '1180023491820', owner: 'Bima Saputra Nurcahya' },
    { bank: 'Bank BCA', number: '0359871120', owner: 'Rara Anggraini Lestari' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
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
  const location = content.event?.location || 'Bandung';
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
  if (typeof window === 'undefined' || document.getElementById('bumi-inv')) return;
  const s = document.createElement('style');
  s.id = 'bumi-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
.font-display { font-family: 'Bricolage Grotesque', sans-serif; }
.font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: terrazzo confetti + organic blob + handdrawn squiggle ─── */

/** Handdrawn wavy underline — animated draw (pathLength 0→1). */
function Squiggle({ className = 'w-24 h-3', color = CLAY }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
      <motion.path d="M3 7 C13 1, 23 11, 33 6 C43 1, 53 11, 63 6 C73 1, 83 11, 93 6 C103 1, 113 11, 117 6"
        stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeInOut' }} />
    </svg>
  );
}

/** Decorative organic blob shape — section watermark/corner. */
function Blob({ className = 'w-40 h-40', color = OLIVE, opacity = 0.16 }: { className?: string; color?: string; opacity?: number }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ opacity }}>
      <path d="M114 14 C152 18 178 46 184 84 C189 118 176 152 146 172 C118 191 80 192 50 174 C22 157 10 124 16 90 C22 56 46 26 80 17 C91 14 103 13 114 14 Z" fill={color} />
    </svg>
  );
}

/** Small terrazzo speckle shape (triangle / semicircle / quad) in a palette color. */
function Speck({ shape, size, color }: { shape: 'tri' | 'semi' | 'quad'; size: number; color: string }) {
  const s = { width: size, height: size };
  if (shape === 'tri') {
    return (
      <svg style={s} viewBox="0 0 10 10" aria-hidden="true">
        <path d="M5 1 L9 9 L1 9 Z" fill={color} />
      </svg>
    );
  }
  if (shape === 'semi') {
    return (
      <svg style={s} viewBox="0 0 10 10" aria-hidden="true">
        <path d="M1 5 A4 4 0 0 1 9 5 Z" fill={color} />
      </svg>
    );
  }
  return (
    <svg style={s} viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 2 L8 1 L9 7 L3 9 Z" fill={color} />
    </svg>
  );
}

/** Scattered floating terrazzo confetti — the signature ambient motion. Null when reduce. */
function Terrazzo({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const specks = [
    { x: 6, y: 14, s: 14, r: 14, c: CLAY, shape: 'tri' as const, d: 0, dur: 6 },
    { x: 18, y: 72, s: 11, r: -22, c: OLIVE, shape: 'semi' as const, d: 0.8, dur: 7.5 },
    { x: 30, y: 30, s: 9, r: 8, c: MUSTARD, shape: 'quad' as const, d: 1.4, dur: 6.8 },
    { x: 44, y: 84, s: 13, r: -10, c: CLAY2, shape: 'tri' as const, d: 0.4, dur: 8 },
    { x: 58, y: 18, s: 10, r: 24, c: OLIVE, shape: 'quad' as const, d: 1.1, dur: 7 },
    { x: 68, y: 60, s: 12, r: -16, c: MUSTARD, shape: 'semi' as const, d: 1.8, dur: 6.4 },
    { x: 80, y: 32, s: 9, r: 12, c: CLAY, shape: 'tri' as const, d: 0.6, dur: 7.6 },
    { x: 90, y: 78, s: 12, r: -24, c: CLAY2, shape: 'quad' as const, d: 1.6, dur: 6.9 },
    { x: 12, y: 46, s: 8, r: 18, c: MUSTARD, shape: 'semi' as const, d: 2.1, dur: 8.2 },
    { x: 50, y: 50, s: 10, r: -8, c: CLAY, shape: 'quad' as const, d: 1.0, dur: 7.2 },
    { x: 76, y: 8, s: 9, r: 20, c: OLIVE, shape: 'tri' as const, d: 0.2, dur: 6.6 },
    { x: 38, y: 92, s: 11, r: -14, c: MUSTARD, shape: 'quad' as const, d: 1.3, dur: 7.8 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {specks.map((sp, i) => (
        <motion.span key={i} className="absolute" style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
          initial={{ opacity: 0, y: 10, rotate: sp.r }}
          animate={{ opacity: [0, 0.65, 0.65], y: [0, -8, 0], rotate: [sp.r, sp.r + 18, sp.r] }}
          transition={{ duration: sp.dur, delay: sp.d, repeat: Infinity, ease: 'easeInOut' }}>
          <Speck shape={sp.shape} size={sp.s} color={sp.c} />
        </motion.span>
      ))}
    </div>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanBumi({ content, slug, preview }: MonolithicTemplateProps) {
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: CREAM }}>
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: `radial-gradient(${CLAY}22 1.5px, transparent 1.5px), radial-gradient(${OLIVE}1E 1px, transparent 1px)`, backgroundSize: '34px 34px, 52px 52px', backgroundPosition: '0 0, 17px 17px' }} />
        <Blob className="absolute -top-10 -left-10 w-56 h-56" color={MUSTARD} opacity={0.2} />
        <Blob className="absolute -bottom-12 -right-12 w-64 h-64" color={OLIVE} opacity={0.16} />
        <Terrazzo reduce={!!reduce} />
        <div className="absolute inset-5 rounded-[36px] pointer-events-none z-10" style={{ border: `2px dashed ${CLAY}44` }} />

        <motion.div className="relative z-20 px-6 max-w-md w-full text-center" variants={stagC} initial="hidden" animate="visible">
          <motion.div variants={stagI} className="flex flex-col items-center gap-2 mb-7">
            <span className="inline-flex items-center justify-center rounded-2xl" style={{ backgroundColor: CLAY, width: 52, height: 52 }}>
              <Heart className="w-6 h-6" style={{ color: CREAM }} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.45em] font-body font-semibold" style={{ color: CLAY2 }}>The Wedding of</span>
          </motion.div>

          <motion.h1 variants={stagI} className="font-display text-6xl leading-[0.95] font-semibold tracking-tight" style={{ color: INK }}>
            {p1.nick}
            <span className="block font-display font-medium text-3xl my-1" style={{ color: CLAY }}>&amp;</span>
            {p2.nick}
          </motion.h1>

          <motion.div variants={stagI} className="flex justify-center my-5"><Squiggle className="w-32 h-3" color={OLIVE} /></motion.div>

          <motion.p variants={stagI} className="font-display text-base font-medium" style={{ color: INK }}>{displayDate}</motion.p>

          <motion.div variants={stagI} className="mt-9 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.35em] font-body" style={{ color: MUTED }}>Kepada Yth.</p>
            <p className="font-display text-lg font-semibold" style={{ color: INK }}>{guestName}</p>
          </motion.div>

          <motion.div variants={stagI} className="mt-9">
            <motion.button onClick={open} type="button"
              whileHover={{ scale: 1.04, rotate: -1 }} whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2.5 px-10 py-4 text-xs uppercase tracking-[0.3em] font-body font-bold rounded-full"
              style={{ color: CREAM, backgroundColor: CLAY, boxShadow: `0 14px 30px -12px ${CLAY2}CC` }}>
              <Heart className="w-4 h-4" /> Buka Undangan
            </motion.button>
          </motion.div>
        </motion.div>
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[7px] tracking-[0.45em] uppercase z-20 font-body" style={{ color: MUTED }}>#{p1.nick}{p2.nick}Bumi</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: CREAM, color: INK }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-200 hover:scale-110 rounded-full"
        style={{ backgroundColor: CLAY, boxShadow: `0 10px 24px -10px ${CLAY2}CC` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: CREAM }} /> : <VolumeX className="w-5 h-5" style={{ color: CREAM, opacity: 0.7 }} />}
      </button>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: INK }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1.04, 1, 1.04] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-55" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-55" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${INK}E6 0%, ${INK}77 50%, ${CLAY}33 100%)` }} />
        <Blob className="absolute top-8 right-6 w-32 h-32" color={MUSTARD} opacity={0.22} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20 pt-32">
          <motion.p className="text-[10px] uppercase tracking-[0.5em] font-body font-bold" style={{ color: MUSTARD }}
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.25 }}>Undangan Pernikahan</motion.p>
          <motion.h1 className="font-display text-7xl md:text-8xl leading-[0.9] font-semibold tracking-tight mt-4" style={{ color: CREAM }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 17, delay: 0.4 }}>
            {p1.nick}<br /><span className="font-medium" style={{ color: MUSTARD }}>&amp;</span> {p2.nick}
          </motion.h1>
          <motion.div className="mt-5" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.7 }}>
            <Squiggle className="w-36 h-3" color={CLAY} />
          </motion.div>
          <motion.div className="flex flex-wrap items-end justify-between gap-6 mt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 0.85 }}>
            <div>
              <p className="font-display text-lg font-medium" style={{ color: CREAM }}>{displayDate}</p>
              <p className="text-[10px] tracking-[0.3em] uppercase font-body font-semibold mt-1" style={{ color: MUSTARD }}>{location}</p>
            </div>
            {guestName && (
              <div className="px-5 py-2.5 rounded-2xl" style={{ backgroundColor: `${CREAM}14`, border: `1px solid ${CREAM}33` }}>
                <p className="text-[9px] uppercase tracking-[0.3em] font-body" style={{ color: `${CREAM}99` }}>Kepada Yth.</p>
                <p className="font-display text-base font-semibold mt-0.5" style={{ color: CREAM }}>{guestName}</p>
              </div>
            )}
          </motion.div>
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-[8px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: `${CREAM}77` }}>Scroll</span>
        </motion.div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <Terrazzo reduce={!!reduce} />
        <Blob className="absolute -left-12 top-1/4 w-48 h-48" color={OLIVE} opacity={0.1} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6"><Squiggle className="w-28 h-3" color={CLAY} /></div>
          <motion.span className="font-display text-6xl font-semibold leading-none block mb-2" style={{ color: `${CLAY}66` }} variants={vPop}>"</motion.span>
          <motion.p className="font-display text-2xl md:text-3xl leading-relaxed font-medium" style={{ color: INK }} variants={vUp}>{quote.text}</motion.p>
          <motion.span className="font-display text-6xl font-semibold leading-none block mt-2" style={{ color: `${CLAY}66` }} variants={vPop}>"</motion.span>
          <div className="flex justify-center mt-6"><Squiggle className="w-28 h-3" color={OLIVE} /></div>
          <p className="font-display text-sm mt-4 font-semibold tracking-wide" style={{ color: CLAY2 }}>— {quote.source}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE — blob-masked photos, bento-ish asymmetry ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <Blob className="absolute top-0 right-0 w-64 h-64" color={MUSTARD} opacity={0.14} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-4"><Squiggle className="w-32 h-3" color={CLAY} /></div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold mb-2" style={{ color: CLAY2 }}>Kedua Mempelai</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-3" style={{ color: INK }}>Dua Tangan Satu Rumah</h2>
          <p className="text-sm max-w-md mx-auto mb-16 font-body leading-relaxed" style={{ color: MUTED }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>

          <div className="grid md:grid-cols-2 gap-10 md:gap-6 items-start">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria', radius: '63% 37% 54% 46% / 55% 48% 52% 45%', tilt: -3 },
              { person: p2, img: media.p2, label: 'Mempelai Wanita', radius: '42% 58% 46% 54% / 48% 62% 38% 52%', tilt: 3 },
            ].map(({ person, img, label, radius, tilt }, idx) => (
              <motion.div key={label} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 30, rotate: tilt }} whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, margin: '-60px' }} transition={{ type: 'spring', stiffness: 240, damping: 18, delay: idx * 0.12 }}>
                <motion.div className="relative overflow-hidden" style={{ width: 220, height: 220, borderRadius: radius, backgroundColor: CREAM, boxShadow: `0 22px 44px -18px ${INK}55` }}
                  whileHover={{ scale: 1.03 }}>
                  <img src={img} alt={person.nick} className="w-full h-full object-cover" />
                </motion.div>
                <p className="text-[10px] uppercase tracking-[0.35em] font-body font-bold mt-6 mb-1" style={{ color: CLAY2 }}>{label}</p>
                <h3 className="font-display text-2xl font-semibold tracking-tight" style={{ color: INK }}>{person.full}</h3>
                <div className="flex justify-center my-3"><Squiggle className="w-20 h-3" color={MUSTARD} /></div>
                <p className="text-sm leading-relaxed font-body max-w-xs mb-4" style={{ color: `${INK}CC` }}>{person.desc}</p>
                <p className="text-xs font-body" style={{ color: MUTED }}>
                  Putra/i dari:<br /><span className="font-semibold" style={{ color: INK }}>{person.father}</span><br />&amp; {person.mother}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN — chunky rounded color blocks ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: INK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `radial-gradient(${MUSTARD} 1.5px, transparent 1.5px)`, backgroundSize: '30px 30px' }} />
        <Blob className="absolute -bottom-10 left-1/4 w-56 h-56" color={CLAY} opacity={0.14} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-4"><Squiggle className="w-32 h-3" color={MUSTARD} /></div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold mb-2" style={{ color: MUSTARD }}>Menuju Hari Bahagia</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-12" style={{ color: CREAM }}>Hitung Mundur</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Hari', val: countdown.days, bg: CLAY, fg: CREAM },
              { label: 'Jam', val: countdown.hours, bg: OLIVE, fg: CREAM },
              { label: 'Menit', val: countdown.minutes, bg: MUSTARD, fg: INK },
              { label: 'Detik', val: countdown.seconds, bg: CLAY2, fg: CREAM, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="rounded-3xl py-6 px-2"
                style={{ backgroundColor: item.bg, color: item.fg, boxShadow: `0 14px 30px -14px ${INK}AA` }}
                initial={{ opacity: 0, scale: 0.7, y: 16 }} whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: idx * 0.1 }}>
                <motion.span className="font-display text-4xl md:text-5xl font-bold tabular-nums leading-none block"
                  key={item.val} initial={reduce ? false : { y: -14, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  {String(item.val).padStart(2, '0')}
                </motion.span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-body font-bold mt-2.5 block">{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-11">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-bold rounded-full transition-all duration-200 hover:scale-105"
              style={{ color: INK, backgroundColor: MUSTARD }}>
              <Calendar className="w-4 h-4" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <Terrazzo reduce={!!reduce} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4"><Squiggle className="w-32 h-3" color={CLAY} /></div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold mb-2" style={{ color: CLAY2 }}>Perjalanan Cinta</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: INK }}>Cerita Kami</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 md:-translate-x-1/2 rounded-full" style={{ background: `linear-gradient(to bottom, transparent, ${OLIVE}66, ${OLIVE}66, transparent)` }} />
            <div className="space-y-14">
              {stories.length > 0 && stories.map((story, idx) => {
                const left = idx % 2 === 0;
                return (
                  <motion.div key={idx} className="relative pl-14 md:pl-0"
                    initial={{ opacity: 0, scale: 0.9, x: left ? -20 : 20 }} whileInView={{ opacity: 1, scale: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }} transition={{ type: 'spring', stiffness: 240, damping: 18, delay: idx * 0.1 }}>
                    <div className="absolute left-4 md:left-1/2 top-1 -translate-x-1/2">
                      <motion.span className="block rounded-2xl flex items-center justify-center" style={{ width: 28, height: 28, backgroundColor: idx === 1 ? MUSTARD : CLAY }}
                        initial={{ scale: 0, rotate: -30 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: idx * 0.15 }}>
                        <span className="font-display text-xs font-bold" style={{ color: idx === 1 ? INK : CREAM }}>{idx + 1}</span>
                      </motion.span>
                    </div>
                    <div className={`md:w-1/2 ${left ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                      <span className="inline-block text-[10px] font-body font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full" style={{ backgroundColor: `${CLAY}1F`, color: CLAY2 }}>{story.year}</span>
                      <h4 className="font-display text-2xl font-semibold tracking-tight mt-2 mb-2" style={{ color: INK }}>{story.title}</h4>
                      <p className="text-sm leading-relaxed font-body" style={{ color: `${INK}CC` }}>{story.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <Blob className="absolute top-0 left-0 w-56 h-56" color={CLAY} opacity={0.12} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4"><Squiggle className="w-32 h-3" color={OLIVE} /></div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold mb-2" style={{ color: CLAY2 }}>Informasi Acara</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: INK }}>Waktu &amp; Lokasi</h2>
          </div>
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-6 py-2.5 text-xs font-body font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-200"
                style={activeTab === idx
                  ? { backgroundColor: INK, color: CREAM }
                  : { color: MUTED, border: `1px solid ${OLIVE}55`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="p-8 rounded-3xl" style={{ backgroundColor: CREAM, boxShadow: `0 22px 50px -24px ${INK}55` }}
            key={activeTab} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
            <h3 className="font-display text-2xl font-semibold tracking-tight mb-4" style={{ color: INK }}>{activeEvt.title}</h3>
            <div className="space-y-2.5 font-body text-sm" style={{ color: `${INK}CC` }}>
              <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 flex-shrink-0" style={{ color: CLAY2 }} /> {activeEvt.time}</div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: CLAY2 }} /> <span>{activeEvt.venue}<br />{activeEvt.address}</span></div>
            </div>
            {activeEvt.note && <p className="text-[11px] italic font-body mt-3" style={{ color: MUTED }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 text-xs font-body font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-200 hover:scale-105"
                style={{ color: CREAM, backgroundColor: CLAY }}>
                <Map className="w-3.5 h-3.5" /> Buka Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY — bento-ish, idx 0 spans 2x2 ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4"><Squiggle className="w-32 h-3" color={MUSTARD} /></div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold mb-2" style={{ color: CLAY2 }}>Galeri Foto</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: INK }}>Kenangan Indah</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden rounded-3xl"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1' } : { aspectRatio: '1' }}
                initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ type: 'spring', stiffness: 240, damping: 18, delay: idx * 0.08 }}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" style={{ background: `linear-gradient(to top, ${CLAY}99, transparent 60%)` }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${INK}F2`, backdropFilter: 'blur(6px)' }} onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full text-2xl font-light" style={{ backgroundColor: `${CREAM}1A`, color: CREAM }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2 rounded-full" style={{ backgroundColor: `${CREAM}1A`, color: CREAM }} aria-label="Sebelumnya"><ChevronLeft className="w-7 h-7" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2 rounded-full" style={{ backgroundColor: `${CREAM}1A`, color: CREAM }} aria-label="Berikutnya"><ChevronRight className="w-7 h-7" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[85vh] max-w-full" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 8. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <Blob className="absolute bottom-0 right-0 w-64 h-64" color={OLIVE} opacity={0.1} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4"><Squiggle className="w-32 h-3" color={CLAY} /></div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold mb-2" style={{ color: CLAY2 }}>Doa &amp; Ucapan</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight" style={{ color: INK }}>Kirim Ucapan</h2>
          </div>

          {isSubmitted ? (
            <motion.div className="p-10 text-center rounded-3xl" style={{ backgroundColor: CREAM, border: `2px solid ${CLAY}44` }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
              <motion.span className="inline-flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: OLIVE, width: 56, height: 56 }}
                initial={{ rotate: -20 }} animate={{ rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }}>
                <Check className="w-7 h-7" style={{ color: CREAM }} />
              </motion.span>
              <p className="font-display text-lg font-semibold" style={{ color: INK }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="p-6 space-y-4 rounded-3xl" style={{ backgroundColor: CREAM, boxShadow: `0 22px 50px -24px ${INK}55` }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm font-body outline-none transition-colors rounded-2xl"
                  style={{ backgroundColor: CREAM2, color: INK, border: `1px solid ${OLIVE}33` }}
                  onFocus={(e) => e.target.style.borderColor = CLAY} onBlur={(e) => e.target.style.borderColor = `${OLIVE}33`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-4 py-3 text-sm font-body outline-none rounded-2xl"
                  style={{ backgroundColor: CREAM2, color: INK, border: `1px solid ${OLIVE}33` }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-4 py-3 text-sm font-body outline-none transition-colors resize-none h-24 rounded-2xl"
                style={{ backgroundColor: CREAM2, color: INK, border: `1px solid ${OLIVE}33` }}
                onFocus={(e) => e.target.style.borderColor = CLAY} onBlur={(e) => e.target.style.borderColor = `${OLIVE}33`} />
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-bold rounded-full"
                style={{ color: CREAM, backgroundColor: CLAY }}>
                <Send className="w-4 h-4" /> Kirim Ucapan
              </motion.button>
            </form>
          )}

          {content.guestbook?.enabled !== false && wishes.length === 0 && (
            <p className="text-center text-sm font-body italic mt-8" style={{ color: MUTED }}>Belum ada ucapan — jadilah yang pertama mengirim doa restu.</p>
          )}

          {content.guestbook?.enabled !== false && wishes.length > 0 && (
            <div className="mt-8 space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {wishes.slice(0, 20).map((w) => (
                <div key={w.id} className="p-4 rounded-2xl" style={{ backgroundColor: CREAM, border: `1px solid ${OLIVE}28` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-display text-base font-semibold" style={{ color: INK }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1.5 font-body font-bold" style={{ color: CLAY2 }}>{w.attendance === 'Hadir' ? '✓ Hadir' : '✕ Tidak Hadir'}</p>
                  <p className="text-sm leading-relaxed font-body" style={{ color: `${INK}CC` }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <Terrazzo reduce={!!reduce} />
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <div className="flex justify-center mb-4"><Squiggle className="w-32 h-3" color={MUSTARD} /></div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold mb-2" style={{ color: CLAY2 }}>Tanda Kasih</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-4" style={{ color: INK }}>Kado Digital</h2>
            <p className="text-sm max-w-md mx-auto mb-10 font-body leading-relaxed" style={{ color: MUTED }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-7 rounded-3xl text-left" style={{ backgroundColor: CREAM2, border: `1px solid ${OLIVE}28` }}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18, delay: idx * 0.1 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center rounded-xl" style={{ backgroundColor: `${CLAY}1F`, width: 28, height: 28 }}>
                      <Gift className="w-4 h-4" style={{ color: CLAY2 }} />
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: CLAY2 }}>{g.bank}</p>
                  </div>
                  <p className="font-display text-xl font-semibold tabular-nums my-2" style={{ color: INK }}>{g.number}</p>
                  <p className="text-xs font-body mb-4" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 text-[10px] font-body font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full transition-all hover:scale-105"
                    style={{ color: CREAM, backgroundColor: CLAY }}>
                    {copiedIdx === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="relative px-6 py-28 text-center overflow-hidden" style={{ background: `linear-gradient(160deg, ${INK} 0%, ${CLAY2} 140%)` }}>
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `radial-gradient(${MUSTARD} 1.5px, transparent 1.5px)`, backgroundSize: '30px 30px' }} />
        <Blob className="absolute -top-10 -right-10 w-56 h-56" color={MUSTARD} opacity={0.16} />
        <Blob className="absolute -bottom-12 -left-12 w-64 h-64" color={CLAY} opacity={0.18} />
        <Terrazzo reduce={!!reduce} />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="flex justify-center mb-7" initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
            <span className="inline-flex items-center justify-center rounded-2xl" style={{ backgroundColor: MUSTARD, width: 52, height: 52 }}>
              <Heart className="w-6 h-6" style={{ color: INK }} />
            </span>
          </motion.div>
          <motion.h2 className="font-display text-3xl md:text-4xl font-medium leading-snug tracking-tight max-w-xl mx-auto" style={{ color: CREAM }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </motion.h2>
          <div className="flex justify-center my-9"><Squiggle className="w-40 h-3" color={MUSTARD} /></div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold" style={{ color: MUSTARD }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl font-semibold tracking-tight mt-3" style={{ color: CREAM }}>{p1.nick} <span className="font-medium" style={{ color: MUSTARD }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-[0.3em] font-body mt-2" style={{ color: `${CREAM}77` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t mt-14 pt-8 text-center" style={{ borderColor: `${CREAM}14` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${CREAM}55` }}>© 2027 {p1.nick} &amp; {p2.nick}. Bumi Series.</p>
        </div>
      </footer>
    </div>
  );
}
