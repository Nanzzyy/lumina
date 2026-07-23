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
const EASE: [number, number, number, number] = [0.22, 0.9, 0.36, 1];
const EASE_VELVET: [number, number, number, number] = [0.5, 0, 0.2, 1];
const DUR = 1.1;

/* Variant library — velvet fade, slow bloom, soft 1–1.3s ease-out. */
const vUp: Variants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vBloom: Variants = { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.3, ease: EASE_VELVET } } };
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Cinta" (Love) — Burgundy Wine Romance ───
   Velvety deep wine + ivory, soft blush, champagne gold hairlines.
   Distinct from Kaze (ink/vermillion), Liana (sage), Flora (peach). */
const WINE = '#5E1A2B';
const WINE2 = '#7A2438';
const BLUSH = '#E3A8A8';
const BLUSH2 = '#F0C8C8';
const CHAMPAGNE = '#D4B26A';
const IVORY = '#FBF5EC';
const IVORY2 = '#F3E8D8';
const INK = '#3A1520';
const MUTED = '#9A7078';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Bagas', full: 'Bagas Aditya Pratama, S.Ked.', father: 'Bpk. Dr. Tri Pratama, M.Sc.', mother: 'Ibu Sari Wulandari', ig: '@bagasadit', desc: 'Percaya bahwa cinta sejati tak ditakdirkan tumbuh dalam semalam — ia dirawat, dijaga, dan dipupuk setiap harinya.' },
    p2: { nick: 'Kirana', full: 'Kirana Ayu Lestari, S.Si.', father: 'Bpk. Ir. Hadi Lestari', mother: 'Ibu Maharani Anggraini', ig: '@kiranaayu', ig2: '', desc: 'Pencinta senja yang meyakini cinta yang paling dalam adalah cinta yang tetap memilih, apa pun yang terjadi.' },
  },
  date: '2027-02-14T16:00:00',
  quote: { text: 'Cinta bukan sekadar detak yang serempak, melainkan janji yang dipelihara — dua jiwa yang memilih satu sama lain, hari demi hari, dalam suka dan duka, selamanya.', source: 'Sebuah janji' },
  events: [
    { title: 'Akad Nikah', time: '09:00 - 11:00 WIB', venue: 'Ballroom Château d\'Amour', address: 'Jl. Mawar Merah No. 14, Bogor', mapsUrl: 'https://maps.google.com', note: 'Khidmat dan sakral, khusus keluarga inti dan kerabat dekat' },
    { title: 'Resepsi', time: '16:00 - 21:00 WIB', venue: 'Taman Anggrek Vinolia', address: 'Jl. Anggrek Vinolia Raya, Bogor', mapsUrl: 'https://maps.google.com', note: 'Terbuka untuk seluruh tamu undangan' },
  ],
  stories: [
    { year: '2021', title: 'Pandangan Pertama', desc: 'Sebuah reuni kampus yang tidak sengaja — dua gelas kopi yang hampir jatuh, sebuah permintaan maaf yang berujung percakapan tanpa henti hingga malam. Cinta belum tahu namanya, tetapi ia sudah hadir.' },
    { year: '2024', title: 'Janji yang Dalam', desc: 'Tiga tahun berjalan bersama melewati musim, cobaan, dan tawa. Di suatu senja di tepi pantai, sebuah cincin dan satu pertanyaan yang menjanjikan selamanya.' },
    { year: '2027', title: 'Selamanya Milikmu', desc: 'Dengan restu kedua keluarga, kami menyerahkan janji di hadapan Tuhan. Bukan akhir, melainkan awal dari cinta yang akan terus mekar di setiap musim kami.' },
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
    { bank: 'Bank Mandiri', number: '1180023491820', owner: 'Bagas Aditya Pratama' },
    { bank: 'Bank BCA', number: '0359871120', owner: 'Kirana Ayu Lestari' },
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
  const displayDate = displayDateFrom(isoDate, 'Minggu, 14 Februari 2027');
  const location = content.event?.location || 'Bogor';
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
  if (typeof window === 'undefined' || document.getElementById('cinta-inv')) return;
  const s = document.createElement('style');
  s.id = 'cinta-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lora:wght@400;500;600&display=swap');
