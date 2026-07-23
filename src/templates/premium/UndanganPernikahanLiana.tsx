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
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_SOFT: [number, number, number, number] = [0.4, 0, 0.2, 1];
const DUR = 0.8;

/* Variant library — varied per section for unique character. */
const vUp: Variants = { hidden: { opacity: 0, y: 44 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vScale: Variants = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: DUR, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.1, ease: EASE_SOFT } } };
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Liana" (Vine) — Botanical Sage ─── */
/* Harmonious sage-green family on warm parchment, clay-coral accent, soft gold.
   Distinct from Kaze (indigo), Flora (peach), Sakura (plum), Hana (ivory). */
const PINE = '#243B2E';
const PINE_LIGHT = '#34543F';
const SAGE = '#7C9A78';
const MOSS = '#A9C0A0';
const CREAM = '#F5F1E6';
const CREAM_DARK = '#EAE2D0';
const CLAY = '#C66B4E';
const CLAY_LIGHT = '#D68A6E';
const GOLD = '#B8923F';
const CHARCOAL = '#2B2A24';
const MUTED = '#7C7868';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Arsa', full: 'Arsa Wijaya Kusuma, S.Hut.', father: 'Bpk. Drs. Wijaya Kusuma', mother: 'Ibu Sri Lestari', ig: '@arsawijaya', desc: 'Pencinta alam liar yang meyakini setiap helai daun menyimpan kisah tentang tumbuh dan berakar.' },
    p2: { nick: 'Tara', full: 'Tara Anindya Pratiwi, S.Ds.', father: 'Bpk. Ir. Bambang Pratiwi', mother: 'Ibu Dewi Anggraeni', ig: '@taraanindya', desc: 'Perancang yang menemukan keindahan dalam ketidaksempurnaan alam — daun, ranting, dan musim yang berganti.' },
  },
  date: '2027-06-12T08:00:00',
  quote: { text: 'Dua hati bagai dua pohon yang tumbuh berdampingan — akarnya saling bertaut di bawah tanah, rantingnya saling menyapa di angin. Kita tidak kehilangan diri, kita justru bertumbuh bersama.', source: 'Sebuah harapan' },
  events: [
    { title: 'Akad Nikah', time: '08:00 - 10:00 WIB', venue: 'Pendopo Kayu Pinus', address: 'Jl. Hutan Pinus Pengger, Kedu', mapsUrl: 'https://maps.google.com', note: 'Khidmat, sakral, khusus keluarga inti' },
    { title: 'Resepsi', time: '11:00 - 15:00 WIB', venue: 'Taman Botani Seroja', address: 'Jl. Taman Seroja Raya, Kedu', mapsUrl: 'https://maps.google.com', note: 'Terbuka untuk seluruh tamu undangan' },
  ],
  stories: [
    { year: '2021', title: 'Tunas Pertama', desc: 'Berjumpa di sebuah kebun raya saat hujan gerimis. Tara berlindung di bawah pohon yang sama dengan Arsa. Sehelai daun gugur, dan sebuah cerita bermula.' },
    { year: '2023', title: 'Berakar Dalam', desc: 'Dua tahun berbagi musim, mendaki bukit, menanam pohon. Cinta yang tumbuh pelan namun dalam, akarnya tak lagi bisa dipisahkan.' },
    { year: '2026', title: 'Mekar Bersama', desc: 'Dengan restu keluarga, kami menyatukan janji. Seperti dua pohon yang kini berdiri dalam satu kanopi — kami bertumbuh bersama selamanya.' },
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
    { bank: 'Bank Mandiri', number: '1180023491820', owner: 'Arsa Wijaya Kusuma' },
    { bank: 'Bank BCA', number: '0359871120', owner: 'Tara Anindya Pratiwi' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
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
  const displayDate = displayDateFrom(isoDate, 'Sabtu, 12 Juni 2027');
  const location = content.event?.location || 'Kedu';
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
  if (typeof window === 'undefined' || document.getElementById('liana-inv')) return;
  const s = document.createElement('style');
  s.id = 'liana-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=Mulish:wght@300;400;500;600;700&family=Caveat:wght@400;500;600&display=swap');
.font-display { font-family: 'Fraunces', Georgia, serif; }
.font-body { font-family: 'Mulish', system-ui, sans-serif; }
.font-script { font-family: 'Caveat', cursive; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: leaves (daun) ─── */

/** Single teardrop leaf with a center vein. */
function Leaf({ className = 'w-6 h-6', color = SAGE, vein = PINE }: { className?: string; color?: string; vein?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M50 6 C26 24 16 46 16 68 C16 82 30 94 50 94 C70 94 84 82 84 68 C84 46 74 24 50 6 Z" fill={color} />
      <path d="M50 10 L50 92" stroke={vein} strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
      <path d="M50 34 L34 44 M50 34 L66 44 M50 50 L30 60 M50 50 L70 60 M50 66 L36 74 M50 66 L64 74" stroke={vein} strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

/** Eucalyptus sprig — central stem with paired leaves. Used as divider/corner accent. */
function Sprig({ className = 'w-24 h-10', color = SAGE, flip = false }: { className?: string; color?: string; flip?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M6 20 C40 20 80 20 114 20" stroke={color} strokeWidth="1" opacity="0.5" />
      {[10, 30, 50, 70, 90, 108].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={11} rx="7" ry="3.6" fill={color} opacity={0.85 - i * 0.05} transform={`rotate(-28 ${x} 11)`} />
          <ellipse cx={x} cy={29} rx="7" ry="3.6" fill={color} opacity={0.85 - i * 0.05} transform={`rotate(28 ${x} 29)`} />
        </g>
      ))}
    </svg>
  );
}

/** Botanical divider — thin line + center sprig. */
function LeafDivider({ color = SAGE }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-7">
      <span className="h-px w-12" style={{ background: `linear-gradient(to left, ${color}, transparent)` }} />
      <Sprig className="w-16 h-6" color={color} />
      <span className="h-px w-12" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
    </div>
  );
}

/** Large decorative monstera-ish corner leaf. */
function CornerLeaf({ className = 'w-40 h-40', color = SAGE, opacity = 0.18 }: { className?: string; color?: string; opacity?: number }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ opacity }}>
      <path d="M100 12 C70 30 44 44 28 72 C12 100 16 140 40 168 C44 172 50 176 56 178 L56 150 C56 128 64 110 80 96 C72 116 70 138 78 158 C82 168 90 176 100 180 C110 176 118 168 122 158 C130 138 128 116 120 96 C136 110 144 128 144 150 L144 178 C150 176 156 172 160 168 C184 140 188 100 172 72 C156 44 130 30 100 12 Z" fill={color} />
      <path d="M100 20 L100 176" stroke="#fff" strokeWidth="2" opacity="0.25" />
    </svg>
  );
}

