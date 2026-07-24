/**
 * Seed the 15 mobile monolithic wedding templates (flora → hutan) with realistic
 * Indonesian sample data + verified wedding/couple photos, then PUBLISH each
 * (snapshot-on-publish circuit) so they render live + are immutable.
 *
 * Targets PRODUCTION by default (lumina.prvtech.site). Override:
 *   LUMINA_BASE_URL=http://localhost:3006 LUMINA_PASSWORD=... node scripts/seed-mobile-prod.mjs
 *
 * Photos: curated, curl-verified Unsplash (wedding/couple/bride-portrait).
 * All 15 templates are kind=monolithic, registered in prod (/api/templates).
 * Idempotent: skips slugs that already exist. Re-publishes existing ones so the
 * snapshot picks up fresh data (publishInvitation re-freezes content).
 */
const BASE = process.env.LUMINA_BASE_URL || 'https://lumina.prvtech.site';
const PASSWORD = process.env.LUMINA_PASSWORD || 'lumina-studio-2026';

// ─── Verified (HTTP 200) Unsplash photo pools ────────────────
// Pool A — wedding couple / scenes (cover, hero, gallery, story)
const CA = [
  '1520854221256-17451cc331bf', '1532712938310-34cb3982ef74', '1591604466107-ec97de577aff',
  '1519741497674-611481863552', '1621801306185-8c0ccf9c8eb8', '1606216794079-73f85bbd57d5',
  '1599462616558-2b75fd26a283', '1606216794074-735e91aa2c92', '1621621667797-e06afc217fb0',
  '1596457221755-b96bc3a6df18', '1550784718-990c6de52adf', '1460978812857-470ed1c77af0',
  '1546032996-6dfacbacbf3f', '1630526720753-aa4e71acf67d', '1563808599481-34a342e44508',
];
// Pool B — bride/groom portraits (partner photos)
const PB = [
  '1600685890506-593fdf55949b', '1492175742197-ed20dc5a6bed', '1684868265715-03e19a3e0e00',
  '1677691257363-eebd2abeafec', '1677691257001-8bfd91e288ff', '1677691257005-9d69ab23f485',
  '1665960211264-5e0a7112bacd', '1684868264391-a6dfb89882dd', '1722805740076-7c51a8669afc',
  '1533417020304-c785906cd8f9', '1536567307162-551e460b7fc2', '1476836349418-180f91b52141',
  '1722952908681-944d47e45853', '1501175635532-bdd01562edb2', '1658909934911-1161efa3f9fb',
];
const img = (id, w, h) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;
const AUDIO = Array.from({ length: 16 }, (_, i) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`);

/** Themed media bundle for template index i (distinct per template). */
function media(i) {
  return {
    cover: img(CA[i % 15], 800, 1200),
    hero: img(CA[(i + 5) % 15], 1200, 800),
    partner1Photo: img(PB[i % 15], 500, 500),
    partner2Photo: img(PB[(i + 7) % 15], 500, 500),
    story: img(CA[(i + 3) % 15], 600, 400),
    og: img(CA[(i + 2) % 15], 1200, 630),
    gallery: [
      img(CA[i % 15], 500, 500), img(PB[(i + 1) % 15], 500, 500),
      img(CA[(i + 6) % 15], 500, 500), img(PB[(i + 9) % 15], 500, 500),
      img(CA[(i + 11) % 15], 500, 500), img(CA[(i + 8) % 15], 500, 500),
    ],
  };
}
const maps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

// ─── 15 realistic Indonesian wedding samples (flora → hutan) ─
const SAMPLES = [
  { slug: 'sample-flora', templateId: 'undangan-flora',
    couple: { partner1: 'Bagus', partner2: 'Intan', partner1Title: 'Bagus Pradipta', partner2Title: 'Intan Maharani', partner1Father: 'Bpk. Sugianto Pradipta', partner1Mother: 'Ibu Retno Wulandari', partner2Father: 'Bpk. Hendra Maharani', partner2Mother: 'Ibu Sri Lestari', partner1Instagram: '@baguspradipta', partner2Instagram: '@intanmaharani' },
    event: { date: 'Sabtu, 14 November 2026', time: '09:00 - 14:00 WIB', location: 'Kebun Raya Bogor', address: 'Jl. Ir. H. Juanda No.13, Bogor', mapsUrl: maps('Kebun Raya Bogor'), note: 'Resepsi taman terbuka, busana semi-formal.' },
    story: { title: 'Mekar di Taman', paragraphs: ['Bagus dan Intan bertemu di acara workshop florikultura di Kebun Raya Bogor.', 'Dari kebersamaan merawat bunga, tumbuh cinta yang sederhana dan tulus.', 'Taman yang menjadi saksi pertemuan kami kini menjadi tempat kami berjanji sehidup semati.'], imagePosition: 'left' },
    stories: [{ year: '2021', title: 'Workshop Bunga', desc: 'Bertemu pertama kali saat merangkai bouquet musim semi.' }, { year: '2023', title: 'Liburan ke Toba', desc: 'Perjalanan pertama bersama ke Danau Toba.' }, { year: '2025', title: 'Lamaran di Taman', desc: 'Bagus melamar Intan di gazebo tempat mereka pertama bertemu.' }],
    schedule: { title: 'Rangkaian Acara', items: [{ time: '09:00 - 10:00 WIB', title: 'Akad Nikah', venue: 'Pendopo Kebun Raya', address: 'Jl. Ir. H. Juanda No.13, Bogor', mapsUrl: maps('Kebun Raya Bogor') }, { time: '11:00 - 14:00 WIB', title: 'Resepsi', venue: 'Garden Hall', address: 'Kebun Raya Bogor' }] },
    quote: { text: 'Seperti bunga yang mekar di musimnya, cinta kami tumbuh indah pada waktunya.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi kehadiran sebelum 7 November 2026.', deadline: '2026-11-07', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0281193345', owner: 'Bagus Pradipta' }, { bank: 'Bank Mandiri', number: '145009877120', owner: 'Intan Maharani' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan ucapan untuk kami!', showMessages: true },
    footer: { text: 'Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.', showCredit: true },
    music: { src: AUDIO[0], title: 'Perfect — Ed Sheeran (Instrumental)', autoplay: true } },

  { slug: 'sample-hana', templateId: 'hana',
    couple: { partner1: 'Rakha', partner2: 'Tasya', partner1Title: 'Rakha Santoso', partner2Title: 'Tasya Wijayanti', partner1Father: 'Bpk. Anton Santoso', partner1Mother: 'Ibu Diah Kumala', partner2Father: 'Bpk. Bambang Wijayanto', partner2Mother: 'Ibu Kartika Sari', partner1Instagram: '@rakhasantoso', partner2Instagram: '@tasyawijayanti' },
    event: { date: 'Minggu, 6 Desember 2026', time: '11:00 - 15:00 WIB', location: 'Grand Ballroom Hotel Indonesia, Jakarta', address: 'Jl. M.H. Thamrin No.1, Jakarta Pusat', mapsUrl: maps('Hotel Indonesia Jakarta'), note: 'Black tie. Resepsi elegan di ballroom utama.' },
    story: { title: 'Elegansi Sepanjang Masa', paragraphs: ['Rakha dan Tasya dipersatukan di sebuah acara gala amal di Hotel Indonesia.', 'Antara obrolan hangat dan tarian pertama, keduanya sadar ini adalah awal dari segalanya.', 'Kini mereka memilih tempat yang sama untuk mengikat janji suci di hadapan keluarga dan sahabat.'], imagePosition: 'right' },
    stories: [{ year: '2020', title: 'Gala Amal', desc: 'Pertemuan pertama di acara gala amal.' }, { year: '2022', title: 'Trip ke Eropa', desc: 'Menjelajahi Paris dan Roma bersama.' }, { year: '2025', title: 'Lamaran Mewah', desc: 'Rakha melamar dengan cincin berlian di rooftop.' }],
    schedule: { title: 'Grand Wedding', items: [{ time: '11:00 - 12:00 WIB', title: 'Pemberkatan', venue: 'Grand Ballroom', address: 'Hotel Indonesia, Jakarta' }, { time: '12:00 - 15:00 WIB', title: 'Resepsi & Jamuan', venue: 'Grand Ballroom', address: 'Hotel Indonesia, Jakarta' }] },
    quote: { text: 'Kesempurnaan cinta bukan tentang dilihat, melainkan tentang dikenang selamanya.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Konfirmasi kehadiran Anda sebelum 29 November 2026.', deadline: '2026-11-29', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0345512876', owner: 'Rakha Santoso' }, { bank: 'Bank BNI', number: '0987654321', owner: 'Tasya Wijayanti' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan ucapan terbaik Anda.', showMessages: true },
    footer: { text: 'Dengan penuh syukur, terima kasih atas kehadiran Anda di hari bahagia kami.', showCredit: true },
    music: { src: AUDIO[1], title: 'Canon in D — Pachelbel', autoplay: true } },

  { slug: 'sample-sakura', templateId: 'sakura',
    couple: { partner1: 'Arifin', partner2: 'Hana', partner1Title: 'Arifin Wicaksono', partner2Title: 'Hana Sakurako', partner1Father: 'Bpk. Wira Wicaksono', partner1Mother: 'Ibu Ayu Pradnya', partner2Father: 'Bpk. Hiroshi Sakurako', partner2Mother: 'Ibu Yuki Sakurako', partner1Instagram: '@arifinw', partner2Instagram: '@hanasakurako' },
    event: { date: 'Sabtu, 21 Maret 2027', time: '10:00 - 14:00 WIB', location: 'Taman Sakura Cikole, Lembang', address: 'Cikole, Lembang, Bandung Barat', mapsUrl: maps('Taman Sakura Cikole Lembang'), note: 'Busana pastel. Pernikahan di antara bunga sakura.' },
    story: { title: 'Bunga Sakura Pertama', paragraphs: ['Arifin dan Hana bertemu saat musim sakura mekar di Taman Cikole Lembang.', 'Di bawah rindangnya bunga sakura, Arifan menyatakan cinta pada Hana.', 'Tempat ini begitu bermakna, sehingga mereka memilihnya sebagai saksi janji suci.'] , imagePosition: 'left' },
    stories: [{ year: '2022', title: 'Musim Sakura', desc: 'Bertemu saat memotret mekarnya sakura.' }, { year: '2024', title: 'Trip ke Kyoto', desc: 'Menyaksikan hanami bersama di Jepang.' }, { year: '2026', title: 'Lamaran di Cikole', desc: 'Arifin melamar di taman tempat mereka bertemu.' }],
    schedule: { title: 'Wedding Ceremony', items: [{ time: '10:00 - 11:00 WIB', title: 'Holy Matrimony', venue: 'Sakura Garden', address: 'Taman Sakura Cikole, Lembang' }, { time: '11:30 - 14:00 WIB', title: 'Reception', venue: 'Garden Pavilion', address: 'Taman Sakura Cikole, Lembang' }] },
    quote: { text: 'Sakura mekarnya sebentar, namun cinta kami mekar selamanya.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 14 Maret 2027.', deadline: '2027-03-14', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0451128890', owner: 'Arifin Wicaksono' }, { bank: 'Bank Mandiri', number: '166009988210', owner: 'Hana Sakurako' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan pesan manis untuk kami.', showMessages: true },
    footer: { text: 'Arigatou gozaimasu! Terima kasih atas doa restunya.', showCredit: true },
    music: { src: AUDIO[2], title: 'Sakura Sakura — Traditional', autoplay: true } },

  { slug: 'sample-kaze', templateId: 'kaze',
    couple: { partner1: 'Bima', partner2: 'Larasati', partner1Title: 'Bima Sakti Mahendra', partner2Title: 'Larasati Anggraini', partner1Father: 'Bpk. Surya Mahendra', partner1Mother: 'Ibu Ningsih Putri', partner2Father: 'Bpk. Eko Anggraini', partner2Mother: 'Ibu Maya Sari', partner1Instagram: '@bimasakti', partner2Instagram: '@larasati.a' },
    event: { date: 'Jumat, 30 April 2027', time: '16:00 - 21:00 WITA', location: 'Cliff Villa, Uluwatu, Bali', address: 'Jl. Belimbing Sari, Uluwatu, Badung, Bali', mapsUrl: maps('Uluwatu Cliff Bali'), note: 'Sunset ceremony di tebing. Smart casual.' },
    story: { title: 'Angin di Tepi Tebing', paragraphs: ['Bima dan Larasati dipertemukan oleh surflah yang sama di Uluwatu.', 'Diterpa angin dan ditemani deburan ombak, keduanya jatuh cinta pada pemandangan—dan satu sama lain.', 'Tebing Uluwatu menjadi saksi janji suci mereka saat matahari terbenam.'] , imagePosition: 'right' },
    stories: [{ year: '2021', title: 'Surf di Uluwatu', desc: 'Bertemu di line-up saat menunggu ombak.' }, { year: '2023', title: 'Trip ke Nusa Penida', desc: 'Menyelam bersama di Crystal Bay.' }, { year: '2026', title: 'Lamaran Sunset', desc: 'Bima berlutut saat magri di tepi tebing.' }],
    schedule: { title: 'Sunset Wedding', items: [{ time: '16:00 - 17:00 WITA', title: 'Akad Nikah', venue: 'Cliff Deck', address: 'Uluwatu, Bali' }, { time: '17:30 - 21:00 WITA', title: 'Resepsi & Makan Malam', venue: 'Villa Garden', address: 'Uluwatu, Bali' }] },
    quote: { text: 'Angin membawa cinta, ombak menyaksikan janji, dan senja menjadi saksi.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 23 April 2027.', deadline: '2027-04-23', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0562289901', owner: 'Bima Sakti Mahendra' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Sampaikan doa terbaik Anda.', showMessages: true },
    footer: { text: 'Matur suksma! Terima kasih telah hadir menyaksikan hari kami.', showCredit: true },
    music: { src: AUDIO[3], title: 'Wind Song — Instrumental', autoplay: true } },

  { slug: 'sample-liana', templateId: 'liana',
    couple: { partner1: 'Galih', partner2: 'Mawar', partner1Title: 'Galih Saputra', partner2Title: 'Mawar Melati', partner1Father: 'Bpk. Hartono Saputra', partner1Mother: 'Ibu Wiji Lestari', partner2Father: 'Bpk. Suryadi Melati', partner2Mother: 'Ibu Endang Ruth', partner1Instagram: '@galihsaputra', partner2Instagram: '@mawarmelati' },
    event: { date: 'Sabtu, 22 Mei 2027', time: '09:00 - 14:00 WIB', location: 'Forest Lodge, Lembang', address: 'Jl. Raya Lembang No.108, Bandung Barat', mapsUrl: maps('Forest Lodge Lembang'), note: 'Resepsi outdoor di antara pepohonan.' },
    story: { title: 'Cinta yang Merambat', paragraphs: ['Galih dan Mawar bertemu saat aksi penanaman pohon di kawasan hutan Lembang.', 'Seperti tanaman rambat, cinta mereka tumbuh perlahan namun kuat, saling membelai dan menopang.', 'Di hutan yang menjadi saksi pertumbuhan cinta mereka, kini mereka berjanji sehidup semati.'], imagePosition: 'left' },
    stories: [{ year: '2020', title: 'Aksi Penanaman', desc: 'Bertemu saat program reboisasi Lembang.' }, { year: '2022', title: 'Camping Hutan', desc: 'Malam pertama berkemah di hutan pinus.' }, { year: '2025', title: 'Lamaran di Kebun', desc: 'Galih melamar di antara tanaman rambat favorit Mawar.' }],
    schedule: { title: 'Rangkaian Acara', items: [{ time: '09:00 - 10:00 WIB', title: 'Akad Nikah', venue: 'Forest Chapel', address: 'Forest Lodge, Lembang' }, { time: '10:30 - 14:00 WIB', title: 'Resepsi Garden Party', venue: 'Forest Garden', address: 'Forest Lodge, Lembang' }] },
    quote: { text: 'Cinta tumbuh seperti liana, perlahan namun tak terbendung oleh apapun.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 15 Mei 2027.', deadline: '2027-05-15', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank Mandiri', number: '177009966540', owner: 'Galih Saputra' }, { bank: 'Bank BRI', number: '0875321100', owner: 'Mawar Melati' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan pesan untuk penganteng.', showMessages: true },
    footer: { text: 'Terima kasih atas doa, restu, dan kehadirannya.', showCredit: true },
    music: { src: AUDIO[4], title: 'Botanical Dreams — Instrumental', autoplay: true } },

  { slug: 'sample-sora', templateId: 'sora',
    couple: { partner1: 'Anggara', partner2: 'Bintari', partner1Title: 'Anggara Pratama', partner2Title: 'Bintari Anjani', partner1Father: 'Bpk. Dwi Pratama', partner1Mother: 'Ibu Laras Wati', partner2Father: 'Bpk. Cahyo Anjani', partner2Mother: 'Ibu Dewi Ratna', partner1Instagram: '@anggarapratama', partner2Instagram: '@bintari.a' },
    event: { date: 'Sabtu, 10 Juli 2027', time: '18:00 - 22:30 WIB', location: 'Constellation Ballroom, Jakarta', address: 'Jl. Jend. Sudirman Kav. 1, Jakarta', mapsUrl: maps('Constellation Club Jakarta'), note: 'Evening reception. Busana formal gelap.' },
    story: { title: 'Di Bawah Langit Bertabur Bintang', paragraphs: ['Anggara dan Bintari saling jatuh hati saat berstagazing di observatorium.', 'Malam itu, sambil menunjuk rasi bintang, keduanya diam-diam berjanji untuk selalu bersama.', 'Kini mereka menikah di bawah langit-langit ballroom yang diterangi bintang-bintang tiruan.'], imagePosition: 'right' },
    stories: [{ year: '2021', title: 'Malam di Observatorium', desc: 'Bertemu saat acara pengamatan bintang.' }, { year: '2023', title: 'Trip ke Bromo', desc: 'Menyaksikan sunrise di atas lautan awan.' }, { year: '2026', title: 'Lamaran Bintang Jatuh', desc: 'Anggara melamar saat hujan meteor Perseid.' }],
    schedule: { title: 'Starry Evening', items: [{ time: '18:00 - 19:00 WIB', title: 'Cocktail & Welcome', venue: 'Sky Lounge', address: 'Constellation, Jakarta' }, { time: '19:00 - 22:30 WIB', title: 'Resepsi & Dinner', venue: 'Constellation Ballroom', address: 'Constellation, Jakarta' }] },
    quote: { text: 'Bintang-bintang di langit adalah saksi bahwa cinta kami teramat dalam.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 3 Juli 2027.', deadline: '2027-07-03', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0673399012', owner: 'Anggara Pratama' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan doa terbaik di sini.', showMessages: true },
    footer: { text: 'Sampai jumpa di bawah langit yang sama. Terima kasih!', showCredit: true },
    music: { src: AUDIO[5], title: 'A Sky Full of Stars — Instrumental', autoplay: true } },

  { slug: 'sample-matahari', templateId: 'matahari',
    couple: { partner1: 'Dimas', partner2: 'Surya', partner1Title: 'Dimas Ardila', partner2Title: 'Surya Pradnya', partner1Father: 'Bpk. Hendra Ardila', partner1Mother: 'Ibu Kadek Ayu', partner2Father: 'Bpk. Made Pradnya', partner2Mother: 'Ibu Wayan Sudewi', partner1Instagram: '@dimasardila', partner2Instagram: '@suryapradnya' },
    event: { date: 'Minggu, 15 Agustus 2027', time: '16:00 - 21:00 WITA', location: 'Beach Club, Seminyak, Bali', address: 'Jl. Petitenget, Seminyak, Badung, Bali', mapsUrl: maps('Seminyak Beach Club Bali'), note: 'Beach party. Tropical semi-formal attire.' },
    story: { title: 'Matahari yang Tak Pernah Tenggelam', paragraphs: ['Dimas dan Surya bertemu di beach club Seminyak saat matahari terbenam.', 'Saat itulah mereka sadar, cinta mereka akan bersinar terus seperti mentari.', 'Hari ini, di tempat yang sama, mereka berjanji untuk terus menerangi hari satu sama lain.'], imagePosition: 'left' },
    stories: [{ year: '2022', title: 'Sunset di Seminyak', desc: 'Bertemu saat menikmati sunset di beach club.' }, { year: '2024', title: 'Trip ke Gili', desc: 'Bersepeda mengelilingi Gili Trawangan bersama.' }, { year: '2026', title: 'Lamaran Pantai', desc: 'Dimas melamar saat matahari terbenam di pantai.' }],
    schedule: { title: 'Tropical Celebration', items: [{ time: '16:00 - 17:00 WITA', title: 'Sunset Toast', venue: 'Beach Deck', address: 'Seminyak, Bali' }, { time: '17:00 - 21:00 WITA', title: 'Resepsi & Party', venue: 'Beach Club', address: 'Seminyak, Bali' }] },
    quote: { text: 'Matahari terbit dan terbenam, namun cinta kami bersinar tanpa henti.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 8 Agustus 2027.', deadline: '2027-08-08', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0784400123', owner: 'Dimas Ardila' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Sampaikan ucapan untuk kami.', showMessages: true },
    footer: { text: 'Semoga mentari selalu menerangi langkah kami. Matur suksma!', showCredit: true },
    music: { src: AUDIO[6], title: 'Here Comes the Sun — Beatles', autoplay: true } },

  { slug: 'sample-yuki', templateId: 'yuki',
    couple: { partner1: 'Reza', partner2: 'Salma', partner1Title: 'Reza Aditya', partner2Title: 'Salma Anindya', partner1Father: 'Bpk. Fajar Aditya', partner1Mother: 'Ibu Indah Permata', partner2Father: 'Bpk. Rahman Anindya', partner2Mother: 'Ibu Siti Aminah', partner1Instagram: '@rezaaditya', partner2Instagram: '@salmaanindya' },
    event: { date: 'Sabtu, 18 Desember 2027', time: '10:00 - 14:00 WIB', location: 'Mountain Resort, Puncak', address: 'Jl. Raya Puncak Cisarua, Bogor', mapsUrl: maps('Puncak Pass Resort Bogor'), note: 'Tema winter white. Bawa pakaian hangat.' },
    story: { title: 'Salju Pertama', paragraphs: ['Reza dan Salma bertemu saat berlibur di pegunungan Puncak yang sejuk.', 'Di antara kabut tipis dan udara dingin, hangat cinta mulai tumbuh.', 'Tempat ini begitu istimewa, sehingga mereka memilihnya untuk mengikat janji suci.'], imagePosition: 'right' },
    stories: [{ year: '2021', title: 'Liburan di Puncak', desc: 'Bertemu saat tracking di taman bunga Cibodas.' }, { year: '2023', title: 'Trip ke Hokkaido', desc: 'Menyaksikan salju pertama bersama.' }, { year: '2026', title: 'Lamaran di Pegunungan', desc: 'Reza melamar di balcony villa menghadap lembah.' }],
    schedule: { title: 'Winter Wedding', items: [{ time: '10:00 - 11:00 WIB', title: 'Akad Nikah', venue: 'Mountain Chapel', address: 'Puncak, Bogor' }, { time: '11:30 - 14:00 WIB', title: 'Resepsi', venue: 'Lodge Hall', address: 'Puncak, Bogor' }] },
    quote: { text: 'Seperti salju pertama, cinta kami murni, putih, dan menenangkan.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 11 Desember 2027.', deadline: '2027-12-11', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BSI', number: '0892315567', owner: 'Reza Aditya' }, { bank: 'Bank BCA', number: '0895512340', owner: 'Salma Anindya' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan ucapan terhangat untuk kami.', showMessages: true },
    footer: { text: 'Terima kasih telah menghangati hari bahagia kami.', showCredit: true },
    music: { src: AUDIO[7], title: 'Let It Snow — Instrumental', autoplay: true } },

  { slug: 'sample-pasir', templateId: 'pasir',
    couple: { partner1: 'Bayu', partner2: 'Kirana', partner1Title: 'Bayu Segara', partner2Title: 'Kirana Dewi', partner1Father: 'Bpk. Wahyu Segara', partner1Mother: 'Ibu Made Rai', partner2Father: 'Bpk. Putu Suarjana', partner2Mother: 'Ibu Kadek Asri', partner1Instagram: '@bayusegara', partner2Instagram: '@kiranadewi' },
    event: { date: 'Jumat, 24 September 2027', time: '16:00 - 21:00 WITA', location: 'Pantai Tanjung Aan, Lombok', address: 'Pujut, Lombok Tengah, NTB', mapsUrl: maps('Pantai Tanjung Aan Lombok'), note: 'Beach & dune ceremony. Casual elegan.' },
    story: { title: 'Butiran Pasir yang Abadi', paragraphs: ['Bayu dan Kirana bertemu saat berselancar di Pantai Tanjung Aan.', 'Di antara gumukan pasir putih dan ombak, cinta mereka mulai bersemi.', 'Butir demi butir pasir menjadi saksi janji setia mereka.'], imagePosition: 'left' },
    stories: [{ year: '2022', title: 'Surf di Tanjung Aan', desc: 'Bertemu di ombak pantai pasir putih.' }, { year: '2024', title: 'Trip ke Sumbawa', desc: 'Menjelajahi pulau-pulau kecil bersama.' }, { year: '2026', title: 'Lamaran di Gumukan', desc: 'Bayu melamar di puncak gumukan pasir saat sunset.' }],
    schedule: { title: 'Coastal Wedding', items: [{ time: '16:00 - 17:00 WITA', title: 'Akad Nikah', venue: 'Beach Altar', address: 'Tanjung Aan, Lombok' }, { time: '17:30 - 21:00 WITA', title: 'Resepsi & Dinner', venue: 'Dune Pavilion', address: 'Tanjung Aan, Lombok' }] },
    quote: { text: 'Setiap butir pasir adalah saksi bisu cinta yang abadi.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 17 September 2027.', deadline: '2027-09-17', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank NTB Syariah', number: '0901234567', owner: 'Bayu Segara' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan pesan pantai untuk kami.', showMessages: true },
    footer: { text: 'Sampai jumpa di tepi pantai. Terima kasih atas kehadirannya!', showCredit: true },
    music: { src: AUDIO[8], title: 'Desert Rose — Instrumental', autoplay: true } },

  { slug: 'sample-cinta', templateId: 'cinta',
    couple: { partner1: 'Adrian', partner2: 'Nayla', partner1Title: 'Adrian Surya', partner2Title: 'Nayla Pramudita', partner1Father: 'Bpk. Hendro Surya', partner1Mother: 'Ibu Maria Wati', partner2Father: 'Bpk. Joko Pramudita', partner2Mother: 'Ibu Anne Sugianto', partner1Instagram: '@adriansurya', partner2Instagram: '@naylapramudita' },
    event: { date: 'Sabtu, 13 Februari 2027', time: '17:00 - 22:00 WITA', location: 'Hillside Villa, Ubud, Bali', address: 'Jl. Raya Ubud, Gianyar, Bali', mapsUrl: maps('Ubud Hillside Villa Bali'), note: 'Romantic dinner. Valentine weekend.' },
    story: { title: 'Cinta adalah Bahasa Hati', paragraphs: ['Adrian dan Nayla bertemu di kelas melukis di Ubud.', 'Dari kanvas dan warna, mereka melukis kisah cinta yang penuh makna.', 'Kini, di bukit hijau Ubud, mereka siap berjanji untuk selamanya.'], imagePosition: 'right' },
    stories: [{ year: '2021', title: 'Kelas Melukis', desc: 'Bertemu saat berbagi palet cat di studio.' }, { year: '2023', title: 'Trip ke Venedig', desc: 'Menaiki gondola bersama di Venesia.' }, { year: '2026', title: 'Lamaran Valentine', desc: 'Adrian melamar di malam Valentine penuh lilin.' }],
    schedule: { title: 'Romantic Evening', items: [{ time: '17:00 - 18:00 WITA', title: 'Sunset Cocktail', venue: 'Hill Deck', address: 'Ubud, Bali' }, { time: '18:00 - 22:00 WITA', title: 'Sacred Vow & Dinner', venue: 'Garden Villa', address: 'Ubud, Bali' }] },
    quote: { text: 'Cinta adalah bahasa universal yang dimengerti oleh setiap hati.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 6 Februari 2027.', deadline: '2027-02-06', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0123345567', owner: 'Adrian Surya' }, { bank: 'Bank Mandiri', number: '188009977220', owner: 'Nayla Pramudita' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tuliskan ucapan cinta untuk kami.', showMessages: true },
    footer: { text: 'Happy Valentine! Terima kasih merayakan cinta bersama kami.', showCredit: true },
    music: { src: AUDIO[9], title: 'My Heart Will Go On — Instrumental', autoplay: true } },

  { slug: 'sample-bumi', templateId: 'bumi',
    couple: { partner1: 'Rizki', partner2: 'Ara', partner1Title: 'Rizki Hakim', partner2Title: 'Ara Lestari', partner1Father: 'Bpk. Faizal Hakim', partner1Mother: 'Ibu Nur Hidayah', partner2Father: 'Bpk. Salman Lestari', partner2Mother: 'Ibu Dewi Anggraini', partner1Instagram: '@rizkihakim', partner2Instagram: '@aralestari' },
    event: { date: 'Minggu, 17 Oktober 2027', time: '09:00 - 15:00 WIB', location: 'Garden Estate, Sentul, Bogor', address: 'Jl. Raya Sentul, Bogor', mapsUrl: maps('Sentul Garden Estate Bogor'), note: 'Garden wedding. Busana semi-formal.' },
    story: { title: 'Bumi, Langit, dan Cinta', paragraphs: ['Rizki dan Ara bertemu di kebun keluarga di Sentul saat panen sayur organik.', 'Mengolah tanah bersama mengajarkan mereka arti kesabaran dan kerja sama.', 'Kini bumi dan langit menjadi saksi janji suci mereka.'], imagePosition: 'left' },
    stories: [{ year: '2020', title: 'Panen Organik', desc: 'Bertemu di kebun organik keluarga.' }, { year: '2022', title: 'Trip ke Dieng', desc: 'Menyaksikan matahari terbit di Sikunir.' }, { year: '2025', title: 'Lamaran di Kebun', desc: 'Rizki melamar di tengah sawah hijau.' }],
    schedule: { title: 'Garden Wedding', items: [{ time: '09:00 - 10:00 WIB', title: 'Akad Nikah', venue: 'Garden Chapel', address: 'Sentul, Bogor' }, { time: '10:30 - 15:00 WIB', title: 'Resepsi Garden Party', venue: 'Estate Lawn', address: 'Sentul, Bogor' }] },
    quote: { text: 'Bumi menjadi saksi, langit menjadi mahkota, dan cinta mengikat kami.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 10 Oktober 2027.', deadline: '2027-10-10', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0234456678', owner: 'Rizki Hakim' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan doa restu untuk kami.', showMessages: true },
    footer: { text: 'Matur nuwun! Terima kasih atas doa dan kehadirannya.', showCredit: true },
    music: { src: AUDIO[10], title: 'What a Wonderful World — Louis Armstrong', autoplay: true } },

  { slug: 'sample-awan', templateId: 'awan',
    couple: { partner1: 'Satria', partner2: 'Alya', partner1Title: 'Satria Nugraha', partner2Title: 'Alya Kamila', partner1Father: 'Bpk. Bambang Nugraha', partner1Mother: 'Ibu Rina Wati', partner2Father: 'Bpk. Hendra Kamila', partner2Mother: 'Ibu Sari Dewi', partner1Instagram: '@satrianugraha', partner2Instagram: '@alyakamila' },
    event: { date: 'Jumat, 26 November 2027', time: '18:00 - 22:30 WIB', location: 'Sky Lounge Rooftop, SCBD, Jakarta', address: 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan', mapsUrl: maps('SCBD Rooftop Jakarta'), note: 'Rooftop reception. Busana formal.' },
    story: { title: 'Cinta Setinggi Langit', paragraphs: ['Satria dan Alya bertemu di rooftop bar di SCBD saat hujan gerimis.', 'Sambil menatap gemerlap lampu kota, keduanya sadar ini bukan pertemuan biasa.', 'Kini mereka menikah di atas awan, di antara gemerlap Jakarta.'], imagePosition: 'right' },
    stories: [{ year: '2022', title: 'Rooftop SCBD', desc: 'Bertemu saat berlindung dari gerimis di rooftop.' }, { year: '2024', title: 'Trip ke Singapore', desc: 'Menikmati Marina Bay Sands bersama.' }, { year: '2026', title: 'Lamaran di Atas Awan', desc: 'Satria melamar di helipad saat fajar menyingsing.' }],
    schedule: { title: 'Above the Clouds', items: [{ time: '18:00 - 19:00 WIB', title: 'Skyline Welcome', venue: 'Rooftop Deck', address: 'SCBD, Jakarta' }, { time: '19:00 - 22:30 WIB', title: 'Resepsi & Dinner', venue: 'Sky Lounge', address: 'SCBD, Jakarta' }] },
    quote: { text: 'Cinta kami melayang tinggi, sehangat awan di langit senja.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 19 November 2027.', deadline: '2027-11-19', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0345567789', owner: 'Satria Nugraha' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan ucapan dari hati Anda.', showMessages: true },
    footer: { text: 'Thanks for coming up to the clouds with us. Terima kasih!', showCredit: true },
    music: { src: AUDIO[11], title: 'Fly Me to the Moon — Sinatra', autoplay: true } },

  { slug: 'sample-ratu', templateId: 'ratu',
    couple: { partner1: 'Pangeran', partner2: 'Ratna', partner1Title: 'Pangeran Adi Kesuma', partner2Title: 'Ratna Kencana', partner1Father: 'Bpk. Sultan Kesuma', partner1Mother: 'Ibu Ratu Permatasari', partner2Father: 'Bpk. Bagus Kencana', partner2Mother: 'Ibu Mahardika', partner1Instagram: '@pangeranadi', partner2Instagram: '@ratnakencana' },
    event: { date: 'Sabtu, 20 November 2027', time: '18:00 - 23:00 WIB', location: 'Ballroom Keraton-style, Yogyakarta', address: 'Jl. Malioboro, Yogyakarta', mapsUrl: maps('Malioboro Yogyakarta'), note: 'Royal Javanese. Busana formal/tradisional.' },
    story: { title: 'Seperti dalam Kerajaan', paragraphs: ['Pangeran dan Ratna bertemu di acara keraton saat perayaan Sekaten.', 'Di antara gemerlap emas dan adat Jawa, cinta mereka mekar dengan penuh adab.', 'Kini mereka bersatu dalam ikatan suci layaknya raja dan ratu.'], imagePosition: 'left' },
    stories: [{ year: '2021', title: 'Sekaten', desc: 'Bertemu saat festival Sekaten di Alun-Alun Utara.' }, { year: '2023', title: 'Trip ke Surakarta', desc: 'Menyaksikan upacara keraton bersama.' }, { year: '2026', title: 'Lamaran Adat', desc: 'Pangeran melamar dengan prosesi adat temanten.' }],
    schedule: { title: 'Royal Wedding', items: [{ time: '18:00 - 19:00 WIB', title: 'Prosesi Panggih', venue: 'Grand Ballroom', address: 'Yogyakarta' }, { time: '19:00 - 23:00 WIB', title: 'Resepsi Kerajaan', venue: 'Grand Ballroom', address: 'Yogyakarta' }] },
    quote: { text: 'Seperti raja dan ratu, kami saling memahkati dalam cinta.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 13 November 2027.', deadline: '2027-11-13', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0456678890', owner: 'Pangeran Adi Kesuma' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Sampaikan doa restu untuk sepasang penganteng.', showMessages: true },
    footer: { text: 'Daulat! Terima kasih atas doa restu dan kehadirannya.', showCredit: true },
    music: { src: AUDIO[12], title: 'Gamelan Jawa — Instrumental', autoplay: true } },

  { slug: 'sample-laut', templateId: 'laut',
    couple: { partner1: 'Nadi', partner2: 'Karina', partner1Title: 'Nadi Putra Bahari', partner2Title: 'Karina Lestari', partner1Father: 'Bpk. Capt. Putra', partner1Mother: 'Ibu Sari Bahari', partner2Father: 'Bpk. Eko Lestari', partner2Mother: 'Ibu Maya Sari', partner1Instagram: '@nadiputra', partner2Instagram: '@karinalestari' },
    event: { date: 'Minggu, 9 Mei 2027', time: '15:00 - 20:00 WITA', location: 'Pantai Tanjung Tinggi, Belitung', address: 'Tanjung Tinggi, Belitung Timur, Bangka-Belitung', mapsUrl: maps('Pantai Tanjung Tinggi Belitung'), note: 'Beach ceremony. Casual elegan.' },
    story: { title: 'Mengarungi Samudra Cinta', paragraphs: ['Nadi dan Karina bertemu saat snorkeling di Tanjung Tinggi, Belitung.', 'Di antara batu granit raksasa dan ikan warna-warni, cinta mereka bersemi.', 'Lautan biru menjadi saksi janji suci mereka untuk berlayar bersama.'], imagePosition: 'right' },
    stories: [{ year: '2022', title: 'Snorkeling Belitung', desc: 'Bertemu saat menyelami terumbu karang Tanjung Tinggi.' }, { year: '2024', title: 'Trip ke Raja Ampat', desc: 'Menyaksili keindahan bawah laut bersama.' }, { year: '2026', title: 'Lamaran di Batu Granit', desc: 'Nadi melamar di puncak batu granit menghadap laut.' }],
    schedule: { title: 'Coastal Wedding', items: [{ time: '15:00 - 16:00 WITA', title: 'Beach Ceremony', venue: 'Granit Beach', address: 'Tanjung Tinggi, Belitung' }, { time: '16:30 - 20:00 WITA', title: 'Resepsi & Seaside Dinner', venue: 'Beach Pavilion', address: 'Tanjung Tinggi, Belitung' }] },
    quote: { text: 'Cinta adalah samudera luas, tempat dua jiwa berlayar bersama untuk selamanya.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 2 Mei 2027.', deadline: '2027-05-02', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0567789901', owner: 'Nadi Putra Bahari' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan pesan dari tepi pantai.', showMessages: true },
    footer: { text: 'Sampai jumpa di tepi laut biru. Terima kasih!', showCredit: true },
    music: { src: AUDIO[13], title: 'Ocean Eyes — Instrumental', autoplay: true } },

  { slug: 'sample-hutan', templateId: 'hutan',
    couple: { partner1: 'Farhan', partner2: 'Rindu', partner1Title: 'Farhan Maulana', partner2Title: 'Rindu Hati', partner1Father: 'Bpk. Syahrul Maulana', partner1Mother: 'Ibu Nita Lestari', partner2Father: 'Bpk. Iwan Hati', partner2Mother: 'Ibu Dewi Sartika', partner1Instagram: '@farhanmaulana', partner2Instagram: '@rinduhati' },
    event: { date: 'Sabtu, 28 Agustus 2027', time: '08:00 - 14:00 WIB', location: 'Eco Lodge, Hutan Pinus, Kaliurang', address: 'Kaliurang, Sleman, Yogyakarta', mapsUrl: maps('Hutan Pinus Kaliurang Yogyakarta'), note: 'Forest wedding. Busana casual earthy.' },
    story: { title: 'Cinta di Tengah Rimba', paragraphs: ['Farhan dan Rindu bertemu saat aksi konservasi orangutan di Kalimantan.', 'Di tengah rimba yang liar dan indah, keduanya menemukan keteduhan satu sama lain.', 'Mereka memilih hutan pinus sebagai saksi janji suci mereka.'], imagePosition: 'left' },
    stories: [{ year: '2021', title: 'Konservasi Tanjung Puting', desc: 'Bertemu saat menjadi relawan konservasi.' }, { year: '2023', title: 'Trip ke Gunung Leuser', desc: 'Tracking dan berkemah di hutan tropis.' }, { year: '2026', title: 'Lamaran di Pinus', desc: 'Farhan melamar di tengah hutan pinus berkabut.' }],
    schedule: { title: 'Forest Wedding', items: [{ time: '08:00 - 09:00 WIB', title: 'Akad Nikah', venue: 'Pine Altar', address: 'Kaliurang, Yogyakarta' }, { time: '09:30 - 14:00 WIB', title: 'Resepsi Forest Feast', venue: 'Pinus Garden', address: 'Kaliurang, Yogyakarta' }] },
    quote: { text: 'Cinta seperti hutan—misterius, indah, dan penuh kehidupan yang tumbuh.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 21 Agustus 2027.', deadline: '2027-08-21', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ bank: 'Bank BCA', number: '0678899012', owner: 'Farhan Maulana' }] },
    guestbook: { enabled: true, title: 'Ucapan & Doa', description: 'Tinggalkan pesan dari tengah hutan.', showMessages: true },
    footer: { text: 'Selamatkan cinta, selamatkan rimba. Terima kasih!', showCredit: true },
    music: { src: AUDIO[14], title: 'Colors of the Wind — Instrumental', autoplay: true } },
];

// ─── Build InvitationContent (mirrors scripts/seed-samples.mjs shape) ──
function buildContent(sample, m) {
  const c = sample.couple;
  return {
    slug: sample.slug,
    couple: {
      partner1: c.partner1, partner2: c.partner2,
      partner1Title: c.partner1Title, partner2Title: c.partner2Title,
      partner1Father: c.partner1Father, partner1Mother: c.partner1Mother,
      partner2Father: c.partner2Father, partner2Mother: c.partner2Mother,
      partner1Instagram: c.partner1Instagram, partner2Instagram: c.partner2Instagram,
    },
    event: { ...sample.event },
    story: { ...sample.story, image: m.story },
    stories: sample.stories,
    gallery: { images: m.gallery, layout: 'grid' },
    schedule: sample.schedule,
    quote: sample.quote,
    rsvp: sample.rsvp,
    gift: sample.gift,
    guestbook: sample.guestbook,
    maps: {},
    footer: sample.footer,
    media: { cover: m.cover, hero: m.hero, partner1Photo: m.partner1Photo, partner2Photo: m.partner2Photo },
    music: sample.music,
    ogImage: m.og,
    ogDescription: `Undangan pernikahan ${c.partner1Title} & ${c.partner2Title}. Dengan penuh kebahagiaan, kami mengundang Bapak/Ibu/Saudara untuk hadir memberikan restu.`,
  };
}

// ─── API helpers ─────────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts, headers: { 'Content-Type': 'application/json', ...opts.headers },
  });
  const body = await res.text().catch(() => '');
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}: ${body.slice(0, 200)}`);
  try { return JSON.parse(body); } catch { return body; }
}

