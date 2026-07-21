'use client';

import { useState, useRef, useEffect } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent } from '@/lib/content/types';
import {
  Heart, Clock, MapPin, Mail, Copy, Check,
  ChevronLeft, ChevronRight, Volume2, VolumeX, Gift, MessageSquare, Info, Map,
} from 'lucide-react';
import { isVideo, useRsvpWishes, useCountdown, useGuestName, displayDateFrom, pickMedia } from './shared';

const DEFAULTS = {
  couple: {
    p1: { nick: 'Dimas', full: 'Dimas Anggara, S.Ars.', father: 'Bpk. Dr. H. Setiawan Anggara', mother: 'Ibu Hj. Ratna Ningsih, M.Pd.', ig: '@dimas_anggara', desc: 'Seorang arsitek yang percaya bahwa keindahan terbaik adalah merancang masa depan yang penuh cinta bersama orang yang tepat.' },
    p2: { nick: 'Sarah', full: 'Sarah Amalia, M.B.A.', father: 'Bpk. Ir. Ahmad Basuki', mother: 'Ibu Dra. Maria Shinta', ig: '@sarah_amalia', desc: 'Wirausaha muda di bidang kreatif yang meyakini bahwa setiap langkah hidup adalah kanvas kosong yang siap dilukis dengan harmoni.' },
  },
  date: '2026-10-10T10:00:00',
  quote: { text: 'True love stories never have endings. Together, we are creating a sanctuary built with trust, respect, and boundless laughter.', source: 'Sarah & Dimas' },
  events: [
    { title: 'Akad Nikah', time: '09:00 - 11:00 WIB', venue: 'Royal Glass Pavilion, Plataran', address: 'Hutan Kota by Plataran, Senayan, Jakarta Pusat', mapsUrl: 'https://maps.google.com', note: 'Khusus keluarga inti dan kerabat dekat dengan protokol privat.' },
    { title: 'Resepsi Pernikahan', time: '12:00 - 15:00 WIB', venue: 'Grand Terracotta Garden', address: 'Hutan Kota by Plataran, Senayan, Jakarta Pusat', mapsUrl: 'https://maps.google.com', note: 'Sangat disarankan mengenakan dresscode bernuansa Earth Tone / Terracotta.' },
  ],
  stories: [
    { year: '2020', title: 'The Coffee Encounter', desc: 'Pertemuan tidak sengaja di sebuah kedai kopi berarsitektur minimalis di Bandung. Secangkir kopi menyatukan pandangan pertama kami.' },
    { year: '2023', title: 'Two Cities, One Goal', desc: 'Menjalani hubungan jarak jauh membuat kami mengerti bahwa kepercayaan dan komunikasi yang tulus adalah fondasi paling kuat dalam cinta.' },
    { year: '2025', title: 'Under The Tuscan Sun', desc: 'Dalam perjalanan musim gugur, di bawah lengkungan arsitektur klasik Tuscany, Dimas memantapkan komitmennya untuk meminang Sarah.' },
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
    { bank: 'Bank Mandiri', number: '1180023491820', owner: 'Dimas Anggara' },
    { bank: 'Bank BCA', number: '0359871120', owner: 'Sarah Amalia' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  cover: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1600',
  hero: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1600',
  p1: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
  p2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
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
  const displayDate = displayDateFrom(isoDate, DEFAULTS.date);
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

function injectStyles() {
  if (typeof window === 'undefined') return;
  const id = 'wedding-theme-terracotta';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Italiana&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
  const style = document.createElement('style');
  style.innerHTML = `
    .font-serif-terracotta { font-family: 'Italiana', Georgia, serif; }
    .font-sans-terracotta { font-family: 'Plus Jakarta Sans', sans-serif; }
    @keyframes floating-gentle { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
    .animate-float-gentle { animation: floating-gentle 6s ease-in-out infinite; }
    @keyframes wave-organic { 0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 30% / 50% 60% 30% 70%; } }
    .animate-wave-organic { animation: wave-organic 8s ease-in-out infinite; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .arch-clip { border-radius: 120px 120px 24px 24px; }
    .arch-clip-reverse { border-radius: 24px 24px 120px 120px; }
  `;
  document.head.appendChild(style);
}

export function UndanganPernikahanTerracotta({ content, slug }: MonolithicTemplateProps) {
  const data = deriveData(content);
  const { p1, p2, isoDate, displayDate, events, stories, gallery, gifts, quote, audio, media } = data;

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const guestName = useGuestName('Tamu Undangan Istimewa');
  const countdown = useCountdown(isoDate);
  const [activeTab, setActiveTab] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { wishes, rsvpForm, setRsvpForm, isSubmitted, submit } = useRsvpWishes(slug);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { injectStyles(); }, []);

  const open = () => { setIsOpen(true); setIsPlaying(true); audioRef.current?.play().catch(() => {}); };
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };
  const copy = (text: string, index: number) => { navigator.clipboard?.writeText(text); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 2500); };

  const currentTab = activeTab || events[0]?.title || '';
  const activeEvent = events.find((e) => e.title === currentTab) || events[0];

  return (
    <div className="font-sans-terracotta bg-[#FBF7F4] text-[#4E3629] min-h-screen relative selection:bg-[#D27C5C] selection:text-white overflow-x-hidden">
      <audio ref={audioRef} src={audio} loop />

      {/* COVER  */}
      <div className={`fixed inset-0 z-50 flex flex-col md:flex-row transition-all duration-1000 ease-in-out ${isOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="w-full md:w-1/2 bg-[#D27C5C] flex flex-col justify-between p-6 md:p-16 text-[#FBF7F4] relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-80 h-[400px] border border-[#FBF7F4]/20 rounded-t-full pointer-events-none"></div>
          <div className="relative z-10"><span className="text-xs uppercase tracking-[0.3em] opacity-80 font-semibold">The Wedding Celebration</span></div>
          <div className="my-auto py-8 md:py-12 relative z-10">
            <h1 className="text-4xl md:text-7xl font-serif-terracotta tracking-wide leading-none">{p1.nick}<br /><span className="text-2xl md:text-5xl opacity-60 italic">&amp;</span> {p2.nick}</h1>
          </div>
          <div className="relative z-10 text-xs opacity-60">© {new Date().getFullYear()} {p1.nick} &amp; {p2.nick}</div>
        </div>
        <div className="w-full md:w-1/2 bg-[#FBF7F4] flex flex-col justify-center items-center p-6 md:p-16 relative">
          <div className="max-w-md w-full text-center space-y-4 md:space-y-6 md:space-y-5 md:space-y-8 z-10">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-bold">Kpd. Yth Bapak/Ibu/Saudara/i</span>
              <h2 className="text-xl md:text-2xl md:text-3xl font-serif-terracotta text-[#4E3629] border-b border-[#D27C5C]/20 pb-4 max-w-xs mx-auto italic">{guestName}</h2>
            </div>
            <p className="text-xs text-[#4E3629]/70 leading-relaxed max-w-sm mx-auto">Dengan penuh ketulusan, kami mengundang Anda untuk hadir menyaksikan ikatan janji suci dan merayakan momen kebahagiaan kami.</p>
            <button onClick={open} className="inline-flex items-center space-x-3 px-8 py-4 bg-[#D27C5C] hover:bg-[#b05f41] text-white font-medium text-xs uppercase tracking-[0.2em] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 cursor-pointer">
              <Mail className="w-4 h-4 text-white" /><span>Buka Undangan</span>
            </button>
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#F0D3C5]/40 animate-wave-organic pointer-events-none"></div>
        </div>
      </div>

      {isOpen && (
        <button onClick={toggleMusic} className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-[#D27C5C] text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-[#FBF7F4]">
          {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-white/80" />}
        </button>
      )}

      {/* HERO  */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-12 bg-[#FBF7F4]">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex justify-around items-end">
          <div className="w-72 h-[600px] border-[3px] border-[#D27C5C] rounded-t-full"></div>
          <div className="w-96 h-[800px] border-[3px] border-[#D27C5C] rounded-t-full hidden md:block"></div>
        </div>
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 md:gap-8 md:gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4 md:space-y-6 text-center lg:text-left">
            <span className="inline-block px-4 py-1 rounded-full bg-[#F0D3C5] text-[#D27C5C] text-xs font-semibold uppercase tracking-widest">Save Our Date</span>
            <h2 className="text-6xl md:text-8xl font-serif-terracotta text-[#4E3629] leading-none tracking-wide">{p1.nick}<br /><span className="text-3xl md:text-5xl text-[#D27C5C] font-light italic">&amp;</span> {p2.nick}</h2>
            <div className="w-16 h-[2px] bg-[#D27C5C] mx-auto lg:mx-0 my-6"></div>
            <p className="text-sm tracking-[0.3em] text-[#4E3629]/70 uppercase font-medium">{displayDate}</p>
          </div>
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-64 md:w-80 h-96 md:h-[450px] arch-clip overflow-hidden shadow-2xl border-8 border-white">
              {isVideo(media.hero) ? <video src={media.hero} autoPlay muted loop playsInline className="w-full h-full object-cover" /> : <img src={media.hero} alt="portrait" className="w-full h-full object-cover grayscale-[15%] contrast-[102%]" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#4E3629]/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[#D27C5C] text-[#FBF7F4] p-5 rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg border-2 border-white animate-float-gentle">
              <Heart className="w-5 h-5 fill-white" /><span className="text-[10px] font-bold uppercase tracking-widest mt-1">Union</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE  */}
      <section className="py-12 md:py-24 px-6 md:px-12 bg-[#FBF7F4] relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="text-4xl text-[#D27C5C] font-serif-terracotta mb-6">&ldquo;</div>
          <p className="text-xl md:text-2xl leading-relaxed text-[#4E3629] font-serif-terracotta italic font-light px-4 max-w-2xl mx-auto">{quote.text}</p>
          <span className="block h-[1px] w-12 bg-[#D27C5C]/40 mx-auto my-6"></span>
          {quote.source && <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D27C5C]">— {quote.source}</h4>}
        </div>
      </section>

      {/* COUNTDOWN  */}
      <section className="py-12 md:py-12 md:py-20 px-6 bg-[#FBF7F4]">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D27C5C] mb-2 font-bold">Countdown</h3>
          <h2 className="text-3xl md:text-3xl md:text-4xl font-serif-terracotta text-[#4E3629] mb-6 md:mb-8 md:mb-12">Menuju Hari Bahagia</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[{ l: 'Hari', v: countdown.days }, { l: 'Jam', v: countdown.hours }, { l: 'Menit', v: countdown.minutes }, { l: 'Detik', v: countdown.seconds, hl: true }].map((it) => (
              <div key={it.l} className="bg-white p-6 rounded-3xl shadow-sm border border-[#D27C5C]/10 flex flex-col items-center relative overflow-hidden">
                <div className={`absolute inset-x-0 bottom-0 h-1 ${it.hl ? 'bg-[#D27C5C]' : 'bg-[#F0D3C5]'}`}></div>
                <span className={`text-4xl md:text-5xl font-serif-terracotta font-semibold ${it.hl ? 'text-[#D27C5C]' : 'text-[#4E3629]'}`}>{String(it.v).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase tracking-widest text-[#4E3629]/50 mt-3 font-semibold">{it.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMPELAI  */}
      <section className="py-12 md:py-24 px-6 md:px-12 bg-[#FBF7F4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">The Couple</span>
            <h2 className="text-3xl md:text-4xl font-serif-terracotta text-[#4E3629] mt-2">Mempelai Pernikahan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:p-10 md:gap-16 md:gap-4 md:gap-6 md:gap-8 items-center">
            {[{ p: p1, img: media.p1, label: 'Putra', align: 'md:items-end md:text-right' }, { p: p2, img: media.p2, label: 'Putri', align: 'md:items-start md:text-left' }].map((m) => (
              <div key={m.label} className={`flex flex-col items-center text-center space-y-4 md:space-y-6 ${m.align}`}>
                <div className="relative w-64 h-80 arch-clip overflow-hidden shadow-xl border-4 border-white">
                  {isVideo(m.img) ? <video src={m.img} autoPlay muted loop playsInline className="w-full h-full object-cover" /> : <img src={m.img} alt={m.p.full} className="w-full h-full object-cover" />}
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-2xl md:text-3xl font-serif-terracotta text-[#4E3629]">{m.p.full}</h3>
                  {m.p.ig && <a href={`https://instagram.com/${m.p.ig}`} target="_blank" rel="noreferrer" className="inline-block text-xs text-[#D27C5C] tracking-widest uppercase font-medium">{m.p.ig}</a>}
                  {m.p.desc && <p className="text-xs text-[#4E3629]/70 leading-relaxed italic pt-2">{m.p.desc}</p>}
                  <div className="pt-4 text-xs text-[#4E3629]/80 font-medium border-t border-[#D27C5C]/10 inline-block w-full">
                    {m.label} tercinta dari:<br /><span className="text-[#4E3629] font-bold">{m.p.father}</span><br />&amp; {m.p.mother}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORIES  */}
      {stories.length > 0 && (
        <section className="py-12 md:py-24 px-6 md:px-12 bg-white relative">
          <div className="absolute inset-0 bg-[#FBF7F4]/30 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">Our Journey</span>
              <h2 className="text-3xl md:text-4xl font-serif-terracotta text-[#4E3629] mt-2">Kisah Kami</h2>
            </div>
            <div className="relative border-l border-[#D27C5C]/20 pl-6 ml-4 md:ml-24 space-y-12">
              {stories.map((s, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-[#D27C5C]"><span className="h-1.5 w-1.5 rounded-full bg-[#D27C5C]"></span></span>
                  <div className="absolute -left-28 top-1 text-right hidden md:block w-20"><span className="text-xl font-serif-terracotta text-[#D27C5C] tracking-wide block">{s.year}</span></div>
                  <div className="bg-[#FBF7F4] p-6 rounded-3xl border border-[#D27C5C]/5 shadow-sm space-y-2">
                    <span className="inline-block text-xs font-bold text-[#D27C5C] md:hidden">{s.year}</span>
                    <h4 className="text-lg font-serif-terracotta font-bold text-[#4E3629]">{s.title}</h4>
                    <p className="text-xs text-[#4E3629]/70 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EVENTS (tabs) */}
      {events.length > 0 && (
        <section className="py-12 md:py-24 px-6 md:px-12 bg-[#FBF7F4]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 md:mb-8 md:mb-12">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">Schedule</span>
              <h2 className="text-3xl md:text-4xl font-serif-terracotta text-[#4E3629] mt-2">Informasi Acara</h2>
            </div>
            <div className="flex justify-center flex-wrap space-x-4 mb-6 md:mb-8 gap-3">
              {events.map((evt) => (
                <button key={evt.title} onClick={() => setActiveTab(evt.title)} className={`px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${currentTab === evt.title ? 'bg-[#D27C5C] text-white shadow-md' : 'bg-white text-[#4E3629]/70 hover:bg-[#F0D3C5]/20 border border-[#D27C5C]/10'}`}>{evt.title}</button>
              ))}
            </div>
            {activeEvent && (
              <div className="bg-white p-5 md:p-12 rounded-3xl shadow-sm border border-[#D27C5C]/10 relative overflow-hidden min-h-[380px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D27C5C]/5 to-transparent pointer-events-none"></div>
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#D27C5C] tracking-widest uppercase block">Tanggal Pernikahan</span>
                    <h3 className="text-2xl md:text-2xl md:text-3xl font-serif-terracotta text-[#4E3629] font-semibold">{displayDate}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-[#D27C5C]/10">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-[#D27C5C] uppercase tracking-wider font-semibold"><Clock className="w-4 h-4" /><span>Waktu Pelaksanaan</span></div>
                      <p className="text-sm text-[#4E3629] font-medium">{activeEvent.time}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-[#D27C5C] uppercase tracking-wider font-semibold"><MapPin className="w-4 h-4" /><span>Lokasi / Venue</span></div>
                      <p className="text-sm text-[#4E3629] font-medium">{activeEvent.venue}</p>
                      <p className="text-xs text-[#4E3629]/60 leading-relaxed">{activeEvent.address}</p>
                    </div>
                  </div>
                  {activeEvent.note && (
                    <div className="bg-[#FBF7F4] p-4 rounded-2xl text-xs text-[#4E3629]/80 flex items-start space-x-2.5">
                      <Info className="w-4 h-4 mt-0.5 text-[#D27C5C] flex-shrink-0" /><span>{activeEvent.note}</span>
                    </div>
                  )}
                  <div className="pt-6 border-t border-[#D27C5C]/10">
                    <a href={activeEvent.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#4E3629] hover:bg-[#2e2018] text-[#FBF7F4] font-medium text-xs uppercase tracking-[0.15em] rounded-full shadow-sm transition-all duration-300">
                      <Map className="w-4 h-4" /><span>Petunjuk Rute Maps</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* GALLERY  */}
      {gallery.length > 0 && (
        <section className="py-12 md:py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">Moments</span>
              <h2 className="text-3xl md:text-4xl font-serif-terracotta text-[#4E3629] mt-2">Galeri Foto</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {gallery.map((src, idx) => (
                <div key={idx} onClick={() => setLightboxIndex(idx)} className={`group relative aspect-[3/4] overflow-hidden ${idx % 2 === 0 ? 'arch-clip' : 'arch-clip-reverse'} shadow-md cursor-pointer border-4 border-[#FBF7F4] hover:shadow-xl transition-all duration-500`}>
                  {isVideo(src) ? <video src={src} muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <img src={src} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-[#4E3629]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="p-3 bg-white/90 rounded-full text-[#D27C5C]"><Heart className="w-5 h-5 fill-[#D27C5C]" /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LIGHTBOX  */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-white/80 hover:text-white text-4xl font-light cursor-pointer">&times;</button>
          <button onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)} className="absolute left-4 p-2 text-white/70 hover:text-white"><ChevronLeft className="w-10 h-10" /></button>
          {isVideo(gallery[lightboxIndex]) ? <video src={gallery[lightboxIndex]} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" /> : <img src={gallery[lightboxIndex]} alt="Zoomed" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />}
          <button onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)} className="absolute right-4 p-2 text-white/70 hover:text-white"><ChevronRight className="w-10 h-10" /></button>
        </div>
      )}

      {/* RSVP & WISHES */}
      <section className="py-12 md:py-24 px-6 md:px-12 bg-[#FBF7F4]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 md:gap-8 md:gap-12 lg:gap-6 md:p-10 md:gap-16">
            <div className="lg:col-span-5 space-y-5 md:space-y-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">Buku Tamu</span>
                <h2 className="text-3xl md:text-4xl font-serif-terracotta text-[#4E3629]">{content.rsvp?.title || 'Konfirmasi Kehadiran'}</h2>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <input type="text" required placeholder="Masukkan nama lengkap Anda" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })} className="w-full px-5 py-3.5 bg-white rounded-2xl border border-[#D27C5C]/15 text-xs focus:outline-none focus:border-[#D27C5C] focus:ring-1 focus:ring-[#D27C5C] transition-all" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })} className="w-full px-5 py-3.5 bg-white rounded-2xl border border-[#D27C5C]/15 text-xs focus:outline-none focus:border-[#D27C5C] transition-all cursor-pointer">
                    <option value="Hadir">Hadir</option><option value="Tidak Hadir">Tidak Hadir</option>
                  </select>
                  <select value={rsvpForm.guests} disabled={rsvpForm.attendance === 'Tidak Hadir'} onChange={(e) => setRsvpForm({ ...rsvpForm, guests: e.target.value })} className="w-full px-5 py-3.5 bg-white rounded-2xl border border-[#D27C5C]/15 text-xs focus:outline-none focus:border-[#D27C5C] transition-all disabled:opacity-40 cursor-pointer">
                    <option value="1">1 Orang</option><option value="2">2 Orang</option><option value="3">3 Orang</option>
                  </select>
                </div>
                <textarea rows={4} required placeholder="Tuliskan ucapan selamat..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })} className="w-full px-5 py-3.5 bg-white rounded-2xl border border-[#D27C5C]/15 text-xs focus:outline-none focus:border-[#D27C5C] focus:ring-1 focus:ring-[#D27C5C] transition-all resize-none" />
                <button type="submit" disabled={isSubmitted} className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 bg-[#D27C5C] hover:bg-[#b05f41] text-white font-medium text-xs uppercase tracking-[0.2em] rounded-2xl shadow-md transition-all duration-300 transform active:scale-95 disabled:opacity-75 cursor-pointer">
                  {isSubmitted ? <><Check className="w-4 h-4" /><span>Berhasil Dikirim!</span></> : <><MessageSquare className="w-4 h-4" /><span>Kirim Ucapan</span></>}
                </button>
              </form>
            </div>
            <div className="lg:col-span-7 flex flex-col h-[520px]">
              <div className="flex items-center justify-between border-b border-[#D27C5C]/10 pb-4 mb-4">
                <span className="text-xs font-bold text-[#4E3629] tracking-wider uppercase">Pesan Tamu ({wishes.length})</span>
                <span className="px-3 py-1 bg-[#D27C5C]/10 text-[#D27C5C] text-[9px] font-bold tracking-widest rounded-full uppercase">Update Realtime</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
                {wishes.map((w) => (
                  <div key={w.id} className="bg-white p-5 rounded-3xl border border-[#D27C5C]/5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif-terracotta font-bold text-base text-[#4E3629]">{w.name}</span>
                      {w.time && <span className="text-[9px] text-[#4E3629]/40 font-semibold">{w.time}</span>}
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider ${w.attendance === 'Hadir' ? 'bg-[#D27C5C]/10 text-[#D27C5C]' : 'bg-red-50 text-red-500'}`}>{w.attendance}</span>
                      {w.attendance === 'Hadir' && <span className="text-[9px] text-[#4E3629]/50 font-medium">({w.guests} Pax)</span>}
                    </div>
                    {w.message && <p className="text-xs text-[#4E3629]/75 leading-relaxed font-light">{w.message}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GIFT  */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <section className="py-12 md:py-24 px-6 md:px-12 bg-white relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 md:mb-8 md:mb-12">
              <span className="inline-block p-4 bg-[#F0D3C5] rounded-full mb-4 text-[#D27C5C]"><Gift className="w-6 h-6" /></span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold block mb-1">E-Gift</span>
              <h2 className="text-3xl md:text-4xl font-serif-terracotta text-[#4E3629]">Tanda Kasih Digital</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 md:gap-8 max-w-2xl mx-auto">
              {gifts.map((g, idx) => (
                <div key={idx} className="bg-[#FBF7F4] p-8 rounded-3xl border border-[#D27C5C]/10 shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#D27C5C]/10 to-transparent rounded-tr-3xl"></div>
                  <div className="text-center w-full relative z-10">
                    {g.bank && <span className="text-[10px] font-bold text-[#D27C5C] tracking-widest uppercase block mb-1">{g.bank}</span>}
                    <div className="w-6 h-[1.5px] bg-[#D27C5C]/30 mx-auto mb-4"></div>
                    {g.number && <p className="text-xl font-mono font-bold text-[#4E3629] tracking-wider my-3">{g.number}</p>}
                    {g.owner && <p className="text-[10px] text-[#4E3629]/60 uppercase tracking-widest font-semibold">Atas Nama: {g.owner}</p>}
                  </div>
                  <button onClick={() => copy(g.number, idx)} className="mt-6 w-full inline-flex items-center justify-center space-x-2 py-3 px-5 bg-white hover:bg-[#D27C5C] text-[#D27C5C] hover:text-white border border-[#D27C5C]/25 text-xs font-semibold rounded-2xl transition-all duration-300 cursor-pointer">
                    {copiedIndex === idx ? <><Check className="w-4 h-4 text-green-600" /><span className="text-green-600">No. Rekening Disalin</span></> : <><Copy className="w-4 h-4" /><span>Salin Rekening</span></>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER  */}
      <footer className="py-12 md:py-24 px-6 bg-[#4E3629] text-[#FBF7F4] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-5 md:space-y-8">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">Terima Kasih</span>
          <h2 className="text-4xl md:text-5xl font-serif-terracotta font-light italic text-white leading-snug">{content.footer?.text || 'Suatu kehormatan & kebahagiaan mendalam bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.'}</h2>
          <div className="w-16 h-[1px] bg-[#D27C5C]/50 mx-auto my-6"></div>
          <div className="space-y-2">
            <p className="text-[9px] text-[#FBF7F4]/50 uppercase tracking-[0.25em]">Kami Yang Berbahagia</p>
            <h4 className="text-2xl md:text-3xl font-serif-terracotta text-[#D27C5C] italic">{p1.nick} &amp; {p2.nick}</h4>
          </div>
        </div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#D27C5C]/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#F0D3C5]/5 blur-[100px] pointer-events-none"></div>
      </footer>
    </div>
  );
}

export default UndanganPernikahanTerracotta;
