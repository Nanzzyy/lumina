import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Send, 
  Gift, 
  Copy, 
  Check, 
  ChevronRight, 
  Camera, 
  Users, 
  MessageSquare,
  Award,
  ChevronDown,
  Sparkles,
  BookOpen,
  Map,
  Music,
  HeartHandshake
} from 'lucide-react';

const injectPremiumStyles = () => {
  if (typeof window !== 'undefined') {
    const styleId = 'wedding-premium-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Montserrat:wght@200;300;400;500;600&family=Sacramento&display=swap');
        
        .font-luxury-serif {
          font-family: 'Cormorant Garamond', serif;
        }
        .font-header-deco {
          font-family: 'Cinzel Decorative', serif;
        }
        .font-sans-clean {
          font-family: 'Montserrat', sans-serif;
        }
        .font-cursive-love {
          font-family: 'Sacramento', cursive;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        @keyframes fadeUpIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleSlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 0.4; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes floatGentle {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        .animate-fade-up {
          animation: fadeUpIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-slow {
          animation: scaleSlow 12s ease-in-out infinite;
        }
        .animate-rotate-slow {
          animation: rotateSlow 30s linear infinite;
        }
        .animate-pulse-ring {
          animation: pulseRing 3s ease-in-out infinite;
        }
        .animate-float-gentle {
          animation: floatGentle 5s ease-in-out infinite;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #142217;
        }
        ::-webkit-scrollbar-thumb {
          background: #c5a85a;
          border-radius: 3px;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

const LuxuryOrnament = ({ className = "w-8 h-8", color = "#D4AF37" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0 C45 25, 25 45, 0 50 C25 55, 45 75, 50 100 C55 75, 75 55, 100 50 C75 45, 55 25, 50 0 Z" fill={color} />
    <circle cx="50" cy="50" r="10" stroke="#FFF" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="4" fill="#FFF" />
  </svg>
);

const SectionDivider = () => (
  <div className="flex items-center justify-center space-x-4 my-8">
    <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
    <LuxuryOrnament className="w-5 h-5 animate-pulse-ring text-[#D4AF37]" />
    <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
  </div>
);

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const [guestName, setGuestName] = useState('Tamu Undangan Spesial');
  const [activeTab, setActiveTab] = useState('pemberkatan');
  const audioRef = useRef(null);

  // Set the target date: April 18, 2027
  const WEDDING_DATE = new Date('2027-04-18T09:00:00');

  // Interactive local states for RSVP & Guest Wishes Feed
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('Hadir');
  const [rsvpGuests, setRsvpGuests] = useState('1');
  const [rsvpWish, setRsvpWish] = useState('');
  const [wishes, setWishes] = useState([
    { name: 'Rangga & Alisha', status: 'Hadir', wish: 'Selamat menempuh hidup baru! Semoga cinta kalian berdua terus mekar bagai bunga di musim semi, saling melengkapi dan bahagia selamanya.', date: 'Baru Saja' },
    { name: 'Sarah Amanda', status: 'Hadir', wish: 'Sangat terharu melihat kisah cinta kalian yang indah ini. Lancar terus sampai hari H ya, can\'t wait to celebrate your big day!', date: '2 jam lalu' },
    { name: 'Bimo Yudhistira', status: 'Tidak Hadir', wish: 'Selamat ya bro! Maaf sekali belum bisa hadir langsung karena masih ada tugas belajar di luar kota. Doa terbaik selalu menyertai kalian.', date: '1 hari lalu' }
  ]);

  useEffect(() => {
    injectPremiumStyles();
    
    // Retrieve custom recipient name from URL parameters (?to=Name)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get('to');
      if (toParam) {
        setGuestName(decodeURIComponent(toParam));
      }
      
      const savedWishes = localStorage.getItem('wedding_wishes');
      if (savedWishes) {
        setWishes(JSON.parse(savedWishes));
      }
    }
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +WEDDING_DATE - +new Date();
      let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      setTimeLeft(newTimeLeft);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, []);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log("Audio play deferred or blocked by browser gesture permissions.");
      });
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    if (!rsvpName.trim() || !rsvpWish.trim()) return;

    const newWish = {
      name: rsvpName,
      status: rsvpStatus,
      wish: rsvpWish,
      date: 'Baru saja'
    };

    const updatedWishes = [newWish, ...wishes];
    setWishes(updatedWishes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wedding_wishes', JSON.stringify(updatedWishes));
    }
    
    setRsvpName('');
    setRsvpWish('');
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  const galleryPhotos = [
    { id: 1, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', desc: 'Sesi Hangat Berdua di Langkah Awal' },
    { id: 2, url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800', desc: 'Sorotan Penuh Komitmen' },
    { id: 3, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800', desc: 'Tawa dan Senyuman Abadi' },
    { id: 4, url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800', desc: 'Pelukan Penuh Kenyamanan' },
    { id: 5, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800', desc: 'Momen Senja di Tepi Pantai' },
    { id: 6, url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800', desc: 'Menatap Masa Depan Bersama' }
  ];

  const loveStories = [
    { year: '2022', title: 'Awal Pertemuan Pertama', desc: 'Dipertemukan secara tak sengaja dalam sebuah proyek pameran seni rupa kontemporer di sudut kota Bandung. Diskusi tentang warna berubah menjadi kecocokan hati yang mendalam.' },
    { year: '2024', title: 'Saling Mengikat Janji', desc: 'Di tengah sejuknya pegunungan Ciwidey, kami berkomitmen untuk menapaki jalan kehidupan beriringan, membangun mimpi bersama dalam suka maupun duka.' },
    { year: '2026', title: 'Momen Lamaran Resmi', desc: 'Dengan restu serta doa yang tulus dari kedua belah pihak keluarga, kami mengesahkan keputusan hati kami untuk melangkah ke jenjang mahligai pernikahan.' }
  ];

  if (!isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-[#111e14] text-[#E5D5B8] p-6 text-center font-sans-clean overflow-hidden">
        <div className="absolute inset-4 md:inset-8 border border-[#c5a85a]/40 pointer-events-none rounded-lg z-10"></div>
        <div className="absolute inset-5 md:inset-10 border border-[#c5a85a]/10 pointer-events-none rounded-lg z-10"></div>
        
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
          <div className="w-[120vw] h-[120vw] border-[40px] border-[#D4AF37] rounded-full animate-rotate-slow"></div>
        </div>

        <div className="mt-12 space-y-3 z-20">
          <span className="text-[10px] md:text-xs tracking-[0.4em] text-[#D4AF37] uppercase font-bold">The Wedding Invitation</span>
          <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto"></div>
        </div>

        <div className="my-auto max-w-2xl z-20 space-y-8 px-4">
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#A6C3AF] font-medium block">Pernikahan Agung & Mulia</span>
          
          <h1 className="text-5xl md:text-7xl font-luxury-serif font-light tracking-wide text-white leading-snug">
            Kaelan <span className="font-cursive-love text-4xl md:text-6xl text-[#D4AF37] block md:inline md:mx-4 my-2">&</span> Amanda
          </h1>
          
          <p className="text-xs text-[#A6C3AF] italic leading-relaxed max-w-sm mx-auto font-luxury-serif">
            "Sebab apa yang dipersatukan dengan cinta yang tulus, akan senantiasa diberkahi kelimpahan selamanya."
          </p>
          
          <div className="pt-8 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-[#A6C3AF] block font-medium">Spesial Untuk Yth. Bapak/Ibu/Saudara/i:</span>
            <div className="bg-white/5 backdrop-blur-md border border-[#c5a85a]/40 rounded-2xl p-6 px-10 inline-block shadow-2xl relative group">
              <span className="font-luxury-serif text-2xl md:text-3xl font-light text-white block tracking-wide">{guestName}</span>
              <span className="text-[9px] text-[#D4AF37] uppercase tracking-widest mt-2 block font-semibold">Tamu Kehormatan Kami</span>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleOpenInvitation}
              className="px-10 py-4 bg-[#D4AF37] hover:bg-white text-[#111e14] font-semibold rounded-full shadow-2xl hover:shadow-[#D4AF37]/20 transition-all duration-300 transform hover:-translate-y-1 tracking-[0.2em] text-xs uppercase flex items-center gap-3 mx-auto"
            >
              <Heart className="w-4 h-4 fill-current animate-pulse" />
              Buka Undangan
            </button>
          </div>
        </div>

        <div className="mb-10 z-20">
          <p className="text-[10px] text-[#A6C3AF] tracking-[0.3em] uppercase">#KaelanAmandaStory</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1D2A1F] font-sans-clean relative selection:bg-[#D4AF37]/20 selection:text-[#111e14] overflow-x-hidden">
      
      {/* Background Soft Loop Romantic Classical Sound Source */}
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
        loop
      />

      {/* Floating Audio Ambient Widget (Top Right) */}
      <button 
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 p-4 bg-white/95 backdrop-blur-md text-[#111e14] border border-[#D4AF37]/40 rounded-full shadow-2xl hover:bg-[#111e14] hover:text-white transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        aria-label="Toggle Background Music"
      >
        {isPlaying ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#111e14] group-hover:text-white hidden md:inline pl-1">Mute</span>
            <Volume2 className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#111e14] group-hover:text-white hidden md:inline pl-1">Play</span>
            <VolumeX className="w-5 h-5 text-red-500" />
          </div>
        )}
      </button>

      {/* ==================== 1. HERO SECTION ==================== */}
      {}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#142217] to-[#1D2A1F] text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none scale-105 animate-scale-slow">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600" 
            alt="Hero Wedding Background" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[#D4AF37]/60 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[#D4AF37]/60 rounded-tr-lg pointer-events-none"></div>
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[#D4AF37]/60 rounded-bl-lg pointer-events-none"></div>
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[#D4AF37]/60 rounded-br-lg pointer-events-none"></div>

        <div className="container mx-auto px-6 py-24 text-center relative z-10 flex flex-col justify-between min-h-[85vh]">
          <div className="space-y-3 animate-fade-up">
            <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-semibold block">The Wedding Celebration</span>
            <SectionDivider />
          </div>

          <div className="my-auto space-y-6">
            <span className="text-xs md:text-sm tracking-[0.3em] uppercase text-[#A6C3AF] font-medium block">MEMINTA RESTU DAN BERKAH</span>
            <h1 className="text-6xl md:text-8xl font-luxury-serif font-light text-white tracking-wider leading-tight">
              Kaelan <span className="font-cursive-love text-5xl md:text-7xl text-[#D4AF37] block md:inline md:mx-4 my-2">dan</span> Amanda
            </h1>
            <p className="text-xs md:text-sm tracking-[0.25em] uppercase text-[#D4AF37] font-semibold">
              Minggu, 18 April 2027 • Bandung, Jawa Barat
            </p>
          </div>

          <div className="space-y-4 animate-bounce">
            <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Gulir Ke Bawah</p>
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#D4AF37] to-transparent mx-auto"></div>
          </div>
        </div>
      </section>

      {/* ==================== 2. QUOTE SECTION ==================== */}
      {}
      <section className="py-28 bg-[#faf7f0] border-y border-[#D4AF37]/20 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-48 h-48 opacity-[0.07] text-[#111e14] pointer-events-none">
          <LuxuryOrnament className="w-full h-full" />
        </div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 opacity-[0.07] text-[#111e14] pointer-events-none">
          <LuxuryOrnament className="w-full h-full" />
        </div>

        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <HeartHandshake className="w-10 h-10 text-[#D4AF37] mx-auto mb-8 stroke-[1]" />
          
          <h3 className="font-luxury-serif text-[#111e14] text-xs uppercase tracking-[0.3em] mb-8 font-semibold">QS. Ar-Rum Ayat 21</h3>
          
          <p className="font-luxury-serif text-2xl md:text-3xl italic leading-relaxed text-[#1D2A1F] font-light px-4">
            "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang."
          </p>
          
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto my-8"></div>
          
          <p className="text-xs md:text-sm leading-relaxed text-gray-600 max-w-xl mx-auto font-sans-clean">
            Sebuah komitmen suci berlandaskan cinta yang mulia, janji sepasang kekasih untuk meniti hari depan bersama penuh rasa syukur, keikhlasan, dan kebahagiaan tanpa akhir.
          </p>
        </div>
      </section>

      {/* ==================== 3. COUNTDOWN SECTION ==================== */}
      {}
      <section className="py-28 bg-gradient-to-b from-[#142217] to-[#121c15] text-white relative">
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-semibold block mb-2">The Golden Moments</span>
          <h2 className="font-luxury-serif text-3xl md:text-5xl text-white tracking-wide font-light mb-4">Waktu yang Dinanti</h2>
          <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto mb-14"></div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: timeLeft.days, label: 'Hari Bahagia' },
              { value: timeLeft.hours, label: 'Jam Mulia' },
              { value: timeLeft.minutes, label: 'Menit Menuju' },
              { value: timeLeft.seconds, label: 'Detik Berlalu' }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col justify-center transform hover:-translate-y-2 transition-all duration-500 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <span className="text-5xl md:text-6xl font-luxury-serif font-light text-[#D4AF37] leading-none mb-3">
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#A6C3AF] font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <a 
              href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+Kaelan+%26+Amanda&dates=20270418T090000Z/20270418T210000Z&details=Undangan+Pernikahan+Kaelan+dan+Amanda+di+Bandung&location=Bandung,+Jawa+Barat&sf=true&output=xml"
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#D4AF37] hover:bg-white text-[#111e14] rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-xl"
            >
              <Calendar className="w-4 h-4" /> Simpan Agenda ke Kalender
            </a>
          </div>
        </div>
      </section>

      {/* ==================== 4. BRIDE & GROOM PROFILE ==================== */}
      {}
      <section className="py-28 bg-[#FDFBF7] relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-24">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Tunas Cinta</span>
            <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">Kedua Mempelai</h2>
            <SectionDivider />
          </div>

          <div className="grid md:grid-cols-2 gap-20 lg:gap-24 items-center">
            
            {/* Mempelai Pria */}
            <div className="text-center space-y-6 flex flex-col items-center">
              <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full p-2 border border-[#D4AF37] shadow-xl group overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600" 
                    alt="Kaelan Rayhan Wardana" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-[#111e14] p-2.5 rounded-full border border-[#D4AF37]">
                  <LuxuryOrnament className="w-4 h-4" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-luxury-serif text-3xl font-light text-[#111e14]">Kaelan Rayhan Wardana, S.T.</h3>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] font-bold block">Mempelai Pria</span>
              </div>
              
              <div className="text-xs leading-relaxed text-gray-600 max-w-sm">
                <p className="font-semibold text-gray-800">Putra Pertama Dari Keluarga:</p>
                <p className="font-luxury-serif text-base italic text-[#1D2A1F] mt-1">
                  Bapak Ir. Hermawan Wardana & Ibu Dra. Retno Astuti
                </p>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-2">Dago, Bandung</p>
              </div>
            </div>

            {/* Mempelai Wanita */}
            <div className="text-center space-y-6 flex flex-col items-center">
              <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full p-2 border border-[#D4AF37] shadow-xl group overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600" 
                    alt="Amanda Citra Kirana" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-4 left-4 bg-[#111e14] p-2.5 rounded-full border border-[#D4AF37]">
                  <LuxuryOrnament className="w-4 h-4" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-luxury-serif text-3xl font-light text-[#111e14]">Amanda Citra Kirana, M.Ds.</h3>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] font-bold block">Mempelai Wanita</span>
              </div>
              
              <div className="text-xs leading-relaxed text-gray-600 max-w-sm">
                <p className="font-semibold text-gray-800">Putri Sulung Dari Keluarga:</p>
                <p className="font-luxury-serif text-base italic text-[#1D2A1F] mt-1">
                  Bapak Dr. Achmad Hidayat & Ibu Sitti Maryam, M.Pd.
                </p>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-2">Sukajadi, Bandung</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 5. STORY SECTION ==================== */}
      {}
      <section className="py-28 bg-[#faf7f0] relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-20">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold font-sans-clean">Kisah Kasih</span>
            <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">Cerita Cinta Kami</h2>
            <SectionDivider />
          </div>

          <div className="relative border-l border-[#D4AF37]/40 ml-4 md:ml-36 space-y-16">
            {loveStories.map((story, index) => (
              <div key={index} className="relative pl-8 md:pl-16 group">
                <span className="absolute -left-[13px] top-2 flex items-center justify-center w-6 h-6 rounded-full bg-[#111e14] border-2 border-[#D4AF37] text-white ring-8 ring-[#faf7f0] transition-colors duration-300 group-hover:bg-[#D4AF37]">
                  <Heart className="w-2.5 h-2.5 fill-current text-white" />
                </span>

                <span className="hidden md:block absolute -left-36 top-1 text-right w-24 font-luxury-serif text-2xl text-[#111e14] font-medium tracking-wide">
                  {story.year}
                </span>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#D4AF37]/20 hover:shadow-xl hover:border-[#D4AF37]/50 transition-all duration-500 transform hover:-translate-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span className="md:hidden text-[10px] font-bold text-[#111e14] bg-[#D4AF37]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                      {story.year}
                    </span>
                    <h4 className="font-luxury-serif text-xl font-medium text-[#111e14]">
                      {story.title}
                    </h4>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed text-gray-600 font-light">
                    {story.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. GALLERY SECTION ==================== */}
      {}
      <section className="py-28 bg-white relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-20">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Keabadian Lensa</span>
            <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">Galeri Prewedding</h2>
            <SectionDivider />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryPhotos.map((photo) => (
              <div 
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="relative overflow-hidden aspect-[3/4] rounded-2xl cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <img 
                  src={photo.url} 
                  alt={photo.desc} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111e14]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="text-white text-xs font-medium space-y-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-2 text-[#D4AF37]">
                      <Camera className="w-4 h-4" />
                      <span className="uppercase tracking-widest text-[9px] font-bold">Zoom Photo</span>
                    </div>
                    <p className="font-luxury-serif text-sm tracking-wide text-gray-200">{photo.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {activePhoto && (
          <div 
            className="fixed inset-0 z-50 bg-[#111e14]/95 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fade-up"
            onClick={() => setActivePhoto(null)}
          >
            <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <img 
                src={activePhoto.url} 
                alt={activePhoto.desc} 
                className="w-full h-auto max-h-[70vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
              />
              <p className="text-[#D4AF37] font-luxury-serif text-center mt-6 text-sm tracking-widest uppercase font-medium">{activePhoto.desc}</p>
              
              <button 
                onClick={() => setActivePhoto(null)}
                className="mt-6 px-6 py-2 border border-white/20 hover:border-white text-white/80 hover:text-white rounded-full text-xs uppercase tracking-widest transition-colors duration-300"
              >
                Tutup Galeri
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ==================== 7. TIMELINE / RUN-DOWN SECTION ==================== */}
      {}
      <section className="py-28 bg-[#faf7f0] relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Momen Istimewa</span>
            <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">Agenda Acara</h2>
            <SectionDivider />
          </div>

          <div className="flex justify-center space-x-4 mb-12 max-w-md mx-auto">
            {['pemberkatan', 'resepsi'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 border text-center ${
                  activeTab === tab 
                    ? 'bg-[#111e14] text-white border-[#111e14] shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AF37]'
                }`}
              >
                {tab === 'pemberkatan' ? 'Pemberkatan / Akad' : 'Resepsi Mulia'}
              </button>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            {activeTab === 'pemberkatan' && (
              <div className="bg-white rounded-3xl p-10 shadow-md border border-[#D4AF37]/20 text-center space-y-8 animate-fade-up">
                <div className="space-y-3">
                  <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="font-luxury-serif text-3xl font-light text-[#111e14]">Akad & Pemberkatan Pernikahan</h3>
                  <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 border-y border-gray-100 py-6">
                  <div className="space-y-2 flex flex-col items-center">
                    <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-semibold text-gray-800">Hari & Tanggal</span>
                    <span className="text-sm">Minggu, 18 April 2027</span>
                  </div>
                  <div className="space-y-2 flex flex-col items-center">
                    <Clock className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-semibold text-gray-800">Pukul / Waktu</span>
                    <span className="text-sm">09:00 - 11:00 WIB</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <MapPin className="w-5 h-5 text-[#D4AF37] mx-auto" />
                  <span className="font-semibold text-xs text-gray-800 block">Tempat Acara</span>
                  <p className="text-xs leading-relaxed max-w-sm mx-auto text-gray-600">
                    Masjid Raya Al-Jabbar, Jl. Cimincrang No.14, Gedebage, Kota Bandung, Jawa Barat
                  </p>
                </div>

                <div className="pt-4">
                  <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-4 py-1.5 rounded-full">
                    Khusus Keluarga Inti & Saksi
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'resepsi' && (
              <div className="bg-white rounded-3xl p-10 shadow-md border border-[#D4AF37]/20 text-center space-y-8 animate-fade-up">
                <div className="space-y-3">
                  <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-luxury-serif text-3xl font-light text-[#111e14]">Resepsi Agung Pernikahan</h3>
                  <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 border-y border-gray-100 py-6">
                  <div className="space-y-2 flex flex-col items-center">
                    <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-semibold text-gray-800">Hari & Tanggal</span>
                    <span className="text-sm">Minggu, 18 April 2027</span>
                  </div>
                  <div className="space-y-2 flex flex-col items-center">
                    <Clock className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-semibold text-gray-800">Pukul / Waktu</span>
                    <span className="text-sm">12:30 - 16:30 WIB</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <MapPin className="w-5 h-5 text-[#D4AF37] mx-auto" />
                  <span className="font-semibold text-xs text-gray-800 block">Tempat Acara</span>
                  <p className="text-xs leading-relaxed max-w-sm mx-auto text-gray-600">
                    Grand Ballroom Pullman Bandung Grand Central, Jl. Diponegoro No.27, Cibeunying Kaler, Kota Bandung
                  </p>
                </div>

                <div className="pt-4">
                  <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-4 py-1.5 rounded-full">
                    Terbuka Untuk Semua Segenap Tamu
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== 8. MAPS SECTION ==================== */}
      {}
      <section className="py-28 bg-white relative">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Navigasi Lokasi</span>
            <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">Peta Penunjuk Jalan</h2>
            <SectionDivider />
          </div>

          <div className="bg-[#faf7f0] rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-xl mb-10 p-2">
            <iframe 
              title="Lokasi Resepsi Pullman Bandung"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9161642879555!2d107.61864117581335!3d-6.90062366752763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e7f8e83b8b6d%3A0xc665123fc8708fa8!2sPullman%20Bandung%20Grand%20Central!5e0!3m2!1sid!2sid!4v1715694200000!5m2!1sid!2sid" 
              width="100%" 
              height="400" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-80 md:h-96 rounded-2xl"
            ></iframe>
          </div>

          <a 
            href="https://maps.app.goo.gl/uP4V5qL16j7uB7Y78" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#111e14] hover:bg-[#D4AF37] hover:text-[#111e14] text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 tracking-wider text-xs uppercase"
          >
            <Map className="w-4 h-4" /> Buka di Google Maps
          </a>
        </div>
      </section>

      {/* ==================== 9. RSVP SECTION & GUEST BOOK ==================== */}
      {}
      <section className="py-28 bg-[#faf7f0] relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Konfirmasi Presensi</span>
            <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">RSVP & Kirim Ucapan</h2>
            <SectionDivider />
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <form onSubmit={handleRsvpSubmit} className="lg:col-span-5 bg-white rounded-3xl p-8 shadow-md border border-[#D4AF37]/25 space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-bold font-sans-clean">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Contoh: Budi Sudarsono"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all bg-[#faf8f4]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-bold font-sans-clean">Pernyataan Kehadiran</label>
                <div className="grid grid-cols-2 gap-4">
                  {['Hadir', 'Tidak Hadir'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setRsvpStatus(opt)}
                      className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        rsvpStatus === opt 
                          ? 'bg-[#111e14] text-white border-[#111e14]' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-[#faf8f4]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {rsvpStatus === 'Hadir' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-bold font-sans-clean">Jumlah Kehadiran</label>
                  <div className="relative">
                    <select
                      value={rsvpGuests}
                      onChange={(e) => setRsvpGuests(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all bg-[#faf8f4] appearance-none"
                    >
                      <option value="1">1 Orang</option>
                      <option value="2">2 Orang</option>
                      <option value="3">3 Orang</option>
                      <option value="4">4 Orang</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-bold font-sans-clean">Pesan & Doa Restu</label>
                <textarea 
                  required
                  rows="4"
                  value={rsvpWish}
                  onChange={(e) => setRsvpWish(e.target.value)}
                  placeholder="Tulis ucapan selamat, kesan, & doa terbaik untuk kami..."
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all bg-[#faf8f4]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#D4AF37] hover:bg-[#111e14] text-white font-semibold rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Kirim Konfirmasi Kehadiran
              </button>
            </form>

            <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-md border border-[#D4AF37]/25 flex flex-col h-[520px]">
              <h4 className="font-luxury-serif text-lg font-bold text-[#111e14] mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D4AF37]" /> 
                <span>Doa & Harapan Tercinta ({wishes.length})</span>
              </h4>
              <div className="overflow-y-auto space-y-4 pr-2 flex-1 scrollbar-thin">
                {wishes.map((item, index) => (
                  <div key={index} className="bg-[#faf8f4] p-5 rounded-2xl border border-gray-100 relative group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-luxury-serif text-sm font-semibold text-[#111e14]">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          item.status === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-[9px] text-gray-400 font-light">{item.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-light">{item.wish}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 10. DIGITAL GIFTS / ANGPAO SECTION ==================== */}
      {}
      <section className="py-28 bg-white relative">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold">Tanda Kasih</span>
            <h2 className="font-luxury-serif text-3xl md:text-5xl text-[#111e14] mt-2 tracking-wide font-light">Kado Pernikahan</h2>
            <SectionDivider />
          </div>

          <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-lg mx-auto mb-12">
            Restu tulus Anda di hari bahagia merupakan hadiah terindah bagi kami. Namun bagi Anda yang ingin berkirim tanda kasih sebagai tanda do'a restu, silakan salin nomor rekening di bawah ini:
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-[#faf7f0] border border-[#D4AF37]/30 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-left space-y-4">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block">Transfer Elektronik</span>
                <p className="font-luxury-serif text-2xl font-semibold text-[#111e14]">Bank Central Asia (BCA)</p>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-inner">
                  <span className="font-mono text-sm tracking-wider text-[#111e14] font-semibold">7810592811</span>
                  <button 
                    onClick={() => copyToClipboard('7810592811', 1)}
                    className="text-xs flex items-center gap-1.5 text-[#D4AF37] hover:text-[#111e14] font-bold uppercase tracking-wider"
                  >
                    {copiedIndex === 1 ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copiedIndex === 1 ? 'Selesai' : 'Salin'}
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  <span className="block font-medium text-gray-600">Atas Nama Rekening:</span>
                  <span>Kaelan Rayhan Wardana</span>
                </div>
              </div>
            </div>

            <div className="bg-[#faf7f0] border border-[#D4AF37]/30 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-left space-y-4">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block">Transfer Elektronik</span>
                <p className="font-luxury-serif text-2xl font-semibold text-[#111e14]">Bank Mandiri</p>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-inner">
                  <span className="font-mono text-sm tracking-wider text-[#111e14] font-semibold">1320098711102</span>
                  <button 
                    onClick={() => copyToClipboard('1320098711102', 2)}
                    className="text-xs flex items-center gap-1.5 text-[#D4AF37] hover:text-[#111e14] font-bold uppercase tracking-wider"
                  >
                    {copiedIndex === 2 ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copiedIndex === 2 ? 'Selesai' : 'Salin'}
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  <span className="block font-medium text-gray-600">Atas Nama Rekening:</span>
                  <span>Amanda Citra Kirana</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 11. FOOTER ==================== */}
      {}
      <footer className="py-20 bg-[#111e14] text-white relative text-center">
        <div className="absolute bottom-6 left-6 w-16 h-16 opacity-10">
          <LuxuryOrnament className="w-full h-full text-white" />
        </div>
        <div className="absolute bottom-6 right-6 w-16 h-16 opacity-10">
          <LuxuryOrnament className="w-full h-full text-white" />
        </div>

        <div className="container mx-auto px-6 max-w-3xl space-y-8 relative z-10">
          <h4 className="font-luxury-serif text-3xl font-light text-[#D4AF37] tracking-widest leading-none">Kaelan & Amanda</h4>
          
          <p className="text-xs leading-relaxed max-w-md mx-auto text-[#A6C3AF] font-light">
            Merupakan kehormatan serta kebahagiaan yang tak terhingga bagi kami sekeluarga, apabila Bapak/Ibu/Saudara/i sekalian berkenan hadir memberikan doa restu yang tulus bagi perjalanan hidup baru kami.
          </p>

          <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-bold">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>

          <div className="w-20 h-[1px] bg-[#D4AF37]/30 mx-auto"></div>

          <p className="text-[10px] text-[#A6C3AF] tracking-wider font-sans-clean font-light">
            © 2027 Kaelan & Amanda. Crafted with absolute premium love & responsiveness. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}