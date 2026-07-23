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
const EASE: [number, number, number, number] = [0.33, 1, 0.68, 1];
const EASE_GUST: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const DUR = 1.05;
const DUR_SLOW = 1.2;

/* Variant library — gentle, slow fade-up + crystalline grow. Varied per section. */
const vUp: Variants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: DUR_SLOW, ease: 'easeOut' } } };
const vCrystal: Variants = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: DUR, ease: EASE } } };
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Yuki" 雪 (Snow) — Winter Crystal ───
   Crystalline frosty elegant-cool. Ice backgrounds, slate ink, frost + lavender accents.
   Distinct from Kaze (ink/bone/vermillion), Liana (sage/cream/clay). */
const ICE = '#EEF4F8';
const ICE2 = '#DCE7F0';
const FROST = '#9EC2DC';
const SLATE = '#2B3A4A';
const SLATE2 = '#445566';
const SILVER = '#B8C8D8';
const LAVENDER = '#B8AEDC';
const MUTED = '#7C8A99';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Rangga', full: 'Rangga Mahendra Wibowo, S.T.', father: 'Bpk. Ir. Mahendra Wibowo', mother: 'Ibu Saraswati Anggraini', ig: '@ranggamahendra', desc: 'Percaya bahwa cinta sejati turun pelan seperti salju — sunyi di luar, namun hangat saat menyentuh hati.' },
    p2: { nick: 'Sekar', full: 'Sekar Ayu Larasati, S.Ds.', father: 'Bpk. Drs. Bayu Larasati', mother: 'Ibu Dyah Pranadjaja', ig: '@sekarlarasati', desc: 'Pencinta keheningan yang menemukan keindahan dalam setiap kristal — murni, jernih, dan abadi.' },
  },
  date: '2027-07-10T08:00:00',
  quote: { text: 'Cinta yang paling dalam turun dalam keheningan, bagai salju pertama yang menyelimuti tanah — tak bersuara, namun mengubah seluruh dunia menjadi putih yang murni.', source: 'Sebuah harapan' },
  events: [
    { title: 'Akad Nikah', time: '08:00 - 10:00 WIB', venue: 'Crystal Pavilion Ballroom', address: 'Jl. Setiabudi No. 17, Bandung', mapsUrl: 'https://maps.google.com', note: 'Khidmat dan sakral, khusus keluarga inti dan kerabat dekat' },
    { title: 'Resepsi', time: '11:00 - 15:00 WIB', venue: 'Taman Es Semerbak', address: 'Jl. Cihampelas No. 108, Bandung', mapsUrl: 'https://maps.google.com', note: 'Terbuka untuk seluruh tamu undangan' },
  ],
  stories: [
    { year: '2022', title: 'Salju Pertama', desc: 'Berjumpa di sebuah pondok pegunungan saat salju pertama turun. Rangga berbagi selimut dengan Sekar yang sedari tadi memandang jendela. Sejak itu, dua hati mulai berdering dalam keheningan yang sama.' },
    { year: '2024', title: 'Seperti Danu yang Tenang', desc: 'Dua tahun berbagi musim dingin dan musim bunga. Cinta yang mula-mula sunyi kini mengendap jernih bagai danu yang memantulkan langit — tenang, dalam, tak lagi bergelombang.' },
    { year: '2026', title: 'Selamanya', desc: 'Dengan restu kedua keluarga, janji dikukuhkan. Seperti kristal yang tak akan mencair, kami mengikat janji untuk tetap murni — selamanya, sepanjang musim yang akan datang.' },
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
    { bank: 'Bank Mandiri', number: '1180023491820', owner: 'Rangga Mahendra Wibowo' },
    { bank: 'Bank BCA', number: '0359871120', owner: 'Sekar Ayu Larasati' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
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
  const displayDate = displayDateFrom(isoDate, 'Sabtu, 10 Juli 2027');
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
  if (typeof window === 'undefined' || document.getElementById('yuki-inv')) return;
  const s = document.createElement('style');
  s.id = 'yuki-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600;700&display=swap');
.font-display { font-family: 'Spectral', serif; }
.font-body { font-family: 'Manrope', sans-serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: snow + crystal ─── */

/** Six-point symmetric snowflake — thin crystalline lines. */
function Snowflake({ className = 'w-6 h-6', color = FROST, strokeWidth = 1 }: { className?: string; color?: string; strokeWidth?: number }) {
  const arms = [0, 60, 120, 180, 240, 300];
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
        {arms.map((deg) => (
          <g key={deg} transform={`rotate(${deg} 50 50)`}>
            <line x1="50" y1="50" x2="50" y2="6" />
            <line x1="50" y1="20" x2="40" y2="11" />
            <line x1="50" y1="20" x2="60" y2="11" />
            <line x1="50" y1="33" x2="42" y2="26" />
            <line x1="50" y1="33" x2="58" y2="26" />
            <line x1="50" y1="6" x2="45" y2="13" />
            <line x1="50" y1="6" x2="55" y2="13" />
          </g>
        ))}
      </g>
      <polygon points="50,41 58,45.5 58,54.5 50,59 42,54.5 42,45.5" fill="none" stroke={color} strokeWidth={strokeWidth} opacity="0.85" />
    </svg>
  );
}

/** Jagged crystal-edged horizontal divider. */
function FrostEdge({ className = 'w-full h-3', color = FROST }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 8 L22 3 L38 10 L58 4 L78 11 L98 5 L118 10 L138 3 L158 11 L178 4 L198 10 L218 4 L238 8"
        stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <path d="M58 4 L62 1 L66 4 M138 3 L142 0 L146 3 M98 5 L102 8 L106 5"
        stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Faceted gem (crystal) — diamond-shaped outline with inner facet lines. */
function Crystal({ className = 'w-6 h-6', color = FROST }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="24,3 41,19 24,45 7,19" stroke={color} strokeWidth="1" fill="none" />
      <line x1="7" y1="19" x2="41" y2="19" stroke={color} strokeWidth="0.8" opacity="0.7" />
      <line x1="24" y1="3" x2="24" y2="19" stroke={color} strokeWidth="0.6" opacity="0.5" />
      <line x1="24" y1="19" x2="24" y2="45" stroke={color} strokeWidth="0.6" opacity="0.5" />
      <polygon points="24,3 31,19 24,19 17,19" stroke={color} strokeWidth="0.5" fill="none" opacity="0.45" />
    </svg>
  );
}

/** Botanical-style divider — thin frost lines + center snowflake. */
function FrostDivider({ color = FROST }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-4 my-7">
      <span className="h-px w-16" style={{ background: `linear-gradient(to left, ${color}, transparent)` }} />
      <Snowflake className="w-5 h-5" color={color} strokeWidth={0.9} />
      <span className="h-px w-16" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
    </div>
  );
}

