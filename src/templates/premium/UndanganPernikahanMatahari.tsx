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
const EASE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DUR = 0.7;
const SPRING = { type: 'spring', stiffness: 200, damping: 14 } as const;
const SPRING_SOFT = { type: 'spring', stiffness: 160, damping: 18 } as const;

/* Variant library — bouncy spring pop-ins give Matahari its playful character. */
const vPop: Variants = { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1, transition: SPRING } };
const vUp: Variants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: SPRING_SOFT } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1, ease: EASE_OUT } } };
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.07 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 20, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: SPRING } };

/* ─── Palette: "Matahari" (Sun) — Tropical Vibrant ───
   Bold warm coral + gold sun + ocean-teal palm on cream sand.
   Rounded chunky cards, flat color blocks, joyful. */
const CORAL = '#FF6F61';
const CORAL2 = '#FF8A5C';
const GOLD = '#F6B93B';
const OCEAN = '#1F8A8A';
const SAND = '#FFF3E0';
const SAND2 = '#FBE2C4';
const INK = '#3A1F1A';
const MUTED = '#9C7060';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Bayu', full: 'Bayu Surya Aditya, S.Tr.', father: 'Bpk. Ir. Made Aditya Wijaya', mother: 'Ibu Ni Kadek Suryani', ig: '@bayusurya', desc: 'Percaya bahwa cinta adalah matahari — selalu hadir menghanguskan gelap, tak pernah lelah menyinari siapa pun yang menengadah.' },
    p2: { nick: 'Kirana', full: 'Kirana Mentari Putri, S.Pd.', father: 'Bpk. Drs. Wayan Putra Arsana', mother: 'Ibu Desak Made Ayu', ig: '@kiranamentari', desc: 'Pencinta senja dan laut. Meyakini kebahagiaan tumbuh paling subur di tanah yang disinari syukur.' },
  },
  date: '2027-07-10T16:00:00',
  quote: { text: 'Cinta yang sejati bagaikan matahari: ia tidak memilih siapa yang disinari, ia hanya bersinar — dan dengan bersinar itulah ia menghanguskan segala dingin.', source: 'Sebuah harapan hangat' },
  events: [
    { title: 'Akad Nikah', time: '09:00 - 11:00 WITA', venue: 'Chapel Pantai Tropis', address: 'Jl. Pantai Matahari Terbit, Karangasem, Bali', mapsUrl: 'https://maps.google.com', note: 'Khidmat dan sakral di bawah langit cerah, khusus keluarga inti' },
    { title: 'Resepsi', time: '18:00 - 22:00 WITA', venue: 'Tropis Garden Resort', address: 'Jl. Bunga Anggrek, Sanur, Denpasar, Bali', mapsUrl: 'https://maps.google.com', note: 'Pesta tropis bertema matahari terbenam, terbuka untuk seluruh tamu undangan' },
  ],
  stories: [
    { year: '2022', title: 'Senja Pertama', desc: 'Berjumpa di tepi pantai saat matahari terbenam. Topi Kirana terbang diterbangkan angin laut, ditangkap Bayu. Sejak itu, setiap senja terasa lebih hangat.' },
    { year: '2024', title: 'Mengejar Matahari', desc: 'Dua tahun melompati pulau demi senja yang berbeda — bersepeda di sawah, mandi hujan, tertawa lepas. Cinta yang tumbuh hangat seperti pagi di khatulistiwa.' },
    { year: '2026', title: 'Terbit Bersama', desc: 'Dengan restu kedua keluarga, kami menyatukan janji di bawah langit tropis. Seperti matahari yang tak pernah absen terbit, kami berjanji hadir setiap hari.' },
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
    { bank: 'Bank Mandiri', number: '1180023491820', owner: 'Bayu Surya Aditya' },
    { bank: 'Bank BCA', number: '0359871120', owner: 'Kirana Mentari Putri' },
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
  const displayDate = displayDateFrom(isoDate, 'Sabtu, 10 Juli 2027');
  const location = content.event?.location || 'Bali';
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
  if (typeof window === 'undefined' || document.getElementById('matahari-inv')) return;
  const s = document.createElement('style');
  s.id = 'matahari-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.font-display { font-family: 'Caprasimo', cursive; }
.font-body { font-family: 'DM Sans', sans-serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: sun + tropical flora ─── */

/** Radial sun with triangular rays + warm core. */
function Sunburst({ className = 'w-40 h-40', color = GOLD, rayColor, rays = 12 }: { className?: string; color?: string; rayColor?: string; rays?: number }) {
  const rayEls = Array.from({ length: rays }, (_, i) => {
    const angle = (360 / rays) * i;
    return <rect key={i} x="47.5" y="2" width="5" height="20" rx="2.5" fill={rayColor || color} transform={`rotate(${angle} 50 50)`} opacity="0.92" />;
  });
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {rayEls}
      <circle cx="50" cy="50" r="22" fill={color} />
      <circle cx="50" cy="50" r="22" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.18" />
    </svg>
  );
}

/** Palm leaf frond — central rib with feathered leaflets. */
function PalmFrond({ className = 'w-32 h-16', color = OCEAN, flip = false }: { className?: string; color?: string; flip?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M6 30 C56 28 108 30 154 30" stroke={color} strokeWidth="1.6" opacity="0.55" />
      {[14, 34, 54, 74, 94, 114, 134].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={16} rx="11" ry="5" fill={color} opacity={0.88 - i * 0.06} transform={`rotate(-26 ${x} 16)`} />
          <ellipse cx={x} cy={44} rx="11" ry="5" fill={color} opacity={0.88 - i * 0.06} transform={`rotate(26 ${x} 44)`} />
        </g>
      ))}
    </svg>
  );
}

