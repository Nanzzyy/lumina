'use client';

import { useState, useRef, useEffect } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent } from '@/lib/content/types';
import {
  Heart, Calendar, Clock, MapPin, Send, Gift, Copy, Check,
  Volume2, VolumeX, MessageSquare, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { isVideo, useCountdown, useGuestName, displayDateFrom, pickMedia, useRsvpWishes } from './shared';

/* ─── Colors ─── */
const GOLD = '#8a7a4a';
const GOLD_LIGHT = '#c4b47a';
const IVORY = '#faf6f0';
const IVORY_DARK = '#f2ece0';
const CHARCOAL = '#2a2826';
const WARM = '#5a5048';
const MUTED = '#9a9288';

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
    { year: '2022', title: 'Di Antara Bunga & Pameran', desc: 'Berawal dari pameran seni budaya di Ubud. Raka tanpa sengaja mengabadikan Dewi yang sedang menikmati lukisan.' },
    { year: '2024', title: 'Menyatukan Langkah', desc: 'Dua tahun saling mengenal, bertumbuh, dan berbagi mimpi. Sepakat melangkah bersama.' },
    { year: '2026', title: 'Di Bawah Teduh Bunga Anggrek', desc: 'Raka meminang Dewi di sebuah taman anggrek yang bermekaran. Dengan restu kedua keluarga.' },
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

/* ─── injectStyles ─── */
function injectStyles() {
  if (typeof window === 'undefined' || document.getElementById('hana-inv')) return;
  const s = document.createElement('style');
  s.id = 'hana-inv';
  s.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Zen+Old+Mincho:wght@400;500;600;700&display=swap');
:root {
  --hana-gold: ${GOLD};
  --hana-gold-light: ${GOLD_LIGHT};
  --hana-ivory: ${IVORY};
  --hana-ivory-dark: ${IVORY_DARK};
  --hana-charcoal: ${CHARCOAL};
  --hana-warm: ${WARM};
  --hana-muted: ${MUTED};
}
.font-title { font-family: 'Playfair Display', Georgia, serif; }
.font-body { font-family: 'Outfit', system-ui, sans-serif; }
.font-jp { font-family: 'Zen Old Mincho', serif; }
@keyframes hana-fade-up { 0% { opacity:0; transform:translateY(30px) } 100% { opacity:1; transform:translateY(0) } }
@keyframes hana-fade-in { 0% { opacity:0 } 100% { opacity:1 } }
@keyframes hana-scale-in { 0% { opacity:0; transform:scale(0.95) } 100% { opacity:1; transform:scale(1) } }
@keyframes hana-glow { 0%,100% { box-shadow:0 0 0 0 rgba(138,122,74,0.15) } 50% { box-shadow:0 0 0 12px rgba(138,122,74,0) } }
@keyframes hana-shimmer { 0% { background-position:-200% center } 100% { background-position:200% center } }
.anim-fade-up { animation: hana-fade-up 0.9s cubic-bezier(0.16,1,0.3,1) both; }
.anim-fade-in { animation: hana-fade-in 1s ease both; }
.anim-scale-in { animation: hana-scale-in 0.7s cubic-bezier(0.16,1,0.3,1) both; }
.anim-glow { animation: hana-glow 2s ease-in-out infinite; }
.anim-shimmer { background-size:200% 100%; animation: hana-shimmer 3s ease-in-out infinite; }
.scroll-r { opacity:0; transform:translateY(30px); transition:all 0.8s cubic-bezier(0.16,1,0.3,1); }
.scroll-r.revealed { opacity:1; transform:translateY(0); }
`;
  document.head.appendChild(s);
}

function HanaDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 my-5 ${className}`}>
      <span className="h-[1px] w-8" style={{ backgroundColor: `${GOLD}40` }} />
      <svg viewBox="0 0 24 24" className="w-3 h-3" fill={GOLD} opacity="0.5">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="7" r="2" />
        <circle cx="17" cy="12" r="2" />
        <circle cx="12" cy="17" r="2" />
        <circle cx="7" cy="12" r="2" />
      </svg>
      <span className="h-[1px] w-8" style={{ backgroundColor: `${GOLD}40` }} />
    </div>
  );
}

function ScrollR({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) e.target.classList.add('revealed'); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`scroll-r ${className}`}>{children}</div>;
}

