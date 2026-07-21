'use client';

import { useState, useRef, useEffect } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent } from '@/lib/content/types';
import {
  Sparkles, Calendar, Clock, MapPin, Send, Copy, Check, ChevronDown,
  Camera, Users, MessageSquare, Award, Map,
} from 'lucide-react';
import { isVideo, useRsvpWishes, useCountdown, useGuestName, displayDateFrom, pickMedia } from './shared';

type Mode = 'metatah' | 'birthday';

interface Theme {
  accent: string;
  darkBg: string;
  lightBg: string;
  textCls: string;
  fontTitle: string;
  title: string;
  subtitle: string;
  heroSubtitle: string;
  celebrantLabel: string;
  storyTitle: string;
  storyIntro: string;
  galleryTitle: string;
  mapBtn: string;
  closing: string;
}

const THEMES: Record<Mode, Theme> = {
  metatah: {
    accent: '#C5A85A',
    darkBg: 'bg-[#1D110D]',
    lightBg: 'bg-[#FAF6F0]',
    textCls: 'text-[#1D110D]',
    fontTitle: 'font-luxury-serif',
    title: 'Metatah & Mepandes',
    subtitle: 'Upacara Potong Gigi Suci',
    heroSubtitle: 'OM SWASTYASTU',
    celebrantLabel: 'Sang Pandita / Sang Sinuci',
    storyTitle: 'Makna & Esensi Metatah',
    storyIntro: 'Metatah atau Mepandes adalah ritual sakral keagamaan Hindu di Bali sebagai simbol kedewasaan spiritual.',
    galleryTitle: 'Lensa Dokumenter Budaya',
    mapBtn: 'bg-[#1D110D] text-white hover:bg-[#C5A85A]',
    closing: 'OM SHANTI SHANTI SHANTI OM',
  },
  birthday: {
    accent: '#D4AF37',
    darkBg: 'bg-[#0B0F19]',
    lightBg: 'bg-[#0F172A]',
    textCls: 'text-[#F1F5F9]',
    fontTitle: 'font-playfair',
    title: 'The Golden Gala',
    subtitle: 'Milestone Birthday Celebration',
    heroSubtitle: 'YOU ARE COMMENDABLY INVITED',
    celebrantLabel: 'The Celebrant',
    storyTitle: 'A Journey of Growth',
    storyIntro: 'A retrospective chronicle of milestones, friendships, and beautiful lessons celebrated with those dearest.',
    galleryTitle: 'Frames of Life & Joy',
    mapBtn: 'bg-[#D4AF37] text-[#0B0F19] hover:bg-white',
    closing: 'THANK YOU FOR BEING A PART OF MY JOURNEY',
  },
};

interface PartnerDef { nick: string; full: string; sub: string; bio: string; origin: string }
interface EventDef { title: string; time: string; venue: string; address: string; mapsUrl: string; note: string }
interface GiftDef { bank: string; number: string; owner: string }
interface StoryDef { year: string; title: string; desc: string }
interface DefaultsShape {
  couple: { p1: PartnerDef; p2?: PartnerDef };
  date: string;
  quote: { text: string; author: string };
  stories: StoryDef[];
  events: EventDef[];
  gallery: string[];
  gifts: GiftDef[];
  audio: string;
  cover: string; hero: string; p1: string; p2: string;
}