async function main() {
  console.log(`\n🌐 Target: ${BASE}`);
  console.log(`🌱 Seeding ${SAMPLES.length} mobile templates (flora → hutan)\n`);

  console.log('🔑 Logging in...');
  const { token } = await api('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ password: PASSWORD }),
  });
  const cookie = { Cookie: `lumina_session=${token}` };
  console.log('  ✓ Authenticated\n');

  const existing = await api('/api/invitations', { headers: cookie });
  const bySlug = new Map(existing.map((i) => [i.slug, i]));
  console.log(`📋 ${existing.length} existing invitation(s)\n`);

  let created = 0, republished = 0, failed = 0;
  for (let i = 0; i < SAMPLES.length; i++) {
    const s = SAMPLES[i];
    const m = media(i);
    const content = buildContent(s, m);
    const title = `${s.couple.partner1Title} & ${s.couple.partner2Title}`;
    process.stdout.write(`→ ${s.slug} (${s.templateId})… `);
    try {
      if (bySlug.has(s.slug)) {
        // Update existing + re-publish so snapshot re-freezes fresh data.
        await api(`/api/invitations/${s.slug}`, {
          method: 'PUT', headers: cookie,
          body: JSON.stringify({ title, templateId: s.templateId, content, themeOverrides: {} }),
        });
        await api(`/api/invitations/${s.slug}/publish`, { method: 'POST', headers: cookie });
        console.log('✓ updated + re-published');
        republished++;
      } else {
        await api('/api/invitations', {
          method: 'POST', headers: cookie,
          body: JSON.stringify({ slug: s.slug, title, templateId: s.templateId, layoutId: 'default', content, themeOverrides: {} }),
        });
        await api(`/api/invitations/${s.slug}/publish`, { method: 'POST', headers: cookie });
        console.log('✓ created + published');
        created++;
      }
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Done: ${created} created, ${republished} republished, ${failed} failed.`);
  console.log('\n📎 Live URLs:');
  for (const s of SAMPLES) console.log(`  ${BASE}/i/${s.slug}`);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