/* ─── Main Component ─── */
export function UndanganPernikahanHana({ content, slug, preview }: MonolithicTemplateProps) {
  const data = deriveData(content);
  const { p1, p2, isoDate, displayDate, location, events, stories, gallery, gifts, quote, audio, media } = data;

  const [isOpen, setIsOpen] = useState(preview ?? false);
  const [isPlaying, setIsPlaying] = useState(false);
  const guestName = useGuestName(content.guestName, 'Tamu Undangan');
  const countdown = useCountdown(isoDate);
  const [activeTab, setActiveTab] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { wishes, rsvpForm, setRsvpForm, isSubmitted, submit } = useRsvpWishes(slug);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { injectStyles(); }, []);

  const open = () => { setIsOpen(true); setIsPlaying(true); audioRef.current?.play().catch(() => {}); };
  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause(); else audioRef.current?.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };
  const copy = (text: string, idx: number) => { navigator.clipboard?.writeText(text); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2500); };
  const activeEvt = events[activeTab] || events[0];

  /* ── COVER ── */
  if (!isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 text-center overflow-hidden font-body"
        style={{ backgroundColor: CHARCOAL, color: IVORY }}>
        {/* Decorative rings */}
        <div className="absolute inset-4 rounded-[40px] pointer-events-none" style={{ border: `1px solid ${GOLD}26` }} />
        <div className="absolute inset-8 rounded-[32px] pointer-events-none" style={{ border: `1px solid ${GOLD}14` }} />

        <div className="pt-10 z-10 anim-scale-in">
          <FlowerSvg className="w-10 h-10 mx-auto" gold={GOLD} light={GOLD_LIGHT} />
        </div>

        <div className="my-auto max-w-sm z-10 space-y-6">
          <div className="anim-fade-up" style={{ animationDelay: '0.15s' }}>
            <p className="text-[10px] uppercase tracking-[0.35em] font-medium" style={{ color: GOLD_LIGHT }}>The Wedding of</p>
            <div className="w-8 mx-auto my-4" style={{ height: 1, backgroundColor: `${GOLD}4D` }} />
          </div>
          <div className="anim-fade-up space-y-2" style={{ animationDelay: '0.35s' }}>
            <h1 className="font-title text-5xl leading-tight tracking-wide text-white">
              {p1.nick} <span className="inline-block mx-1 text-2xl font-light" style={{ color: GOLD_LIGHT }}>&amp;</span> {p2.nick}
            </h1>
            <p className="text-xs font-light tracking-wider" style={{ color: `${GOLD_LIGHT}B3` }}>{displayDate}</p>
          </div>
          <div className="anim-fade-up pt-2" style={{ animationDelay: '0.55s' }}>
            <p className="text-[9px] uppercase tracking-[0.3em] mb-4" style={{ color: MUTED }}>Kepada Yth.</p>
            <div className="inline-block rounded-xl px-6 py-3 backdrop-blur-sm" style={{ border: `1px solid ${GOLD}33`, backgroundColor: `${IVORY}0D` }}>
              <p className="font-body text-base font-light text-white">{guestName}</p>
            </div>
          </div>
          <div className="pt-6 anim-fade-up" style={{ animationDelay: '0.75s' }}>
            <button onClick={open}
              className="group relative px-10 py-3.5 text-white rounded-full transition-all duration-500 text-xs uppercase tracking-[0.25em] font-medium overflow-hidden anim-glow"
              style={{ backgroundColor: GOLD }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = GOLD_LIGHT}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = GOLD}>
              <span className="relative z-10 flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 fill-current" /> Buka Undangan
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent anim-shimmer" />
            </button>
          </div>
        </div>
        <p className="text-[7px] tracking-[0.35em] uppercase mb-6 z-10" style={{ color: `${GOLD}4D` }}>#{p1.nick}{p2.nick}Hanamori</p>
      </div>
    );
  }

  /* ── MAIN ── */
  return (
    <div className="font-body min-h-screen relative overflow-x-hidden" style={{ backgroundColor: IVORY, color: CHARCOAL, '--sel': `${GOLD}33` } as React.CSSProperties}>
      <audio ref={audioRef} src={audio} loop />

      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-white/90 backdrop-blur-md shadow-xl hover:scale-110 transition-all duration-300"
        style={{ border: `1px solid ${GOLD}33` }}>
        {isPlaying ? (
          <span className="relative flex items-center justify-center">
            <span className="absolute animate-ping inline-flex h-full w-full rounded-full" style={{ backgroundColor: `${GOLD}4D` }} />
            <Volume2 className="w-5 h-5" style={{ color: GOLD }} />
          </span>
        ) : <VolumeX className="w-5 h-5" style={{ color: `${WARM}99` }} />}
      </button>

      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: CHARCOAL }}>
        <div className="absolute inset-0 opacity-30">
          {isVideo(media.hero) ? (
            <video src={media.hero} muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={media.hero} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${CHARCOAL}66, transparent, ${CHARCOAL})` }} />
        <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
          <div className="anim-fade-up" style={{ animationDelay: '0.2s' }}>
            <FlowerSvg className="w-8 h-8 mx-auto mb-6" gold={GOLD} light={GOLD_LIGHT} />
          </div>
          <div className="anim-fade-up space-y-3" style={{ animationDelay: '0.4s' }}>
            <p className="text-[10px] uppercase tracking-[0.4em] font-medium" style={{ color: GOLD_LIGHT }}>Undangan Pernikahan</p>
            <div className="w-8 mx-auto" style={{ height: 1, backgroundColor: `${GOLD}66` }} />
          </div>
          <div className="anim-fade-up space-y-3 mt-6" style={{ animationDelay: '0.6s' }}>
            <h1 className="font-title text-5xl leading-tight text-white">{p1.nick} <span className="text-2xl block mt-1" style={{ color: GOLD_LIGHT }}>&amp;</span> {p2.nick}</h1>
            <p className="font-body text-sm font-light" style={{ color: `${GOLD_LIGHT}CC` }}>{displayDate}</p>
            <p className="text-[10px] tracking-[0.25em] uppercase font-medium" style={{ color: `${GOLD_LIGHT}99` }}>{location}</p>
          </div>
          {guestName && (
            <div className="mt-8 anim-fade-up inline-block" style={{ animationDelay: '0.8s' }}>
              <div className="px-5 py-2 rounded-full backdrop-blur-sm text-xs font-light" style={{ backgroundColor: `${IVORY}1A`, border: `1px solid ${GOLD}4D`, color: IVORY }}>
                Kepada Yth. <span className="font-medium text-white">{guestName}</span>
              </div>
            </div>
          )}
          <div className="mt-16">
            <p className="text-[8px] uppercase tracking-widest text-white/40">Scroll</p>
            <div className="w-0 mx-auto mt-2" style={{ height: 32, borderRight: `1px solid ${GOLD}`, background: `linear-gradient(to bottom, ${GOLD}, transparent)` }} />
          </div>
        </div>
      </section>

      {/* ═══ 2. QUOTE ═══ */}
      <ScrollR><section className="py-24 px-6" style={{ backgroundColor: IVORY }}>
        <div className="max-w-xl mx-auto text-center">
          <HanaDivider />
          <p className="font-title text-4xl mb-4 leading-none" style={{ color: GOLD }}>"</p>
          <p className="font-body text-base leading-relaxed px-4 font-light" style={{ color: WARM }}>{quote.text}</p>
          <p className="font-title text-4xl mt-4 leading-none" style={{ color: GOLD }}>"</p>
          <div className="w-10 mx-auto my-5" style={{ height: 1, backgroundColor: `${GOLD}40` }} />
          <p className="text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: MUTED }}>{quote.source ? '— ' + quote.source : ''}</p>
        </div>
      </section></ScrollR>

      {/* ═══ 3. COUPLE ═══ */}
      <ScrollR><section className="py-24 px-6" style={{ backgroundColor: IVORY_DARK }}>
        <div className="max-w-2xl mx-auto text-center">
          <HanaDivider />
          <p className="text-[9px] uppercase tracking-[0.35em] font-medium mb-2" style={{ color: MUTED }}>Kedua Mempelai</p>
          <h2 className="font-title text-3xl mb-4" style={{ color: CHARCOAL }}>Dengan Cinta & Restu Keluarga</h2>
          <p className="text-xs max-w-md mx-auto mb-16" style={{ color: MUTED }}>Dengan memohon rahmat dan ridha Tuhan, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-12">
            {[
              { person: p1, img: media.p1, label: 'Mempelai Pria', side: 'right' as const },
              { person: p2, img: media.p2, label: 'Mempelai Wanita', side: 'left' as const },
            ].map(({ person, img, label, side }) => (
              <div key={label} className="flex flex-col items-center group px-4 md:px-0 w-full max-w-[280px]">
                <div className="relative w-44 h-56 rounded-[28px] shadow-xl border-[4px] border-white mb-6 overflow-hidden">
                  <img src={img} alt={person.nick} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="font-title text-xl font-medium mb-1" style={{ color: CHARCOAL }}>{person.full}</h3>
                <p className="text-[9px] uppercase tracking-widest font-semibold mb-3" style={{ color: GOLD }}>{label}</p>
                <p className="text-sm leading-relaxed mb-3" style={{ color: WARM }}>{person.desc}</p>
                <p className="text-xs" style={{ color: MUTED }}>
                  Putra/i dari: <span className="font-semibold" style={{ color: CHARCOAL }}>{person.father}</span> & {person.mother}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section></ScrollR>

      {/* ═══ 4. COUNTDOWN ═══ */}
      <ScrollR><section className="py-20 px-6" style={{ backgroundColor: IVORY }}>
        <div className="max-w-lg mx-auto text-center">
          <HanaDivider />
          <p className="text-[9px] uppercase tracking-[0.35em] font-medium mb-2" style={{ color: MUTED }}>Menuju Hari Bahagia</p>
          <h2 className="font-title text-2xl mb-10" style={{ color: CHARCOAL }}>Detik Cinta</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Hari', val: countdown.days },
              { label: 'Jam', val: countdown.hours },
              { label: 'Menit', val: countdown.minutes },
              { label: 'Detik', val: countdown.seconds, accent: true as const },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center" style={{ border: `1px solid ${GOLD}1A` }}>
                <span className={`font-title text-2xl font-light ${item.accent ? '' : ''}`} style={{ color: item.accent ? GOLD : CHARCOAL }}>
                  {String(item.val).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase tracking-widest mt-1.5" style={{ color: MUTED }}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${p1.nick}+%26+${p2.nick}&dates=${isoDate.replace(/[-:]/g,'').replace(/T/,'').slice(0,8)}T090000Z/${isoDate.replace(/[-:]/g,'').replace(/T/,'').slice(0,8)}T160000Z`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-full text-[10px] uppercase tracking-widest font-medium transition-all duration-300 shadow-md"
              style={{ backgroundColor: GOLD }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = GOLD_LIGHT}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = GOLD}>
              <Calendar className="w-3.5 h-3.5" /> Simpan Tanggal
            </a>
          </div>
        </div>
      </section></ScrollR>

      {/* ═══ 5. LOVE STORY ═══ */}
      <ScrollR><section className="py-24 px-6" style={{ backgroundColor: IVORY_DARK }}>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-14">
            <HanaDivider />
            <p className="text-[9px] uppercase tracking-[0.35em] font-medium" style={{ color: MUTED }}>Perjalanan Cinta</p>
            <h2 className="font-title text-2xl mt-1" style={{ color: CHARCOAL }}>Cerita Kami</h2>
          </div>
          <div className="relative ml-4 space-y-10" style={{ borderLeft: `1px solid ${GOLD}33` }}>
            {stories.length > 0 && stories.map((story, idx) => (
              <div key={idx} className="relative pl-8 group">
                <div className="absolute -left-[18px] top-0 p-1 rounded-full border-2 group-hover:scale-110 transition-transform" style={{ backgroundColor: IVORY, borderColor: `${GOLD}66` }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />
                </div>
                <div className="bg-white/80 p-5 rounded-xl hover:shadow-sm transition-all" style={{ border: `1px solid ${GOLD}1A` }}>
                  <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-md mb-2.5" style={{ color: GOLD, backgroundColor: `${GOLD}14` }}>{story.year}</span>
                  <h4 className="font-title text-base font-medium mb-1.5" style={{ color: CHARCOAL }}>{story.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: WARM }}>{story.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section></ScrollR>

      {/* ═══ 6. EVENT SCHEDULE ═══ */}
      <ScrollR><section className="py-24 px-6" style={{ backgroundColor: IVORY }}>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <HanaDivider />
            <p className="text-[9px] uppercase tracking-[0.35em] font-medium" style={{ color: MUTED }}>Informasi Acara</p>
            <h2 className="font-title text-2xl mt-1" style={{ color: CHARCOAL }}>Waktu & Lokasi</h2>
          </div>
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {events.map((evt, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)}
                className="px-5 py-2 rounded-full text-[10px] font-medium uppercase tracking-wider transition-all duration-300"
                style={activeTab === idx
                  ? { backgroundColor: GOLD, color: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { backgroundColor: 'white', color: MUTED, border: `1px solid ${GOLD}26` }}>
                {evt.title}
              </button>
            ))}
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm min-h-[260px]" style={{ border: `1px solid ${GOLD}1A` }}>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-full" style={{ backgroundColor: IVORY }}><Calendar className="w-4 h-4" style={{ color: GOLD }} /></span>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>{activeEvt.title}</span>
              </div>
              <h3 className="font-title text-xl" style={{ color: CHARCOAL }}>{displayDate}</h3>
              <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${GOLD}1A` }}>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-medium" style={{ color: MUTED }}>Waktu</p>
                    <p className="text-sm" style={{ color: CHARCOAL }}>{activeEvt.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-medium" style={{ color: MUTED }}>Lokasi</p>
                    <p className="text-sm" style={{ color: CHARCOAL }}>{activeEvt.venue}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{activeEvt.address}</p>
                  </div>
                </div>
              </div>
              {activeEvt.mapsUrl && (
                <a href={activeEvt.mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider hover:underline"
                  style={{ color: GOLD }}>
                  <MapPin className="w-3 h-3" /> Lihat di Google Maps
                </a>
              )}
              {activeEvt.note && (
                <div className="p-3 rounded-xl text-xs leading-relaxed" style={{ backgroundColor: IVORY_DARK, color: WARM }}>
                  {activeEvt.note}
                </div>
              )}
            </div>
          </div>
        </div>
      </section></ScrollR>

      {/* ═══ 7. GALLERY ═══ */}
      <ScrollR><section className="py-24 px-6" style={{ backgroundColor: IVORY_DARK }}>
        <div className="max-w-xl mx-auto text-center">
          <HanaDivider />
          <p className="text-[9px] uppercase tracking-[0.35em] font-medium mb-1" style={{ color: MUTED }}>Galeri Foto</p>
          <h2 className="font-title text-2xl mb-10" style={{ color: CHARCOAL }}>Kenangan Terindah</h2>
          <div className="grid grid-cols-2 gap-3">
            {gallery.length > 0 && gallery.slice(0, 6).map((img, idx) => (
              <button key={idx} onClick={() => setLightboxIdx(idx)}
                className={`relative overflow-hidden rounded-xl group ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}>
                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section></ScrollR>

      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10" onClick={() => setLightboxIdx(null)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + gallery.length) % gallery.length); }}>
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img src={gallery[lightboxIdx]} alt="" className="max-h-[85vh] max-w-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % gallery.length); }}>
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* ═══ 8. GIFT ═══ */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <ScrollR><section className="py-24 px-6" style={{ backgroundColor: IVORY }}>
          <div className="max-w-xl mx-auto text-center">
            <HanaDivider />
            <p className="text-[9px] uppercase tracking-[0.35em] font-medium mb-1" style={{ color: MUTED }}>Kado Digital</p>
            <h2 className="font-title text-2xl mb-3" style={{ color: CHARCOAL }}>Tanda Kasih</h2>
            <p className="text-xs mb-10 max-w-sm mx-auto" style={{ color: MUTED }}>Doa restu sudah cukup bahagia. Namun jika memberi kado, berikut rekening yang dapat digunakan:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {gifts.map((g, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow" style={{ border: `1px solid ${GOLD}1A` }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: GOLD }}>{g.bank}</p>
                  <p className="font-body text-base font-medium mb-1" style={{ color: CHARCOAL }}>{g.number}</p>
                  <p className="text-xs mb-3" style={{ color: MUTED }}>{g.owner}</p>
                  <button onClick={() => copy(g.number, idx)}
                    className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider hover:underline"
                    style={{ color: GOLD }}>
                    {copiedIdx === idx ? <><Check className="w-3 h-3" /> Tersalin</> : <><Copy className="w-3 h-3" /> Salin</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section></ScrollR>
      )}

      {/* ═══ 9. RSVP / WISHES ═══ */}
      <ScrollR><section className="py-24 px-6" style={{ backgroundColor: IVORY_DARK }}>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <HanaDivider />
            <p className="text-[9px] uppercase tracking-[0.35em] font-medium mb-1" style={{ color: MUTED }}>Ucapan & Doa</p>
            <h2 className="font-title text-2xl" style={{ color: CHARCOAL }}>Kirim Ucapan</h2>
          </div>

          {isSubmitted ? (
            <div className="bg-white p-8 rounded-2xl text-center" style={{ border: `1px solid ${GOLD}1A` }}>
              <Check className="w-8 h-8 mx-auto mb-3" style={{ color: GOLD }} />
              <p className="font-body text-sm font-medium" style={{ color: CHARCOAL }}>Terima kasih atas doa & ucapannya!</p>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white p-6 rounded-2xl space-y-4" style={{ border: `1px solid ${GOLD}1A` }}>
              <div className="grid grid-cols-2 gap-3">
                <input name="name" placeholder="Nama" value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg focus:outline-none transition-colors"
                  style={{ backgroundColor: IVORY, border: `1px solid ${GOLD}26` }}
                  onFocus={(e) => e.target.style.borderColor = GOLD}
                  onBlur={(e) => e.target.style.borderColor = `${GOLD}26`} />
                <select value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                  className="flex-1 px-3 py-2.5 text-sm rounded-lg focus:outline-none transition-colors"
                  style={{ backgroundColor: IVORY, border: `1px solid ${GOLD}26` }}>
                  <option>Hadir</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>
              <textarea placeholder="Tulis ucapan & doa untuk kedua mempelai..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg focus:outline-none transition-colors resize-none h-20"
                style={{ backgroundColor: IVORY, border: `1px solid ${GOLD}26` }}
                onFocus={(e) => e.target.style.borderColor = GOLD}
                onBlur={(e) => e.target.style.borderColor = `${GOLD}26`} />
              <button type="submit"
                className="w-full py-3 text-white rounded-lg text-xs uppercase tracking-widest font-medium transition-all duration-300 flex items-center justify-center gap-2"
                style={{ backgroundColor: GOLD }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = GOLD_LIGHT}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = GOLD}>
                <Send className="w-3.5 h-3.5" /> Kirim Ucapan
              </button>
            </form>
          )}

          {content.guestbook?.enabled !== false && wishes.length > 0 && (
            <div className="mt-10 space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {wishes.slice(0, 20).map((w) => (
                <div key={w.id} className="bg-white/80 p-4 rounded-xl" style={{ border: `1px solid ${GOLD}1A` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium" style={{ color: CHARCOAL }}>{w.name}</p>
                    <span className="text-[9px]" style={{ color: MUTED }}>{w.time}</span>
                  </div>
                  {w.message && <p className="text-xs leading-relaxed" style={{ color: WARM }}>{w.message}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section></ScrollR>

      {/* ═══ 10. FOOTER ═══ */}
      <footer className="py-12 px-6 text-center" style={{ backgroundColor: CHARCOAL }}>
        <div className="max-w-md mx-auto">
          <FlowerSvg className="w-6 h-6 mx-auto mb-4" gold={GOLD_LIGHT} light={GOLD_LIGHT} />
          <p className="font-title text-lg text-white mb-2">{p1.nick} &amp; {p2.nick}</p>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: `${GOLD_LIGHT}80` }}>Terima Kasih</p>
          <div className="w-8 mx-auto my-4" style={{ height: 1, backgroundColor: `${GOLD}33` }} />
          <p className="text-[9px] tracking-wide text-white/30">Dipersembahkan oleh keluarga besar</p>
        </div>
      </footer>
    </div>
  );
}

function FlowerSvg({ className, gold, light }: { className?: string; gold: string; light: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none">
      <path d="M30 8 Q38 4 38 15 Q38 26 30 18 Q22 26 22 15 Q22 4 30 8Z" fill={light} opacity="0.5" />
      <path d="M52 30 Q56 22 45 22 Q34 22 42 30 Q34 38 45 38 Q56 38 52 30Z" fill={light} opacity="0.5" />
      <path d="M30 52 Q22 56 22 45 Q22 34 30 42 Q38 34 38 45 Q38 56 30 52Z" fill={light} opacity="0.5" />
      <path d="M8 30 Q4 22 15 22 Q26 22 18 30 Q26 38 15 38 Q4 38 8 30Z" fill={light} opacity="0.5" />
      <circle cx="30" cy="30" r="5" fill={gold} />
    </svg>
  );
}
