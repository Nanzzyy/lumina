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
const EASE_DREAM: [number, number, number, number] = [0.4, 0, 0.2, 1];
const DUR = 1.1;

/* Variant library — slow dreamy reveals give Sora its own rhythm. */
const vUp: Variants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.4, ease: EASE_DREAM } } };
const vBlur: Variants = { hidden: { opacity: 0, filter: 'blur(10px)', y: 18 }, visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: DUR, ease: EASE } } };
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.14, delayChildren: 0.12 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Sora" 空 (Sky) — Midnight Aurora ───
   Deep midnight blues, glassmorphism, teal aurora accent, violet glow.
   Distinct from Kaze (ink/bone), Liana (sage/parchment). */
const SKY = '#0A1230';
const SKY2 = '#1A2550';
const AURORA = '#3FD8C9';
const VIOLET = '#7C6FD8';
const SILVER = '#D4DBF0';
const NIGHT = '#060B1F';
const MUTED = '#8893C0';
const CHARCOAL = NIGHT; // body text on dark
const SNOW = '#FFFFFF';

/* ─── Glass helper ─── */
function glass(blur = 10): React.CSSProperties {
  return {
    backgroundColor: 'rgba(255,255,255,0.05)',
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid ${SILVER}22`,
    borderRadius: '1rem',
  };
}

const DEFAULTS = {
  couple: {
    p1: { nick: 'Bima', full: 'Bima Surya Pratama, S.T.', father: 'Bpk. H. Surya Negara', mother: 'Ibu Hj. Wulan Sari', ig: '@bimasurya', desc: 'Pemimpi yang meyakini setiap bintang menyimpan satu takdir — dan takdirnya adalah menemukan satu cahaya yang sejalan.' },
    p2: { nick: 'Luna', full: 'Luna Kartika Anggraini, S.Psi.', father: 'Bpk. H. Indra Anggraini', mother: 'Ibu Hj. Bintari Kusuma', ig: '@lunakartika', desc: 'Pencinta langit malam yang percaya, cinta yang ditulis bintang tak akan pernah pudar meski gelap menyelimuti.' },
  },
  date: '2027-10-30T08:00:00',
  quote: { text: 'Cinta sejati tak pernah kebetulan. Ia ditulis di antara bintang-bintang, menunggu waktu yang tepat untuk menyatukan dua jiwa yang dari semula ditakdirkan bersama.', source: 'Sebuah keyakinan' },
  events: [
    { title: 'Akad Nikah', time: '08:00 - 10:00 WIB', venue: 'Pendopo Bintang, Hotel Grand Dhika', address: 'Jl. Cendana Raya, Jakarta Selatan', mapsUrl: 'https://maps.google.com', note: 'Khidmat dan sakral, khusus keluarga inti dan kerabat dekat' },
    { title: 'Resepsi', time: '11:00 - 15:00 WIB', venue: 'Grand Ballroom, Hotel Mulia Senayan', address: 'Jl. Asia Afrika, Jakarta Pusat', mapsUrl: 'https://maps.google.com', note: 'Terbuka untuk seluruh tamu undangan' },
  ],
  stories: [
    { year: '2022', title: 'Bintang Jatuh', desc: 'Sebuah hujan meteor di langit Bogor. Bima dan Luna tidak saling kenal, nyaris mengucap doa yang sama pada bintang yang sama. Takdir mulai berbisik pelan.' },
    { year: '2024', title: 'Satu Cakrawala', desc: 'Dua tahun berbagi musim, mimpi, dan rindu. Dua garis orbit yang perlahan saling mendekat, menyepakati satu cakrawala untuk dilalui bersama.' },
    { year: '2026', title: 'Ditakdirkan Bersama', desc: 'Dengan restu kedua keluarga, ikatan suci dikukuhkan. Bintang-bintang telah menepati janjinya — dua cahaya kini menyatu menjadi satu.' },
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
    { bank: 'Bank BCA', number: '0359871120', owner: 'Luna Kartika Anggraini' },
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
  const displayDate = displayDateFrom(isoDate, 'Sabtu, 30 Oktober 2027');
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
  if (typeof window === 'undefined' || document.getElementById('sora-inv')) return;
  const s = document.createElement('style');
  s.id = 'sora-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Jost:wght@300;400;500;600&display=swap');
.font-display { font-family: 'Marcellus', 'Noto Serif', serif; }
.font-body { font-family: 'Jost', system-ui, sans-serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: night sky + aurora ─── */

/** Scattered twinkling star dots — signature ambient motion. */
function StarField({ reduce, count = 22 }: { reduce: boolean; count?: number }) {
  if (reduce) return null;
  const stars = Array.from({ length: count }, (_, i) => {
    const seed = (i * 53) % 100;
    return {
      top: `${(seed * 1.37) % 100}%`,
      left: `${(seed * 2.13 + i * 7) % 100}%`,
      size: 1 + ((i * 3) % 3),
      delay: (i % 8) * 0.25,
      dur: 1.2 + ((i * 5) % 9) / 10, // 1.2 - 2.0s
    };
  });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((s, i) => (
        <motion.span key={i} className="absolute rounded-full"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, backgroundColor: i % 4 === 0 ? AURORA : SILVER, boxShadow: `0 0 ${s.size * 2}px ${SILVER}66` }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

/** Dots joined by faint lines — constellation motif. */
function Constellation({ className = 'w-full h-full', color = SILVER, opacity = 0.35 }: { className?: string; color?: string; opacity?: number }) {
  const nodes: Array<[number, number]> = [[40, 30], [110, 60], [180, 40], [250, 80], [320, 50], [150, 140], [240, 160], [90, 150]];
  const edges: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [3, 6], [1, 7], [7, 5]];
  return (
    <svg className={className} viewBox="0 0 360 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ opacity }}>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={color} strokeWidth="0.5" opacity="0.5" />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.4} fill={color} />
      ))}
    </svg>
  );
}

/** Crescent moon. */
function Moon({ className = 'w-16 h-16', color = SILVER }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M60 18 A35 35 0 1 0 60 82 A26 26 0 1 1 60 18 Z" fill={color} opacity="0.92" />
      <circle cx="44" cy="40" r="2" fill={NIGHT} opacity="0.18" />
      <circle cx="52" cy="60" r="1.4" fill={NIGHT} opacity="0.14" />
      <circle cx="38" cy="55" r="1" fill={NIGHT} opacity="0.12" />
    </svg>
  );
}

/** Drifting radial aurora blob — ambient glow. */
function AuroraGlow({ reduce, color = AURORA }: { reduce: boolean; color?: string }) {
  if (reduce) return null;
  return (
    <motion.div className="absolute inset-0 pointer-events-none z-0"
      style={{ background: `radial-gradient(ellipse 65% 55% at 50% 30%, ${color}26, transparent 70%)` }}
      animate={{ x: [0, 50, -30, 0], y: [0, -25, 35, 0], opacity: [0.45, 0.8, 0.45] }}
      transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
  );
}

/* ─── Main ─── */
export function UndanganPernikahanSora({ content, slug, preview }: MonolithicTemplateProps) {
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
      <div className="fixed inset-0 z-50 flex overflow-hidden" style={{ background: `linear-gradient(165deg, ${SKY} 0%, ${SKY2} 50%, ${NIGHT} 100%)` }}>
        <StarField reduce={!!reduce} count={26} />
        <AuroraGlow reduce={!!reduce} color={VIOLET} />
        <div className="absolute top-10 right-10 z-10">
          <Moon className="w-20 h-20" color={SILVER} />
        </div>

        <motion.div className="m-auto px-6 max-w-md w-full text-center relative z-20" variants={stagC} initial="hidden" animate="visible">
          <motion.div variants={stagI} className="flex justify-center mb-6">
            <Constellation className="w-40 h-16" color={AURORA} opacity={0.7} />
          </motion.div>
          <motion.p variants={stagI} className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: AURORA }}>The Wedding of</motion.p>
          <motion.h1 variants={stagI} className="font-display text-6xl leading-[0.98] tracking-tight mt-4" style={{ color: SNOW }}>
            {p1.nick}
            <span className="block font-body font-light text-2xl my-2" style={{ color: AURORA }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.div variants={stagI} className="max-w-[220px] mx-auto mt-6 h-px" style={{ background: `linear-gradient(to right, transparent, ${AURORA}, transparent)` }} />
          <motion.p variants={stagI} className="font-display text-sm font-light mt-5" style={{ color: `${SILVER}CC` }}>{displayDate}</motion.p>
          <motion.div variants={stagI} className="mt-9 inline-block px-6 py-3" style={glass(8)}>
            <p className="text-[9px] uppercase tracking-[0.4em] font-body" style={{ color: `${SILVER}99` }}>Kepada Yth.</p>
            <p className="font-display text-base font-normal mt-1" style={{ color: SNOW }}>{guestName}</p>
          </motion.div>
          <motion.div variants={stagI} className="mt-9">
            <button onClick={open}
              className="group relative px-12 py-4 text-xs uppercase tracking-[0.35em] font-body font-semibold transition-all duration-300 overflow-hidden rounded-full"
              style={{ color: NIGHT, backgroundColor: AURORA }}>
              <span className="relative z-10 flex items-center gap-2.5"><Heart className="w-3.5 h-3.5" /> Buka Undangan</span>
              <motion.span className="absolute inset-0 origin-center" style={{ backgroundColor: VIOLET }}
                initial={{ scale: 0 }} whileHover={{ scale: 1 }} transition={{ duration: 0.35, ease: EASE }} />
            </button>
          </motion.div>
        </motion.div>
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[7px] tracking-[0.5em] uppercase z-20 font-body" style={{ color: `${MUTED}AA` }}>#{p1.nick}{p2.nick}Sora</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: NIGHT, color: SILVER }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-200 hover:scale-110 rounded-full"
        style={{ ...glass(10), border: `1px solid ${AURORA}55` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: AURORA }} /> : <VolumeX className="w-5 h-5" style={{ color: `${SILVER}88` }} />}
      </button>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: SKY }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1, 1.06, 1] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-40" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-40" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${SKY}F2 0%, ${SKY}99 45%, ${SKY2}D6 100%)` }} />
        <AuroraGlow reduce={!!reduce} color={AURORA} />
        <StarField reduce={!!reduce} count={20} />
        <div className="absolute top-8 right-8 z-10">
          <Moon className="w-24 h-24" color={`${SILVER}DD`} />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20 pt-32">
          <motion.p className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: AURORA }}
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>Undangan Pernikahan</motion.p>
          <motion.h1 className="font-display text-7xl md:text-8xl leading-[0.92] tracking-tight mt-4" style={{ color: SNOW }}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.45 }}>
            {p1.nick}<br /><span className="font-light italic" style={{ color: AURORA }}>&amp;</span> {p2.nick}
          </motion.h1>
          <motion.div className="flex flex-wrap items-end justify-between gap-6 mt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 0.7 }}>
            <div>
              <p className="font-display text-lg font-light" style={{ color: SILVER }}>{displayDate}</p>
              <p className="text-[10px] tracking-[0.3em] uppercase font-body font-medium mt-1" style={{ color: AURORA }}>{location}</p>
            </div>
            {guestName && (
              <div className="px-5 py-2.5" style={glass(8)}>
                <p className="text-[9px] uppercase tracking-[0.3em] font-body" style={{ color: `${SILVER}99` }}>Kepada Yth.</p>
                <p className="font-display text-base font-normal mt-0.5" style={{ color: SNOW }}>{guestName}</p>
              </div>
            )}
          </motion.div>
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${SILVER}66` }}>Scroll</span>
        </motion.div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: NIGHT }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <StarField reduce={!!reduce} count={14} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="max-w-[160px] mx-auto mb-8 h-px" style={{ background: `linear-gradient(to right, transparent, ${AURORA}, transparent)` }} />
          <motion.p className="font-display text-5xl mb-2 leading-none font-light" style={{ color: `${AURORA}88` }}>"</motion.p>
          <motion.p className="font-display text-2xl md:text-3xl leading-relaxed font-light italic" style={{ color: SILVER }} variants={vBlur}>{quote.text}</motion.p>
          <motion.p className="font-display text-5xl mt-2 leading-none font-light" style={{ color: `${AURORA}88` }}>"</motion.p>
          <div className="max-w-[160px] mx-auto mt-6 mb-5 h-px" style={{ background: `linear-gradient(to right, transparent, ${VIOLET}, transparent)` }} />
          <p className="font-display text-sm mt-3 tracking-wide" style={{ color: AURORA }}>{quote.source ? '— ' + quote.source : ''}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE — glass cards with framed photos ═══ */}
      <motion.section className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${NIGHT} 0%, ${SKY} 100%)` }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <AuroraGlow reduce={!!reduce} color={VIOLET} />
        <div className="max-w-5xl mx-auto px-6 py-28 relative z-10">
          <div className="flex items-center gap-4 mb-10 justify-center">
            <Constellation className="w-28 h-10" color={AURORA} opacity={0.6} />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight mb-3 text-center" style={{ color: SNOW }}>Dua Cahaya, Satu Langit</h2>
          <p className="text-sm max-w-md mx-auto text-center font-body leading-relaxed mb-16" style={{ color: `${SILVER}88` }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria' },
              { person: p2, img: media.p2, label: 'Mempelai Wanita' },
            ].map(({ person, img, label }, idx) => (
              <motion.div key={label} className="flex flex-col items-center max-w-[300px] w-full p-7"
                style={glass(12)}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: DUR, ease: EASE, delay: idx * 0.15 }}>
                <motion.div className="relative mb-9 overflow-hidden rounded-2xl"
                  style={{ width: 180, height: 180, border: `1px solid ${AURORA}55`, boxShadow: `0 18px 40px -16px ${AURORA}44` }}
                  initial={reduce ? false : { scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
                  transition={{ duration: DUR, delay: idx * 0.2, ease: EASE }}>
                  <img src={img} alt={person.nick} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${SKY}55, transparent 60%)` }} />
                </motion.div>
                <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-2" style={{ color: AURORA }}>{label}</p>
                <h3 className="font-display text-2xl font-normal tracking-tight mb-3 text-center" style={{ color: SNOW }}>{person.full}</h3>
                <p className="text-xs leading-relaxed font-body mb-4 text-center" style={{ color: `${SILVER}99` }}>{person.desc}</p>
                <div className="w-10 h-px mb-3" style={{ background: AURORA }} />
                <p className="text-[10px] uppercase tracking-wider font-body" style={{ color: MUTED }}>Putra/i dari</p>
                <p className="text-xs font-body font-medium mt-0.5 text-center" style={{ color: SILVER }}>{person.father}</p>
                <p className="text-xs font-body text-center" style={{ color: `${SILVER}AA` }}>&amp; {person.mother}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN — glass tiles, AURORA numerals ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: NIGHT }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <StarField reduce={!!reduce} count={16} />
        <AuroraGlow reduce={!!reduce} color={AURORA} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="flex items-center gap-4 mb-10 justify-center">
            <Constellation className="w-24 h-8" color={AURORA} opacity={0.55} />
            <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: AURORA }}>Menuju Hari Bahagia</p>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-5">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="flex flex-col items-center py-6 px-2" style={glass(10)}
                initial={{ opacity: 0, scale: 0.88 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: idx * 0.11 }}>
                <motion.span className="font-display font-light block tabular-nums leading-none"
                  style={{ color: item.accent ? AURORA : SNOW, fontSize: 'clamp(2.4rem, 8.5vw, 4.8rem)' }}
                  key={item.val} initial={reduce ? false : { y: -14, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
                  {String(item.val).padStart(2, '0')}
                </motion.span>
                <span className="text-[9px] uppercase tracking-[0.3em] font-body font-medium mt-2 block" style={{ color: MUTED }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-12">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300 hover:tracking-[0.4em] rounded-full"
              style={{ color: NIGHT, backgroundColor: AURORA }}>
              <Calendar className="w-4 h-4" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, ${NIGHT} 0%, ${SKY2} 100%)` }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <StarField reduce={!!reduce} count={12} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3 justify-center">
            <Constellation className="w-20 h-7" color={AURORA} opacity={0.5} />
          </div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-center" style={{ color: AURORA }}>Perjalanan Cinta</p>
          <h2 className="font-display text-4xl font-light tracking-tight mb-16 text-center" style={{ color: SNOW }}>Ditulis Bintang</h2>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, ${AURORA}66, ${AURORA}66, transparent)` }} />
            <div className="space-y-14">
              {stories.length > 0 && stories.map((story, idx) => {
                const left = idx % 2 === 0;
                return (
                  <motion.div key={idx} className="relative pl-12 md:pl-0"
                    initial={{ opacity: 0, x: left ? -28 : 28 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                    <div className="absolute left-4 md:left-1/2 top-1 -translate-x-1/2">
                      <motion.span className="block rounded-full" style={{ width: 14, height: 14, backgroundColor: AURORA, boxShadow: `0 0 16px ${AURORA}` }}
                        initial={reduce ? false : { scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.15, ease: EASE }} />
                    </div>
                    <div className={`md:w-1/2 ${left ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                      <span className="font-body text-xs tracking-[0.3em] uppercase font-semibold" style={{ color: AURORA }}>{story.year}</span>
                      <h4 className="font-display text-2xl font-normal tracking-tight mt-1 mb-2" style={{ color: SNOW }}>{story.title}</h4>
                      <p className="text-sm leading-relaxed font-body max-w-lg" style={{ color: `${SILVER}99` }}>{story.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: NIGHT }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <AuroraGlow reduce={!!reduce} color={VIOLET} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3 justify-center">
            <Constellation className="w-24 h-8" color={AURORA} opacity={0.55} />
          </div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-center" style={{ color: AURORA }}>Informasi Acara</p>
          <h2 className="font-display text-4xl font-light tracking-tight mb-12 text-center" style={{ color: SNOW }}>Waktu &amp; Lokasi</h2>
          <div className="flex gap-3 mb-10 flex-wrap justify-center">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200 rounded-full"
                style={activeTab === idx
                  ? { backgroundColor: AURORA, color: NIGHT }
                  : { color: `${SILVER}99`, border: `1px solid ${SILVER}33`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="p-8" style={glass(12)}
            key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <h3 className="font-display text-2xl font-normal tracking-tight mb-4" style={{ color: SNOW }}>{activeEvt.title}</h3>
            <div className="space-y-2.5 font-body text-sm" style={{ color: `${SILVER}CC` }}>
              <div className="flex items-center gap-2.5"><Clock className="w-4 h-4" style={{ color: AURORA }} /> {activeEvt.time}</div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: AURORA }} /> <span>{activeEvt.venue}<br />{activeEvt.address}</span></div>
            </div>
            {activeEvt.note && <p className="text-[11px] italic font-body mt-3" style={{ color: MUTED }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200 hover:gap-3 rounded-full"
                style={{ color: NIGHT, backgroundColor: AURORA }}>
                <Map className="w-3.5 h-3.5" /> Buka Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, ${NIGHT} 0%, ${SKY} 100%)` }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <StarField reduce={!!reduce} count={14} />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3 justify-center">
            <Constellation className="w-24 h-8" color={AURORA} opacity={0.55} />
          </div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-center" style={{ color: AURORA }}>Galeri Foto</p>
          <h2 className="font-display text-4xl font-light tracking-tight mb-12 text-center" style={{ color: SNOW }}>Kenangan Indah</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden rounded-2xl"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1' } : { aspectRatio: '1', border: `1px solid ${SILVER}1A` }}
                initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.08 }}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${SKY}CC, transparent 60%)` }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${NIGHT}F2`, backdropFilter: 'blur(8px)' }} onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 text-2xl font-light rounded-full" style={{ color: SILVER, ...glass(8) }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2 rounded-full" style={{ color: SILVER, ...glass(8) }} aria-label="Sebelumnya"><ChevronLeft className="w-7 h-7" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2 rounded-full" style={{ color: SILVER, ...glass(8) }} aria-label="Berikutnya"><ChevronRight className="w-7 h-7" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: EASE }}
            style={{ border: `1px solid ${AURORA}33` }}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[85vh] max-w-full" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 8. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: NIGHT }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <StarField reduce={!!reduce} count={12} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3 justify-center">
            <Constellation className="w-24 h-8" color={AURORA} opacity={0.55} />
          </div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-center" style={{ color: AURORA }}>Doa &amp; Ucapan</p>
          <h2 className="font-display text-4xl font-light tracking-tight mb-10 text-center" style={{ color: SNOW }}>Kirim Ucapan</h2>

          {isSubmitted ? (
            <motion.div className="p-10 text-center" style={glass(12)}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <motion.span className="block mx-auto mb-4 rounded-full" style={{ width: 48, height: 48, backgroundColor: AURORA, boxShadow: `0 0 24px ${AURORA}` }} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, ease: EASE }} />
              <p className="font-display text-base font-normal" style={{ color: SNOW }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4 p-6" style={glass(12)}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm font-body outline-none transition-colors rounded-xl"
                  style={{ color: SNOW, backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${SILVER}22` }}
                  onFocus={(e) => e.target.style.borderColor = AURORA} onBlur={(e) => e.target.style.borderColor = `${SILVER}22`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-4 py-3 text-sm font-body outline-none rounded-xl" style={{ color: SNOW, backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${SILVER}22` }}>
                  <option style={{ color: NIGHT }}>Hadir</option>
                  <option style={{ color: NIGHT }}>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-4 py-3 text-sm font-body outline-none transition-colors resize-none h-24 rounded-xl"
                style={{ color: SNOW, backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${SILVER}22` }}
                onFocus={(e) => e.target.style.borderColor = AURORA} onBlur={(e) => e.target.style.borderColor = `${SILVER}22`} />
              <button type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300 rounded-full"
                style={{ color: NIGHT, backgroundColor: AURORA }}>
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
                <div key={w.id} className="p-5" style={glass(8)}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-base font-normal" style={{ color: SNOW }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1 font-body font-semibold" style={{ color: AURORA }}>{w.attendance === 'Hadir' ? '✓ Hadir' : '✕ Tidak Hadir'}</p>
                  <p className="text-sm leading-relaxed font-body" style={{ color: `${SILVER}CC` }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-32 overflow-hidden" style={{ background: `linear-gradient(180deg, ${NIGHT} 0%, ${SKY} 100%)` }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <StarField reduce={!!reduce} count={12} />
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-3 justify-center">
              <Constellation className="w-24 h-8" color={AURORA} opacity={0.55} />
            </div>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-center" style={{ color: AURORA }}>Tanda Kasih</p>
            <h2 className="font-display text-4xl font-light tracking-tight mb-4 text-center" style={{ color: SNOW }}>Kado Digital</h2>
            <p className="text-sm max-w-md mx-auto text-center font-body leading-relaxed mb-10" style={{ color: `${SILVER}99` }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-7" style={glass(12)}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: DUR, ease: EASE, delay: idx * 0.12 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4" style={{ color: AURORA }} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: AURORA }}>{g.bank}</p>
                  </div>
                  <p className="font-display text-xl font-normal tabular-nums my-2" style={{ color: SNOW }}>{g.number}</p>
                  <p className="text-xs font-body mb-4" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.2em] transition-all hover:gap-2.5"
                    style={{ color: AURORA }}>
                    {copiedIdx === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="relative px-6 py-32 text-center overflow-hidden" style={{ background: `linear-gradient(180deg, ${SKY} 0%, ${NIGHT} 100%)` }}>
        <StarField reduce={!!reduce} count={24} />
        <AuroraGlow reduce={!!reduce} color={AURORA} />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 opacity-80">
          <Moon className="w-16 h-16" color={`${SILVER}CC`} />
        </div>
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="flex justify-center mb-10 mt-8" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <Constellation className="w-32 h-10" color={AURORA} opacity={0.75} />
          </motion.div>
          <motion.h2 className="font-display text-3xl md:text-4xl font-light italic leading-snug tracking-tight max-w-xl mx-auto" style={{ color: SNOW }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </motion.h2>
          <motion.div className="max-w-[180px] mx-auto my-10 h-px" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE_DREAM }}
            style={{ background: `linear-gradient(to right, transparent, ${AURORA}, transparent)` }} />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body" style={{ color: AURORA }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl font-normal tracking-tight mt-3" style={{ color: SNOW }}>{p1.nick} <span className="font-light italic" style={{ color: AURORA }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-[0.3em] font-body mt-2" style={{ color: `${SILVER}66` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t mt-16 pt-8 text-center" style={{ borderColor: `${SILVER}11` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${SILVER}44` }}>© 2027 {p1.nick} &amp; {p2.nick}. Sora Series.</p>
        </div>
      </footer>
    </div>
  );
}