.font-display { font-family: 'EB Garamond', 'Georgia', serif; }
.font-body { font-family: 'Lora', 'Georgia', serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: roses, wine swirls, hearts, petals ─── */

/** Single-line rose stem — line-art flanking headings. */
function RoseLine({ className = 'w-24 h-10', color = WINE, flip = false }: { className?: string; color?: string; flip?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M4 36 C18 30 28 22 32 12 C34 6 40 4 44 8" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
      <path d="M44 8 C48 4 54 4 56 9 C58 14 54 18 49 17 C44 16 42 11 44 8 Z" stroke={color} strokeWidth="1.1" fill="none" />
      <path d="M16 32 C12 34 9 38 12 40 C15 41 18 39 18 36" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M24 26 C20 28 17 32 20 34 C23 35 26 33 26 30" stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
    </svg>
  );
}

/** Curl wine swirl divider. */
function WineSwirl({ className = 'w-full h-4', color = CHAMPAGNE }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 8 C40 2 70 14 110 8 C140 3 168 13 200 7 C220 4 232 6 238 8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.85" fill="none" />
      <circle cx="238" cy="8" r="2.2" fill={color} opacity="0.85" />
      <circle cx="2" cy="8" r="2.2" fill={color} opacity="0.85" />
    </svg>
  );
}

/** Small heart with a short stem — HeartSprig. */
function HeartSprig({ className = 'w-6 h-6', color = WINE }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M50 60 C44 56 30 46 30 34 C30 26 38 24 43 30 C47 34 50 38 50 38 C50 38 53 34 57 30 C62 24 70 26 70 34 C70 46 56 56 50 60 Z" fill={color} />
      <path d="M50 60 L50 92" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <path d="M50 70 L40 64 M50 78 L60 72" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/** Romantic divider — thin gold lines + center swirl + sprig. */
function VelvetDivider({ color = CHAMPAGNE }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-7">
      <span className="h-px w-16" style={{ background: `linear-gradient(to left, ${color}, transparent)` }} />
      <HeartSprig className="w-5 h-5" color={color === CHAMPAGNE ? WINE : color} />
      <span className="h-px w-16" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
    </div>
  );
}

/** Decorative arched rose-frame corner ornament. */
function CornerRose({ className = 'w-40 h-40', color = WINE, opacity = 0.12 }: { className?: string; color?: string; opacity?: number }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ opacity }}>
      <path d="M100 18 C72 36 52 58 38 88 C26 116 30 150 50 172 L50 150 C50 128 58 110 74 96 C66 116 64 138 72 158 L72 178 C92 168 110 152 120 130 C132 104 132 72 120 48 C112 32 100 22 100 18 Z" fill={color} />
      <path d="M100 30 C90 50 86 72 90 96" stroke="#fff" strokeWidth="1.4" opacity="0.3" />
    </svg>
  );
}

