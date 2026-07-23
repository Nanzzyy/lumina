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

/* ─── Motion Tokens — dreamy, slow, weightless ─── */
const EASE: [number, number, number, number] = [0.45, 0, 0.15, 1];
const EASE_FLOAT: [number, number, number, number] = [0.37, 0, 0.63, 1];
const DUR = 1.1;

/* Variant library — softer + slower than Kaze/Liana. */
const vUp: Variants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vScale: Variants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: DUR, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.3, ease: 'easeOut' } } };
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.12 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Awan" (Cloud) — Soft Dreamy Pastel ───
   Pillowy periwinkle + butter + mint on a cloud-white canvas, fluffy dreamy.
   Distinct from Kaze (ink), Liana (sage), Flora (peach), Sakura (plum). */
const PERI = '#A5B4E0';
const PERI2 = '#BEC8E8';
const BUTTER = '#F4E4A1';
const MINT = '#B5DCC2';
const CLOUD = '#FBF7FF';
const CLOUD2 = '#F2ECF8';
const INK = '#4A4458';
const MUTED = '#8E8AA0';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Arga', full: 'Arga Kusuma Adi, S.T.', father: 'Bpk. H. Kusuma Adi', mother: 'Ibu Hj. Sari Wulandari', ig: '@argaksuma', desc: 'Percaya bahwa cinta adalah angin lembut yang membawa dua hati melayang — perlahan, namun pasti menuju langit yang sama.' },
    p2: { nick: 'Mega', full: 'Mega Putri Anggraini, S.Psi.', father: 'Bpk. H. Bambang Anggraini', mother: 'Ibu Hj. Dian Permata', ig: '@megaputri', desc: 'Pencinta langit senja yang meyakini setiap awan menyimpan doa — ringan, lembut, namun membawa kita jauh.' },
  },
  date: '2027-08-21T10:00:00',
  quote: { text: 'Cinta yang sejati bagai dua awan yang bertemu di langit — tak saling menahan, justru saling melengkapi, lalu melayang bersama menyusuri cakrawala.', source: 'Sebuah harapan' },
  events: [
    { title: 'Akad Nikah', time: '09:00 - 11:00 WIB', venue: 'Pendapa Awan Putih', address: 'Jl. Bukit Langit No. 21, Lembang, Bandung', mapsUrl: 'https://maps.google.com', note: 'Khidmat dan sakral, khusus keluarga inti dan kerabat dekat' },
    { title: 'Resepsi', time: '12:00 - 16:00 WIB', venue: 'Garden by the Clouds', address: 'Jl. Pinus Indah Raya, Lembang, Bandung', mapsUrl: 'https://maps.google.com', note: 'Terbuka untuk seluruh tamu undangan' },
  ],
  stories: [
    { year: '2022', title: 'Awal Melayang', desc: 'Berjumpa di puncak bukit Lembang saat senja membubung. Mega menatap langit, Arga mengabadikannya. Sebuah awan berlalu perlahan, dan kami tahu — angin telah mempertemukan.' },
    { year: '2024', title: 'Mengarak Mimpi', desc: 'Dua tahun melayang bersama, menembus musim hujan dan cerah, mendaki bukit, menatap awan. Setiap langkah terasa ringan karena dilalui bersama, setiap mimpi diarak berdampingan.' },
    { year: '2026', title: 'Berlabuh di Langit yang Sama', desc: 'Dengan restu kedua keluarga, kami menambatkan janji. Bukan untuk berhenti melayang, melainkan melayang bersama — selamanya, di langit yang sama.' },
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
    { bank: 'Bank Mandiri', number: '1280092218765', owner: 'Arga Kusuma Adi' },
    { bank: 'Bank BCA', number: '0421887231', owner: 'Mega Putri Anggraini' },
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
  const location = content.event?.location || 'Lembang, Bandung';
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
  if (typeof window === 'undefined' || document.getElementById('awan-inv')) return;
  const s = document.createElement('style');
  s.id = 'awan-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap');
