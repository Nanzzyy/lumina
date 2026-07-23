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
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_INK: [number, number, number, number] = [0.65, 0, 0.35, 1];
const DUR = 0.9;

/* Variant library — varied per section; ink-wipe reveals give Kaze its character. */
const vUp: Variants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };
const vFade: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } } };
const vInkH: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 1, ease: EASE_INK } },
};
const stagC: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.13, delayChildren: 0.08 } } };
const stagI: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } };

/* ─── Palette: "Kaze" 風 (Wind) — Sumi Ink Editorial ───
   High-contrast ink-on-bone with a single vermillion seal accent.
   Overhaul of the prior soft-indigo version — bolder, magazine-grid, calligraphic. */
const INK = '#15171C';
const INK_SOFT = '#262A33';
const SUMI = '#3D424D';
const BONE = '#F3EFE6';
const BONE_DARK = '#E8E1D3';
const VERMILLION = '#D14B3D';
const VERMILLION_DEEP = '#B23A2E';
const GOLD = '#B8954E';
const CHARCOAL = '#1A1C20';
const MUTED = '#6B6E76';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Raka', full: 'Raka Pramana Putra, S.Kom.', father: 'Bpk. Dr. I Wayan Pramana', mother: 'Ibu Ni Luh Putu Sari Dewi', ig: '@rakapramana', desc: 'Percaya bahwa cinta adalah melodi paling indah yang menyelaraskan dua hati.' },
    p2: { nick: 'Dewi', full: 'Dewi Ayu Saraswati, S.Pd.', father: 'Bpk. I Ketut Arimbawa', mother: 'Ibu Ni Made Wartini', ig: '@dewiayusaras', desc: 'Pencinta seni yang meyakini setiap helai bunga mengajarkan keindahan kesabaran dan ketulusan.' },
  },
  date: '2027-05-15T09:00:00',
  quote: { text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.', source: 'QS. Ar-Rum: 21' },
  events: [
    { title: 'Akad Nikah', time: '09:00 - 11:00 WITA', venue: 'Puri Agung Saraswati', address: 'Jl. Raya Ubud, Gianyar, Bali', mapsUrl: 'https://maps.google.com', note: 'Khidmat dan sakral, khusus keluarga inti dan kerabat dekat' },
    { title: 'Resepsi', time: '12:00 - 16:00 WITA', venue: 'Taman Bunga Ubud Resort', address: 'Jl. Bunga Rampai, Ubud, Gianyar, Bali', mapsUrl: 'https://maps.google.com', note: 'Terbuka untuk seluruh tamu undangan' },
  ],
  stories: [
    { year: '2022', title: 'Awal Pertemuan', desc: 'Berawal dari sebuah pameran seni di Ubud. Raka yang sedang memotret, tanpa sengaja mengabadikan Dewi yang sedang menikmati lukisan. Sejak itu, angin membawa cerita.' },
    { year: '2024', title: 'Menyatukan Langkah', desc: 'Dua tahun saling mengenal, bertumbuh, dan berbagi mimpi. Sepakat melangkah bersama menghadapi suka duka kehidupan.' },
    { year: '2026', title: 'Ikatan Suci', desc: 'Dengan restu kedua keluarga, ikatan cinta dikukuhkan menuju pernikahan suci. Angin telah berbisik, hati telah bersatu.' },
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
    { bank: 'Bank Mandiri', number: '1180023491820', owner: 'Raka Pramana Putra' },
    { bank: 'Bank BCA', number: '0359871120', owner: 'Dewi Ayu Saraswati' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
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
  const displayDate = displayDateFrom(isoDate, 'Sabtu, 15 Mei 2027');
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
  if (typeof window === 'undefined' || document.getElementById('kaze-inv')) return;
  const s = document.createElement('style');
  s.id = 'kaze-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
.font-display { font-family: 'Shippori Mincho B1', 'Noto Serif JP', serif; }
.font-body { font-family: 'Inter', sans-serif; }
.font-kanji { font-family: 'Shippori Mincho B1', 'Noto Serif JP', serif; }
`;
  document.head.appendChild(s);
}

/* ─── Ornaments: sumi ink + wind ─── */

/** Horizontal sumi brush stroke divider. */
function BrushStroke({ className = 'w-full h-4', color = INK }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 9 C40 4 90 3 130 6 C150 7.5 170 11 200 9 C220 7.7 232 5 238 4" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      <path d="M14 11 C50 8 96 7 140 9" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/** Large translucent kanji used as a section watermark. */
function KanjiMark({ kanji = '風', className = 'w-40 h-40', color = INK, opacity = 0.05 }: { kanji?: string; className?: string; color?: string; opacity?: number }) {
  return (
    <span className={`font-kanji select-none pointer-events-none ${className}`} style={{ color, opacity, lineHeight: 1 }} aria-hidden="true">{kanji}</span>
  );
}

/** Vermillion seal stamp. */
function SealStamp({ char = '結', className = 'w-14 h-14' }: { char?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center font-kanji ${className}`} style={{ color: BONE, backgroundColor: VERMILLION, border: `2px solid ${VERMILLION_DEEP}` }} aria-hidden="true">
      {char}
    </span>
  );
}