/** Scattered swaying + falling leaves background — the signature motion. */
function FallingLeaves({ reduce }: { reduce: boolean }) {
  const leaves = [
    { top: '6%', left: '8%', size: 22, rot: -18, delay: 0, dur: 9 },
    { top: '14%', left: '86%', size: 18, rot: 24, delay: 1.4, dur: 11 },
    { top: '34%', left: '4%', size: 26, rot: -8, delay: 0.7, dur: 10 },
    { top: '52%', left: '92%', size: 16, rot: 30, delay: 2.1, dur: 12 },
    { top: '70%', left: '10%', size: 20, rot: -26, delay: 1.1, dur: 9.5 },
    { top: '84%', left: '82%', size: 24, rot: 14, delay: 0.3, dur: 10.5 },
  ];
  if (reduce) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((l, i) => (
        <motion.div key={i} className="absolute"
          style={{ top: l.top, left: l.left, rotate: `${l.rot}deg` }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: [0, 0.5, 0.28, 0.5], y: [0, 40, 0], rotate: [l.rot, l.rot + 28, l.rot] }}
          transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, ease: 'easeInOut' }}>
          <Leaf className="" color={i % 2 ? SAGE : MOSS} vein={PINE} />
          <div style={{ width: l.size, height: l.size }} />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanLiana({ content, slug, preview }: MonolithicTemplateProps) {
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
        style={{ background: `linear-gradient(165deg, ${PINE} 0%, ${PINE_LIGHT} 45%, ${PINE} 100%)` }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(${MOSS} 1px, transparent 1px)`, backgroundSize: '26px 26px' }} />
        <CornerLeaf className="absolute -top-6 -left-6 w-44 h-44" color={MOSS} opacity={0.16} />
        <CornerLeaf className="absolute -bottom-6 -right-6 w-52 h-52 rotate-180" color={MOSS} opacity={0.14} />
        {!reduce && (
          <motion.div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 30%, ${CLAY}22 0%, transparent 60%)` }}
            animate={{ opacity: [0.4, 0.75, 0.4] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
        )}
        <div className="absolute inset-4 border border-white/[0.08] pointer-events-none rounded-[28px] z-10" />

        <motion.div className="pt-12 z-20" variants={stagI} initial="hidden" animate="visible">
          <Sprig className="w-28 h-9 mx-auto" color={MOSS} />
        </motion.div>

        <motion.div className="my-auto z-20 px-6 max-w-sm w-full text-center space-y-7"
          variants={stagC} initial="hidden" animate="visible">
          <motion.div variants={stagI} className="space-y-2">
            <span className="font-script text-2xl block" style={{ color: CLAY_LIGHT }}>the wedding of</span>
          </motion.div>
          <motion.div variants={stagI} className="space-y-3">
            <h1 className="font-display text-5xl leading-[1.05] text-white font-light tracking-tight">
              {p1.nick}
              <span className="block font-script text-3xl my-1" style={{ color: CLAY_LIGHT }}>&amp;</span>
              {p2.nick}
            </h1>
            <p className="font-display text-sm italic font-light" style={{ color: `${MOSS}CC` }}>{displayDate}</p>
          </motion.div>
          <motion.div variants={stagI} className="space-y-3 pt-1">
            <p className="text-[10px] uppercase tracking-[0.35em] font-body" style={{ color: `${MOSS}AA` }}>Kepada Yth.</p>
            <div className="inline-block px-8 py-3 rounded-full" style={{ border: `1px solid ${MOSS}40`, backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <p className="font-display text-base font-light tracking-wide text-white">{guestName}</p>
            </div>
          </motion.div>
          <motion.div variants={stagI} className="pt-1">
            <button onClick={open}
              className="group relative px-10 py-3.5 text-white transition-all duration-500 text-xs uppercase tracking-[0.3em] font-body font-medium rounded-full overflow-hidden"
              style={{ backgroundColor: CLAY }}>
              <span className="relative z-10 flex items-center gap-2"><Heart className="w-3.5 h-3.5" /> Buka Undangan</span>
              <motion.span className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent)`, backgroundSize: '200% 100%' }}
                initial={{ backgroundPosition: '-200% center' }} animate={reduce ? {} : { backgroundPosition: '200% center' }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
            </button>
          </motion.div>
        </motion.div>
        <p className="text-[7px] tracking-[0.4em] uppercase mb-6 z-20 font-body" style={{ color: `${MOSS}66` }}>#{p1.nick}{p2.nick}Liana</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: CREAM, color: CHARCOAL }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center transition-all duration-200 hover:scale-110 rounded-full"
        style={{ backgroundColor: `${PINE}E6`, backdropFilter: 'blur(8px)', border: `1px solid ${MOSS}33` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: MOSS }} /> : <VolumeX className="w-5 h-5" style={{ color: `${MOSS}99` }} />}
      </button>

      {/* ═══ 1. HERO ═══ */}
      <motion.section className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${PINE} 0%, ${PINE_LIGHT} 42%, ${CREAM} 100%)` }}>
        <motion.div className="absolute inset-0 opacity-30"
          animate={reduce ? {} : { scale: [1, 1.08, 1] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover" /> : <img src={media.hero} alt="" className="w-full h-full object-cover" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${PINE}CC, ${PINE}33, ${PINE}AA)` }} />
        <CornerLeaf className="absolute top-4 left-4 w-28 h-28" color={MOSS} opacity={0.2} />
        <CornerLeaf className="absolute top-4 right-4 w-28 h-28 -scale-x-100" color={MOSS} opacity={0.2} />

        <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <Sprig className="w-24 h-8 mx-auto mb-7" color={MOSS} />
          </motion.div>
          <motion.p className="font-script text-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }}
            style={{ color: CLAY_LIGHT }}>undangan pernikahan</motion.p>
          <motion.h1 className="font-display text-6xl leading-[1.02] text-white font-light tracking-tight mt-3"
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.55 }}>
            {p1.nick}
            <span className="block font-script text-3xl my-0.5" style={{ color: CLAY_LIGHT }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.p className="font-display text-sm font-light italic mt-4" style={{ color: `${MOSS}CC` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: DUR, ease: EASE }}>{displayDate}</motion.p>
          <motion.p className="text-[10px] tracking-[0.3em] uppercase font-body font-medium mt-1" style={{ color: `${CLAY_LIGHT}CC` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: DUR, ease: EASE }}>{location}</motion.p>

          {guestName && (
            <motion.div className="mt-7 inline-block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: DUR, ease: EASE }}>
              <div className="px-5 py-2 text-xs font-body rounded-full" style={{ border: `1px solid ${MOSS}40`, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                Kepada Yth. <span className="font-medium text-white">{guestName}</span>
              </div>
            </motion.div>
          )}
          <motion.div className="mt-14 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <p className="text-[8px] uppercase tracking-widest font-body" style={{ color: `${MOSS}99` }}>Scroll</p>
            <Leaf className="w-3 h-3 mt-2" color={MOSS} vein={PINE} />
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vScale}>
        <FallingLeaves reduce={!!reduce} />
        <div className="max-w-xl mx-auto text-center relative z-10">
          <LeafDivider color={SAGE} />
          <p className="font-display text-5xl mb-3 leading-none font-light" style={{ color: `${CLAY}88` }}>"</p>
          <motion.p className="font-display text-xl italic leading-relaxed px-2 font-light" style={{ color: CHARCOAL }}
            variants={vFade}>{quote.text}</motion.p>
          <p className="font-display text-5xl mt-3 leading-none font-light" style={{ color: `${CLAY}88` }}>"</p>
          <LeafDivider color={SAGE} />
          <p className="font-script text-xl" style={{ color: MUTED }}>{quote.source}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM_DARK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <CornerLeaf className="absolute top-0 right-0 w-48 h-48 rotate-90" color={SAGE} opacity={0.1} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <LeafDivider color={SAGE} />
          <p className="font-script text-2xl mb-1" style={{ color: CLAY }}>kedua mempelai</p>
          <h2 className="font-display text-3xl font-light mb-3 tracking-tight" style={{ color: PINE }}>Dengan Cinta & Restu Keluarga</h2>
          <p className="text-xs max-w-md mx-auto mb-14 font-body leading-relaxed" style={{ color: MUTED }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-14 md:gap-20">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria' },
              { person: p2, img: media.p2, label: 'Mempelai Wanita' },
            ].map(({ person, img, label }, idx) => (
              <motion.div key={label} className="flex flex-col items-center group max-w-[280px]"
                initial={{ opacity: 0, y: 30, rotate: idx === 0 ? -2 : 2 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.18 }}>
                <div className="relative mb-6">
                  <motion.div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${SAGE}55` }}
                    initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1.12, opacity: 1 }} viewport={{ once: true }}
                    transition={{ duration: 1, delay: idx * 0.2, ease: EASE }} />
                  <div className="relative overflow-hidden rounded-full" style={{ width: 190, height: 190, border: `3px solid ${CREAM}`, boxShadow: `0 18px 40px -16px ${PINE}66` }}>
                    <img src={img} alt={person.nick} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <motion.div className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.25, ease: EASE }}>
                    <Leaf className="w-7 h-7" color={CLAY} vein={PINE} />
                  </motion.div>
                </div>
                <h3 className="font-display text-xl font-normal mb-1 tracking-tight" style={{ color: CHARCOAL }}>{person.full}</h3>
                <p className="font-script text-lg mb-2" style={{ color: CLAY }}>{label}</p>
                <p className="text-sm leading-relaxed mb-3 font-body px-2" style={{ color: `${CHARCOAL}AA` }}>{person.desc}</p>
                <p className="text-xs font-body" style={{ color: MUTED }}>
                  Putra/i dari:<br /><span className="font-semibold" style={{ color: PINE }}>{person.father}</span><br />&amp; {person.mother}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: PINE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(${MOSS} 1px, transparent 1px)`, backgroundSize: '26px 26px' }} />
        <CornerLeaf className="absolute -bottom-8 -left-8 w-48 h-48" color={MOSS} opacity={0.14} />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <LeafDivider color={MOSS} />
          <p className="font-script text-2xl mb-1" style={{ color: CLAY_LIGHT }}>menuju hari bahagia</p>
          <h2 className="font-display text-3xl font-light tracking-tight" style={{ color: CREAM }}>Hitung Mengakhir</h2>
          <div className="grid grid-cols-4 gap-3 mt-10">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="flex flex-col items-center rounded-2xl py-5 px-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${MOSS}28` }}
                initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE, delay: idx * 0.12 }}>
                <motion.span className="font-display text-3xl tabular-nums font-light block"
                  style={{ color: item.accent ? CLAY_LIGHT : CREAM }}
                  key={item.val} initial={reduce ? false : { y: -10, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: EASE }}>
                  {String(item.val).padStart(2, '0')}
                </motion.span>
                <span className="text-[8px] uppercase tracking-widest mt-1.5 font-body" style={{ color: `${MOSS}AA` }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-9">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 text-xs uppercase tracking-widest font-body font-medium rounded-full transition-all duration-200 hover:scale-105"
              style={{ color: PINE, backgroundColor: CLAY_LIGHT }}>
              <Calendar className="w-3.5 h-3.5" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <FallingLeaves reduce={!!reduce} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <LeafDivider color={SAGE} />
            <p className="font-script text-2xl" style={{ color: CLAY }}>perjalanan cinta</p>
            <h2 className="font-display text-3xl font-light mt-1 tracking-tight" style={{ color: PINE }}>Cerita Kami</h2>
          </div>
          <div className="relative">
            {/* center vine */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, ${SAGE}55, ${SAGE}55, transparent)` }} />
            <div className="space-y-12">
              {stories.length > 0 && stories.map((story, idx) => {
                const left = idx % 2 === 0;
                return (
                  <motion.div key={idx} className="relative pl-12 md:pl-0"
                    initial={{ opacity: 0, x: left ? -24 : 24 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                    {/* node */}
                    <div className="absolute left-4 md:left-1/2 top-1 -translate-x-1/2">
                      <motion.div initial={{ scale: 0, rotate: -40 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.15, ease: EASE }}>
                        <Leaf className="w-5 h-5" color={CLAY} vein={PINE} />
                      </motion.div>
                    </div>
                    <div className={`md:w-1/2 ${left ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                      <span className="font-script text-xl" style={{ color: CLAY }}>{story.year}</span>
                      <h4 className="font-display text-xl font-normal tracking-tight mb-2 mt-0.5" style={{ color: PINE }}>{story.title}</h4>
                      <p className="text-sm leading-relaxed font-body" style={{ color: `${CHARCOAL}AA` }}>{story.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM_DARK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <CornerLeaf className="absolute top-0 left-0 w-44 h-44 -rotate-90" color={SAGE} opacity={0.1} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <LeafDivider color={SAGE} />
            <p className="font-script text-2xl" style={{ color: CLAY }}>informasi acara</p>
            <h2 className="font-display text-3xl font-light mt-1 tracking-tight" style={{ color: PINE }}>Waktu & Lokasi</h2>
          </div>
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)}
                className="px-5 py-2 text-xs font-body font-medium uppercase tracking-wider rounded-full transition-all duration-200"
                style={activeTab === idx
                  ? { backgroundColor: PINE, color: CREAM }
                  : { color: MUTED, border: `1px solid ${SAGE}55`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="p-8 rounded-3xl transition-all duration-300" style={{ backgroundColor: CREAM, boxShadow: `0 20px 50px -28px ${PINE}55` }}
            key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
            <div className="flex items-start gap-3 mb-3">
              <Leaf className="w-5 h-5 mt-1 flex-shrink-0" color={CLAY} vein={PINE} />
              <h3 className="font-display text-xl font-normal tracking-tight" style={{ color: PINE }}>{activeEvt.title}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-body ml-8 mb-2" style={{ color: MUTED }}>
              <Clock className="w-3.5 h-3.5" /> {activeEvt.time}
            </div>
            <div className="flex items-start gap-2 text-xs font-body ml-8 mb-2" style={{ color: MUTED }}>
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{activeEvt.venue}, {activeEvt.address}</span>
            </div>
            {activeEvt.note && <p className="text-[10px] italic font-body ml-8" style={{ color: `${CHARCOAL}88` }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 ml-8 px-4 py-2 text-xs font-body tracking-wider rounded-full transition-all hover:scale-105"
                style={{ backgroundColor: `${CLAY}18`, color: CLAY }}>
                <Map className="w-3 h-3" /> Buka Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <FallingLeaves reduce={!!reduce} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <LeafDivider color={SAGE} />
            <p className="font-script text-2xl" style={{ color: CLAY }}>galeri foto</p>
            <h2 className="font-display text-3xl font-light mt-1 tracking-tight" style={{ color: PINE }}>Kenangan Indah</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden rounded-2xl"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } : { aspectRatio: '1' }}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.08 }}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: `linear-gradient(to top, ${PINE}77, transparent)` }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${CHARCOAL}E6`, backdropFilter: 'blur(4px)' }}
          onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-all">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }}
            className="absolute left-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }}
            className="absolute right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"><ChevronRight className="w-5 h-5" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE }}
            style={{ border: `1px solid ${MOSS}33` }}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[85vh] max-w-full" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 8. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CREAM_DARK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <LeafDivider color={SAGE} />
            <p className="font-script text-2xl" style={{ color: CLAY }}>doa & ucapan</p>
            <h2 className="font-display text-3xl font-light mt-1 tracking-tight" style={{ color: PINE }}>Kirim Ucapan</h2>
          </div>

          {isSubmitted ? (
            <motion.div className="p-8 text-center rounded-3xl" style={{ backgroundColor: CREAM, border: `1px solid ${SAGE}40` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <Leaf className="w-8 h-8 mx-auto mb-3" color={CLAY} vein={PINE} />
              <p className="font-display text-sm font-medium tracking-wide" style={{ color: PINE }}>Terima kasih atas doa & ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="p-6 space-y-4 rounded-3xl" style={{ backgroundColor: CREAM, boxShadow: `0 20px 50px -28px ${PINE}55` }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm font-body outline-none transition-colors rounded-full"
                  style={{ backgroundColor: CREAM_DARK, border: `1px solid ${SAGE}33` }}
                  onFocus={(e) => e.target.style.borderColor = SAGE} onBlur={(e) => e.target.style.borderColor = `${SAGE}33`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-4 py-2.5 text-sm font-body outline-none transition-colors rounded-full"
                  style={{ backgroundColor: CREAM_DARK, border: `1px solid ${SAGE}33` }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-4 py-2.5 text-sm font-body outline-none transition-colors resize-none h-20 rounded-2xl"
                style={{ backgroundColor: CREAM_DARK, border: `1px solid ${SAGE}33` }}
                onFocus={(e) => e.target.style.borderColor = SAGE} onBlur={(e) => e.target.style.borderColor = `${SAGE}33`} />
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest font-body font-medium rounded-full transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: PINE, color: CREAM }}>
                <Send className="w-3.5 h-3.5" /> Kirim Ucapan
              </button>
            </form>
          )}

          {content.guestbook?.enabled !== false && wishes.length === 0 && (
            <p className="text-center text-sm font-body italic mt-8" style={{ color: MUTED }}>Belum ada ucapan — jadilah yang pertama mengirim doa restu.</p>
          )}

          {content.guestbook?.enabled !== false && wishes.length > 0 && (
            <div className="mt-9 space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {wishes.slice(0, 20).map((w) => (
                <div key={w.id} className="p-4 rounded-2xl" style={{ backgroundColor: CREAM, border: `1px solid ${SAGE}28` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-display text-sm font-medium tracking-wide" style={{ color: PINE }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1.5 font-body" style={{ color: CLAY }}>
                    {w.attendance === 'Hadir' ? '✅ Hadir' : '❌ Tidak Hadir'}
                  </p>
                  <p className="text-xs leading-relaxed font-body" style={{ color: `${CHARCOAL}AA` }}>{w.message}</p>
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
          <FallingLeaves reduce={!!reduce} />
          <div className="max-w-xl mx-auto text-center relative z-10">
            <LeafDivider color={SAGE} />
            <p className="font-script text-2xl" style={{ color: CLAY }}>tanda kasih</p>
            <h2 className="font-display text-3xl font-light mt-1 mb-3 tracking-tight" style={{ color: PINE }}>Kado Digital</h2>
            <p className="text-xs mb-9 max-w-sm mx-auto font-body leading-relaxed" style={{ color: MUTED }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-6 rounded-2xl transition-all" style={{ backgroundColor: CREAM_DARK, border: `1px solid ${SAGE}28` }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.12 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4" style={{ color: CLAY }} />
                    <p className="text-[9px] font-bold uppercase tracking-wider font-body" style={{ color: CLAY }}>{g.bank}</p>
                  </div>
                  <div className="w-6 my-2" style={{ height: 1, backgroundColor: `${SAGE}40` }} />
                  <p className="font-display text-base font-medium mb-1 tabular-nums" style={{ color: CHARCOAL }}>{g.number}</p>
                  <p className="text-xs mb-3 font-body" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)}
                    className="flex items-center gap-1.5 text-[10px] font-body font-medium uppercase tracking-wider hover:underline"
                    style={{ color: CLAY }}>
                    {copiedIdx === idx ? <><Check className="w-3 h-3" /> Tersalin</> : <><Copy className="w-3 h-3" /> Salin</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="relative px-6 py-28 text-center overflow-hidden"
        style={{ background: `linear-gradient(165deg, ${PINE} 0%, ${PINE_LIGHT} 50%, ${PINE} 100%)` }}>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(${MOSS} 1px, transparent 1px)`, backgroundSize: '26px 26px' }} />
        <CornerLeaf className="absolute -top-8 -right-8 w-48 h-48 rotate-90" color={MOSS} opacity={0.14} />
        <CornerLeaf className="absolute -bottom-8 -left-8 w-48 h-48 -rotate-90" color={MOSS} opacity={0.14} />
        <div className="max-w-xl mx-auto relative z-10 space-y-7">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <Sprig className="w-28 h-9 mx-auto" color={MOSS} />
          </motion.div>
          <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.15 }}>
            <span className="font-script text-2xl block" style={{ color: CLAY_LIGHT }}>terima kasih</span>
            <h2 className="font-display text-3xl font-light italic leading-snug tracking-tight" style={{ color: CREAM }}>Suatu kehormatan & kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.</h2>
          </motion.div>
          <motion.div className="space-y-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>
            <p className="text-[9px] uppercase tracking-[0.25em] font-body" style={{ color: `${MOSS}AA` }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-3xl font-light tracking-tight" style={{ color: CREAM }}>{p1.nick} <span className="font-script text-2xl" style={{ color: CLAY_LIGHT }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-widest font-body" style={{ color: `${MOSS}77` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t border-white/5 mt-14 pt-8 text-center">
          <p className="text-[8px] uppercase tracking-widest font-body" style={{ color: `${MOSS}55` }}>© 2027 {p1.nick} & {p2.nick}. Liana Series.</p>
        </div>
      </footer>
    </div>
  );
}