/** Falling rose petals — signature ambient motion. */
function PetalFall({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const petals = [
    { left: '8%', size: 14, rot: -14, delay: 0, dur: 11 },
    { left: '22%', size: 11, rot: 22, delay: 1.6, dur: 13 },
    { left: '42%', size: 16, rot: -6, delay: 0.9, dur: 12 },
    { left: '62%', size: 12, rot: 28, delay: 2.3, dur: 14 },
    { left: '78%', size: 15, rot: -24, delay: 1.2, dur: 11.5 },
    { left: '90%', size: 10, rot: 16, delay: 0.4, dur: 12.5 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((p, i) => (
        <motion.span key={i} className="absolute top-0"
          style={{ left: p.left, width: p.size, height: p.size, borderRadius: `${p.size}px 0 ${p.size}px 0`, background: i % 2 ? BLUSH : BLUSH2, opacity: 0.55, rotate: `${p.rot}deg` }}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: ['0vh', '110vh'], opacity: [0, 0.7, 0.7, 0], rotate: [p.rot, p.rot + 80, p.rot + 160] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

/** Outlined roman numeral — section marker. */
function RomanNo({ n }: { n: string }) {
  return (
    <span className="font-display font-light leading-none tracking-widest" style={{ color: CHAMPAGNE, fontSize: '1.6rem' }} aria-hidden="true">{n}</span>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanCinta({ content, slug, preview }: MonolithicTemplateProps) {
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
        style={{ background: `linear-gradient(165deg, ${WINE} 0%, ${WINE2} 50%, ${WINE} 100%)` }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(${BLUSH} 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
        <CornerRose className="absolute -top-8 -left-8 w-52 h-52" color={BLUSH} opacity={0.14} />
        <CornerRose className="absolute -bottom-8 -right-8 w-60 h-60 rotate-180" color={BLUSH} opacity={0.12} />
        {!reduce && (
          <motion.div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 35%, ${BLUSH}22 0%, transparent 60%)` }}
            animate={{ opacity: [0.35, 0.7, 0.35] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        )}
        <div className="absolute inset-4 pointer-events-none z-10" style={{ border: `1px solid ${CHAMPAGNE}33`, borderRadius: '24px' }} />

        <motion.div className="pt-12 z-20 flex items-center gap-3" variants={stagI} initial="hidden" animate="visible">
          <RoseLine className="w-20 h-7" color={CHAMPAGNE} />
          <HeartSprig className="w-5 h-5" color={BLUSH} />
          <RoseLine className="w-20 h-7" color={CHAMPAGNE} flip />
        </motion.div>

        <motion.div className="my-auto z-20 px-6 max-w-sm w-full text-center space-y-6"
          variants={stagC} initial="hidden" animate="visible">
          <motion.p variants={stagI} className="text-[10px] uppercase tracking-[0.45em] font-body font-medium" style={{ color: CHAMPAGNE }}>The Wedding of</motion.p>
          <motion.h1 variants={stagI} className="font-display text-6xl leading-[1.02] font-medium tracking-tight" style={{ color: IVORY }}>
            {p1.nick}
            <span className="block font-display italic font-normal text-3xl my-1" style={{ color: BLUSH }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.div variants={stagI} className="max-w-[180px] mx-auto"><WineSwirl color={CHAMPAGNE} /></motion.div>
          <motion.p variants={stagI} className="font-display text-sm font-light italic" style={{ color: `${BLUSH2}DD` }}>{displayDate}</motion.p>
          <motion.div variants={stagI} className="space-y-2 pt-1">
            <p className="text-[10px] uppercase tracking-[0.4em] font-body" style={{ color: `${BLUSH}AA` }}>Kepada Yth.</p>
            <div className="inline-block px-7 py-2.5" style={{ border: `1px solid ${CHAMPAGNE}40`, backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <p className="font-display text-base font-medium tracking-wide" style={{ color: IVORY }}>{guestName}</p>
            </div>
          </motion.div>
          <motion.div variants={stagI} className="pt-1">
            <button onClick={open}
              className="group relative px-11 py-3.5 text-xs uppercase tracking-[0.35em] font-body font-semibold transition-all duration-300 overflow-hidden"
              style={{ color: WINE, backgroundColor: CHAMPAGNE }}>
              <span className="relative z-10 flex items-center gap-2"><Heart className="w-3.5 h-3.5" /> Buka Undangan</span>
              <motion.span className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent, ${IVORY}99, transparent)`, backgroundSize: '200% 100%' }}
                initial={{ backgroundPosition: '-200% center' }} animate={reduce ? {} : { backgroundPosition: '200% center' }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }} />
            </button>
          </motion.div>
        </motion.div>
        <p className="text-[7px] tracking-[0.4em] uppercase mb-6 z-20 font-body" style={{ color: `${BLUSH}77` }}>#{p1.nick}{p2.nick}Cinta</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: IVORY, color: INK }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-200 hover:scale-110 rounded-full"
        style={{ backgroundColor: `${WINE}E6`, backdropFilter: 'blur(8px)', border: `1px solid ${CHAMPAGNE}55` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: IVORY }} /> : <VolumeX className="w-5 h-5" style={{ color: `${BLUSH}AA`, opacity: 0.7 }} />}
      </button>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: WINE }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1.04, 1, 1.04] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-55" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-55" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(130deg, ${WINE}E6 0%, ${WINE}88 45%, transparent 85%)` }} />
        <PetalFall reduce={!!reduce} />
        <CornerRose className="absolute top-4 right-4 w-32 h-32 rotate-90" color={BLUSH} opacity={0.16} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-20 pt-32 text-center">
          <motion.div className="flex items-center justify-center gap-3 mb-7"
            initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.25 }}>
            <RoseLine className="w-24 h-8" color={CHAMPAGNE} />
            <span className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: CHAMPAGNE }}>Undangan Pernikahan</span>
            <RoseLine className="w-24 h-8" color={CHAMPAGNE} flip />
          </motion.div>
          <motion.h1 className="font-display text-7xl md:text-8xl leading-[0.95] font-medium tracking-tight" style={{ color: IVORY }}
            initial={{ opacity: 0, y: 38 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.45 }}>
            {p1.nick}<br /><span className="font-light italic" style={{ color: BLUSH }}>&amp;</span> {p2.nick}
          </motion.h1>
          <motion.div className="max-w-[200px] mx-auto my-7"
            initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 1, ease: EASE_VELVET, delay: 0.7 }}>
            <WineSwirl color={CHAMPAGNE} />
          </motion.div>
          <motion.div className="flex flex-col items-center gap-1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 0.8 }}>
            <p className="font-display text-lg font-light italic" style={{ color: IVORY }}>{displayDate}</p>
            <p className="text-[10px] tracking-[0.4em] uppercase font-body font-medium" style={{ color: BLUSH2 }}>{location}</p>
          </motion.div>
          {guestName && (
            <motion.div className="mt-8 inline-block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 1 }}>
              <div className="px-6 py-2.5" style={{ border: `1px solid ${CHAMPAGNE}44`, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <p className="text-[9px] uppercase tracking-[0.3em] font-body" style={{ color: `${BLUSH}AA` }}>Kepada Yth.</p>
                <p className="font-display text-base font-medium mt-0.5" style={{ color: IVORY }}>{guestName}</p>
              </div>
            </motion.div>
          )}
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}>
          <span className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${BLUSH}99` }}>Scroll</span>
        </motion.div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <PetalFall reduce={!!reduce} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <VelvetDivider color={CHAMPAGNE} />
          <p className="font-display text-6xl leading-none font-light mb-2" style={{ color: `${BLUSH}88` }}>&ldquo;</p>
          <motion.p className="font-display text-2xl md:text-3xl leading-relaxed font-light italic" style={{ color: INK }} variants={vUp}>{quote.text}</motion.p>
          <p className="font-display text-6xl mt-2 leading-none font-light" style={{ color: `${BLUSH}88` }}>&rdquo;</p>
          <div className="max-w-[160px] mx-auto my-6"><WineSwirl color={WINE} /></div>
          <p className="font-display text-sm tracking-wide" style={{ color: WINE }}>— {quote.source}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE — arched/oval portraits with champagne ring ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: IVORY2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <CornerRose className="absolute top-0 right-0 w-48 h-48 rotate-90" color={WINE} opacity={0.08} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <VelvetDivider color={WINE} />
          <p className="text-[10px] uppercase tracking-[0.4em] font-body font-medium mb-2" style={{ color: CHAMPAGNE }}>Kedua Mempelai</p>
          <h2 className="font-display text-4xl font-light tracking-tight mb-3" style={{ color: WINE }}>Dengan Cinta &amp; Restu</h2>
          <p className="text-sm max-w-md mx-auto mb-16 font-body leading-relaxed" style={{ color: MUTED }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-14 md:gap-20">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria' },
              { person: p2, img: media.p2, label: 'Mempelai Wanita' },
            ].map(({ person, img, label }, idx) => (
              <motion.div key={label} className="flex flex-col items-center group max-w-[300px]"
                initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE, delay: idx * 0.2 }}>
                <div className="relative mb-6">
                  {/* champagne accent ring */}
                  <motion.div className="absolute inset-0"
                    style={{ border: `1.5px solid ${CHAMPAGNE}`, borderRadius: '50% 50% 48% 48% / 62% 62% 40% 40%' }}
                    initial={{ scale: 0.7, opacity: 0 }} whileInView={{ scale: 1.12, opacity: 1 }} viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: idx * 0.22, ease: EASE }} />
                  <div className="relative overflow-hidden group" style={{ width: 210, height: 250, borderRadius: '50% 50% 48% 48% / 62% 62% 40% 40%', border: `3px solid ${CHAMPAGNE}`, boxShadow: `0 24px 50px -18px ${WINE}77` }}>
                    <img src={img} alt={person.nick} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <motion.div className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: idx * 0.28, ease: EASE }}>
                    <HeartSprig className="w-7 h-7" color={WINE} />
                  </motion.div>
                </div>
                <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-1" style={{ color: CHAMPAGNE }}>{label}</p>
                <h3 className="font-display text-2xl font-medium tracking-tight mb-2" style={{ color: INK }}>{person.full}</h3>
                <p className="text-sm leading-relaxed mb-3 font-body px-2" style={{ color: MUTED }}>{person.desc}</p>
                <div className="flex items-center gap-3">
                  <span className="block w-7 h-px" style={{ background: CHAMPAGNE }} />
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider font-body" style={{ color: MUTED }}>Putra/i dari</p>
                    <p className="text-xs font-body font-semibold mt-0.5" style={{ color: WINE }}>{person.father}</p>
                    <p className="text-xs font-body" style={{ color: MUTED }}>&amp; {person.mother}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN — wine tiles, champagne numerals ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: WINE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vBloom}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(${BLUSH} 1px, transparent 1px)`, backgroundSize: '26px 26px' }} />
        <CornerRose className="absolute -bottom-8 -left-8 w-52 h-52" color={BLUSH} opacity={0.12} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <VelvetDivider color={CHAMPAGNE} />
          <p className="text-[10px] uppercase tracking-[0.4em] font-body font-medium mb-2" style={{ color: BLUSH }}>Menuju Hari Bahagia</p>
          <h2 className="font-display text-3xl font-light tracking-tight mb-10" style={{ color: IVORY }}>Hitung Mundur</h2>
          <div className="grid grid-cols-4 gap-3 md:gap-5">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="relative flex flex-col items-center py-6 px-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${CHAMPAGNE}33`, borderRadius: '12px' }}
                initial={{ opacity: 0, scale: 0.88 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: idx * 0.12 }}>
                <motion.span className="font-display font-light block tabular-nums leading-none"
                  style={{ color: item.accent ? CHAMPAGNE : IVORY, fontSize: 'clamp(2.2rem, 8vw, 4rem)' }}
                  key={item.val} initial={reduce ? false : { y: -12, opacity: 0.35 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
                  {String(item.val).padStart(2, '0')}
                </motion.span>
                <span className="text-[9px] uppercase tracking-[0.3em] font-body font-medium mt-2 block" style={{ color: `${BLUSH}AA` }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-12">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-9 py-3.5 text-xs uppercase tracking-[0.35em] font-body font-semibold transition-all duration-300 hover:tracking-[0.4em]"
              style={{ color: WINE, backgroundColor: CHAMPAGNE }}>
              <Calendar className="w-4 h-4" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <PetalFall reduce={!!reduce} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <VelvetDivider color={WINE} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-medium" style={{ color: CHAMPAGNE }}>Perjalanan Cinta</p>
            <h2 className="font-display text-4xl font-light tracking-tight mt-1" style={{ color: WINE }}>Cerita Kami</h2>
          </div>
          <div className="relative">
            {/* center vine */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, ${CHAMPAGNE}66, ${CHAMPAGNE}66, transparent)` }} />
            <div className="space-y-14">
              {stories.length > 0 && stories.map((story, idx) => {
                const left = idx % 2 === 0;
                return (
                  <motion.div key={idx} className="relative pl-12 md:pl-0"
                    initial={{ opacity: 0, x: left ? -26 : 26 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                    <div className="absolute left-4 md:left-1/2 top-1 -translate-x-1/2">
                      <motion.div initial={{ scale: 0, rotate: -30 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: idx * 0.18, ease: EASE }}>
                        <HeartSprig className="w-5 h-5" color={WINE} />
                      </motion.div>
                    </div>
                    <div className={`md:w-1/2 ${left ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                      <span className="font-display text-sm italic tracking-wide" style={{ color: CHAMPAGNE }}>{story.year}</span>
                      <h4 className="font-display text-2xl font-medium tracking-tight mb-2 mt-1" style={{ color: INK }}>{story.title}</h4>
                      <p className="text-sm leading-relaxed font-body" style={{ color: MUTED }}>{story.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: WINE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <CornerRose className="absolute -right-8 bottom-0 w-52 h-52" color={BLUSH} opacity={0.1} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <VelvetDivider color={CHAMPAGNE} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-medium" style={{ color: BLUSH }}>Informasi Acara</p>
            <h2 className="font-display text-4xl font-light tracking-tight mt-1" style={{ color: IVORY }}>Waktu &amp; Lokasi</h2>
          </div>
          <div className="flex justify-center gap-3 mb-9 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200 rounded-full"
                style={activeTab === idx
                  ? { backgroundColor: CHAMPAGNE, color: WINE }
                  : { color: `${BLUSH}AA`, border: `1px solid ${CHAMPAGNE}33`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="p-8" style={{ backgroundColor: `${WINE2}`, border: `1px solid ${CHAMPAGNE}33`, borderRadius: '20px', boxShadow: `0 22px 60px -28px ${INK}88` }}
            key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className="flex items-start gap-3 mb-4">
              <HeartSprig className="w-5 h-5 flex-shrink-0" color={CHAMPAGNE} />
              <h3 className="font-display text-2xl font-medium tracking-tight" style={{ color: IVORY }}>{activeEvt.title}</h3>
            </div>
            <div className="space-y-2.5 font-body text-sm ml-8" style={{ color: `${BLUSH2}CC` }}>
              <div className="flex items-center gap-2.5"><Clock className="w-4 h-4" style={{ color: CHAMPAGNE }} /> {activeEvt.time}</div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: CHAMPAGNE }} /> <span>{activeEvt.venue}<br />{activeEvt.address}</span></div>
            </div>
            {activeEvt.note && <p className="text-[11px] italic font-body ml-8 mt-3" style={{ color: `${BLUSH}99` }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 ml-8 px-5 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] rounded-full transition-all duration-200 hover:gap-3"
                style={{ color: WINE, backgroundColor: CHAMPAGNE }}>
                <Map className="w-3.5 h-3.5" /> Buka Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: IVORY }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vBloom}>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <VelvetDivider color={WINE} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-medium" style={{ color: CHAMPAGNE }}>Galeri Foto</p>
            <h2 className="font-display text-4xl font-light tracking-tight mt-1" style={{ color: WINE }}>Kenangan Indah</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1', borderRadius: '16px' } : { aspectRatio: '1', borderRadius: '12px' }}
                initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.09 }}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${WINE}99, transparent 60%)`, borderRadius: 'inherit' }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${WINE}F2`, backdropFilter: 'blur(6px)' }} onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full" style={{ color: IVORY, backgroundColor: 'rgba(255,255,255,0.1)' }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2 rounded-full" style={{ color: IVORY, backgroundColor: 'rgba(255,255,255,0.1)' }} aria-label="Sebelumnya"><ChevronLeft className="w-6 h-6" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2 rounded-full" style={{ color: IVORY, backgroundColor: 'rgba(255,255,255,0.1)' }} aria-label="Berikutnya"><ChevronRight className="w-6 h-6" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}
            style={{ border: `1px solid ${CHAMPAGNE}55`, borderRadius: '16px' }}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[85vh] max-w-full rounded-2xl" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain rounded-2xl" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 8. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: IVORY2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <VelvetDivider color={WINE} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-medium" style={{ color: CHAMPAGNE }}>Doa &amp; Ucapan</p>
            <h2 className="font-display text-4xl font-light tracking-tight mt-1" style={{ color: WINE }}>Kirim Ucapan</h2>
          </div>

          {isSubmitted ? (
            <motion.div className="p-10 text-center rounded-2xl" style={{ backgroundColor: IVORY, border: `1px solid ${CHAMPAGNE}44`, boxShadow: `0 20px 50px -28px ${WINE}55` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <HeartSprig className="w-9 h-9 mx-auto mb-3" color={WINE} />
              <p className="font-display text-base font-medium tracking-wide" style={{ color: WINE }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="p-7 space-y-4 rounded-2xl" style={{ backgroundColor: IVORY, boxShadow: `0 20px 50px -28px ${WINE}55`, border: `1px solid ${CHAMPAGNE}33` }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm font-body outline-none transition-colors rounded-full"
                  style={{ backgroundColor: IVORY2, color: INK, border: `1px solid ${CHAMPAGNE}33` }}
                  onFocus={(e) => e.target.style.borderColor = WINE} onBlur={(e) => e.target.style.borderColor = `${CHAMPAGNE}33`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-4 py-3 text-sm font-body outline-none transition-colors rounded-full"
                  style={{ backgroundColor: IVORY2, color: INK, border: `1px solid ${CHAMPAGNE}33` }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-4 py-3 text-sm font-body outline-none transition-colors resize-none h-24 rounded-2xl"
                style={{ backgroundColor: IVORY2, color: INK, border: `1px solid ${CHAMPAGNE}33` }}
                onFocus={(e) => e.target.style.borderColor = WINE} onBlur={(e) => e.target.style.borderColor = `${CHAMPAGNE}33`} />
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold rounded-full transition-all duration-300 hover:tracking-[0.35em]"
                style={{ color: IVORY, backgroundColor: WINE }}>
                <Send className="w-4 h-4" /> Kirim Ucapan
              </button>
            </form>
          )}

          {content.guestbook?.enabled !== false && wishes.length === 0 && (
            <p className="text-center text-sm font-body italic mt-8" style={{ color: MUTED }}>Belum ada ucapan — jadilah yang pertama mengirim doa restu.</p>
          )}

          {content.guestbook?.enabled !== false && wishes.length > 0 && (
            <div className="mt-9 space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {wishes.slice(0, 20).map((w) => (
                <div key={w.id} className="p-4 rounded-2xl" style={{ backgroundColor: IVORY, border: `1px solid ${CHAMPAGNE}28` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-display text-base font-medium" style={{ color: WINE }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1.5 font-body font-semibold" style={{ color: CHAMPAGNE }}>
                    {w.attendance === 'Hadir' ? '♥ Hadir' : '✕ Tidak Hadir'}
                  </p>
                  <p className="text-sm leading-relaxed font-body" style={{ color: MUTED }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: IVORY }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <PetalFall reduce={!!reduce} />
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <VelvetDivider color={WINE} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-medium" style={{ color: CHAMPAGNE }}>Tanda Kasih</p>
            <h2 className="font-display text-4xl font-light tracking-tight mt-1 mb-4" style={{ color: WINE }}>Kado Digital</h2>
            <p className="text-sm max-w-md mx-auto font-body leading-relaxed mb-10" style={{ color: MUTED }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-7 rounded-2xl transition-all" style={{ backgroundColor: IVORY2, border: `1px solid ${CHAMPAGNE}33` }}
                  initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.12 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4" style={{ color: WINE }} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: WINE }}>{g.bank}</p>
                  </div>
                  <div className="w-7 my-2" style={{ height: 1, backgroundColor: `${CHAMPAGNE}66` }} />
                  <p className="font-display text-xl font-medium tabular-nums my-2" style={{ color: INK }}>{g.number}</p>
                  <p className="text-xs font-body mb-4" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.2em] transition-all hover:gap-2.5"
                    style={{ color: WINE }}>
                    {copiedIdx === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="relative px-6 py-32 text-center overflow-hidden"
        style={{ background: `linear-gradient(165deg, ${WINE} 0%, ${WINE2} 50%, ${WINE} 100%)` }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(${BLUSH} 1px, transparent 1px)`, backgroundSize: '26px 26px' }} />
        <CornerRose className="absolute -top-8 -right-8 w-52 h-52 rotate-90" color={BLUSH} opacity={0.12} />
        <CornerRose className="absolute -bottom-8 -left-8 w-52 h-52 -rotate-90" color={BLUSH} opacity={0.12} />
        <PetalFall reduce={!!reduce} />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="flex justify-center items-center gap-3 mb-10" initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <RoseLine className="w-20 h-7" color={CHAMPAGNE} />
            <HeartSprig className="w-7 h-7" color={BLUSH} />
            <RoseLine className="w-20 h-7" color={CHAMPAGNE} flip />
          </motion.div>
          <motion.h2 className="font-display text-3xl md:text-4xl font-light italic leading-snug tracking-tight max-w-xl mx-auto" style={{ color: IVORY }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </motion.h2>
          <motion.div className="max-w-[180px] mx-auto my-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE_VELVET }}>
            <WineSwirl color={CHAMPAGNE} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body" style={{ color: CHAMPAGNE }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl font-medium tracking-tight mt-3" style={{ color: IVORY }}>{p1.nick} <span className="font-light italic" style={{ color: BLUSH }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-[0.3em] font-body mt-2" style={{ color: `${BLUSH}99` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t mt-16 pt-8 text-center" style={{ borderColor: `${IVORY}11` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${BLUSH}66` }}>© 2027 {p1.nick} &amp; {p2.nick}. Cinta Series.</p>
        </div>
      </footer>
    </div>
  );
}