/** Five-petal hibiscus flower with golden stamen. */
function Hibiscus({ className = 'w-10 h-10', color = CORAL, center = GOLD }: { className?: string; color?: string; center?: string }) {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const angle = (360 / 5) * i;
    return <ellipse key={i} cx="50" cy="30" rx="13" ry="22" fill={color} transform={`rotate(${angle} 50 50)`} opacity="0.93" />;
  });
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {petals}
      <circle cx="50" cy="50" r="9" fill={center} />
      <circle cx="50" cy="50" r="4" fill={INK} opacity="0.55" />
    </svg>
  );
}

/** Tropical divider — warm line + center sun. */
function SunDivider({ color = CORAL }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <span className="h-px w-14" style={{ background: `linear-gradient(to left, ${color}, transparent)` }} />
      <Sunburst className="w-7 h-7" color={GOLD} rayColor={color} rays={10} />
      <span className="h-px w-14" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
    </div>
  );
}

/** Section number badge — sun ring with numeral. */
function SunBadge({ n }: { n: string }) {
  return (
    <span className="inline-flex items-center justify-center font-display w-12 h-12 rounded-full text-base"
      style={{ color: INK, backgroundColor: GOLD, boxShadow: `0 6px 18px -8px ${CORAL}` }} aria-hidden="true">
      {n}
    </span>
  );
}

