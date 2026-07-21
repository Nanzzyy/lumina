'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent } from '@/lib/content/types';
import {
  Heart, Calendar, Clock, MapPin, Mail, Copy, Check,
  ChevronLeft, ChevronRight, Volume2, VolumeX, Gift, MessageSquare, ArrowRight,
} from 'lucide-react';

/* ─── Shared animation variants (scroll-triggered entrance) ─── */
const V_CONTAINER: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const V_FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const V_FADE_IN: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};
const V_SCALE: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};
const V_SLIDE_L: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const VP = { initial: 'hidden' as const, whileInView: 'show' as const, viewport: { once: true, amount: 0.2 } };

/* ─── Botanical line-art ornaments (subtle background decor) ─── */
const ORN = '#C29B68';
function FloralCorner({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={{ transform: flip ? 'scaleX(-1)' : undefined }} fill="none" aria-hidden="true">
      <path d="M10 190 C 40 150, 60 120, 100 100 C 140 80, 160 50, 190 10" stroke={ORN} strokeWidth="1.2" opacity="0.5" />
      <path d="M40 170 C 55 150, 55 130, 45 110 C 35 130, 30 150, 40 170 Z" fill={ORN} opacity="0.18" />
      <path d="M80 140 C 95 120, 95 100, 85 80 C 75 100, 70 120, 80 140 Z" fill={ORN} opacity="0.18" />
      <path d="M120 110 C 135 90, 135 70, 125 50 C 115 70, 110 90, 120 110 Z" fill={ORN} opacity="0.18" />
      <circle cx="100" cy="100" r="4" fill={ORN} opacity="0.4" />
      <circle cx="60" cy="140" r="3" fill={ORN} opacity="0.3" />
      <circle cx="140" cy="80" r="3" fill={ORN} opacity="0.3" />
    </svg>
  );
}
function LeafSprig({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden="true">
      <path d="M60 110 C 60 80, 60 50, 60 15" stroke={ORN} strokeWidth="1" opacity="0.45" />
      {[35, 55, 75].map((y, i) => (
        <g key={i}>
          <path d={`M60 ${y} C 45 ${y - 10}, 35 ${y - 6}, 30 ${y + 6} C 42 ${y + 8}, 52 ${y + 4}, 60 ${y} Z`} fill={ORN} opacity="0.16" />
          <path d={`M60 ${y} C 75 ${y - 10}, 85 ${y - 6}, 90 ${y + 6} C 78 ${y + 8}, 68 ${y + 4}, 60 ${y} Z`} fill={ORN} opacity="0.16" />
        </g>
      ))}
      <circle cx="60" cy="15" r="3.5" fill={ORN} opacity="0.4" />
    </svg>
  );
}
function Divider({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 24" className={className} fill="none" aria-hidden="true">
      <path d="M0 12 H60" stroke={ORN} strokeWidth="1" opacity="0.4" />
      <path d="M100 12 H160" stroke={ORN} strokeWidth="1" opacity="0.4" />
      <path d="M70 12 C 75 6, 80 6, 80 12 C 80 18, 85 18, 90 12" stroke={ORN} strokeWidth="1.2" opacity="0.6" />
      <circle cx="80" cy="12" r="2" fill={ORN} opacity="0.6" />
    </svg>
  );
}

/* ─── Defaults (used until the studio content fills these in) ─── */
const DEFAULT_COUPLE = {
  groom: { nickname: 'Aditya', fullName: 'Aditya Pratama, S.T.', father: 'Bpk. Hermawan Pratama', mother: 'Ibu Ratih Saraswati', instagram: '@aditya_pratama' },
  bride: { nickname: 'Laras', fullName: 'Laras Atika Putri, S.Ds.', father: 'Bpk. Wijaya Kusuma', mother: 'Ibu Endang Lestari', instagram: '@laras_atikap' },
};
const DEFAULT_DATE = '2026-11-14T09:00:00';
const DEFAULT_QUOTE = { text: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.', source: 'QS. Ar-Rum: 21' };
const DEFAULT_EVENTS = [
  { title: 'Akad Nikah', time: '08:00 - 10:00 WIB', venue: 'Masjid Raya Al-Baqarah', address: 'Jl. Boulevard Indah No. 45, Kebayoran Baru, Jakarta Selatan', mapsUrl: 'https://maps.google.com' },
  { title: 'Resepsi Pernikahan', time: '11:00 - 14:00 WIB', venue: 'Grand Ballroom Plataran', address: 'Plataran Menteng, Jl. Cokroaminoto No. 9, Jakarta Pusat', mapsUrl: 'https://maps.google.com' },
];
const DEFAULT_STORIES = [
  { year: '2021', title: 'Pertemuan Pertama', desc: 'Takdir mempertemukan kami di sebuah studio desain kreatif di Jakarta. Berawal dari rekan kerja profesional yang kemudian menyadari adanya frekuensi hati yang sama.' },
  { year: '2023', title: 'Komitmen Bersama', desc: 'Setelah dua tahun saling mengenal karakter dan menyelaraskan impian masa depan, kami memutuskan untuk melangkah ke arah komitmen yang lebih serius.' },
  { year: '2025', title: 'Lamaran Resmi', desc: 'Di hadapan kedua keluarga besar, Aditya resmi meminang Laras sebagai calon istri. Sebuah momen penuh haru yang mengunci langkah kami menuju pelaminan.' },
];
const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800',
];
const DEFAULT_GIFTS = [
  { bank: 'Bank BCA', number: '8720194821', owner: 'Aditya Pratama' },
  { bank: 'Bank Mandiri', number: '1320092817291', owner: 'Laras Atika Putri' },
];
const DEFAULT_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3';
const COVER_IMG = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600';
const HERO_IMG = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1600';
const GROOM_IMG = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600';
const BRIDE_IMG = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';