.font-display { font-family: 'Quicksand', sans-serif; }
.font-body { font-family: 'Nunito', sans-serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: clouds, balloons, bubbles ─── */

/** Fluffy cloud built from overlapping bumps. */
function Cloud({ className = 'w-24 h-14', color = CLOUD2, opacity = 1 }: { className?: string; color?: string; opacity?: number }) {
  return (
    <svg className={className} viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ opacity }}>
      <ellipse cx="60" cy="50" rx="48" ry="18" fill={color} />
      <circle cx="38" cy="40" r="20" fill={color} />
      <circle cx="64" cy="28" r="24" fill={color} />
      <circle cx="88" cy="40" r="18" fill={color} />
    </svg>
  );
}

/** Soft party balloon with a curling string. */
function Balloon({ className = 'w-8 h-12', color = BUTTER }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="20" cy="20" rx="15" ry="19" fill={color} />
      <path d="M17 39 L20 43 L23 39 Z" fill={color} />
      <path d="M20 43 Q24 49 18 54 Q22 58 20 63" stroke={color} strokeWidth="1" fill="none" opacity="0.55" />
      <ellipse cx="14" cy="13" rx="3.4" ry="5" fill="#ffffff" opacity="0.45" />
    </svg>
  );
}

/** Soft translucent bubble with a highlight. */
function Bubble({ className = 'w-6 h-6', color = PERI2 }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.45" />
      <circle cx="8.5" cy="8.5" r="3" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

/** Pillowy divider — gradient line + resting cloud. */
function CloudDivider({ color = PERI }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-7">
      <span className="h-px w-14 rounded-full" style={{ background: `linear-gradient(to left, ${color}, transparent)` }} />
      <Cloud className="w-16 h-9" color={color} opacity={0.85} />
      <span className="h-px w-14 rounded-full" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
    </div>
  );
}

/** Soft cloud-pill section number marker. */
function SectionNo({ n }: { n: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full font-display font-semibold tabular-nums"
      style={{ minWidth: '2.6rem', height: '2.6rem', padding: '0 0.9rem', color: INK, backgroundColor: `${PERI}55`, boxShadow: `0 8px 20px -10px ${PERI}88` }}
      aria-hidden="true">{n}</span>
  );
}

