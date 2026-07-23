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
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const EASE_GLOW: [number, number, number, number] = [0.4, 0, 0.2, 1];
const DUR = 1.1;

/* Variant library — slow fade from dark, glow throbs; Hutan's enchanted character. */
const vUp: Variants = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.4, ease: 'easeOut' } } };
const vGlow: Variants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: DUR, ease: EASE_GLOW } } };
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.16, delayChildren: 0.12 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Hutan" (Forest) — Moody Enchanted Twilight ───
   Deep forest dark with AMBER firefly glow, moss & copper. Glowing-in-the-dark-woods. */
const FOREST = '#16261A';
const FOREST2 = '#1F3322';
const COPPER = '#B06A3A';
const COPPER2 = '#C8854F';
const AMBER = '#E6A23C';
const MOSS = '#6B7F4A';
const MOSS2 = '#8A9D63';
const MIST = '#D8DDC8';
const INK = '#0F1A11';
const MUTED = '#7A8A6E';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Senna', full: 'Senna Mahardika Wibawa, S.Hut.', father: 'Bpk. Dr. Wibawa Surya, M.Sc.', mother: 'Ibu Ratu Padma Sari', ig: '@sennamahardika', desc: 'Penjaga hutan yang meyakini setiap pohon menyimpan doa, dan setiap cahaya di gelap adalah jalan pulang.' },
    p2: { nick: 'Laras', full: 'Larasati Cahaya Munthe, S.Ds.', father: 'Bpk. Archipelago Munthe', mother: 'Ibu Indah Permatasari', ig: '@larascahaya', desc: 'Perancang cahaya yang menemukan keajaiban dalam senja — tempat bayang berjumpa dengan cahaya terakhir.' },
  },
  date: '2027-08-21T16:00:00',
  quote: { text: 'Di tengah hutan yang paling gelap pun, selalu ada cahaya yang bersinar. Begitulah cinta — api kecil yang menuntun dua hati menembus malam, menuju pagi yang sama.', source: 'Sebuah janji di senja hutan' },
  events: [
    { title: 'Akad Nikah', time: '16:00 - 17:30 WIB', venue: 'Kapel Kayu Pinus Kuno', address: 'Jl. Hutan Larangan Hijau, Lembah Sutera', mapsUrl: 'https://maps.google.com', note: 'Khidmat di bawah naungan pohon-pohon tua, khusus keluarga inti' },
    { title: 'Resepsi Malam', time: '19:00 - 22:00 WIB', venue: 'Taman Cahaya Senja', address: 'Jl. Clearing Alkimia, Lembah Sutera', mapsUrl: 'https://maps.google.com', note: 'Makan malam di batha bintang dan kunang-kunang, terbuka untuk seluruh tamu' },
  ],
  stories: [
    { year: '2021', title: 'Cahaya Pertama', desc: 'Tersesat di hutan pinus saat senja, Senna menyalakan senter ke arah pohon keliru. Cahaya itu jatuh tepat pada Laras yang sedang memotret kunang-kunang. Di gelap, sebuah cerita menyala.' },
    { year: '2024', title: 'Berakar dalam Bayang', desc: 'Tiga musim berjalan bersama menyusuri jejak rusa dan suara sungai. Cinta yang tumbuh pelan seperti akar bawah tanah — tak terlihat, tapi tak tergoyahkan oleh badai.' },
    { year: '2026', title: 'Janji di Glade', desc: 'Di sebuah clearing tempat mereka pertama berjumpa, di kelilingi ratusan kunang-kunang, Senna berlutut. Hutan menjadi saksi, dan malam itu menyala selamanya.' },
  ],
  gallery: [
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&q=80&w=800',
  ],
  gifts: [
    { bank: 'Bank Mandiri', number: '1350024987710', owner: 'Senna Mahardika Wibawa' },
    { bank: 'Bank BCA', number: '0612994408', owner: 'Larasati Cahaya Munthe' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  cover: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1600',
  hero: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1600',
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
  const location = content.event?.location || 'Lembah Sutera';
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
  if (typeof window === 'undefined' || document.getElementById('hutan-inv')) return;
  const s = document.createElement('style');
  s.id = 'hutan-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Prata&family=Manrope:wght@300;400;500;600;700&display=swap');
.font-display { font-family: 'Prata', 'Times New Roman', serif; }
.font-body { font-family: 'Manrope', system-ui, sans-serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: fireflies & pine ─── */

/** Single glowing firefly dot with radial amber halo. */
function Firefly({ size = 6, color = AMBER, className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <span
      className={`inline-block rounded-full pointer-events-none ${className}`}
      style={{ width: size, height: size, backgroundColor: color, boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}88, 0 0 ${size * 8}px ${color}44` }}
      aria-hidden="true"
    />
  );
}

/** Pine sprig — central stem with paired needle fronds. Used as divider/corner accent. */
function PineSprig({ className = 'w-24 h-10', color = MOSS2 }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 20 C40 20 80 20 116 20" stroke={color} strokeWidth="1.1" opacity="0.55" />
      {[12, 30, 48, 66, 84, 102].map((x, i) => (
        <g key={i} opacity={0.9 - i * 0.06}>
          {[-1, 1].map((dir) => (
            <g key={dir}>
              <line x1={x} y1={20} x2={x + dir * 9} y2={9} stroke={color} strokeWidth="1.4" strokeLinecap="round" />
              <line x1={x} y1={20} x2={x + dir * 11} y2={14} stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
              <line x1={x} y1={20} x2={x + dir * 9} y2={31} stroke={color} strokeWidth="1.4" strokeLinecap="round" />
              <line x1={x} y1={20} x2={x + dir * 11} y2={26} stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

/** Small pinecone — stacked scale rows. */
function Pinecone({ className = 'w-7 h-10', color = COPPER }: { className?: string; color?: string }) {
  const scales = [0, 1, 2, 3, 4];
  return (
    <svg className={className} viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M15 2 C8 6 4 16 6 28 C7 36 11 42 15 42 C19 42 23 36 24 28 C26 16 22 6 15 2 Z" fill={color} opacity="0.4" />
      {scales.map((r) => (
        <g key={r}>
          {[-1, 1].map((d) => (
            <path key={d} d={`M15 ${10 + r * 6} Q ${15 + d * 7} ${13 + r * 6} ${15 + d * 3} ${16 + r * 6}`} fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
          ))}
          <path d={`M15 ${10 + r * 6} L15 ${16 + r * 6}`} stroke={color} strokeWidth="0.8" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

/** Botanical divider — glow line + center pine sprig + firefly. */
function PineDivider({ color = MOSS2 }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-7">
      <span className="h-px w-14" style={{ background: `linear-gradient(to left, ${color}88, transparent)` }} />
      <PineSprig className="w-16 h-6" color={color} />
      <Firefly size={4} />
      <span className="h-px w-14" style={{ background: `linear-gradient(to right, ${color}88, transparent)` }} />
    </div>
  );
}

/** Ambient scattered fireflies — pulsing glow, the signature motion of the enchanted woods. */
function Fireflies({ reduce, count = 14 }: { reduce: boolean; count?: number }) {
  if (reduce) return null;
  const spots = Array.from({ length: count }, (_, i) => ({
    top: `${(i * 37) % 95}%`,
    left: `${(i * 53 + 7) % 96}%`,
    size: 3 + ((i * 7) % 5),
    delay: (i % 6) * 0.6,
    dur: 2 + ((i * 3) % 3),
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {spots.map((f, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ top: f.top, left: f.left, width: f.size, height: f.size, backgroundColor: AMBER, boxShadow: `0 0 ${f.size * 3}px ${AMBER}, 0 0 ${f.size * 6}px ${AMBER}88` }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.95, 0.25, 0.9, 0], scale: [0.4, 1.2, 0.7, 1.15, 0.4] }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanHutan({ content, slug, preview }: MonolithicTemplateProps) {
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: FOREST }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(${MOSS2} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
        {/* twilight glow well */}
        {!reduce && (
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 40%, ${AMBER}1F 0%, transparent 55%)` }}
            animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        )}
        <Fireflies reduce={!!reduce} count={18} />
        {/* vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, transparent 40%, ${INK}CC 100%)` }} />
        {/* pine frame top/bottom */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20"><PineSprig className="w-32 h-10" color={MOSS2} /></div>
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 rotate-180"><PineSprig className="w-32 h-10" color={MOSS2} /></div>

        <motion.div className="px-6 max-w-sm w-full text-center relative z-30" variants={stagC} initial="hidden" animate="visible">
          <motion.div variants={stagI} className="flex justify-center mb-6">
            <motion.div animate={reduce ? {} : { scale: [1, 1.12, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <Firefly size={8} />
            </motion.div>
          </motion.div>
          <motion.p variants={stagI} className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: AMBER }}>The Wedding of</motion.p>
          <motion.h1 variants={stagI} className="font-display text-6xl leading-[0.95] tracking-tight mt-4" style={{ color: MIST, textShadow: `0 0 40px ${AMBER}44` }}>
            {p1.nick}
            <span className="block font-body font-light text-2xl my-2 italic" style={{ color: AMBER }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.p variants={stagI} className="font-display text-sm font-light italic mt-5" style={{ color: `${MOSS2}CC` }}>{displayDate}</motion.p>
          <motion.div variants={stagI} className="mt-9 space-y-2">
            <p className="text-[9px] uppercase tracking-[0.4em] font-body" style={{ color: MUTED }}>Kepada Yth.</p>
            <p className="font-display text-lg font-normal" style={{ color: MIST }}>{guestName}</p>
          </motion.div>
          <motion.div variants={stagI} className="mt-9">
            <button onClick={open}
              className="group relative px-12 py-4 text-xs uppercase tracking-[0.35em] font-body font-semibold transition-all duration-500 overflow-hidden rounded-full"
              style={{ color: INK, backgroundColor: AMBER, boxShadow: `0 0 30px ${AMBER}55` }}>
              <span className="relative z-10 flex items-center gap-2.5"><Heart className="w-3.5 h-3.5" /> Buka Undangan</span>
              <motion.span className="absolute inset-0 rounded-full"
                style={{ background: `linear-gradient(to right, transparent, ${MIST}66, transparent)`, backgroundSize: '200% 100%' }}
                initial={{ backgroundPosition: '-200% center' }} animate={reduce ? {} : { backgroundPosition: '200% center' }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }} />
            </button>
          </motion.div>
        </motion.div>
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[7px] tracking-[0.5em] uppercase z-30 font-body" style={{ color: `${MOSS}88` }}>#{p1.nick}{p2.nick}Hutan</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: FOREST, color: MIST }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-300 hover:scale-110 rounded-full"
        style={{ backgroundColor: INK, border: `1px solid ${AMBER}55`, boxShadow: isPlaying ? `0 0 20px ${AMBER}66` : 'none' }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: AMBER }} /> : <VolumeX className="w-5 h-5" style={{ color: `${MOSS2}99` }} />}
      </button>

      {/* ═══ 1. HERO — twilight woods, glow well ═══ */}
      <section className="relative min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: FOREST }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1.04, 1, 1.04] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-45" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-45" />}
        </motion.div>
        {/* darkening + amber glow from below horizon */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${INK}F2 0%, ${FOREST}AA 40%, ${FOREST2}CC 70%, ${INK}E6 100%)` }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 85%, ${AMBER}33 0%, transparent 50%)` }} />
        <Fireflies reduce={!!reduce} count={16} />
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10"><PineSprig className="w-28 h-9" color={MOSS2} /></div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20 pt-32">
          <motion.p className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: AMBER }}
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>Undangan Pernikahan</motion.p>
          <motion.h1 className="font-display text-7xl md:text-8xl leading-[0.9] tracking-tight mt-4" style={{ color: MIST, textShadow: `0 0 60px ${AMBER}44` }}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.45 }}>
            {p1.nick}<br /><span className="font-light italic" style={{ color: AMBER }}>&amp;</span> {p2.nick}
          </motion.h1>
          <motion.div className="flex flex-wrap items-end justify-between gap-6 mt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 0.7 }}>
            <div>
              <p className="font-display text-lg font-light italic" style={{ color: MIST }}>{displayDate}</p>
              <p className="text-[10px] tracking-[0.3em] uppercase font-body font-medium mt-1" style={{ color: AMBER }}>{location}</p>
            </div>
            {guestName && (
              <div className="px-5 py-2.5 rounded-full" style={{ border: `1px solid ${AMBER}44`, backgroundColor: `${INK}88` }}>
                <p className="text-[9px] uppercase tracking-[0.3em] font-body" style={{ color: `${MOSS2}AA` }}>Kepada Yth.</p>
                <p className="font-display text-base font-normal mt-0.5" style={{ color: MIST }}>{guestName}</p>
              </div>
            )}
          </motion.div>
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${MOSS2}88` }}>Scroll</span>
          <motion.div className="mt-2" animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
            <Firefly size={5} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: FOREST2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <Fireflies reduce={!!reduce} count={10} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="max-w-[180px] mx-auto mb-8"><PineDivider color={MOSS2} /></div>
          <motion.p variants={vUp} className="font-display text-xl md:text-2xl leading-relaxed font-light italic" style={{ color: MIST }}>{quote.text}</motion.p>
          <div className="max-w-[180px] mx-auto mt-8"><PineDivider color={MOSS2} /></div>
          <p className="font-display text-sm mt-5 tracking-wide italic" style={{ color: AMBER }}>— {quote.source}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE — framed photos with AMBER glow ring ═══ */}
      <motion.section className="relative overflow-hidden" style={{ backgroundColor: FOREST }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <Fireflies reduce={!!reduce} count={12} />
        <div className="max-w-5xl mx-auto px-6 py-28 relative z-10">
          <div className="text-center mb-16">
            <PineDivider color={MOSS2} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: AMBER }}>Kedua Mempelai</p>
            <h2 className="font-display text-4xl md:text-5xl font-normal tracking-tight mt-3" style={{ color: MIST }}>Dua Cahaya, Satu Hutan</h2>
            <p className="text-sm max-w-md mx-auto font-body leading-relaxed mt-4" style={{ color: `${MOSS2}AA` }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>
          </div>

          <div className="space-y-20">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria', flip: false },
              { person: p2, img: media.p2, label: 'Mempelai Wanita', flip: true },
            ].map(({ person, img, label, flip }, idx) => (
              <motion.div key={label} className={`grid md:grid-cols-2 gap-8 items-center ${flip ? 'md:[&>*:first-child]:order-2' : ''}`}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                <motion.div className="relative overflow-hidden" style={{ aspectRatio: '4/5', border: `1px solid ${AMBER}33`, boxShadow: `0 0 40px ${AMBER}55, 0 20px 50px -20px ${INK}` }}
                  variants={vGlow}>
                  <img src={img} alt={person.nick} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${FOREST}99, transparent 55%)` }} />
                  {/* glow ring throbs */}
                  {!reduce && (
                    <motion.div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 40px ${AMBER}33` }}
                      animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.5 }} />
                  )}
                </motion.div>
                <div className={flip ? 'md:text-left md:pl-4' : 'md:text-right md:pr-4'}>
                  <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-3" style={{ color: AMBER }}>{label}</p>
                  <h3 className="font-display text-3xl font-normal tracking-tight mb-3" style={{ color: MIST }}>{person.full}</h3>
                  <p className="text-sm leading-relaxed font-body mb-4" style={{ color: `${MOSS2}AA` }}>{person.desc}</p>
                  <div className={`flex items-center gap-3 ${flip ? '' : 'md:justify-end'}`}>
                    <span className="block w-8 h-px" style={{ background: AMBER }} />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-body" style={{ color: MUTED }}>Putra/i dari</p>
                      <p className="text-xs font-body font-medium mt-0.5" style={{ color: MIST }}>{person.father}</p>
                      <p className="text-xs font-body" style={{ color: `${MOSS2}AA` }}>&amp; {person.mother}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN — glowing AMBER numerals ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: INK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <Fireflies reduce={!!reduce} count={14} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${AMBER}11 0%, transparent 60%)` }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <PineDivider color={MOSS2} />
          <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-3" style={{ color: AMBER }}>Menuju Hari Bahagia</p>
          <h2 className="font-display text-3xl font-normal tracking-tight mb-12" style={{ color: MIST }}>Menunggu Senja Itu</h2>
          <div className="grid grid-cols-4 gap-2 md:gap-6">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="relative"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE, delay: idx * 0.1 }}>
                <motion.span className="font-display font-normal block tabular-nums leading-none"
                  style={{ color: item.accent ? AMBER : MIST, fontSize: 'clamp(2.5rem, 9vw, 5rem)', textShadow: `0 0 24px ${item.accent ? AMBER : AMBER}77` }}
                  key={item.val} initial={reduce ? false : { y: -16, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
                  {String(item.val).padStart(2, '0')}
                </motion.span>
                <span className="text-[9px] uppercase tracking-[0.3em] font-body font-medium mt-3 block" style={{ color: MUTED }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-12">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300 hover:tracking-[0.4em] rounded-full"
              style={{ color: INK, backgroundColor: AMBER, boxShadow: `0 0 24px ${AMBER}55` }}>
              <Calendar className="w-4 h-4" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY — glowing waypoints ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: FOREST2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <Fireflies reduce={!!reduce} count={10} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <PineDivider color={MOSS2} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: AMBER }}>Perjalanan Cinta</p>
            <h2 className="font-display text-4xl font-normal tracking-tight mt-3" style={{ color: MIST }}>Jejak di Hutan</h2>
          </div>
          <div className="relative">
            {/* glowing trail */}
            <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, transparent, ${AMBER}55, ${AMBER}55, transparent)` }} />
            <div className="space-y-14">
              {stories.length > 0 && stories.map((story, idx) => (
                <motion.div key={idx} className="relative pl-14"
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                  {/* waypoint firefly */}
                  <div className="absolute left-0 top-1 -translate-x-1/2">
                    <motion.div animate={reduce ? {} : { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.4 }}>
                      <Firefly size={6} />
                    </motion.div>
                  </div>
                  <span className="font-body text-xs tracking-[0.3em] uppercase font-semibold" style={{ color: AMBER }}>{story.year}</span>
                  <h4 className="font-display text-2xl font-normal tracking-tight mt-1 mb-2" style={{ color: MIST }}>{story.title}</h4>
                  <p className="text-sm leading-relaxed font-body max-w-lg" style={{ color: `${MOSS2}AA` }}>{story.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: FOREST }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <Fireflies reduce={!!reduce} count={12} />
        <div className="absolute -right-6 -bottom-6 opacity-[0.18]"><Pinecone className="w-20 h-28" color={COPPER} /></div>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <PineDivider color={MOSS2} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: AMBER }}>Informasi Acara</p>
            <h2 className="font-display text-4xl font-normal tracking-tight mt-3" style={{ color: MIST }}>Waktu &amp; Lokasi</h2>
          </div>
          <div className="flex gap-3 mb-10 flex-wrap justify-center">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200 rounded-full"
                style={activeTab === idx
                  ? { backgroundColor: AMBER, color: INK, boxShadow: `0 0 20px ${AMBER}55` }
                  : { color: `${MOSS2}AA`, border: `1px solid ${AMBER}33`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="border-l-2 pl-8 py-2" style={{ borderColor: AMBER }}
            key={activeTab} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <h3 className="font-display text-2xl font-normal tracking-tight mb-4" style={{ color: MIST }}>{activeEvt.title}</h3>
            <div className="space-y-2.5 font-body text-sm" style={{ color: `${MOSS2}CC` }}>
              <div className="flex items-center gap-2.5"><Clock className="w-4 h-4" style={{ color: AMBER }} /> {activeEvt.time}</div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: AMBER }} /> <span>{activeEvt.venue}<br />{activeEvt.address}</span></div>
            </div>
            {activeEvt.note && <p className="text-[11px] italic font-body mt-3" style={{ color: MUTED }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200 hover:gap-3 rounded-full"
                style={{ color: INK, backgroundColor: AMBER }}>
                <Map className="w-3.5 h-3.5" /> Buka Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY — glowing grid ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: INK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <Fireflies reduce={!!reduce} count={12} />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <PineDivider color={MOSS2} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: AMBER }}>Galeri Foto</p>
            <h2 className="font-display text-4xl font-normal tracking-tight mt-3" style={{ color: MIST }}>Sekilas Cahaya</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1', border: `1px solid ${AMBER}33`, boxShadow: `0 0 30px ${AMBER}33` } : { aspectRatio: '1', border: `1px solid ${MOSS}33` }}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.08 }}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${INK}CC, transparent 60%)` }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${INK}F2`, backdropFilter: 'blur(6px)' }} onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 text-2xl font-light" style={{ color: MIST }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2" style={{ color: AMBER }} aria-label="Sebelumnya"><ChevronLeft className="w-7 h-7" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2" style={{ color: AMBER }} aria-label="Berikutnya"><ChevronRight className="w-7 h-7" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}
            style={{ border: `1px solid ${AMBER}33`, boxShadow: `0 0 50px ${AMBER}44` }}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[85vh] max-w-full" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 8. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: FOREST2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <Fireflies reduce={!!reduce} count={10} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <PineDivider color={MOSS2} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: AMBER }}>Doa &amp; Ucapan</p>
            <h2 className="font-display text-4xl font-normal tracking-tight mt-3" style={{ color: MIST }}>Kirim Ucapan</h2>
          </div>

          {isSubmitted ? (
            <motion.div className="p-10 text-center border-l-2 rounded-r-2xl" style={{ borderColor: AMBER, backgroundColor: `${INK}88` }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <div className="flex justify-center mb-4">
                <motion.div animate={reduce ? {} : { scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                  <Firefly size={10} />
                </motion.div>
              </div>
              <p className="font-display text-base font-normal" style={{ color: MIST }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4 border-l-2 pl-8" style={{ borderColor: AMBER }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-0 py-3 text-sm font-body outline-none transition-colors bg-transparent border-b"
                  style={{ color: MIST, borderColor: MOSS }}
                  onFocus={(e) => e.target.style.borderColor = AMBER} onBlur={(e) => e.target.style.borderColor = MOSS} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-0 py-3 text-sm font-body outline-none bg-transparent border-b" style={{ color: MIST, borderColor: MOSS }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-0 py-3 text-sm font-body outline-none transition-colors resize-none h-24 bg-transparent border-b"
                style={{ color: MIST, borderColor: MOSS }}
                onFocus={(e) => e.target.style.borderColor = AMBER} onBlur={(e) => e.target.style.borderColor = MOSS} />
              <button type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300 rounded-full"
                style={{ color: INK, backgroundColor: AMBER, boxShadow: `0 0 24px ${AMBER}55` }}>
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
                <div key={w.id} className="pl-5 border-l" style={{ borderColor: `${AMBER}55` }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-base font-normal" style={{ color: MIST }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1 font-body font-semibold" style={{ color: AMBER }}>{w.attendance === 'Hadir' ? '✓ Hadir' : '✕ Tidak Hadir'}</p>
                  <p className="text-sm leading-relaxed font-body" style={{ color: `${MOSS2}AA` }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: FOREST }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <Fireflies reduce={!!reduce} count={10} />
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="text-center mb-10">
              <PineDivider color={MOSS2} />
              <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: AMBER }}>Tanda Kasih</p>
              <h2 className="font-display text-4xl font-normal tracking-tight mt-3" style={{ color: MIST }}>Kado Digital</h2>
              <p className="text-sm max-w-md mx-auto font-body leading-relaxed mt-4" style={{ color: `${MOSS2}AA` }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-7 border rounded-2xl" style={{ backgroundColor: INK, borderColor: `${AMBER}33`, boxShadow: `0 0 30px ${AMBER}22` }}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4" style={{ color: AMBER }} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: AMBER }}>{g.bank}</p>
                  </div>
                  <p className="font-display text-xl font-normal tabular-nums my-2" style={{ color: MIST }}>{g.number}</p>
                  <p className="text-xs font-body mb-4" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.2em] transition-all hover:gap-2.5"
                    style={{ color: AMBER }}>
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
        <Fireflies reduce={!!reduce} count={18} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${AMBER}14 0%, transparent 60%)` }} />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10"><PineSprig className="w-28 h-9" color={MOSS2} /></div>
        <div className="max-w-2xl mx-auto relative z-10 pt-10">
          <motion.div className="flex justify-center mb-10" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <motion.div animate={reduce ? {} : { scale: [1, 1.25, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <Firefly size={10} />
            </motion.div>
          </motion.div>
          <motion.h2 className="font-display text-3xl md:text-4xl font-light italic leading-snug tracking-tight max-w-xl mx-auto" style={{ color: MIST, textShadow: `0 0 40px ${AMBER}33` }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </motion.h2>
          <motion.div className="max-w-[160px] mx-auto my-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE_GLOW }}>
            <PineDivider color={MOSS2} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body" style={{ color: AMBER }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl font-normal tracking-tight mt-3" style={{ color: MIST }}>{p1.nick} <span className="font-light italic" style={{ color: AMBER }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-[0.3em] font-body mt-2" style={{ color: `${MOSS2}88` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t mt-16 pt-8 text-center" style={{ borderColor: `${MOSS2}11` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${MOSS}66` }}>© 2027 {p1.nick} &amp; {p2.nick}. Hutan Series.</p>
        </div>
      </footer>
    </div>
  );
}