/* ─── Map studio InvitationContent → the shape this template needs ─── */
function deriveData(content: InvitationContent) {
  const c = content.couple;
  const groom = {
    nickname: c.partner1 || DEFAULT_COUPLE.groom.nickname,
    fullName: c.partner1Title || c.partner1 || DEFAULT_COUPLE.groom.fullName,
    father: c.partner1Father || DEFAULT_COUPLE.groom.father,
    mother: c.partner1Mother || DEFAULT_COUPLE.groom.mother,
    instagram: c.partner1Instagram || DEFAULT_COUPLE.groom.instagram,
  };
  const bride = {
    nickname: c.partner2 || DEFAULT_COUPLE.bride.nickname,
    fullName: c.partner2Title || c.partner2 || DEFAULT_COUPLE.bride.fullName,
    father: c.partner2Father || DEFAULT_COUPLE.bride.father,
    mother: c.partner2Mother || DEFAULT_COUPLE.bride.mother,
    instagram: c.partner2Instagram || DEFAULT_COUPLE.bride.instagram,
  };

  const isoDate = content.event?.date || DEFAULT_DATE;
  const parsed = new Date(isoDate);
  const valid = !isNaN(parsed.getTime());
  const displayDate = valid
    ? parsed.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : isoDate;

  const events = (content.schedule?.items?.length
    ? content.schedule.items.map((it) => ({
        title: it.title || '',
        time: it.time || '',
        venue: it.venue || it.description || '',
        address: it.address || '',
        mapsUrl: it.mapsUrl || 'https://maps.google.com',
      }))
    : DEFAULT_EVENTS).filter((e) => e.title);

  const stories = (content.stories?.length ? content.stories : DEFAULT_STORIES);

  const gallery = content.gallery?.images?.length ? content.gallery.images : DEFAULT_GALLERY;
  const galleryLayout = content.gallery?.layout ?? 'grid';

  const gifts = (content.gift?.items?.length
    ? content.gift.items.map((g) => ({ bank: g.bank || g.name || '', number: g.number || '', owner: g.owner || g.note || '' }))
    : DEFAULT_GIFTS).filter((g) => g.bank || g.number);

  const quote = content.quote?.text ? { text: content.quote.text, source: content.quote.source || '' } : DEFAULT_QUOTE;
  const footerText = content.footer?.text || '';
  const audioUrl = content.music?.src || DEFAULT_AUDIO;

  const coverImg = content.media?.cover || COVER_IMG;
  const heroImg = content.media?.hero || HERO_IMG;
  const groomImg = content.media?.partner1Photo || GROOM_IMG;
  const brideImg = content.media?.partner2Photo || BRIDE_IMG;

  return { groom, bride, isoDate, displayDate, events, stories, gallery, galleryLayout, gifts, quote, footerText, audioUrl, coverImg, heroImg, groomImg, brideImg };
}

/* ─── Fonts + keyframes injected client-side ─── */
function injectFonts() {
  if (typeof window === 'undefined') return;
  const linkId = 'wedding-invitation-fonts';
  if (document.getElementById(linkId)) return;
  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600&display=swap';
  document.head.appendChild(link);
  const style = document.createElement('style');
  style.innerHTML = `
    .font-serif-wedding { font-family: 'Cormorant Garamond', Georgia, serif; }
    .font-sans-wedding { font-family: 'Montserrat', sans-serif; }
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin-slow { animation: spin-slow 12s linear infinite; }
    @keyframes pulse-soft { 0%,100% { opacity: .9; transform: scale(1); } 50% { opacity: 1; transform: scale(1.03); } }
    .pulse-soft { animation: pulse-soft 2s infinite ease-in-out; }
  `;
  document.head.appendChild(style);
}

