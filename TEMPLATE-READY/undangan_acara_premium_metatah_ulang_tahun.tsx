import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Send, 
  Gift, 
  Copy, 
  Check, 
  ChevronDown, 
  Camera, 
  Users, 
  MessageSquare,
  Award,
  Music,
  Heart,
  ChevronRight,
  BookOpen,
  Map,
  Smile,
  ShieldCheck,
  UserCheck,
  ToggleLeft,
  Coffee
} from 'lucide-react';

const injectPremiumStyles = () => {
  if (typeof window !== 'undefined') {
    const styleId = 'event-premium-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700&family=Sacramento&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        
        .font-luxury-serif {
          font-family: 'Cormorant Garamond', serif;
        }
        .font-header-deco {
          font-family: 'Cinzel Decorative', serif;
        }
        .font-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .font-cursive-love {
          font-family: 'Sacramento', cursive;
        }
        .font-playfair {
          font-family: 'Playfair Display', serif;
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
          50% { transform: scale(1.04); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatGentle {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes shimmerGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
        
        .animate-fade-up {
          animation: fadeUpIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-slow {
          animation: scaleSlow 16s ease-in-out infinite;
        }
        .animate-rotate-slow {
          animation: rotateSlow 45s linear infinite;
        }
        .animate-float-gentle {
          animation: floatGentle 6s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmerGlow 3s ease-in-out infinite;
        }
        
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #111;
        }
        ::-webkit-scrollbar-thumb {
          background: #c5a85a;
          border-radius: 4px;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

const BalineseOrnament = ({ className = "w-8 h-8", color = "#C5A85A" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0 C40 20, 20 40, 0 50 C20 60, 40 80, 50 100 C60 80, 80 60, 100 50 C80 40, 60 20, 50 0 Z" fill={color} />
    <path d="M50 15 C43 30, 30 43, 15 50 C30 57, 43 70, 50 85 C57 70, 70 57, 85 50 C70 43, 57 30, 50 15 Z" fill="#FFF" opacity="0.3" />
    <circle cx="50" cy="50" r="8" fill="#FFF" />
  </svg>
);

const LuxuryStarOrnament = ({ className = "w-6 h-6", color = "#D4AF37" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={color} stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const eventConfig = {
  metatah: {
    primaryColor: '#8C3A22', // Terracotta
    secondaryColor: '#C5A85A', // Balinese Gold
    accentBg: 'bg-[#1D110D]', // Deep dark mahogany
    lightBg: 'bg-[#FAF6F0]', // Soft linen warm
    textColor: 'text-[#1D110D]',
    fontTitle: 'font-luxury-serif',
    title: 'Metatah & Mepandes',
    subtitle: 'Upacara Potong Gigi Suci',
    heroSubtitle: 'OM SWASTYASTU',
    quotesHeader: 'Sloka Bhagawad Gita / Kekawin',
    quoteText: '"Dengan mengendalikan Sad Ripu (enam musuh di dalam diri), manusia mencapai ketenangan jiwa yang murni, meniti dharma, dan menyatu dalam keharmonisan alam semesta."',
    quoteAuthor: 'Upacara Manusa Yadnya Suci',
    targetDate: new Date('2027-07-24T08:00:00'),
    celebrantLabel: 'Sang Pandita / Sang Sinuci',
    celebrants: [
      {
        name: 'I Gede Bagus Raditya',
        subName: 'Raditya',
        parent: 'Putra Pertama dari I Wayan Sudarsana & Ni Ketut Sulastri',
        origin: 'Banjar Denpasar, Bali',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Ni Luh Ayu Candrawati',
        subName: 'Ayu Candra',
        parent: 'Putri Kedua dari I Wayan Sudarsana & Ni Ketut Sulastri',
        origin: 'Banjar Denpasar, Bali',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
      }
    ],
    storyTitle: 'Makna & Esensi Metatah',
    storyIntro: 'Metatah atau Mepandes adalah ritual sakral keagamaan Hindu di Bali sebagai simbol kedewasaan spiritual.',
    storySteps: [
      { year: 'Sad Ripu', title: 'Pengendalian Nafsu', desc: 'Simbolis meminimalkan sifat buruk seperti amarah, keserakahan, kegelapan pikiran, kebingungan, dan nafsu tak terkendali.' },
      { year: 'Dharma', title: 'Kewajiban Orang Tua', desc: 'Wujud pembayaran hutang moral orang tua kepada anaknya untuk mengantarkan mereka menuju gerbang kedewasaan yang bijaksana.' },
      { year: 'Kesucian', title: 'Estetika Spiritual', desc: 'Merapikan deretan gigi taring atas untuk melambangkan transisi karakter manusia dari sifat liar raksasa (Asuri Sampad) menuju sifat dewa (Daiwi Sampad).' }
    ],
    galleryTitle: 'Lensa Dokumenter Budaya',
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // Relaxing authentic feel
    schedule: {
      tab1: 'Upacara Ngekeb',
      tab2: 'Acara Metatah',
      details1: {
        title: 'Upacara Ngekeb & Persiapan',
        date: 'Jumat, 23 Juli 2027',
        time: '15:00 WITA - Selesai',
        location: 'Griya Agung Sudarsana, Denpasar',
        desc: 'Prosesi pingitan suci di mana calon yang akan dipangkas giginya mempersiapkan diri secara batiniah dan jasmani.'
      },
      details2: {
        title: 'Puncak Upacara Mepandes / Metatah',
        date: 'Sabtu, 24 Juli 2027',
        time: '08:00 WITA - 13:00 WITA',
        location: 'Griya Agung Sudarsana, Denpasar',
        desc: 'Prosesi pemangkasan gigi oleh Sang Sangging, dilanjutkan dengan persembahyangan bersama memohon keselamatan.'
      }
    },
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126218.42398466106!2d115.14723048598711!3d-8.672459955734262!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23f3e7b165b31%3A0x4030bfb15b376d0!2sDenpasar%2C%20Bali!5e0!3m2!1sid!2sid!4v1715694200000!5m2!1sid!2sid',
    gmapBtnLink: 'https://maps.app.goo.gl/uP4V5qL16j7uB7Y78',
    gifts: [
      { bank: 'Bank BPD Bali', number: '010023459821', owner: 'I Wayan Sudarsana' },
      { bank: 'Bank Central Asia (BCA)', number: '7810592833', owner: 'I Gede Bagus Raditya' }
    ]
  },
  birthday: {
    primaryColor: '#D4AF37', // Metallic Gold
    secondaryColor: '#E2E8F0', // Platinum Silver
    accentBg: 'bg-[#0B0F19]', // Deep space cosmic midnight blue
    lightBg: 'bg-[#0F172A]', // Deep slate premium dark
    textColor: 'text-[#F1F5F9]',
    fontTitle: 'font-playfair',
    title: 'The Golden Gala',
    subtitle: 'Milestone 25th Birthday Celebration',
    heroSubtitle: 'YOU ARE COMMENDABLY INVITED',
    quotesHeader: 'A Vision of Growth & Legacy',
    quoteText: '"Youth is not a time of life; it is a state of mind, a temper of the will, a quality of the imagination, a vigor of the emotions. Cheers to a quarter-century of beautiful lessons, stellar growth, and endless horizons."',
    quoteAuthor: 'Gwyneth Amanda',
    targetDate: new Date('2027-09-12T19:00:00'),
    celebrantLabel: 'The Celebrant',
    celebrants: [
      {
        name: 'Gwyneth Amanda Wardana',
        subName: 'Gwyneth',
        parent: 'Chic, passionate designer, loving daughter, and dream chaser.',
        origin: 'Canggu, Bali',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600'
      }
    ],
    storyTitle: 'Quarter of a Century',
    storyIntro: 'An epic retrospective chronicle of twenty-five years filled with artistic explorations, global friendships, and milestones.',
    storySteps: [
      { year: 'Chapter I', title: 'The Roots of Art', desc: 'Born and raised with an insatiable curious mind, discovering a fierce passion for aesthetics, visual layouts, and spatial interior architecture.' },
      { year: 'Chapter II', title: 'Global Journeys', desc: 'Ventured into top global design studios, cultivating deep perspectives on sustainability, culture, and high-end minimalism.' },
      { year: 'Chapter III', title: 'The Legacy Ahead', desc: 'Inaugurating this milestone by establishing a boutique studio, gathering closest hearts to toast for tomorrow.' }
    ],
    galleryTitle: 'Frames of Life & Joy',
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', // Chill luxury lounge beat
    schedule: {
      tab1: 'Sunset Cocktail',
      tab2: 'Main Gala Night',
      details1: {
        title: 'Welcome Lounge & Sunset Toast',
        date: 'Sunday, 12 September 2027',
        time: '17:30 WITA - 19:00 WITA',
        location: 'The Ritz-Carlton Cliff Lawn, Uluwatu, Bali',
        desc: 'Kickstarting the night with gold-hued elixir cocktails, fine strings live quartet, and sunset snapshots.'
      },
      details2: {
        title: 'The Gala Banquet & After-Party',
        date: 'Sunday, 12 September 2027',
        time: '19:00 WITA - Late',
        location: 'Grand Ballroom Ritz-Carlton, Uluwatu, Bali',
        desc: 'High-end gastronome dinner, custom visual keynotes, cake slicing, followed by deep dance beats.'
      }
    },
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15769.75713426214!2d115.118949!3d-8.8415712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd25e87a2d8e40f%3A0xc6cb5a6f8b0e791e!2sThe%20Ritz-Carlton%20Bali!5e0!3m2!1sid!2sid!4v1715694200000!5m2!1sid!2sid',
    gmapBtnLink: 'https://maps.app.goo.gl/uP4V5qL16j7uB7Y78',
    gifts: [
      { bank: 'Bank Central Asia (BCA)', number: '8092110291', owner: 'Gwyneth Amanda' },
      { bank: 'Bank Mandiri', number: '132009812933', owner: 'Gwyneth Amanda' }
    ]
  }
};

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [eventType, setEventType] = useState('metatah'); // 'metatah' | 'birthday'
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const [guestName, setGuestName] = useState('Tamu Undangan Spesial');
  const [activeTab, setActiveTab] = useState('acara_utama');
  
  // Local states for RSVP and interactive guest wishes
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('Hadir');
  const [rsvpGuests, setRsvpGuests] = useState('1');
  const [rsvpWish, setRsvpWish] = useState('');

  // Audio stream referencer
  const audioRef = useRef(null);

  const currentConfig = eventConfig[eventType];

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [wishes, setWishes] = useState({
    metatah: [
      { name: 'I Made Wijaya', status: 'Hadir', wish: 'Rahajeng nyanggra upacara Mepandes, Raditya & Ayu Candra. Semoga dilancarkan hingga akhir prosesi dan diberkahi kebahagiaan sejati.', date: 'Baru Saja' },
      { name: 'Ni Nyoman Sariani', status: 'Hadir', wish: 'Sangat bahagia mendengarnya. Upacara suci ini semoga memberikan kedamaian lahir batin bagi kedua mempelai suci.', date: '1 Jam Lalu' }
    ],
    birthday: [
      { name: 'Clarissa Valerie', status: 'Hadir', wish: 'Happy 25th birthday, beautiful soul! Truly inspired by your energy and talent. Can\'t wait to toast with you!', date: 'Baru Saja' },
      { name: 'Devon Mercer', status: 'Tidak Hadir', wish: 'Huge congrats Gwyneth! I am unfortunately out of the country, but sending all my virtual love and stellar vibes!', date: '3 Jam Lalu' }
    ]
  });

  useEffect(() => {
    injectPremiumStyles();

    // Parse recipient name from URL parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get('to');
      if (toParam) {
        setGuestName(decodeURIComponent(toParam));
      }
      
      const savedWishes = localStorage.getItem('celebration_wishes');
      if (savedWishes) {
        setWishes(JSON.parse(savedWishes));
      }
    }
  }, []);

  // Sync music when the event type changes
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [eventType]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +currentConfig.targetDate - +new Date();
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
  }, [currentConfig.targetDate]);

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

    const updatedWishes = {
      ...wishes,
      [eventType]: [newWish, ...wishes[eventType]]
    };

    setWishes(updatedWishes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('celebration_wishes', JSON.stringify(updatedWishes));
    }
    
    setRsvpName('');
    setRsvpWish('');
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  const galleryPhotos = {
    metatah: [
      { id: 1, url: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&q=80&w=800', desc: 'Pesona Agung Seni Upakara Bali' },
      { id: 2, url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80&w=800', desc: 'Nuansa Asri Pedesaan & Pura Sanubari' },
      { id: 3, url: 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&q=80&w=800', desc: 'Kemegahan Ornamen Ukir Emas Tradisional' },
      { id: 4, url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800', desc: 'Sesajen (Banten) Wujud Rasa Syukur Semesta' },
      { id: 5, url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800', desc: 'Gamelan Sakral Pengiring Langkah Jiwa' },
      { id: 6, url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=800', desc: 'Cahaya Agung Kedamaian Bali' }
    ],
    birthday: [
      { id: 1, url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800', desc: 'Sparkles and Gold Atmosphere' },
      { id: 2, url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800', desc: 'Chic Celebration Lounge' },
      { id: 3, url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=800', desc: 'Exquisite Table Settings' },
      { id: 4, url: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&q=80&w=800', desc: 'Shining Warm Lights' },
      { id: 5, url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=800', desc: 'Endless Cheers & Night Toast' },
      { id: 6, url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', desc: 'Lively Beats and Afterparty' }
    ]
  };

  if (!isOpen) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col justify-between items-center ${eventType === 'metatah' ? 'bg-[#1D110D] text-[#FAF6F0]' : 'bg-[#0B0F19] text-[#E2E8F0]'} p-6 text-center font-jakarta overflow-hidden transition-colors duration-500`}>
        {/* Artistic luxury borders */}
        <div className={`absolute inset-4 md:inset-8 border ${eventType === 'metatah' ? 'border-[#C5A85A]/30' : 'border-[#D4AF37]/20'} pointer-events-none rounded-lg z-10`}></div>
        <div className={`absolute inset-5 md:inset-10 border ${eventType === 'metatah' ? 'border-[#C5A85A]/10' : 'border-[#D4AF37]/5'} pointer-events-none rounded-lg z-10`}></div>
        
        {/* Animated Background Ornaments */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <div className={`w-[120vw] h-[120vw] border-[40px] ${eventType === 'metatah' ? 'border-[#C5A85A]' : 'border-[#D4AF37]'} rounded-full animate-rotate-slow`}></div>
        </div>

        {/* Dynamic Theme/Event Switcher on Cover */}
        <div className="pt-6 z-20 flex flex-col items-center space-y-4">
          <span className={`text-[10px] tracking-[0.4em] ${eventType === 'metatah' ? 'text-[#C5A85A]' : 'text-[#D4AF37]'} uppercase font-bold`}>PILIH MODE UNDANGAN</span>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex gap-2">
            <button 
              onClick={() => setEventType('metatah')}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${eventType === 'metatah' ? 'bg-[#C5A85A] text-[#1D110D] shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Metatah (Bali)
            </button>
            <button 
              onClick={() => setEventType('birthday')}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${eventType === 'birthday' ? 'bg-[#D4AF37] text-[#0B0F19] shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Ulang Tahun (Gala)
            </button>
          </div>
        </div>

        {/* Core welcoming block */}
        <div className="my-auto max-w-2xl z-20 space-y-8 px-4">
          <div className="flex justify-center mb-2">
            {eventType === 'metatah' ? (
              <BalineseOrnament className="w-16 h-16 animate-float-gentle text-[#C5A85A]" color="#C5A85A" />
            ) : (
              <LuxuryStarOrnament className="w-16 h-16 animate-float-gentle text-[#D4AF37]" color="#D4AF37" />
            )}
          </div>

          <span className={`text-xs uppercase tracking-[0.35em] ${eventType === 'metatah' ? 'text-[#C5A85A]' : 'text-[#94A3B8]'} font-semibold block`}>
            {currentConfig.subtitle}
          </span>
          
          <h1 className={`text-5xl md:text-7xl ${currentConfig.fontTitle} font-light tracking-wide text-white leading-tight`}>
            {eventType === 'metatah' ? (
              <>
                Raditya <span className="font-cursive-love text-4xl md:text-6xl text-[#C5A85A] block md:inline md:mx-4">&</span> Ayu Candra
              </>
            ) : (
              <>
                Gwyneth Amanda
              </>
            )}
          </h1>
          
          <p className={`text-xs italic leading-relaxed max-w-md mx-auto ${eventType === 'metatah' ? 'text-[#FAF6F0]/80 font-luxury-serif' : 'text-[#94A3B8] font-playfair'}`}>
            {eventType === 'metatah' 
              ? '"Sembah suci manusa yadnya memohon keselarasan jiwa, melepaskan kegelapan sifat angkara murka."' 
              : '"Celebrating twenty-five years of dreams, laughter, and a radiant journey ahead."'}
          </p>
          
          {/* Guest Name Parameter Display */}
          <div className="pt-6 space-y-3">
            <span className={`text-[10px] uppercase tracking-widest ${eventType === 'metatah' ? 'text-[#C5A85A]/80' : 'text-[#94A3B8]'} block font-semibold`}>Yth. Bapak/Ibu/Saudara/i:</span>
            <div className={`bg-white/5 backdrop-blur-md border ${eventType === 'metatah' ? 'border-[#C5A85A]/40' : 'border-[#D4AF37]/30'} rounded-2xl p-5 px-8 inline-block shadow-2xl relative`}>
              <span className="font-luxury-serif text-2xl md:text-3xl font-light text-white block tracking-wide">{guestName}</span>
              <span className={`text-[9px] ${eventType === 'metatah' ? 'text-[#C5A85A]' : 'text-[#D4AF37]'} uppercase tracking-widest mt-2 block font-bold`}>Tamu Kehormatan Kami</span>
            </div>
          </div>

          {/* Enter Button */}
          <div className="pt-4">
            <button 
              onClick={handleOpenInvitation}
              className={`px-8 py-3.5 ${eventType === 'metatah' ? 'bg-[#C5A85A] hover:bg-white text-[#1D110D]' : 'bg-[#D4AF37] hover:bg-white text-[#0B0F19]'} font-bold rounded-full shadow-2xl transition-all duration-300 transform hover:-translate-y-1 tracking-[0.2em] text-[11px] uppercase flex items-center gap-2.5 mx-auto`}
            >
              <Sparkles className="w-4 h-4 animate-spin" />
              Buka Undangan
            </button>
          </div>
        </div>

        {/* Elegant Footer signature */}
        <div className="mb-6 z-20">
          <p className="text-[9px] text-[#94A3B8] tracking-[0.35em] uppercase">#ElegantCelebrationDigital</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentConfig.lightBg} ${currentConfig.textColor} font-jakarta relative overflow-x-hidden transition-colors duration-500`}>
      
      {/* Background Audio Source */}
      <audio 
        ref={audioRef} 
        src={currentConfig.musicUrl} 
        loop
      />

      {/* Persistent Top Switcher Header */}
      <div className="fixed top-0 inset-x-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/5 py-3 px-6 flex justify-between items-center">
        <span className={`text-xs font-bold tracking-[0.15em] ${eventType === 'metatah' ? 'text-[#C5A85A]' : 'text-[#D4AF37]'} uppercase hidden sm:block`}>
          {currentConfig.title}
        </span>
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300">Ganti Event:</span>
          <div className="bg-black/40 border border-white/10 rounded-full p-1 flex gap-1">
            <button 
              onClick={() => setEventType('metatah')}
              className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-all duration-300 ${eventType === 'metatah' ? 'bg-[#C5A85A] text-[#1D110D]' : 'text-gray-400'}`}
            >
              Metatah
            </button>
            <button 
              onClick={() => setEventType('birthday')}
              className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-all duration-300 ${eventType === 'birthday' ? 'bg-[#D4AF37] text-[#0B0F19]' : 'text-gray-400'}`}
            >
              Ulang Tahun
            </button>
          </div>
        </div>
      </div>

      {/* Ambient Float Music Button (Bottom Right) */}
      <button 
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 p-4 bg-white text-[#111] rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Toggle Event Music"
      >
        {isPlaying ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#111] hidden md:inline">Mute</span>
            <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#111] hidden md:inline">Play Sound</span>
            <VolumeX className="w-4 h-4 text-rose-500" />
          </div>
        )}
      </button>

      {/* ==================== 1. HERO SECTION ==================== */}
      <section id="hero" className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b ${eventType === 'metatah' ? 'from-[#1D110D] to-[#361B14]' : 'from-[#0B0F19] to-[#1E1B4B]'} text-white`}>
        <div className="absolute inset-0 opacity-20 pointer-events-none scale-105 animate-scale-slow">
          <img 
            src={eventType === 'metatah' ? 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1600' : 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1600'} 
            alt="Event Hero Backdrop" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Elegant Frame Corners */}
        <div className={`absolute top-16 left-8 w-12 h-12 border-t border-l ${eventType === 'metatah' ? 'border-[#C5A85A]/60' : 'border-[#D4AF37]/50'} rounded-tl-lg pointer-events-none`}></div>
        <div className={`absolute top-16 right-8 w-12 h-12 border-t border-r ${eventType === 'metatah' ? 'border-[#C5A85A]/60' : 'border-[#D4AF37]/50'} rounded-tr-lg pointer-events-none`}></div>
        <div className={`absolute bottom-8 left-8 w-12 h-12 border-b border-l ${eventType === 'metatah' ? 'border-[#C5A85A]/60' : 'border-[#D4AF37]/50'} rounded-bl-lg pointer-events-none`}></div>
        <div className={`absolute bottom-8 right-8 w-12 h-12 border-b border-r ${eventType === 'metatah' ? 'border-[#C5A85A]/60' : 'border-[#D4AF37]/50'} rounded-br-lg pointer-events-none`}></div>

        <div className="container mx-auto px-6 py-24 text-center relative z-10 flex flex-col justify-between min-h-[85vh]">
          <div className="space-y-3 animate-fade-up">
            <span className={`text-[10px] uppercase tracking-[0.4em] ${eventType === 'metatah' ? 'text-[#C5A85A]' : 'text-[#D4AF37]'} font-semibold block`}>
              {currentConfig.heroSubtitle}
            </span>
            <div className={`h-[1px] w-24 mx-auto ${eventType === 'metatah' ? 'bg-[#C5A85A]/40' : 'bg-[#D4AF37]/40'}`}></div>
          </div>

          <div className="my-auto space-y-6">
            <h1 className={`text-6xl md:text-8xl ${currentConfig.fontTitle} font-light tracking-wide text-white leading-tight`}>
              {eventType === 'metatah' ? (
                <>
                  Metatah & <br />
                  <span className="text-[#C5A85A] font-cursive-love text-5xl md:text-8xl block mt-2">Mepandes</span>
                </>
              ) : (
                <>
                  Gwyneth <br />
                  <span className="text-[#D4AF37] font-playfair text-4xl md:text-6xl block mt-3 italic">Amanda Wardana</span>
                </>
              )}
            </h1>
            <p className={`text-xs md:text-sm tracking-[0.25em] uppercase ${eventType === 'metatah' ? 'text-[#C5A85A]' : 'text-[#D4AF37]'} font-bold`}>
              {eventType === 'metatah' ? 'Sabtu, 24 Juli 2027 • Denpasar, Bali' : 'Sunday, 12 September 2027 • Uluwatu, Bali'}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[9px] uppercase tracking-widest text-[#FAF6F0]/60">GULIR PERLAHAN</p>
            <div className={`w-[1px] h-10 ${eventType === 'metatah' ? 'bg-[#C5A85A]' : 'bg-[#D4AF37]'} mx-auto`}></div>
          </div>
        </div>
      </section>

      {/* ==================== 2. QUOTE SECTION ==================== */}
      <section className={`py-28 ${eventType === 'metatah' ? 'bg-[#FAF6F0] border-y border-[#C5A85A]/20' : 'bg-[#0F172A] border-y border-white/5'} relative overflow-hidden`}>
        <div className="absolute -top-16 -left-16 w-48 h-48 opacity-[0.05] pointer-events-none">
          <BalineseOrnament className="w-full h-full" />
        </div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 opacity-[0.05] pointer-events-none">
          <BalineseOrnament className="w-full h-full" />
        </div>

        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <div className="flex justify-center mb-6">
            {eventType === 'metatah' ? (
              <BalineseOrnament className="w-8 h-8 text-[#C5A85A]" />
            ) : (
              <LuxuryStarOrnament className="w-8 h-8 text-[#D4AF37]" />
            )}
          </div>
          
          <h3 className={`text-[10px] uppercase tracking-[0.3em] mb-6 font-bold ${eventType === 'metatah' ? 'text-gray-500' : 'text-[#D4AF37]'}`}>
            {currentConfig.quotesHeader}
          </h3>
          
          <p className={`text-2xl md:text-3xl font-light italic leading-relaxed px-4 ${eventType === 'metatah' ? 'font-luxury-serif text-[#1D110D]' : 'font-playfair text-white'}`}>
            {currentConfig.quoteText}
          </p>
          
          <div className={`w-20 h-[1px] mx-auto my-8 ${eventType === 'metatah' ? 'bg-[#C5A85A]' : 'bg-[#D4AF37]'}`}></div>
          
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">
            — {currentConfig.quoteAuthor}
          </p>
        </div>
      </section>

      {/* ==================== 3. COUNTDOWN SECTION ==================== */}
      <section className={`py-28 ${eventType === 'metatah' ? 'bg-[#1D110D]' : 'bg-[#0B0F19]'} text-white relative`}>
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <span className={`text-[10px] uppercase tracking-[0.4em] ${eventType === 'metatah' ? 'text-[#C5A85A]' : 'text-[#D4AF37]'} font-semibold block mb-2`}>WAKTU YANG DINANTI</span>
          <h2 className={`${currentConfig.fontTitle} text-3xl md:text-5xl text-white tracking-wide font-light mb-12`}>Menghitung Hari Suci</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: timeLeft.days, label: 'Hari Lagi' },
              { value: timeLeft.hours, label: 'Jam' },
              { value: timeLeft.minutes, label: 'Menit' },
              { value: timeLeft.seconds, label: 'Detik' }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-center transform hover:-translate-y-1 transition-all duration-300 shadow-2xl relative"
              >
                <span className={`text-4xl md:text-5xl ${currentConfig.fontTitle} font-light ${eventType === 'metatah' ? 'text-[#C5A85A]' : 'text-[#D4AF37]'} mb-2`}>
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <a 
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(currentConfig.title)}&dates=20270724T080000Z/20270724T130000Z&details=Undangan+Mulia+Acara+${encodeURIComponent(currentConfig.title)}&location=Bali&sf=true&output=xml`}
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2.5 px-8 py-3.5 ${eventType === 'metatah' ? 'bg-[#C5A85A] text-[#1D110D]' : 'bg-[#D4AF37] text-[#0B0F19]'} hover:bg-white transition-colors duration-300 font-bold rounded-full text-[10px] uppercase tracking-widest`}
            >
              <Calendar className="w-4 h-4" /> Simpan Agenda Acara
            </a>
          </div>
        </div>
      </section>

      {/* ==================== 4. PROFILES OF CELEBRANTS ==================== */}
      <section className={`py-28 ${eventType === 'metatah' ? 'bg-[#FAF6F0]' : 'bg-[#0F172A]'} relative`}>
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">PROFIL UTAMA</span>
            <h2 className={`${currentConfig.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light`}>{currentConfig.celebrantLabel}</h2>
            <div className={`h-[1px] w-24 mx-auto mt-4 ${eventType === 'metatah' ? 'bg-[#C5A85A]' : 'bg-[#D4AF37]'}`}></div>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-24">
            {currentConfig.celebrants.map((celebrant, index) => (
              <div key={index} className="text-center max-w-xs space-y-6 flex flex-col items-center">
                <div className={`relative w-60 h-60 rounded-full p-2 border ${eventType === 'metatah' ? 'border-[#C5A85A]' : 'border-[#D4AF37]'} shadow-xl overflow-hidden group`}>
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img 
                      src={celebrant.avatar} 
                      alt={celebrant.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className={`absolute top-4 right-4 ${eventType === 'metatah' ? 'bg-[#1D110D]' : 'bg-[#0B0F19]'} p-2.5 rounded-full border ${eventType === 'metatah' ? 'border-[#C5A85A]' : 'border-[#D4AF37]'}`}>
                    {eventType === 'metatah' ? <BalineseOrnament className="w-3.5 h-3.5" /> : <LuxuryStarOrnament className="w-3.5 h-3.5" />}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className={`${currentConfig.fontTitle} text-2xl font-light`}>{celebrant.name}</h3>
                  <span className={`text-[10px] tracking-[0.2em] uppercase ${eventType === 'metatah' ? 'text-[#C5A85A]' : 'text-[#D4AF37]'} font-bold block`}>
                    {celebrant.subName}
                  </span>
                </div>
                
                <div className="text-xs leading-relaxed text-gray-400">
                  <p className="font-semibold text-gray-500 mb-1">Mengenai:</p>
                  <p className="italic font-light">{celebrant.parent}</p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-2 font-semibold">{celebrant.origin}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 5. STORY / MEANING OF EVENT ==================== */}
      <section className={`py-28 ${eventType === 'metatah' ? 'bg-[#EFEAE2]' : 'bg-[#0B0F19]'} relative overflow-hidden`}>
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-20">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">FILOSOFI & MAKNA</span>
            <h2 className={`${currentConfig.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light`}>{currentConfig.storyTitle}</h2>
            <div className={`h-[1px] w-24 mx-auto mt-4 ${eventType === 'metatah' ? 'bg-[#C5A85A]' : 'bg-[#D4AF37]'}`}></div>
          </div>

          <p className="text-center text-xs md:text-sm text-gray-400 max-w-xl mx-auto mb-16 leading-relaxed">
            {currentConfig.storyIntro}
          </p>

          <div className={`relative border-l ${eventType === 'metatah' ? 'border-[#C5A85A]/40' : 'border-white/10'} ml-4 md:ml-32 space-y-12`}>
            {currentConfig.storySteps.map((step, index) => (
              <div key={index} className="relative pl-8 md:pl-16 group">
                <span className={`absolute -left-3 top-1 flex items-center justify-center w-6 h-6 rounded-full text-white ring-8 ${eventType === 'metatah' ? 'bg-[#1D110D] ring-[#EFEAE2]' : 'bg-[#D4AF37] ring-[#0B0F19]'}`}>
                  {eventType === 'metatah' ? <BalineseOrnament className="w-2.5 h-2.5 text-[#C5A85A]" /> : <LuxuryStarOrnament className="w-2.5 h-2.5 text-[#0B0F19]" />}
                </span>

                <span className={`hidden md:block absolute -left-32 top-1 text-right w-24 font-light text-sm ${eventType === 'metatah' ? 'text-[#1D110D] font-luxury-serif' : 'text-[#D4AF37] font-playfair'}`}>
                  {step.year}
                </span>

                <div className={`rounded-xl p-6 shadow-sm border ${eventType === 'metatah' ? 'bg-white border-[#C5A85A]/20' : 'bg-white/5 border-white/5'} transition-all duration-300 hover:shadow-lg`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                    <span className="md:hidden text-[9px] font-bold text-gray-400 bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {step.year}
                    </span>
                    <h4 className={`text-lg font-bold ${eventType === 'metatah' ? 'text-[#1D110D]' : 'text-white'}`}>
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. GALLERY SECTION ==================== */}
      <section className={`py-28 ${eventType === 'metatah' ? 'bg-[#FAF6F0]' : 'bg-[#0F172A]'} relative`}>
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">GALERI ACARA</span>
            <h2 className={`${currentConfig.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light`}>{currentConfig.galleryTitle}</h2>
            <div className={`h-[1px] w-24 mx-auto mt-4 ${eventType === 'metatah' ? 'bg-[#C5A85A]' : 'bg-[#D4AF37]'}`}></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryPhotos[eventType].map((photo) => (
              <div 
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="relative overflow-hidden aspect-[3/4] rounded-2xl cursor-pointer group shadow-lg border border-white/5 bg-black/25"
              >
                <img 
                  src={photo.url} 
                  alt={photo.desc} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                  <div className="text-white text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Camera className="w-4 h-4" />
                      <span className="uppercase tracking-widest text-[9px] font-bold">Zoom Photo</span>
                    </div>
                    <p className="font-light tracking-wide text-gray-200">{photo.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {activePhoto && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fade-up"
            onClick={() => setActivePhoto(null)}
          >
            <div className="relative max-w-2xl w-full max-h-[85vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <img 
                src={activePhoto.url} 
                alt={activePhoto.desc} 
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl border border-white/10"
              />
              <p className="text-[#C5A85A] text-center mt-5 text-xs tracking-wider uppercase font-semibold">{activePhoto.desc}</p>
              
              <button 
                onClick={() => setActivePhoto(null)}
                className="mt-6 px-5 py-2 border border-white/20 hover:border-white text-white rounded-full text-[10px] uppercase tracking-widest transition-colors duration-300"
              >
                TUTUP MEDIA
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ==================== 7. AGENDA & TIMELINE SECTION ==================== */}
      <section className={`py-28 ${eventType === 'metatah' ? 'bg-[#EFEAE2]' : 'bg-[#0B0F19]'} relative`}>
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">RUNTUTAN KEGIATAN</span>
            <h2 className={`${currentConfig.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light`}>Agenda Utama</h2>
            <div className={`h-[1px] w-24 mx-auto mt-4 ${eventType === 'metatah' ? 'bg-[#C5A85A]' : 'bg-[#D4AF37]'}`}></div>
          </div>

          <div className="flex justify-center space-x-4 mb-10 max-w-md mx-auto">
            {['acara_utama', 'resepsi'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border text-center ${
                  activeTab === tab 
                    ? `bg-[#111e14] text-white border-black shadow-md` 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-amber-500'
                }`}
              >
                {tab === 'acara_utama' ? currentConfig.schedule.tab1 : currentConfig.schedule.tab2}
              </button>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            {activeTab === 'acara_utama' && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-500/10 text-center space-y-6 text-[#1D110D] animate-fade-up">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-[#C5A85A]">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className={`${currentConfig.fontTitle} text-2xl font-light`}>{currentConfig.schedule.details1.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 border-y border-gray-100 py-5">
                  <div className="space-y-1 flex flex-col items-center">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-gray-700">Tanggal Acara</span>
                    <span>{currentConfig.schedule.details1.date}</span>
                  </div>
                  <div className="space-y-1 flex flex-col items-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-gray-700">Waktu Pelaksanaan</span>
                    <span>{currentConfig.schedule.details1.time}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <MapPin className="w-4 h-4 text-amber-600 mx-auto" />
                  <span className="font-bold text-xs text-gray-700 block">Lokasi Kegiatan</span>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    {currentConfig.schedule.details1.location}
                  </p>
                </div>

                <p className="text-xs text-gray-400 italic max-w-md mx-auto pt-2">
                  {currentConfig.schedule.details1.desc}
                </p>
              </div>
            )}

            {activeTab === 'resepsi' && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-500/10 text-center space-y-6 text-[#1D110D] animate-fade-up">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-[#C5A85A]">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className={`${currentConfig.fontTitle} text-2xl font-light`}>{currentConfig.schedule.details2.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 border-y border-gray-100 py-5">
                  <div className="space-y-1 flex flex-col items-center">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-gray-700">Tanggal Acara</span>
                    <span>{currentConfig.schedule.details2.date}</span>
                  </div>
                  <div className="space-y-1 flex flex-col items-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-gray-700">Waktu Pelaksanaan</span>
                    <span>{currentConfig.schedule.details2.time}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <MapPin className="w-4 h-4 text-amber-600 mx-auto" />
                  <span className="font-bold text-xs text-gray-700 block">Lokasi Kegiatan</span>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    {currentConfig.schedule.details2.location}
                  </p>
                </div>

                <p className="text-xs text-gray-400 italic max-w-md mx-auto pt-2">
                  {currentConfig.schedule.details2.desc}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== 8. MAPS SECTION ==================== */}
      <section className={`py-28 ${eventType === 'metatah' ? 'bg-[#FAF6F0]' : 'bg-[#0F172A]'} relative`}>
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">AKSES NAVIGASI</span>
            <h2 className={`${currentConfig.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light`}>Peta Lokasi Acara</h2>
            <div className={`h-[1px] w-24 mx-auto mt-4 ${eventType === 'metatah' ? 'bg-[#C5A85A]' : 'bg-[#D4AF37]'}`}></div>
          </div>

          <div className="bg-black/10 rounded-2xl overflow-hidden border border-white/5 shadow-2xl p-2 mb-8 max-w-3xl mx-auto">
            <iframe 
              title="Google Maps Location"
              src={currentConfig.mapUrl}
              width="100%" 
              height="380" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-80 rounded-xl"
            ></iframe>
          </div>

          <a 
            href={currentConfig.gmapBtnLink}
            target="_blank" 
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-8 py-3.5 ${eventType === 'metatah' ? 'bg-[#1D110D] text-white hover:bg-[#C5A85A]' : 'bg-[#D4AF37] text-[#0B0F19] hover:bg-white'} font-bold rounded-full text-[10px] uppercase tracking-widest transition-all duration-300`}
          >
            <Map className="w-4 h-4" /> Buka Google Maps
          </a>
        </div>
      </section>

      {/* ==================== 9. RSVP & GUEST WISHES SECTION ==================== */}
      <section className={`py-28 ${eventType === 'metatah' ? 'bg-[#EFEAE2]' : 'bg-[#0B0F19]'} relative`}>
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">KONFIRMASI KEHADIRAN</span>
            <h2 className={`${currentConfig.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light`}>Form RSVP & Ucapan</h2>
            <div className={`h-[1px] w-24 mx-auto mt-4 ${eventType === 'metatah' ? 'bg-[#C5A85A]' : 'bg-[#D4AF37]'}`}></div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleRsvpSubmit} className="lg:col-span-5 bg-white text-[#111] rounded-2xl p-6 shadow-md border border-gray-100 space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-bold">NAMA LENGKAP</label>
                <input 
                  type="text" 
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Contoh: Gusti Ngurah"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-bold">STATUS PRESENSI</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Hadir', 'Tidak Hadir'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setRsvpStatus(opt)}
                      className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all ${
                        rsvpStatus === opt 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-gray-500 border-gray-150 hover:bg-gray-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {rsvpStatus === 'Hadir' && (
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-bold">JUMLAH TAMU</label>
                  <div className="relative">
                    <select
                      value={rsvpGuests}
                      onChange={(e) => setRsvpGuests(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 text-xs focus:outline-none bg-gray-50/50 appearance-none"
                    >
                      <option value="1">1 Person</option>
                      <option value="2">2 Persons</option>
                      <option value="3">3 Persons</option>
                      <option value="4">4 Persons</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-bold">DOA RESTU & HARAPAN</label>
                <textarea 
                  required
                  rows="4"
                  value={rsvpWish}
                  onChange={(e) => setRsvpWish(e.target.value)}
                  placeholder="Kirimkan restu mulia bagi keberlangsungan acara..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-50/50"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 ${eventType === 'metatah' ? 'bg-[#8C3A22]' : 'bg-[#D4AF37] text-[#0B0F19]'} text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2`}
              >
                <Send className="w-3.5 h-3.5" /> KIRIM KONFIRMASI
              </button>
            </form>

            <div className="lg:col-span-7 bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col h-[460px]">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" /> 
                <span>Kesan & Pesan ({wishes[eventType].length})</span>
              </h4>
              <div className="overflow-y-auto space-y-3.5 pr-1 flex-1">
                {wishes[eventType].map((item, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/5 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[7px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          item.status === 'Hadir' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-[8px] text-gray-400">{item.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">{item.wish}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 10. DIGITAL GIFTS / DONATION ==================== */}
      <section className={`py-28 ${eventType === 'metatah' ? 'bg-[#FAF6F0]' : 'bg-[#0F172A]'} relative`}>
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-gray-400 font-bold">HADIAH DIGITAL</span>
            <h2 className={`${currentConfig.fontTitle} text-3xl md:text-5xl mt-2 tracking-wide font-light`}>Tanda Kasih Acara</h2>
            <div className={`h-[1px] w-24 mx-auto mt-4 ${eventType === 'metatah' ? 'bg-[#C5A85A]' : 'bg-[#D4AF37]'}`}></div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto mb-12 font-light">
            Doa restu tulus Anda merupakan kado terindah bagi kami. Namun jika Anda bermaksud mengirimkan tanda kasih secara cashless, silakan menggunakan rekening di bawah ini:
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {currentConfig.gifts.map((gift, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col justify-between text-left shadow-lg">
                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block">Transfer Elektronik</span>
                  <p className={`${currentConfig.fontTitle} text-xl font-bold`}>{gift.bank}</p>
                  
                  <div className="bg-black/20 p-3 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="font-mono text-xs tracking-wider text-white font-semibold">{gift.number}</span>
                    <button 
                      onClick={() => copyToClipboard(gift.number, index)}
                      className="text-[9px] flex items-center gap-1 text-amber-400 hover:text-white font-bold uppercase tracking-wider"
                    >
                      {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedIndex === index ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    <span className="block font-semibold">Atas Nama:</span>
                    <span>{gift.owner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 11. FOOTER ==================== */}
      <footer className={`py-20 ${eventType === 'metatah' ? 'bg-[#1D110D]' : 'bg-[#0B0F19]'} text-white relative text-center border-t border-white/5`}>
        <div className="absolute bottom-6 left-6 w-12 h-12 opacity-5">
          <BalineseOrnament className="w-full h-full text-white" />
        </div>
        <div className="absolute bottom-6 right-6 w-12 h-12 opacity-5">
          <BalineseOrnament className="w-full h-full text-white" />
        </div>

        <div className="container mx-auto px-6 max-w-3xl space-y-6 relative z-10">
          <h4 className={`${currentConfig.fontTitle} text-2xl font-light text-white tracking-widest`}>
            {eventType === 'metatah' ? 'Raditya & Ayu Candra' : 'Gwyneth Amanda Wardana'}
          </h4>
          
          <p className="text-xs leading-relaxed max-w-md mx-auto text-gray-400 font-light">
            Suatu kebahagiaan serta kehormatan besar bagi kami sekeluarga, jika Bapak/Ibu/Saudara/i berkenan hadir memberikan restu mulia bagi kelancaran kegiatan suci kami.
          </p>

          <p className={`text-[10px] uppercase tracking-[0.25em] ${eventType === 'metatah' ? 'text-[#C5A85A]' : 'text-[#D4AF37]'} font-bold`}>
            {eventType === 'metatah' ? 'OM SHANTI SHANTI SHANTI OM' : 'THANK YOU FOR BEING A PART OF MY JOURNEY'}
          </p>

          <div className="w-16 h-[1px] bg-white/10 mx-auto"></div>

          <p className="text-[9px] text-gray-500 tracking-wider font-light">
            © 2027 Celebration Planner Studio. Responsive, High-End Layout. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}