/** Drifting clouds across the sky — the signature ambient motion. */
function FloatingClouds({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const clouds = [
    { top: '7%', size: 1, delay: 0, dur: 30, tint: CLOUD2 },
    { top: '24%', size: 0.7, delay: 9, dur: 38, tint: PERI2 },
    { top: '52%', size: 1.2, delay: 4, dur: 32, tint: CLOUD2 },
    { top: '73%', size: 0.85, delay: 14, dur: 40, tint: PERI2 },
    { top: '88%', size: 1, delay: 7, dur: 34, tint: CLOUD2 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {clouds.map((c, i) => (
        <motion.div key={i} className="absolute" style={{ top: c.top, left: 0, scale: c.size }}
          initial={{ x: '-25vw', opacity: 0 }}
          animate={{ x: '130vw', opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'linear' }}>
          <Cloud className="w-44 h-24" color={c.tint} opacity={0.55} />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanAwan({ content, slug, preview }: MonolithicTemplateProps) {
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

  /* ── 1. COVER ── */
  if (!isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden"
        style={{ background: `linear-gradient(170deg, ${CLOUD2} 0%, ${CLOUD} 45%, ${PERI2}55 100%)` }}>
        <FloatingClouds reduce={!!reduce} />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(${PERI} 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
        <div className="absolute inset-5 rounded-[36px] pointer-events-none z-10" style={{ border: `1px solid ${PERI}44` }} />

        {/* drifting balloons */}
        {!reduce && (
          <>
            <motion.div className="absolute left-[12%] top-[18%] z-10" animate={{ y: [0, -10, 0], x: [0, 4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: EASE_FLOAT }}>
              <Balloon className="w-9 h-14" color={BUTTER} />
            </motion.div>
            <motion.div className="absolute right-[14%] top-[26%] z-10" animate={{ y: [0, -8, 0], x: [0, -3, 0] }} transition={{ duration: 4.4, repeat: Infinity, ease: EASE_FLOAT }}>
              <Balloon className="w-7 h-11" color={MINT} />
            </motion.div>
          </>
        )}

        <motion.div className="pt-14 z-20" variants={stagI} initial="hidden" animate="visible">
          <Cloud className="w-32 h-16 mx-auto" color={PERI} opacity={0.9} />
        </motion.div>

        <motion.div className="my-auto z-20 px-6 max-w-sm w-full text-center space-y-7"
          variants={stagC} initial="hidden" animate="visible">
          <motion.div variants={stagI} className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: PERI }}>The Wedding of</p>
          </motion.div>
          <motion.div variants={stagI} className="space-y-2">
            <h1 className="font-display text-5xl leading-[1.05] font-semibold tracking-tight" style={{ color: INK }}>
              {p1.nick}
              <span className="block font-display font-normal text-2xl my-1" style={{ color: PERI }}>&amp;</span>
              {p2.nick}
            </h1>
            <p className="font-display text-sm font-medium" style={{ color: MUTED }}>{displayDate}</p>
          </motion.div>
          <motion.div variants={stagI} className="space-y-3 pt-1">
            <p className="text-[10px] uppercase tracking-[0.35em] font-body font-medium" style={{ color: MUTED }}>Kepada Yth.</p>
            <div className="inline-block px-8 py-3 rounded-full" style={{ backgroundColor: `${CLOUD}CC`, boxShadow: `0 12px 30px -10px ${PERI}66`, border: `1px solid ${PERI}33` }}>
              <p className="font-display text-base font-semibold tracking-wide" style={{ color: INK }}>{guestName}</p>
            </div>
          </motion.div>
          <motion.div variants={stagI} className="pt-1">
            <button onClick={open}
              className="group relative px-10 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.03]"
              style={{ color: INK, backgroundColor: BUTTER, boxShadow: `0 14px 32px -10px ${PERI}88` }}>
              <span className="relative z-10 flex items-center gap-2"><Heart className="w-3.5 h-3.5" /> Buka Undangan</span>
              <motion.span className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)`, backgroundSize: '200% 100%' }}
                initial={{ backgroundPosition: '-200% center' }} animate={reduce ? {} : { backgroundPosition: '200% center' }} transition={{ duration: 3.4, repeat: Infinity, ease: 'linear' }} />
            </button>
          </motion.div>
        </motion.div>
        <p className="text-[7px] tracking-[0.4em] uppercase mb-6 z-20 font-body font-semibold" style={{ color: MUTED }}>#{p1.nick}{p2.nick}Awan</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: CLOUD, color: INK }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-200 hover:scale-110 rounded-full"
        style={{ backgroundColor: CLOUD, boxShadow: `0 10px 26px -8px ${PERI}88`, border: `1px solid ${PERI}44` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: PERI }} /> : <VolumeX className="w-5 h-5" style={{ color: MUTED }} />}
      </button>

      {/* ═══ 2. HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${PERI2} 0%, ${CLOUD2} 50%, ${CLOUD} 100%)` }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1, 1.06, 1] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-50" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-50" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${PERI2}66, ${CLOUD2}55, ${CLOUD}CC)` }} />
        <FloatingClouds reduce={!!reduce} />

        <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <Cloud className="w-28 h-16 mx-auto mb-6" color={CLOUD} opacity={0.95} />
          </motion.div>
          <motion.p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: PERI }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }}>Undangan Pernikahan</motion.p>
          <motion.h1 className="font-display text-6xl leading-[1.02] font-semibold tracking-tight mt-3" style={{ color: INK }}
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.55 }}>
            {p1.nick}
            <span className="block font-display font-medium text-3xl my-0.5" style={{ color: PERI }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.p className="font-display text-base font-medium mt-4" style={{ color: MUTED }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85, duration: DUR, ease: EASE }}>{displayDate}</motion.p>
          <motion.p className="text-[10px] tracking-[0.3em] uppercase font-body font-semibold mt-1" style={{ color: PERI }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: DUR, ease: EASE }}>{location}</motion.p>

          {guestName && (
            <motion.div className="mt-7 inline-block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15, duration: DUR, ease: EASE }}>
              <div className="px-5 py-2.5 text-xs font-body rounded-full" style={{ backgroundColor: `${CLOUD}CC`, boxShadow: `0 10px 24px -10px ${PERI}66`, border: `1px solid ${PERI}33` }}>
                Kepada Yth. <span className="font-bold" style={{ color: INK }}>{guestName}</span>
              </div>
            </motion.div>
          )}
          <motion.div className="mt-14 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: EASE_FLOAT }}>
            <p className="text-[8px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: MUTED }}>Scroll</p>
            <Cloud className="w-6 h-4 mt-2" color={PERI} opacity={0.8} />
          </motion.div>
        </div>
      </section>

      {/* ═══ 3. QUOTE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CLOUD }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <FloatingClouds reduce={!!reduce} />
        <div className="max-w-xl mx-auto text-center relative z-10">
          <CloudDivider color={PERI} />
          <p className="font-display text-5xl mb-2 leading-none font-medium" style={{ color: `${PERI}88` }}>&ldquo;</p>
          <motion.p className="font-display text-xl md:text-2xl leading-relaxed font-medium" style={{ color: INK }} variants={vFade}>{quote.text}</motion.p>
          <p className="font-display text-5xl mt-2 leading-none font-medium" style={{ color: `${PERI}88` }}>&rdquo;</p>
          <CloudDivider color={PERI} />
          <p className="font-display text-sm font-semibold tracking-wide" style={{ color: PERI }}>— {quote.source}</p>
        </div>
      </motion.section>

      {/* ═══ 4. COUPLE — circle photos resting on a cloud ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CLOUD2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <CloudDivider color={PERI} />
          <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-1" style={{ color: PERI }}>Kedua Mempelai</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-3" style={{ color: INK }}>Melayang Bersama, Berlabuh Berdampingan</h2>
          <p className="text-xs md:text-sm max-w-md mx-auto mb-14 font-body leading-relaxed" style={{ color: MUTED }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-14 md:gap-20">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria' },
              { person: p2, img: media.p2, label: 'Mempelai Wanita' },
            ].map(({ person, img, label }, idx) => (
              <motion.div key={label} className="flex flex-col items-center group max-w-[280px]"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.18 }}>
                <div className="relative mb-8">
                  {/* halo */}
                  <motion.div className="absolute inset-0 rounded-full"
                    initial={{ scale: 0.7, opacity: 0 }} whileInView={{ scale: 1.18, opacity: 1 }} viewport={{ once: true }}
                    transition={{ duration: 1, delay: idx * 0.2, ease: EASE }}>
                    <motion.div className="w-full h-full rounded-full" style={{ border: `2px dashed ${PERI}66` }}
                      animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} />
                  </motion.div>
                  <motion.div className="relative overflow-hidden rounded-full"
                    style={{ width: 200, height: 200, border: `4px solid ${CLOUD}`, boxShadow: `0 18px 40px -14px ${PERI}88` }}
                    animate={reduce ? {} : { y: [0, -6, 0] }} transition={{ duration: 4.5 + idx, repeat: Infinity, ease: EASE_FLOAT }}>
                    <img src={img} alt={person.nick} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                  </motion.div>
                  {/* cloud the photo rests on */}
                  <motion.div className="absolute -bottom-5 left-1/2 -translate-x-1/2"
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: idx * 0.22, ease: EASE }}>
                    <Cloud className="w-52 h-20" color={CLOUD} opacity={1} />
                  </motion.div>
                </div>
                <h3 className="font-display text-xl font-semibold mb-1 tracking-tight" style={{ color: INK }}>{person.full}</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] font-body font-semibold mb-2" style={{ color: PERI }}>{label}</p>
                <p className="text-sm leading-relaxed mb-3 font-body px-2" style={{ color: `${INK}CC` }}>{person.desc}</p>
                <p className="text-xs font-body" style={{ color: MUTED }}>
                  Putra/i dari:<br /><span className="font-bold" style={{ color: INK }}>{person.father}</span><br />&amp; {person.mother}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. COUNTDOWN — cloud-pill tiles ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${PERI2}66 0%, ${CLOUD2} 100%)` }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <FloatingClouds reduce={!!reduce} />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <CloudDivider color={PERI} />
          <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-1" style={{ color: PERI }}>Menuju Hari Bahagia</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight mb-10" style={{ color: INK }}>Hitung Mengakhir</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="flex flex-col items-center rounded-3xl py-5 px-2"
                style={{ backgroundColor: item.accent ? `${BUTTER}CC` : `${CLOUD}F2`, boxShadow: `0 12px 30px -10px ${PERI}66`, border: `1px solid ${PERI}33` }}
                initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE, delay: idx * 0.12 }}>
                <motion.div className="flex flex-col items-center"
                  animate={reduce ? {} : { y: [0, -5, 0] }} transition={{ duration: 4 + idx, repeat: Infinity, ease: EASE_FLOAT, delay: idx * 0.3 }}>
                  <motion.span className="font-display text-3xl md:text-4xl tabular-nums font-semibold block" style={{ color: item.accent ? INK : PERI }}
                    key={item.val} initial={reduce ? false : { y: -10, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45, ease: EASE }}>
                    {String(item.val).padStart(2, '0')}
                  </motion.span>
                  <span className="text-[8px] uppercase tracking-[0.25em] mt-1.5 font-body font-semibold" style={{ color: MUTED }}>{item.label}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 text-xs uppercase tracking-[0.3em] font-body font-bold rounded-full transition-all duration-300 hover:scale-105"
              style={{ color: INK, backgroundColor: BUTTER, boxShadow: `0 12px 28px -10px ${PERI}88` }}>
              <Calendar className="w-4 h-4" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. LOVE STORY ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CLOUD }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <FloatingClouds reduce={!!reduce} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <CloudDivider color={PERI} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: PERI }}>Perjalanan Cinta</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight mt-1" style={{ color: INK }}>Cerita Kami</h2>
          </div>
          <div className="relative">
            {/* floating spine */}
            <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, ${PERI}66, ${PERI}66, transparent)` }} />
            <div className="space-y-12">
              {stories.length > 0 && stories.map((story, idx) => {
                const left = idx % 2 === 0;
                return (
                  <motion.div key={idx} className="relative pl-14 md:pl-0"
                    initial={{ opacity: 0, x: left ? -24 : 24, y: 12 }} whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                    {/* cloud node */}
                    <div className="absolute left-5 md:left-1/2 top-0 -translate-x-1/2">
                      <motion.div initial={{ scale: 0, y: -8 }} whileInView={{ scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: idx * 0.15, ease: EASE }}
                        animate={reduce ? {} : { y: [0, -5, 0] }} >
                        <Cloud className="w-10 h-6" color={idx === stories.length - 1 ? BUTTER : PERI} opacity={1} />
                      </motion.div>
                    </div>
                    <div className={`md:w-1/2 ${left ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'}`}>
                      <span className="font-display text-lg font-semibold" style={{ color: PERI }}>{story.year}</span>
                      <h4 className="font-display text-xl font-semibold tracking-tight mb-2 mt-0.5" style={{ color: INK }}>{story.title}</h4>
                      <p className="text-sm leading-relaxed font-body" style={{ color: `${INK}CC` }}>{story.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ 7. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CLOUD2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <CloudDivider color={PERI} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: PERI }}>Informasi Acara</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight mt-1" style={{ color: INK }}>Waktu &amp; Lokasi</h2>
          </div>
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-5 py-2 text-xs font-body font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-200"
                style={activeTab === idx
                  ? { backgroundColor: PERI, color: CLOUD, boxShadow: `0 10px 22px -10px ${PERI}88` }
                  : { color: MUTED, border: `1px solid ${PERI}44`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="p-8 rounded-3xl" style={{ backgroundColor: CLOUD, boxShadow: `0 18px 44px -22px ${PERI}88`, border: `1px solid ${PERI}28` }}
            key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className="flex items-start gap-3 mb-3">
              <Cloud className="w-8 h-5 mt-1 flex-shrink-0" color={BUTTER} opacity={1} />
              <h3 className="font-display text-xl font-semibold tracking-tight" style={{ color: INK }}>{activeEvt.title}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-body ml-11 mb-2" style={{ color: MUTED }}>
              <Clock className="w-3.5 h-3.5" style={{ color: PERI }} /> {activeEvt.time}
            </div>
            <div className="flex items-start gap-2 text-xs font-body ml-11 mb-2" style={{ color: MUTED }}>
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: PERI }} />
              <span>{activeEvt.venue}<br />{activeEvt.address}</span>
            </div>
            {activeEvt.note && <p className="text-[10px] italic font-body ml-11" style={{ color: `${INK}88` }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 ml-11 px-4 py-2 text-xs font-body font-bold tracking-[0.2em] uppercase rounded-full transition-all hover:scale-105"
                style={{ backgroundColor: `${PERI}22`, color: PERI }}>
                <Map className="w-3 h-3" /> Buka Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 8. GALLERY ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CLOUD }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <FloatingClouds reduce={!!reduce} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <CloudDivider color={PERI} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: PERI }}>Galeri Foto</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight mt-1" style={{ color: INK }}>Kenangan Indah</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden rounded-3xl"
                style={{ ...(idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1' } : { aspectRatio: '1' }), boxShadow: `0 14px 32px -16px ${PERI}88`, border: `1px solid ${PERI}28` }}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.08 }}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" style={{ background: `linear-gradient(to top, ${PERI}99, transparent 60%)` }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${INK}E6`, backdropFilter: 'blur(6px)' }}
          onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full text-sm transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: CLOUD }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }}
            className="absolute left-4 z-10 p-2 rounded-full transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: CLOUD }} aria-label="Sebelumnya"><ChevronLeft className="w-6 h-6" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }}
            className="absolute right-4 z-10 p-2 rounded-full transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: CLOUD }} aria-label="Berikutnya"><ChevronRight className="w-6 h-6" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: EASE }}
            style={{ boxShadow: `0 30px 80px -30px ${PERI}`, border: `1px solid ${PERI}44` }}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[85vh] max-w-full rounded-3xl" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain rounded-3xl" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 9. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CLOUD2 }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <CloudDivider color={PERI} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: PERI }}>Doa &amp; Ucapan</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight mt-1" style={{ color: INK }}>Kirim Ucapan</h2>
          </div>

          {isSubmitted ? (
            <motion.div className="p-8 text-center rounded-3xl" style={{ backgroundColor: CLOUD, boxShadow: `0 18px 44px -22px ${PERI}88`, border: `1px solid ${PERI}33` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <motion.div className="mx-auto mb-3 w-fit" animate={reduce ? {} : { y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: EASE_FLOAT }}>
                <Cloud className="w-12 h-8" color={BUTTER} opacity={1} />
              </motion.div>
              <p className="font-display text-sm font-semibold tracking-wide" style={{ color: INK }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="p-6 space-y-4 rounded-3xl" style={{ backgroundColor: CLOUD, boxShadow: `0 18px 44px -22px ${PERI}88`, border: `1px solid ${PERI}28` }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm font-body outline-none transition-colors rounded-full"
                  style={{ backgroundColor: CLOUD2, border: `1px solid ${PERI}33`, color: INK }}
                  onFocus={(e) => e.target.style.borderColor = PERI} onBlur={(e) => e.target.style.borderColor = `${PERI}33`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-4 py-2.5 text-sm font-body outline-none transition-colors rounded-full"
                  style={{ backgroundColor: CLOUD2, border: `1px solid ${PERI}33`, color: INK }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-4 py-2.5 text-sm font-body outline-none transition-colors resize-none h-20 rounded-2xl"
                style={{ backgroundColor: CLOUD2, border: `1px solid ${PERI}33`, color: INK }}
                onFocus={(e) => e.target.style.borderColor = PERI} onBlur={(e) => e.target.style.borderColor = `${PERI}33`} />
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-[0.3em] font-body font-bold rounded-full transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: PERI, color: CLOUD, boxShadow: `0 12px 28px -10px ${PERI}88` }}>
                <Send className="w-4 h-4" /> Kirim Ucapan
              </button>
            </form>
          )}

          {content.guestbook?.enabled !== false && wishes.length === 0 && (
            <p className="text-center text-sm font-body italic mt-8" style={{ color: MUTED }}>Belum ada ucapan — jadilah yang pertama mengirim doa restu.</p>
          )}

          {content.guestbook?.enabled !== false && wishes.length > 0 && (
            <div className="mt-9 space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {wishes.slice(0, 20).map((w) => (
                <div key={w.id} className="p-4 rounded-2xl" style={{ backgroundColor: CLOUD, border: `1px solid ${PERI}28`, boxShadow: `0 10px 26px -18px ${PERI}88` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-display text-sm font-bold tracking-wide" style={{ color: INK }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1.5 font-body font-bold" style={{ color: PERI }}>
                    {w.attendance === 'Hadir' ? '✓ Hadir' : '✕ Tidak Hadir'}
                  </p>
                  <p className="text-xs leading-relaxed font-body" style={{ color: `${INK}CC` }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 10. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-28 overflow-hidden" style={{ backgroundColor: CLOUD }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <FloatingClouds reduce={!!reduce} />
          <div className="max-w-xl mx-auto text-center relative z-10">
            <CloudDivider color={PERI} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: PERI }}>Tanda Kasih</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight mt-1 mb-3" style={{ color: INK }}>Kado Digital</h2>
            <p className="text-xs md:text-sm mb-9 max-w-sm mx-auto font-body leading-relaxed" style={{ color: MUTED }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-6 rounded-3xl transition-all" style={{ backgroundColor: CLOUD2, border: `1px solid ${PERI}28`, boxShadow: `0 14px 32px -18px ${PERI}88` }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.12 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4" style={{ color: PERI }} />
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: PERI }}>{g.bank}</p>
                  </div>
                  <div className="w-8 my-2 rounded-full" style={{ height: 1, backgroundColor: `${PERI}44` }} />
                  <p className="font-display text-base font-semibold mb-1 tabular-nums" style={{ color: INK }}>{g.number}</p>
                  <p className="text-xs mb-3 font-body" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 text-[10px] font-body font-bold uppercase tracking-[0.2em] rounded-full px-3 py-1.5 transition-all hover:scale-105"
                    style={{ backgroundColor: `${PERI}22`, color: PERI }}>
                    {copiedIdx === idx ? <><Check className="w-3 h-3" /> Tersalin</> : <><Copy className="w-3 h-3" /> Salin</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 11. FOOTER ═══ */}
      <footer className="relative px-6 py-28 text-center overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${CLOUD2} 0%, ${PERI2}88 60%, ${PERI2} 100%)` }}>
        <FloatingClouds reduce={!!reduce} />
        <div className="max-w-xl mx-auto relative z-10 space-y-7">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <motion.div className="w-fit mx-auto" animate={reduce ? {} : { y: [0, -8, 0] }} transition={{ duration: 4.6, repeat: Infinity, ease: EASE_FLOAT }}>
              <Cloud className="w-32 h-16" color={CLOUD} opacity={1} />
            </motion.div>
          </motion.div>
          <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.15 }}>
            <h2 className="font-display text-2xl md:text-3xl font-medium italic leading-snug tracking-tight" style={{ color: INK }}>Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.</h2>
          </motion.div>
          <CloudDivider color={PERI} />
          <motion.div className="space-y-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>
            <p className="text-[9px] uppercase tracking-[0.3em] font-body font-semibold" style={{ color: PERI }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-3xl font-semibold tracking-tight" style={{ color: INK }}>{p1.nick} <span className="font-medium" style={{ color: PERI }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-[0.25em] font-body font-semibold" style={{ color: MUTED }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t mt-14 pt-8 text-center" style={{ borderColor: `${PERI}22` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body font-semibold" style={{ color: MUTED }}>© 2027 {p1.nick} &amp; {p2.nick}. Awan Series.</p>
        </div>
      </footer>
    </div>
  );
}
