import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart, Calendar, Clock, MapPin, Music, Volume2, VolumeX,
  Copy, Check, Send, Gift, Users, MessageSquare, ArrowRight,
  ChevronLeft, ChevronRight, Map, Camera
} from 'lucide-react';

/* =============== INJECT STYLES =============== */
const injectStyles = () => {
  if (typeof window === 'undefined' || document.getElementById('flora-styles')) return;
  const style = document.createElement('style');
  style.id = 'flora-styles';
  style.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Plus+Jakarta+Sans:wght@200;300;400;500;600&family=Sacramento&display=swap');

.font-serif { font-family: 'Playfair Display', Georgia, serif; }
.font-body { font-family: 'Cormorant Garamond', serif; }
.font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
.font-cursive { font-family: 'Sacramento', cursive; }

/* === ANIMATIONS === */
@keyframes bloom-in {
  0% { transform: scale(0) rotate(-15deg); opacity: 0; }
  60% { transform: scale(1.1) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes bloom-flower {
  0% { transform: scale(0) rotate(-20deg); opacity: 0; }
  50% { transform: scale(1.15) rotate(5deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes leaf-sway {
  0%, 100% { transform: rotate(-4deg) translateY(0); }
  50% { transform: rotate(6deg) translateY(-4px); }
}
@keyframes leaf-sway-reverse {
  0%, 100% { transform: rotate(4deg) translateY(0); }
  50% { transform: rotate(-6deg) translateY(-3px); }
}
@keyframes petal-fall {
  0% { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.4; }
  100% { transform: translateY(calc(100vh + 20px)) rotate(720deg) scale(0.3); opacity: 0; }
}
@keyframes float-dance {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  25% { transform: translateY(-8px) rotate(3deg) scale(1.02); }
  50% { transform: translateY(-4px) rotate(-2deg) scale(0.98); }
  75% { transform: translateY(-10px) rotate(4deg) scale(1.01); }
}
@keyframes vine-grow {
  0% { stroke-dashoffset: 500; }
  100% { stroke-dashoffset: 0; }
}
@keyframes twinkle-star {
  0%, 100% { opacity: 0.2; transform: scale(0.6); }
  50% { opacity: 1; transform: scale(1.1); }
}
@keyframes reveal-up {
  0% { opacity: 0; transform: translateY(40px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes reveal-blur {
  0% { opacity: 0; filter: blur(12px); transform: translateY(20px); }
  100% { opacity: 1; filter: blur(0); transform: translateY(0); }
}
@keyframes pulse-soft {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.3); }
  50% { box-shadow: 0 0 0 10px rgba(212, 165, 116, 0); }
}
@keyframes shimmer-gold {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes card-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.animate-bloom { animation: bloom-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-bloom-flower { animation: bloom-flower 1.2s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-leaf-sway { animation: leaf-sway 4s ease-in-out infinite; }
.animate-leaf-sway-rev { animation: leaf-sway-reverse 5s ease-in-out infinite; }
.animate-petal-fall { animation: petal-fall var(--fall-dur, 8s) linear infinite; }
.animate-float-dance { animation: float-dance 6s ease-in-out infinite; }
.animate-float-dance-2 { animation: float-dance 7s ease-in-out infinite reverse; }
.animate-vine-grow { stroke-dasharray: 500; animation: vine-grow 2s ease-out forwards; }
.animate-twinkle { animation: twinkle-star 3s ease-in-out infinite; }
.animate-reveal-up { animation: reveal-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-reveal-blur { animation: reveal-blur 1s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
.animate-card-float { animation: card-float 4s ease-in-out infinite; }

/* Scroll observer */
.scroll-reveal { opacity: 0; transform: translateY(40px) scale(0.98); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.scroll-reveal.revealed { opacity: 1; transform: translateY(0) scale(1); }
.scroll-reveal-delay-1 { transition-delay: 0.1s; }
.scroll-reveal-delay-2 { transition-delay: 0.25s; }
.scroll-reveal-delay-3 { transition-delay: 0.4s; }
.scroll-reveal-delay-4 { transition-delay: 0.55s; }

/* Hide scrollbar */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

html { scroll-behavior: smooth; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #FDF8F4; }
::-webkit-scrollbar-thumb { background: #D4A574; border-radius: 2px; }
`;
  document.head.appendChild(style);
};

/* =============== SVG ORNAMENTS =============== */

/** 5-petal flower */
const FlowerSVG = ({ className = "w-8 h-8", petalColor = "#D4A574", centerColor = "#C9A96E", strokeColor = "#8B6F5E" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    {/* Petals */}
    <path d="M50 15 Q65 5 50 30 Q35 5 50 15Z" fill={petalColor} stroke={strokeColor} strokeWidth="0.5" />
    <path d="M85 50 Q95 35 70 50 Q95 65 85 50Z" fill={petalColor} stroke={strokeColor} strokeWidth="0.5" />
    <path d="M50 85 Q35 95 50 70 Q65 95 50 85Z" fill={petalColor} stroke={strokeColor} strokeWidth="0.5" />
    <path d="M15 50 Q5 35 30 50 Q5 65 15 50Z" fill={petalColor} stroke={strokeColor} strokeWidth="0.5" />
    <path d="M50 50 Q65 35 50 30 Q35 35 50 50Z" fill={petalColor} stroke={strokeColor} strokeWidth="0.5" />
    <path d="M50 50 Q65 50 70 50 Q65 65 50 50Z" fill={petalColor} stroke={strokeColor} strokeWidth="0.5" />
    <path d="M50 50 Q35 50 30 50 Q35 65 50 50Z" fill={petalColor} stroke={strokeColor} strokeWidth="0.5" />
    <path d="M50 50 Q50 35 50 30 Q50 35 50 50Z" fill={petalColor} stroke={strokeColor} strokeWidth="0.5" />
    {/* Center */}
    <circle cx="50" cy="50" r="12" fill={centerColor} />
    <circle cx="50" cy="50" r="6" fill="#FFF" opacity="0.4" />
  </svg>
);

/** Leaf SVG */
const LeafSVG = ({ className = "w-6 h-6", color = "#A8B5A0", direction = "right" }) => (
  <svg viewBox="0 0 50 80" className={`${className} ${direction === "left" ? "scale-x-[-1]" : ""}`} fill="none">
    <path d="M25 0 Q10 20 5 45 Q15 35 25 40 Q20 55 15 70 Q25 60 30 75 Q35 55 40 40 Q45 20 25 0Z" fill={color} opacity="0.7" />
    <path d="M25 0 Q25 20 28 38" stroke={color} strokeWidth="0.8" fill="none" />
  </svg>
);

/** Vine corner */
const VineCorner = ({ className = "w-16 h-16", color = "#A8B5A0" }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <path d="M0 80 Q20 75 30 60 Q40 45 50 50 Q60 55 70 45 Q75 40 80 30" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
    <path d="M30 60 Q25 52 18 50" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
    <path d="M50 50 Q48 42 42 38" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
    <circle cx="70" cy="45" r="3" fill={color} opacity="0.4" />
  </svg>
);

/** Floral wreath */
const FloralWreath = ({ className = "w-32 h-32", petalColor = "#D4A574", leafColor = "#A8B5A0" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none">
    {/* Leaves */}
    <path d="M60 10 Q45 0 40 12 Q50 15 60 10Z" fill={leafColor} opacity="0.7" />
    <path d="M60 10 Q75 0 80 12 Q70 15 60 10Z" fill={leafColor} opacity="0.7" />
    <path d="M110 60 Q120 45 108 40 Q105 50 110 60Z" fill={leafColor} opacity="0.7" />
    <path d="M110 60 Q120 75 108 80 Q105 70 110 60Z" fill={leafColor} opacity="0.7" />
    <path d="M60 110 Q45 120 40 108 Q50 105 60 110Z" fill={leafColor} opacity="0.7" />
    <path d="M60 110 Q75 120 80 108 Q70 105 60 110Z" fill={leafColor} opacity="0.7" />
    <path d="M10 60 Q0 45 12 40 Q15 50 10 60Z" fill={leafColor} opacity="0.7" />
    <path d="M10 60 Q0 75 12 80 Q15 70 10 60Z" fill={leafColor} opacity="0.7" />
    {/* Small flowers */}
    <circle cx="40" cy="12" r="5" fill={petalColor} />
    <circle cx="40" cy="12" r="2" fill="#C9A96E" />
    <circle cx="80" cy="12" r="5" fill={petalColor} />
    <circle cx="80" cy="12" r="2" fill="#C9A96E" />
    <circle cx="108" cy="40" r="5" fill={petalColor} />
    <circle cx="108" cy="40" r="2" fill="#C9A96E" />
    <circle cx="108" cy="80" r="5" fill={petalColor} />
    <circle cx="108" cy="80" r="2" fill="#C9A96E" />
    <circle cx="40" cy="108" r="5" fill={petalColor} />
    <circle cx="40" cy="108" r="2" fill="#C9A96E" />
    <circle cx="80" cy="108" r="5" fill={petalColor} />
    <circle cx="80" cy="108" r="2" fill="#C9A96E" />
    <circle cx="12" cy="40" r="5" fill={petalColor} />
    <circle cx="12" cy="40" r="2" fill="#C9A96E" />
    <circle cx="12" cy="80" r="5" fill={petalColor} />
    <circle cx="12" cy="80" r="2" fill="#C9A96E" />
  </svg>
);

/** Section divider with flower */
const FloralDivider = ({ className = "", color = "#D4A574" }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4A574]/30 to-transparent max-w-[60px]"></div>
    <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
      <circle cx="20" cy="20" r="6" fill={color} />
      <path d="M20 14 Q23 10 20 16 Q17 10 20 14Z" fill={color} opacity="0.6" />
      <path d="M26 20 Q30 17 24 20 Q30 23 26 20Z" fill={color} opacity="0.6" />
      <path d="M20 26 Q17 30 20 24 Q23 30 20 26Z" fill={color} opacity="0.6" />
      <path d="M14 20 Q10 17 16 20 Q10 23 14 20Z" fill={color} opacity="0.6" />
    </svg>
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4A574]/30 to-transparent max-w-[60px]"></div>
  </div>
);

/* =============== DATA =============== */
const WEDDING_DATA = {
  groom: {
    nickname: "Raka",
    fullName: "Raka Pramana Putra, S.Kom.",
    father: "Bpk. Dr. I Wayan Pramana",
    mother: "Ibu Ni Luh Putu Sari Dewi",
    instagram: "@rakapramana",
    desc: "Percaya bahwa cinta adalah melodi paling indah yang menyelaraskan dua hati dalam harmoni kehidupan."
  },
  bride: {
    nickname: "Dewi",
    fullName: "Dewi Ayu Saraswati, S.Pd.",
    father: "Bpk. I Ketut Arimbawa",
    mother: "Ibu Ni Made Wartini",
    instagram: "@dewiayusaras",
    desc: "Seorang pencinta seni yang meyakini bahwa setiap helai bunga mengajarkan keindahan kesabaran dan ketulusan."
  },
  date: "2027-05-15T09:00:00",
  displayDate: "Sabtu, 15 Mei 2027",
  quote: {
    text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.",
    source: "QS. Ar-Rum: 21"
  },
  events: [
    {
      id: "akad",
      title: "Akad Nikah",
      time: "09:00 - 11:00 WITA",
      venue: "Puri Agung Saraswati",
      address: "Jl. Raya Ubud No. 88, Gianyar, Bali",
      gmaps: "https://maps.google.com",
      note: "Khidmat dan sakral, khusus keluarga inti dan kerabat dekat"
    },
    {
      id: "resepsi",
      title: "Resepsi & Santapan",
      time: "12:00 - 16:00 WITA",
      venue: "Taman Bunga Ubud Resort",
      address: "Jl. Bunga Rampai, Ubud, Gianyar, Bali",
      gmaps: "https://maps.google.com",
      note: "Terbuka untuk seluruh tamu undangan. Dresscode: Earth Tone / Floral motif"
    }
  ],
  stories: [
    {
      year: "2022",
      title: "Di Antara Bunga & Pameran",
      desc: "Berawal dari pameran seni budaya di Ubud. Raka yang sedang memotret instalasi bunga, tanpa sengaja mengabadikan Dewi yang sedang menikmati lukisan. Saling tegur sapa berubah menjadi perbincangan hangat hingga larut."
    },
    {
      year: "2024",
      title: "Menyatukan Langkah",
      desc: "Dua tahun saling mengenal, bertumbuh, dan berbagi mimpi. Sepakat untuk melangkah bersama menghadapi suka duka kehidupan dengan cinta yang telah teruji."
    },
    {
      year: "2026",
      title: "Di Bawah Teduh Bunga Anggrek",
      desc: "Raka meminang Dewi di sebuah taman anggrek yang bermekaran. Dengan restu kedua keluarga, ikatan cinta dikukuhkan menuju jenjang pernikahan yang suci."
    }
  ],
  gallery: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1537907690979-ee8e01276184?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80&w=800"
  ],
  gifts: [
    { bank: "Bank Mandiri", number: "1180023491820", owner: "Raka Pramana Putra" },
    { bank: "Bank BCA", number: "0359871120", owner: "Dewi Ayu Saraswati" }
  ],
  audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
};

/* =============== HOOKS =============== */
const useScrollReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('revealed'); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

/* =============== FLOATING PETALS COMPONENT =============== */
const FloatingPetals = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          left: `${10 + i * 16 + Math.random() * 10}%`,
          top: `${Math.random() * -20}%`,
          '--fall-dur': `${6 + i * 1.5}s`,
          animationDelay: `${i * 1.8}s`,
          animation: `petal-fall var(--fall-dur) linear ${i * 1.8}s infinite`
        }}
      >
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
          <path d="M6 0 Q11 4 8 10 Q6 16 4 10 Q1 4 6 0Z" fill={i % 2 === 0 ? "#D4A574" : "#E8C4C0"} opacity="0.4" />
        </svg>
      </div>
    ))}
    {/* Floating flowers */}
    {[...Array(3)].map((_, i) => (
      <div
        key={`f${i}`}
        className={`absolute ${i % 2 === 0 ? 'animate-float-dance' : 'animate-float-dance-2'}`}
        style={{
          left: `${5 + i * 35}%`,
          top: `${20 + i * 28}%`,
          animationDelay: `${i * 1.2}s`,
          opacity: 0.15,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#D4A574">
          <circle cx="12" cy="12" r="4" fill="#C9A96E" />
          <circle cx="12" cy="8" r="3" fill="#D4A574" opacity="0.7" />
          <circle cx="16" cy="12" r="3" fill="#D4A574" opacity="0.7" />
          <circle cx="12" cy="16" r="3" fill="#D4A574" opacity="0.7" />
          <circle cx="8" cy="12" r="3" fill="#D4A574" opacity="0.7" />
        </svg>
      </div>
    ))}
  </div>
);

/* =============== MAIN COMPONENT =============== */
export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [activeTab, setActiveTab] = useState("akad");
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const audioRef = useRef(null);

  const [rsvpForm, setRsvpForm] = useState({ name: '', guests: '1', attendance: 'Hadir', message: '' });
  const [wishes, setWishes] = useState([
    { name: "Putu & Made", guests: "2", attendance: "Hadir", message: "Selamat menempuh hidup baru Raka & Dewi! Semoga sakinah, mawaddah, warahmah. Cinta kalian seindah bunga yang mekar di taman surga.", time: "Baru saja" },
    { name: "Komang Ayu", guests: "1", attendance: "Hadir", message: "So happy for you both! Doa terbaik untuk kalian berdua, semoga langgeng bahagia sampai mimpang (akhir hayat)!", time: "2 jam lalu" }
  ]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const to = p.get('to');
      if (to) setGuestName(decodeURIComponent(to));
    }
  }, []);

  useEffect(() => {
    const t = new Date(WEDDING_DATA.date).getTime();
    const update = () => {
      const diff = t - Date.now();
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      });
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const handleRsvp = (e) => {
    e.preventDefault();
    if (!rsvpForm.name.trim() || !rsvpForm.message.trim()) return;
    setWishes([{ name: rsvpForm.name, guests: rsvpForm.guests, attendance: rsvpForm.attendance, message: rsvpForm.message, time: "Baru saja" }, ...wishes]);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setRsvpForm({ name: '', guests: '1', attendance: 'Hadir', message: '' });
    }, 2500);
  };

  const copyNum = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const Section = ({ children, className = "" }) => {
    const ref = useScrollReveal();
    return <div ref={ref} className={`scroll-reveal ${className}`}>{children}</div>;
  };

  /* ===== COVER ===== */
  if (!isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#3D2C2A] via-[#4A3530] to-[#3D2C2A] text-[#FDF8F4] p-6 text-center font-sans overflow-hidden">
        <FloatingPetals />
        <div className="absolute inset-4 md:inset-8 border border-[#D4A574]/30 pointer-events-none rounded-[30px] z-10"></div>
        <div className="absolute inset-6 md:inset-11 border border-[#D4A574]/10 pointer-events-none rounded-[24px] z-10"></div>

        {/* Top ornament */}
        <div className="pt-8 z-20 animate-bloom">
          <FloralWreath className="w-20 h-20 mx-auto" />
        </div>

        <div className="my-auto max-w-sm z-20 space-y-8 px-4">
          <div className="space-y-2 animate-reveal-blur" style={{ animationDelay: '0.2s' }}>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4A574] font-semibold">The Wedding of</span>
            <div className="w-12 h-[1px] bg-[#D4A574]/40 mx-auto my-4"></div>
          </div>

          <div className="animate-reveal-blur space-y-3" style={{ animationDelay: '0.4s' }}>
            <h1 className="font-cursive text-6xl md:text-7xl text-[#E8C4C0] leading-tight">
              Raka <span className="inline-block mx-2 animate-float-dance text-4xl text-[#D4A574]">&</span> Dewi
            </h1>
            <p className="font-serif text-base italic text-[#D4A574] font-light">15 . 05 . 2027</p>
          </div>

          <div className="animate-reveal-blur space-y-4 pt-6" style={{ animationDelay: '0.6s' }}>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#FDF8F4]/60">Kepada Yth.</span>
            <div className="bg-white/8 backdrop-blur-md border border-[#D4A574]/30 rounded-2xl p-5 inline-block shadow-2xl">
              <p className="font-serif text-xl font-light text-[#FDF8F4]">{guestName}</p>
              <span className="text-[8px] text-[#D4A574] uppercase tracking-widest mt-1.5 block font-semibold">Tamu Istimewa</span>
            </div>
          </div>

          <div className="pt-4 animate-reveal-blur" style={{ animationDelay: '0.8s' }}>
            <button onClick={handleOpen}
              className="group relative px-10 py-4 bg-[#D4A574] hover:bg-white text-[#3D2C2A] font-semibold rounded-full shadow-2xl transition-all duration-500 text-xs uppercase tracking-[0.25em] overflow-hidden animate-pulse-soft"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                <Heart className="w-4 h-4 fill-current" />
                Buka Undangan
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-[shimmer-gold_3s_ease-in-out_infinite]"></span>
            </button>
          </div>
        </div>

        <div className="mb-8 z-20">
          <p className="text-[8px] text-[#D4A574]/50 tracking-[0.35em] uppercase">#RakaDewiHarmoni</p>
        </div>
      </div>
    );
  }

  /* ===== MAIN CONTENT ===== */
  return (
    <div className="font-sans bg-[#FDF8F4] text-[#3D2C2A] min-h-screen relative overflow-x-hidden selection:bg-[#D4A574]/30 selection:text-[#3D2C2A]">

      <audio ref={audioRef} src={WEDDING_DATA.audioUrl} loop />

      {/* Floating petals (throughout) */}
      <FloatingPetals />

      {/* Music toggle */}
      <button onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-white/90 backdrop-blur-md text-[#3D2C2A] shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border border-[#D4A574]/30 group"
      >
        {isPlaying ? (
          <div className="relative flex items-center justify-center">
            <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-[#D4A574]/40"></span>
            <Volume2 className="w-5 h-5 text-[#D4A574]" />
          </div>
        ) : (
          <VolumeX className="w-5 h-5 text-[#3D2C2A]/60" />
        )}
      </button>

      {/* ===== 1. HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#4A3530] via-[#5A4240] to-[#FDF8F4]">
        {/* Background image */}
        <div className="absolute inset-0 opacity-15 scale-105">
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600" alt="" className="w-full h-full object-cover" />
        </div>

        {/* Vine corners */}
        <div className="absolute top-4 left-4 z-10 animate-bloom-flower"><VineCorner className="w-20 h-20 text-[#A8B5A0]" /></div>
        <div className="absolute top-4 right-4 z-10 animate-bloom-flower scale-x-[-1]"><VineCorner className="w-20 h-20 text-[#A8B5A0]" /></div>
        <div className="absolute bottom-4 left-4 z-10 animate-bloom-flower scale-y-[-1]"><VineCorner className="w-20 h-20 text-[#A8B5A0]" /></div>
        <div className="absolute bottom-4 right-4 z-10 animate-bloom-flower scale-[-1]"><VineCorner className="w-20 h-20 text-[#A8B5A0]" /></div>

        {/* Floating flower decorations */}
        <div className="absolute top-20 left-8 animate-float-dance opacity-30 z-10">
          <FlowerSVG className="w-10 h-10" petalColor="#E8C4C0" />
        </div>
        <div className="absolute top-32 right-12 animate-float-dance-2 opacity-25 z-10">
          <FlowerSVG className="w-8 h-8" petalColor="#D4A574" />
        </div>
        <div className="absolute bottom-40 left-10 animate-leaf-sway opacity-30 z-10">
          <LeafSVG className="w-8 h-8" color="#A8B5A0" />
        </div>
        <div className="absolute bottom-32 right-8 animate-leaf-sway-rev opacity-30 z-10">
          <LeafSVG className="w-10 h-10" color="#A8B5A0" direction="left" />
        </div>

        <div className="relative z-10 text-center px-6 py-24 max-w-lg mx-auto">
          <div className="animate-reveal-blur" style={{ animationDelay: '0.3s' }}>
            <FloralWreath className="w-24 h-24 mx-auto mb-6" />
          </div>
          <div className="animate-reveal-blur space-y-3" style={{ animationDelay: '0.5s' }}>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4A574] font-semibold block">Undangan Pernikahan</span>
            <div className="w-10 h-[1px] bg-[#D4A574]/40 mx-auto"></div>
          </div>
          <div className="animate-reveal-blur space-y-4 mt-6" style={{ animationDelay: '0.7s' }}>
            <h1 className="font-cursive text-6xl md:text-7xl text-white leading-tight">
              Raka <span className="text-3xl md:text-4xl text-[#D4A574] block my-1">&</span> Dewi
            </h1>
            <p className="font-serif text-sm italic text-[#E8C4C0]">{WEDDING_DATA.displayDate}</p>
            <p className="text-xs tracking-[0.25em] uppercase text-[#D4A574] font-medium">Gianyar, Bali</p>
          </div>
          <div className="mt-12 animate-bounce">
            <p className="text-[9px] uppercase tracking-widest text-[#E8C4C0]/70">Gulir ke Bawah</p>
            <div className="w-[1px] h-8 bg-gradient-to-b from-[#D4A574] to-transparent mx-auto mt-2"></div>
          </div>
        </div>
      </section>

      {/* ===== 2. QUOTE ===== */}
      <Section>
        <section className="py-24 px-6 bg-[#FDF8F4] relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 opacity-[0.06]"><FlowerSVG className="w-full h-full" petalColor="#D4A574" /></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 opacity-[0.06]"><FlowerSVG className="w-full h-full" petalColor="#D4A574" /></div>

          <div className="max-w-xl mx-auto text-center relative z-10">
            <LeafSVG className="w-8 h-8 mx-auto mb-6 animate-leaf-sway" color="#A8B5A0" />
            <FloralDivider className="mb-8" />
            <div className="font-serif text-3xl md:text-4xl text-[#D4A574] mb-4 leading-none">"</div>
            <p className="font-body text-lg md:text-xl italic leading-relaxed text-[#5A4240] px-4 font-light">
              {WEDDING_DATA.quote.text}
            </p>
            <div className="font-serif text-3xl md:text-4xl text-[#D4A574] mt-4 leading-none">"</div>
            <div className="w-12 h-[1px] bg-[#D4A574]/30 mx-auto my-6"></div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8B6F5E]">— {WEDDING_DATA.quote.source}</p>
          </div>
        </section>
      </Section>

      {/* ===== 3. COUNTDOWN ===== */}
      <Section>
        <section className="py-20 px-6 bg-gradient-to-b from-[#FDF8F4] to-[#FAF0E8] relative">
          <div className="max-w-lg mx-auto text-center">
            <FloralDivider className="mb-4" />
            <h3 className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold mb-2">Menuju Hari Bahagia</h3>
            <h2 className="font-serif text-3xl md:text-4xl text-[#3D2C2A] mb-12">Detik Cinta</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Hari", val: countdown.days, delay: "0s" },
                { label: "Jam", val: countdown.hours, delay: "0.15s" },
                { label: "Menit", val: countdown.minutes, delay: "0.3s" },
                { label: "Detik", val: countdown.seconds, delay: "0.45s", accent: true }
              ].map((item, idx) => (
                <div key={idx}
                  className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-[#D4A574]/15 flex flex-col items-center relative overflow-hidden group hover:shadow-md transition-all duration-300 animate-card-float"
                  style={{ animationDelay: item.delay }}
                >
                  <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A574] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <span className={`font-serif text-3xl md:text-4xl font-light ${item.accent ? 'text-[#D4A574]' : 'text-[#3D2C2A]'}`}>
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#8B6F5E]/60 mt-2 font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+Raka+%26+Dewi&dates=20270515T090000Z/20270515T160000Z`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A574] hover:bg-[#3D2C2A] text-white rounded-full text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 shadow-md"
              >
                <Calendar className="w-3.5 h-3.5" /> Simpan Tanggal
              </a>
            </div>
          </div>
        </section>
      </Section>

      {/* ===== 4. COUPLE ===== */}
      <Section>
        <section className="py-24 px-6 bg-[#FDF8F4] relative">
          <div className="max-w-xl mx-auto text-center">
            <FloralDivider className="mb-4" />
            <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Kedua Mempelai</span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#3D2C2A] mt-2 mb-4">
              Dengan Cinta & Restu Keluarga
            </h2>
            <p className="text-xs text-[#8B6F5E] leading-relaxed max-w-sm mx-auto mb-16">
              Dengan memohon rahmat dan ridha Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan yang akan mempersatukan:
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-12">
              {/* Groom */}
              <div className="flex flex-col items-center space-y-4 group">
                <div className="relative w-48 h-56 overflow-hidden rounded-[60px_60px_20px_20px] shadow-lg border-4 border-white outline outline-1 outline-[#D4A574]/20 transition-all duration-500">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600" alt="Raka"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full">
                    <FlowerSVG className="w-5 h-5" petalColor="#D4A574" />
                  </div>
                </div>
                <h3 className="font-serif text-xl text-[#3D2C2A] font-medium">{WEDDING_DATA.groom.fullName}</h3>
                <p className="text-[9px] text-[#D4A574] uppercase tracking-widest font-semibold">Mempelai Pria</p>
                <p className="text-xs text-[#8B6F5E] max-w-xs leading-relaxed">{WEDDING_DATA.groom.desc}</p>
                <p className="text-[10px] text-[#8B6F5E] leading-relaxed">
                  Putra dari:<br/>
                  <span className="font-semibold text-[#3D2C2A]">{WEDDING_DATA.groom.father}</span><br/>
                  & {WEDDING_DATA.groom.mother}
                </p>
              </div>

              {/* Divider */}
              <div className="hidden md:flex flex-col items-center text-[#D4A574]">
                <div className="h-16 w-[1px] bg-[#D4A574]/30"></div>
                <Heart className="w-5 h-5 my-2 fill-[#D4A574]/30" />
                <div className="h-16 w-[1px] bg-[#D4A574]/30"></div>
              </div>
              <div className="md:hidden w-16 h-[1px] bg-[#D4A574]/30"></div>

              {/* Bride */}
              <div className="flex flex-col items-center space-y-4 group">
                <div className="relative w-48 h-56 overflow-hidden rounded-[60px_60px_20px_20px] shadow-lg border-4 border-white outline outline-1 outline-[#D4A574]/20 transition-all duration-500">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600" alt="Dewi"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-2 left-2 bg-white/90 p-1.5 rounded-full">
                    <FlowerSVG className="w-5 h-5" petalColor="#E8C4C0" />
                  </div>
                </div>
                <h3 className="font-serif text-xl text-[#3D2C2A] font-medium">{WEDDING_DATA.bride.fullName}</h3>
                <p className="text-[9px] text-[#D4A574] uppercase tracking-widest font-semibold">Mempelai Wanita</p>
                <p className="text-xs text-[#8B6F5E] max-w-xs leading-relaxed">{WEDDING_DATA.bride.desc}</p>
                <p className="text-[10px] text-[#8B6F5E] leading-relaxed">
                  Putri dari:<br/>
                  <span className="font-semibold text-[#3D2C2A]">{WEDDING_DATA.bride.father}</span><br/>
                  & {WEDDING_DATA.bride.mother}
                </p>
              </div>
            </div>
          </div>
        </section>
      </Section>

      {/* ===== 5. LOVE STORY ===== */}
      <Section>
        <section className="py-24 px-6 bg-[#FAF0E8] relative">
          <div className="absolute -top-16 -right-16 w-32 h-32 opacity-[0.05]"><LeafSVG className="w-full h-full" color="#A8B5A0" /></div>
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-16">
              <FloralDivider className="mb-4" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Perjalanan Cinta</span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#3D2C2A] mt-2">Cinta yang Bersemi</h2>
            </div>

            <div className="relative border-l border-[#D4A574]/30 ml-5 space-y-12">
              {WEDDING_DATA.stories.map((story, idx) => (
                <div key={idx} className="relative pl-8 group">
                  {/* Flower marker */}
                  <div className="absolute -left-[22px] top-0 bg-[#FDF8F4] p-1 rounded-full border-2 border-[#D4A574] group-hover:scale-110 transition-transform duration-300">
                    <FlowerSVG className="w-4 h-4" petalColor="#D4A574" />
                  </div>

                  {/* Year badge */}
                  <div className="hidden md:block absolute -left-28 top-0 text-right w-20">
                    <span className="font-serif text-lg text-[#D4A574] font-medium">{story.year}</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4A574]/10 hover:shadow-md transition-all duration-300">
                    <span className="inline-block text-xs font-bold text-[#D4A574] bg-[#D4A574]/10 px-3 py-1 rounded-full mb-3 md:hidden">{story.year}</span>
                    <h4 className="font-serif text-lg text-[#3D2C2A] font-medium mb-2">{story.title}</h4>
                    <p className="text-xs text-[#8B6F5E] leading-relaxed">{story.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Section>

      {/* ===== 6. EVENT SCHEDULE ===== */}
      <Section>
        <section className="py-24 px-6 bg-[#FDF8F4]">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-12">
              <FloralDivider className="mb-4" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Informasi Acara</span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#3D2C2A] mt-2">Waktu & Lokasi</h2>
            </div>

            {/* Tab buttons */}
            <div className="flex justify-center gap-3 mb-8">
              {WEDDING_DATA.events.map((evt) => (
                <button key={evt.id} onClick={() => setActiveTab(evt.id)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 ${
                    activeTab === evt.id
                      ? 'bg-[#D4A574] text-white shadow-md'
                      : 'bg-white text-[#8B6F5E] border border-[#D4A574]/20 hover:bg-[#FAF0E8]'
                  }`}
                >
                  {evt.title}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#D4A574]/10 relative min-h-[320px]">
              {WEDDING_DATA.events.map((evt) => {
                if (evt.id !== activeTab) return null;
                return (
                  <div key={evt.id} className="space-y-6 animate-reveal-up">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 bg-[#FAF0E8] rounded-full">
                        <Calendar className="w-4 h-4 text-[#D4A574]" />
                      </span>
                      <span className="text-[9px] font-bold text-[#D4A574] uppercase tracking-widest">{evt.title}</span>
                    </div>

                    <h3 className="font-serif text-2xl text-[#3D2C2A]">{WEDDING_DATA.displayDate}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#D4A574]/10">
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-[#D4A574] mt-0.5" />
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-[#8B6F5E] font-semibold">Waktu</p>
                          <p className="text-sm text-[#3D2C2A]">{evt.time}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#D4A574] mt-0.5" />
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-[#8B6F5E] font-semibold">Lokasi</p>
                          <p className="text-sm text-[#3D2C2A]">{evt.venue}</p>
                          <p className="text-xs text-[#8B6F5E]">{evt.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FAF0E8] p-4 rounded-2xl flex items-start gap-2.5">
                      <span className="text-xs text-[#8B6F5E]">📌</span>
                      <p className="text-xs text-[#8B6F5E] leading-relaxed">{evt.note}</p>
                    </div>

                    <a href={evt.gmaps} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D2C2A] hover:bg-[#D4A574] text-white rounded-full text-[10px] uppercase tracking-widest font-medium transition-all duration-300"
                    >
                      <Map className="w-3.5 h-3.5" /> Buka Google Maps
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Section>

      {/* ===== 7. GALLERY ===== */}
      <Section>
        <section className="py-24 px-6 bg-[#FAF0E8]">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-12">
              <FloralDivider className="mb-4" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Galeri Foto</span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#3D2C2A] mt-2">Momen Berharga</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {WEDDING_DATA.gallery.map((img, idx) => (
                <div key={idx} onClick={() => setLightboxIndex(idx)}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-sm cursor-pointer border-2 border-white hover:shadow-lg transition-all duration-300"
                >
                  <img src={img} alt={`Gallery ${idx+1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[#3D2C2A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="p-2 bg-white/90 rounded-full text-[#D4A574] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <Heart className="w-4 h-4 fill-[#D4A574]" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Section>

      {/* Gallery Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-white/80 hover:text-white text-3xl font-light">&times;</button>
          <button onClick={() => setLightboxIndex((lightboxIndex - 1 + WEDDING_DATA.gallery.length) % WEDDING_DATA.gallery.length)}
            className="absolute left-4 p-2 text-white/70 hover:text-white"><ChevronLeft className="w-10 h-10" /></button>
          <img src={WEDDING_DATA.gallery[lightboxIndex]} alt="Gallery" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          <button onClick={() => setLightboxIndex((lightboxIndex + 1) % WEDDING_DATA.gallery.length)}
            className="absolute right-4 p-2 text-white/70 hover:text-white"><ChevronRight className="w-10 h-10" /></button>
        </div>
      )}

      {/* ===== 8. RSVP ===== */}
      <Section>
        <section className="py-24 px-6 bg-[#FDF8F4]">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-12">
              <FloralDivider className="mb-4" />
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Konfirmasi</span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#3D2C2A] mt-2">Kirim Ucapan & Doa Restu</h2>
              <p className="text-xs text-[#8B6F5E] mt-3 max-w-sm mx-auto">Bantu kami mempersiapkan hari istimewa dengan mengonfirmasi kehadiran Anda</p>
            </div>

            <div className="grid grid-cols-1 gap-10">
              {/* Form */}
              <form onSubmit={handleRsvp} className="bg-white p-6 rounded-3xl shadow-sm border border-[#D4A574]/10 space-y-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#8B6F5E] font-bold mb-2">Nama Lengkap</label>
                  <input type="text" required placeholder="Nama Anda" value={rsvpForm.name}
                    onChange={e => setRsvpForm({...rsvpForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-[#FAF0E8] rounded-xl border border-[#D4A574]/10 text-xs focus:outline-none focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] transition-all placeholder:text-[#8B6F5E]/40" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#8B6F5E] font-bold mb-2">Kehadiran</label>
                    <select value={rsvpForm.attendance} onChange={e => setRsvpForm({...rsvpForm, attendance: e.target.value})}
                      className="w-full px-4 py-3 bg-[#FAF0E8] rounded-xl border border-[#D4A574]/10 text-xs focus:outline-none focus:border-[#D4A574] transition-all cursor-pointer">
                      <option value="Hadir">Hadir</option>
                      <option value="Tidak Hadir">Tidak Hadir</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#8B6F5E] font-bold mb-2">Jumlah Tamu</label>
                    <select value={rsvpForm.guests} disabled={rsvpForm.attendance === "Tidak Hadir"}
                      onChange={e => setRsvpForm({...rsvpForm, guests: e.target.value})}
                      className="w-full px-4 py-3 bg-[#FAF0E8] rounded-xl border border-[#D4A574]/10 text-xs focus:outline-none focus:border-[#D4A574] transition-all disabled:opacity-40 cursor-pointer">
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n} Orang</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#8B6F5E] font-bold mb-2">Pesan & Doa</label>
                  <textarea rows="4" required placeholder="Tuliskan ucapan selamat & doa restu..." value={rsvpForm.message}
                    onChange={e => setRsvpForm({...rsvpForm, message: e.target.value})}
                    className="w-full px-4 py-3 bg-[#FAF0E8] rounded-xl border border-[#D4A574]/10 text-xs focus:outline-none focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] transition-all resize-none placeholder:text-[#8B6F5E]/40"></textarea>
                </div>
                <button type="submit" disabled={isSubmitted}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#D4A574] hover:bg-[#3D2C2A] text-white rounded-2xl text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-md disabled:opacity-75">
                  {isSubmitted ? (
                    <><Check className="w-4 h-4" /> Terkirim!</>
                  ) : (
                    <><Send className="w-4 h-4" /> Kirim Ucapan</>
                  )}
                </button>
              </form>

              {/* Wishes list */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#D4A574]/10 flex flex-col h-[400px]">
                <div className="flex items-center justify-between border-b border-[#D4A574]/10 pb-4 mb-4">
                  <span className="font-serif text-sm font-medium text-[#3D2C2A]">
                    <MessageSquare className="w-4 h-4 text-[#D4A574] inline mr-1.5" />
                    Ucapan ({wishes.length})
                  </span>
                  <span className="px-2 py-0.5 bg-[#D4A574]/10 text-[#D4A574] text-[8px] font-bold tracking-widest rounded-full">Terbaru</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
                  {wishes.map((w, idx) => (
                    <div key={idx} className="bg-[#FAF0E8] p-4 rounded-2xl border border-[#D4A574]/5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm font-semibold text-[#3D2C2A]">{w.name}</span>
                        <span className="text-[8px] text-[#8B6F5E]/50 font-medium">{w.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-bold tracking-wider ${
                          w.attendance === 'Hadir' ? 'bg-[#D4A574]/15 text-[#D4A574]' : 'bg-red-50 text-red-500'
                        }`}>{w.attendance}</span>
                        {w.attendance === 'Hadir' && <span className="text-[8px] text-[#8B6F5E]/60">({w.guests} tamu)</span>}
                      </div>
                      <p className="text-xs text-[#8B6F5E] leading-relaxed">{w.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Section>

      {/* ===== 9. GIFTS ===== */}
      <Section>
        <section className="py-24 px-6 bg-[#FAF0E8]">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#D4A574]/10 rounded-full mb-4">
              <Gift className="w-6 h-6 text-[#D4A574]" />
            </div>
            <FloralDivider className="mb-4" />
            <span className="text-[9px] uppercase tracking-[0.4em] text-[#8B6F5E] font-semibold">Tanda Kasih</span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#3D2C2A] mt-2">Kado Digital</h2>
            <p className="text-xs text-[#8B6F5E] mt-3 max-w-sm mx-auto leading-relaxed">
              Doa restu tulus Anda adalah kado terindah. Jika ingin memberi tanda kasih nontunai, silakan salin rekening di bawah.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {WEDDING_DATA.gifts.map((gift, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-[#D4A574]/10 shadow-sm text-left relative overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#D4A574]/8 to-transparent rounded-tr-3xl"></div>
                  <div className="relative z-10">
                    <span className="text-[9px] font-bold text-[#D4A574] uppercase tracking-widest">{gift.bank}</span>
                    <div className="w-6 h-[1px] bg-[#D4A574]/30 my-2"></div>
                    <p className="font-mono text-base font-bold text-[#3D2C2A] tracking-wider">{gift.number}</p>
                    <p className="text-[9px] text-[#8B6F5E] mt-1 uppercase tracking-wide">A/N: {gift.owner}</p>
                    <button onClick={() => copyNum(gift.number, idx)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-[#FAF0E8] hover:bg-[#D4A574] text-[#8B6F5E] hover:text-white rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all duration-300"
                    >
                      {copiedIndex === idx ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Copy className="w-3.5 h-3.5" /> Salin Rekening</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Section>

      {/* ===== 10. FOOTER ===== */}
      <footer className="py-24 px-6 bg-[#3D2C2A] text-[#FDF8F4] relative overflow-hidden">
        {/* Floating flowers bottom */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 opacity-[0.04]"><FlowerSVG className="w-full h-full" /></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 opacity-[0.04]"><FlowerSVG className="w-full h-full" /></div>

        <div className="max-w-xl mx-auto text-center relative z-10 space-y-8">
          <FloralWreath className="w-16 h-16 mx-auto opacity-70" />
          <FloralDivider color="#E8C4C0" />
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#D4A574] font-semibold block">Terima Kasih</span>
          <h2 className="font-serif text-3xl md:text-4xl font-light italic text-[#E8C4C0] leading-snug">
            Suatu kehormatan & kebahagiaan yang tak terhingga apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </h2>
          <div className="w-16 h-[1px] bg-[#D4A574]/40 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-[9px] text-[#D4A574]/70 uppercase tracking-[0.2em]">Kami yang Berbahagia</p>
            <h4 className="font-cursive text-3xl text-[#E8C4C0]">Raka & Dewi</h4>
            <p className="text-[9px] text-[#FDF8F4]/40 uppercase tracking-widest">Beserta Seluruh Keluarga Besar</p>
          </div>
        </div>
        <div className="border-t border-white/5 mt-16 pt-8 text-center text-[8px] text-[#FDF8F4]/30 uppercase tracking-widest">
          <p>© 2027 Raka & Dewi. Floral Invitation Design.</p>
          <p className="mt-1">Crafted with Love, Petals & Endless Joy</p>
        </div>
      </footer>
    </div>
  );
}