/** Drifting + falling snow ambient motion — signature of Yuki. */
function FallingSnow({ reduce }: { reduce: boolean }) {
  const flakes = [
    { left: '6%', size: 20, delay: 0, dur: 16, sway: 20 },
    { left: '18%', size: 12, delay: 3.5, dur: 20, sway: 12 },
    { left: '32%', size: 24, delay: 1.5, dur: 18, sway: 24 },
    { left: '46%', size: 14, delay: 5, dur: 22, sway: 14 },
    { left: '60%', size: 18, delay: 0.8, dur: 17, sway: 18 },
    { left: '74%', size: 22, delay: 2.8, dur: 19, sway: 22 },
    { left: '88%', size: 12, delay: 4.5, dur: 21, sway: 12 },
  ];
  if (reduce) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {flakes.map((f, i) => (
        <motion.div key={i} className="absolute top-0"
          style={{ left: f.left, width: f.size, height: f.size }}
          initial={{ y: '-10vh', x: 0, opacity: 0 }}
          animate={{ y: '110vh', x: [0, f.sway, 0, -f.sway, 0], opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'linear' }}>
          <Snowflake className="w-full h-full" color={i % 2 ? FROST : SILVER} strokeWidth={0.7} />
        </motion.div>
      ))}
    </div>
  );
}