const DEFAULTS: Record<Mode, DefaultsShape> = {
  metatah: {
    couple: {
      p1: { nick: 'Raditya', full: 'I Gede Bagus Raditya', sub: 'Raditya', bio: 'Putra Pertama dari I Wayan Sudarsana & Ni Ketut Sulastri', origin: 'Banjar Denpasar, Bali' },
      p2: { nick: 'Ayu Candra', full: 'Ni Luh Ayu Candrawati', sub: 'Ayu Candra', bio: 'Putri Kedua dari I Wayan Sudarsana & Ni Ketut Sulastri', origin: 'Banjar Denpasar, Bali' },
    },
    date: '2027-07-24T08:00:00',
    quote: { text: 'Dengan mengendalikan Sad Ripu (enam musuh di dalam diri), manusia mencapai ketenangan jiwa yang murni, meniti dharma, dan menyatu dalam keharmonisan alam semesta.', author: 'Upacara Manusa Yadnya Suci' },
    stories: [
      { year: 'Sad Ripu', title: 'Pengendalian Nafsu', desc: 'Simbolis meminimalkan sifat buruk seperti amarah, keserakahan, kegelapan pikiran, dan nafsu tak terkendali.' },
      { year: 'Dharma', title: 'Kewajiban Orang Tua', desc: 'Wujud pembayaran hutang moral orang tua kepada anaknya untuk mengantarkan mereka menuju gerbang kedewasaan.' },
      { year: 'Kesucian', title: 'Estetika Spiritual', desc: 'Merapikan deretan gigi taring sebagai lambang transisi karakter dari sifat liar menuju sifat dewa.' },
    ],
    events: [
      { title: 'Upacara Ngekeb', time: '15:00 WITA - Selesai', venue: 'Griya Agung Sudarsana', address: 'Denpasar, Bali', mapsUrl: 'https://maps.google.com', note: 'Prosesi pingitan suci — persiapan batiniah dan jasmani.' },
      { title: 'Puncak Mepandes', time: '08:00 - 13:00 WITA', venue: 'Griya Agung Sudarsana', address: 'Denpasar, Bali', mapsUrl: 'https://maps.google.com', note: 'Prosesi pemangkasan gigi oleh Sang Sangging.' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=800',
    ],
    gifts: [
      { bank: 'Bank BPD Bali', number: '010023459821', owner: 'I Wayan Sudarsana' },
      { bank: 'Bank BCA', number: '7810592833', owner: 'I Gede Bagus Raditya' },
    ],
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    cover: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1600',
    hero: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1600',
    p1: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    p2: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
  },
  birthday: {
    couple: {
      p1: { nick: 'Gwyneth Amanda', full: 'Gwyneth Amanda Wardana', sub: 'Gwyneth', bio: 'Chic, passionate designer, loving daughter, and dream chaser.', origin: 'Canggu, Bali' },
    },
    date: '2027-09-12T19:00:00',
    quote: { text: 'Youth is not a time of life; it is a state of mind, a temper of the will, a quality of the imagination. Cheers to a beautiful journey of lessons, growth, and endless horizons.', author: 'Gwyneth Amanda' },
    stories: [
      { year: 'Chapter I', title: 'The Roots of Art', desc: 'Born with an insatiable curious mind, discovering a fierce passion for aesthetics and spatial architecture.' },
      { year: 'Chapter II', title: 'Global Journeys', desc: 'Ventured into top global design studios, cultivating deep perspectives on culture and high-end minimalism.' },
      { year: 'Chapter III', title: 'The Legacy Ahead', desc: 'Inaugurating this milestone by establishing a boutique studio, gathering closest hearts to toast for tomorrow.' },
    ],
    events: [
      { title: 'Sunset Cocktail', time: '17:30 - 19:00 WITA', venue: 'The Ritz-Carlton Cliff Lawn', address: 'Uluwatu, Bali', mapsUrl: 'https://maps.google.com', note: 'Gold-hued elixir cocktails, fine strings live quartet, and sunset snapshots.' },
      { title: 'Main Gala Night', time: '19:00 WITA - Late', venue: 'Grand Ballroom Ritz-Carlton', address: 'Uluwatu, Bali', mapsUrl: 'https://maps.google.com', note: 'Gastronome dinner, custom visual keynotes, cake slicing, and deep dance beats.' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    ],
    gifts: [
      { bank: 'Bank BCA', number: '8092110291', owner: 'Gwyneth Amanda' },
      { bank: 'Bank Mandiri', number: '132009812933', owner: 'Gwyneth Amanda' },
    ],
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    cover: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1600',
    hero: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1600',
    p1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
    p2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
  },
};

function deriveData(content: InvitationContent, mode: Mode) {
  const D = DEFAULTS[mode];
  const c = content.couple;
  const p1 = { nick: c.partner1 || D.couple.p1.nick, full: c.partner1Title || c.partner1 || D.couple.p1.full, sub: c.partner1 || D.couple.p1.sub, bio: c.partner1Desc || c.partner1Father && `${c.partner1Father} & ${c.partner1Mother}` || D.couple.p1.bio, origin: D.couple.p1.origin };
  // Birthday/solo mode → only 1 celebrant, no partner2.
  const p2 = mode === 'birthday' ? null : (c.partner2 || D.couple.p2
    ? { nick: c.partner2 || D.couple.p2?.nick || '', full: c.partner2Title || c.partner2 || D.couple.p2?.full || '', sub: c.partner2 || D.couple.p2?.sub || '', bio: c.partner2Desc || (c.partner2Father && `${c.partner2Father} & ${c.partner2Mother}`) || D.couple.p2?.bio || '', origin: D.couple.p2?.origin || '' }
    : null);
  const celebrants = [p1, ...(p2 ? [p2] : [])];

  const isoDate = content.event?.date || D.date;
  const displayDate = displayDateFrom(isoDate, D.date);
  const quote = content.quote?.text ? { text: content.quote.text, author: content.quote.source || '' } : D.quote;
  const stories = content.stories?.length ? content.stories : D.stories;
  const events = (content.schedule?.items?.length
    ? content.schedule.items.map((it) => ({ title: it.title || '', time: it.time || '', venue: it.venue || '', address: it.address || '', mapsUrl: it.mapsUrl || 'https://maps.google.com', note: it.description || '' }))
    : D.events).filter((e) => e.title);
  const gallery = content.gallery?.images?.length ? content.gallery.images : D.gallery;
  const gifts = (content.gift?.items?.length
    ? content.gift.items.map((g) => ({ bank: g.bank || g.name || '', number: g.number || '', owner: g.owner || g.note || '' }))
    : D.gifts).filter((g) => g.bank || g.number);
  const audio = content.music?.src || D.audio;
  const media = pickMedia(content, { cover: D.cover, hero: D.hero, p1: D.p1, p2: D.p2 });
  return { celebrants, isoDate, displayDate, quote, stories, events, gallery, gifts, audio, media };
}

function Ornament({ mode, className = 'w-8 h-8' }: { mode: Mode; className?: string }) {
  const color = THEMES[mode].accent;
  if (mode === 'metatah') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
        <path d="M50 0 C40 20, 20 40, 0 50 C20 60, 40 80, 50 100 C60 80, 80 60, 100 50 C80 40, 60 20, 50 0 Z" fill={color} />
        <path d="M50 15 C43 30, 30 43, 15 50 C30 57, 43 70, 50 85 C57 70, 70 57, 85 50 C70 43, 57 30, 50 15 Z" fill="#FFF" opacity="0.3" />
        <circle cx="50" cy="50" r="8" fill="#FFF" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

function injectStyles() {
  if (typeof window === 'undefined') return;
  const id = 'celebration-premium-styles';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@200;300;400;500;600&family=Sacramento&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap';
  document.head.appendChild(link);
  const style = document.createElement('style');
  style.innerHTML = `
    .font-luxury-serif { font-family: 'Cormorant Garamond', serif; }
    .font-header-deco { font-family: 'Cinzel Decorative', serif; }
    .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-cursive-love { font-family: 'Sacramento', cursive; }
    .font-playfair { font-family: 'Playfair Display', serif; }
    @keyframes celFadeUp { from { opacity:0; transform: translateY(40px); } to { opacity:1; transform: translateY(0); } }
    .animate-fade-up { animation: celFadeUp 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes celRotate { from { transform: rotate(0); } to { transform: rotate(360deg); } }
    .animate-rotate-slow { animation: celRotate 45s linear infinite; }
    @keyframes celFloat { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-8px) rotate(1deg); } }
    .animate-float-gentle { animation: celFloat 6s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}

export function UndanganCelebrationPremium({ content, slug, mode }: MonolithicTemplateProps & { mode: Mode }) {
  const theme = THEMES[mode];
  const data = deriveData(content, mode);
  const { celebrants, isoDate, displayDate, quote, stories, events, gallery, gifts, audio, media } = data;

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const guestName = useGuestName('Tamu Undangan Spesial');
  const countdown = useCountdown(isoDate);
  const [activeTab, setActiveTab] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { wishes, rsvpForm, setRsvpForm, isSubmitted, submit } = useRsvpWishes(slug);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { injectStyles(); }, []);

  const open = () => { setIsOpen(true); setIsPlaying(true); audioRef.current?.play().catch(() => {}); };
  const toggleMusic = () => { if (!audioRef.current) return; if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(() => {}); setIsPlaying(!isPlaying); };
  const copy = (text: string, index: number) => { navigator.clipboard?.writeText(text); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 3000); };
  const currentIdx = activeTab < events.length ? activeTab : 0;
  const activeEvent = events[currentIdx];
  const titleLine = mode === 'metatah' ? `${celebrants[0]?.nick} & ${celebrants[1]?.nick || ''}` : celebrants[0]?.nick || '';

  return (
    <div className={`font-jakarta min-h-screen ${theme.lightBg} ${theme.textCls} relative overflow-x-hidden`}>
      <audio ref={audioRef} src={audio} loop />

      {/* COVER  */}
      {!isOpen && (
        <div className={`fixed inset-0 z-50 flex flex-col justify-between items-center ${theme.darkBg} p-6 text-center overflow-hidden`}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <div className={`w-[120vw] h-[120vw] border-[40px] rounded-full animate-rotate-slow`} style={{ borderColor: theme.accent }}></div>
          </div>
          <div className="mt-12 z-20 flex flex-col items-center">
            <Ornament mode={mode} className="w-16 h-16 animate-float-gentle" />
          </div>
          <div className="my-auto max-w-2xl z-20 space-y-5 md:space-y-8 px-4">
            <span className="text-xs uppercase tracking-[0.35em] block" style={{ color: theme.accent }}>{theme.subtitle}</span>
            <h1 className={`text-5xl md:text-7xl ${theme.fontTitle} font-light tracking-wide text-white leading-tight`}>{titleLine}</h1>
            <div className="pt-6 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 block">Yth. Bapak/Ibu/Saudara/i:</span>
              <div className="bg-white/5 backdrop-blur-md border rounded-2xl p-5 px-8 inline-block shadow-2xl" style={{ borderColor: `${theme.accent}66` }}>
                <span className={`font-luxury-serif text-2xl md:text-3xl font-light text-white block tracking-wide`}>{guestName}</span>
                <span className="text-[9px] uppercase tracking-widest mt-2 block font-bold" style={{ color: theme.accent }}>Tamu Kehormatan Kami</span>
              </div>
            </div>
            <button onClick={open} className="px-8 py-3.5 font-bold rounded-full shadow-2xl transition-all duration-300 transform hover:-translate-y-1 tracking-[0.2em] text-[11px] uppercase flex items-center gap-2.5 mx-auto" style={{ background: theme.accent, color: mode === 'metatah' ? '#1D110D' : '#0B0F19' }}>
              <Sparkles className="w-4 h-4" /> Buka Undangan
            </button>
          </div>
          <div className="mb-6 z-20"><p className="text-[9px] text-gray-400 tracking-[0.35em] uppercase">#ElegantCelebration</p></div>
        </div>
      )}

      {isOpen && (
        <button onClick={toggleMusic} className="fixed bottom-6 right-6 z-50 p-4 bg-white text-[#111] rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center">
          {isPlaying ? <VolumeOn color="#10b981" /> : <VolumeOff color="#f43f5e" />}
        </button>
      )}

      {/* HERO  */}
      <section className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b ${mode === 'metatah' ? 'from-[#1D110D] to-[#361B14]' : 'from-[#0B0F19] to-[#1E1B4B]'} text-white`}>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover" /> : <img src={media.hero} alt="hero" className="w-full h-full object-cover" />}
        </div>
        <div className="max-w-6xl w-full mx-auto px-6 py-12 md:py-24 text-center relative z-10 flex flex-col justify-between min-h-[85vh]">
          <div className="space-y-3 animate-fade-up">
            <span className="text-[10px] uppercase tracking-[0.4em] font-semibold block" style={{ color: theme.accent }}>{theme.heroSubtitle}</span>
            <div className="h-[1px] w-24 mx-auto" style={{ background: `${theme.accent}66` }}></div>
          </div>
          <div className="my-auto space-y-4 md:space-y-6">
            <h1 className={`text-6xl md:text-8xl ${theme.fontTitle} font-light tracking-wide text-white leading-tight`}>
              {mode === 'metatah' ? <>Metatah <br /><span className="font-cursive-love text-5xl md:text-8xl block mt-2" style={{ color: theme.accent }}>Mepandes</span></> : <>{celebrants[0]?.nick} <br /><span className="text-4xl md:text-6xl block mt-3 italic" style={{ color: theme.accent }}>{celebrants[0]?.full?.replace(celebrants[0]?.nick || '', '').trim() || ''}</span></>}
            </h1>
            <p className="text-xs md:text-sm tracking-[0.25em] uppercase font-bold" style={{ color: theme.accent }}>{displayDate}</p>
          </div>
          <div className="space-y-3">
            <p className="text-[9px] uppercase tracking-widest text-white/60">GULIR PERLAHAN</p>
            <div className="w-[1px] h-10 mx-auto" style={{ background: theme.accent }}></div>
          </div>
        </div>
      </section>

      {/* QUOTE  */}
      <section className={`py-12 md:py-28 ${mode === 'metatah' ? 'bg-[#FAF6F0]' : 'bg-[#0F172A]'} relative overflow-hidden`}>
        <div className="absolute -top-16 -left-16 w-48 h-48 opacity-[0.05] pointer-events-none"><Ornament mode={mode} className="w-full h-full" /></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 opacity-[0.05] pointer-events-none"><Ornament mode={mode} className="w-full h-full" /></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="flex justify-center mb-6"><Ornament mode={mode} className="w-8 h-8" /></div>
          <p className={`text-2xl md:text-3xl font-light italic leading-relaxed px-4 ${mode === 'metatah' ? 'font-luxury-serif text-[#1D110D]' : 'font-playfair text-white'}`}>&ldquo;{quote.text}&rdquo;</p>
          <div className="w-20 h-[1px] mx-auto my-8" style={{ background: theme.accent }}></div>
          {quote.author && <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">— {quote.author}</p>}
        </div>
      </section>

      {/* COUNTDOWN  */}
      <section className={`py-12 md:py-28 ${theme.darkBg} text-white relative`}>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <span className="text-[10px] uppercase tracking-[0.4em] font-semibold block mb-2" style={{ color: theme.accent }}>WAKTU YANG DINANTI</span>
          <h2 className={`${theme.fontTitle} text-3xl md:text-5xl text-white tracking-wide font-light mb-6 md:mb-8 md:mb-12`}>Menghitung Hari Bahagia</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[{ v: countdown.days, l: 'Hari Lagi' }, { v: countdown.hours, l: 'Jam' }, { v: countdown.minutes, l: 'Menit' }, { v: countdown.seconds, l: 'Detik' }].map((it, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center transform hover:-translate-y-1 transition-all duration-300 shadow-2xl">
                <span className={`text-4xl md:text-5xl ${theme.fontTitle} font-light mb-2`} style={{ color: theme.accent }}>{String(it.v).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">{it.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CELEBRANTS  */}
      <section className={`py-12 md:py-28 ${mode === 'metatah' ? 'bg-[#FAF6F0]' : 'bg-[#0F172A]'} relative`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-20">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">PROFIL UTAMA</span>
            <h2 className={`${theme.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>{theme.celebrantLabel}</h2>
            <div className="h-[1px] w-24 mx-auto mt-4" style={{ background: theme.accent }}></div>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:p-10 md:gap-16 md:gap-24">
            {celebrants.map((person, i) => (
              <div key={i} className="text-center max-w-xs space-y-4 md:space-y-6 flex flex-col items-center">
                <div className="relative w-60 h-60 rounded-full p-2 border shadow-xl overflow-hidden" style={{ borderColor: theme.accent }}>
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    {isVideo(i === 0 ? media.p1 : media.p2) ? <video src={i === 0 ? media.p1 : media.p2} muted loop playsInline className="w-full h-full object-cover" /> : <img src={i === 0 ? media.p1 : media.p2} alt={person.full} className="w-full h-full object-cover" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className={`${theme.fontTitle} text-2xl font-light ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>{person.full}</h3>
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold block" style={{ color: theme.accent }}>{person.sub}</span>
                </div>
                {person.bio && <div className="text-xs leading-relaxed text-gray-400"><p className="italic font-light">{person.bio}</p>{person.origin && <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-2 font-semibold">{person.origin}</p>}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY / MEANING  */}
      {stories.length > 0 && (
        <section className={`py-12 md:py-28 ${mode === 'metatah' ? 'bg-[#EFEAE2]' : 'bg-[#0B0F19]'} relative overflow-hidden`}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">FILOSOFI &amp; MAKNA</span>
              <h2 className={`${theme.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>{theme.storyTitle}</h2>
              <div className="h-[1px] w-24 mx-auto mt-4" style={{ background: theme.accent }}></div>
            </div>
            <p className="text-center text-xs md:text-sm text-gray-400 max-w-xl mx-auto mb-10 md:mb-16 leading-relaxed">{theme.storyIntro}</p>
            <div className="relative border-l ml-4 md:ml-32 space-y-12" style={{ borderColor: `${theme.accent}66` }}>
              {stories.map((s, i) => (
                <div key={i} className="relative pl-8 md:pl-16">
                  <span className="absolute -left-3 top-1 flex items-center justify-center w-6 h-6 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 0 8px ${mode === 'metatah' ? '#EFEAE2' : '#0B0F19'}` }}><Ornament mode={mode} className="w-2.5 h-2.5" /></span>
                  <span className={`hidden md:block absolute -left-32 top-1 text-right w-24 font-light text-sm ${mode === 'metatah' ? 'text-[#1D110D] font-luxury-serif' : 'font-playfair'}`} style={{ color: mode === 'birthday' ? theme.accent : undefined }}>{s.year}</span>
                  <div className={`rounded-xl p-6 shadow-sm border ${mode === 'metatah' ? 'bg-white border-[#C5A85A]/20' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <span className="md:hidden text-[9px] font-bold text-gray-400 bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">{s.year}</span>
                      <h4 className={`text-lg font-bold ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>{s.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY  */}
      {gallery.length > 0 && (
        <section className={`py-12 md:py-28 ${mode === 'metatah' ? 'bg-[#FAF6F0]' : 'bg-[#0F172A]'} relative`}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">GALERI ACARA</span>
              <h2 className={`${theme.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>{theme.galleryTitle}</h2>
              <div className="h-[1px] w-24 mx-auto mt-4" style={{ background: theme.accent }}></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {gallery.map((src, idx) => (
                <div key={idx} onClick={() => setLightboxIndex(idx)} className="relative overflow-hidden aspect-[3/4] rounded-2xl cursor-pointer group shadow-lg border border-white/5 bg-black/25">
                  {isVideo(src) ? <video src={src} muted loop playsInline className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <img src={src} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                    <div className="flex items-center gap-1.5" style={{ color: theme.accent }}><Camera className="w-4 h-4" /><span className="uppercase tracking-widest text-[9px] font-bold">Zoom Photo</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {lightboxIndex !== null && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
              <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                {isVideo(gallery[lightboxIndex]) ? <video src={gallery[lightboxIndex]} controls autoPlay className="w-full max-h-[80vh] rounded-xl" /> : <img src={gallery[lightboxIndex]} alt="Zoomed" className="w-full max-h-[80vh] object-contain rounded-xl" />}
                <button onClick={() => setLightboxIndex(null)} className="mt-6 px-5 py-2 mx-auto block border border-white/20 text-white rounded-full text-[10px] uppercase tracking-widest">Tutup Media</button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* AGENDA  */}
      {events.length > 0 && (
        <section className={`py-12 md:py-28 ${mode === 'metatah' ? 'bg-[#EFEAE2]' : 'bg-[#0B0F19]'} relative`}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">RUNTUTAN KEGIATAN</span>
              <h2 className={`${theme.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>Agenda Utama</h2>
              <div className="h-[1px] w-24 mx-auto mt-4" style={{ background: theme.accent }}></div>
            </div>
            {events.length > 1 && (
              <div className="flex justify-center flex-wrap space-x-4 mb-10 max-w-md mx-auto gap-3">
                {events.map((evt, i) => (
                  <button key={i} onClick={() => setActiveTab(i)} className={`flex-1 min-w-[140px] py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${currentIdx === i ? 'bg-[#111] text-white border-black shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-500'}`}>{evt.title}</button>
                ))}
              </div>
            )}
            {activeEvent && (
              <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-amber-500/10 text-center space-y-4 md:space-y-6 text-[#1D110D] animate-fade-up">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto" style={{ color: theme.accent }}>{currentIdx === 0 ? <Award className="w-5 h-5" /> : <Users className="w-5 h-5" />}</div>
                  <h3 className={`${theme.fontTitle} text-2xl font-light`}>{activeEvent.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 border-y border-gray-100 py-5">
                  <div className="space-y-1 flex flex-col items-center"><Calendar className="w-4 h-4 text-amber-600" /><span className="font-bold text-gray-700">Tanggal</span><span>{displayDate}</span></div>
                  <div className="space-y-1 flex flex-col items-center"><Clock className="w-4 h-4 text-amber-600" /><span className="font-bold text-gray-700">Waktu</span><span>{activeEvent.time}</span></div>
                </div>
                {(activeEvent.venue || activeEvent.address) && (
                  <div className="space-y-1.5">
                    <MapPin className="w-4 h-4 text-amber-600 mx-auto" />
                    {activeEvent.venue && <span className="font-bold text-xs text-gray-700 block">{activeEvent.venue}</span>}
                    {activeEvent.address && <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">{activeEvent.address}</p>}
                  </div>
                )}
                {activeEvent.note && <p className="text-xs text-gray-400 italic max-w-md mx-auto pt-2">{activeEvent.note}</p>}
                <a href={activeEvent.mapsUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-8 py-3.5 font-bold rounded-full text-[10px] uppercase tracking-widest transition-all duration-300 ${theme.mapBtn}`}><Map className="w-4 h-4" /> Buka Google Maps</a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RSVP  */}
      <section className={`py-12 md:py-28 ${mode === 'metatah' ? 'bg-[#EFEAE2]' : 'bg-[#0B0F19]'} relative`}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">KONFIRMASI KEHADIRAN</span>
            <h2 className={`${theme.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light text-white`}>{content.rsvp?.title || 'Form RSVP & Ucapan'}</h2>
            <div className="h-[1px] w-24 mx-auto mt-4" style={{ background: theme.accent }}></div>
          </div>
          <div className="grid lg:grid-cols-12 gap-4 md:gap-6 md:gap-8 items-start">
            <form onSubmit={submit} className="lg:col-span-5 bg-white text-[#111] rounded-2xl p-6 shadow-md border border-gray-100 space-y-4">
              <input type="text" required value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })} placeholder="Nama Lengkap" className="w-full px-4 py-3 rounded-xl border border-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-50/50" />
              <div className="grid grid-cols-2 gap-3">
                {['Hadir', 'Tidak Hadir'].map((opt) => (
                  <button key={opt} type="button" onClick={() => setRsvpForm({ ...rsvpForm, attendance: opt })} className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all ${rsvpForm.attendance === opt ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{opt}</button>
                ))}
              </div>
              {rsvpForm.attendance === 'Hadir' && (
                <div className="relative">
                  <select value={rsvpForm.guests} onChange={(e) => setRsvpForm({ ...rsvpForm, guests: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-100 text-xs focus:outline-none bg-gray-50/50 appearance-none"><option value="1">1 Orang</option><option value="2">2 Orang</option><option value="3">3 Orang</option><option value="4">4 Orang</option></select>
                  <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}
              <textarea required rows={4} value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })} placeholder="Doa restu & harapan..." className="w-full px-4 py-3 rounded-xl border border-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-50/50" />
              <button type="submit" disabled={isSubmitted} className="w-full py-3.5 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-70" style={{ background: mode === 'metatah' ? '#8C3A22' : theme.accent, color: mode === 'birthday' ? '#0B0F19' : '#fff' }}><Send className="w-3.5 h-3.5" /> {isSubmitted ? 'TERKIRIM' : 'KIRIM KONFIRMASI'}</button>
            </form>
            <div className="lg:col-span-7 bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col h-[460px]" style={mode === 'metatah' ? { background: '#fff', borderColor: '#e5e7eb' } : undefined}>
              <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}><MessageSquare className="w-4 h-4 text-amber-500" /> <span>Kesan &amp; Pesan ({wishes.length})</span></h4>
              <div className="overflow-y-auto space-y-3.5 pr-1 flex-1">
                {wishes.map((w) => (
                  <div key={w.id} className={`p-4 rounded-xl border ${mode === 'metatah' ? 'bg-[#FAF6F0] border-[#C5A85A]/20' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>{w.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[7px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${w.attendance === 'Hadir' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{w.attendance}</span>
                        {w.time && <span className="text-[8px] text-gray-400">{w.time}</span>}
                      </div>
                    </div>
                    {w.message && <p className={`text-xs leading-relaxed font-light ${mode === 'metatah' ? 'text-[#4E3629]/80' : 'text-gray-300'}`}>{w.message}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GIFT  */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <section className={`py-12 md:py-28 ${mode === 'metatah' ? 'bg-[#FAF6F0]' : 'bg-[#0F172A]'} relative`}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="mb-6 md:mb-8 md:mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">HADIAH DIGITAL</span>
              <h2 className={`${theme.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>{content.gift?.title || 'Tanda Kasih Acara'}</h2>
              <div className="h-[1px] w-24 mx-auto mt-4" style={{ background: theme.accent }}></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {gifts.map((g, idx) => (
                <div key={idx} className={`backdrop-blur-md rounded-2xl p-6 text-left shadow-lg ${mode === 'metatah' ? 'bg-white border border-[#C5A85A]/30' : 'bg-white/5 border border-white/5'}`}>
                  {g.bank && <p className={`${theme.fontTitle} text-xl font-bold mb-3 ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>{g.bank}</p>}
                  {g.number && (
                    <div className={`p-3 rounded-lg border flex items-center justify-between mb-3 ${mode === 'metatah' ? 'bg-[#FAF6F0] border-[#C5A85A]/30' : 'bg-black/20 border-white/5'}`}>
                      <span className={`font-mono text-xs tracking-wider font-semibold ${mode === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>{g.number}</span>
                      <button onClick={() => copy(g.number, idx)} className="text-[9px] flex items-center gap-1 font-bold uppercase tracking-wider" style={{ color: theme.accent }}>{copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}{copiedIndex === idx ? 'Copied' : 'Copy'}</button>
                    </div>
                  )}
                  {g.owner && <div className={`text-[10px] ${mode === 'metatah' ? 'text-[#4E3629]/70' : 'text-gray-400'}`}><span className="block font-semibold">Atas Nama:</span><span>{g.owner}</span></div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER  */}
      <footer className={`py-12 md:py-20 ${theme.darkBg} text-white relative text-center border-t border-white/5`}>
        <div className="absolute bottom-6 left-6 w-12 h-12 opacity-5"><Ornament mode={mode} className="w-full h-full" /></div>
        <div className="absolute bottom-6 right-6 w-12 h-12 opacity-5"><Ornament mode={mode} className="w-full h-full" /></div>
        <div className="max-w-3xl mx-auto px-6 space-y-4 md:space-y-6 relative z-10">
          <h4 className={`${theme.fontTitle} text-2xl font-light text-white tracking-widest`}>{titleLine}</h4>
          <p className="text-xs leading-relaxed max-w-md mx-auto text-gray-400 font-light">{content.footer?.text || 'Suatu kebahagiaan serta kehormatan besar bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu mulia.'}</p>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: theme.accent }}>{theme.closing}</p>
        </div>
      </footer>
    </div>
  );
}

function VolumeOn({ color }: { color: string }) { return <svg className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>; }
function VolumeOff({ color }: { color: string }) { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>; }

export function UndanganMetatahBali(props: MonolithicTemplateProps) { return <UndanganCelebrationPremium {...props} mode="metatah" />; }
export function UndanganBirthdayGala(props: MonolithicTemplateProps) { return <UndanganCelebrationPremium {...props} mode="birthday" />; }

export default UndanganCelebrationPremium;
