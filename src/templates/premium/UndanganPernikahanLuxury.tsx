'use client';

import { useState, useRef, useEffect } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent } from '@/lib/content/types';
import {
  Heart, Calendar, Clock, MapPin, Send, Gift, Copy, Check, ChevronDown,
  Camera, Users, MessageSquare, Map,
} from 'lucide-react';
import { isVideo, useRsvpWishes, useCountdown, useGuestName, displayDateFrom, pickMedia } from './shared';

const GOLD = '#D4AF37';
const DEFAULTS = {
  couple: {
    p1: { nick: 'Kaelan', full: 'Kaelan Rayhan Wardana, S.T.', father: 'Bapak Ir. Hermawan Wardana', mother: 'Ibu Dra. Retno Astuti', ig: '@kaelan', origin: 'Dago, Bandung' },
    p2: { nick: 'Amanda', full: 'Amanda Citra Kirana, M.Ds.', father: 'Bapak Dr. Achmad Hidayat', mother: 'Ibu Sitti Maryam, M.Pd.', ig: '@amanda', origin: 'Sukajadi, Bandung' },
  },
  date: '2027-04-18T09:00:00',
  quote: { text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.', source: 'QS. Ar-Rum: 21' },
  events: [
    { title: 'Pemberkatan / Akad', time: '09:00 - 11:00 WIB', venue: 'Masjid Raya Al-Jabbar', address: 'Jl. Cimincrang No.14, Gedebage, Bandung', mapsUrl: 'https://maps.google.com' },
    { title: 'Resepsi Mulia', time: '12:30 - 16:30 WIB', venue: 'Grand Ballroom Pullman', address: 'Jl. Diponegoro No.27, Cibeunying Kaler, Bandung', mapsUrl: 'https://maps.google.com' },
  ],
  stories: [
    { year: '2022', title: 'Awal Pertemuan', desc: 'Dipertemukan secara tak sengaja dalam sebuah proyek pameran seni rupa kontemporer. Diskusi tentang warna berubah menjadi kecocokan hati yang mendalam.' },
    { year: '2024', title: 'Saling Mengikat Janji', desc: 'Di tengah sejuknya pegunungan Ciwidey, kami berkomitmen menapaki jalan kehidupan beriringan.' },
    { year: '2026', title: 'Momen Lamaran Resmi', desc: 'Dengan restu kedua belah keluarga, kami mengesahkan keputusan hati untuk melangkah ke jenjang pernikahan.' },
  ],
  gallery: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800',
  ],
  gifts: [
    { bank: 'Bank Central Asia (BCA)', number: '7810592811', owner: 'Kaelan Rayhan Wardana' },
    { bank: 'Bank Mandiri', number: '1320098711102', owner: 'Amanda Citra Kirana' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600',
  hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600',
  p1: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
  p2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
};

function deriveData(content: InvitationContent) {
  const c = content.couple;
  const p1 = { nick: c.partner1 || DEFAULTS.couple.p1.nick, full: c.partner1Title || c.partner1 || DEFAULTS.couple.p1.full, father: c.partner1Father || DEFAULTS.couple.p1.father, mother: c.partner1Mother || DEFAULTS.couple.p1.mother, ig: c.partner1Instagram || DEFAULTS.couple.p1.ig, origin: c.partner1Desc || DEFAULTS.couple.p1.origin };
  const p2 = { nick: c.partner2 || DEFAULTS.couple.p2.nick, full: c.partner2Title || c.partner2 || DEFAULTS.couple.p2.full, father: c.partner2Father || DEFAULTS.couple.p2.father, mother: c.partner2Mother || DEFAULTS.couple.p2.mother, ig: c.partner2Instagram || DEFAULTS.couple.p2.ig, origin: c.partner2Desc || DEFAULTS.couple.p2.origin };
  const isoDate = content.event?.date || DEFAULTS.date;
  const displayDate = displayDateFrom(isoDate, 'Minggu, 18 April 2027');
  const events = (content.schedule?.items?.length
    ? content.schedule.items.map((it) => ({ title: it.title || '', time: it.time || '', venue: it.venue || '', address: it.address || '', mapsUrl: it.mapsUrl || 'https://maps.google.com' }))
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

function injectStyles() {
  if (typeof window === 'undefined') return;
  const id = 'wedding-premium-luxury';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Montserrat:wght@200;300;400;500;600&family=Sacramento&display=swap';
  document.head.appendChild(link);
  const style = document.createElement('style');
  style.innerHTML = `
    .font-luxury-serif { font-family: 'Cormorant Garamond', serif; }
    .font-header-deco { font-family: 'Cinzel Decorative', serif; }
    .font-sans-clean { font-family: 'Montserrat', sans-serif; }
    .font-cursive-love { font-family: 'Sacramento', cursive; }
    @keyframes luxFadeUp { from { opacity:0; transform: translateY(40px); } to { opacity:1; transform: translateY(0); } }
    .animate-fade-up { animation: luxFadeUp 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
    @keyframes luxPulse { 0%,100% { transform: scale(0.95); opacity:0.8; } 50% { transform: scale(1.08); opacity:0.4; } }
    .animate-pulse-ring { animation: luxPulse 3s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}

function Ornament({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <path d="M50 0 C45 25, 25 45, 0 50 C25 55, 45 75, 50 100 C55 75, 75 55, 100 50 C75 45, 55 25, 50 0 Z" fill={GOLD} />
      <circle cx="50" cy="50" r="10" stroke="#FFF" strokeWidth="2" fill="none" />
      <circle cx="50" cy="50" r="4" fill="#FFF" />
    </svg>
  );
}
function Divider() {
  return (
    <div className="flex items-center justify-center space-x-4 my-8">
      <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
      <Ornament className="w-5 h-5 animate-pulse-ring" />
      <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
    </div>
  );
}

export function UndanganPernikahanLuxury({ content, slug }: MonolithicTemplateProps) {
  const data = deriveData(content);
  const { p1, p2, isoDate, displayDate, events, stories, gallery, gifts, quote, audio, media } = data;

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

  return (
    <div className="font-sans-clean bg-[#FDFBF7] text-[#1D2A1F] min-h-screen relative selection:bg-[#D4AF37]/20 overflow-x-hidden">
      <audio ref={audioRef} src={audio} loop />

      {/* COVER  */}
      {!isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-[#111e14] text-[#E5D5B8] p-6 text-center overflow-hidden">
          <div className="absolute inset-4 md:inset-8 border border-[#c5a85a]/40 pointer-events-none rounded-lg z-10"></div>
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
            <div className="w-[120vw] h-[120vw] border-[40px] border-[#D4AF37] rounded-full animate-pulse-ring"></div>
          </div>
          <div className="mt-12 space-y-3 z-20">
            <span className="text-[10px] md:text-xs tracking-[0.4em] text-[#D4AF37] uppercase font-bold">The Wedding Invitation</span>
            <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto"></div>
          </div>
          <div className="my-auto max-w-2xl z-20 space-y-5 md:space-y-8 px-4">
            <span className="text-[11px] uppercase tracking-[0.35em] text-[#A6C3AF] font-medium block">Pernikahan Agung &amp; Mulia</span>
            <h1 className="text-5xl md:text-7xl font-luxury-serif font-light tracking-wide text-white leading-snug">{p1.nick} <span className="font-cursive-love text-4xl md:text-6xl text-[#D4AF37] block md:inline md:mx-4 my-2">&amp;</span> {p2.nick}</h1>
            <div className="pt-6 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-[#A6C3AF] block font-medium">Spesial Untuk Yth. Bapak/Ibu/Saudara/i:</span>
              <div className="bg-white/5 backdrop-blur-md border border-[#c5a85a]/40 rounded-2xl p-6 px-10 inline-block shadow-2xl">
                <span className="font-luxury-serif text-2xl md:text-3xl font-light text-white block tracking-wide">{guestName}</span>
                <span className="text-[9px] text-[#D4AF37] uppercase tracking-widest mt-2 block font-semibold">Tamu Kehormatan Kami</span>
              </div>
            </div>
            <button onClick={open} className="px-10 py-4 bg-[#D4AF37] hover:bg-white text-[#111e14] font-semibold rounded-full shadow-2xl transition-all duration-300 transform hover:-translate-y-1 tracking-[0.2em] text-xs uppercase flex items-center gap-3 mx-auto">
              <Heart className="w-4 h-4 fill-current" /> Buka Undangan
            </button>
          </div>
          <div className="mb-10 z-20"><p className="text-[10px] text-[#A6C3AF] tracking-[0.3em] uppercase">#{p1.nick}{p2.nick}Story</p></div>
        </div>
      )}

      {isOpen && (
        <button onClick={toggleMusic} className="fixed bottom-6 right-6 z-50 p-4 bg-white/95 backdrop-blur-md text-[#111e14] border border-[#D4AF37]/40 rounded-full shadow-2xl hover:bg-[#111e14] hover:text-white transition-all duration-300 transform hover:scale-110 flex items-center justify-center">
          {isPlaying ? <Volume2Safe /> : <VolumeXSafe />}
        </button>
      )}

      {/* HERO  */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#142217] to-[#1D2A1F] text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {isVideo(media.hero) ? <video src={media.hero} muted loop playsInline className="w-full h-full object-cover" /> : <img src={media.hero} alt="hero" className="w-full h-full object-cover" />}
        </div>
        {[
          'top-8 left-8 border-t border-l rounded-tl-lg',
          'top-8 right-8 border-t border-r rounded-tr-lg',
          'bottom-8 left-8 border-b border-l rounded-bl-lg',
          'bottom-8 right-8 border-b border-r rounded-br-lg',
        ].map((c) => <div key={c} className={`absolute w-12 h-12 ${c} border-[#D4AF37]/60 pointer-events-none`} />)}
        <div className="max-w-6xl w-full mx-auto px-6 py-12 md:py-24 text-center relative z-10 flex flex-col justify-between min-h-[85vh]">
          <div className="space-y-3 animate-fade-up">
            <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-semibold block">The Wedding Celebration</span>
            <Divider />
          </div>
          <div className="my-auto space-y-4 md:space-y-6">
            <span className="text-xs md:text-sm tracking-[0.3em] uppercase text-[#A6C3AF] font-medium block">MEMINTA RESTU DAN BERKAH</span>
            <h1 className="text-6xl md:text-8xl font-luxury-serif font-light text-white tracking-wider leading-tight">{p1.nick} <span className="font-cursive-love text-5xl md:text-7xl text-[#D4AF37] block md:inline md:mx-4 my-2">dan</span> {p2.nick}</h1>
            <p className="text-xs md:text-sm tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">{displayDate}</p>
          </div>
          <div className="space-y-4 animate-bounce">
            <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Gulir Ke Bawah</p>
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#D4AF37] to-transparent mx-auto"></div>
          </div>
        </div>
      </section>

      {/* QUOTE  */}
      <section className="py-12 md:py-28 bg-[#faf7f0] border-y border-[#D4AF37]/20 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-48 h-48 opacity-[0.07] pointer-events-none"><Ornament className="w-full h-full" /></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 opacity-[0.07] pointer-events-none"><Ornament className="w-full h-full" /></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          {quote.source && <h3 className="font-luxury-serif text-[#111e14] text-xs uppercase tracking-[0.3em] mb-6 md:mb-8 font-semibold">{quote.source}</h3>}
          <p className="font-luxury-serif text-2xl md:text-3xl italic leading-relaxed text-[#1D2A1F] font-light px-4">{quote.text}</p>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto my-8"></div>
        </div>
      </section>

      {/* COUNTDOWN  */}
      <section className="py-12 md:py-12 md:py-28 bg-gradient-to-b from-[#142217] to-[#121c15] text-white relative">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-semibold block mb-2">The Golden Moments</span>
          <h2 className="font-luxury-serif text-3xl md:text-5xl text-white tracking-wide font-light mb-4">Waktu yang Dinanti</h2>
          <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto mb-14"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[{ v: countdown.days, l: 'Hari Bahagia' }, { v: countdown.hours, l: 'Jam Mulia' }, { v: countdown.minutes, l: 'Menit Menuju' }, { v: countdown.seconds, l: 'Detik Berlalu' }].map((it, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col items-center transform hover:-translate-y-2 transition-all duration-500 shadow-2xl">
                <span className="text-5xl md:text-6xl font-luxury-serif font-light text-[#D4AF37] leading-none mb-3">{String(it.v).padStart(2, '0')}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#A6C3AF] font-medium">{it.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMPELAI  */}
      <section className="py-12 md:py-28 bg-[#FDFBF7] relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-24">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Tunas Cinta</span>
            <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">Kedua Mempelai</h2>
            <Divider />
          </div>
          <div className="grid md:grid-cols-2 gap-20 lg:gap-24 items-center">
            {[{ p: p1, img: media.p1, badge: 'right-4', label: 'Mempelai Pria' }, { p: p2, img: media.p2, badge: 'left-4', label: 'Mempelai Wanita' }].map((m) => (
              <div key={m.label} className="text-center space-y-4 md:space-y-6 flex flex-col items-center">
                <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full p-2 border border-[#D4AF37] shadow-xl overflow-hidden">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    {isVideo(m.img) ? <video src={m.img} muted loop playsInline className="w-full h-full object-cover" /> : <img src={m.img} alt={m.p.full} className="w-full h-full object-cover" />}
                  </div>
                  <div className={`absolute top-4 ${m.badge} bg-[#111e14] p-2.5 rounded-full border border-[#D4AF37]`}><Ornament className="w-4 h-4" /></div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-luxury-serif text-3xl font-light text-[#111e14]">{m.p.full}</h3>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] font-bold block">{m.label}</span>
                </div>
                <div className="text-xs leading-relaxed text-gray-600 max-w-sm">
                  <p className="font-semibold text-gray-800">{m.label === 'Mempelai Pria' ? 'Putra' : 'Putri'} dari Keluarga:</p>
                  <p className="font-luxury-serif text-base italic text-[#1D2A1F] mt-1">{m.p.father}<br />&amp; {m.p.mother}</p>
                  {m.p.origin && <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-2">{m.p.origin}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY  */}
      {stories.length > 0 && (
        <section className="py-12 md:py-28 bg-[#faf7f0] relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-20">
              <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Kisah Kasih</span>
              <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">Cerita Cinta Kami</h2>
              <Divider />
            </div>
            <div className="relative border-l border-[#D4AF37]/40 ml-4 md:ml-36 space-y-16">
              {stories.map((s, i) => (
                <div key={i} className="relative pl-8 md:pl-16">
                  <span className="absolute -left-[13px] top-2 flex items-center justify-center w-6 h-6 rounded-full bg-[#111e14] border-2 border-[#D4AF37] text-white ring-8 ring-[#faf7f0]"><Heart className="w-2.5 h-2.5 fill-current" /></span>
                  <span className="hidden md:block absolute -left-36 top-1 text-right w-24 font-luxury-serif text-2xl text-[#111e14] font-medium tracking-wide">{s.year}</span>
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#D4AF37]/20 hover:shadow-xl transition-all duration-500">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="md:hidden text-[10px] font-bold text-[#111e14] bg-[#D4AF37]/20 px-3 py-1 rounded-full uppercase tracking-wider">{s.year}</span>
                      <h4 className="font-luxury-serif text-xl font-medium text-[#111e14]">{s.title}</h4>
                    </div>
                    <p className="text-xs md:text-sm leading-relaxed text-gray-600 font-light">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY  */}
      {gallery.length > 0 && (
        <section className="py-12 md:py-28 bg-white relative">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-20">
              <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Keabadian Lensa</span>
              <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">Galeri Prewedding</h2>
              <Divider />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {gallery.map((src, idx) => (
                <div key={idx} onClick={() => setLightboxIndex(idx)} className="relative overflow-hidden aspect-[3/4] rounded-2xl cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100">
                  {isVideo(src) ? <video src={src} muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <img src={src} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111e14]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="flex items-center gap-2 text-[#D4AF37]"><Camera className="w-4 h-4" /><span className="uppercase tracking-widest text-[9px] font-bold">Zoom Photo</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {lightboxIndex !== null && (
            <div className="fixed inset-0 z-50 bg-[#111e14]/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
              <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                {isVideo(gallery[lightboxIndex]) ? <video src={gallery[lightboxIndex]} controls autoPlay className="w-full max-h-[80vh] rounded-2xl" /> : <img src={gallery[lightboxIndex]} alt="Zoomed" className="w-full max-h-[80vh] object-contain rounded-2xl" />}
                <button onClick={() => setLightboxIndex(null)} className="mt-6 px-6 py-2 mx-auto block border border-white/20 text-white/80 rounded-full text-xs uppercase tracking-widest">Tutup Galeri</button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* EVENTS (tabs) */}
      {events.length > 0 && (
        <section className="py-12 md:py-28 bg-[#faf7f0] relative">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-6 md:mb-8 md:mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Momen Istimewa</span>
              <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">Agenda Acara</h2>
              <Divider />
            </div>
            <div className="flex justify-center flex-wrap space-x-4 mb-6 md:mb-8 md:mb-12 max-w-md mx-auto gap-3">
              {events.map((evt, i) => (
                <button key={i} onClick={() => setActiveTab(i)} className={`flex-1 min-w-[140px] py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 border ${currentIdx === i ? 'bg-[#111e14] text-white border-[#111e14] shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AF37]'}`}>{evt.title}</button>
              ))}
            </div>
            {activeEvent && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-10 shadow-md border border-[#D4AF37]/20 text-center space-y-5 md:space-y-8 animate-fade-up">
                <div className="space-y-3">
                  <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">{currentIdx === 0 ? <Calendar className="w-6 h-6" /> : <Users className="w-6 h-6" />}</div>
                  <h3 className="font-luxury-serif text-3xl font-light text-[#111e14]">{activeEvent.title}</h3>
                  <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-xs text-gray-600 border-y border-gray-100 py-6">
                  <div className="space-y-2 flex flex-col items-center"><Calendar className="w-5 h-5 text-[#D4AF37]" /><span className="font-semibold text-gray-800">Tanggal</span><span className="text-sm">{displayDate}</span></div>
                  <div className="space-y-2 flex flex-col items-center"><Clock className="w-5 h-5 text-[#D4AF37]" /><span className="font-semibold text-gray-800">Pukul</span><span className="text-sm">{activeEvent.time}</span></div>
                </div>
                {(activeEvent.venue || activeEvent.address) && (
                  <div className="space-y-2">
                    <MapPin className="w-5 h-5 text-[#D4AF37] mx-auto" />
                    {activeEvent.venue && <span className="font-semibold text-xs text-gray-800 block">{activeEvent.venue}</span>}
                    {activeEvent.address && <p className="text-xs leading-relaxed max-w-sm mx-auto text-gray-600">{activeEvent.address}</p>}
                  </div>
                )}
                <a href={activeEvent.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-[#111e14] hover:bg-[#D4AF37] hover:text-[#111e14] text-white font-semibold rounded-full shadow-lg transition-all duration-300 tracking-wider text-xs uppercase"><Map className="w-4 h-4" /> Buka Google Maps</a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RSVP  */}
      <section className="py-12 md:py-28 bg-[#faf7f0] relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Konfirmasi Presensi</span>
            <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">{content.rsvp?.title || 'RSVP & Kirim Ucapan'}</h2>
            <Divider />
          </div>
          <div className="grid lg:grid-cols-12 gap-6 md:p-10 items-start">
            <form onSubmit={submit} className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-md border border-[#D4AF37]/25 space-y-4 md:space-y-6">
              <input type="text" required value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })} placeholder="Nama Lengkap" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] bg-[#faf8f4]" />
              <div className="grid grid-cols-2 gap-4">
                {['Hadir', 'Tidak Hadir'].map((opt) => (
                  <button key={opt} type="button" onClick={() => setRsvpForm({ ...rsvpForm, attendance: opt })} className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${rsvpForm.attendance === opt ? 'bg-[#111e14] text-white border-[#111e14]' : 'bg-white text-gray-600 border-gray-200 hover:bg-[#faf8f4]'}`}>{opt}</button>
                ))}
              </div>
              {rsvpForm.attendance === 'Hadir' && (
                <div className="relative">
                  <select value={rsvpForm.guests} onChange={(e) => setRsvpForm({ ...rsvpForm, guests: e.target.value })} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none bg-[#faf8f4] appearance-none">
                    <option value="1">1 Orang</option><option value="2">2 Orang</option><option value="3">3 Orang</option><option value="4">4 Orang</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              )}
              <textarea required rows={4} value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })} placeholder="Pesan & doa restu..." className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-[#faf8f4]" />
              <button type="submit" disabled={isSubmitted} className="w-full py-4 bg-[#D4AF37] hover:bg-[#111e14] text-white font-semibold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"><Send className="w-4 h-4" /> {isSubmitted ? 'Terkirim!' : 'Kirim Konfirmasi'}</button>
            </form>
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-md border border-[#D4AF37]/25 flex flex-col h-[520px]">
              <h4 className="font-luxury-serif text-lg font-bold text-[#111e14] mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#D4AF37]" /> <span>Doa &amp; Harapan ({wishes.length})</span></h4>
              <div className="overflow-y-auto space-y-4 pr-2 flex-1">
                {wishes.map((w) => (
                  <div key={w.id} className="bg-[#faf8f4] p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-luxury-serif text-sm font-semibold text-[#111e14]">{w.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${w.attendance === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{w.attendance}</span>
                        {w.time && <span className="text-[9px] text-gray-400">{w.time}</span>}
                      </div>
                    </div>
                    {w.message && <p className="text-xs text-gray-600 leading-relaxed font-light">{w.message}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GIFT  */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <section className="py-12 md:py-28 bg-white relative">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="mb-6 md:mb-8 md:mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Tanda Kasih</span>
              <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">{content.gift?.title || 'Kado Pernikahan'}</h2>
              <Divider />
            </div>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 md:gap-8 max-w-2xl mx-auto">
              {gifts.map((g, idx) => (
                <div key={idx} className="bg-[#faf7f0] border border-[#D4AF37]/30 rounded-3xl p-8 text-left space-y-4 shadow-sm hover:shadow-lg transition-all duration-300">
                  {g.bank && <p className="font-luxury-serif text-2xl font-semibold text-[#111e14]">{g.bank}</p>}
                  {g.number && (
                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                      <span className="font-mono text-sm tracking-wider text-[#111e14] font-semibold">{g.number}</span>
                      <button onClick={() => copy(g.number, idx)} className="text-xs flex items-center gap-1.5 text-[#D4AF37] hover:text-[#111e14] font-bold uppercase tracking-wider">{copiedIndex === idx ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}{copiedIndex === idx ? 'Selesai' : 'Salin'}</button>
                    </div>
                  )}
                  {g.owner && <div className="text-xs text-gray-400"><span className="block font-medium text-gray-600">Atas Nama:</span><span>{g.owner}</span></div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER  */}
      <footer className="py-12 md:py-20 bg-[#111e14] text-white relative text-center">
        <div className="absolute bottom-6 left-6 w-16 h-16 opacity-10"><Ornament className="w-full h-full" /></div>
        <div className="absolute bottom-6 right-6 w-16 h-16 opacity-10"><Ornament className="w-full h-full" /></div>
        <div className="max-w-3xl mx-auto px-6 space-y-5 md:space-y-8 relative z-10">
          <h4 className="font-luxury-serif text-3xl font-light text-[#D4AF37] tracking-widest leading-none">{p1.nick} &amp; {p2.nick}</h4>
          <p className="text-xs leading-relaxed max-w-md mx-auto text-[#A6C3AF] font-light">{content.footer?.text || 'Merupakan kehormatan serta kebahagiaan yang tak terhingga bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan doa restu yang tulus.'}</p>
          <div className="w-20 h-[1px] bg-[#D4AF37]/30 mx-auto"></div>
        </div>
      </footer>
    </div>
  );
}

function Volume2Safe() { return <svg className="w-5 h-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>; }
function VolumeXSafe() { return <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>; }

export default UndanganPernikahanLuxury;
