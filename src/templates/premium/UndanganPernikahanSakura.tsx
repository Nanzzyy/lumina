'use client';

import { useState, useRef, useEffect } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent } from '@/lib/content/types';
import {
  Heart, Calendar, Clock, MapPin, Send, Gift, Copy, Check, ChevronLeft, ChevronRight,
  Volume2, VolumeX, Map,
} from 'lucide-react';
import { isVideo, useCountdown, useGuestName, displayDateFrom, pickMedia, useRsvpWishes } from './shared';
import { motion, type Variants } from 'framer-motion';

/* ─── Design Constants ─── */
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const DUR = 0.6;

const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } },
};

/* ─── Colors — Rose-Plum Mono Family ─── */
const SAKURA = '#D489A8';
const SAKURA_LIGHT = '#E8C4D0';
const PLUM = '#3D2352';
const PLUM_LIGHT = '#5A3D6E';
const ROSE_GOLD = '#C9A0A8';
const BG_LIGHT = '#F8F0F2';
const BG = '#F0E6EA';
const DARK_TEXT = '#2D1B36';
const MUTED = '#8A7A8A';

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
    { year: '2022', title: 'Di Bawah Rindang Sakura', desc: 'Berawal dari festival bunga di Ubud. Raka tanpa sengaja bertemu Dewi di taman sakura, berbagi cerita tentang seni dan kehidupan.' },
    { year: '2024', title: 'Menyatukan Langkah', desc: 'Dua tahun saling mengenal, bertumbuh, dan berbagi mimpi. Sepakat melangkah bersama menghadapi suka duka kehidupan.' },
    { year: '2026', title: 'Satu Hati, Satu Cinta', desc: 'Raka meminang Dewi di bawah pohon sakura di puncak musim semi. Dengan restu kedua keluarga, ikatan cinta dikukuhkan menuju pernikahan suci.' },
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
    : DEFAULTS.gifts).filter((g) => g.bank || g.number);
  const quote = content.quote?.text ? { text: content.quote.text, source: content.quote.source || '' } : DEFAULTS.quote;
  const audio = content.music?.src || DEFAULTS.audio;
  const media = pickMedia(content, { cover: DEFAULTS.cover, hero: DEFAULTS.hero, p1: DEFAULTS.p1, p2: DEFAULTS.p2 });
  return { p1, p2, isoDate, displayDate, location, events, stories, gallery, gifts, quote, audio, media };
}

function injectStyles() {
  if (typeof window === 'undefined' || document.getElementById('sakura-inv')) return;
  const s = document.createElement('style');
  s.id = 'sakura-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,200..1000;1,9..40,200..1000&family=Petit+Formal+Script&display=swap');
.font-script { font-family: 'Petit Formal Script', cursive; }
.font-title { font-family: 'Noto Serif JP', serif; }
.font-sans { font-family: 'DM Sans', sans-serif; }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
`;
  document.head.appendChild(s);
}

/* ─── SVG Ornaments ─── */
function SakuraBlossom({ className = "w-8 h-8", fill }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill={fill || SAKURA}>
      <path d="M50 20 Q60 5 50 35 Q40 5 50 20Z" opacity="0.8" />
      <path d="M50 20 Q75 10 60 32 Q70 15 50 20Z" opacity="0.6" />
      <path d="M50 20 Q25 10 40 32 Q30 15 50 20Z" opacity="0.6" />
      <circle cx="50" cy="32" r="5" fill={ROSE_GOLD} opacity="0.7" />
      <circle cx="50" cy="32" r="2.5" fill="white" opacity="0.4" />
      <path d="M50 30 Q55 40 58 45 Q52 42 50 45 Q48 42 42 45 Q45 40 50 30Z" fill={SAKURA_LIGHT} opacity="0.6" />
    </svg>
  );
}

function OrnateDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 my-6 ${className}`}>
      <span className="h-px w-8 rounded-full" style={{ background: `linear-gradient(to left, ${SAKURA}60, transparent)` }} />
      <span style={{ color: `${SAKURA}80`, fontSize: 14 }}>✦</span>
      <span className="h-px w-8 rounded-full" style={{ background: `linear-gradient(to right, ${SAKURA}60, transparent)` }} />
    </div>
  );
}

