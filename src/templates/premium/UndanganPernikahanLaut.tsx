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
const EASE: [number, number, number, number] = [0.25, 0.8, 0.3, 1];
const EASE_SWELL: [number, number, number, number] = [0.37, 0, 0.3, 1];
const DUR = 1.0;

/* Variant library — gentle rise + ripple fade, varied per section. */
const vUp: Variants = { hidden: { opacity: 0, y: 38 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vRise: Variants = { hidden: { opacity: 0, y: 56 }, visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE_SWELL } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.3, ease: 'easeOut' } } };
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.14, delayChildren: 0.07 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Laut" (Sea) — Mediterranean / Greek-isle Coastal ───
   Fresh airy white-wash + deep teal ink + coral accent. Arch/dome shapes, wave dividers.
   Distinct from Kaze (sumi ink), Liana (sage botanical), Flora (peach), Sakura (plum), Hana (ivory). */
const TEAL = '#0E5A5A';
const TEAL2 = '#0A4848';
const CORAL = '#E8765A';
const CORAL2 = '#F0917A';
const SAND = '#F4ECDC';
const SAND2 = '#E8DCC2';
const WHITE = '#FBF9F4';
const INK = '#1F3A3A';
const MUTED = '#6E8A8A';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Bima', full: 'Bima Surya Mahendra, S.T.', father: 'Bpk. Ir. Hendra Mahendra', mother: 'Ibu Indira Permatasari', ig: '@bimasurya', desc: 'Seorang pelaut hati yang percaya bahwa cinta adalah pelabuhan terindah, tempat dua gelombang bertemu dan menyatu.' },
    p2: { nick: 'Lestari', full: 'Lestari Windu Azzahra, S.Par.', father: 'Bpk. Drs. Windu Kusuma', mother: 'Ibu Maharani Wibowo', ig: '@lestariwindu', desc: 'Pencinta senja dan garis horizon yang meyakini setiap ombak membawa pertanda kedamaian dan pertemuan.' },
  },
  date: '2027-08-21T16:00:00',
  quote: { text: 'Cinta kami bagai dua aliran sungai yang menuju samudra luas — bertemu di muara, lalu menyatu dalam satu garis horizon yang tiada berujung.', source: 'Sepucuk harapan tepian laut' },
  events: [
    { title: 'Akad Nikah', time: '09:00 - 11:00 WITA', venue: 'Pantai Kapel By The Sea', address: 'Jl. Pantai Mutiara, Sanur, Bali', mapsUrl: 'https://maps.google.com', note: 'Khidmat dan sakral di tepi pantai, khusus keluarga inti dan kerabat dekat' },
    { title: 'Resepsi Pesta Laut', time: '16:00 - 21:00 WITA', venue: 'Terrace Mediterania Resort', address: 'Jl. By Pass Sanur, Denpasar, Bali', mapsUrl: 'https://maps.google.com', note: 'Terbuka untuk seluruh tamu undangan, diiringi senja tepian laut' },
  ],
  stories: [
    { year: '2022', title: 'Angin Pertama', desc: 'Berjumpa di sebuah kafe tepian pantai saat angin sore berhembus. Bima menangkap topi Lestari yang terbang, dan sebuah senyum menjadi awal angin yang membawa kita bersama.' },
    { year: '2024', title: 'Garis Horizon', desc: 'Dua tahun menyusuri pantai, mengejar senja, dan bercerita tentang garis horizon. Seperti laut yang tak pernah lelah menyapa pasir, kami memilih untuk terus kembali satu sama lain.' },
    { year: '2026', title: 'Pelabuhan Hati', desc: 'Dengan restu kedua keluarga, kami menambatkan janji di tepi laut yang saksi. Ombak telah berbisik, horizon telah menyatu — kini kami berlayar bersama selamanya.' },
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
    { bank: 'Bank Mandiri', number: '1440098731220', owner: 'Bima Surya Mahendra' },
    { bank: 'Bank BCA', number: '0712559831', owner: 'Lestari Windu Azzahra' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600',
  hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600',
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
  const location = content.event?.location || 'Sanur, Bali';
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
  if (typeof window === 'undefined' || document.getElementById('laut-inv')) return;
  const s = document.createElement('style');
  s.id = 'laut-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@300;400;500;600&display=swap');
.font-display { font-family: 'Cardo', Georgia, serif; }
.font-body { font-family: 'Work Sans', system-ui, sans-serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: laut / Mediterranean coastal ─── */

/** Sine wave line divider — airy wave on the horizon. */
function Wave({ className = 'w-full h-4', color = TEAL }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 8 C20 2, 40 2, 60 8 S100 14, 120 8 S160 2, 180 8 S220 14, 240 8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M0 12 C20 8, 40 8, 60 12 S100 16, 120 12 S160 8, 180 12 S220 16, 240 12" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

/** Scallop shell — symbol of the sea and pilgrimage of love. */
function Shell({ className = 'w-8 h-8', color = CORAL }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M32 8 C18 8 8 22 6 36 L58 36 C56 22 46 8 32 8 Z" fill={color} opacity="0.92" />
      <path d="M32 8 L32 36" stroke="#fff" strokeWidth="1.2" opacity="0.5" />
      {[12, 18, 24, 40, 46, 52].map((x, i) => (
        <path key={i} d={`M32 10 L${x} 36`} stroke="#fff" strokeWidth="0.9" opacity="0.32" />
      ))}
      <ellipse cx="32" cy="38" rx="6" ry="2.4" fill={color} />
    </svg>
  );
}

/** Branching coral sprig — organic coastal accent. */
function Coral({ className = 'w-24 h-12', color = TEAL, flip = false, opacity = 1 }: { className?: string; color?: string; flip?: boolean; opacity?: number }) {
  return (
    <svg className={className} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={{ transform: flip ? 'scaleX(-1)' : undefined, opacity }}>
      <path d="M60 56 L60 20" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
      <path d="M60 36 C50 32 42 24 38 14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <path d="M60 36 C70 32 78 24 82 14" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <path d="M60 26 C54 22 48 18 46 10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M60 26 C66 22 72 18 74 10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <circle cx="38" cy="13" r="2.4" fill={color} opacity="0.85" />
      <circle cx="82" cy="13" r="2.4" fill={color} opacity="0.85" />
      <circle cx="46" cy="9" r="1.8" fill={color} opacity="0.75" />
      <circle cx="74" cy="9" r="1.8" fill={color} opacity="0.75" />
      <circle cx="60" cy="18" r="2.2" fill={color} opacity="0.85" />
    </svg>
  );
}

/** Stacked wave layers band — wider decorative footer / divider band. */
function WaveLayers({ className = 'w-full h-10', color = TEAL }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 12 C30 4 60 4 90 12 S150 20 180 12 S230 4 240 10 L240 40 L0 40 Z" fill={color} opacity="0.18" />
      <path d="M0 22 C30 16 60 16 90 22 S150 28 180 22 S230 16 240 20 L240 40 L0 40 Z" fill={color} opacity="0.28" />
      <path d="M0 32 C30 28 60 28 90 32 S150 36 180 32 S230 28 240 30 L240 40 L0 40 Z" fill={color} opacity="0.5" />
    </svg>
  );
}

/** Wave divider — thin line + centered shell. */
function WaveDivider({ color = TEAL }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-4 my-7">
      <span className="h-px w-16" style={{ background: `linear-gradient(to left, ${color}, transparent)` }} />
      <Shell className="w-6 h-6" color={CORAL} />
      <span className="h-px w-16" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
    </div>
  );
}