const STATUS_LABEL: Record<string, string> = { hadir: 'Hadir', tidak_hadir: 'Tidak Hadir', ragu: 'Hadir' };

/** Treat common video extensions as video backgrounds/gallery items (else image). */
function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(url);
}

interface RsvpRow {
  id: string;
  name: string;
  status: string;
  guests: number;
  message?: string;
  created_at: string;
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const diff = Date.now() - then;
  const hr = Math.floor(diff / 3_600_000);
  if (hr < 1) return 'Baru saja';
  if (hr < 24) return `${hr} jam yang lalu`;
  const day = Math.floor(hr / 24);
  return `${day} hari yang lalu`;
}

export function UndanganPernikahanPremium({ content, slug }: MonolithicTemplateProps) {
  const data = deriveData(content);

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestName] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Tamu Undangan';
    const to = new URLSearchParams(window.location.search).get('to');
    return to ? decodeURIComponent(to) : 'Tamu Undangan';
  });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [rsvpForm, setRsvpForm] = useState({ name: '', guests: '1', attendance: 'Hadir', message: '' });
  const [wishes, setWishes] = useState<Array<{ id: string; name: string; attendance: string; guests: string; message: string; time: string }>>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fonts (Cormorant + Montserrat) injected client-side
  useEffect(() => { injectFonts(); }, []);

  // Countdown
  useEffect(() => {
    const target = new Date(data.isoDate).getTime();
    if (isNaN(target)) return;
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setCountdown({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.isoDate]);

  // Load existing RSVPs (rendered as the wishes list)
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((list: unknown) => {
        if (!Array.isArray(list)) return;
        setWishes(
          (list as RsvpRow[]).map((e) => ({
            id: e.id,
            name: e.name,
            attendance: STATUS_LABEL[e.status] ?? 'Hadir',
            guests: String(e.guests ?? 1),
            message: e.message || '',
            time: timeAgo(e.created_at),
          })),
        );
      })
      .catch(() => {});
  }, [slug]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setIsPlaying(true);
    audioRef.current?.play().catch(() => {});
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const handleRsvpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rsvpForm.name.trim() || !rsvpForm.message.trim() || !slug) return;
    const status = rsvpForm.attendance === 'Tidak Hadir' ? 'tidak_hadir' : 'hadir';
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: rsvpForm.name.trim(),
          status,
          guests: Number(rsvpForm.guests) || 1,
          message: rsvpForm.message.trim(),
        }),
      });
      if (!res.ok) return;
      const created = await res.json();
      setWishes((w) => [
        { id: created.id, name: created.name, attendance: STATUS_LABEL[created.status] ?? 'Hadir', guests: String(created.guests ?? 1), message: created.message || '', time: 'Baru saja' },
        ...w,
      ]);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRsvpForm({ name: '', guests: '1', attendance: 'Hadir', message: '' });
      }, 3000);
    } catch { /* ignore */ }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const renderMedia = (src: string, idx: number, fill: boolean) => (
    <>
      {isVideo(src) ? (
        <video src={src} muted loop playsInline className={`transition-transform duration-700 ease-out group-hover:scale-105 ${fill ? 'w-full h-full object-cover' : 'w-full h-auto'}`} />
      ) : (
        <img src={src} alt={`Gallery ${idx + 1}`} className={`transition-transform duration-700 ease-out group-hover:scale-105 ${fill ? 'w-full h-full object-cover' : 'w-full h-auto'}`} />
      )}
      <div className="absolute inset-0 bg-[#2D3327]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span className="p-2.5 bg-white/80 rounded-full text-[#5A6351] backdrop-blur-sm"><Heart className="w-4 h-4 fill-[#5A6351]" /></span>
      </div>
    </>
  );

  const { groom, bride, displayDate, events, stories, gallery, galleryLayout, gifts, quote, audioUrl, coverImg, heroImg, groomImg, brideImg } = data;

  return (
    <div className="font-sans-wedding bg-[#FAF9F6] text-[#2D3327] min-h-screen relative selection:bg-[#5A6351] selection:text-[#FAF9F6] overflow-x-hidden">
      <audio ref={audioRef} src={audioUrl} loop />

      {/* COVER OVERLAY  */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out ${isOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
        style={isVideo(coverImg) ? undefined : { backgroundImage: `linear-gradient(rgba(45,51,39,.65), rgba(45,51,39,.75)), url('${coverImg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {isVideo(coverImg) && (
          <>
            <video src={coverImg} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#2D3327]/70"></div>
          </>
        )}
        <div className="relative z-10 text-center px-4">
          <p className="text-sm uppercase tracking-[0.25em] text-[#F4F6F0] mb-2 font-light">The Wedding of</p>
          <h1 className="text-5xl md:text-7xl font-serif-wedding text-[#C29B68] italic font-medium leading-tight">
            {groom.nickname} &amp; {bride.nickname}
          </h1>
          <div className="w-16 h-[1px] bg-[#C29B68] mx-auto mt-6"></div>
        </div>

        <div className="relative z-10 text-center px-6 mt-10 max-w-md w-full bg-[#FAF9F6]/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[#FAF9F6]/80 mb-1">Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <h3 className="text-xl font-semibold text-[#FAF9F6] font-serif-wedding my-3 italic">{guestName}</h3>
          <p className="text-[11px] text-[#FAF9F6]/70 leading-relaxed mb-6">
            Kami mengundang Anda untuk merayakan momen bahagia pernikahan kami.
          </p>
          <button onClick={handleOpenInvitation} className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#5A6351] hover:bg-[#484f41] text-[#FAF9F6] font-medium text-xs uppercase tracking-[0.2em] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 cursor-pointer">
            <Mail className="w-4 h-4" />
            <span>Buka Undangan</span>
          </button>
        </div>
      </div>

      {/* FLOATING MUSIC CONTROLLER  */}
      {isOpen && (
        <button onClick={toggleMusic} className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#5A6351] text-[#FAF9F6] shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-[#C29B68]/30">
          {isPlaying ? (
            <span className="relative flex items-center justify-center">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-[#C29B68] opacity-75"></span>
              <Volume2 className="w-5 h-5 animate-spin-slow" />
            </span>
          ) : (
            <VolumeX className="w-5 h-5 text-[#FAF9F6]/80" />
          )}
        </button>
      )}

      {/* 1. HERO  */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {isVideo(heroImg) ? (
          <>
            <video src={heroImg} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#2D3327]/55"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(45,51,39,.5), rgba(45,51,39,.6)), url('${heroImg}')` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent"></div>
        <div className="relative text-center px-4 max-w-4xl z-10 text-white mt-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#FAF9F6] mb-4">Maha Suci Allah yang mempersatukan cinta</p>
          <span className="inline-block p-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 mb-6">
            <Heart className="w-5 h-5 text-[#C29B68] fill-[#C29B68]" />
          </span>
          <h1 className="text-6xl md:text-8xl font-serif-wedding font-light text-white italic tracking-wide">
            {groom.nickname} <span className="text-3xl md:text-4xl text-[#C29B68] block md:inline-block my-2 md:my-0">&amp;</span> {bride.nickname}
          </h1>
          <p className="text-sm tracking-[0.25em] font-light text-[#FAF9F6] mt-6 uppercase">{displayDate}</p>
          <div className="mt-8 animate-bounce">
            <p className="text-xs tracking-[0.1em] text-[#C29B68]">Scroll Kebawah</p>
            <span className="inline-block w-1.5 h-1.5 border-r border-b border-[#C29B68] transform rotate-45 mt-1"></span>
          </div>
        </div>
      </section>

      {/* 2. QUOTE  */}
      <section className="py-12 md:py-24 px-6 md:px-12 bg-[#FAF9F6] relative overflow-hidden">
        <FloralCorner className="absolute -top-4 -left-4 w-40 h-40 pointer-events-none" />
        <FloralCorner className="absolute -bottom-4 -right-4 w-40 h-40 pointer-events-none" flip />
        <motion.div variants={V_CONTAINER} {...VP} className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div variants={V_FADE_IN} className="text-2xl text-[#C29B68] font-serif-wedding mb-6">&ldquo;</motion.div>
          <motion.p variants={V_FADE_UP} className="text-base md:text-lg leading-relaxed text-[#5A6351] font-serif-wedding italic font-light px-4">{quote.text}</motion.p>
          {quote.source && <motion.h4 variants={V_FADE_UP} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D3327] mt-6">{quote.source}</motion.h4>}
          <motion.div variants={V_FADE_IN} className="text-2xl text-[#C29B68] font-serif-wedding mt-4">&rdquo;</motion.div>
        </motion.div>
      </section>

      {/* 3. COUNTDOWN  */}
      <section className="py-12 md:py-12 md:py-20 px-6 bg-[#F4F6F0] relative overflow-hidden">
        <LeafSprig className="absolute top-8 left-2 w-24 h-24 pointer-events-none hidden md:block" />
        <LeafSprig className="absolute top-8 right-2 w-24 h-24 pointer-events-none hidden md:block" />
        <motion.div variants={V_CONTAINER} {...VP} className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h3 variants={V_FADE_UP} className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Menghitung Hari Bahagia</motion.h3>
          <motion.h2 variants={V_FADE_UP} className="text-3xl md:text-3xl md:text-4xl font-serif-wedding text-[#2D3327] mb-6 md:mb-8 md:mb-12">Detik-Detik Janji Suci</motion.h2>
          <motion.div variants={V_CONTAINER} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { v: countdown.days, l: 'Hari', accent: false },
              { v: countdown.hours, l: 'Jam', accent: false },
              { v: countdown.minutes, l: 'Menit', accent: false },
              { v: countdown.seconds, l: 'Detik', accent: true },
            ].map((b) => (
              <motion.div key={b.l} variants={V_SCALE} className="bg-[#FAF9F6] p-4 md:p-6 rounded-2xl shadow-sm border border-[#5A6351]/5 flex flex-col items-center">
                <span className={`text-4xl md:text-5xl font-serif-wedding font-semibold ${b.accent ? 'text-[#C29B68]' : 'text-[#5A6351]'}`}>{String(b.v).padStart(2, '0')}</span>
                <span className="text-xs uppercase tracking-widest text-[#2D3327]/60 mt-2 font-medium">{b.l}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* 4. MEMPELAI  */}
      <section className="py-12 md:py-24 px-6 md:px-12 bg-[#FAF9F6] relative overflow-hidden">
        <FloralCorner className="absolute -top-6 right-0 w-44 h-44 pointer-events-none" flip />
        <motion.div variants={V_CONTAINER} {...VP} className="max-w-6xl mx-auto text-center relative z-10">
          <motion.p variants={V_FADE_UP} className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Dengan Hormat &amp; Sukacita</motion.p>
          <motion.h2 variants={V_FADE_UP} className="text-3xl md:text-4xl font-serif-wedding text-[#2D3327] mb-4">Kedua Mempelai</motion.h2>
          <motion.div variants={V_FADE_IN} className="mb-6"><Divider className="w-40 h-5 mx-auto" /></motion.div>
          <motion.p variants={V_FADE_UP} className="text-sm max-w-2xl mx-auto text-[#2D3327]/70 leading-relaxed mb-10 md:mb-16">
            Maka dengan memohon rahmat dan rida Allah SWT, kami bermaksud menyelenggarakan acara pernikahan kami, yang akan mempersatukan:
          </motion.p>
          <motion.div variants={V_CONTAINER} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:p-10 md:gap-16 md:gap-4 md:gap-6 md:gap-8 items-center">
            {[
              { img: groomImg, p: groom, label: 'Putra' },
              { img: brideImg, p: bride, label: 'Putri' },
            ].map((m) => (
              <motion.div key={m.label} variants={V_FADE_UP} className="flex flex-col items-center space-y-4 md:space-y-6">
                <div className="relative w-56 h-72 rounded-t-[7rem] rounded-b-2xl overflow-hidden shadow-xl border-4 border-[#FAF9F6] outline outline-1 outline-[#5A6351]/20">
                  <img src={m.img} alt={m.p.fullName} className="w-full h-full object-cover grayscale-[10%] contrast-[105%]" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-serif-wedding text-[#5A6351] font-bold">{m.p.fullName}</h3>
                  {m.p.instagram && <p className="text-xs text-[#C29B68] tracking-widest uppercase mt-1 mb-4 font-medium">{m.p.instagram}</p>}
                  <p className="text-sm text-[#2D3327]/80 leading-relaxed">
                    {m.label} dari Pasangan: <br />
                    <strong className="text-[#2D3327]">{m.p.father}</strong> <br />
                    &amp; {m.p.mother}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* 5. LOVE STORY  */}
      {stories.length > 0 && (
        <section className="py-12 md:py-24 px-6 md:px-12 bg-[#F4F6F0] relative overflow-hidden">
          <LeafSprig className="absolute top-6 md:p-10 left-1 w-28 h-28 pointer-events-none opacity-60 hidden md:block" />
          <motion.div variants={V_CONTAINER} {...VP} className="max-w-4xl mx-auto relative z-10">
            <motion.div variants={V_FADE_UP} className="text-center mb-10 md:mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Perjalanan Cinta Kami</p>
              <h2 className="text-3xl md:text-4xl font-serif-wedding text-[#2D3327]">Kisah Indah</h2>
              <div className="w-12 h-[1px] bg-[#C29B68] mx-auto mt-4"></div>
            </motion.div>
            <motion.div variants={V_CONTAINER} className="relative border-l border-[#5A6351]/20 ml-4 md:ml-32 space-y-12">
              {stories.map((s, idx) => (
                <motion.div key={idx} variants={V_SLIDE_L} className="relative pl-8 md:pl-12">
                  <span className="absolute -left-[9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FAF9F6] border-2 border-[#5A6351]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C29B68]"></span>
                  </span>
                  <div className="absolute -left-20 md:-left-32 top-1 text-center hidden md:block w-20">
                    <span className="text-lg font-serif-wedding font-bold text-[#C29B68] bg-[#FAF9F6] py-1 px-3.5 rounded-full border border-[#C29B68]/10 shadow-sm">{s.year}</span>
                  </div>
                  <div className="bg-[#FAF9F6] p-4 md:p-6 rounded-2xl shadow-sm border border-[#5A6351]/5">
                    <span className="inline-block text-xs font-bold text-[#C29B68] uppercase tracking-wider mb-2 md:hidden">{s.year}</span>
                    <h4 className="text-xl font-serif-wedding font-bold text-[#2D3327] mb-2">{s.title}</h4>
                    <p className="text-sm text-[#2D3327]/70 leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* 6. EVENTS  */}
      {events.length > 0 && (
        <section className="py-12 md:py-24 px-6 md:px-12 bg-[#FAF9F6] relative overflow-hidden">
          <FloralCorner className="absolute -bottom-6 left-0 w-44 h-44 pointer-events-none" />
          <motion.div variants={V_CONTAINER} {...VP} className="max-w-5xl mx-auto relative z-10">
            <motion.div variants={V_FADE_UP} className="text-center mb-10 md:mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Informasi Acara</p>
              <h2 className="text-3xl md:text-4xl font-serif-wedding text-[#2D3327]">Waktu &amp; Lokasi</h2>
              <p className="text-sm text-[#2D3327]/60 mt-3">Silakan simpan tanggal dan saksikan momen suci kami</p>
            </motion.div>
            <motion.div variants={V_CONTAINER} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 md:gap-8">
              {events.map((event, idx) => (
                <motion.div key={idx} variants={V_FADE_UP} className="bg-[#F4F6F0] p-5 md:p-6 md:p-10 rounded-3xl border border-[#5A6351]/10 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#C29B68]/10 to-transparent pointer-events-none rounded-tr-3xl"></div>
                  <div>
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#5A6351]/10 text-[#5A6351] mb-6">
                      <Calendar className="w-4 h-4 text-[#5A6351]" />
                      <span className="text-xs font-semibold uppercase tracking-wider">{event.title}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif-wedding font-bold text-[#2D3327] mb-4">{displayDate}</h3>
                    <div className="space-y-3 mb-6 md:mb-8">
                      {event.time && (
                        <div className="flex items-start space-x-3 text-sm text-[#2D3327]/80">
                          <Clock className="w-4 h-4 mt-1 text-[#C29B68]" /><span>{event.time}</span>
                        </div>
                      )}
                      {(event.venue || event.address) && (
                        <div className="flex items-start space-x-3 text-sm text-[#2D3327]/80">
                          <MapPin className="w-4 h-4 mt-1 text-[#C29B68]" />
                          <div>
                            {event.venue && <strong className="text-[#2D3327] block mb-1">{event.venue}</strong>}
                            {event.address && <span className="text-xs leading-relaxed block text-[#2D3327]/70">{event.address}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[#5A6351]/10">
                    <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#5A6351] hover:text-[#C29B68] transition-colors duration-300">
                      <span>Buka Google Maps</span><ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-12 rounded-3xl overflow-hidden border border-[#5A6351]/10 shadow-sm h-72 relative">
              <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="w-10 h-10 text-[#C29B68] mb-3 animate-bounce" />
                <h4 className="text-lg font-serif-wedding font-bold text-[#2D3327]">Google Maps Terintegrasi</h4>
                <p className="text-xs text-[#2D3327]/60 mt-1 max-w-sm">Dapatkan rute navigasi terbaik langsung menuju lokasi pernikahan kami menggunakan tombol peta di atas.</p>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* 7. GALLERY  */}
      {gallery.length > 0 && (
        <section className="py-12 md:py-24 px-6 bg-[#F4F6F0] relative overflow-hidden">
          <FloralCorner className="absolute -top-6 -left-4 w-40 h-40 pointer-events-none" />
          <FloralCorner className="absolute -bottom-6 -right-4 w-40 h-40 pointer-events-none" flip />
          <motion.div variants={V_CONTAINER} {...VP} className="max-w-6xl mx-auto relative z-10">
            <motion.div variants={V_FADE_UP} className="text-center mb-10 md:mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Galeri Bahagia</p>
              <h2 className="text-3xl md:text-4xl font-serif-wedding text-[#2D3327]">Momen Cinta</h2>
              <div className="w-12 h-[1px] bg-[#C29B68] mx-auto mt-4"></div>
            </motion.div>

            {galleryLayout === 'masonry' ? (
              <motion.div variants={V_CONTAINER} className="columns-2 md:columns-3 gap-4 md:gap-4 md:gap-6">
                {gallery.map((src, idx) => (
                  <motion.div key={idx} variants={V_FADE_UP} onClick={() => setLightboxIndex(idx)} className="group relative overflow-hidden rounded-2xl shadow-sm cursor-pointer border border-[#5A6351]/5 hover:shadow-md transition-all duration-300 break-inside-avoid mb-4 md:mb-6">
                    {renderMedia(src, idx, false)}
                  </motion.div>
                ))}
              </motion.div>
            ) : galleryLayout === 'carousel' ? (
              <motion.div variants={V_CONTAINER} className="flex gap-4 md:gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory -mx-1 px-1">
                {gallery.map((src, idx) => (
                  <motion.div key={idx} variants={V_FADE_UP} onClick={() => setLightboxIndex(idx)} className="group relative flex-shrink-0 w-[78%] sm:w-[46%] md:w-[31%] aspect-[3/4] overflow-hidden rounded-2xl shadow-sm cursor-pointer border border-[#5A6351]/5 hover:shadow-md transition-all duration-300 snap-center">
                    {renderMedia(src, idx, true)}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div variants={V_CONTAINER} className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-4 md:gap-6">
                {gallery.map((src, idx) => (
                  <motion.div key={idx} variants={V_FADE_UP} onClick={() => setLightboxIndex(idx)} className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-sm cursor-pointer border border-[#5A6351]/5 hover:shadow-md transition-all duration-300">
                    {renderMedia(src, idx, true)}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </section>
      )}

      {/* LIGHTBOX  */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-white/80 hover:text-white text-3xl font-light cursor-pointer">&times;</button>
          <button onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)} className="absolute left-4 p-2 text-white/70 hover:text-white"><ChevronLeft className="w-10 h-10" /></button>
          {isVideo(gallery[lightboxIndex]) ? (
            <video src={gallery[lightboxIndex]} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
          ) : (
            <img src={gallery[lightboxIndex]} alt="Zoomed" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          )}
          <button onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)} className="absolute right-4 p-2 text-white/70 hover:text-white"><ChevronRight className="w-10 h-10" /></button>
        </div>
      )}

      {/* 8. RSVP & GUESTBOOK */}
      <section className="py-12 md:py-24 px-6 md:px-12 bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:p-10 md:gap-16">
            <div className="lg:col-span-6 space-y-5 md:space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Buku Tamu Virtual</p>
                <h2 className="text-3xl md:text-4xl font-serif-wedding text-[#2D3327]">{content.rsvp?.title || 'Konfirmasi RSVP'}</h2>
                {content.rsvp?.description && <p className="text-xs text-[#2D3327]/60 mt-3 leading-relaxed">{content.rsvp.description}</p>}
              </div>

              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#2D3327]/70 font-semibold mb-2">Nama Lengkap</label>
                  <input type="text" required placeholder="Nama Lengkap Anda" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F4F6F0] rounded-xl border border-[#5A6351]/10 text-sm focus:outline-none focus:border-[#5A6351] focus:ring-1 focus:ring-[#5A6351] transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#2D3327]/70 font-semibold mb-2">Konfirmasi Kehadiran</label>
                    <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F4F6F0] rounded-xl border border-[#5A6351]/10 text-sm focus:outline-none focus:border-[#5A6351] transition-all cursor-pointer">
                      <option value="Hadir">Hadir</option>
                      <option value="Tidak Hadir">Tidak Hadir</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#2D3327]/70 font-semibold mb-2">Jumlah Tamu</label>
                    <select value={rsvpForm.guests} disabled={rsvpForm.attendance === 'Tidak Hadir'} onChange={(e) => setRsvpForm({ ...rsvpForm, guests: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F4F6F0] rounded-xl border border-[#5A6351]/10 text-sm focus:outline-none focus:border-[#5A6351] transition-all disabled:opacity-50 cursor-pointer">
                      <option value="1">1 Orang</option><option value="2">2 Orang</option><option value="3">3 Orang</option><option value="4">4 Orang</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#2D3327]/70 font-semibold mb-2">Pesan &amp; Doa Restu</label>
                  <textarea rows={4} required placeholder="Tuliskan ucapan selamat & doa restu tulus Anda di sini..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F4F6F0] rounded-xl border border-[#5A6351]/10 text-sm focus:outline-none focus:border-[#5A6351] focus:ring-1 focus:ring-[#5A6351] transition-all resize-none" />
                </div>
                <button type="submit" disabled={isSubmitted}
                  className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#5A6351] hover:bg-[#484f41] text-[#FAF9F6] font-medium text-xs uppercase tracking-[0.2em] rounded-xl shadow-md transition-all duration-300 transform active:scale-95 disabled:opacity-75 cursor-pointer">
                  {isSubmitted ? (<><Check className="w-4 h-4" /><span>Terima Kasih! RSVP Dikirim</span></>) : (<><MessageSquare className="w-4 h-4" /><span>Kirim Ucapan &amp; Konfirmasi</span></>)}
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 flex flex-col h-[520px]">
              <div className="flex items-center justify-between border-b border-[#5A6351]/10 pb-4 mb-4">
                <span className="text-sm font-semibold text-[#2D3327] tracking-wider uppercase">Ucapan Tamu ({wishes.length})</span>
                <span className="px-2.5 py-1 bg-[#5A6351]/10 text-[#5A6351] text-[10px] font-bold tracking-widest rounded-full uppercase">Realtime Live</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {wishes.map((wish) => (
                  <div key={wish.id} className="bg-[#F4F6F0] p-4 rounded-2xl border border-[#5A6351]/5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif-wedding font-bold text-sm text-[#5A6351]">{wish.name}</span>
                      {wish.time && <span className="text-[10px] text-[#2D3327]/40 font-light">{wish.time}</span>}
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider ${wish.attendance === 'Hadir' ? 'bg-[#5A6351]/10 text-[#5A6351]' : 'bg-red-50 text-red-500'}`}>{wish.attendance}</span>
                      {wish.attendance === 'Hadir' && <span className="text-[10px] text-[#2D3327]/50 font-medium">({wish.guests} Tamu)</span>}
                    </div>
                    {wish.message && <p className="text-xs text-[#2D3327]/75 leading-relaxed">{wish.message}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. DIGITAL GIFT  */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <section className="py-12 md:py-24 px-6 md:px-12 bg-[#F4F6F0]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 md:mb-8 md:mb-12">
              <span className="inline-block p-3.5 bg-[#5A6351]/10 rounded-full mb-4 text-[#5A6351]"><Gift className="w-7 h-7" /></span>
              <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Kado Digital</p>
              <h2 className="text-3xl md:text-4xl font-serif-wedding text-[#2D3327]">Tanda Kasih</h2>
              <p className="text-sm text-[#2D3327]/60 max-w-lg mx-auto mt-3 leading-relaxed">
                {content.gift?.description || 'Doa restu Anda adalah karunia terindah bagi kami. Namun jika Anda bermaksud mengirimkan tanda kasih, Anda dapat menyalurkannya secara nontunai melalui rekening di bawah ini:'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {gifts.map((gift, idx) => (
                <div key={idx} className="bg-[#FAF9F6] p-6 rounded-3xl border border-[#5A6351]/10 shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
                  <div className="text-center w-full">
                    {gift.bank && <span className="text-xs font-bold text-[#C29B68] tracking-widest uppercase block mb-1">{gift.bank}</span>}
                    <div className="w-8 h-[1px] bg-[#C29B68]/30 mx-auto mb-4"></div>
                    {gift.number && <p className="text-lg font-mono font-bold text-[#2D3327] tracking-wider">{gift.number}</p>}
                    {gift.owner && <p className="text-xs text-[#2D3327]/60 mt-1 uppercase tracking-wide">A/N: {gift.owner}</p>}
                  </div>
                  <button onClick={() => copyToClipboard(gift.number, idx)} className="mt-6 w-full inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-[#5A6351]/10 hover:bg-[#5A6351] text-[#5A6351] hover:text-[#FAF9F6] text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer">
                    {copiedIndex === idx ? (<><Check className="w-3.5 h-3.5 text-green-600" /><span className="text-green-600">Berhasil Disalin!</span></>) : (<><Copy className="w-3.5 h-3.5" /><span>Salin No. Rekening</span></>)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. FOOTER  */}
      <footer className="py-12 md:py-24 px-6 bg-[#2D3327] text-[#FAF9F6] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-5 md:space-y-8">
          <p className="text-xs uppercase tracking-[0.4em] text-[#C29B68]">Terima Kasih</p>
          <h2 className="text-4xl md:text-5xl font-serif-wedding font-light italic text-white">
            {content.footer?.text || 'Merupakan Kehormatan & Kebahagiaan Bagi Kami Apabila Bapak/Ibu Berkenan Hadir.'}
          </h2>
          <div className="w-16 h-[1px] bg-[#C29B68] mx-auto my-6"></div>
          <div className="space-y-2">
            <p className="text-xs text-[#FAF9F6]/60 uppercase tracking-[0.2em]">Kami yang Berbahagia</p>
            <h4 className="text-2xl md:text-3xl font-serif-wedding text-[#C29B68] italic font-medium">{groom.nickname} &amp; {bride.nickname}</h4>
            <p className="text-xs text-[#FAF9F6]/40 uppercase tracking-widest mt-1">Beserta Seluruh Keluarga Besar Kedua Mempelai</p>
          </div>
        </div>
        {content.footer?.showCredit !== false && (
          <div className="border-t border-[#FAF9F6]/10 mt-20 pt-8 text-center text-[10px] text-[#FAF9F6]/40 uppercase tracking-widest relative z-10">
            <p>© {new Date().getFullYear()} {groom.nickname} &amp; {bride.nickname}. All Rights Reserved.</p>
            <p className="mt-1 font-light">Elegantly Created with Love</p>
          </div>
        )}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#5A6351]/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C29B68]/5 blur-[100px] pointer-events-none"></div>
      </footer>
    </div>
  );
}

export default UndanganPernikahanPremium;