/** Vertical drifting wind streaks — the signature ambient motion. */
function WindStreaks({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const streaks = [
    { left: '12%', h: 120, delay: 0, dur: 7 },
    { left: '28%', h: 80, delay: 1.5, dur: 9 },
    { left: '52%', h: 160, delay: 0.8, dur: 8 },
    { left: '70%', h: 100, delay: 2.2, dur: 10 },
    { left: '88%', h: 140, delay: 0.4, dur: 7.5 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {streaks.map((s, i) => (
        <motion.span key={i} className="absolute top-0 w-px"
          style={{ left: s.left, height: s.h, background: `linear-gradient(to bottom, transparent, ${SUMI}33, transparent)` }}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: [0, 0.7, 0], y: [-20, 120, 260] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'linear' }} />
      ))}
    </div>
  );
}

/** Outlined chapter numeral — editorial section marker. */
function ChapterNo({ n }: { n: string }) {
  return (
    <span className="font-display font-light leading-none" style={{ color: VERMILLION, fontSize: '3rem', WebkitTextStroke: `1px ${VERMILLION}`, WebkitTextFillColor: 'transparent' }} aria-hidden="true">
      {n}
    </span>
  );
}

/* ─── Main ─── */
export function UndanganPernikahanKaze({ content, slug, preview }: MonolithicTemplateProps) {
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
      <div className="fixed inset-0 z-50 flex overflow-hidden" style={{ backgroundColor: BONE }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(${INK} 1px, transparent 1px), linear-gradient(90deg, ${INK} 1px, transparent 1px)`, backgroundSize: '44px 44px' }} />
        <KanjiMark kanji="風" className="absolute -right-6 top-1/2 -translate-y-1/2 text-[42rem]" color={INK} opacity={0.04} />

        {/* vertical Japanese rail, left */}
        <div className="absolute left-6 top-0 bottom-0 hidden sm:flex flex-col items-center justify-between py-10 z-20">
          <span className="font-kanji text-xs tracking-[0.4em]" style={{ color: SUMI, writingMode: 'vertical-rl' }}>風 の 物 語</span>
          <motion.span initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.4 }} className="origin-top block w-px" style={{ height: 120, background: `linear-gradient(to bottom, ${VERMILLION}, transparent)` }} />
        </div>

        <motion.div className="m-auto px-6 max-w-md w-full text-center relative z-20" variants={stagC} initial="hidden" animate="visible">
          <motion.div variants={stagI} className="flex justify-center mb-8">
            <SealStamp char="結" className="w-16 h-16 text-2xl rounded-sm" />
          </motion.div>
          <motion.p variants={stagI} className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: VERMILLION }}>The Wedding of</motion.p>
          <motion.h1 variants={stagI} className="font-display text-6xl leading-[0.95] font-medium tracking-tight mt-4" style={{ color: INK }}>
            {p1.nick}
            <span className="block font-body font-light text-2xl my-2" style={{ color: VERMILLION }}>&amp;</span>
            {p2.nick}
          </motion.h1>
          <motion.div variants={stagI} className="max-w-[200px] mx-auto mt-6"><BrushStroke color={INK} /></motion.div>
          <motion.p variants={stagI} className="font-display text-sm font-light mt-5" style={{ color: SUMI }}>{displayDate}</motion.p>
          <motion.div variants={stagI} className="mt-10 space-y-2">
            <p className="text-[9px] uppercase tracking-[0.4em] font-body" style={{ color: MUTED }}>Kepada Yth.</p>
            <p className="font-display text-lg font-medium" style={{ color: INK }}>{guestName}</p>
          </motion.div>
          <motion.div variants={stagI} className="mt-9">
            <button onClick={open}
              className="group relative px-12 py-4 text-xs uppercase tracking-[0.35em] font-body font-semibold transition-all duration-300 overflow-hidden"
              style={{ color: BONE, backgroundColor: INK }}>
              <span className="relative z-10 flex items-center gap-2.5"><Heart className="w-3.5 h-3.5" /> Buka Undangan</span>
              <motion.span className="absolute inset-0 origin-left" style={{ backgroundColor: VERMILLION }}
                initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.3, ease: EASE }} />
            </button>
          </motion.div>
        </motion.div>
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[7px] tracking-[0.5em] uppercase z-20 font-body" style={{ color: MUTED }}>#{p1.nick}{p2.nick}Kaze</p>
      </div>
    );
  }

  /* ── MAIN ─── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: BONE, color: INK }}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: INK, border: `2px solid ${VERMILLION}` }}>
        {isPlaying ? <Volume2 className="w-5 h-5" style={{ color: BONE }} /> : <VolumeX className="w-5 h-5" style={{ color: BONE, opacity: 0.6 }} />}
      </button>

      {/* ═══ 1. HERO — magazine cover, offset name card ═══ */}
      <section className="relative min-h-screen flex items-end overflow-hidden" style={{ backgroundColor: INK }}>
        <motion.div className="absolute inset-0"
          animate={reduce ? {} : { scale: [1.05, 1, 1.05] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}>
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover opacity-60" /> : <img src={media.hero} alt="" className="w-full h-full object-cover opacity-60" />}
        </motion.div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, ${INK}E6 0%, ${INK}66 45%, transparent 80%)` }} />
        <WindStreaks reduce={!!reduce} />
        <KanjiMark kanji="風" className="absolute right-4 top-6 text-[12rem] leading-none" color={BONE} opacity={0.06} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20 pt-32">
          <motion.p className="text-[10px] uppercase tracking-[0.5em] font-body font-medium" style={{ color: VERMILLION }}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>Undangan Pernikahan</motion.p>
          <motion.h1 className="font-display text-7xl md:text-8xl leading-[0.9] font-medium tracking-tight mt-4" style={{ color: BONE }}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.45 }}>
            {p1.nick}<br /><span className="font-light italic" style={{ color: VERMILLION }}>&amp;</span> {p2.nick}
          </motion.h1>
          <motion.div className="flex flex-wrap items-end justify-between gap-6 mt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE, delay: 0.7 }}>
            <div>
              <p className="font-display text-lg font-light" style={{ color: BONE }}>{displayDate}</p>
              <p className="text-[10px] tracking-[0.3em] uppercase font-body font-medium mt-1" style={{ color: VERMILLION }}>{location}</p>
            </div>
            {guestName && (
              <div className="px-5 py-2.5" style={{ border: `1px solid ${BONE}33` }}>
                <p className="text-[9px] uppercase tracking-[0.3em] font-body" style={{ color: `${BONE}99` }}>Kepada Yth.</p>
                <p className="font-display text-base font-medium mt-0.5" style={{ color: BONE }}>{guestName}</p>
              </div>
            )}
          </motion.div>
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center" animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${BONE}66` }}>Scroll</span>
        </motion.div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: BONE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <WindStreaks reduce={!!reduce} />
        <KanjiMark kanji="詩" className="absolute -left-10 -top-10 text-[18rem]" color={INK} opacity={0.03} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="max-w-[140px] mx-auto mb-8"><BrushStroke color={VERMILLION} /></div>
          <motion.p className="font-display text-2xl md:text-3xl leading-relaxed font-light italic" style={{ color: INK }} variants={vUp}>{quote.text}</motion.p>
          <div className="max-w-[140px] mx-auto mt-8"><BrushStroke color={INK} /></div>
          <p className="font-display text-sm mt-5 tracking-wide" style={{ color: VERMILLION }}>— {quote.source}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE — split-screen ═══ */}
      <motion.section className="relative overflow-hidden" style={{ backgroundColor: INK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <div className="max-w-5xl mx-auto px-6 py-28 relative z-10">
          <div className="flex items-center gap-4 mb-14">
            <ChapterNo n="01" />
            <div className="flex-1"><BrushStroke color={VERMILLION} /></div>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight mb-3" style={{ color: BONE }}>Dua Jiwa, Satu Jalan</h2>
          <p className="text-sm max-w-md font-body leading-relaxed mb-16" style={{ color: `${BONE}88` }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>

          <div className="space-y-20">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria', flip: false },
              { person: p2, img: media.p2, label: 'Mempelai Wanita', flip: true },
            ].map(({ person, img, label, flip }, idx) => (
              <motion.div key={label} className={`grid md:grid-cols-2 gap-8 items-center ${flip ? 'md:[&>*:first-child]:order-2' : ''}`}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                <motion.div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}
                  variants={vInkH}>
                  <img src={img} alt={person.nick} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${INK}55, transparent 50%)` }} />
                </motion.div>
                <div className={flip ? 'md:text-left md:pl-4' : 'md:text-right md:pr-4'}>
                  <p className="text-[10px] uppercase tracking-[0.4em] font-body font-semibold mb-3" style={{ color: VERMILLION }}>{label}</p>
                  <h3 className="font-display text-3xl font-medium tracking-tight mb-3" style={{ color: BONE }}>{person.full}</h3>
                  <p className="text-sm leading-relaxed font-body mb-4" style={{ color: `${BONE}88` }}>{person.desc}</p>
                  <div className={`flex items-center gap-3 ${flip ? '' : 'md:justify-end'}`}>
                    <span className="block w-8 h-px" style={{ background: VERMILLION }} />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-body" style={{ color: MUTED }}>Putra/i dari</p>
                      <p className="text-xs font-body font-medium mt-0.5" style={{ color: BONE }}>{person.father}</p>
                      <p className="text-xs font-body" style={{ color: `${BONE}AA` }}>&amp; {person.mother}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN — oversized numerals ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: BONE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <WindStreaks reduce={!!reduce} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="flex items-center gap-4 mb-10 justify-center">
            <ChapterNo n="02" />
            <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: SUMI }}>Menuju Hari Bahagia</p>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-6">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <motion.div key={idx} className="relative"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: idx * 0.1 }}>
                <motion.span className="font-display font-light block tabular-nums leading-none"
                  style={{ color: item.accent ? VERMILLION : INK, fontSize: 'clamp(2.5rem, 9vw, 5rem)' }}
                  key={item.val} initial={reduce ? false : { y: -16, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45, ease: EASE }}>
                  {String(item.val).padStart(2, '0')}
                </motion.span>
                <span className="text-[9px] uppercase tracking-[0.3em] font-body font-medium mt-2 block" style={{ color: MUTED }}>{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-12">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T090000Z/${isoDate.replace(/[-:]/g, '').replace(/T/, '').slice(0, 8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300 hover:tracking-[0.4em]"
              style={{ color: BONE, backgroundColor: INK }}>
              <Calendar className="w-4 h-4" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY — numbered editorial chapters ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: BONE_DARK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <ChapterNo n="03" />
            <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: SUMI }}>Perjalanan Cinta</p>
          </div>
          <h2 className="font-display text-4xl font-light tracking-tight mb-16" style={{ color: INK }}>Cerita Kami</h2>
          <div className="space-y-14">
            {stories.length > 0 && stories.map((story, idx) => (
              <motion.div key={idx} className="relative pl-16"
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                <span className="absolute left-0 top-1 font-display font-light leading-none" style={{ color: VERMILLION, fontSize: '2.2rem' }}>{String(idx + 1).padStart(2, '0')}</span>
                <span className="font-body text-xs tracking-[0.3em] uppercase font-semibold" style={{ color: VERMILLION }}>{story.year}</span>
                <h4 className="font-display text-2xl font-medium tracking-tight mt-1 mb-2" style={{ color: INK }}>{story.title}</h4>
                <p className="text-sm leading-relaxed font-body max-w-lg" style={{ color: SUMI }}>{story.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: INK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vFade}>
        <KanjiMark kanji="会" className="absolute -right-8 bottom-0 text-[16rem]" color={BONE} opacity={0.04} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <ChapterNo n="04" />
            <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: `${BONE}88` }}>Informasi Acara</p>
          </div>
          <h2 className="font-display text-4xl font-light tracking-tight mb-12" style={{ color: BONE }}>Waktu &amp; Lokasi</h2>
          <div className="flex gap-3 mb-10 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)} type="button"
                className="px-6 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200"
                style={activeTab === idx
                  ? { backgroundColor: VERMILLION, color: BONE }
                  : { color: `${BONE}88`, border: `1px solid ${BONE}33`, backgroundColor: 'transparent' }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="border-l-2 pl-8 py-2" style={{ borderColor: VERMILLION }}
            key={activeTab} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: EASE }}>
            <h3 className="font-display text-2xl font-medium tracking-tight mb-4" style={{ color: BONE }}>{activeEvt.title}</h3>
            <div className="space-y-2.5 font-body text-sm" style={{ color: `${BONE}AA` }}>
              <div className="flex items-center gap-2.5"><Clock className="w-4 h-4" style={{ color: VERMILLION }} /> {activeEvt.time}</div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: VERMILLION }} /> <span>{activeEvt.venue}<br />{activeEvt.address}</span></div>
            </div>
            {activeEvt.note && <p className="text-[11px] italic font-body mt-3" style={{ color: MUTED }}>{activeEvt.note}</p>}
            {activeEvt.mapsUrl && (
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 text-xs font-body font-semibold uppercase tracking-[0.2em] transition-all duration-200 hover:gap-3"
                style={{ color: INK, backgroundColor: VERMILLION }}>
                <Map className="w-3.5 h-3.5" /> Buka Google Maps
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY — editorial grid ═══ */}
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: BONE }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <ChapterNo n="05" />
            <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: SUMI }}>Galeri Foto</p>
          </div>
          <h2 className="font-display text-4xl font-light tracking-tight mb-12" style={{ color: INK }}>Kenangan Indah</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.button key={idx} onClick={() => setLightboxIndex(idx)} type="button"
                className="relative group cursor-pointer overflow-hidden"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1' } : { aspectRatio: '1' }}
                variants={vInkH}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${INK}99, transparent 60%)` }} />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${INK}F2`, backdropFilter: 'blur(6px)' }} onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 text-2xl font-light" style={{ color: BONE }} aria-label="Tutup">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }} className="absolute left-4 z-10 p-2" style={{ color: BONE }} aria-label="Sebelumnya"><ChevronLeft className="w-7 h-7" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }} className="absolute right-4 z-10 p-2" style={{ color: BONE }} aria-label="Berikutnya"><ChevronRight className="w-7 h-7" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}
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
      <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: BONE_DARK }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
        <div className="max-w-xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <ChapterNo n="06" />
            <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: SUMI }}>Doa &amp; Ucapan</p>
          </div>
          <h2 className="font-display text-4xl font-light tracking-tight mb-10" style={{ color: INK }}>Kirim Ucapan</h2>

          {isSubmitted ? (
            <motion.div className="p-10 text-center border-l-2" style={{ borderColor: VERMILLION, backgroundColor: BONE }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <SealStamp char="礼" className="w-14 h-14 text-xl rounded-sm mx-auto mb-4" />
              <p className="font-display text-base font-medium" style={{ color: INK }}>Terima kasih atas doa &amp; ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4 border-l-2 pl-8" style={{ borderColor: VERMILLION }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-0 py-3 text-sm font-body outline-none transition-colors bg-transparent border-b"
                  style={{ color: INK, borderColor: SUMI }}
                  onFocus={(e) => e.target.style.borderColor = VERMILLION} onBlur={(e) => e.target.style.borderColor = SUMI} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="px-0 py-3 text-sm font-body outline-none bg-transparent border-b" style={{ color: INK, borderColor: SUMI }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-0 py-3 text-sm font-body outline-none transition-colors resize-none h-24 bg-transparent border-b"
                style={{ color: INK, borderColor: SUMI }}
                onFocus={(e) => e.target.style.borderColor = VERMILLION} onBlur={(e) => e.target.style.borderColor = SUMI} />
              <button type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-[0.3em] font-body font-semibold transition-all duration-300"
                style={{ color: BONE, backgroundColor: INK }}>
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
                <div key={w.id} className="pl-5 border-l" style={{ borderColor: `${VERMILLION}55` }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-display text-base font-medium" style={{ color: INK }}>{w.name}</p>
                    <span className="text-[9px] font-body" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1 font-body font-semibold" style={{ color: VERMILLION }}>{w.attendance === 'Hadir' ? '✓ Hadir' : '✕ Tidak Hadir'}</p>
                  <p className="text-sm leading-relaxed font-body" style={{ color: SUMI }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-32 overflow-hidden" style={{ backgroundColor: BONE }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={vUp}>
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <ChapterNo n="07" />
              <p className="font-display text-sm uppercase tracking-[0.3em]" style={{ color: SUMI }}>Tanda Kasih</p>
            </div>
            <h2 className="font-display text-4xl font-light tracking-tight mb-4" style={{ color: INK }}>Kado Digital</h2>
            <p className="text-sm max-w-md font-body leading-relaxed mb-10" style={{ color: SUMI }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-7 border" style={{ backgroundColor: BONE_DARK, borderColor: `${SUMI}33` }}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4" style={{ color: VERMILLION }} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-body" style={{ color: VERMILLION }}>{g.bank}</p>
                  </div>
                  <p className="font-display text-xl font-medium tabular-nums my-2" style={{ color: INK }}>{g.number}</p>
                  <p className="text-xs font-body mb-4" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)} type="button"
                    className="inline-flex items-center gap-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.2em] transition-all hover:gap-2.5"
                    style={{ color: VERMILLION }}>
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
        <KanjiMark kanji="感" className="absolute left-1/2 -translate-x-1/2 -bottom-20 text-[24rem]" color={BONE} opacity={0.04} />
        <WindStreaks reduce={!!reduce} />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="flex justify-center mb-10" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <SealStamp char="礼" className="w-16 h-16 text-2xl rounded-sm" />
          </motion.div>
          <motion.h2 className="font-display text-3xl md:text-4xl font-light italic leading-snug tracking-tight max-w-xl mx-auto" style={{ color: BONE }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            Suatu kehormatan &amp; kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </motion.h2>
          <motion.div className="max-w-[160px] mx-auto my-10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE_INK }}>
            <BrushStroke color={VERMILLION} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-body" style={{ color: VERMILLION }}>Kami yang Berbahagia</p>
            <h4 className="font-display text-4xl font-medium tracking-tight mt-3" style={{ color: BONE }}>{p1.nick} <span className="font-light italic" style={{ color: VERMILLION }}>&amp;</span> {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-[0.3em] font-body mt-2" style={{ color: `${BONE}66` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t mt-16 pt-8 text-center" style={{ borderColor: `${BONE}11` }}>
          <p className="text-[8px] uppercase tracking-[0.4em] font-body" style={{ color: `${BONE}44` }}>© 2027 {p1.nick} &amp; {p2.nick}. Kaze Series.</p>
        </div>
      </footer>
    </div>
  );
}