/** Outlined crystal numeral — section marker with frost underline. */
function CrystalNo({ n }: { n: string }) {
  return (
    <span className="font-display font-light leading-none" style={{ color: LAVENDER, fontSize: '3rem', WebkitTextStroke: `1px ${LAVENDER}`, WebkitTextFillColor: 'transparent' }} aria-hidden="true">
      {n}
    </span>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanYuki({ content, slug, preview }: MonolithicTemplateProps) {
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: ICE }}>
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: `radial-gradient(${FROST}33 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
        <div className="absolute inset-5 pointer-events-none z-10" style={{ border: `1px solid ${FROST}55` }} />
        <FallingSnow reduce={!!reduce} />

        {/* corner snowflakes */}
        <Snowflake className="absolute top-8 left-8 w-10 h-10 z-20" color={FROST} strokeWidth={0.8} />
        <Snowflake className="absolute top-8 right-8 w-10 h-10 z-20" color={FROST} strokeWidth={0.8} />
        <Snowflake className="absolute bottom-8 left-8 w-10 h-10 z-20" color={FROST} strokeWidth={0.8} />
        <Snowflake className="absolute bottom-8 right-8 w-10 h-10 z-20" color={FROST} strokeWidth={0.8} />

        <motion.div className="relative z-20 px-6 max-w-md w-full text-center"
          variants={stagC} initial="hidden" animate="visible">
          <motion.div variants={stagI} className="flex justify-center mb-7">
            <motion.div animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
              <Snowflake className="w-14 h-14" color={LAVENDER} strokeWidth={0.9} />
            </motion.div>
          </motion.div>
          <motion.p variants={stagI} className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: LAVENDER }}>The Wedding of</motion.p>
          <motion.h1 variants={stagI} className="font-display text-6xl leading-[1.0] font-light tracking-tight mt-4" style={{ color: SLATE }}>
            {p1.nick}
            <span className="block font-display italic text-2xl my-2" style={{ color: LAVENDER }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.div variants={stagI} className="max-w-[220px] mx-auto mt-6"><FrostEdge color={FROST} /></motion.div>
          <motion.p variants={stagI} className="font-display text-sm font-light mt-5 italic" style={{ color: SLATE2 }}>{displayDate}</motion.p>
          <motion.div variants={stagI} className="mt-9 space-y-2">
            <p className="text-[9px] uppercase tracking-[0.4em] font-body" style={{ color: MUTED }}>Kepada Yth.</p>
            <p className="font-display text-lg font-medium" style={{ color: SLATE }}>{guestName}</p>
          </motion.div>
          <motion.div variants={stagI} className="mt-9">
            <button onClick={open}
              className="group relative px-12 py-4 text-xs uppercase tracking-[0.35em] font-body font-semibold transition-all duration-500 overflow-hidden"
              style={{ color: ICE, backgroundColor: SLATE, border: `1px solid ${FROST}` }}>
              <span className="relative z-10 flex items-center gap-2.5"><Heart className="w-3.5 h-3.5" /> Buka Undangan</span>
              <motion.span className="absolute inset-0 origin-center" style={{ backgroundColor: LAVENDER }}
                initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.45, ease: EASE }} />
            </button>
          </motion.div>
        </motion.div>
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[7px] tracking-[0.5em] uppercase z-20 font-body" style={{ color: MUTED }}>#{p1.nick}{p2.nick}Yuki</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: ICE, color: SLATE }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-300 hover:scale-110"
        style={{ backgroundColor: SLATE, border: `1px solid ${FROST}` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: ICE }} /> : <VolumeX className="w-5 h-5" style={{ color: ICE, opacity: 0.6 }} />}
      </button>

      {/* ═══ 1. HERO — full-bleed media, frost overlay ═══ */}
      <section className="relative min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: SLATE }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1.04, 1, 1.04] }} transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-55" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-55" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${SLATE}E0 0%, ${SLATE}66 45%, ${SLATE}99 100%)` }} />
        <FallingSnow reduce={!!reduce} />
        <motion.div className="absolute right-8 top-10" animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}>
          <Snowflake className="w-24 h-24" color={ICE} strokeWidth={0.4} />
        </motion.div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20 pt-32">
          <motion.p className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: LAVENDER }}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>Undangan Pernikahan</motion.p>
          <motion.h1 className="font-display text-7xl md:text-8xl leading-[0.92] font-light tracking-tight mt-4" style={{ color: ICE }}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.45 }}>
            {p1.nick}<br /><span className="font-display italic" style={{ color: LAVENDER }}>&amp;</span> {p2.nick}
          </motion.h1>
          <motion.div className="flex flex-wrap items-end justify-between gap-6 mt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 0.7 }}>
            <div>
              <p className="font-display text-lg font-light italic" style={{ color: ICE }}>{displayDate}</p>
              <p className="text-[10px] tracking-[0.3em] uppercase font-body font-medium mt-1" style={{ color: LAVENDER }}>{location}</p>
            </div>
            {guestName && (
              <div className="px-5 py-2.5" style={{ border: `1px solid ${FROST}55`, backgroundColor: `${SLATE}33` }}>
                <p className="text-[9px] uppercase tracking-[0.3em] font-body" style={{ color: `${ICE}99` }}>Kepada Yth.</p>
                <p className="font-display text-base font-medium mt-0.5" style={{ color: ICE }}>{guestName}</p>
              </div>
            )}
          </motion.div>
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}>
          <span className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${ICE}66` }}>Scroll</span>
          <Snowflake className="w-3 h-3" color={FROST} strokeWidth={0.8} />
        </motion.div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: ICE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <FallingSnow reduce={!!reduce} />
        <motion.div className="absolute -left-12 -top-8" animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}>
          <Snowflake className="w-56 h-56" color={FROST} strokeWidth={0.35} />
        </motion.div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <FrostDivider color={LAVENDER} />
          <motion.p className="font-display text-2xl md:text-3xl leading-relaxed font-light italic" style={{ color: SLATE }} variants={vUp}>{quote.text}</motion.p>
          <FrostDivider color={FROST} />
          <p className="font-display text-sm mt-5 tracking-wide" style={{ color: LAVENDER }}>— {quote.source}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE — diamond framed photos ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: ICE2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <FrostDivider color={LAVENDER} />
          <h2 className="font-display text-3xl md:text-4xl font-light tracking-tight mb-3" style={{ color: SLATE }}>Dua Hati, Satu Kristal</h2>
          <p className="text-sm max-w-md mx-auto font-body leading-relaxed mb-16" style={{ color: SLATE2 }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-14 md:gap-20">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria' },
              { person: p2, img: media.p2, label: 'Mempelai Wanita' },
            ].map(({ person, img, label }, idx) => (
              <motion.div key={label} className="flex flex-col items-center max-w-[280px]"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.18 }}>
                <div className="relative mb-7" style={{ width: 200, height: 200 }}>
                  {/* outer frost halo (rotated) */}
                  <motion.div className="absolute" style={{ inset: -16, transform: 'rotate(45deg)', border: `1px solid ${FROST}55` }}
                    initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
                    transition={{ duration: 1, delay: idx * 0.2, ease: EASE }} />
                  <motion.div className="absolute" style={{ inset: -8, transform: 'rotate(45deg)', border: `1px solid ${LAVENDER}44` }}
                    initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
                    transition={{ duration: 1, delay: idx * 0.25 + 0.1, ease: EASE }} />
                  {/* diamond frame */}
                  <div className="absolute inset-0 overflow-hidden" style={{ transform: 'rotate(45deg)', border: `2px solid ${ICE}`, boxShadow: `0 20px 50px -18px ${SLATE}66`, backgroundColor: ICE }}>
                    <img src={img} alt={person.nick} className="w-full h-full object-cover" style={{ transform: 'rotate(-45deg) scale(1.42)' }} />
                  </div>
                  {/* crystal accent at tip */}
                  <motion.div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10"
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.3, ease: EASE }}>
                    <Crystal className="w-7 h-7" color={LAVENDER} />
                  </motion.div>
                </div>
                <h3 className="font-display text-xl font-medium tracking-tight mb-1" style={{ color: SLATE }}>{person.full}</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] font-body font-semibold mb-3" style={{ color: LAVENDER }}>{label}</p>
                <p className="text-sm leading-relaxed mb-4 font-body px-2" style={{ color: SLATE2 }}>{person.desc}</p>
                <div className="flex items-center gap-3">
                  <span className="block w-7 h-px" style={{ background: FROST }} />
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-wider font-body" style={{ color: MUTED }}>Putra/i dari</p>
                    <p className="text-xs font-body font-medium mt-0.5" style={{ color: SLATE }}>{person.father}</p>
                    <p className="text-xs font-body" style={{ color: SLATE2 }}>&amp; {person.mother}</p>
                  </div>
                  <span className="block w-7 h-px" style={{ background: FROST }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN — outlined crystal numbers + frost underlines ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: SLATE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <FallingSnow reduce={!!reduce} />
        <motion.div className="absolute right-6 top-8" animate={reduce ? {} : { rotate: -360 }} transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}>
          <Snowflake className="w-40 h-40" color={ICE} strokeWidth={0.3} />
        </motion.div>
        <div className="max-w-lg mx-auto text-center relative z-10">
          <div className="flex items-center gap-4 mb-3 justify-center">
            <CrystalNo n="01" />
            <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: `${ICE}AA` }}>Menuju Hari Bahagia</p>
          </div>
          <h2 className="font-display text-3xl font-light tracking-tight mb-12" style={{ color: ICE }}>Hitung Mengakhir</h2>
          <div className="grid grid-cols-4 gap-3 md:gap-5">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.75, ease: EASE, delay: idx * 0.12 }}>
                <motion.span className="font-display font-light block tabular-nums leading-none"
                  style={{ color: item.accent ? LAVENDER : ICE, fontSize: 'clamp(2.5rem, 9vw, 5rem)', WebkitTextStroke: `1px ${item.accent ? LAVENDER : ICE}`, WebkitTextFillColor: 'transparent' }}
                  key={item.val} initial={reduce ? false : { y: -16, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
                  {String(item.val).padStart(2, '0')}
                </motion.span>
                <span className="block w-8 h-px mt-3" style={{ background: item.accent ? LAVENDER : FROST }} />
                <span className="text-[9px] uppercase tracking-[0.3em] font-body font-medium mt-2 block" style={{ color: `${ICE}99` }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-12">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300 hover:tracking-[0.4em]"
              style={{ color: SLATE, backgroundColor: ICE, border: `1px solid ${FROST}` }}>
              <Calendar className="w-4 h-4" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY — crystal node timeline ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: ICE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <FallingSnow reduce={!!reduce} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center gap-4 mb-3 justify-center">
              <CrystalNo n="02" />
              <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: SLATE2 }}>Perjalanan Cinta</p>
            </div>
            <h2 className="font-display text-4xl font-light tracking-tight" style={{ color: SLATE }}>Cerita Kami</h2>
          </div>
          <div className="relative">
            {/* center frost line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, ${FROST}88, ${FROST}88, transparent)` }} />
            <div className="space-y-14">
              {stories.length > 0 && stories.map((story, idx) => {
                const left = idx % 2 === 0;
                return (
                  <motion.div key={idx} className="relative pl-12 md:pl-0"
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.12 }}>
                    {/* crystal node */}
                    <div className="absolute left-4 md:left-1/2 top-1 -translate-x-1/2">
                      <motion.div initial={{ scale: 0, rotate: -30 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.65, delay: idx * 0.18, ease: EASE }}>
                        <Crystal className="w-5 h-5" color={LAVENDER} />
                      </motion.div>
                    </div>
                    <div className={`md:w-1/2 ${left ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                      <span className="font-body text-xs tracking-[0.3em] uppercase font-semibold" style={{ color: LAVENDER }}>{story.year}</span>
                      <h4 className="font-display text-2xl font-medium tracking-tight mt-1 mb-2" style={{ color: SLATE }}>{story.title}</h4>
                      <p className="text-sm leading-relaxed font-body max-w-lg" style={{ color: SLATE2 }}>{story.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: ICE2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <motion.div className="absolute -left-10 bottom-0" animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 110, repeat: Infinity, ease: 'linear' }}>
          <Snowflake className="w-44 h-44" color={FROST} strokeWidth={0.3} />
        </motion.div>
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <div className="flex items-center gap-4 mb-3 justify-center">
              <CrystalNo n="03" />
              <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: SLATE2 }}>Informasi Acara</p>
            </div>
            <h2 className="font-display text-4xl font-light tracking-tight" style={{ color: SLATE }}>Waktu &amp; Lokasi</h2>
          </div>
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200"
                style={activeTab === idx
                  ? { backgroundColor: SLATE, color: ICE }
                  : { color: SLATE2, border: `1px solid ${FROST}66`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="p-8" style={{ backgroundColor: ICE, border: `1px solid ${FROST}55`, boxShadow: `0 20px 50px -28px ${SLATE}44` }}
            key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className="flex items-start gap-3 mb-4">
              <Crystal className="w-5 h-5 mt-1 flex-shrink-0" color={LAVENDER} />
              <h3 className="font-display text-2xl font-medium tracking-tight" style={{ color: SLATE }}>{activeEvt.title}</h3>
            </div>
            <div className="space-y-2.5 font-body text-sm ml-8" style={{ color: SLATE2 }}>
              <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 flex-shrink-0" style={{ color: LAVENDER }} /> {activeEvt.time}</div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: LAVENDER }} /> <span>{activeEvt.venue}<br />{activeEvt.address}</span></div>
            </div>
            {activeEvt.note && <p className="text-[11px] italic font-body mt-3 ml-8" style={{ color: MUTED }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 ml-8 px-5 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200 hover:gap-3"
                style={{ color: ICE, backgroundColor: SLATE }}>
                <Map className="w-3.5 h-3.5" /> Buka Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY — crystalline grid ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: ICE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center gap-4 mb-3 justify-center">
              <CrystalNo n="04" />
              <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: SLATE2 }}>Galeri Foto</p>
            </div>
            <h2 className="font-display text-4xl font-light tracking-tight" style={{ color: SLATE }}>Kenangan Indah</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1' } : { aspectRatio: '1' }}
                variants={vCrystal}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${SLATE}99, transparent 60%)` }} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                  <Snowflake className="w-4 h-4" color={ICE} strokeWidth={0.8} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${SLATE}F2`, backdropFilter: 'blur(6px)' }} onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 text-2xl font-light" style={{ color: ICE }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2" style={{ color: ICE }} aria-label="Sebelumnya"><ChevronLeft className="w-7 h-7" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2" style={{ color: ICE }} aria-label="Berikutnya"><ChevronRight className="w-7 h-7" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: EASE }}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[85vh] max-w-full" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 8. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: ICE2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <div className="flex items-center gap-4 mb-3 justify-center">
              <CrystalNo n="05" />
              <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: SLATE2 }}>Doa &amp; Ucapan</p>
            </div>
            <h2 className="font-display text-4xl font-light tracking-tight" style={{ color: SLATE }}>Kirim Ucapan</h2>
          </div>

          {isSubmitted ? (
            <motion.div className="p-10 text-center" style={{ backgroundColor: ICE, border: `1px solid ${FROST}55` }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <motion.div className="mx-auto mb-4 w-fit" animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
                <Snowflake className="w-12 h-12" color={LAVENDER} strokeWidth={0.8} />
              </motion.div>
              <p className="font-display text-base font-medium" style={{ color: SLATE }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4" style={{ backgroundColor: ICE, padding: 32, border: `1px solid ${FROST}44` }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-0 py-3 text-sm font-body outline-none transition-colors bg-transparent border-b"
                  style={{ color: SLATE, borderColor: `${FROST}88` }}
                  onFocus={(e) => e.target.style.borderColor = LAVENDER} onBlur={(e) => e.target.style.borderColor = `${FROST}88`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-0 py-3 text-sm font-body outline-none bg-transparent border-b" style={{ color: SLATE, borderColor: `${FROST}88` }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-0 py-3 text-sm font-body outline-none transition-colors resize-none h-24 bg-transparent border-b"
                style={{ color: SLATE, borderColor: `${FROST}88` }}
                onFocus={(e) => e.target.style.borderColor = LAVENDER} onBlur={(e) => e.target.style.borderColor = `${FROST}88`} />
              <button type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300"
                style={{ color: ICE, backgroundColor: SLATE, border: `1px solid ${FROST}` }}>
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
                <div key={w.id} className="p-4" style={{ backgroundColor: ICE, border: `1px solid ${FROST}33`, borderLeft: `2px solid ${LAVENDER}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-base font-medium" style={{ color: SLATE }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1 font-body font-semibold" style={{ color: LAVENDER }}>{w.attendance === 'Hadir' ? '✓ Hadir' : '✕ Tidak Hadir'}</p>
                  <p className="text-sm leading-relaxed font-body" style={{ color: SLATE2 }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: ICE }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <FallingSnow reduce={!!reduce} />
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="text-center mb-10">
              <div className="flex items-center gap-4 mb-3 justify-center">
                <CrystalNo n="06" />
                <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: SLATE2 }}>Tanda Kasih</p>
              </div>
              <h2 className="font-display text-4xl font-light tracking-tight mb-4" style={{ color: SLATE }}>Kado Digital</h2>
              <p className="text-sm max-w-md mx-auto font-body leading-relaxed" style={{ color: SLATE2 }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-7" style={{ backgroundColor: ICE2, border: `1px solid ${FROST}55` }}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: DUR, ease: EASE, delay: idx * 0.12 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4" style={{ color: LAVENDER }} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: LAVENDER }}>{g.bank}</p>
                  </div>
                  <p className="font-display text-xl font-medium tabular-nums my-2" style={{ color: SLATE }}>{g.number}</p>
                  <p className="text-xs font-body mb-4" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.2em] transition-all hover:gap-2.5"
                    style={{ color: LAVENDER }}>
                    {copiedIdx === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="relative px-6 py-28 text-center overflow-hidden" style={{ backgroundColor: SLATE }}>
        <FallingSnow reduce={!!reduce} />
        <motion.div className="absolute left-1/2 -translate-x-1/2 -bottom-24" animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}>
          <Snowflake className="w-96 h-96" color={ICE} strokeWidth={0.18} />
        </motion.div>
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="flex justify-center mb-8" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <Snowflake className="w-14 h-14" color={LAVENDER} strokeWidth={0.8} />
          </motion.div>
          <motion.h2 className="font-display text-3xl md:text-4xl font-light italic leading-snug tracking-tight max-w-xl mx-auto" style={{ color: ICE }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </motion.h2>
          <motion.div className="max-w-[180px] mx-auto my-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_GUST }}>
            <FrostEdge color={LAVENDER} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body" style={{ color: LAVENDER }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl font-light tracking-tight mt-3" style={{ color: ICE }}>{p1.nick} <span className="font-display italic" style={{ color: LAVENDER }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-[0.3em] font-body mt-2" style={{ color: `${ICE}66` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t mt-16 pt-8 text-center" style={{ borderColor: `${ICE}11` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${ICE}44` }}>© 2027 {p1.nick} &amp; {p2.nick}. Yuki Series.</p>
        </div>
      </footer>
    </div>
  );
}