/** Scattered pulsing suns — the signature ambient motion. */
function SunField({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const suns = [
    { top: '8%', left: '10%', size: 64, delay: 0, dur: 7 },
    { top: '16%', left: '86%', size: 48, delay: 1.2, dur: 9 },
    { top: '42%', left: '4%', size: 56, delay: 0.6, dur: 8 },
    { top: '64%', left: '92%', size: 40, delay: 2.0, dur: 10 },
    { top: '82%', left: '14%', size: 52, delay: 1.0, dur: 7.5 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {suns.map((s, i) => (
        <motion.div key={i} className="absolute" style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          initial={{ opacity: 0 }}
          animate={{ scale: [1, 1.18, 1], rotate: [0, 18, 0], opacity: [0.22, 0.46, 0.22] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}>
          <Sunburst color={i % 2 ? GOLD : CORAL2} rayColor={i % 2 ? CORAL : GOLD} rays={10} />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanMatahari({ content, slug, preview }: MonolithicTemplateProps) {
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
        <motion.div className="absolute inset-0"
          style={{ background: `linear-gradient(120deg, ${SAND}, ${SAND2}, ${GOLD}66, ${SAND2})`, backgroundSize: '300% 300%' }}
          animate={reduce ? {} : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        <SunField reduce={!!reduce} />
        <Hibiscus className="absolute -top-4 -left-4 w-24 h-24 rotate-12" color={CORAL} center={GOLD} />
        <PalmFrond className="absolute -top-2 -right-2 w-40 h-20 rotate-[20deg]" color={OCEAN} />
        <PalmFrond className="absolute -bottom-4 -left-2 w-44 h-20 -rotate-[15deg]" color={OCEAN} flip />
        <div className="absolute inset-4 border-2 pointer-events-none rounded-[36px] z-10" style={{ borderColor: `${CORAL}33` }} />

        <motion.div className="pt-14 z-20" variants={stagI} initial="hidden" animate="visible">
          <Sunburst className="w-20 h-20 mx-auto" color={GOLD} rayColor={CORAL} />
        </motion.div>

        <motion.div className="my-auto z-20 px-6 max-w-sm w-full text-center space-y-6"
          variants={stagC} initial="hidden" animate="visible">
          <motion.p variants={stagI} className="text-[10px] uppercase tracking-[0.45em] font-body font-bold" style={{ color: CORAL }}>The Wedding of</motion.p>
          <motion.h1 variants={stagI} className="font-display text-6xl leading-[0.95] tracking-tight" style={{ color: INK }}>
            {p1.nick}
            <span className="block font-body font-light text-2xl my-1" style={{ color: OCEAN }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.div variants={stagI}><SunDivider color={CORAL} /></motion.div>
          <motion.p variants={stagI} className="font-display text-base" style={{ color: MUTED }}>{displayDate}</motion.p>
          <motion.div variants={stagI} className="space-y-2 pt-1">
            <p className="text-[9px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: MUTED }}>Kepada Yth.</p>
            <div className="inline-block px-7 py-2.5 rounded-full" style={{ backgroundColor: `${SAND2}AA`, border: `1.5px solid ${CORAL}44` }}>
              <p className="font-display text-lg" style={{ color: INK }}>{guestName}</p>
            </div>
          </motion.div>
          <motion.div variants={stagI} className="pt-2">
            <button onClick={open}
              className="group relative px-12 py-4 text-xs uppercase tracking-[0.35em] font-body font-bold rounded-full overflow-hidden transition-transform duration-300 hover:scale-105"
              style={{ color: SAND, backgroundColor: CORAL, boxShadow: `0 14px 32px -12px ${CORAL}` }}>
              <span className="relative z-10 flex items-center gap-2.5"><Heart className="w-4 h-4" /> Buka Undangan</span>
              <motion.span className="absolute inset-0 origin-center" style={{ backgroundColor: GOLD }}
                initial={{ scale: 0 }} whileHover={{ scale: 1 }} transition={{ duration: 0.3, ease: EASE }} />
            </button>
          </motion.div>
        </motion.div>
        <p className="text-[7px] tracking-[0.45em] uppercase mb-6 z-20 font-body font-semibold" style={{ color: MUTED }}>#{p1.nick}{p2.nick}Matahari</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: SAND, color: INK }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-transform duration-200 hover:scale-110 rounded-full"
        style={{ backgroundColor: CORAL, border: `2px solid ${GOLD}`, boxShadow: `0 8px 22px -8px ${CORAL}` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: SAND }} /> : <VolumeX className="w-5 h-5" style={{ color: SAND, opacity: 0.7 }} />}
      </button>

      {/* ═══ 1. HERO — bold asymmetric, sun behind names ═══ */}
      <section className="relative min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: OCEAN }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1.05, 1, 1.05] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-55" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-55" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(125deg, ${OCEAN}E6 0%, ${OCEAN}66 45%, transparent 82%)` }} />
        {!reduce && (
          <motion.div className="absolute right-[-4rem] top-[-4rem] w-[28rem] h-[28rem] pointer-events-none"
            animate={{ rotate: [0, 12, 0], scale: [1, 1.06, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}>
            <Sunburst className="w-full h-full" color={GOLD} rayColor={CORAL2} rays={16} />
          </motion.div>
        )}
        <SunField reduce={!!reduce} />
        <PalmFrond className="absolute bottom-4 left-2 w-48 h-24 -rotate-[18deg] z-[1]" color={CORAL2} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20 pt-32">
          <motion.p className="text-[10px] uppercase tracking-[0.5em] font-body font-bold inline-block px-4 py-1.5 rounded-full"
            style={{ color: SAND, backgroundColor: `${CORAL}CC` }}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>Undangan Pernikahan</motion.p>
          <motion.h1 className="font-display text-7xl md:text-8xl leading-[0.9] tracking-tight mt-5" style={{ color: SAND }}
            initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={SPRING_SOFT}>
            {p1.nick}<br /><span style={{ color: GOLD }}>&amp;</span> {p2.nick}
          </motion.h1>
          <motion.div className="flex flex-wrap items-end justify-between gap-6 mt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 0.7 }}>
            <div>
              <p className="font-display text-xl" style={{ color: SAND }}>{displayDate}</p>
              <p className="text-[10px] tracking-[0.3em] uppercase font-body font-bold mt-1 inline-block px-3 py-1 rounded-full" style={{ color: SAND, backgroundColor: `${GOLD}55` }}>{location}</p>
            </div>
            {guestName && (
              <div className="px-5 py-2.5 rounded-2xl" style={{ backgroundColor: `${SAND}1A`, border: `1.5px solid ${SAND}40` }}>
                <p className="text-[9px] uppercase tracking-[0.3em] font-body font-semibold" style={{ color: `${SAND}AA` }}>Kepada Yth.</p>
                <p className="font-display text-base mt-0.5" style={{ color: SAND }}>{guestName}</p>
              </div>
            )}
          </motion.div>
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-[8px] uppercase tracking-[0.4em] font-body font-bold" style={{ color: `${SAND}88` }}>Scroll</span>
          <Sunburst className="w-4 h-4 mt-1.5" color={GOLD} rayColor={SAND} rays={8} />
        </motion.div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: SAND }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <SunField reduce={!!reduce} />
        <Sunburst className="absolute -left-10 -top-10 w-56 h-56" color={GOLD} rayColor={CORAL2} rays={16} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <SunDivider color={CORAL} />
          <p className="font-display text-6xl leading-none" style={{ color: `${CORAL}55` }}>"</p>
          <motion.p className="font-display text-2xl md:text-3xl leading-relaxed px-2" style={{ color: INK }} variants={vUp}>{quote.text}</motion.p>
          <p className="font-display text-6xl mt-1 leading-none" style={{ color: `${CORAL}55` }}>"</p>
          <SunDivider color={CORAL} />
          <p className="font-body text-sm font-semibold tracking-wide" style={{ color: CORAL }}>{quote.source ? '— ' + quote.source : ''}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE — arched (rounded-top) photo cards side-by-side ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: SAND2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <Hibiscus className="absolute top-6 right-6 w-20 h-20 rotate-12" color={CORAL} center={GOLD} />
        <PalmFrond className="absolute bottom-2 left-0 w-44 h-20 -rotate-[12deg]" color={OCEAN} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <SunDivider color={CORAL} />
          <h2 className="font-display text-4xl md:text-5xl tracking-tight" style={{ color: INK }}>Dua Hati, Satu Matahari</h2>
          <p className="text-sm max-w-md mx-auto font-body leading-relaxed mt-3 mb-14" style={{ color: MUTED }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria' },
              { person: p2, img: media.p2, label: 'Mempelai Wanita' },
            ].map(({ person, img, label }, idx) => (
              <motion.div key={label} className="rounded-3xl overflow-hidden"
                style={{ backgroundColor: SAND, boxShadow: `0 22px 50px -24px ${INK}55` }}
                initial={{ opacity: 0, y: 36, scale: 0.92 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }} transition={{ ...SPRING_SOFT, delay: idx * 0.16 }}>
                <div className="relative overflow-hidden rounded-t-[140px] rounded-b-3xl" style={{ aspectRatio: '4/5' }}>
                  <img src={img} alt={person.nick} className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${INK}55, transparent 55%)` }} />
                  <div className="absolute top-3 right-3"><Hibiscus className="w-9 h-9" color={CORAL} center={GOLD} /></div>
                </div>
                <div className="p-6 text-left">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold mb-2" style={{ color: OCEAN }}>{label}</p>
                  <h3 className="font-display text-2xl tracking-tight mb-2" style={{ color: INK }}>{person.full}</h3>
                  <p className="text-sm leading-relaxed font-body mb-4" style={{ color: MUTED }}>{person.desc}</p>
                  <div className="pt-3" style={{ borderTop: `1.5px dashed ${CORAL}44` }}>
                    <p className="text-[10px] uppercase tracking-wider font-body font-bold mb-1" style={{ color: CORAL }}>Putra/i dari</p>
                    <p className="text-sm font-body font-semibold" style={{ color: INK }}>{person.father}</p>
                    <p className="text-sm font-body" style={{ color: MUTED }}>&amp; {person.mother}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN — big rounded number pills (CORAL/GOLD/OCEAN) ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: OCEAN }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `radial-gradient(${GOLD} 1.5px, transparent 1.5px)`, backgroundSize: '28px 28px' }} />
        {!reduce && (
          <motion.div className="absolute left-1/2 -translate-x-1/2 -top-16 w-56 h-56 pointer-events-none"
            animate={{ rotate: [0, 360], scale: [1, 1.08, 1] }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}>
            <Sunburst color={GOLD} rayColor={CORAL2} rays={18} />
          </motion.div>
        )}
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <SunDivider color={GOLD} />
          <p className="font-body text-sm uppercase tracking-[0.3em] font-bold" style={{ color: GOLD }}>Menuju Hari Bahagia</p>
          <h2 className="font-display text-4xl tracking-tight mt-2" style={{ color: SAND }}>Hitung Mengakhir</h2>
          <div className="grid grid-cols-4 gap-2 md:gap-4 mt-10">
            {[
              { label: 'Hari', val: countdown.days, bg: CORAL },
              { label: 'Jam', val: countdown.hours, bg: GOLD },
              { label: 'Menit', val: countdown.minutes, bg: OCEAN, border: true },
              { label: 'Detik', val: countdown.seconds, bg: CORAL2, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="rounded-3xl py-5 px-1"
                style={{ backgroundColor: item.border ? `${SAND}1A` : item.bg, border: item.border ? `2px solid ${SAND}40` : 'none' }}
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ ...SPRING, delay: idx * 0.1 }}>
                <motion.span className="font-display text-3xl md:text-5xl tabular-nums block leading-none"
                  style={{ color: item.border ? SAND : INK }}
                  key={item.val} initial={reduce ? false : { y: -12, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: EASE }}>
                  {String(item.val).padStart(2, '0')}
                </motion.span>
                <span className="text-[9px] uppercase tracking-[0.25em] font-body font-bold mt-2 block" style={{ color: item.border ? `${SAND}CC` : `${INK}CC` }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-11">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-9 py-4 text-xs uppercase tracking-[0.3em] font-body font-bold rounded-full transition-transform duration-200 hover:scale-105"
              style={{ color: INK, backgroundColor: GOLD, boxShadow: `0 12px 28px -12px ${INK}` }}>
              <Calendar className="w-4 h-4" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY — chunky numbered cards ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: SAND }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <SunField reduce={!!reduce} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4 justify-center">
            <SunBadge n="01" />
            <p className="font-body text-sm uppercase tracking-[0.3em] font-bold" style={{ color: MUTED }}>Perjalanan Cinta</p>
          </div>
          <h2 className="font-display text-4xl text-center tracking-tight mb-14" style={{ color: INK }}>Cerita Kami</h2>
          <div className="space-y-6">
            {stories.length > 0 && stories.map((story, idx) => (
              <motion.div key={idx} className="rounded-3xl p-7 relative overflow-hidden"
                style={{ backgroundColor: idx % 2 ? SAND2 : `${GOLD}33`, border: `2px solid ${CORAL}22` }}
                initial={{ opacity: 0, y: 30, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }} transition={{ ...SPRING_SOFT, delay: idx * 0.1 }}>
                <Sunburst className="absolute -right-6 -top-6 w-24 h-24 opacity-30" color={GOLD} rayColor={CORAL} rays={14} />
                <div className="relative flex items-start gap-4">
                  <span className="font-display text-3xl leading-none flex-shrink-0" style={{ color: CORAL }}>{String(idx + 1).padStart(2, '0')}</span>
                  <div>
                    <span className="font-body text-xs tracking-[0.3em] uppercase font-bold" style={{ color: OCEAN } as const}>{story.year}</span>
                    <h4 className="font-display text-2xl tracking-tight mt-1 mb-2" style={{ color: INK }}>{story.title}</h4>
                    <p className="text-sm leading-relaxed font-body" style={{ color: MUTED }}>{story.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: SAND2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <PalmFrond className="absolute top-4 right-0 w-44 h-20 rotate-[15deg]" color={OCEAN} flip />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4 justify-center">
            <SunBadge n="02" />
            <p className="font-body text-sm uppercase tracking-[0.3em] font-bold" style={{ color: MUTED }}>Informasi Acara</p>
          </div>
          <h2 className="font-display text-4xl text-center tracking-tight mb-12" style={{ color: INK }}>Waktu &amp; Lokasi</h2>
          <div className="flex gap-3 mb-8 flex-wrap justify-center">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-6 py-3 text-xs font-body font-bold uppercase tracking-[0.2em] rounded-full transition-transform duration-200 hover:scale-105"
                style={activeTab === idx
                  ? { backgroundColor: CORAL, color: SAND, boxShadow: `0 8px 20px -10px ${CORAL}` }
                  : { color: MUTED, border: `2px solid ${CORAL}33`, backgroundColor: `${SAND}80` }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="rounded-3xl p-8 relative overflow-hidden" style={{ backgroundColor: SAND, boxShadow: `0 22px 50px -28px ${INK}55`, border: `2px solid ${CORAL}22` }}
            key={activeTab} initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={SPRING_SOFT}>
            <Sunburst className="absolute -right-8 -bottom-8 w-32 h-32 opacity-20" color={GOLD} rayColor={CORAL} rays={14} />
            <div className="relative">
              <h3 className="font-display text-2xl tracking-tight mb-5" style={{ color: INK }}>{activeEvt.title}</h3>
              <div className="space-y-3 font-body text-sm" style={{ color: MUTED }}>
                <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 flex-shrink-0" style={{ color: CORAL }} /> {activeEvt.time}</div>
                <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: CORAL }} /> <span>{activeEvt.venue}<br />{activeEvt.address}</span></div>
              </div>
              {activeEvt.note && <p className="text-[11px] italic font-body mt-3" style={{ color: OCEAN }}>{activeEvt.note}</p>}
              {activeEvt.mapsUrl && (
                <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 text-xs font-body font-bold uppercase tracking-[0.2em] rounded-full transition-transform duration-200 hover:scale-105"
                  style={{ color: SAND, backgroundColor: OCEAN }}>
                  <Map className="w-3.5 h-3.5" /> Buka Google Maps
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY — chunky grid ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: SAND }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <SunField reduce={!!reduce} />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4 justify-center">
            <SunBadge n="03" />
            <p className="font-body text-sm uppercase tracking-[0.3em] font-bold" style={{ color: MUTED }}>Galeri Foto</p>
          </div>
          <h2 className="font-display text-4xl text-center tracking-tight mb-12" style={{ color: INK }}>Kenangan Indah</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden rounded-3xl"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1' } : { aspectRatio: '1' }}
                variants={vPop}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" style={{ background: `linear-gradient(to top, ${CORAL}AA, transparent 60%)` }} />
                {idx === 0 && <div className="absolute top-3 left-3"><Hibiscus className="w-8 h-8" color={CORAL} center={GOLD} /></div>}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${INK}F2`, backdropFilter: 'blur(6px)' }} onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full text-2xl font-light" style={{ color: SAND, backgroundColor: `${CORAL}AA` }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2.5 rounded-full" style={{ color: SAND, backgroundColor: `${CORAL}AA` }} aria-label="Sebelumnya"><ChevronLeft className="w-6 h-6" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2.5 rounded-full" style={{ color: SAND, backgroundColor: `${CORAL}AA` }} aria-label="Berikutnya"><ChevronRight className="w-6 h-6" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[85vh] max-w-full" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 8. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: SAND2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <Hibiscus className="absolute top-8 left-6 w-16 h-16 -rotate-12" color={CORAL} center={GOLD} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4 justify-center">
            <SunBadge n="04" />
            <p className="font-body text-sm uppercase tracking-[0.3em] font-bold" style={{ color: MUTED }}>Doa &amp; Ucapan</p>
          </div>
          <h2 className="font-display text-4xl text-center tracking-tight mb-10" style={{ color: INK }}>Kirim Ucapan</h2>

          {isSubmitted ? (
            <motion.div className="p-10 text-center rounded-3xl" style={{ backgroundColor: SAND, border: `2px solid ${GOLD}66` }}
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}>
              <Sunburst className="w-14 h-14 mx-auto mb-3" color={GOLD} rayColor={CORAL} />
              <p className="font-display text-lg" style={{ color: INK }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="p-7 space-y-4 rounded-3xl" style={{ backgroundColor: SAND, boxShadow: `0 22px 50px -28px ${INK}55`, border: `2px solid ${CORAL}22` }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm font-body outline-none transition-colors rounded-full"
                  style={{ backgroundColor: SAND2, border: `1.5px solid ${CORAL}22` }}
                  onFocus={(e) => e.target.style.borderColor = CORAL} onBlur={(e) => e.target.style.borderColor = `${CORAL}22`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-4 py-3 text-sm font-body outline-none rounded-full"
                  style={{ backgroundColor: SAND2, border: `1.5px solid ${CORAL}22`, color: INK }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-4 py-3 text-sm font-body outline-none transition-colors resize-none h-24 rounded-2xl"
                style={{ backgroundColor: SAND2, border: `1.5px solid ${CORAL}22`, color: INK }}
                onFocus={(e) => e.target.style.borderColor = CORAL} onBlur={(e) => e.target.style.borderColor = `${CORAL}22`} />
              <button type="submit"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-bold rounded-full transition-transform duration-200 hover:scale-[1.02]"
                style={{ color: SAND, backgroundColor: CORAL, boxShadow: `0 12px 28px -12px ${CORAL}` }}>
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
                <div key={w.id} className="p-4 rounded-2xl" style={{ backgroundColor: SAND, border: `1.5px solid ${GOLD}33` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-display text-base" style={{ color: INK }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1.5 font-body font-bold" style={{ color: CORAL }}>{w.attendance === 'Hadir' ? '✓ Hadir' : '✕ Tidak Hadir'}</p>
                  <p className="text-sm leading-relaxed font-body" style={{ color: MUTED }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: SAND }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <SunField reduce={!!reduce} />
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-4 justify-center">
              <SunBadge n="05" />
              <p className="font-body text-sm uppercase tracking-[0.3em] font-bold" style={{ color: MUTED }}>Tanda Kasih</p>
            </div>
            <h2 className="font-display text-4xl text-center tracking-tight mb-3" style={{ color: INK }}>Kado Digital</h2>
            <p className="text-sm max-w-md mx-auto text-center font-body leading-relaxed mb-10" style={{ color: MUTED }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-7 rounded-3xl relative overflow-hidden"
                  style={{ backgroundColor: SAND2, border: `2px solid ${CORAL}22` }}
                  initial={{ opacity: 0, y: 24, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }} transition={{ ...SPRING_SOFT, delay: idx * 0.12 }}>
                  <Sunburst className="absolute -right-5 -top-5 w-20 h-20 opacity-25" color={GOLD} rayColor={CORAL} rays={12} />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4" style={{ color: CORAL }} />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: CORAL }}>{g.bank}</p>
                    </div>
                    <p className="font-display text-xl tabular-nums my-2" style={{ color: INK }}>{g.number}</p>
                    <p className="text-xs font-body mb-4" style={{ color: MUTED }}>A/N: {g.owner}</p>
                    <button onClick={() => copy(g.number, idx)} type="button"
                      className="inline-flex items-center gap-1.5 text-[10px] font-body font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full transition-transform hover:scale-105"
                      style={{ color: SAND, backgroundColor: CORAL }}>
                      {copiedIdx === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin</>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="relative px-6 py-28 text-center overflow-hidden" style={{ backgroundColor: OCEAN }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `radial-gradient(${GOLD} 1.5px, transparent 1.5px)`, backgroundSize: '28px 28px' }} />
        {!reduce && (
          <motion.div className="absolute left-1/2 -translate-x-1/2 -top-20 w-72 h-72 pointer-events-none"
            animate={{ rotate: [0, 360], scale: [1, 1.07, 1] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
            <Sunburst color={GOLD} rayColor={CORAL2} rays={20} />
          </motion.div>
        )}
        <PalmFrond className="absolute bottom-2 left-0 w-48 h-24 -rotate-[15deg]" color={CORAL2} />
        <PalmFrond className="absolute bottom-2 right-0 w-48 h-24 rotate-[15deg]" color={CORAL2} flip />
        <SunField reduce={!!reduce} />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="flex justify-center mb-8" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={SPRING}>
            <Sunburst className="w-16 h-16" color={GOLD} rayColor={CORAL2} rays={14} />
          </motion.div>
          <motion.h2 className="font-display text-3xl md:text-4xl italic leading-snug tracking-tight max-w-xl mx-auto" style={{ color: SAND }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </motion.h2>
          <div className="my-9"><SunDivider color={GOLD} /></div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-bold" style={{ color: GOLD }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl tracking-tight mt-3" style={{ color: SAND }}>{p1.nick} <span style={{ color: GOLD }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-[0.3em] font-body font-bold mt-2" style={{ color: `${SAND}88` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t mt-14 pt-8 text-center" style={{ borderColor: `${SAND}1A` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body font-bold" style={{ color: `${SAND}66` }}>© 2027 {p1.nick} &amp; {p2.nick}. Matahari Series.</p>
        </div>
      </footer>
    </div>
  );
}
