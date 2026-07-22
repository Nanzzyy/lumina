import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  Music, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Mail, 
  Gift, 
  Users, 
  MessageSquare,
  ArrowRight,
  Info,
  Map,
  BookOpen
} from 'lucide-react';

const injectThemeAndFonts = () => {
  if (typeof window !== 'undefined') {
    const linkId = 'wedding-theme-terracotta';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Italiana&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(link);

      const style = document.createElement('style');
      style.innerHTML = `
        .font-serif-terracotta { font-family: 'Italiana', Georgia, serif; }
        .font-sans-terracotta { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        /* Smooth Custom Animations */
        @keyframes floating-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        .animate-float-gentle {
          animation: floating-gentle 6s ease-in-out infinite;
        }

        @keyframes wave-organic {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 30% / 50% 60% 30% 70%; }
        }
        .animate-wave-organic {
          animation: wave-organic 8s ease-in-out infinite;
        }

        /* Hide scrollbars but keep functionality */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Custom Arch Shape */
        .arch-clip {
          border-radius: 120px 120px 24px 24px;
        }
        .arch-clip-reverse {
          border-radius: 24px 24px 120px 120px;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

const WEDDING_DATA = {
  groom: {
    nickname: "Dimas",
    fullName: "Dimas Anggara, S.Ars.",
    father: "Bpk. Dr. H. Setiawan Anggara",
    mother: "Ibu Hj. Ratna Ningsih, M.Pd.",
    instagram: "@dimas_anggara",
    desc: "Seorang arsitek yang percaya bahwa keindahan terbaik adalah merancang masa depan yang penuh cinta bersama orang yang tepat."
  },
  bride: {
    nickname: "Sarah",
    fullName: "Sarah Amalia, M.B.A.",
    father: "Bpk. Ir. Ahmad Basuki",
    mother: "Ibu Dra. Maria Shinta",
    instagram: "@sarah_amalia",
    desc: "Wirausaha muda di bidang kreatif yang meyakini bahwa setiap langkah hidup adalah kanvas kosong yang siap dilukis dengan harmoni."
  },
  date: "2026-10-10T10:00:00", // Target Countdown
  displayDate: "Sabtu, 10 Oktober 2026",
  quote: {
    text: "True love stories never have endings. Together, we are creating a sanctuary built with trust, respect, and boundless laughter.",
    source: "Sarah & Dimas"
  },
  events: [
    {
      id: "akad",
      title: "Akad Nikah",
      time: "09:00 - 11:00 WIB",
      venue: "Royal Glass Pavilion, Plataran",
      address: "Hutan Kota by Plataran, Senayan, Jakarta Pusat",
      gmaps: "https://maps.google.com",
      note: "Khusus keluarga inti dan kerabat dekat dengan protokol privat."
    },
    {
      id: "resepsi",
      title: "Resepsi Pernikahan",
      time: "12:00 - 15:00 WIB",
      venue: "Grand Terracotta Garden",
      address: "Hutan Kota by Plataran, Senayan, Jakarta Pusat",
      gmaps: "https://maps.google.com",
      note: "Sangat disarankan mengenakan dresscode bernuansa Earth Tone / Terracotta."
    }
  ],
  stories: [
    {
      year: "2020",
      title: "The Coffee Encounter",
      desc: "Pertemuan tidak sengaja di sebuah kedai kopi berarsitektur minimalis di Bandung. Dimas sedang mendesain proyek, sementara Sarah sedang menganalisis rencana bisnisnya. Secangkir kopi menyatukan pandangan pertama kami."
    },
    {
      year: "2023",
      title: "Two Cities, One Goal",
      desc: "Menjalani hubungan jarak jauh karena studi Sarah di luar negeri membuat kami mengerti bahwa kepercayaan dan komunikasi yang tulus adalah fondasi paling kuat dalam cinta."
    },
    {
      year: "2025",
      title: "Under The Tuscan Sun",
      desc: "Dalam perjalanan musim gugur, di bawah lengkungan arsitektur klasik Tuscany, Dimas memantapkan komitmennya untuk meminang Sarah menjadi pendamping seumur hidupnya."
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
    {
      bank: "Bank Mandiri",
      number: "1180023491820",
      owner: "Dimas Anggara"
    },
    {
      bank: "Bank BCA",
      number: "0359871120",
      owner: "Sarah Amalia"
    }
  ],
  audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
};

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan Istimewa");
  const [activeTab, setActiveTab] = useState("akad");
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // RSVP Form States
  const [rsvpForm, setRsvpForm] = useState({ name: '', guests: '1', attendance: 'Hadir', message: '' });
  const [wishes, setWishes] = useState([
    { name: "Andhika Pratama", guests: "2", attendance: "Hadir", message: "Selamat menempuh hidup baru Dimas & Sarah! Menunggu undangan ini dari tahun lalu, bahagia selalu!", time: "3 jam yang lalu" },
    { name: "Jessica Mila", guests: "1", attendance: "Hadir", message: "So happy for you guys! Doa terbaik dari jauh, semoga lancar terus acaranya ya.", time: "1 hari yang lalu" }
  ]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    injectThemeAndFonts();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const to = params.get('to');
      if (to) {
        setGuestName(decodeURIComponent(to));
      }
    }
  }, []);

  useEffect(() => {
    const targetDate = new Date(WEDDING_DATA.date).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(error => console.log("Audio play error:", error));
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log(err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    if (!rsvpForm.name.trim() || !rsvpForm.message.trim()) return;

    const newWish = {
      name: rsvpForm.name,
      guests: rsvpForm.guests,
      attendance: rsvpForm.attendance,
      message: rsvpForm.message,
      time: "Baru saja"
    };

    setWishes([newWish, ...wishes]);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setRsvpForm({ name: '', guests: '1', attendance: 'Hadir', message: '' });
    }, 2500);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="font-sans-terracotta bg-[#FBF7F4] text-[#4E3629] min-h-screen relative selection:bg-[#D27C5C] selection:text-white overflow-x-hidden">
      
      {/* Audio element */}
      <audio ref={audioRef} src={WEDDING_DATA.audioUrl} loop />

      {}
      {/* 1. COVER SCREEN (Asymmetric Arch Layout) */}
      <div className={`fixed inset-0 z-50 flex flex-col md:flex-row transition-all duration-1000 ease-in-out ${isOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        {/* Left Side: Editorial Banner */}
        <div className="w-full md:w-1/2 bg-[#D27C5C] flex flex-col justify-between p-8 md:p-16 text-[#FBF7F4] relative overflow-hidden">
          {/* Subtle Arch Decor behind */}
          <div className="absolute -bottom-20 -left-20 w-80 h-[400px] border border-[#FBF7F4]/20 rounded-t-full pointer-events-none"></div>
          
          <div className="relative z-10">
            <span className="text-xs uppercase tracking-[0.3em] opacity-80 font-semibold">The Wedding Celebration</span>
          </div>

          <div className="my-auto py-12 relative z-10">
            <h1 className="text-5xl md:text-7xl font-serif-terracotta tracking-wide leading-none">
              {WEDDING_DATA.groom.nickname}<br/>
              <span className="text-3xl md:text-5xl opacity-60 italic">&</span> {WEDDING_DATA.bride.nickname}
            </h1>
            <p className="text-sm tracking-[0.25em] uppercase opacity-90 mt-6 font-light">10 . 10 . 2026</p>
          </div>

          <div className="relative z-10 text-xs opacity-60">
            © 2026 Dimas & Sarah. All rights reserved.
          </div>
        </div>

        {/* Right Side: Welcome Card */}
        <div className="w-full md:w-1/2 bg-[#FBF7F4] flex flex-col justify-center items-center p-8 md:p-16 relative">
          <div className="absolute top-8 right-8 w-16 h-16 border border-[#D27C5C]/10 rounded-full flex items-center justify-center text-[#D27C5C] font-serif-terracotta italic text-xl">S&D</div>
          
          <div className="max-w-md w-full text-center space-y-8 z-10">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-bold">Kpd. Yth Bapak/Ibu/Saudara/i</span>
              <h2 className="text-2xl md:text-3xl font-serif-terracotta text-[#4E3629] border-b border-[#D27C5C]/20 pb-4 max-w-xs mx-auto italic">{guestName}</h2>
            </div>
            
            <p className="text-xs text-[#4E3629]/70 leading-relaxed max-w-sm mx-auto">
              Dengan penuh ketulusan, kami mengundang Anda untuk hadir menyaksikan ikatan janji suci dan merayakan momen kebahagiaan kami.
            </p>

            <button 
              onClick={handleOpenInvitation}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-[#D27C5C] hover:bg-[#b05f41] text-white font-medium text-xs uppercase tracking-[0.2em] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 cursor-pointer group"
            >
              <Mail className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Buka Undangan</span>
            </button>
          </div>

          {/* Organic bottom-right shape */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#F0D3C5]/40 animate-wave-organic pointer-events-none"></div>
        </div>
      </div>

      {/* FLOATING MUSIC MANAGER */}
      {isOpen && (
        <button 
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-[#D27C5C] text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-[#FBF7F4] group"
        >
          {isPlaying ? (
            <div className="relative flex items-center justify-center">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-white/40 opacity-75"></span>
              <Volume2 className="w-5 h-5" />
            </div>
          ) : (
            <VolumeX className="w-5 h-5 text-white/80" />
          )}
        </button>
      )}

      {}
      {/* 2. HERO SECTION (Magazine Editorial Style) */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-12 bg-[#FBF7F4]">
        {/* Subtle Arch Frames in Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex justify-around items-end">
          <div className="w-72 h-[600px] border-[3px] border-[#D27C5C] rounded-t-full"></div>
          <div className="w-96 h-[800px] border-[3px] border-[#D27C5C] rounded-t-full hidden md:block"></div>
        </div>

        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Block: Asymmetric Names */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-block px-4 py-1 rounded-full bg-[#F0D3C5] text-[#D27C5C] text-xs font-semibold uppercase tracking-widest">
              Save Our Date
            </span>
            <h2 className="text-6xl md:text-8xl font-serif-terracotta text-[#4E3629] leading-none tracking-wide">
              {WEDDING_DATA.groom.nickname}<br/>
              <span className="text-3xl md:text-5xl text-[#D27C5C] font-light italic">&</span> {WEDDING_DATA.bride.nickname}
            </h2>
            <div className="w-16 h-[2px] bg-[#D27C5C] mx-auto lg:mx-0 my-6"></div>
            <p className="text-sm tracking-[0.3em] text-[#4E3629]/70 uppercase font-medium">
              {WEDDING_DATA.displayDate}
            </p>
          </div>

          {/* Right Block: Double Arch Portrait Frame */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-64 md:w-80 h-96 md:h-[450px] arch-clip overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800" 
                alt="Main portrait"
                className="w-full h-full object-cover grayscale-[15%] contrast-[102%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4E3629]/40 to-transparent"></div>
            </div>
            {/* Absolute mini badge */}
            <div className="absolute -bottom-4 -left-4 bg-[#D27C5C] text-[#FBF7F4] p-5 rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-lg border-2 border-white animate-float-gentle">
              <Heart className="w-5 h-5 fill-white" />
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Union</span>
            </div>
          </div>
        </div>
      </section>

      {}
      {/* 3. QUOTE SECTION */}
      <section className="py-24 px-6 md:px-12 bg-[#FBF7F4] relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="text-4xl text-[#D27C5C] font-serif-terracotta mb-6">“</div>
          <p className="text-xl md:text-2xl leading-relaxed text-[#4E3629] font-serif-terracotta italic font-light px-4 max-w-2xl mx-auto">
            {WEDDING_DATA.quote.text}
          </p>
          <span className="block h-[1px] w-12 bg-[#D27C5C]/40 mx-auto my-6"></span>
          <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D27C5C]">
            — {WEDDING_DATA.quote.source}
          </h4>
        </div>
        <div className="absolute top-1/2 left-6 w-12 h-12 bg-[#F0D3C5]/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/2 right-6 w-16 h-16 bg-[#D27C5C]/10 rounded-full blur-xl"></div>
      </section>

      {}
      {/* 4. COUNTDOWN SECTION */}
      <section className="py-20 px-6 bg-[#FBF7F4]">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#D27C5C] mb-2 font-bold">Countdown</h3>
          <h2 className="text-3xl md:text-4xl font-serif-terracotta text-[#4E3629] mb-12">Menuju Hari Bahagia</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {/* Countdown Cards */}
            {[
              { label: "Hari", val: countdown.days },
              { label: "Jam", val: countdown.hours },
              { label: "Menit", val: countdown.minutes },
              { label: "Detik", val: countdown.seconds, highlight: true }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-[#D27C5C]/10 flex flex-col items-center relative overflow-hidden group">
                <div className={`absolute inset-x-0 bottom-0 h-1 transition-all duration-300 ${item.highlight ? 'bg-[#D27C5C]' : 'bg-[#F0D3C5]'}`}></div>
                <span className={`text-4xl md:text-5xl font-serif-terracotta font-semibold ${item.highlight ? 'text-[#D27C5C]' : 'text-[#4E3629]'}`}>
                  {String(item.val).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#4E3629]/50 mt-3 font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      {/* 5. MEMPELAI SECTION (Asymmetrical Arch Cutouts) */}
      <section className="py-24 px-6 md:px-12 bg-[#FBF7F4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">The Couple</span>
            <h2 className="text-4xl font-serif-terracotta text-[#4E3629] mt-2">Mempelai Pernikahan</h2>
            <p className="text-xs text-[#4E3629]/60 max-w-md mx-auto mt-3">
              Memohon doa dan restu keluarga, kerabat, serta sahabat sekalian untuk mengiringi langkah suci kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-center">
            
            {/* Groom Profile */}
            <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-6 group">
              <div className="relative w-64 h-80 arch-clip overflow-hidden shadow-xl border-4 border-white transform transition-transform duration-500 group-hover:scale-[1.02]">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600" 
                  alt="Dimas Anggara"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-3xl font-serif-terracotta text-[#4E3629]">{WEDDING_DATA.groom.fullName}</h3>
                <a href={`https://instagram.com/${WEDDING_DATA.groom.instagram}`} target="_blank" rel="noreferrer" className="inline-block text-xs text-[#D27C5C] tracking-widest uppercase font-medium">{WEDDING_DATA.groom.instagram}</a>
                <p className="text-xs text-[#4E3629]/70 leading-relaxed italic pt-2">
                  {WEDDING_DATA.groom.desc}
                </p>
                <div className="pt-4 text-xs text-[#4E3629]/80 font-medium border-t border-[#D27C5C]/10 inline-block w-full">
                  Putra tercinta dari:<br/>
                  <span className="text-[#4E3629] font-bold">{WEDDING_DATA.groom.father}</span><br/>
                  & {WEDDING_DATA.groom.mother}
                </div>
              </div>
            </div>

            {/* Bride Profile */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 group">
              <div className="relative w-64 h-80 arch-clip overflow-hidden shadow-xl border-4 border-white transform transition-transform duration-500 group-hover:scale-[1.02]">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600" 
                  alt="Sarah Amalia"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-3xl font-serif-terracotta text-[#4E3629]">{WEDDING_DATA.bride.fullName}</h3>
                <a href={`https://instagram.com/${WEDDING_DATA.bride.instagram}`} target="_blank" rel="noreferrer" className="inline-block text-xs text-[#D27C5C] tracking-widest uppercase font-medium">{WEDDING_DATA.bride.instagram}</a>
                <p className="text-xs text-[#4E3629]/70 leading-relaxed italic pt-2">
                  {WEDDING_DATA.bride.desc}
                </p>
                <div className="pt-4 text-xs text-[#4E3629]/80 font-medium border-t border-[#D27C5C]/10 inline-block w-full">
                  Putri tercinta dari:<br/>
                  <span className="text-[#4E3629] font-bold">{WEDDING_DATA.bride.father}</span><br/>
                  & {WEDDING_DATA.bride.mother}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {}
      {/* 6. STORIES SECTION */}
      <section className="py-24 px-6 md:px-12 bg-white relative">
        <div className="absolute inset-0 bg-[#FBF7F4]/30 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">Our Journey</span>
            <h2 className="text-4xl font-serif-terracotta text-[#4E3629] mt-2">Kisah Kami</h2>
            <p className="text-xs text-[#4E3629]/60 max-w-sm mx-auto mt-2">Bagaimana takdir mempertemukan dan menyatukan kami</p>
          </div>

          <div className="relative border-l border-[#D27C5C]/20 pl-6 ml-4 md:ml-24 space-y-12">
            {WEDDING_DATA.stories.map((story, idx) => (
              <div key={idx} className="relative group">
                {/* Custom Decorative Bullet Arch */}
                <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-[#D27C5C] group-hover:scale-110 transition-transform">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D27C5C]"></span>
                </span>

                {/* Left Side Year (Hidden on mobile) */}
                <div className="absolute -left-28 top-1 text-right hidden md:block w-20">
                  <span className="text-xl font-serif-terracotta text-[#D27C5C] tracking-wide block">
                    {story.year}
                  </span>
                </div>

                <div className="bg-[#FBF7F4] p-6 rounded-3xl border border-[#D27C5C]/5 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                  <span className="inline-block text-xs font-bold text-[#D27C5C] md:hidden">{story.year}</span>
                  <h4 className="text-lg font-serif-terracotta font-bold text-[#4E3629]">{story.title}</h4>
                  <p className="text-xs text-[#4E3629]/70 leading-relaxed">{story.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      {/* 7. EVENTS & SCHEDULE (Interactive Tab System) */}
      <section className="py-24 px-6 md:px-12 bg-[#FBF7F4]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">Schedule</span>
            <h2 className="text-4xl font-serif-terracotta text-[#4E3629] mt-2">Informasi Acara</h2>
            <p className="text-xs text-[#4E3629]/60 max-w-xs mx-auto mt-2">Gunakan tabs di bawah untuk melihat detail Akad atau Resepsi</p>
          </div>

          {/* Tab Headers */}
          <div className="flex justify-center space-x-4 mb-8">
            {WEDDING_DATA.events.map((evt) => (
              <button
                key={evt.id}
                onClick={() => setActiveTab(evt.id)}
                className={`px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === evt.id ? 'bg-[#D27C5C] text-white shadow-md' : 'bg-white text-[#4E3629]/70 hover:bg-[#F0D3C5]/20 border border-[#D27C5C]/10'}`}
              >
                {evt.title}
              </button>
            ))}
          </div>

          {/* Tab Content Box */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#D27C5C]/10 relative overflow-hidden min-h-[380px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D27C5C]/5 to-transparent pointer-events-none"></div>

            {WEDDING_DATA.events.map((evt) => {
              if (evt.id !== activeTab) return null;
              return (
                <div key={evt.id} className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#D27C5C] tracking-widest uppercase block">Tanggal Pernikahan</span>
                    <h3 className="text-2xl md:text-3xl font-serif-terracotta text-[#4E3629] font-semibold">{WEDDING_DATA.displayDate}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#D27C5C]/10">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-[#D27C5C] uppercase tracking-wider font-semibold">
                        <Clock className="w-4 h-4" />
                        <span>Waktu Pelaksanaan</span>
                      </div>
                      <p className="text-sm text-[#4E3629] font-medium">{evt.time}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-[#D27C5C] uppercase tracking-wider font-semibold">
                        <MapPin className="w-4 h-4" />
                        <span>Lokasi / Venue</span>
                      </div>
                      <p className="text-sm text-[#4E3629] font-medium">{evt.venue}</p>
                      <p className="text-xs text-[#4E3629]/60 leading-relaxed">{evt.address}</p>
                    </div>
                  </div>

                  <div className="bg-[#FBF7F4] p-4 rounded-2xl text-xs text-[#4E3629]/80 flex items-start space-x-2.5">
                    <Info className="w-4 h-4 mt-0.5 text-[#D27C5C] flex-shrink-0" />
                    <span>{evt.note}</span>
                  </div>

                  <div className="pt-6 border-t border-[#D27C5C]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <a 
                      href={evt.gmaps} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#4E3629] hover:bg-[#2e2018] text-[#FBF7F4] font-medium text-xs uppercase tracking-[0.15em] rounded-full shadow-sm transition-all duration-300"
                    >
                      <Map className="w-4 h-4" />
                      <span>Petunjuk Rute Maps</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Map Integration Area */}
          <div className="mt-8 bg-white p-2 rounded-3xl shadow-sm border border-[#D27C5C]/5 overflow-hidden h-64 relative">
            <div className="absolute inset-0 bg-stone-100 flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="w-8 h-8 text-[#D27C5C] mb-2 animate-bounce" />
              <h4 className="text-base font-serif-terracotta font-semibold text-[#4E3629]">Lokasi Google Maps</h4>
              <p className="text-xs text-[#4E3629]/60 max-w-xs mt-1">Dapatkan panduan arah GPS terbaik menuju lokasi Hutan Kota Plataran melalui tombol rute di atas.</p>
            </div>
          </div>
        </div>
      </section>

      {}
      {/* 8. GALLERY SECTION (Editorial Arch Frame Style) */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">Moments</span>
            <h2 className="text-4xl font-serif-terracotta text-[#4E3629] mt-2">Galeri Foto</h2>
            <p className="text-xs text-[#4E3629]/60 max-w-sm mx-auto mt-2">Momen hangat kebersamaan kami dalam jepretan lensa</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {WEDDING_DATA.gallery.map((img, idx) => {
              // Custom arch styling variations to make it feel asymmetrical & beautiful
              const isEven = idx % 2 === 0;
              const frameClass = isEven ? "arch-clip" : "arch-clip-reverse";
              
              return (
                <div 
                  key={idx} 
                  onClick={() => setLightboxIndex(idx)}
                  className={`group relative aspect-[3/4] overflow-hidden ${frameClass} shadow-md cursor-pointer border-4 border-[#FBF7F4] hover:shadow-xl transition-all duration-500`}
                >
                  <img 
                    src={img} 
                    alt={`Gallery ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#4E3629]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="p-3 bg-white/90 rounded-full text-[#D27C5C] backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <Heart className="w-5 h-5 fill-[#D27C5C]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white text-4xl font-light focus:outline-none cursor-pointer"
          >
            &times;
          </button>
          
          <button 
            onClick={() => setLightboxIndex((lightboxIndex - 1 + WEDDING_DATA.gallery.length) % WEDDING_DATA.gallery.length)}
            className="absolute left-4 p-2 text-white/70 hover:text-white focus:outline-none"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <img 
            src={WEDDING_DATA.gallery[lightboxIndex]} 
            alt="Zoomed product" 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
          />

          <button 
            onClick={() => setLightboxIndex((lightboxIndex + 1) % WEDDING_DATA.gallery.length)}
            className="absolute right-4 p-2 text-white/70 hover:text-white focus:outline-none"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>
      )}

      {}
      {/* 9. RSVP & GUESTBOOK (Side-by-side Desktop Layout) */}
      <section className="py-24 px-6 md:px-12 bg-[#FBF7F4]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* RSVP Form Column */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">Buku Tamu</span>
                <h2 className="text-4xl font-serif-terracotta text-[#4E3629]">Konfirmasi Kehadiran</h2>
                <p className="text-xs text-[#4E3629]/60 mt-3 leading-relaxed">
                  Bantu kami mempersiapkan pelayanan hidangan dan kenyamanan terbaik dengan mengisi formulir kehadiran di bawah ini.
                </p>
              </div>

              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#4E3629]/70 font-bold mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Masukkan nama lengkap Anda"
                    value={rsvpForm.name}
                    onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-white rounded-2xl border border-[#D27C5C]/15 text-xs focus:outline-none focus:border-[#D27C5C] focus:ring-1 focus:ring-[#D27C5C] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#4E3629]/70 font-bold mb-2">Konfirmasi</label>
                    <select
                      value={rsvpForm.attendance}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                      className="w-full px-5 py-3.5 bg-white rounded-2xl border border-[#D27C5C]/15 text-xs focus:outline-none focus:border-[#D27C5C] transition-all cursor-pointer"
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Tidak Hadir">Tidak Hadir</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#4E3629]/70 font-bold mb-2">Jumlah Tamu</label>
                    <select
                      value={rsvpForm.guests}
                      disabled={rsvpForm.attendance === "Tidak Hadir"}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, guests: e.target.value })}
                      className="w-full px-5 py-3.5 bg-white rounded-2xl border border-[#D27C5C]/15 text-xs focus:outline-none focus:border-[#D27C5C] transition-all disabled:opacity-40 cursor-pointer"
                    >
                      <option value="1">1 Orang</option>
                      <option value="2">2 Orang</option>
                      <option value="3">3 Orang</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#4E3629]/70 font-bold mb-2">Pesan & Ucapan Doa</label>
                  <textarea 
                    rows="4"
                    required
                    placeholder="Tuliskan ucapan selamat hangat untuk Dimas & Sarah..."
                    value={rsvpForm.message}
                    onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                    className="w-full px-5 py-3.5 bg-white rounded-2xl border border-[#D27C5C]/15 text-xs focus:outline-none focus:border-[#D27C5C] focus:ring-1 focus:ring-[#D27C5C] transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitted}
                  className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 bg-[#D27C5C] hover:bg-[#b05f41] text-white font-medium text-xs uppercase tracking-[0.2em] rounded-2xl shadow-md transition-all duration-300 transform active:scale-95 disabled:opacity-75 cursor-pointer"
                >
                  {isSubmitted ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Dikirim!</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Kirim Ucapan</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Wishes list Column */}
            <div className="lg:col-span-7 flex flex-col h-[520px]">
              <div className="flex items-center justify-between border-b border-[#D27C5C]/10 pb-4 mb-4">
                <span className="text-xs font-bold text-[#4E3629] tracking-wider uppercase">Pesan Tamu ({wishes.length})</span>
                <span className="px-3 py-1 bg-[#D27C5C]/10 text-[#D27C5C] text-[9px] font-bold tracking-widest rounded-full uppercase">Update Realtime</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
                {wishes.map((wish, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl border border-[#D27C5C]/5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif-terracotta font-bold text-base text-[#4E3629]">{wish.name}</span>
                      <span className="text-[9px] text-[#4E3629]/40 font-semibold">{wish.time}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider ${wish.attendance === 'Hadir' ? 'bg-[#D27C5C]/10 text-[#D27C5C]' : 'bg-red-50 text-red-500'}`}>
                        {wish.attendance}
                      </span>
                      {wish.attendance === 'Hadir' && (
                        <span className="text-[9px] text-[#4E3629]/50 font-medium">({wish.guests} Pax)</span>
                      )}
                    </div>

                    <p className="text-xs text-[#4E3629]/75 leading-relaxed font-light">{wish.message}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {}
      {/* 10. DIGITAL GIFT SECTION */}
      <section className="py-24 px-6 md:px-12 bg-white relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <span className="inline-block p-4 bg-[#F0D3C5] rounded-full mb-4 text-[#D27C5C]">
              <Gift className="w-6 h-6" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold block mb-1">E-Gift</span>
            <h2 className="text-4xl font-serif-terracotta text-[#4E3629]">Tanda Kasih Digital</h2>
            <p className="text-xs text-[#4E3629]/60 max-w-md mx-auto mt-3 leading-relaxed">
              Doa restu tulus Anda adalah berkah paling berharga bagi kami. Namun apabila Anda berkeinginan mengirimkan kado nontunai, silakan menggunakan rekening di bawah ini:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {WEDDING_DATA.gifts.map((gift, idx) => (
              <div key={idx} className="bg-[#FBF7F4] p-8 rounded-3xl border border-[#D27C5C]/10 shadow-sm flex flex-col justify-between items-center relative overflow-hidden group">
                {/* Decorative absolute corner card shapes */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#D27C5C]/10 to-transparent rounded-tr-3xl"></div>
                
                <div className="text-center w-full relative z-10">
                  <span className="text-[10px] font-bold text-[#D27C5C] tracking-widest uppercase block mb-1">{gift.bank}</span>
                  <div className="w-6 h-[1.5px] bg-[#D27C5C]/30 mx-auto mb-4"></div>
                  <p className="text-xl font-mono font-bold text-[#4E3629] tracking-wider my-3">{gift.number}</p>
                  <p className="text-[10px] text-[#4E3629]/60 uppercase tracking-widest font-semibold">Atas Nama: {gift.owner}</p>
                </div>

                <button
                  onClick={() => copyToClipboard(gift.number, idx)}
                  className="mt-6 w-full inline-flex items-center justify-center space-x-2 py-3 px-5 bg-white hover:bg-[#D27C5C] text-[#D27C5C] hover:text-white border border-[#D27C5C]/25 text-xs font-semibold rounded-2xl transition-all duration-300 cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-4 h-4 text-green-600 group-hover:text-white" />
                      <span className="text-green-600">No. Rekening Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Rekening</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      {/* 11. FOOTER & CLOSING */}
      <footer className="py-24 px-6 bg-[#4E3629] text-[#FBF7F4] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#D27C5C] font-extrabold">Terima Kasih</span>
          
          <h2 className="text-4xl md:text-5xl font-serif-terracotta font-light italic text-white leading-snug">
            Suatu kehormatan & kebahagiaan mendalam bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir memberikan restu.
          </h2>

          <div className="w-16 h-[1px] bg-[#D27C5C]/50 mx-auto my-6"></div>

          <div className="space-y-2">
            <p className="text-[9px] text-[#FBF7F4]/50 uppercase tracking-[0.25em]">Kami Yang Berbahagia</p>
            <h4 className="text-3xl font-serif-terracotta text-[#D27C5C] italic">Dimas & Sarah</h4>
            <p className="text-[9px] text-[#FBF7F4]/40 uppercase tracking-widest mt-1">Serta Segenap Keluarga Besar Kedua Mempelai</p>
          </div>
        </div>

        {/* Brand Copyright */}
        <div className="border-t border-white/5 mt-20 pt-8 text-center text-[9px] text-[#FBF7F4]/30 uppercase tracking-widest relative z-10">
          <p>© 2026 Dimas & Sarah Wedding Celebration.</p>
          <p className="mt-1 font-light tracking-widest">Designed Elegantly in Terracotta Architecture</p>
        </div>

        {/* Soft Ambient Light Effects */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#D27C5C]/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#F0D3C5]/5 blur-[100px] pointer-events-none"></div>
      </footer>

    </div>
  );
}