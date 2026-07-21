'use client';

import { useState, useRef, useEffect } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import { Send, Gift, Copy, Check, Camera, Heart, Sparkles, ChevronDown } from 'lucide-react';
import { isVideo, useRsvpWishes, useGuestName, displayDateFrom, pickMedia } from './shared';

const DEFAULTS = {
  p1: { nick: 'Sahabat', full: 'Sahabat Tersayang', ig: '@sahabat' },
  date: new Date().toISOString().split('T')[0],
  gallery: [
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=800',
  ],
  gifts: [
    { bank: 'Bank BCA', number: '0000000000', owner: 'Nama Penerima' },
  ],
  audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
};

function injectStyles() {
  if (typeof window === 'undefined') return;
  const id = 'birthday-wish-styles';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap';
  document.head.appendChild(link);
  const style = document.createElement('style');
  style.innerHTML = `
    .font-wish-serif { font-family: 'Playfair Display', serif; }
    .font-wish-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
    @keyframes wishFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    .animate-wish-float { animation: wishFloat 4s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}

export function UndanganBirthdayWish({ content, slug }: MonolithicTemplateProps) {
  const name = content.couple?.partner1 || DEFAULTS.p1.nick;
  const fullName = content.couple?.partner1Title || content.couple?.partner1 || DEFAULTS.p1.full;
  const ig = content.couple?.partner1Instagram || DEFAULTS.p1.ig;
  const displayDate = displayDateFrom(content.event?.date || DEFAULTS.date, 'Bulan Spesial');
  const gallery = content.gallery?.images?.length ? content.gallery.images : DEFAULTS.gallery;
  const gifts = (content.gift?.items?.length
    ? content.gift.items.map((g) => ({ bank: g.bank || g.name || '', number: g.number || '', owner: g.owner || g.note || '' }))
    : DEFAULTS.gifts).filter((g) => g.bank || g.number);
  const audio = content.music?.src || DEFAULTS.audio;

  const guestName = useGuestName('Tamu Spesial');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { wishes, rsvpForm, setRsvpForm, isSubmitted, submit } = useRsvpWishes(slug);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { injectStyles(); }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };
  const copy = (text: string, index: number) => { navigator.clipboard?.writeText(text); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 3000); };

  return (
    <div className="font-wish-sans min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#1E1B4B] to-[#0B0F19] text-white overflow-x-hidden">
      <audio ref={audioRef} src={audio} loop />

      {/* Floating music toggle */}
      <button onClick={toggleMusic} className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all">
        {isPlaying ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>}
      </button>

      {/* HERO — no cover overlay, langsung hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-[120vw] h-[120vw] border-[30px] border-[#D4AF37] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '60s' }}></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-2xl">
          <Sparkles className="w-12 h-12 text-[#D4AF37] mx-auto mb-6 animate-wish-float" />
          <h1 className="font-wish-serif text-5xl md:text-7xl font-light text-white leading-tight mb-4">{fullName}</h1>
          <p className="text-sm text-[#D4AF37] uppercase tracking-[0.3em] font-medium">{displayDate}</p>
          {ig && <p className="text-xs text-gray-400 mt-3">{ig}</p>}
          <div className="mt-12">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Gulir untuk kirim ucapan</p>
            <ChevronDown className="w-5 h-5 text-[#D4AF37] mx-auto mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* GALERI */}
      {gallery.length > 0 && (
        <section className="py-12 md:py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-wish-serif text-2xl md:text-4xl text-center text-white font-light mb-8">Momen Indah</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {gallery.map((src, idx) => (
                <div key={idx} onClick={() => setLightboxIndex(idx)} className="aspect-square overflow-hidden rounded-xl cursor-pointer group border border-white/10">
                  {isVideo(src) ? <video src={src} muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LIGHTBOX */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {isVideo(gallery[lightboxIndex]) ? <video src={gallery[lightboxIndex]} controls autoPlay className="w-full max-h-[80vh] rounded-2xl" /> : <img src={gallery[lightboxIndex]} alt="" className="w-full max-h-[80vh] object-contain rounded-2xl" />}
            <button onClick={() => setLightboxIndex(null)} className="mt-4 mx-auto block text-xs text-white/60 border border-white/20 rounded-full px-6 py-2">Tutup</button>
          </div>
        </div>
      )}

      {/* UCAPAN / WISHES */}
      <section className="py-12 md:py-20 px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Kirim Ucapan</span>
            <h2 className="font-wish-serif text-3xl md:text-5xl font-light mt-2">Doa & Harapan</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={submit} className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 space-y-5">
              <input type="text" required value={rsvpForm.name} onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })} placeholder="Nama Kamu" className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]" />
              <textarea required rows={4} value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })} placeholder="Tulis ucapan, doa, dan harapan terbaikmu..." className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] resize-none" />
              <button type="submit" disabled={isSubmitted} className="w-full py-3.5 bg-[#D4AF37] text-[#0B0F19] font-bold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 hover:bg-white">
                {isSubmitted ? <><Check className="w-4 h-4" /> Terkirim!</> : <><Send className="w-4 h-4" /> Kirim Ucapan</>}
              </button>
            </form>

            <div className="lg:col-span-7 max-h-[500px] overflow-y-auto space-y-3">
              {wishes.length === 0 && <p className="text-center text-gray-500 text-sm py-10">Belum ada ucapan. Jadilah yang pertama!</p>}
              {wishes.map((w) => (
                <div key={w.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white">{w.name}</span>
                    {w.time && <span className="text-[10px] text-gray-400">{w.time}</span>}
                  </div>
                  {w.message && <p className="text-xs text-gray-300 leading-relaxed">{w.message}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GIFT / HADIAH */}
      {content.gift?.enabled !== false && gifts.length > 0 && (
        <section className="py-12 md:py-20 px-6 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-10">
              <span className="inline-block p-3 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] mb-4"><Gift className="w-6 h-6" /></span>
              <h2 className="font-wish-serif text-3xl md:text-5xl font-light">{content.gift?.title || 'Tanda Kasih'}</h2>
              <p className="text-xs text-gray-400 mt-3 max-w-md mx-auto">Doa & ucapan adalah hadiah terindah. Tapi jika ingin memberi tanda kasih, berikut rekening yang bisa digunakan.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {gifts.map((g, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 text-left">
                  {g.bank && <p className="font-wish-serif text-xl font-bold text-[#D4AF37] mb-1">{g.bank}</p>}
                  {g.number && (
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between my-4">
                      <span className="font-mono text-sm tracking-wider text-white">{g.number}</span>
                      <button onClick={() => copy(g.number, idx)} className="text-xs flex items-center gap-1 text-[#D4AF37] hover:text-white">
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedIndex === idx ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>
                  )}
                  {g.owner && <p className="text-xs text-gray-400">a.n. {g.owner}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="py-12 md:py-16 px-6 text-center border-t border-white/5">
        <p className="text-xs text-gray-400">{content.footer?.text || `Terima kasih atas doa & ucapannya untuk ${fullName}`}</p>
        <p className="text-[10px] text-gray-600 mt-4">Dibuat dengan cinta</p>
      </footer>
    </div>
  );
}

export default UndanganBirthdayWish;
