'use client';

import { useState, useRef, useEffect } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent } from '@/lib/content/types';
import {
  Heart, Calendar, Clock, MapPin, Send, Gift, Copy, Check, ChevronLeft, ChevronRight,
  Volume2, VolumeX, MessageSquare, Map,
} from 'lucide-react';
import { isVideo, useCountdown, useGuestName, displayDateFrom, pickMedia, useRsvpWishes } from './shared';

/* ─── Colors ─── */
const PEACH = '#D4A574';
const DARK = '#3D2C2A';
const PINK = '#E8C4C0';
const SAGE = '#A8B5A0';
const CREAM = '#FDF8F4';
const SOFT_BG = '#FAF0E8';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Raka', full: 'Raka Pramana Putra, S.Kom.', father: 'Bpk. Dr. I Wayan Pramana', mother: 'Ibu Ni Luh Putu Sari Dewi', ig: '@rakapramana', desc: 'Percaya bahwa cinta adalah melodi paling indah yang menyelaraskan dua hati.' },
    p2: { nick: 'Dewi', full: 'Dewi Ayu Saraswati, S.Pd.', father: 'Bpk. I Ketut Arimbawa', mother: 'Ibu Ni Made Wartini', ig: '@dewiayusaras', desc: 'Pencinta seni yang meyakini setiap helai bunga mengajarkan keindahan kesabaran dan ketulusan.' },
  },
  date: '2027-05-15T09:00:00',
  quote: { text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.', source: 'QS. Ar-Rum: 21' },
  events: [
    { title: 'Akad Nikah', time: '09:00 - 11:00 WITA', venue: 'Puri Agung Saraswati', address: 'Jl. Raya Ubud No. 88, Gianyar, Bali', mapsUrl: 'https://maps.google.com', note: 'Khidmat dan sakral, khusus keluarga inti dan kerabat dekat' },
    { title: 'Resepsi', time: '12:00 - 16:00 WITA', venue: 'Taman Bunga Ubud Resort', address: 'Jl. Bunga Rampai, Ubud, Gianyar, Bali', mapsUrl: 'https://maps.google.com', note: 'Terbuka untuk seluruh tamu undangan. Dresscode: Earth Tone / Floral' },
  ],
  stories: [
    { year: '2022', title: 'Di Antara Bunga & Pameran', desc: 'Berawal dari pameran seni budaya di Ubud. Raka yang memotret instalasi bunga, tanpa sengaja mengabadikan Dewi yang sedang menikmati lukisan.' },
    { year: '2024', title: 'Menyatukan Langkah', desc: 'Dua tahun saling mengenal, bertumbuh, dan berbagi mimpi. Sepakat melangkah bersama menghadapi suka duka kehidupan.' },
    { year: '2026', title: 'Di Bawah Teduh Bunga Anggrek', desc: 'Raka meminang Dewi di sebuah taman anggrek yang bermekaran. Dengan restu kedua keluarga, ikatan cinta dikukuhkan menuju pernikahan suci.' },
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

/* ─── deriveData ─── */
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
  const events = (content.schedule?.items?.length
    ? content.schedule.items.map((it) => ({ title: it.title || '', time: it.time || '', venue: it.venue || '', address: it.address || '', mapsUrl: it.mapsUrl || 'https://maps.google.com', note: it.description || '' }))
    : DEFAULTS.events).filter((e) => e.title);
  const stories = content.stories?.length ? content.stories : DEFAULTS.stories;
  const gallery = content.gallery?.images?.length ? content.gallery.images : DEFAULTS.gallery;
  const gifts = (content.gift?.items?.length
    ? content.gift.items.map((g) => ({ bank: g.bank || g.name || '', number: g.number || '', owner: g.owner || g.note || '' }))
    : DEFAULTS.gifts).filter((g) => g.bank || g.number);
  const quote = content.quote?.text ? { text: content.quote.text, source: content.quote.source || '' } : DEFAULTS.quote;
  const audio = content.music?.src || DEFAULTS.audio;
  const media = pickMedia(content, { cover: DEFAULTS.cover, hero: DEFAULTS.hero, p1: DEFAULTS.p1, p2: DEFAULTS.p2 });
  return { p1, p2, isoDate, displayDate, events, stories, gallery, gifts, quote, audio, media };
}

/* ─── injectStyles ─── */
function injectStyles() {
  if (typeof window === 'undefined' || document.getElementById('flora-inv')) return;
  const s = document.createElement('style');
  s.id = 'flora-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Plus+Jakarta+Sans:wght@200;300;400;500;600&family=Sacramento&display=swap');
.font-serif { font-family: 'Playfair Display', Georgia, serif; }
.font-body { font-family: 'Cormorant Garamond', serif; }
.font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
.font-cursive { font-family: 'Sacramento', cursive; }

@keyframes bloom-in { 0% { transform: scale(0) rotate(-15deg); opacity: 0; } 60% { transform: scale(1.1) rotate(3deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
@keyframes petal-fall { 0% { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.3; } 100% { transform: translateY(calc(100vh + 20px)) rotate(720deg) scale(0.3); opacity: 0; } }
@keyframes float-dance { 0%,100% { transform: translateY(0) rotate(0deg) scale(1); } 25% { transform: translateY(-8px) rotate(3deg) scale(1.02); } 50% { transform: translateY(-4px) rotate(-2deg) scale(0.98); } 75% { transform: translateY(-10px) rotate(4deg) scale(1.01); } }
@keyframes float-dance-2 { 0%,100% { transform: translateY(0) rotate(0deg) scale(1); } 25% { transform: translateY(-6px) rotate(-3deg) scale(0.98); } 50% { transform: translateY(-10px) rotate(2deg) scale(1.03); } 75% { transform: translateY(-4px) rotate(-4deg) scale(0.99); } }
@keyframes leaf-sway { 0%,100% { transform: rotate(-4deg) translateY(0); } 50% { transform: rotate(6deg) translateY(-4px); } }
@keyframes leaf-sway-rev { 0%,100% { transform: rotate(4deg) translateY(0); } 50% { transform: rotate(-6deg) translateY(-3px); } }
@keyframes reveal-blur { 0% { opacity: 0; filter: blur(12px); transform: translateY(20px); } 100% { opacity: 1; filter: blur(0); transform: translateY(0); } }
@keyframes reveal-up { 0% { opacity: 0; transform: translateY(40px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes pulse-soft { 0%,100% { box-shadow: 0 0 0 0 rgba(212,165,116,0.3); } 50% { box-shadow: 0 0 0 10px rgba(212,165,116,0); } }
@keyframes shimmer-gold { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
@keyframes card-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

.anim-bloom { animation: bloom-in 0.8s cubic-bezier(0.16,1,0.3,1) both; }
.anim-petal { animation: petal-fall var(--dur,8s) linear infinite; }
.anim-float-1 { animation: float-dance 6s ease-in-out infinite; }
.anim-float-2 { animation: float-dance-2 7s ease-in-out infinite; }
.anim-leaf { animation: leaf-sway 4s ease-in-out infinite; }
.anim-leaf-r { animation: leaf-sway-rev 5s ease-in-out infinite; }
.anim-blur { animation: reveal-blur 1s cubic-bezier(0.16,1,0.3,1) both; }
.anim-up { animation: reveal-up 0.9s cubic-bezier(0.16,1,0.3,1) both; }
.anim-pulse { animation: pulse-soft 2s ease-in-out infinite; }
.anim-shimmer { background-size: 200% 100%; animation: shimmer-gold 3s ease-in-out infinite; }
.anim-card { animation: card-float 4s ease-in-out infinite; }

.scroll-r { opacity:0; transform:translateY(40px) scale(0.98); transition: all 0.8s cubic-bezier(0.16,1,0.3,1); }
.scroll-r.revealed { opacity:1; transform:translateY(0) scale(1); }
.no-scrollbar::-webkit-scrollbar { display:none; }
.no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:${CREAM}; }
::-webkit-scrollbar-thumb { background:${PEACH}; border-radius:2px; }
`;
  document.head.appendChild(s);
}

/* ─── SVG Components ─── */

function Flower({ className = "w-8 h-8", fill = PEACH }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path d="M50 15 Q65 5 50 30 Q35 5 50 15Z" fill={fill} opacity="0.8" />
      <path d="M85 50 Q95 35 70 50 Q95 65 85 50Z" fill={fill} opacity="0.8" />
      <path d="M50 85 Q35 95 50 70 Q65 95 50 85Z" fill={fill} opacity="0.8" />
      <path d="M15 50 Q5 35 30 50 Q5 65 15 50Z" fill={fill} opacity="0.8" />
      <circle cx="50" cy="50" r="10" fill="#C9A96E" />
      <circle cx="50" cy="50" r="5" fill="#FFF" opacity="0.4" />
    </svg>
  );
}

function Leaf({ className = "w-6 h-6", left = false }: { className?: string; left?: boolean }) {
  return (
    <svg viewBox="0 0 50 80" className={`${className} ${left ? 'scale-x-[-1]' : ''}`} fill="none">
      <path d="M25 0 Q10 20 5 45 Q15 35 25 40 Q20 55 15 70 Q25 60 30 75 Q35 55 40 40 Q45 20 25 0Z" fill={SAGE} opacity="0.5" />
      <path d="M25 0 Q25 20 28 38" stroke={SAGE} strokeWidth="0.8" fill="none" />
    </svg>
  );
}

function Wreath({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none">
      {[60,10, 40,12, 80,12, 110,60, 108,40, 108,80, 60,110, 40,108, 80,108, 10,60, 12,40, 12,80].map((_,i,a)=>(
        <circle key={i} cx={a[i]} cy={a[++i]} r="4" fill={PEACH} opacity="0.6" />
      ))}
    </svg>
  );
}

function Vine({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none">
      <path d="M0 80 Q20 75 30 60 Q40 45 50 50 Q60 55 70 45 Q75 40 80 30" stroke={SAGE} strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M30 60 Q25 52 18 50" stroke={SAGE} strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M50 50 Q48 42 42 38" stroke={SAGE} strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  );
}

function FloralDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-4">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4A574]/30 to-transparent max-w-[50px]"></div>
      <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
        <circle cx="20" cy="20" r="6" fill={PEACH} />
        {[[20,14],[26,20],[20,26],[14,20]].map(([x,y])=><circle key={x+y} cx={x} cy={y} r="4" fill={PEACH} opacity="0.5" />)}
      </svg>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent max-w-[50px]"></div>
    </div>
  );
}

function FloatingPetals() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="absolute" style={{ left: `${10 + i * 20}%`, top: `${Math.random() * -15}%`, animationDuration: `${6 + i * 1.5}s`, animationDelay: `${i * 2}s` } as React.CSSProperties}>
          <svg width="10" height="14" viewBox="0 0 12 16" fill="none" className="anim-petal">
            <path d="M6 0 Q11 4 8 10 Q6 16 4 10 Q1 4 6 0Z" fill={i % 2 === 0 ? PEACH : PINK} opacity="0.35" />
          </svg>
        </div>
      ))}
      {[...Array(3)].map((_, i) => (
        <div key={`f${i}`} className={`absolute ${i % 2 === 0 ? 'anim-float-1' : 'anim-float-2'}`}
          style={{ left: `${8 + i * 32}%`, top: `${25 + i * 22}%`, animationDelay: `${i * 1.5}s`, opacity: 0.12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={PEACH}>
            <circle cx="12" cy="12" r="4" /><circle cx="12" cy="8" r="3" /><circle cx="16" cy="12" r="3" /><circle cx="12" cy="16" r="3" /><circle cx="8" cy="12" r="3" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ─── ScrollReveal wrapper ─── */
function ScrollR({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) e.target.classList.add('revealed'); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`scroll-r ${className}`}>{children}</div>;
}

/* ─── Main Component ─── */
export function UndanganPernikahanFlora({ content, slug, preview }: MonolithicTemplateProps) {
  const data = deriveData(content);
  const { p1, p2, isoDate, displayDate, events, stories, gallery, gifts, quote, audio, media } = data;

  const [isOpen, setIsOpen] = useState(preview ?? false);
  const [isPlaying, setIsPlaying] = useState(false);
  const guestName = useGuestName(content.guestName, 'Tamu Undangan');
  const countdown = useCountdown(isoDate);
  const [activeTab, setActiveTab] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { wishes, rsvpForm, setRsvpForm, isSubmitted, submit } = useRsvpWishes(slug);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { injectStyles(); }, []);

  const open = () => { setIsOpen(true); setIsPlaying(true); audioRef.current?.play().catch(() => {}); };
  const toggleMusic = () => { if (!audioRef.current) return; if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(() => {}); setIsPlaying(!isPlaying); };
  const copy = (text: string, idx: number) => { navigator.clipboard?.writeText(text); setCopiedIndex(idx); setTimeout(() => setCopiedIndex(null), 2500); };
  const activeEvt = events[activeTab] || events[0];

  /* ── Cover ── */
  if (!isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#3D2C2A] via-[#4A3530] to-[#3D2C2A] text-[#FDF8F4] p-6 text-center font-sans overflow-hidden">
        <FloatingPetals />
        <div className="absolute inset-4 border border-[#D4A574]/30 pointer-events-none rounded-[30px] z-10"></div>
        <div className="absolute inset-6 border border-[#D4A574]/10 pointer-events-none rounded-[24px] z-10"></div>

        <div className="pt-8 z-20 anim-bloom"><Wreath className="w-20 h-20 mx-auto" /></div>

        <div className="my-auto max-w-sm z-20 space-y-8 px-4">
          <div className="anim-blur space-y-2" style={{ animationDelay: '0.2s' }}>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4A574] font-semibold">The Wedding of</span>
            <div className="w-12 h-[1px] bg-[#D4A574]/40 mx-auto my-4"></div>
          </div>
          <div className="anim-blur space-y-3" style={{ animationDelay: '0.4s' }}>
            <h1 className="font-cursive text-6xl text-[#E8C4C0] leading-tight">
              {p1.nick} <span className="inline-block mx-1 text-4xl text-[#D4A574]">&</span> {p2.nick}
            </h1>
            <p className="font-serif text-sm italic text-[#D4A574] font-light">{displayDate}</p>
          </div>
          <div className="anim-blur space-y-4 pt-4" style={{ animationDelay: '0.6s' }}>
            <span className="text-[9px] uppercase tracking-[0.3em] text-cream/60">Kepada Yth.</span>
            <div className="bg-white/8 backdrop-blur-md border border-[#D4A574]/30 rounded-2xl p-5 inline-block shadow-2xl">
              <p className="font-serif text-lg font-light text-white">{guestName}</p>
              <span className="text-[8px] text-[#D4A574] uppercase tracking-widest mt-1.5 block font-semibold">Tamu Istimewa</span>
            </div>
          </div>
          <div className="pt-2 anim-blur" style={{ animationDelay: '0.8s' }}>
            <button onClick={open}
              className="group relative px-10 py-4 bg-[#D4A574] hover:bg-white text-[#3D2C2A] font-semibold rounded-full shadow-2xl transition-all duration-500 text-xs uppercase tracking-[0.25em] overflow-hidden anim-pulse">
              <span className="relative z-10 flex items-center gap-2.5">
                <Heart className="w-4 h-4 fill-current" /> Buka Undangan
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent anim-shimmer"></span>
            </button>
          </div>
        </div>
        <div className="mb-6 z-20">
          <p className="text-[7px] text-[#D4A574]/50 tracking-[0.35em] uppercase">#{p1.nick}{p2.nick}Harmoni</p>
        </div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="font-sans bg-[#FDF8F4] text-[#3D2C2A] min-h-screen relative overflow-x-hidden selection:bg-[#D4A574]/30">
      <audio ref={audioRef} src={audio} loop />
      <FloatingPetals />

      {/* Music toggle */}
      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-white/90 backdrop-blur-md text-dark shadow-xl hover:scale-110 transition-all duration-300 border border-[#D4A574]/30">
        {isPlaying ? (
          <span className="relative flex items-center justify-center">
            <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-[#D4A574]/40"></span>
            <Volume2 className="w-5 h-5 text-[#D4A574]" />
          </span>
        ) : <VolumeX className="w-5 h-5 text-dark/60" />}
      </button>

      {/* 1. HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#4A3530] via-[#5A4240] to-[#FDF8F4]">
        <div className="absolute inset-0 opacity-15 scale-105">
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover" /> : <img src={media.hero} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="absolute top-4 left-4 anim-bloom"><Vine className="w-20 h-20" /></div>
        <div className="absolute top-4 right-4 anim-bloom scale-x-[-1]"><Vine className="w-20 h-20" /></div>
        <div className="absolute top-20 left-8 anim-float-1 opacity-30"><Flower className="w-10 h-10" fill={PINK} /></div>
        <div className="absolute top-32 right-12 anim-float-2 opacity-25"><Flower className="w-8 h-8" /></div>
        <div className="absolute bottom-40 left-10 anim-leaf opacity-30"><Leaf className="w-8 h-8" /></div>
        <div className="absolute bottom-32 right-8 anim-leaf-r opacity-30"><Leaf className="w-10 h-10" left /></div>

        <div className="relative z-10 text-center px-6 py-24 max-w-lg mx-auto">
          <div className="anim-blur" style={{ animationDelay: '0.3s' }}><Wreath className="w-24 h-24 mx-auto mb-6" /></div>
          <div className="anim-blur space-y-3" style={{ animationDelay: '0.5s' }}>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4A574] font-semibold">Undangan Pernikahan</span>
            <div className="w-10 h-[1px] bg-[#D4A574]/40 mx-auto"></div>
          </div>
          <div className="anim-blur space-y-4 mt-6" style={{ animationDelay: '0.7s' }}>
            <h1 className="font-cursive text-6xl text-white leading-tight">{p1.nick} <span className="text-3xl text-[#D4A574] block my-1">&</span> {p2.nick}</h1>
            <p className="font-serif text-sm italic text-[#E8C4C0]">{displayDate}</p>
            <p className="text-xs tracking-[0.25em] uppercase text-[#D4A574] font-medium">{events[0]?.address?.split(',').pop()?.trim() || 'Bali'}</p>
          </div>
          {guestName && guestName !== 'Tamu Undangan' && (
            <div className="mt-8 anim-blur" style={{ animationDelay: '0.9s' }}>
              <div className="px-5 py-2 mx-auto inline-block rounded-full text-xs font-light"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(212,165,116,0.3)', color: '#FDF8F4' }}>
                Kepada Yth. <span className="font-medium text-white">{guestName}</span>
              </div>
            </div>
          )}
          <div className="mt-12 animate-bounce">
            <p className="text-[9px] uppercase tracking-widest text-[#E8C4C0]/70">Gulir ke Bawah</p>
            <div className="w-[1px] h-8 bg-gradient-to-b from-[#D4A574] to-transparent mx-auto mt-2"></div>
          </div>
        </div>
      </section>

      {/* 2. QUOTE */}
      <ScrollR><section className="py-24 px-6 bg-[#FDF8F4] relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 opacity-[0.05]"><Flower className="w-full h-full" /></div>
        <div className="max-w-xl mx-auto text-center relative z-10">
          <Leaf className="w-8 h-8 mx-auto mb-6 anim-leaf" />
          <FloralDivider />
          <div className="font-serif text-3xl text-[#D4A574] mb-4 leading-none">"</div>
          <p className="font-body text-lg italic leading-relaxed text-[#5A4240] px-4 font-light">{quote.text}</p>
          <div className="font-serif text-3xl text-[#D4A574] mt-4 leading-none">"</div>
          <div className="w-12 h-[1px] bg-[#D4A574]/30 mx-auto my-6"></div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8B6F5E]">— {quote.source}</p>
        </div>
      </section></ScrollR>

      {/* 3. COUNTDOWN */}
      <ScrollR><section className="py-20 px-6 bg-gradient-to-b from-[#FDF8F4] to-[#FAF0E8]">
        <div className="max-w-lg mx-auto text-center">
          <FloralDivider />
          <h3 className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold mb-2">Menuju Hari Bahagia</h3>
          <h2 className="font-serif text-3xl text-dark mb-12">Detik Cinta</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-[#D4A574]/15 flex flex-col items-center anim-card" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A574] to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <span className={`font-serif text-3xl font-light ${item.accent ? 'text-[#D4A574]' : 'text-dark'}`}>{String(item.val).padStart(2,'0')}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#8B6F5E]/60 mt-2">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=20270515T090000Z/20270515T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A574] hover:bg-dark text-white rounded-full text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 shadow-md">
              <Calendar className="w-3.5 h-3.5" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </section></ScrollR>

      {/* 4. COUPLE */}
      <ScrollR><section className="py-24 px-6 bg-[#FDF8F4]">
        <div className="max-w-xl mx-auto text-center">
          <FloralDivider />
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Kedua Mempelai</span>
          <h2 className="font-serif text-3xl text-dark mt-2 mb-4">Dengan Cinta & Restu Keluarga</h2>
          <p className="text-xs text-[#8B6F5E] max-w-sm mx-auto mb-16">Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-12">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria', side: 'right' },
              { person: p2, img: media.p2, label: 'Mempelai Wanita', side: 'left' },
            ].map(({ person, img, label, side }) => (
              <div key={label} className="flex flex-col items-center group px-4 md:px-0 w-full max-w-[320px]">
                {/* Foto */}
                <div className="relative w-48 h-64 overflow-hidden rounded-[60px_60px_20px_20px] shadow-xl border-[5px] border-white outline outline-1 outline-[#D4A574]/20 mb-6">
                  <img src={img} alt={person.nick} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className={`absolute top-2 ${side === 'right' ? 'right-2' : 'left-2'} bg-white/90 p-1.5 rounded-full shadow-sm`}>
                    <Flower className="w-5 h-5" fill={side === 'right' ? PEACH : PINK} />
                  </div>
                </div>
                {/* Nama */}
                <h3 className="font-serif text-xl text-dark font-medium mb-1.5">{person.full}</h3>
                {/* Label */}
                <p className="text-[10px] text-[#D4A574] uppercase tracking-widest font-semibold mb-4">{label}</p>
                {/* Desc */}
                <p className="text-sm text-[#8B6F5E] max-w-[260px] leading-relaxed mb-4">{person.desc}</p>
                {/* Parents */}
                <p className="text-xs text-[#8B6F5E] leading-relaxed">
                  Putra/i dari: <span className="font-semibold text-dark">{person.father}</span> & {person.mother}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section></ScrollR>

      {/* 5. LOVE STORY */}
      <ScrollR><section className="py-24 px-6 bg-[#FAF0E8] relative">
        <div className="absolute -top-16 -right-16 w-32 h-32 opacity-[0.04]"><Leaf className="w-full h-full" /></div>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-16">
            <FloralDivider />
            <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Perjalanan Cinta</span>
            <h2 className="font-serif text-3xl text-dark mt-2">Cinta yang Bersemi</h2>
          </div>
          <div className="relative border-l border-[#D4A574]/30 ml-5 space-y-12">
            {stories.length > 0 && stories.map((story, idx) => (
              <div key={idx} className="relative pl-8 group">
                <div className="absolute -left-[22px] top-0 bg-[#FDF8F4] p-1 rounded-full border-2 border-[#D4A574] group-hover:scale-110 transition-transform">
                  <Flower className="w-4 h-4" />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A574]/10 hover:shadow-md transition-all">
                  <span className="inline-block text-xs font-bold text-[#D4A574] bg-[#D4A574]/10 px-3 py-1 rounded-full mb-3">{story.year}</span>
                  <h4 className="font-serif text-lg text-dark font-medium mb-2">{story.title}</h4>
                  <p className="text-xs text-[#8B6F5E] leading-relaxed">{story.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section></ScrollR>

      {/* 6. EVENT SCHEDULE */}
      <ScrollR><section className="py-24 px-6 bg-[#FDF8F4]">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <FloralDivider />
            <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Informasi Acara</span>
            <h2 className="font-serif text-3xl text-dark mt-2">Waktu & Lokasi</h2>
          </div>
          <div className="flex justify-center gap-3 mb-8">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === idx ? 'bg-[#D4A574] text-white shadow-md' : 'bg-white text-[#8B6F5E] border border-[#D4A574]/20 hover:bg-[#FAF0E8]'
                }`}>{evt.title}</button>
            ))}
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#D4A574]/10 min-h-[300px]">
            <div className="anim-up space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-[#FAF0E8] rounded-full"><Calendar className="w-4 h-4 text-[#D4A574]" /></span>
                <span className="text-[9px] font-bold text-[#D4A574] uppercase tracking-widest">{activeEvt.title}</span>
              </div>
              <h3 className="font-serif text-2xl text-dark">{displayDate}</h3>
              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-[#D4A574]/10">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#D4A574] mt-0.5" />
                  <div><p className="text-[9px] uppercase tracking-wider text-[#8B6F5E] font-semibold">Waktu</p><p className="text-sm text-dark">{activeEvt.time}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#D4A574] mt-0.5" />
                  <div><p className="text-[9px] uppercase tracking-wider text-[#8B6F5E] font-semibold">Lokasi</p><p className="text-sm text-dark">{activeEvt.venue}</p><p className="text-xs text-[#8B6F5E]">{activeEvt.address}</p></div>
                </div>
              </div>
              {activeEvt.note && (
                <div className="bg-[#FAF0E8] p-4 rounded-2xl flex items-start gap-2.5">
                  <span className="text-xs text-[#8B6F5E]">📌</span>
                  <p className="text-xs text-[#8B6F5E]">{activeEvt.note}</p>
                </div>
              )}
              <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-dark hover:bg-[#D4A574] text-white rounded-full text-[10px] uppercase tracking-widest font-medium transition-all duration-300">
                <Map className="w-3.5 h-3.5" /> Buka Google Maps
              </a>
            </div>
          </div>
        </div>
      </section></ScrollR>

      {/* 7. GALLERY */}
      <ScrollR><section className="py-24 px-6 bg-[#FAF0E8]">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <FloralDivider />
            <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Galeri Foto</span>
            <h2 className="font-serif text-3xl text-dark mt-2">Momen Berharga</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.length > 0 && gallery.map((img, idx) => (
              <div key={idx} onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-sm cursor-pointer border-2 border-white hover:shadow-lg transition-all duration-300">
                <img src={img} alt={`Gallery ${idx+1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-dark/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2 bg-white/90 rounded-full text-[#D4A574] translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Heart className="w-4 h-4 fill-[#D4A574]" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section></ScrollR>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-white/80 hover:text-white text-3xl font-light">&times;</button>
          <button onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)} className="absolute left-4 p-2 text-white/70 hover:text-white"><ChevronLeft className="w-10 h-10" /></button>
          <img src={gallery[lightboxIndex]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          <button onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)} className="absolute right-4 p-2 text-white/70 hover:text-white"><ChevronRight className="w-10 h-10" /></button>
        </div>
      )}

      {/* 8. RSVP */}
      <ScrollR><section className="py-24 px-6 bg-[#FDF8F4]">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <FloralDivider />
            <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Konfirmasi</span>
            <h2 className="font-serif text-3xl text-dark mt-2">Kirim Ucapan & Doa Restu</h2>
          </div>
          <div className="grid grid-cols-1 gap-10">
            <form onSubmit={submit} className="bg-white p-6 rounded-3xl shadow-sm border border-[#D4A574]/10 space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#8B6F5E] font-bold mb-2">Nama Lengkap</label>
                <input type="text" required placeholder="Nama Anda" value={rsvpForm.name}
                  onChange={e => setRsvpForm({...rsvpForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-[#FAF0E8] rounded-xl border border-[#D4A574]/10 text-xs focus:outline-none focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#8B6F5E] font-bold mb-2">Kehadiran</label>
                  <select value={rsvpForm.attendance} onChange={e => setRsvpForm({...rsvpForm, attendance: e.target.value})}
                    className="w-full px-4 py-3 bg-[#FAF0E8] rounded-xl border border-[#D4A574]/10 text-xs focus:outline-none focus:border-[#D4A574]">
                    <option value="Hadir">Hadir</option>
                    <option value="Tidak Hadir">Tidak Hadir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#8B6F5E] font-bold mb-2">Jumlah Tamu</label>
                  <select value={rsvpForm.guests} disabled={rsvpForm.attendance === "Tidak Hadir"}
                    onChange={e => setRsvpForm({...rsvpForm, guests: e.target.value})}
                    className="w-full px-4 py-3 bg-[#FAF0E8] rounded-xl border border-[#D4A574]/10 text-xs focus:outline-none focus:border-[#D4A574] disabled:opacity-40">
                    {[1,2,3,4].map(n => <option key={n} value={n}>{n} Orang</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#8B6F5E] font-bold mb-2">Pesan & Doa</label>
                <textarea rows={4} required placeholder="Tulis ucapan selamat & doa restu..." value={rsvpForm.message}
                  onChange={e => setRsvpForm({...rsvpForm, message: e.target.value})}
                  className="w-full px-4 py-3 bg-[#FAF0E8] rounded-xl border border-[#D4A574]/10 text-xs focus:outline-none focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] resize-none"></textarea>
              </div>
              <button type="submit" disabled={isSubmitted}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#D4A574] hover:bg-dark text-white rounded-2xl text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-md disabled:opacity-75">
                {isSubmitted ? <><Check className="w-4 h-4" /> Terkirim!</> : <><Send className="w-4 h-4" /> Kirim Ucapan</>}
              </button>
            </form>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#D4A574]/10 flex flex-col h-[400px]">
              <div className="flex items-center justify-between border-b border-[#D4A574]/10 pb-4 mb-4">
                <span className="font-serif text-sm font-medium text-dark"><MessageSquare className="w-4 h-4 text-[#D4A574] inline mr-1.5" />Ucapan ({wishes.length})</span>
                <span className="px-2 py-0.5 bg-[#D4A574]/10 text-[#D4A574] text-[8px] font-bold tracking-widest rounded-full">Terbaru</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                {wishes.map((w, idx) => (
                  <div key={idx} className="bg-[#FAF0E8] p-4 rounded-2xl border border-[#D4A574]/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-semibold text-dark">{w.name}</span>
                      <span className="text-[8px] text-[#8B6F5E]/50 font-medium">{w.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[7px] font-bold tracking-wider ${w.attendance === 'Hadir' ? 'bg-[#D4A574]/15 text-[#D4A574]' : 'bg-red-50 text-red-500'}`}>{w.attendance}</span>
                      {w.attendance === 'Hadir' && <span className="text-[8px] text-[#8B6F5E]/60">({w.guests} tamu)</span>}
                    </div>
                    <p className="text-xs text-[#8B6F5E]">{w.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section></ScrollR>

      {/* 9. GIFT */}
      <ScrollR><section className="py-24 px-6 bg-[#FAF0E8]">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#D4A574]/10 rounded-full mb-4">
            <Gift className="w-6 h-6 text-[#D4A574]" />
          </div>
          <FloralDivider />
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Tanda Kasih</span>
          <h2 className="font-serif text-3xl text-dark mt-2">Kado Digital</h2>
          <p className="text-xs text-[#8B6F5E] mt-3 max-w-sm mx-auto">Doa restu Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {gifts.length > 0 && gifts.map((gift, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-[#D4A574]/10 shadow-sm text-left relative overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#D4A574]/8 to-transparent rounded-tr-3xl"></div>
                <div className="relative z-10">
                  <span className="text-[9px] font-bold text-[#D4A574] uppercase tracking-widest">{gift.bank}</span>
                  <div className="w-6 h-[1px] bg-[#D4A574]/30 my-2"></div>
                  <p className="font-mono text-base font-bold text-dark tracking-wider">{gift.number}</p>
                  <p className="text-[9px] text-[#8B6F5E] mt-1 uppercase tracking-wide">A/N: {gift.owner}</p>
                  <button onClick={() => copy(gift.number, idx)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-[#FAF0E8] hover:bg-[#D4A574] text-[#8B6F5E] hover:text-white rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all duration-300">
                    {copiedIndex === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin Rekening</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section></ScrollR>

      {/* 10. FOOTER */}
      <footer className="py-24 px-6 bg-[#3D2C2A] text-[#FDF8F4] relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-64 h-64 opacity-[0.03]"><Flower className="w-full h-full" /></div>
        <div className="max-w-xl mx-auto text-center relative z-10 space-y-8">
          <Wreath className="w-16 h-16 mx-auto opacity-60" />
          <FloralDivider />
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#D4A574] font-semibold block">Terima Kasih</span>
          <h2 className="font-serif text-3xl font-light italic text-[#E8C4C0] leading-snug">Suatu kehormatan & kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.</h2>
          <div className="w-16 h-[1px] bg-[#D4A574]/40 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-[9px] text-[#D4A574]/70 uppercase tracking-[0.2em]">Kami yang Berbahagia</p>
            <h4 className="font-cursive text-3xl text-[#E8C4C0]">{p1.nick} & {p2.nick}</h4>
            <p className="text-[9px] text-white/40 uppercase tracking-widest">Beserta Seluruh Keluarga Besar</p>
          </div>
        </div>
        <div className="border-t border-white/5 mt-16 pt-8 text-center text-[8px] text-white/30 uppercase tracking-widest">
          <p>© 2027 {p1.nick} & {p2.nick}. Floral Invitation Design.</p>
          <p className="mt-1">Crafted with Love, Petals & Endless Joy</p>
        </div>
      </footer>
    </div>
  );
}