function FloatingPetals() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div key={i} className="absolute"
          initial={{ y: -30, x: `${5 + (i * 13) % 90}%`, opacity: 0, rotate: 0 }}
          animate={{ y: '100vh', opacity: [0, 0.5, 0.2, 0], rotate: 360 }}
          transition={{ duration: 7 + i * 1.5, delay: i * 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ left: `${5 + (i * 13) % 90}%` }}>
          <svg width={`${12 + i % 2 * 6}`} height={`${14 + i % 2 * 6}`} viewBox="0 0 20 24" fill={SAKURA}>
            <path d="M10 3 Q13 0 10 6 Q7 0 10 3Z" />
            <path d="M10 6 Q16 8 13 12 Q14 7 10 6Z" opacity="0.8" />
            <path d="M10 6 Q4 8 7 12 Q6 7 10 6Z" opacity="0.8" />
            <circle cx="10" cy="7" r="1.5" fill={ROSE_GOLD} opacity="0.6" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export function UndanganPernikahanSakura({ content, slug, preview }: MonolithicTemplateProps) {
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
        style={{ background: `linear-gradient(160deg, ${PLUM} 0%, ${PLUM_LIGHT} 40%, ${PLUM} 100%)` }}>
        <FloatingPetals />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white'%3E%3Ccircle cx='30' cy='30' r='3' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${SAKURA}14 0%, transparent 60%)` }} />
        <div className="absolute inset-3 border border-white/10 pointer-events-none rounded-[32px] z-10" />
        <div className="absolute inset-6 border border-white/5 pointer-events-none rounded-[24px] z-10" />

        <motion.div className="pt-8 z-20" variants={staggerItem} initial="hidden" animate="visible">
          <SakuraBlossom className="w-16 h-16 mx-auto" fill={SAKURA} />
        </motion.div>

        <motion.div className="my-auto z-20 space-y-8 px-6 max-w-sm w-full text-center"
          variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={staggerItem} className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.4em] font-sans font-medium" style={{ color: SAKURA }}>The Wedding of</span>
            <div className="w-12 h-[1.5px] mx-auto rounded-full" style={{ background: `linear-gradient(to right, transparent, ${SAKURA}, transparent)` }} />
          </motion.div>
          <motion.div variants={staggerItem} className="space-y-4">
            <h1 className="font-script text-5xl leading-tight text-white">
              {p1.nick} <span className="inline-block mx-1 text-2xl font-script italic" style={{ color: SAKURA }}>&</span> {p2.nick}
            </h1>
            <p className="font-title text-sm" style={{ color: `${SAKURA_LIGHT}CC` }}>{displayDate}</p>
          </motion.div>
          <motion.div variants={staggerItem} className="space-y-4 pt-2">
            <p className="text-[9px] uppercase tracking-[0.3em] font-sans font-medium" style={{ color: `${MUTED}CC` }}>Kepada Yth.</p>
            <div className="inline-block rounded-2xl px-7 py-3 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${SAKURA}40` }}>
              <p className="font-title text-base font-light text-white">{guestName}</p>
            </div>
          </motion.div>
          <motion.div variants={staggerItem} className="pt-4">
            <button onClick={open}
              className="group relative px-10 py-3.5 text-white rounded-full transition-all duration-500 text-xs uppercase tracking-[0.25em] font-medium overflow-hidden"
              style={{ backgroundColor: SAKURA }}>
              <span className="relative z-10 flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 fill-current" /> Buka Undangan
              </span>
              <span className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)`, backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }} />
            </button>
          </motion.div>
        </motion.div>
        <p className="text-[7px] tracking-[0.35em] uppercase mb-6 z-20" style={{ color: `${SAKURA}66` }}>#{p1.nick}{p2.nick}Sakura</p>
      </div>
    );
  }

  /* ── MAIN ── */
  return (
    <div className="font-sans min-h-screen relative overflow-x-hidden" style={{ backgroundColor: BG_LIGHT, color: DARK_TEXT }}>
      <audio ref={audioRef} src={audio} loop />
      <FloatingPetals />

      {/* Music toggle */}
      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 shadow-xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: `1px solid ${SAKURA}33` }}>
        {isPlaying ? (
          <span className="relative flex items-center justify-center">
            <span className="absolute animate-ping inline-flex h-full w-full rounded-full" style={{ backgroundColor: `${SAKURA}40` }} />
            <Volume2 className="w-5 h-5" style={{ color: SAKURA }} />
          </span>
        ) : <VolumeX className="w-5 h-5" style={{ color: `${DARK_TEXT}66` }} />}
      </button>

      {/* ═══ 1. HERO ═══ */}
      <motion.section className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${PLUM} 0%, ${PLUM_LIGHT} 50%, ${BG_LIGHT} 100%)` }}>
        <div className="absolute inset-0 opacity-20">
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover" /> : <img src={media.hero} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${PLUM}99, transparent, ${PLUM}CC)` }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${SAKURA}1A 0%, transparent 50%)` }} />
        <motion.div className="absolute top-6 left-6" animate={{ x: [-6, 6, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <SakuraBlossom className="w-10 h-10" />
        </motion.div>
        <motion.div className="absolute top-6 right-6" animate={{ x: [6, -6, 6] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <SakuraBlossom className="w-8 h-8" />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.2 }}>
            <SakuraBlossom className="w-12 h-12 mx-auto mb-6" />
          </motion.div>
          <motion.div className="space-y-3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.4 }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-sans font-medium" style={{ color: SAKURA }}>Undangan Pernikahan</p>
            <div className="w-10 mx-auto rounded-full" style={{ height: 1.5, background: `linear-gradient(to right, transparent, ${SAKURA}, transparent)` }} />
          </motion.div>
          <motion.div className="space-y-3 mt-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.6 }}>
            <h1 className="font-script text-5xl leading-tight text-white">{p1.nick} <span className="text-2xl block mt-1" style={{ color: SAKURA }}>&amp;</span> {p2.nick}</h1>
            <p className="font-title text-sm font-light" style={{ color: `${SAKURA_LIGHT}CC` }}>{displayDate}</p>
            <p className="text-[10px] tracking-[0.25em] uppercase font-sans font-medium" style={{ color: `${SAKURA}CC` }}>{location}</p>
          </motion.div>
          {guestName && (
            <motion.div className="mt-8 inline-block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR, ease: EASE, delay: 0.8 }}>
              <div className="px-5 py-2 rounded-full backdrop-blur-sm text-xs font-light" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: `1px solid ${SAKURA}40` }}>
                Kepada Yth. <span className="font-medium text-white">{guestName}</span>
              </div>
            </motion.div>
          )}
          <motion.div className="mt-16" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <p className="text-[8px] uppercase tracking-widest" style={{ color: `${SAKURA}99` }}>Scroll</p>
            <div className="mx-auto mt-2 w-[1px] h-8" style={{ background: `linear-gradient(to bottom, ${SAKURA}, transparent)` }} />
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 2. QUOTE ═══ */}
      <motion.section className="relative px-6 py-24 overflow-hidden"
        style={{ backgroundColor: BG_LIGHT }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={scrollReveal}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${SAKURA}0A 0%, transparent 50%)` }} />
        <div className="max-w-xl mx-auto text-center relative z-10">
          <OrnateDivider />
          <p className="font-title text-4xl mb-4 leading-none" style={{ color: SAKURA }}>"</p>
          <p className="font-sans text-base leading-relaxed px-4 font-light" style={{ color: `${DARK_TEXT}CC` }}>{quote.text}</p>
          <p className="font-title text-4xl mt-4 leading-none" style={{ color: SAKURA }}>"</p>
          <div className="w-10 mx-auto my-5 rounded-full" style={{ height: 1.5, background: `linear-gradient(to right, transparent, ${SAKURA}, transparent)` }} />
          <p className="text-[10px] font-sans font-medium uppercase tracking-[0.25em]" style={{ color: MUTED }}>— {quote.source}</p>
        </div>
      </motion.section>

      {/* ═══ 3. COUPLE ═══ */}
      <motion.section className="relative px-6 py-24 overflow-hidden"
        style={{ backgroundColor: BG }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={scrollReveal}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${ROSE_GOLD}0A 0%, transparent 50%)` }} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <OrnateDivider />
          <p className="text-[9px] uppercase tracking-[0.35em] font-sans font-medium mb-2" style={{ color: MUTED }}>Kedua Mempelai</p>
          <h2 className="font-title text-3xl mb-4" style={{ color: PLUM }}>Dengan Cinta & Restu Keluarga</h2>
          <p className="text-xs max-w-md mx-auto mb-16" style={{ color: MUTED }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria', side: 'right' as const },
              { person: p2, img: media.p2, label: 'Mempelai Wanita', side: 'left' as const },
            ].map(({ person, img, label }, idx) => (
              <motion.div key={label} className="flex flex-col items-center group w-full max-w-[280px]"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.15 }}>
                <div className="relative mb-4">
                  <div className="relative overflow-hidden"
                    style={{ width: 190, height: 230, borderRadius: '80px 80px 40px 40px', border: `4px solid white`, boxShadow: `0 8px 30px ${PLUM}20` }}>
                    <img src={img} alt={person.nick} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 right-0" style={{ height: 50, background: `linear-gradient(to top, white, transparent)` }} />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0 z-10">
                    <SakuraBlossom className="w-6 h-6" fill={SAKURA_LIGHT} />
                    <SakuraBlossom className="w-4 h-4" fill={SAKURA} />
                    <SakuraBlossom className="w-6 h-6" fill={SAKURA_LIGHT} />
                  </div>
                </div>
                <h3 className="font-script text-lg font-normal mb-1" style={{ color: DARK_TEXT }}>{person.full}</h3>
                <p className="text-[9px] uppercase tracking-widest font-title font-semibold mb-3" style={{ color: SAKURA }}>{label}</p>
                <p className="text-sm leading-relaxed mb-3" style={{ color: `${DARK_TEXT}BB` }}>{person.desc}</p>
                <p className="text-xs" style={{ color: MUTED }}>
                  Putra/i dari: <span className="font-semibold" style={{ color: PLUM }}>{person.father}</span> & {person.mother}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 4. COUNTDOWN ═══ */}
      <motion.section className="relative px-6 py-24 overflow-hidden"
        style={{ backgroundColor: BG_LIGHT }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={scrollReveal}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${SAKURA}0A 0%, transparent 50%)` }} />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <OrnateDivider />
          <p className="text-[9px] uppercase tracking-[0.35em] font-sans font-medium mb-2" style={{ color: MUTED }}>Menuju Hari Bahagia</p>
          <h2 className="font-script text-3xl mb-10" style={{ color: PLUM }}>Detik Cinta</h2>
          <div className="flex items-center justify-center gap-4">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true as const },
            ].map((item, idx) => (
              <motion.div key={idx} className="flex flex-col items-center" style={{ minWidth: 72 }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                <div className="p-4 rounded-2xl w-full flex flex-col items-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', border: `1px solid ${SAKURA}1A` }}>
                  <span className="font-sans text-2xl tabular-nums" style={{ color: item.accent ? SAKURA : PLUM }}>
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest mt-1.5" style={{ color: MUTED }}>{item.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-8">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g,'').replace(/T/,'').slice(0,8)}T090000Z/${isoDate.replace(/[-:]/g,'').replace(/T/,'').slice(0,8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-white text-[10px] uppercase tracking-widest font-sans font-medium transition-all duration-200"
              style={{ backgroundColor: SAKURA }}>
              <Calendar className="w-3.5 h-3.5" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══ 5. LOVE STORY ═══ */}
      <motion.section className="relative px-6 py-24 overflow-hidden"
        style={{ backgroundColor: BG }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={scrollReveal}>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-14">
            <OrnateDivider />
            <p className="text-[9px] uppercase tracking-[0.35em] font-sans font-medium" style={{ color: MUTED }}>Perjalanan Cinta</p>
            <h2 className="font-script text-3xl mt-1" style={{ color: PLUM }}>Cerita Kami</h2>
          </div>
          <div className="relative ml-4 space-y-10" style={{ borderLeft: `2px solid ${SAKURA}40` }}>
            {stories.length > 0 && stories.map((story, idx) => (
              <motion.div key={idx} className="relative pl-8 group"
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.15 }}>
                <div className="absolute -left-[12px] top-0 p-1 rounded-full group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: BG_LIGHT, border: `2px solid ${SAKURA}` }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: idx === 2 ? ROSE_GOLD : SAKURA }} />
                </div>
                <div className="p-5 rounded-2xl transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', border: `1px solid ${SAKURA}1A` }}>
                  <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-lg mb-2.5" style={{ color: SAKURA, backgroundColor: `${SAKURA}14` }}>{story.year}</span>
                  <h4 className="font-title text-base font-medium mb-1.5" style={{ color: PLUM }}>{story.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: `${DARK_TEXT}AA` }}>{story.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <motion.section className="relative px-6 py-24 overflow-hidden"
        style={{ backgroundColor: BG_LIGHT }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={scrollReveal}>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <OrnateDivider />
            <p className="text-[9px] uppercase tracking-[0.35em] font-sans font-medium" style={{ color: MUTED }}>Informasi Acara</p>
            <h2 className="font-script text-3xl mt-1" style={{ color: PLUM }}>Waktu & Lokasi</h2>
          </div>
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)}
                className="px-5 py-2 rounded-full text-[10px] font-sans font-medium uppercase tracking-wider transition-all duration-200"
                style={activeTab === idx
                  ? { backgroundColor: SAKURA, color: 'white', boxShadow: '0 2px 12px rgba(212,137,168,0.3)' }
                  : { backgroundColor: 'rgba(255,255,255,0.8)', color: MUTED, border: `1px solid ${SAKURA}26` }}>
                {evt.title}
              </button>
            ))}
          </div>
          <motion.div className="p-6 rounded-2xl transition-all duration-300"
            style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', border: `1px solid ${SAKURA}1A`, minHeight: 180 }}
            key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${SAKURA}14` }}>
                  <Calendar className="w-7 h-7" style={{ color: SAKURA }} />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-title text-lg" style={{ color: PLUM }}>{activeEvt.title}</h3>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                  <Clock className="w-3.5 h-3.5" /> {activeEvt.time}
                </div>
                <div className="flex items-start gap-1.5 text-xs" style={{ color: MUTED }}>
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{activeEvt.venue}, {activeEvt.address}</span>
                </div>
                {activeEvt.note && (
                  <p className="text-[10px] mt-2 italic" style={{ color: `${DARK_TEXT}88` }}>{activeEvt.note}</p>
                )}
                {activeEvt.mapsUrl && (
                  <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-full text-[10px] font-sans font-semibold uppercase tracking-wider transition-all"
                    style={{ backgroundColor: `${SAKURA}14`, color: SAKURA }}>
                    <Map className="w-3 h-3" /> Buka Google Maps
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ 7. GALLERY ═══ */}
      <motion.section className="relative px-6 py-24 overflow-hidden"
        style={{ backgroundColor: BG }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={scrollReveal}>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <OrnateDivider />
            <p className="text-[9px] uppercase tracking-[0.35em] font-sans font-medium" style={{ color: MUTED }}>Galeri Foto</p>
            <h2 className="font-script text-3xl mt-1" style={{ color: PLUM }}>Kenangan Indah</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {gallery.slice(0, 6).map((url, idx) => (
              <motion.div key={idx} onClick={() => setLightboxIndex(idx)}
                className="relative group cursor-pointer overflow-hidden rounded-2xl"
                style={idx === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } : { aspectRatio: '1' }}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.08 }}>
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${PLUM}66, transparent)` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${DARK_TEXT}E6`, backdropFilter: 'blur(4px)' }}
          onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 text-white text-sm hover:bg-white/30 transition-all">&times;</button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : gallery.length - 1); }}
            className="absolute left-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex < gallery.length - 1 ? lightboxIndex + 1 : 0); }}
            className="absolute right-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"><ChevronRight className="w-5 h-5" /></button>
          <motion.div className="max-w-[90vw] max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE }}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="max-h-[85vh] max-w-full" />
            ) : (
              <img src={gallery[lightboxIndex]} alt="" className="max-h-[85vh] max-w-full object-contain" />
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ 8. RSVP / WISHES ═══ */}
      <motion.section className="relative px-6 py-24 overflow-hidden"
        style={{ backgroundColor: BG_LIGHT }}
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={scrollReveal}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${SAKURA}0A 0%, transparent 50%)` }} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <OrnateDivider />
            <p className="text-[9px] uppercase tracking-[0.35em] font-sans font-medium mb-1" style={{ color: MUTED }}>Doa & Ucapan</p>
            <h2 className="font-script text-3xl" style={{ color: PLUM }}>Kirim Ucapan</h2>
          </div>

          {isSubmitted ? (
            <motion.div className="p-8 rounded-2xl text-center" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', border: `1px solid ${SAKURA}1A` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR, ease: EASE }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${SAKURA}14` }}>
                <Check className="w-6 h-6" style={{ color: SAKURA }} />
              </div>
              <p className="font-sans text-sm font-medium" style={{ color: PLUM }}>Terima kasih atas doa & ucapannya!</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="p-6 rounded-2xl space-y-4" style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', border: `1px solid ${SAKURA}1A` }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none transition-colors"
                  style={{ backgroundColor: BG_LIGHT, border: `1px solid ${SAKURA}26` }}
                  onFocus={(e) => e.target.style.borderColor = SAKURA}
                  onBlur={(e) => e.target.style.borderColor = `${SAKURA}26`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="flex-1 px-3 py-2.5 text-sm rounded-xl focus:outline-none transition-colors"
                  style={{ backgroundColor: BG_LIGHT, border: `1px solid ${SAKURA}26` }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none transition-colors resize-none h-20"
                style={{ backgroundColor: BG_LIGHT, border: `1px solid ${SAKURA}26` }}
                onFocus={(e) => e.target.style.borderColor = SAKURA}
                onBlur={(e) => e.target.style.borderColor = `${SAKURA}26`} />
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl text-xs uppercase tracking-widest font-sans font-medium transition-all duration-200"
                style={{ backgroundColor: SAKURA }}>
                <Send className="w-3.5 h-3.5" /> Kirim Ucapan
              </button>
            </form>
          )}

          {content.guestbook?.enabled !== false && wishes.length > 0 && (
            <div className="mt-10 space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
              {wishes.slice(0, 20).map((w) => (
                <div key={w.id} className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.8)', border: `1px solid ${SAKURA}1A` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium" style={{ color: PLUM }}>{w.name}</p>
                    <span className="text-[9px]" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  <p className="text-[10px] mb-1.5" style={{ color: SAKURA }}>
                    {w.attendance === 'Hadir' ? '✅ Hadir' : '❌ Tidak Hadir'}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: `${DARK_TEXT}AA` }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══ 9. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <motion.section className="relative px-6 py-24 overflow-hidden"
          style={{ backgroundColor: BG }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={scrollReveal}>
          <div className="max-w-xl mx-auto text-center">
            <OrnateDivider />
            <p className="text-[9px] uppercase tracking-[0.35em] font-sans font-medium mb-1" style={{ color: MUTED }}>Tanda Kasih</p>
            <h2 className="font-script text-3xl mb-3" style={{ color: PLUM }}>Kado Digital</h2>
            <p className="text-xs mb-10 max-w-sm mx-auto" style={{ color: MUTED }}>Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {gifts.map((g, idx) => (
                <motion.div key={idx} className="p-5 rounded-2xl transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', border: `1px solid ${SAKURA}1A` }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: idx * 0.1 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${SAKURA}14` }}>
                      <Gift className="w-4 h-4" style={{ color: SAKURA }} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: SAKURA }}>{g.bank}</p>
                  </div>
                  <p className="font-sans text-base font-medium mb-1" style={{ color: PLUM }}>{g.number}</p>
                  <p className="text-xs mb-3" style={{ color: MUTED }}>A/N: {g.owner}</p>
                  <button onClick={() => copy(g.number, idx)}
                    className="flex items-center gap-1.5 text-[10px] font-sans font-medium uppercase tracking-wider hover:underline"
                    style={{ color: SAKURA }}>
                    {copiedIdx === idx ? <><Check className="w-3 h-3" /> Tersalin</> : <><Copy className="w-3 h-3" /> Salin</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="relative px-6 py-24 text-center overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${PLUM} 0%, ${PLUM_LIGHT} 50%, ${PLUM} 100%)` }}>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white'%3E%3Ccircle cx='30' cy='30' r='3' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${SAKURA}14 0%, transparent 50%)` }} />
        <div className="max-w-xl mx-auto relative z-10 space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE }}>
            <SakuraBlossom className="w-12 h-12 mx-auto opacity-60" />
          </motion.div>
          <OrnateDivider />
          <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.15 }}>
            <span className="text-[9px] uppercase tracking-[0.4em] font-title font-semibold block" style={{ color: SAKURA }}>Terima Kasih</span>
            <h2 className="font-script text-3xl font-light italic leading-snug" style={{ color: SAKURA_LIGHT }}>Suatu kehormatan & kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.</h2>
          </motion.div>
          <div className="w-16 mx-auto rounded-full" style={{ height: 1.5, background: `linear-gradient(to right, transparent, ${SAKURA}, transparent)` }} />
          <motion.div className="space-y-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: DUR, ease: EASE, delay: 0.3 }}>
            <p className="text-[9px] uppercase tracking-[0.2em] font-sans" style={{ color: `${SAKURA}99` }}>Kami yang Berbahagia</p>
            <h4 className="font-script text-3xl" style={{ color: SAKURA_LIGHT }}>{p1.nick} & {p2.nick}</h4>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: `${SAKURA}66` }}>Beserta Seluruh Keluarga Besar</p>
          </motion.div>
        </div>
        <div className="border-t border-white/5 mt-16 pt-8 text-center">
          <p className="text-[8px] uppercase tracking-widest" style={{ color: `${SAKURA}44` }}>© 2027 {p1.nick} & {p2.nick}. Sakura Series.</p>
        </div>
      </footer>
    </div>
  );
}