/** Ambient ornament: ripples expanding outward + drifting wave line. The signature sea motion. */
function SeaRipples({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const ripples = [
    { left: '14%', top: '20%', delay: 0, dur: 4.5 },
    { left: '82%', top: '32%', delay: 1.6, dur: 5 },
    { left: '24%', top: '70%', delay: 0.9, dur: 4.8 },
    { left: '76%', top: '76%', delay: 2.4, dur: 5.4 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {ripples.map((r, i) => (
        <motion.span key={i} className="absolute rounded-full"
          style={{ left: r.left, top: r.top, width: 24, height: 24, marginLeft: -12, marginTop: -12, border: `1px solid ${TEAL}` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 5, 7], opacity: [0, 0.35, 0] }}
          transition={{ duration: r.dur, delay: r.delay, repeat: Infinity, ease: 'easeOut' }} />
      ))}
      <motion.div className="absolute left-0 right-0"
        style={{ top: '46%', height: 18, opacity: 0.06 }}
        animate={{ x: ['-50%', '0%', '-50%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}>
        <Wave color={TEAL} className="w-[200%] h-full" />
      </motion.div>
    </div>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanLaut({ content, slug, preview }: MonolithicTemplateProps) {
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden"
        style={{ background: `linear-gradient(175deg, ${WHITE} 0%, ${SAND} 60%, ${SAND2} 100%)` }}>
        <WaveLayers className="absolute top-0 left-0 right-0 h-16 rotate-180" color={TEAL} />
        <Coral className="absolute -top-2 -left-4 w-36 h-16" color={TEAL} opacity={0.12} />
        <Coral className="absolute -top-2 -right-4 w-36 h-16" color={TEAL} flip opacity={0.12} />
        {!reduce && (
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 75%, ${CORAL}1F 0%, transparent 55%)` }}
            animate={{ opacity: [0.4, 0.75, 0.4] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }} />
        )}

        <motion.div className="pt-16 z-20" variants={stagI} initial="hidden" animate="visible">
          <Shell className="w-10 h-10 mx-auto" color={CORAL} />
        </motion.div>

        <motion.div className="my-auto z-20 px-6 max-w-sm w-full text-center space-y-6"
          variants={stagC} initial="hidden" animate="visible">
          <motion.p variants={stagI} className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: CORAL }}>The Wedding of</motion.p>
          <motion.div variants={stagI}>
            <h1 className="font-display text-6xl leading-[0.95] font-normal tracking-tight" style={{ color: TEAL }}>
              {p1.nick}
              <span className="block font-display italic text-3xl my-1.5 font-light" style={{ color: CORAL }}>&amp;</span>
              {p2.nick}
            </h1>
          </motion.div>
          <motion.div variants={stagI} className="max-w-[160px] mx-auto"><Wave color={TEAL} /></motion.div>
          <motion.p variants={stagI} className="font-display text-sm font-light italic" style={{ color: INK }}>{displayDate}</motion.p>
          <motion.div variants={stagI} className="space-y-1.5 pt-1">
            <p className="text-[10px] uppercase tracking-[0.4em] font-body" style={{ color: MUTED }}>Kepada Yth.</p>
            <div className="inline-block px-7 py-2.5 rounded-t-[100px] rounded-b-3xl" style={{ border: `1px solid ${TEAL}33`, backgroundColor: `${WHITE}99` }}>
              <p className="font-display text-base font-normal tracking-wide" style={{ color: TEAL }}>{guestName}</p>
            </div>
          </motion.div>
          <motion.div variants={stagI} className="pt-1">
            <button onClick={open}
              className="group relative px-10 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold rounded-t-[100px] rounded-b-3xl transition-all duration-300 overflow-hidden"
              style={{ color: WHITE, backgroundColor: TEAL }}>
              <span className="relative z-10 flex items-center gap-2 justify-center"><Heart className="w-3.5 h-3.5" /> Buka Undangan</span>
              <motion.span className="absolute inset-0 origin-bottom" style={{ backgroundColor: CORAL }}
                initial={{ scaleY: 0 }} whileHover={{ scaleY: 1 }} transition={{ duration: 0.35, ease: EASE }} />
            </button>
          </motion.div>
        </motion.div>
        <p className="text-[7px] tracking-[0.5em] uppercase mb-6 z-20 font-body" style={{ color: MUTED }}>#{p1.nick}{p2.nick}Laut</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: WHITE, color: INK }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-200 hover:scale-110 rounded-t-[100px] rounded-b-3xl"
        style={{ backgroundColor: TEAL, border: `1px solid ${CORAL}55` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: WHITE }} /> : <VolumeX className="w-5 h-5" style={{ color: WHITE, opacity: 0.6 }} />}
      </button>

      {/* ═══ 1. HERO — coastal cover, names over sea, arch motifs ═══ */}
      <section className="relative min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: TEAL2 }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1.04, 1, 1.04] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-55" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-55" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(170deg, ${TEAL2}E6 0%, ${TEAL}88 50%, transparent 100%)` }} />
        <SeaRipples reduce={!!reduce} />
        <div className="absolute left-6 top-0 bottom-0 hidden sm:flex flex-col items-center justify-between py-10 z-20">
          <Shell className="w-6 h-6" color={CORAL2} />
          <motion.span initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.4 }} className="origin-top block w-px" style={{ height: 130, background: `linear-gradient(to bottom, ${CORAL}, transparent)` }} />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24 pt-32">
          <motion.p className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: CORAL2 }}
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>Undangan Pernikahan</motion.p>
          <motion.h1 className="font-display text-7xl md:text-8xl leading-[0.9] font-normal tracking-tight mt-4" style={{ color: WHITE }}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.5 }}>
            {p1.nick}<br /><span className="font-light italic" style={{ color: CORAL2 }}>&amp;</span> {p2.nick}
          </motion.h1>
          <motion.div className="flex flex-wrap items-end justify-between gap-6 mt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 0.75 }}>
            <div>
              <p className="font-display text-lg font-light italic" style={{ color: WHITE }}>{displayDate}</p>
              <p className="text-[10px] tracking-[0.3em] uppercase font-body font-medium mt-1" style={{ color: CORAL2 }}>{location}</p>
            </div>
            {guestName && (
              <div className="px-5 py-2.5 rounded-t-[80px] rounded-b-2xl" style={{ border: `1px solid ${WHITE}40`, backgroundColor: `${TEAL2}66` }}>
                <p className="text-[9px] uppercase tracking-[0.3em] font-body" style={{ color: `${WHITE}AA` }}>Kepada Yth.</p>
                <p className="font-display text-base font-normal mt-0.5" style={{ color: WHITE }}>{guestName}</p>
              </div>
            )}
          </motion.div>
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${WHITE}88` }}>Scroll</span>
        </motion.div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: WHITE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SeaRipples reduce={!!reduce} />
        <Coral className="absolute -left-6 -top-4 w-40 h-20" color={TEAL} opacity={0.08} />
        <Coral className="absolute -right-6 -bottom-4 w-40 h-20" color={TEAL} flip opacity={0.08} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="max-w-[180px] mx-auto mb-8"><Wave color={TEAL} /></div>
          <motion.p className="font-display text-2xl md:text-3xl leading-relaxed font-light italic" style={{ color: INK }} variants={vUp}>{quote.text}</motion.p>
          <div className="max-w-[180px] mx-auto mt-8"><Wave color={CORAL} /></div>
          <p className="font-display text-sm mt-5 italic" style={{ color: CORAL }}>{quote.source ? '— ' + quote.source : ''}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE — arched dome photos ═══ */}
      <motion.section className="relative overflow-hidden" style={{ backgroundColor: SAND }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vRise}>
        <div className="max-w-5xl mx-auto px-6 py-28 relative z-10">
          <div className="text-center mb-14">
            <WaveDivider color={TEAL} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-2" style={{ color: CORAL }}>Kedua Mempelai</p>
            <h2 className="font-display text-4xl md:text-5xl font-normal tracking-tight" style={{ color: TEAL }}>Dua Hati, Satu Samudra</h2>
            <p className="text-sm max-w-md mx-auto font-body leading-relaxed mt-4" style={{ color: MUTED }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-14 md:gap-20">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria' },
              { person: p2, img: media.p2, label: 'Mempelai Wanita' },
            ].map(({ person, img, label }, idx) => (
              <motion.div key={label} className="flex flex-col items-center group max-w-[300px]"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.18 }}>
                <div className="relative mb-6">
                  <motion.div className="absolute inset-0" style={{ border: `1px solid ${TEAL}44`, borderRadius: '140px 140px 24px 24px' }}
                    initial={{ scale: 0.7, opacity: 0 }} whileInView={{ scale: 1.12, opacity: 1 }} viewport={{ once: true }}
                    transition={{ duration: 1, delay: idx * 0.2, ease: EASE }} />
                  <div className="relative overflow-hidden" style={{ width: 220, height: 270, borderRadius: '130px 130px 20px 20px', border: `3px solid ${WHITE}`, boxShadow: `0 22px 50px -18px ${TEAL}66` }}>
                    <img src={img} alt={person.nick} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <motion.div className="absolute -bottom-3 left-1/2 -translate-x-1/2"
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.25, ease: EASE }}>
                    <Shell className="w-8 h-8" color={CORAL} />
                  </motion.div>
                </div>
                <h3 className="font-display text-2xl font-normal tracking-tight mb-1" style={{ color: INK }}>{person.full}</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] font-body font-semibold mb-2" style={{ color: CORAL }}>{label}</p>
                <p className="text-sm leading-relaxed mb-3 font-body px-2" style={{ color: `${INK}CC` }}>{person.desc}</p>
                <p className="text-xs font-body text-center" style={{ color: MUTED }}>
                  Putra/i dari:<br /><span className="font-semibold" style={{ color: TEAL }}>{person.father}</span><br />&amp; {person.mother}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN — wave-underlined tiles ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: TEAL }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <SeaRipples reduce={!!reduce} />
        <Coral className="absolute -bottom-4 -left-6 w-44 h-24" color={WHITE} flip opacity={0.1} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-3">
            <Shell className="w-7 h-7" color={CORAL2} />
            <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: `${WHITE}CC` }}>Menuju Hari Bahagia</p>
          </div>
          <h2 className="font-display text-4xl font-light tracking-tight mb-12" style={{ color: WHITE }}>Hitung Mundur</h2>
          <div className="grid grid-cols-4 gap-2 md:gap-5">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="flex flex-col items-center pb-3"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: idx * 0.1 }}>
                <motion.span className="font-display font-light block tabular-nums leading-none"
                  style={{ color: item.accent ? CORAL2 : WHITE, fontSize: 'clamp(2.5rem, 9vw, 5rem)' }}
                  key={item.val} initial={reduce ? false : { y: -14, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
                  {String(item.val).padStart(2, '0')}
                </motion.span>
                <span className="w-full block mt-2"><Wave color={item.accent ? CORAL2 : `${WHITE}66`} className="w-full h-3" /></span>
                <span className="text-[9px] uppercase tracking-[0.3em] font-body font-medium mt-2 block" style={{ color: `${WHITE}AA` }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-12">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold rounded-t-[100px] rounded-b-3xl transition-all duration-300 hover:scale-105"
              style={{ color: TEAL, backgroundColor: CORAL2 }}>
              <Calendar className="w-4 h-4" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY — coastal chapters ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: SAND2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vRise}>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <WaveDivider color={TEAL} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-2" style={{ color: CORAL }}>Perjalanan Cinta</p>
            <h2 className="font-display text-4xl font-light tracking-tight" style={{ color: TEAL }}>Cerita Kami</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, ${TEAL}44, ${TEAL}44, transparent)` }} />
            <div className="space-y-14">
              {stories.length > 0 && stories.map((story, idx) => {
                const left = idx % 2 === 0;
                return (
                  <motion.div key={idx} className="relative pl-12 md:pl-0"
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                    <div className="absolute left-4 md:left-1/2 top-1 -translate-x-1/2">
                      <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.15, ease: EASE }}>
                        <Shell className="w-6 h-6" color={CORAL} />
                      </motion.div>
                    </div>
                    <div className={`md:w-1/2 ${left ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                      <span className="font-display text-base italic" style={{ color: CORAL }}>{story.year}</span>
                      <h4 className="font-display text-2xl font-normal tracking-tight mb-2 mt-0.5" style={{ color: TEAL }}>{story.title}</h4>
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
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: WHITE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SeaRipples reduce={!!reduce} />
        <Coral className="absolute -right-8 bottom-0 w-48 h-24" color={TEAL} opacity={0.07} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <WaveDivider color={TEAL} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-2" style={{ color: CORAL }}>Informasi Acara</p>
            <h2 className="font-display text-4xl font-light tracking-tight" style={{ color: TEAL }}>Waktu &amp; Lokasi</h2>
          </div>
          <div className="flex justify-center gap-2.5 mb-10 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200 rounded-t-[80px] rounded-b-2xl"
                style={activeTab === idx
                  ? { backgroundColor: TEAL, color: WHITE }
                  : { color: MUTED, border: `1px solid ${TEAL}33`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="p-8 rounded-t-[60px] rounded-b-3xl transition-all duration-300" style={{ backgroundColor: SAND, boxShadow: `0 20px 50px -28px ${TEAL}55`, border: `1px solid ${TEAL}1F` }}
            key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
            <div className="flex items-start gap-3 mb-4">
              <Shell className="w-6 h-6 mt-1 flex-shrink-0" color={CORAL} />
              <h3 className="font-display text-2xl font-normal tracking-tight" style={{ color: TEAL }}>{activeEvt.title}</h3>
            </div>
            <div className="space-y-2.5 font-body text-sm ml-9" style={{ color: INK }}>
              <div className="flex items-center gap-2.5"><Clock className="w-4 h-4" style={{ color: CORAL }} /> {activeEvt.time}</div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: CORAL }} /> <span>{activeEvt.venue}<br />{activeEvt.address}</span></div>
            </div>
            {activeEvt.note && <p className="text-[11px] italic font-body mt-3 ml-9" style={{ color: MUTED }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 ml-9 px-5 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200 hover:gap-3 rounded-t-[80px] rounded-b-2xl"
                style={{ color: WHITE, backgroundColor: CORAL }}>
                <Map className="w-3.5 h-3.5" /> Buka Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY — coastal grid ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: SAND }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <WaveDivider color={TEAL} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-2" style={{ color: CORAL }}>Galeri Foto</p>
            <h2 className="font-display text-4xl font-light tracking-tight" style={{ color: TEAL }}>Kenangan Indah</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1', borderRadius: '100px 100px 12px 12px' } : { aspectRatio: '1', borderRadius: '40px 40px 8px 8px' }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.08 }}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${TEAL2}99, transparent 60%)` }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${TEAL2}F2`, backdropFilter: 'blur(6px)' }} onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 text-2xl font-light" style={{ color: WHITE }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2" style={{ color: WHITE }} aria-label="Sebelumnya"><ChevronLeft className="w-7 h-7" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2" style={{ color: WHITE }} aria-label="Berikutnya"><ChevronRight className="w-7 h-7" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden" style={{ borderRadius: '120px 120px 12px 12px' }} onClick={(e) => e.stopPropagation()}
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
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: WHITE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <SeaRipples reduce={!!reduce} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <WaveDivider color={TEAL} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-2" style={{ color: CORAL }}>Doa &amp; Ucapan</p>
            <h2 className="font-display text-4xl font-light tracking-tight" style={{ color: TEAL }}>Kirim Ucapan</h2>
          </div>

          {isSubmitted ? (
            <motion.div className="p-10 text-center rounded-t-[60px] rounded-b-3xl" style={{ backgroundColor: SAND, border: `1px solid ${TEAL}28` }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <Shell className="w-10 h-10 mx-auto mb-4" color={CORAL} />
              <p className="font-display text-base font-medium" style={{ color: TEAL }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="p-7 space-y-4 rounded-t-[60px] rounded-b-3xl" style={{ backgroundColor: SAND, boxShadow: `0 20px 50px -28px ${TEAL}55`, border: `1px solid ${TEAL}1F` }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm font-body outline-none transition-colors bg-transparent border-b"
                  style={{ color: INK, borderColor: `${TEAL}33` }}
                  onFocus={(e) => e.target.style.borderColor = CORAL} onBlur={(e) => e.target.style.borderColor = `${TEAL}33`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-2 py-2.5 text-sm font-body outline-none bg-transparent border-b" style={{ color: INK, borderColor: `${TEAL}33` }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-4 py-2.5 text-sm font-body outline-none transition-colors resize-none h-24 bg-transparent border-b rounded-t-[40px] rounded-b-2xl"
                style={{ color: INK, borderColor: `${TEAL}33` }}
                onFocus={(e) => e.target.style.borderColor = CORAL} onBlur={(e) => e.target.style.borderColor = `${TEAL}33`} />
              <button type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold rounded-t-[100px] rounded-b-3xl transition-all duration-300 hover:scale-105"
                style={{ color: WHITE, backgroundColor: TEAL }}>
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
                <div key={w.id} className="p-4 rounded-t-[40px] rounded-b-2xl" style={{ backgroundColor: SAND, border: `1px solid ${TEAL}1F` }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-base font-medium" style={{ color: TEAL }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1 font-body font-semibold" style={{ color: CORAL }}>{w.attendance === 'Hadir' ? 'Aman, Hadir' : 'Maaf, Tidak Hadir'}</p>
                  <p className="text-sm leading-relaxed font-body" style={{ color: `${INK}CC` }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: SAND2 }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <Coral className="absolute -top-4 -left-6 w-40 h-20" color={TEAL} opacity={0.08} />
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="text-center mb-10">
              <WaveDivider color={TEAL} />
              <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-2" style={{ color: CORAL }}>Tanda Kasih</p>
              <h2 className="font-display text-4xl font-light tracking-tight" style={{ color: TEAL }}>Kado Digital</h2>
              <p className="text-sm max-w-md mx-auto font-body leading-relaxed mt-4" style={{ color: MUTED }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-7 rounded-t-[60px] rounded-b-3xl" style={{ backgroundColor: WHITE, border: `1px solid ${TEAL}1F`, boxShadow: `0 18px 40px -22px ${TEAL}44` }}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shell className="w-5 h-5" color={CORAL} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: CORAL }}>{g.bank}</p>
                  </div>
                  <p className="font-display text-xl font-medium tabular-nums my-2" style={{ color: TEAL }}>{g.number}</p>
                  <p className="text-xs font-body mb-4" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.2em] transition-all hover:gap-2.5"
                    style={{ color: CORAL }}>
                    {copiedIdx === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="relative px-6 py-32 text-center overflow-hidden" style={{ backgroundColor: TEAL2 }}>
        <WaveLayers className="absolute top-0 left-0 right-0 h-12 rotate-180" color={WHITE} />
        <SeaRipples reduce={!!reduce} />
        <Coral className="absolute left-1/2 -translate-x-1/2 -bottom-12 w-56 h-28" color={WHITE} opacity={0.06} />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="flex justify-center mb-10" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <Shell className="w-12 h-12" color={CORAL2} />
          </motion.div>
          <motion.h2 className="font-display text-3xl md:text-4xl font-light italic leading-snug tracking-tight max-w-xl mx-auto" style={{ color: WHITE }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </motion.h2>
          <motion.div className="max-w-[180px] mx-auto my-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_SWELL }}>
            <Wave color={CORAL2} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body" style={{ color: CORAL2 }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl font-normal tracking-tight mt-3" style={{ color: WHITE }}>{p1.nick} <span className="font-light italic" style={{ color: CORAL2 }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-[0.3em] font-body mt-2" style={{ color: `${WHITE}77` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t mt-16 pt-8 text-center" style={{ borderColor: `${WHITE}11` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${WHITE}44` }}>© 2027 {p1.nick} &amp; {p2.nick}. Laut Series.</p>
        </div>
      </footer>
    </div>
  );
}
