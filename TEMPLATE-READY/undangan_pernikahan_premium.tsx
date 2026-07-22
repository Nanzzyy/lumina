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
  Info
} from 'lucide-react';

// Menambahkan Google Fonts berkualitas tinggi langsung ke dokumen secara dinamis
const injectFonts = () => {
  if (typeof window !== 'undefined') {
    const linkId = 'wedding-invitation-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600&display=swap';
      document.head.appendChild(link);

      const style = document.createElement('style');
      style.innerHTML = `
        .font-serif-wedding { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-wedding { font-family: 'Montserrat', sans-serif; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .pulse-soft {
          animation: pulse-soft 2s infinite ease-in-out;
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// Konfigurasi data mempelai dan acara pernikahan
const WEDDING_DATA = {
  groom: {
    nickname: "Aditya",
    fullName: "Aditya Pratama, S.T.",
    father: "Bpk. Hermawan Pratama",
    mother: "Ibu Ratih Saraswati",
    instagram: "@aditya_pratama"
  },
  bride: {
    nickname: "Laras",
    fullName: "Laras Atika Putri, S.Ds.",
    father: "Bpk. Wijaya Kusuma",
    mother: "Ibu Endang Lestari",
    instagram: "@laras_atikap"
  },
  date: "2026-11-14T09:00:00", // Format ISO untuk target countdown
  displayDate: "Sabtu, 14 November 2026",
  quote: {
    text: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    source: "QS. Ar-Rum: 21"
  },
  events: [
    {
      title: "Akad Nikah",
      time: "08:00 - 10:00 WIB",
      venue: "Masjid Raya Al-Baqarah",
      address: "Jl. Boulevard Indah No. 45, Kebayoran Baru, Jakarta Selatan",
      gmaps: "https://maps.google.com"
    },
    {
      title: "Resepsi Pernikahan",
      time: "11:00 - 14:00 WIB",
      venue: "Grand Ballroom Plataran",
      address: "Plataran Menteng, Jl. Cokroaminoto No. 9, Jakarta Pusat",
      gmaps: "https://maps.google.com"
    }
  ],
  stories: [
    {
      year: "2021",
      title: "Pertemuan Pertama",
      desc: "Takdir mempertemukan kami di sebuah studio desain kreatif di Jakarta. Berawal dari rekan kerja profesional yang kemudian menyadari adanya frekuensi hati yang sama."
    },
    {
      year: "2023",
      title: "Komitmen Bersama",
      desc: "Setelah dua tahun saling mengenal karakter dan menyelaraskan impian masa depan, kami memutuskan untuk melangkah ke arah komitmen yang lebih serius."
    },
    {
      year: "2025",
      title: "Lamaran Resmi",
      desc: "Di hadapan kedua keluarga besar, Aditya resmi meminang Laras sebagai calon istri. Sebuah momen penuh haru yang mengunci langkah kami menuju pelaminan."
    }
  ],
  gallery: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800"
  ],
  gifts: [
    {
      bank: "Bank BCA",
      number: "8720194821",
      owner: "Aditya Pratama"
    },
    {
      bank: "Bank Mandiri",
      number: "1320092817291",
      owner: "Laras Atika Putri"
    }
  ],
  audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" // Background music romantis instrument piano
};

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // State RSVP Form
  const [rsvpForm, setRsvpForm] = useState({ name: '', guests: '1', attendance: 'Hadir', message: '' });
  const [wishes, setWishes] = useState([
    { name: "Siti Rahma", guests: "2", attendance: "Hadir", message: "Selamat menempuh hidup baru Aditya dan Laras! Semoga sakinah mawaddah warahmah.", time: "2 jam yang lalu" },
    { name: "Dimas Saputra", guests: "1", attendance: "Hadir", message: "Lancar sampai hari H bro Adit! Bahagia selalu selamanya.", time: "5 jam yang lalu" },
    { name: "Rina Wijayanti", guests: "0", attendance: "Tidak Hadir", message: "Mohon maaf belum bisa hadir di hari bahagia kalian karena sedang di luar kota. Selamat ya Laras!", time: "1 hari yang lalu" }
  ]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const audioRef = useRef(null);

  // Pengaturan font & pengambilan query nama tamu dari URL parameter
  useEffect(() => {
    injectFonts();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const to = params.get('to');
      if (to) {
        setGuestName(decodeURIComponent(to));
      }
    }
  }, []);

  // Logika Waktu Mundur (Countdown)
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

  // Pengaturan musik latar saat undangan dibuka
  const handleOpenInvitation = () => {
    setIsOpen(true);
    setIsPlaying(true);
    // Jalankan pemutar audio secara eksplisit setelah interaksi user
    if (audioRef.current) {
      audioRef.current.play().catch(error => console.log("Audio playback failed initially:", error));
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

  // Handle RSVP Submission
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
    }, 3000);
  };

  // Salin Nomor Rekening
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="font-sans-wedding bg-[#FAF9F6] text-[#2D3327] min-h-screen relative selection:bg-[#5A6351] selection:text-[#FAF9F6] overflow-x-hidden">
      
      {/* Element Audio Tersembunyi */}
      <audio ref={audioRef} src={WEDDING_DATA.audioUrl} loop />

      {}
      {/* COVER OVERLAY (Sebelum dibuka, tampil fullscreen penuh) */}
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-cover bg-center transition-all duration-1000 ease-in-out ${isOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
        style={{
          backgroundImage: `linear-gradient(rgba(45, 51, 39, 0.65), rgba(45, 51, 39, 0.75)), url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600')`
        }}
      >
        <div className="text-center mt-16 px-4">
          <p className="text-sm uppercase tracking-[0.25em] text-[#F4F6F0] mb-2 font-light">The Wedding of</p>
          <h1 className="text-5xl md:text-7xl font-serif-wedding text-[#C29B68] italic font-medium leading-tight">
            {WEDDING_DATA.groom.nickname} & {WEDDING_DATA.bride.nickname}
          </h1>
          <div className="w-16 h-[1px] bg-[#C29B68] mx-auto mt-6"></div>
        </div>

        <div className="text-center px-6 mb-16 max-w-md w-full bg-[#FAF9F6]/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[#FAF9F6]/80 mb-1">Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <h3 className="text-xl font-semibold text-[#FAF9F6] font-serif-wedding my-3 italic">{guestName}</h3>
          <p className="text-[11px] text-[#FAF9F6]/70 leading-relaxed mb-6">
            Kami mengundang Anda untuk merayakan momen bahagia pernikahan kami.
          </p>
          
          <button 
            onClick={handleOpenInvitation}
            className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#5A6351] hover:bg-[#484f41] text-[#FAF9F6] font-medium text-xs uppercase tracking-[0.2em] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Buka Undangan</span>
          </button>
        </div>
      </div>

      {/* FLOATING MUSIC CONTROLLER */}
      {isOpen && (
        <button 
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#5A6351] text-[#FAF9F6] shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-[#C29B68]/30 group"
        >
          {isPlaying ? (
            <div className="relative flex items-center justify-center">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-[#C29B68] opacity-75"></span>
              <Volume2 className="w-5 h-5 animate-spin-slow" />
            </div>
          ) : (
            <VolumeX className="w-5 h-5 text-[#FAF9F6]/80" />
          )}
        </button>
      )}

      {}
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(45, 51, 39, 0.5), rgba(45, 51, 39, 0.6)), url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1600')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent"></div>
        
        <div className="relative text-center px-4 max-w-4xl z-10 text-white mt-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#FAF9F6] mb-4">Maha Suci Allah yang mempersatukan cinta</p>
          <span className="inline-block p-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 mb-6">
            <Heart className="w-5 h-5 text-[#C29B68] fill-[#C29B68]" />
          </span>
          <h1 className="text-6xl md:text-8xl font-serif-wedding font-light text-white italic tracking-wide">
            {WEDDING_DATA.groom.nickname} <span className="text-3xl md:text-4xl text-[#C29B68] block md:inline-block my-2 md:my-0">&</span> {WEDDING_DATA.bride.nickname}
          </h1>
          <p className="text-sm tracking-[0.25em] font-light text-[#FAF9F6] mt-6 uppercase">
            {WEDDING_DATA.displayDate}
          </p>
          <div className="mt-8 animate-bounce">
            <p className="text-xs tracking-[0.1em] text-[#C29B68]">Scroll Kebawah</p>
            <span className="inline-block w-1.5 h-1.5 border-r border-b border-[#C29B68] transform rotate-45 mt-1"></span>
          </div>
        </div>
      </section>

      {}
      {/* 2. QUOTE SECTION */}
      <section className="py-24 px-6 md:px-12 bg-[#FAF9F6] relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="text-2xl text-[#C29B68] font-serif-wedding mb-6">“</div>
          <p className="text-base md:text-lg leading-relaxed text-[#5A6351] font-serif-wedding italic font-light px-4">
            {WEDDING_DATA.quote.text}
          </p>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D3327] mt-6">
            {WEDDING_DATA.quote.source}
          </h4>
          <div className="text-2xl text-[#C29B68] font-serif-wedding mt-4">”</div>
        </div>
        {/* Dekorasi Dedauan Transparan */}
        <div className="absolute top-0 left-0 w-24 h-24 opacity-5 pointer-events-none transform -rotate-45">🌿</div>
        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 pointer-events-none transform rotate-135">🌿</div>
      </section>

      {}
      {/* 3. COUNTDOWN SECTION */}
      <section className="py-20 px-6 bg-[#F4F6F0] relative">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Menghitung Hari Bahagia</h3>
          <h2 className="text-3xl md:text-4xl font-serif-wedding text-[#2D3327] mb-12">Detik-Detik Janji Suci</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {/* Box Hari */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl shadow-sm border border-[#5A6351]/5 flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-serif-wedding font-semibold text-[#5A6351]">
                {String(countdown.days).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-widest text-[#2D3327]/60 mt-2 font-medium">Hari</span>
            </div>
            {/* Box Jam */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl shadow-sm border border-[#5A6351]/5 flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-serif-wedding font-semibold text-[#5A6351]">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-widest text-[#2D3327]/60 mt-2 font-medium">Jam</span>
            </div>
            {/* Box Menit */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl shadow-sm border border-[#5A6351]/5 flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-serif-wedding font-semibold text-[#5A6351]">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-widest text-[#2D3327]/60 mt-2 font-medium">Menit</span>
            </div>
            {/* Box Detik */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl shadow-sm border border-[#5A6351]/5 flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-serif-wedding font-semibold text-[#C29B68]">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-widest text-[#2D3327]/60 mt-2 font-medium">Detik</span>
            </div>
          </div>
        </div>
      </section>

      {}
      {/* 4. MEMPELAI SECTION */}
      <section className="py-24 px-6 md:px-12 bg-[#FAF9F6]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Dengan Hormat & Sukacita</p>
          <h2 className="text-4xl font-serif-wedding text-[#2D3327] mb-6">Kedua Mempelai</h2>
          <p className="text-sm max-w-2xl mx-auto text-[#2D3327]/70 leading-relaxed mb-16">
            Maka dengan memohon rahmat dan rida Allah SWT, kami bermaksud menyelenggarakan acara pernikahan kami, yang akan mempersatukan:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-center">
            
            {/* Groom Card */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-56 h-72 rounded-t-[7rem] rounded-b-2xl overflow-hidden shadow-xl border-4 border-[#FAF9F6] outline outline-1 outline-[#5A6351]/20">
                <img 
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600" 
                  alt="Groom Profile"
                  className="w-full h-full object-cover grayscale-[10%] contrast-[105%]"
                />
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-serif-wedding text-[#5A6351] font-bold">{WEDDING_DATA.groom.fullName}</h3>
                <p className="text-xs text-[#C29B68] tracking-widest uppercase mt-1 mb-4 font-medium">{WEDDING_DATA.groom.instagram}</p>
                <p className="text-sm text-[#2D3327]/80 leading-relaxed">
                  Putra dari Pasangan: <br/>
                  <strong className="text-[#2D3327]">{WEDDING_DATA.groom.father}</strong> <br/>
                  & {WEDDING_DATA.groom.mother}
                </p>
              </div>
            </div>

            {/* Bride Card */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-56 h-72 rounded-t-[7rem] rounded-b-2xl overflow-hidden shadow-xl border-4 border-[#FAF9F6] outline outline-1 outline-[#5A6351]/20">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600" 
                  alt="Bride Profile"
                  className="w-full h-full object-cover grayscale-[10%] contrast-[105%]"
                />
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-serif-wedding text-[#5A6351] font-bold">{WEDDING_DATA.bride.fullName}</h3>
                <p className="text-xs text-[#C29B68] tracking-widest uppercase mt-1 mb-4 font-medium">{WEDDING_DATA.bride.instagram}</p>
                <p className="text-sm text-[#2D3327]/80 leading-relaxed">
                  Putri dari Pasangan: <br/>
                  <strong className="text-[#2D3327]">{WEDDING_DATA.bride.father}</strong> <br/>
                  & {WEDDING_DATA.bride.mother}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {}
      {/* 5. LOVE STORY SECTION */}
      <section className="py-24 px-6 md:px-12 bg-[#F4F6F0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Perjalanan Cinta Kami</p>
            <h2 className="text-4xl font-serif-wedding text-[#2D3327]">Kisah Indah</h2>
            <div className="w-12 h-[1px] bg-[#C29B68] mx-auto mt-4"></div>
          </div>

          <div className="relative border-l border-[#5A6351]/20 ml-4 md:ml-32 space-y-12">
            {WEDDING_DATA.stories.map((story, idx) => (
              <div key={idx} className="relative pl-8 md:pl-12">
                {/* Penunjuk Bulatan */}
                <span className="absolute -left-[9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FAF9F6] border-2 border-[#5A6351]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C29B68]"></span>
                </span>

                {/* Info Tahun di Sebelah Kiri untuk Layar Desktop */}
                <div className="absolute -left-20 md:-left-32 top-1 text-center hidden md:block w-20">
                  <span className="text-lg font-serif-wedding font-bold text-[#C29B68] bg-[#FAF9F6] py-1 px-3.5 rounded-full border border-[#C29B68]/10 shadow-sm">
                    {story.year}
                  </span>
                </div>

                {/* Konten Kisah */}
                <div className="bg-[#FAF9F6] p-6 rounded-2xl shadow-sm border border-[#5A6351]/5">
                  <span className="inline-block text-xs font-bold text-[#C29B68] uppercase tracking-wider mb-2 md:hidden">
                    {story.year}
                  </span>
                  <h4 className="text-xl font-serif-wedding font-bold text-[#2D3327] mb-2">{story.title}</h4>
                  <p className="text-sm text-[#2D3327]/70 leading-relaxed">{story.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      {/* 6. TIMELINE & EVENT DETAILS SECTION */}
      <section className="py-24 px-6 md:px-12 bg-[#FAF9F6]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Informasi Acara</p>
            <h2 className="text-4xl font-serif-wedding text-[#2D3327]">Waktu & Lokasi</h2>
            <p className="text-sm text-[#2D3327]/60 mt-3">Silakan simpan tanggal dan saksikan momen suci kami</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {WEDDING_DATA.events.map((event, idx) => (
              <div key={idx} className="bg-[#F4F6F0] p-8 md:p-10 rounded-3xl border border-[#5A6351]/10 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#C29B68]/10 to-transparent pointer-events-none rounded-tr-3xl"></div>
                
                <div>
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#5A6351]/10 text-[#5A6351] mb-6">
                    <Calendar className="w-4 h-4 text-[#5A6351]" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{event.title}</span>
                  </div>

                  <h3 className="text-3xl font-serif-wedding font-bold text-[#2D3327] mb-4">{WEDDING_DATA.displayDate}</h3>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-start space-x-3 text-sm text-[#2D3327]/80">
                      <Clock className="w-4 h-4 mt-1 text-[#C29B68]" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-start space-x-3 text-sm text-[#2D3327]/80">
                      <MapPin className="w-4 h-4 mt-1 text-[#C29B68]" />
                      <div>
                        <strong className="text-[#2D3327] block mb-1">{event.venue}</strong>
                        <span className="text-xs leading-relaxed block text-[#2D3327]/70">{event.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#5A6351]/10">
                  <a 
                    href={event.gmaps} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#5A6351] hover:text-[#C29B68] transition-colors duration-300"
                  >
                    <span>Buka Google Maps</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Iframe Peta Dummy/Placeholder Elegan */}
          <div className="mt-12 rounded-3xl overflow-hidden border border-[#5A6351]/10 shadow-sm h-72 relative">
            <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="w-10 h-10 text-[#C29B68] mb-3 animate-bounce" />
              <h4 className="text-lg font-serif-wedding font-bold text-[#2D3327]">Google Maps Terintegrasi</h4>
              <p className="text-xs text-[#2D3327]/60 mt-1 max-w-sm">Dapatkan rute navigasi terbaik langsung menuju lokasi pernikahan kami menggunakan tombol peta di atas.</p>
            </div>
          </div>
        </div>
      </section>

      {}
      {/* 7. GALLERY SECTION */}
      <section className="py-24 px-6 bg-[#F4F6F0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Galeri Bahagia</p>
            <h2 className="text-4xl font-serif-wedding text-[#2D3327]">Momen Cinta</h2>
            <div className="w-12 h-[1px] bg-[#C29B68] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {WEDDING_DATA.gallery.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-sm cursor-pointer border border-[#5A6351]/5 hover:shadow-md transition-all duration-300"
              >
                <img 
                  src={img} 
                  alt={`Gallery ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#2D3327]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="p-2.5 bg-white/80 rounded-full text-[#5A6351] backdrop-blur-sm">
                    <Heart className="w-4 h-4 fill-[#5A6351]" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white text-3xl font-light focus:outline-none cursor-pointer"
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
            alt="Zoomed" 
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
      {/* 8. RSVP & GUESTBOOK SECTION */}
      <section className="py-24 px-6 md:px-12 bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sisi Form RSVP */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Buku Tamu Virtual</p>
                <h2 className="text-4xl font-serif-wedding text-[#2D3327]">Konfirmasi RSVP</h2>
                <p className="text-xs text-[#2D3327]/60 mt-3 leading-relaxed">
                  Bantu kami mempersiapkan kenyamanan perayaan dengan mengonfirmasi kehadiran Anda sekeluarga melalui formulir di bawah ini.
                </p>
              </div>

              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#2D3327]/70 font-semibold mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nama Lengkap Anda"
                    value={rsvpForm.name}
                    onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F4F6F0] rounded-xl border border-[#5A6351]/10 text-sm focus:outline-none focus:border-[#5A6351] focus:ring-1 focus:ring-[#5A6351] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#2D3327]/70 font-semibold mb-2">Konfirmasi Kehadiran</label>
                    <select
                      value={rsvpForm.attendance}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F4F6F0] rounded-xl border border-[#5A6351]/10 text-sm focus:outline-none focus:border-[#5A6351] transition-all cursor-pointer"
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Tidak Hadir">Tidak Hadir</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#2D3327]/70 font-semibold mb-2">Jumlah Tamu</label>
                    <select
                      value={rsvpForm.guests}
                      disabled={rsvpForm.attendance === "Tidak Hadir"}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, guests: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F4F6F0] rounded-xl border border-[#5A6351]/10 text-sm focus:outline-none focus:border-[#5A6351] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <option value="1">1 Orang</option>
                      <option value="2">2 Orang</option>
                      <option value="3">3 Orang</option>
                      <option value="4">4 Orang</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#2D3327]/70 font-semibold mb-2">Pesan & Doa Restu</label>
                  <textarea 
                    rows="4"
                    required
                    placeholder="Tuliskan ucapan selamat & doa restu tulus Anda di sini..."
                    value={rsvpForm.message}
                    onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F4F6F0] rounded-xl border border-[#5A6351]/10 text-sm focus:outline-none focus:border-[#5A6351] focus:ring-1 focus:ring-[#5A6351] transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitted}
                  className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#5A6351] hover:bg-[#484f41] text-[#FAF9F6] font-medium text-xs uppercase tracking-[0.2em] rounded-xl shadow-md transition-all duration-300 transform active:scale-95 disabled:opacity-75 cursor-pointer"
                >
                  {isSubmitted ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Terima Kasih! RSVP Dikirim</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Kirim Ucapan & Konfirmasi</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sisi List Ucapan */}
            <div className="lg:col-span-6 flex flex-col h-[520px]">
              <div className="flex items-center justify-between border-b border-[#5A6351]/10 pb-4 mb-4">
                <span className="text-sm font-semibold text-[#2D3327] tracking-wider uppercase">Ucapan Tamu ({wishes.length})</span>
                <span className="px-2.5 py-1 bg-[#5A6351]/10 text-[#5A6351] text-[10px] font-bold tracking-widest rounded-full uppercase">Realtime Live</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {wishes.map((wish, idx) => (
                  <div key={idx} className="bg-[#F4F6F0] p-4.5 rounded-2xl border border-[#5A6351]/5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif-wedding font-bold text-sm text-[#5A6351]">{wish.name}</span>
                      <span className="text-[10px] text-[#2D3327]/40 font-light">{wish.time}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider ${wish.attendance === 'Hadir' ? 'bg-[#5A6351]/10 text-[#5A6351]' : 'bg-red-50 text-red-500'}`}>
                        {wish.attendance}
                      </span>
                      {wish.attendance === 'Hadir' && (
                        <span className="text-[10px] text-[#2D3327]/50 font-medium">({wish.guests} Tamu)</span>
                      )}
                    </div>

                    <p className="text-xs text-[#2D3327]/75 leading-relaxed">{wish.message}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {}
      {/* 9. DIGITAL GIFT / KADO DIGITAL SECTION */}
      <section className="py-24 px-6 md:px-12 bg-[#F4F6F0]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <span className="inline-block p-3.5 bg-[#5A6351]/10 rounded-full mb-4 text-[#5A6351]">
              <Gift className="w-7 h-7" />
            </span>
            <p className="text-xs uppercase tracking-[0.3em] text-[#5A6351] mb-2 font-medium">Kado Digital</p>
            <h2 className="text-4xl font-serif-wedding text-[#2D3327]">Tanda Kasih</h2>
            <p className="text-sm text-[#2D3327]/60 max-w-lg mx-auto mt-3 leading-relaxed">
              Doa restu Anda adalah karunia terindah bagi kami. Namun jika Anda bermaksud mengirimkan tanda kasih, Anda dapat menyalurkannya secara nontunai melalui rekening di bawah ini:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {WEDDING_DATA.gifts.map((gift, idx) => (
              <div key={idx} className="bg-[#FAF9F6] p-6 rounded-3xl border border-[#5A6351]/10 shadow-sm flex flex-col justify-between items-center relative overflow-hidden">
                <div className="text-center w-full">
                  <span className="text-xs font-bold text-[#C29B68] tracking-widest uppercase block mb-1">{gift.bank}</span>
                  <div className="w-8 h-[1px] bg-[#C29B68]/30 mx-auto mb-4"></div>
                  <p className="text-lg font-mono font-bold text-[#2D3327] tracking-wider">{gift.number}</p>
                  <p className="text-xs text-[#2D3327]/60 mt-1 uppercase tracking-wide">A/N: {gift.owner}</p>
                </div>

                <button
                  onClick={() => copyToClipboard(gift.number, idx)}
                  className="mt-6 w-full inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-[#5A6351]/10 hover:bg-[#5A6351] text-[#5A6351] hover:text-[#FAF9F6] text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin No. Rekening</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      {/* 10. FOOTER & CLOSING */}
      <footer className="py-24 px-6 bg-[#2D3327] text-[#FAF9F6] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <p className="text-xs uppercase tracking-[0.4em] text-[#C29B68]">Terima Kasih</p>
          
          <h2 className="text-4xl md:text-5xl font-serif-wedding font-light italic text-white">
            Merupakan Kehormatan & Kebahagiaan Bagi Kami Apabila Bapak/Ibu Berkenan Hadir.
          </h2>

          <div className="w-16 h-[1px] bg-[#C29B68] mx-auto my-6"></div>

          <div className="space-y-2">
            <p className="text-xs text-[#FAF9F6]/60 uppercase tracking-[0.2em]">Kami yang Berbahagia</p>
            <h4 className="text-3xl font-serif-wedding text-[#C29B68] italic font-medium">Aditya & Laras</h4>
            <p className="text-xs text-[#FAF9F6]/40 uppercase tracking-widest mt-1">Beserta Seluruh Keluarga Besar Kedua Mempelai</p>
          </div>
        </div>

        {/* Hak cipta / Signature */}
        <div className="border-t border-[#FAF9F6]/10 mt-20 pt-8 text-center text-[10px] text-[#FAF9F6]/40 uppercase tracking-widest relative z-10">
          <p>© 2026 Aditya & Laras. All Rights Reserved.</p>
          <p className="mt-1 font-light">Elegantly Created with Love</p>
        </div>

        {/* Ambient Dark Green Glow Effect */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#5A6351]/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C29B68]/5 blur-[100px] pointer-events-none"></div>
      </footer>

    </div>
  );
}