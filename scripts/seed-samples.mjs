/**
 * Seed all templates with rich sample data and publish them.
 *
 * Usage:
 *   node scripts/seed-samples.mjs
 *
 * Requires the Lumina app to be running (uses HTTP API).
 * Requires LUMINA_PASSWORD env or falls back to 'lumina-studio-2026'.
 *
 * Design:
 * - Each template gets a unique couple/celebrant story
 * - Media uses picsum.photos (seed-based = deterministic)
 * - Audio uses SoundHelix (16 royalty-free tracks, cycled by index)
 * - Skips templates that already have sample invitations
 * - Published via snapshot API
 */

const BASE = process.env.LUMINA_BASE_URL || 'http://localhost:3000';
const PASSWORD = process.env.LUMINA_PASSWORD || 'lumina-studio-2026';

// ─── 16 royalty-free audio tracks from SoundHelix ─────────────
const AUDIO_TRACKS = Array.from({ length: 16 }, (_, i) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`
);

function getAudio(index) {
  return AUDIO_TRACKS[index % AUDIO_TRACKS.length];
}

function getImage(id, w, h) {
  return `https://picsum.photos/seed/${id}/${w}/${h}`;
}

// ─── Sample data per template ─────────────────────────────────
const SAMPLES = [
  // ── Themed/Wedding (composed) ──
  {
    slug: 'sample-aurora', templateId: 'aurora',
    couple: { partner1: 'Aditya', partner2: 'Sarah', partner1Title: 'Aditya Pramana', partner2Title: 'Sarah Amalia', partner1Father: 'Bpk. Yoga Pramana', partner1Mother: 'Ibu Dewi Lestari', partner2Father: 'Bpk. Hendra Wijaya', partner2Mother: 'Ibu Rina Mariana', partner1Instagram: '@adityaprmn', partner2Instagram: '@sarahamalia' },
    event: { date: '15 Juni 2026', time: '09:00 - 16:00 WITA', location: 'Taman Budaya, Ubud', address: 'Jl. Raya Ubud, Gianyar, Bali', mapsUrl: 'https://maps.app.goo.gl/example1', note: 'Pakaian adat Bali atau formal gelap.' },
    story: { title: 'Our Story', paragraphs: ['Berawal dari pameran seni di Ubud pada 2021, kami bertemu di depan lukisan matahari terbenam.', 'Dari obrolan singkat itu, tumbuh benih cinta yang akhirnya mekar sempurna.', 'Kami bersyukur bisa melangkah ke jenjang pernikahan dengan restu kedua keluarga.'], image: getImage('aurora-story', 600, 400), imagePosition: 'left' },
    stories: [{ year: '2021', title: 'Pertemuan di Pameran Seni', desc: 'Bertemu di pameran seni Ubud. Aditya jatuh hati pada senyum Sarah.' }, { year: '2023', title: 'Liburan ke Raja Ampat', desc: 'Perjalanan pertama bersama yang memperkuat ikatan kami.' }, { year: '2025', title: 'Lamaran di Pantai Kuta', desc: 'Aditya melamar saat matahari terbenam, diiringi debur ombak.' }],
    gallery: { images: [getImage('aurora-g1', 400, 400), getImage('aurora-g2', 400, 400), getImage('aurora-g3', 400, 400), getImage('aurora-g4', 400, 400), getImage('aurora-g5', 400, 400), getImage('aurora-g6', 400, 400)], layout: 'grid' },
    schedule: { title: 'Rangkaian Acara', items: [{ time: '08:00 - 09:00 WITA', title: 'Penyambutan Tamu', venue: 'Taman Budaya Ubud', address: 'Jl. Raya Ubud', mapsUrl: 'https://maps.app.goo.gl/example1' }, { time: '09:00 - 10:00 WITA', title: 'Resepsi', venue: 'Pendopo Taman Budaya', address: 'Jl. Raya Ubud', mapsUrl: 'https://maps.app.goo.gl/example1' }, { time: '12:00 - 16:00 WITA', title: 'Hiburan & Jamuan', venue: 'Taman Budaya Ubud', address: 'Jl. Raya Ubud' }], note: 'Acara akan dimulai tepat waktu. Mohon konfirmasi kehadiran.' },
    quote: { text: 'Cinta adalah jembatan antara dua hati yang dipersatukan oleh takdir.', source: '— Filosofi Jawa' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi kehadiran Anda sebelum 1 Juni 2026.', deadline: '2026-06-01', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '1234567890', accountName: 'Aditya & Sarah', description: 'Doa restu dan kehadiran Anda adalah hadiah terindah bagi kami.', items: [{ bank: 'Bank Mandiri', number: '0987654321', owner: 'Aditya Pramana' }, { bank: 'Bank BCA', number: '1234567890', owner: 'Sarah Amalia' }] },
    guestbook: { title: 'Buku Tamu', description: 'Tinggalkan pesan untuk kami!', enabled: true, showMessages: true },
    footer: { text: 'Terima kasih atas doa restu dan kehadirannya!', showCredit: true },
    media: { cover: getImage('aurora-cover', 800, 1200), hero: getImage('aurora-hero', 1200, 800), partner1Photo: getImage('aurora-p1', 400, 400), partner2Photo: getImage('aurora-p2', 400, 400) },
    music: { src: getAudio(0), title: 'Perfect - Ed Sheeran (Instrumental)', autoplay: true },
    ogImage: getImage('aurora-og', 1200, 630), ogDescription: 'Undangan pernikahan Aditya Pramana & Sarah Amalia. Bersama keluarga, kami mengundang Bapak/Ibu/Saudara untuk hadir memberikan restu.',
  },
  {
    slug: 'sample-fleur', templateId: 'fleur',
    couple: { partner1: 'Dimas', partner2: 'Putri', partner1Title: 'Dimas Ardianto', partner2Title: 'Putri Kusuma', partner1Father: 'Bpk. Agus Ardianto', partner1Mother: 'Ibu Sri Wahyuni', partner2Father: 'Bpk. Bambang Kusuma', partner2Mother: 'Ibu Sari Dewi', partner1Instagram: '@dimasard', partner2Instagram: '@putrikusuma' },
    event: { date: '10 Agustus 2026', time: '10:00 - 15:00 WIB', location: 'Kebun Raya, Bogor', address: 'Jl. Ir. H. Juanda No.13, Bogor', mapsUrl: 'https://maps.app.goo.gl/example2', note: 'Gazebo taman, menggunakan busana semi-formal.' },
    story: { title: 'Love in Bloom', paragraphs: ['Berawal dari kebun raya, tempat Putri menghabiskan akhir pekan, takdir mempertemukan kami.', 'Awalnya hanya saling sapa sesama pengunjung, kemudian berubah menjadi janji temu tiap minggu.', 'Kebun raya menjadi saksi tumbuhnya cinta kami, dan kini kami memilih tempat yang sama untuk berjanji sehidup semati.'], image: getImage('fleur-story', 600, 400), imagePosition: 'right' },
    stories: [{ year: '2020', title: 'Pertemuan di Taman Anggrek', desc: 'Dimas tersesat dan Bertemu Putri di taman anggrek.' }, { year: '2022', title: 'Trekking ke Gunung Gede', desc: 'Pendakian pertama bersama, mencapai puncak saat matahari terbit.' }, { year: '2024', title: 'Lamaran Taman Bunga', desc: 'Dimas melamar di taman bunga terkenal, dikelilingi ribuan bunga.' }],
    gallery: { images: [getImage('fleur-g1', 400, 400), getImage('fleur-g2', 400, 400), getImage('fleur-g3', 400, 400)], layout: 'carousel' },
    schedule: { title: 'Agenda Acara', items: [{ time: '10:00 - 11:00 WIB', title: 'Pemberkatan', venue: 'Kebun Raya Bogor', address: 'Jl. Ir. H. Juanda No.13, Bogor' }, { time: '11:30 - 15:00 WIB', title: 'Resepsi & Jamuan', venue: 'Gazebo Utama', address: 'Kebun Raya Bogor' }] },
    quote: { text: 'Seperti bunga yang mekar di musim semi, cinta kami tumbuh indah pada waktunya.' },
    rsvp: { title: 'RSVP', description: 'Konfirmasi kehadiran Anda.', deadline: '2026-07-25', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '1112223334', accountName: 'Dimas & Putri', items: [{ bank: 'Bank BNI', number: '2223334445', owner: 'Dimas Ardianto' }] },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Terima kasih telah menjadi bagian dari hari bahagia kami!', showCredit: true },
    media: { cover: getImage('fleur-cover', 800, 1200), hero: getImage('fleur-hero', 1200, 800), partner1Photo: getImage('fleur-p1', 400, 400), partner2Photo: getImage('fleur-p2', 400, 400) },
    music: { src: getAudio(1), title: 'A Thousand Years - Christina Perri', autoplay: true },
    ogImage: getImage('fleur-og', 1200, 630),
  },
  {
    slug: 'sample-luna', templateId: 'luna',
    couple: { partner1: 'Raka', partner2: 'Amanda', partner1Title: 'Raka Wiraguna', partner2Title: 'Amanda Permatasari', partner1Father: 'Bpk. Eko Wiraguna', partner1Mother: 'Ibu Rini Susanti', partner2Father: 'Bpk. Daniel Permatasari', partner2Mother: 'Ibu Maya Anggraini', partner1Instagram: '@rakawira', partner2Instagram: '@amandapermata' },
    event: { date: '22 Agustus 2026', time: '18:00 - 23:00 WIB', location: 'The Ritz-Carlton, Jakarta', address: 'Jl. DR. Ide Anak Agung Gde Agung, Jakarta', mapsUrl: 'https://maps.app.goo.gl/example3', note: 'Black tie optional. Resepsi malam di ballroom.' },
    story: { title: 'Moonlit Romance', paragraphs: ['Malam berbintang di rooftop Jakarta, di situlah Raka memberanikan diri menyapa Amanda.', 'Dari obrolan ringan tentang bintang, tumbuh kenangan demi kenangan yang tak terlupakan.', 'Bulan menjadi saksi perjalanan cinta kami, hingga kini kami bersiap mengucapkan janji suci.'], image: getImage('luna-story', 600, 400), imagePosition: 'left' },
    stories: [{ year: '2019', title: 'Rooftop Jakarta', desc: 'Pertemuan pertama di acara gathering. Langit penuh bintang.' }, { year: '2021', title: 'Liburan ke Labuan Bajo', desc: 'Menyaksikan matahari terbenam di Bukit Cinta.' }, { year: '2024', title: 'Lamaran Bulan Purnama', desc: 'Raka melamar saat bulan purnama di puncak Bukit Bintang.' }],
    gallery: { images: [getImage('luna-g1', 400, 400), getImage('luna-g2', 400, 400), getImage('luna-g3', 400, 400), getImage('luna-g4', 400, 400)], layout: 'masonry' },
    schedule: { title: 'Acara Malam', items: [{ time: '18:00 - 19:00 WIB', title: 'Cocktail Hour', venue: 'Ritz-Carlton Ballroom' }, { time: '19:00 - 21:00 WIB', title: 'Resepsi Utama', venue: 'Grand Ballroom' }, { time: '21:00 - 23:00 WIB', title: 'Dinner & Hiburan', venue: 'Grand Ballroom' }] },
    quote: { text: 'Bulan dan bintang adalah saksi cinta yang tak pernah padam.', source: '— Raka & Amanda' },
    rsvp: { title: 'Confirm Attendance', deadline: '2026-08-08', showConfirmationList: false },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '3334445556', accountName: 'Raka & Amanda', items: [{ bank: 'Bank Mandiri', number: '4445556667', owner: 'Raka Wiraguna' }] },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Terima kasih atas doa restunya! Wassalamualaikum.', showCredit: true },
    media: { cover: getImage('luna-cover', 800, 1200), hero: getImage('luna-hero', 1200, 800), partner1Photo: getImage('luna-p1', 400, 400), partner2Photo: getImage('luna-p2', 400, 400) },
    music: { src: getAudio(2), title: 'All of Me - John Legend', autoplay: true },
    ogImage: getImage('luna-og', 1200, 630),
  },
  {
    slug: 'sample-ivory', templateId: 'ivory',
    couple: { partner1: 'Bayu', partner2: 'Dewi', partner1Title: 'Bayu Segara', partner2Title: 'Dewi Ratih', partner1Father: 'Bpk. Ketut Segara', partner1Mother: 'Ibu Made Sari', partner2Father: 'Bpk. Nyoman Wira', partner2Mother: 'Ibu Ketut Ayu' },
    event: { date: '4 Juli 2026', time: '16:00 - 21:00 WITA', location: 'Kuta Beach, Bali', address: 'Jl. Pantai Kuta, Badung, Bali', mapsUrl: 'https://maps.app.goo.gl/example4', note: 'Casual beach attire. Sunset ceremony.' },
    story: { title: 'Sunset Love', paragraphs: ['Kami bertemu saat matahari terbenam di Pantai Kuta, ketika Bayu menyelamatkan Dewi yang hampir terjatuh.', 'Sejak itu, kami tak pernah terpisah. Setiap senja menjadi milik kami.', 'Dan kini, di pantai yang sama, kami akan memulai babak baru kehidupan.'], image: getImage('ivory-story', 600, 400), imagePosition: 'right' },
    stories: [{ year: '2020', title: 'Pertemuan di Senja', desc: 'Bayu menyelamatkan Dewi di Pantai Kuta.' }, { year: '2022', title: 'Menyelam di Raja Ampat', desc: 'Petualangan bawah laut pertama bersama.' }, { year: '2024', title: 'Lamaran Sunset', desc: 'Bayu melamar saat sunset di Kuta.' }],
    gallery: { images: [getImage('ivory-g1', 400, 400), getImage('ivory-g2', 400, 400), getImage('ivory-g3', 400, 400), getImage('ivory-g4', 400, 400)], layout: 'grid' },
    schedule: { title: 'Beach Wedding', items: [{ time: '16:00 - 16:30 WITA', title: 'Sunset Ceremony', venue: 'Kuta Beach' }, { time: '17:00 - 21:00 WITA', title: 'Beside Party', venue: 'The Beach House' }] },
    quote: { text: 'Cinta sejati bagaikan matahari terbenam — indah, hangat, dan abadi.' },
    rsvp: { title: 'RSVP', deadline: '2026-06-20', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '5556667778', accountName: 'Bayu & Dewi', items: [{ bank: 'Bank BCA', number: '5556667778', owner: 'Dewi Ratih' }] },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Sunset may end, but our love never will!', showCredit: true },
    media: { cover: getImage('ivory-cover', 800, 1200), hero: getImage('ivory-hero', 1200, 800), partner1Photo: getImage('ivory-p1', 400, 400), partner2Photo: getImage('ivory-p2', 400, 400) },
    music: { src: getAudio(3), title: 'Can\'t Help Falling in Love - Elvis', autoplay: true },
    ogImage: getImage('ivory-og', 1200, 630),
  },
  {
    slug: 'sample-sakura', templateId: 'sakura',
    couple: { partner1: 'Ardi', partner2: 'Sari', partner1Title: 'Ardi Prasetyo', partner2Title: 'Sari Indah', partner1Instagram: '@ardipras', partner2Instagram: '@sariindah' },
    event: { date: '18 Oktober 2026', time: '10:00 - 15:00 WIB', location: 'Art Gallery, Bandung', address: 'Jl. Braga No.88, Bandung', mapsUrl: 'https://maps.app.goo.gl/example5' },
    story: { title: 'Cherry Blossom Love', paragraphs: ['Pertemuan kami di pameran fotografi sakura di Braga menjadi awal segalanya.', 'Ardi seorang fotografer, Sari adalah subjek yang menginspirasi lensanya.', 'Kami menikmati setiap momen bersama bagaikan mekarnya bunga sakura.'], image: getImage('sakura-story', 600, 400), imagePosition: 'left' },
    stories: [{ year: '2021', title: 'Pameran Fotografi', desc: 'Ardi memotret Sari di depan foto sakura raksasa.' }, { year: '2023', title: 'Trip ke Jepang', desc: 'Menyaksikan sakura mekar bersama di Kyoto.' }, { year: '2025', title: 'Lamaran di Braga', desc: 'Ardi melamar di galeri tempat pertama bertemu.' }],
    gallery: { images: [getImage('sakura-g1', 400, 400), getImage('sakura-g2', 400, 400), getImage('sakura-g3', 400, 400)], layout: 'grid' },
    schedule: { title: 'Acara', items: [{ time: '10:00 - 11:00 WIB', title: 'Pemberkatan' }, { time: '11:30 - 15:00 WIB', title: 'Resepsi' }] },
    quote: { text: 'Sakura mekar hanya sebentar, tapi cinta kami abadi selamanya.' },
    rsvp: { deadline: '2026-10-04', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '6667778889', accountName: 'Ardi & Sari' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Arigatou gozaimasu! Terima kasih banyak!', showCredit: true },
    media: { cover: getImage('sakura-cover', 800, 1200), hero: getImage('sakura-hero', 1200, 800), partner1Photo: getImage('sakura-p1', 400, 400), partner2Photo: getImage('sakura-p2', 400, 400) },
    music: { src: getAudio(4), title: 'Sakura - Folk Song Instrumental', autoplay: true },
    ogImage: getImage('sakura-og', 1200, 630),
  },
  {
    slug: 'sample-nordic', templateId: 'nordic',
    couple: { partner1: 'Gilang', partner2: 'Wulan', partner1Title: 'Gilang Pratama', partner2Title: 'Wulan Suci' },
    event: { date: '28 November 2026', time: '09:00 - 14:00 WITA', location: 'Rice Terraces, Ubud', address: 'Tegalalang, Ubud, Bali', mapsUrl: 'https://maps.app.goo.gl/example6', note: 'Outdoor, disarankan membawa topi.' },
    story: { title: 'Love in the Rice Fields', paragraphs: ['Berawal dari trekking di sawah terasering Ubud, kami jatuh cinta pada keindahan alam dan satu sama lain.', 'Gilang yang awalnya hanya pemandu wisata, kini menjadi pendamping hidup Wulan.', 'Kami memilih sawah sebagai tempat pernikahan untuk merayakan cinta yang sederhana namun bermakna.'] },
    gallery: { images: [getImage('nordic-g1', 400, 400), getImage('nordic-g2', 400, 400), getImage('nordic-g3', 400, 400)], layout: 'grid' },
    schedule: { title: 'Acara', items: [{ time: '09:00 - 10:00 WITA', title: 'Upacara Adat' }, { time: '10:30 - 14:00 WITA', title: 'Resepsi' }] },
    quote: { text: 'Cinta adalah harmoni antara dua jiwa yang selaras dengan alam.' },
    rsvp: { deadline: '2026-11-14', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank Mandiri', accountNumber: '7778889990', accountName: 'Gilang & Wulan' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Matur suksma! Terima kasih banyak!', showCredit: true },
    media: { cover: getImage('nordic-cover', 800, 1200), hero: getImage('nordic-hero', 1200, 800), partner1Photo: getImage('nordic-p1', 400, 400), partner2Photo: getImage('nordic-p2', 400, 400) },
    music: { src: getAudio(5), title: 'Hymn of the Nordic', autoplay: true },
    ogImage: getImage('nordic-og', 1200, 630),
  },
  {
    slug: 'sample-royal', templateId: 'royal',
    couple: { partner1: 'Krisna', partner2: 'Ayu', partner1Title: 'Krisna Adiputra', partner2Title: 'Ayu Ratna Dewi', partner1Father: 'Bpk. Agung Adiputra', partner1Mother: 'Ibu Cok Dewi', partner2Father: 'Bpk. Gusti Ngurah', partner2Mother: 'Ibu Gusti Ayu' },
    event: { date: '15 Januari 2027', time: '08:00 - 16:00 WITA', location: 'Puri Agung, Ubud', address: 'Jl. Raya Ubud, Gianyar, Bali', mapsUrl: 'https://maps.app.goo.gl/example7', note: 'Pakaian adat Bali. Upacara diikuti prosesi adat.' },
    story: { title: 'Royal Blessing', paragraphs: ['Krisna dan Ayu berasal dari dua puri besar di Bali. Pertemuan mereka di upacara adat Odalan.', 'Cinta mereka tumbuh di antara tradisi dan modernitas, dan kini bersatu dalam ikatan suci pernikahan.', 'Dengan restu keluarga besar dan leluhur, kami mengundang Anda menjadi saksi bahagia kami.'], image: getImage('royal-story', 600, 400), imagePosition: 'left' },
    stories: [{ year: '2020', title: 'Odalan di Puri', desc: 'Pertemuan pertama dalam upacara adat.' }, { year: '2022', title: 'Ngayah Bersama', desc: 'Berkarya bersama dalam kegiatan sosial di desa.' }, { year: '2025', title: 'Pemesuan', desc: 'Prosesi lamaran adat Bali yang sakral.' }],
    gallery: { images: [getImage('royal-g1', 400, 400), getImage('royal-g2', 400, 400), getImage('royal-g3', 400, 400), getImage('royal-g4', 400, 400)], layout: 'grid' },
    schedule: { title: 'Rangkaian Adat', items: [{ time: '06:00 - 08:00 WITA', title: 'Mekala-kalaan', venue: 'Puri Agung' }, { time: '08:00 - 10:00 WITA', title: 'Upacara Pemuput', venue: 'Puri Agung' }, { time: '12:00 - 16:00 WITA', title: 'Resepsi & Hiburan', venue: 'Puri Agung' }] },
    quote: { text: 'Om Swastiastu. Atas asung kerta wara nugraha Ida Sang Hyang Widhi Wasa...' },
    rsvp: { title: 'Konfirmasi', deadline: '2027-01-01', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BPD Bali', accountNumber: '8889990001', accountName: 'Krisna & Ayu', items: [{ bank: 'Bank BCA', number: '9990001112', owner: 'Krisna Adiputra' }] },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Om Santi Santi Santi Om. Terima kasih atas doa restunya.', showCredit: true },
    media: { cover: getImage('royal-cover', 800, 1200), hero: getImage('royal-hero', 1200, 800), partner1Photo: getImage('royal-p1', 400, 400), partner2Photo: getImage('royal-p2', 400, 400) },
    music: { src: getAudio(6), title: 'Gamelan Bali - Instrumental', autoplay: true },
    ogImage: getImage('royal-og', 1200, 630),
  },
  {
    slug: 'sample-celeste', templateId: 'celeste',
    couple: { partner1: 'Bagas', partner2: 'Rina', partner1Title: 'Bagas Wibisono', partner2Title: 'Rina Melati' },
    event: { date: '5 Desember 2026', time: '08:00 - 14:00 WIB', location: 'Pine Forest, Ciwidey', address: 'Kawah Putih, Ciwidey, Bandung', mapsUrl: 'https://maps.app.goo.gl/example8' },
    story: { title: 'Enchanted Forest', paragraphs: ['Di tengah hutan pinus Ciwidey yang berkabut, kisah cinta kami dimulai.', 'Bagas yang pendaki handal, membantu Rina yang tersesat di jalur pendakian.', 'Kini, di hutan yang sama, kami akan memulai petualangan baru bersama.'] },
    gallery: { images: [getImage('celeste-g1', 400, 400), getImage('celeste-g2', 400, 400), getImage('celeste-g3', 400, 400)], layout: 'grid' },
    schedule: { title: 'Acara', items: [{ time: '08:00 - 09:00 WIB', title: 'Pemberkatan', venue: 'Chapel Pine Forest' }, { time: '10:00 - 14:00 WIB', title: 'Resepsi Garden Party', venue: 'Pine Forest Hall' }] },
    quote: { text: 'Cinta sejati adalah petualangan dua jiwa yang saling menemukan.' },
    rsvp: { deadline: '2026-11-21', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '0001112223', accountName: 'Bagas & Rina' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Terima kasih telah hadir di hari istimewa kami!', showCredit: true },
    media: { cover: getImage('celeste-cover', 800, 1200), hero: getImage('celeste-hero', 1200, 800), partner1Photo: getImage('celeste-p1', 400, 400), partner2Photo: getImage('celeste-p2', 400, 400) },
    music: { src: getAudio(7), title: 'Forest Whisper - Instrumental', autoplay: true },
    ogImage: getImage('celeste-og', 1200, 630),
  },
  {
    slug: 'sample-verona', templateId: 'verona',
    couple: { partner1: 'Candra', partner2: 'Murni', partner1Title: 'Candra Kirana', partner2Title: 'Murni Sari' },
    event: { date: '20 Mei 2026', time: '10:00 - 16:00 WIB', location: 'Heritage Building, Surabaya', address: 'Jl. Tunjungan No.1, Surabaya', mapsUrl: 'https://maps.app.goo.gl/example9', note: 'Smart casual. Bangunan heritage.' },
    story: { title: 'Vintage Romance', paragraphs: ['Candra dan Murni bertemu di kafe vintage di Jalan Tunjungan.', 'Aroma kopi dan musik jazz menjadi latar kisah cinta yang manis.', 'Kami menikah di gedung heritage yang sama vintage-nya dengan kisah cinta kami.'] },
    gallery: { images: [getImage('verona-g1', 400, 400), getImage('verona-g2', 400, 400), getImage('verona-g3', 400, 400)], layout: 'grid' },
    schedule: { title: 'Agenda', items: [{ time: '10:00 - 11:00 WIB', title: 'Pemberkatan' }, { time: '11:30 - 16:00 WIB', title: 'Resepsi' }] },
    quote: { text: 'Cinta adalah melodi indah yang dimainkan dua hati dalam harmoni.' },
    rsvp: { deadline: '2026-05-06', showConfirmationList: true },
    gift: { enabled: true, layout: 'below-attendance', bankName: 'Bank Mandiri', accountNumber: '1113334445', accountName: 'Candra & Murni' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Grazie mille! Terima kasih banyak!', showCredit: true },
    media: { cover: getImage('verona-cover', 800, 1200), hero: getImage('verona-hero', 1200, 800), partner1Photo: getImage('verona-p1', 400, 400), partner2Photo: getImage('verona-p2', 400, 400) },
    music: { src: getAudio(8), title: 'Love Story - Instrumental', autoplay: true },
    ogImage: getImage('verona-og', 1200, 630),
  },
  {
    slug: 'sample-noir', templateId: 'noir',
    couple: { partner1: 'Eka', partner2: 'Tari', partner1Title: 'Eka Budiman', partner2Title: 'Tari Lestari' },
    event: { date: '8 Agustus 2026', time: '18:00 - 23:00 WIB', location: 'Wisma Seni, Yogyakarta', address: 'Jl. Suroto No.10, Yogyakarta', mapsUrl: 'https://maps.app.goo.gl/example10', note: 'Black & white attire. Art exhibition vibe.' },
    story: { title: 'Art & Soul', paragraphs: ['Eka dan Tari adalah seniman. Mereka bertemu di pameran seni kontemporer.', 'Dari kanvas dan cat, mereka melukis kisah cinta yang penuh warna meskipun dalam palet hitam putih.', 'Pernikahan mereka adalah karya seni paling indah yang pernah mereka ciptakan bersama.'] },
    gallery: { images: [getImage('noir-g1', 400, 400), getImage('noir-g2', 400, 400), getImage('noir-g3', 400, 400)], layout: 'grid' },
    schedule: { title: 'Acara', items: [{ time: '18:00 - 19:00 WIB', title: 'Art Opening' }, { time: '19:00 - 23:00 WIB', title: 'Exhibition & Dinner' }] },
    quote: { text: 'Cinta adalah kanvas putih, dan kita adalah pelukisnya.' },
    rsvp: { deadline: '2026-07-25', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '2224445556', accountName: 'Eka & Tari' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Art is love, love is art. Terima kasih!', showCredit: true },
    media: { cover: getImage('noir-cover', 800, 1200), hero: getImage('noir-hero', 1200, 800), partner1Photo: getImage('noir-p1', 400, 400), partner2Photo: getImage('noir-p2', 400, 400) },
    music: { src: getAudio(9), title: 'Clair de Lune - Debussy', autoplay: true },
    ogImage: getImage('noir-og', 1200, 630),
  },
  // ── Premium Monolithic ──
  {
    slug: 'sample-premium', templateId: 'undangan-premium',
    couple: { partner1: 'Fajar', partner2: 'Lestari', partner1Title: 'Fajar Nugraha', partner2Title: 'Lestari Dewi', partner1Father: 'Bpk. H. Nugraha', partner1Mother: 'Ibu Hj. Fatimah', partner2Father: 'Bpk. H. Sutopo', partner2Mother: 'Ibu Hj. Rahma', partner1Instagram: '@fajarnug', partner2Instagram: '@lestaridewi' },
    event: { date: '28 September 2026', time: '09:00 - 15:00 WIB', location: 'Punak Park, Bogor', address: 'Jl. Raya Puncak, Bogor', mapsUrl: 'https://maps.app.goo.gl/example11', note: 'Resepsi terbuka di taman pegunungan.' },
    story: { title: 'Mountain Love', paragraphs: ['Cinta Fajar dan Lestari tumbuh di kaki Gunung Gede.', 'Pendakian pertama mereka menjadi awal dari petualangan seumur hidup.', 'Kini, di Punak Park yang sejuk, mereka bersatu dalam ikatan suci pernikahan.'], image: getImage('premium-story', 600, 400) },
    stories: [{ year: '2020', title: 'Pendakian Pertama', desc: 'Bertemu di basecamp Gunung Gede Pangrango.' }, { year: '2022', title: 'Camping di Ranca Upas', desc: 'Berkemah bersama, ditemani api unggun.' }, { year: '2024', title: 'Puncak Bersama', desc: 'Fajar melamar di puncak Gunung Gede.' }],
    gallery: { images: [getImage('premium-g1', 400, 400), getImage('premium-g2', 400, 400), getImage('premium-g3', 400, 400), getImage('premium-g4', 400, 400)], layout: 'grid' },
    schedule: { title: 'Rangkaian Acara', items: [{ time: '09:00 - 10:00 WIB', title: 'Akad Nikah', venue: 'Masjid Punak Park', address: 'Punak Park', mapsUrl: 'https://maps.app.goo.gl/example11' }, { time: '11:00 - 15:00 WIB', title: 'Resepsi', venue: 'Garden Hall', address: 'Punak Park' }] },
    quote: { text: 'Cinta sejati adalah mendaki gunung bersama, bukan saling menjatuhkan.' },
    rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi sebelum 14 September 2026.', deadline: '2026-09-14', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank Syariah Indonesia', accountNumber: '3335556667', accountName: 'Fajar & Lestari', items: [{ bank: 'Bank BCA', number: '4446667778', owner: 'Fajar Nugraha' }, { bank: 'Bank Mandiri', number: '5557778889', owner: 'Lestari Dewi' }] },
    guestbook: { enabled: true, title: 'Buku Tamu', description: 'Tinggalkan kesan dan pesan!', showMessages: true },
    footer: { text: 'Terima kasih telah menjadi saksi dan bagian dari hari bahagia kami!', showCredit: true },
    media: { cover: getImage('premium-cover', 800, 1200), hero: getImage('premium-hero', 1200, 800), partner1Photo: getImage('premium-p1', 400, 400), partner2Photo: getImage('premium-p2', 400, 400) },
    music: { src: getAudio(10), title: 'Say Something - A Great Big World', autoplay: true },
    ogImage: getImage('premium-og', 1200, 630),
  },
  {
    slug: 'sample-terracotta', templateId: 'undangan-terracotta',
    couple: { partner1: 'Ganang', partner2: 'Hesti', partner1Title: 'Ganang Prakoso', partner2Title: 'Hesti Wulandari' },
    event: { date: '10 Oktober 2026', time: '09:00 - 15:00 WIB', location: 'Barn, Puncak', address: 'Jl. Raya Puncak KM 87, Cisarua', mapsUrl: 'https://maps.app.goo.gl/example12', note: 'Rustic theme. Casual warm attire.' },
    story: { title: 'Rustic Love', paragraphs: ['Ganang dan Hesti bertemu di sebuah barn conversion di Puncak.', 'Aroma kayu dan kopi menemani perbincangan pertama mereka.', 'Kini, di barn yang sama, mereka bersatu dalam cinta dan komitmen.'] },
    gallery: { images: [getImage('terracotta-g1', 400, 400), getImage('terracotta-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Acara', items: [{ time: '09:00 - 10:00 WIB', title: 'Upacara', venue: 'Rustic Barn' }, { time: '11:00 - 15:00 WIB', title: 'Reception & BBQ', venue: 'Barn Garden' }] },
    quote: { text: 'Cinta sederhana yang tumbuh di antara bebatuan dan tanah liat.' },
    rsvp: { deadline: '2026-09-26', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '6667778889', accountName: 'Ganang & Hesti' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Thank you! Merci! Terima kasih!', showCredit: true },
    media: { cover: getImage('terracotta-cover', 800, 1200), hero: getImage('terracotta-hero', 1200, 800), partner1Photo: getImage('terracotta-p1', 400, 400), partner2Photo: getImage('terracotta-p2', 400, 400) },
    music: { src: getAudio(11), title: 'Home - Edward Sharpe & The Magnetic Zeros', autoplay: true },
    ogImage: getImage('terracotta-og', 1200, 630),
  },
  {
    slug: 'sample-luxury', templateId: 'undangan-luxury',
    couple: { partner1: 'Indra', partner2: 'Kencana', partner1Title: 'Indra Baskara', partner2Title: 'Kencana Wati', partner1Instagram: '@indrabaskara', partner2Instagram: '@kencanawati' },
    event: { date: '14 Februari 2027', time: '18:00 - 23:00 WITA', location: 'Sanur Beach, Bali', address: 'Jl. Danau Tamblingan, Sanur, Bali', mapsUrl: 'https://maps.app.goo.gl/example13', note: 'Black tie. Champagne reception on the beach.' },
    story: { title: 'Golden Love', paragraphs: ['Cinta Indra dan Kencana bagaikan emas yang ditempa api — murni dan berharga.', 'Mereka bertemu di acara galang dana di Sanur dan sejak itu tak terpisahkan.', 'Malam tahun baru di Sanur menjadi saksi lamaran Indra yang megah dan romantis.'] },
    gallery: { images: [getImage('luxury-g1', 400, 400), getImage('luxury-g2', 400, 400)], layout: 'carousel' },
    schedule: { title: 'Evening', items: [{ time: '18:00 - 19:00 WITA', title: 'Sunset Cocktail' }, { time: '19:00 - 23:00 WITA', title: 'Gala Dinner & Dance' }] },
    quote: { text: 'Love is the gold that enriches every moment of life.' },
    rsvp: { deadline: '2027-01-31', showConfirmationList: false },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '7778889990', accountName: 'Indra & Kencana' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'With love and gratitude, thank you for celebrating with us!', showCredit: true },
    media: { cover: getImage('luxury-cover', 800, 1200), hero: getImage('luxury-hero', 1200, 800), partner1Photo: getImage('luxury-p1', 400, 400), partner2Photo: getImage('luxury-p2', 400, 400) },
    music: { src: getAudio(12), title: 'At Last - Etta James', autoplay: true },
    ogImage: getImage('luxury-og', 1200, 630),
  },
  {
    slug: 'sample-metatah', templateId: 'undangan-metatah-bali',
    couple: { partner1: 'I Wayan', partner2: '', partner1Title: 'I Wayan Sudarma', partner1Father: 'Bpk. I Nyoman Sudarma', partner1Mother: 'Ibu Ni Ketut Suranti', partner1Instagram: '@wayansudarma' },
    event: { date: '12 Juli 2026', time: '06:00 - 14:00 WITA', location: 'Pura, Bali', address: 'Desa Adat, Gianyar, Bali', mapsUrl: 'https://maps.app.goo.gl/example14', note: 'Pakaian adat Bali. Upacara Manusa Yadna.' },
    story: { title: 'Menyama Baya', paragraphs: ['Upacara Metatah (Mepandes) adalah tradisi suci bagi remaja Bali.', 'I Wayan melaksanakan upacara ini sebagai bentuk penghormatan kepada leluhur dan Ida Sang Hyang Widhi Wasa.', 'Kami mengundang keluarga dan kerabat untuk menyaksikan dan memberikan doa restu.'] },
    gallery: { images: [getImage('metatah-g1', 400, 400), getImage('metatah-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Prosesi', items: [{ time: '06:00 - 08:00 WITA', title: 'Mekala-kalaan', venue: 'Pura Desa' }, { time: '08:00 - 12:00 WITA', title: 'Upacara Metatah', venue: 'Pura Desa' }, { time: '12:00 - 14:00 WITA', title: 'Dharma Shanti', venue: 'Wantilan Desa' }] },
    quote: { text: 'Om Atma Tattwatma Suddha Mamah Swaha — semoga jiwa ini disucikan.' },
    rsvp: { title: 'Konfirmasi', deadline: '2026-06-28', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BPD Bali', accountNumber: '8880001112', accountName: 'I Wayan Sudarma' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Om Santi Santi Santi Om. Matur suksma!', showCredit: true },
    media: { cover: getImage('metatah-cover', 800, 1200), hero: getImage('metatah-hero', 1200, 800), partner1Photo: getImage('metatah-p1', 400, 400) },
    music: { src: getAudio(13), title: 'Gamelan Gong Kebyar', autoplay: true },
    ogImage: getImage('metatah-og', 1200, 630),
    mode: 'solo',
  },
  {
    slug: 'sample-birthday-gala', templateId: 'undangan-birthday-gala',
    couple: { partner1: 'Ibu Ratna Dewi', partner2: '', partner1Title: 'Ratna Dewi Kusuma', partner1Instagram: '@ratnadewi' },
    event: { date: '20 Juli 2026', time: '18:00 - 23:00 WIB', location: 'Ahimsa, Ubud', address: 'Jl. Raya Sanggingan, Ubud, Bali', mapsUrl: 'https://maps.app.goo.gl/example15', note: 'Golden attire encouraged. Celebrating 50 wonderful years!' },
    story: { title: '50 Years of Grace', paragraphs: ['Setengah abad perjalanan hidup yang penuh berkah.', 'Ibu Ratna Dewi telah menjadi inspirasi bagi keluarga dan komunitas.', 'Mari rayakan momen istimewa ini bersama-sama dengan penuh syukur dan kebahagiaan.'] },
    gallery: { images: [getImage('bgala-g1', 400, 400), getImage('bgala-g2', 400, 400)], layout: 'carousel' },
    schedule: { title: 'Event Schedule', items: [{ time: '18:00 - 19:00 WIB', title: 'Welcome Cocktail' }, { time: '19:00 - 23:00 WIB', title: 'Gala Dinner & Celebration' }] },
    quote: { text: 'Usia hanyalah angka, semangat muda adalah segalanya!' },
    rsvp: { deadline: '2026-07-06', showConfirmationList: false },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '9990001112', accountName: 'Ratna Dewi Kusuma' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Terima kasih atas doa dan kehadirannya! Love you all!', showCredit: true },
    media: { cover: getImage('bgala-cover', 800, 1200), hero: getImage('bgala-hero', 1200, 800), partner1Photo: getImage('bgala-p1', 400, 400) },
    music: { src: getAudio(14), title: 'Celebration - Kool & The Gang', autoplay: false },
    ogImage: getImage('bgala-og', 1200, 630),
    mode: 'solo',
  },
  {
    slug: 'sample-birthday-wish', templateId: 'undangan-birthday-wish',
    couple: { partner1: 'Bima', partner2: '', partner1Title: 'Bima Sakti', partner1Instagram: '@bimasakti' },
    event: { date: '1 Juni 2026', time: '10:00 - 16:00 WIB', location: 'Kidzania, Jakarta', address: 'Pacific Place, SCBD, Jakarta', mapsUrl: 'https://maps.app.goo.gl/example16', note: 'Happy 7th Birthday Bima!' },
    story: { title: 'Happy 7th Birthday!', paragraphs: ['Bima, anak kami yang ceria dan penuh semangat, genap berusia 7 tahun!', 'Mari rayakan bersama dengan bermain dan bersenang-senang di Kidzania.', 'Kirimkan ucapan dan doa terbaik untuk Bima!'] },
    gallery: { images: [getImage('bwish-g1', 400, 400), getImage('bwish-g2', 400, 400)], layout: 'carousel' },
    schedule: { title: 'Playdate', items: [{ time: '10:00 - 12:00 WIB', title: 'Fun Games' }, { time: '12:00 - 14:00 WIB', title: 'Lunch & Cake' }, { time: '14:00 - 16:00 WIB', title: 'Free Play' }] },
    quote: { text: 'Setiap anak adalah bintang yang bersinar dengan caranya sendiri.' },
    rsvp: { deadline: '2026-05-25', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', items: [{ name: 'Kado bisa dikirim ke rumah' }] },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Terima kasih doa dan hadiahnya! Bima happy banget!', showCredit: true },
    media: { cover: getImage('bwish-cover', 800, 1200), hero: getImage('bwish-hero', 1200, 800), partner1Photo: getImage('bwish-p1', 400, 400) },
    music: { src: getAudio(15), title: 'Happy Birthday - Instrumental', autoplay: true },
    ogImage: getImage('bwish-og', 1200, 630),
    mode: 'solo',
  },
  {
    slug: 'sample-flora', templateId: 'undangan-flora',
    couple: { partner1: 'Joko', partner2: 'Melati', partner1Title: 'Joko Susilo', partner2Title: 'Melati Putri' },
    event: { date: '25 Desember 2026', time: '09:00 - 14:00 WIB', location: 'Gereja, Yogyakarta', address: 'Jl. Malioboro, Yogyakarta', mapsUrl: 'https://maps.app.goo.gl/example17', note: 'Natal bersama keluarga.' },
    story: { title: 'Christmas Love', paragraphs: ['Cinta Joko dan Melati lahir di malam Natal.', 'Paduan suara gereja menjadi latar pertemuan pertama mereka.', 'Kini di hari yang sama, mereka bersatu dalam ikatan pernikahan yang sakral.'] },
    gallery: { images: [getImage('flora-g1', 400, 400), getImage('flora-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Acara', items: [{ time: '09:00 - 10:00 WIB', title: 'Pemberkatan Nikah', venue: 'Gereja' }, { time: '11:00 - 14:00 WIB', title: 'Resepsi Natal', venue: 'Balai Keluarga' }] },
    quote: { text: 'Kasih adalah karunia terbesar yang Tuhan berikan kepada kita.' },
    rsvp: { deadline: '2026-12-11', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '0002223334', accountName: 'Joko & Melati' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'God bless you all! Merry Christmas & Happy Wedding!', showCredit: true },
    media: { cover: getImage('flora-cover', 800, 1200), hero: getImage('flora-hero', 1200, 800), partner1Photo: getImage('flora-p1', 400, 400), partner2Photo: getImage('flora-p2', 400, 400) },
    music: { src: getAudio(0), title: 'All I Want for Christmas - Instrumental', autoplay: true },
    ogImage: getImage('flora-og', 1200, 630),
  },
  {
    slug: 'sample-hana', templateId: 'hana',
    couple: { partner1: 'Karta', partner2: 'Nirmala', partner1Title: 'Karta Wijaya', partner2Title: 'Nirmala Sari', partner1Instagram: '@kartawijaya', partner2Instagram: '@nirmalasari' },
    event: { date: '20 Maret 2027', time: '10:00 - 16:00 WIB', location: 'Hotel Indonesia, Jakarta', address: 'Jl. MH Thamrin, Jakarta', mapsUrl: 'https://maps.app.goo.gl/example18', note: 'Formal attire. Grand ballroom.' },
    gallery: { images: [getImage('hana-g1', 400, 400), getImage('hana-g2', 400, 400), getImage('hana-g3', 400, 400)], layout: 'grid' },
    schedule: { title: 'Grand Wedding', items: [{ time: '10:00 - 11:00 WIB', title: 'Pemberkatan' }, { time: '12:00 - 16:00 WIB', title: 'Resepsi' }] },
    quote: { text: 'Elegance is not about being noticed, it\'s about being remembered.' },
    rsvp: { deadline: '2027-03-06', showConfirmationList: true },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '1114445556', accountName: 'Karta & Nirmala' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Terima kasih telah hadir dan memberikan doa restu!', showCredit: true },
    media: { cover: getImage('hana-cover', 800, 1200), hero: getImage('hana-hero', 1200, 800), partner1Photo: getImage('hana-p1', 400, 400), partner2Photo: getImage('hana-p2', 400, 400) },
    music: { src: getAudio(1), title: 'Canon in D - Pachelbel', autoplay: true },
    ogImage: getImage('hana-og', 1200, 630),
  },
  {
    slug: 'sample-sakura-premium', templateId: 'sakura',
    couple: { partner1: 'Leo', partner2: 'Sakura', partner1Title: 'Leo Yamamoto', partner2Title: 'Sakura Haruka' },
    event: { date: '2 April 2027', time: '10:00 - 15:00 JST', location: 'Shinjuku Gyoen, Tokyo', address: 'Shinjuku, Tokyo, Japan', mapsUrl: 'https://maps.app.goo.gl/example19' },
    gallery: { images: [getImage('skp-g1', 400, 400), getImage('skp-g2', 400, 400), getImage('skp-g3', 400, 400)], layout: 'grid' },
    schedule: { title: 'Ceremony', items: [{ time: '10:00 - 11:00', title: 'Wedding Ceremony' }, { time: '12:00 - 15:00', title: 'Reception' }] },
    quote: { text: 'Some flowers bloom in the most unexpected places.' },
    rsvp: { deadline: '2027-03-19' },
    gift: { enabled: true, layout: 'standalone' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Arigatou gozaimasu! Thank you for coming!', showCredit: true },
    media: { cover: getImage('skp-cover', 800, 1200), hero: getImage('skp-hero', 1200, 800), partner1Photo: getImage('skp-p1', 400, 400), partner2Photo: getImage('skp-p2', 400, 400) },
    music: { src: getAudio(2), title: 'Sakura Sakura - Traditional', autoplay: true },
    ogImage: getImage('skp-og', 1200, 630),
  },
  {
    slug: 'sample-kaze', templateId: 'kaze',
    couple: { partner1: 'Mada', partner2: 'Angin', partner1Title: 'Mada Wirawan', partner2Title: 'Angin Purnama' },
    event: { date: '15 Mei 2027', time: '16:00 - 21:00 WITA', location: 'Cliff, Uluwatu', address: 'Uluwatu, Badung, Bali', mapsUrl: 'https://maps.app.goo.gl/example20' },
    gallery: { images: [getImage('kaze-g1', 400, 400), getImage('kaze-g2', 400, 400), getImage('kaze-g3', 400, 400)], layout: 'grid' },
    schedule: { title: 'Acara', items: [{ time: '16:00 - 17:00', title: 'Sunset Ceremony' }, { time: '17:30 - 21:00', title: 'Dinner' }] },
    quote: { text: 'Angin membawa cinta, ombak menyaksikan janji.' },
    rsvp: { deadline: '2027-05-01' },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '2225556667', accountName: 'Mada & Angin' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Matur suksma! Terima kasih!', showCredit: true },
    media: { cover: getImage('kaze-cover', 800, 1200), hero: getImage('kaze-hero', 1200, 800), partner1Photo: getImage('kaze-p1', 400, 400), partner2Photo: getImage('kaze-p2', 400, 400) },
    music: { src: getAudio(3), title: 'Wind Song - Instrumental', autoplay: true },
    ogImage: getImage('kaze-og', 1200, 630),
  },
  {
    slug: 'sample-liana', templateId: 'liana',
    couple: { partner1: 'Nanda', partner2: 'Liana', partner1Title: 'Nanda Putra', partner2Title: 'Liana Dewi' },
    event: { date: '8 Juni 2027', time: '09:00 - 15:00 WIB', location: 'Forest Lodge, Bandung', address: 'Lembang, Bandung', mapsUrl: 'https://maps.app.goo.gl/example21' },
    gallery: { images: [getImage('liana-g1', 400, 400), getImage('liana-g2', 400, 400), getImage('liana-g3', 400, 400)], layout: 'grid' },
    schedule: { title: 'Acara', items: [{ time: '09:00 - 10:00', title: 'Pemberkatan' }, { time: '11:00 - 15:00', title: 'Resepsi' }] },
    quote: { text: 'Cinta tumbuh seperti tanaman rambat, kuat dan tak terbendung.' },
    rsvp: { deadline: '2027-05-25' },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank Mandiri', accountNumber: '3336667778', accountName: 'Nanda & Liana' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Terima kasih doa dan restunya!', showCredit: true },
    media: { cover: getImage('liana-cover', 800, 1200), hero: getImage('liana-hero', 1200, 800), partner1Photo: getImage('liana-p1', 400, 400), partner2Photo: getImage('liana-p2', 400, 400) },
    music: { src: getAudio(4), title: 'Botanical Dreams', autoplay: true },
    ogImage: getImage('liana-og', 1200, 630),
  },
  {
    slug: 'sample-sora', templateId: 'sora',
    couple: { partner1: 'Oka', partner2: 'Sinta', partner1Title: 'Oka Wiradharma', partner2Title: 'Sinta Paramita' },
    event: { date: '12 Juli 2027', time: '18:00 - 23:00 WIB', location: 'Planetarium, Jakarta', address: 'Taman Ismail Marzuki, Jakarta', mapsUrl: 'https://maps.app.goo.gl/example22' },
    gallery: { images: [getImage('sora-g1', 400, 400), getImage('sora-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Starry Night', items: [{ time: '18:00 - 19:00', title: 'Stargazing' }, { time: '19:00 - 23:00', title: 'Dinner' }] },
    quote: { text: 'Bintang-bintang di langit adalah saksi cinta kita.' },
    rsvp: { deadline: '2027-06-28' },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '4447778889', accountName: 'Oka & Sinta' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Terima kasih telah hadir! Sampai jumpa di bawah bintang!', showCredit: true },
    media: { cover: getImage('sora-cover', 800, 1200), hero: getImage('sora-hero', 1200, 800), partner1Photo: getImage('sora-p1', 400, 400), partner2Photo: getImage('sora-p2', 400, 400) },
    music: { src: getAudio(5), title: 'Starry Night - Instrumental', autoplay: true },
    ogImage: getImage('sora-og', 1200, 630),
  },
  {
    slug: 'sample-matahari', templateId: 'matahari',
    couple: { partner1: 'Putra', partner2: 'Mentari', partner1Title: 'Putra Ramadhan', partner2Title: 'Mentari Pagi' },
    event: { date: '25 Agustus 2027', time: '16:00 - 22:00 WITA', location: 'Beach Club, Seminyak', address: 'Jl. Petitenget, Seminyak, Bali', mapsUrl: 'https://maps.app.goo.gl/example23' },
    gallery: { images: [getImage('mt-g1', 400, 400), getImage('mt-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Beach Celebration', items: [{ time: '16:00 - 17:00', title: 'Sunset Toast' }, { time: '17:00 - 22:00', title: 'Party' }] },
    quote: { text: 'Matahari terbit dan terbenam, tapi cinta kita bersinar selamanya.' },
    rsvp: { deadline: '2027-08-11' },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '5558889990', accountName: 'Putra & Mentari' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Semoga sinar matahari selalu menerangi langkah kita!', showCredit: true },
    media: { cover: getImage('mt-cover', 800, 1200), hero: getImage('mt-hero', 1200, 800), partner1Photo: getImage('mt-p1', 400, 400), partner2Photo: getImage('mt-p2', 400, 400) },
    music: { src: getAudio(6), title: 'Here Comes the Sun - Beatles', autoplay: true },
    ogImage: getImage('mt-og', 1200, 630),
  },
  {
    slug: 'sample-yuki', templateId: 'yuki',
    couple: { partner1: 'Rei', partner2: 'Yuki', partner1Title: 'Rei Kurniawan', partner2Title: 'Yuki Hoshino' },
    event: { date: '20 Desember 2027', time: '10:00 - 16:00 WIB', location: 'Mountain Resort, Puncak', address: 'Cipanas, Puncak', mapsUrl: 'https://maps.app.goo.gl/example24', note: 'White winter theme. Bring warm clothes!' },
    gallery: { images: [getImage('yuki-g1', 400, 400), getImage('yuki-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Winter Wedding', items: [{ time: '10:00 - 11:00', title: 'Ceremony' }, { time: '12:00 - 16:00', title: 'Reception' }] },
    quote: { text: 'Seperti salju pertama di musim dingin, cinta kami murni dan indah.' },
    rsvp: { deadline: '2027-12-06' },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '6669990001', accountName: 'Rei & Yuki' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Arigatou! Thank you! Terima kasih!', showCredit: true },
    media: { cover: getImage('yuki-cover', 800, 1200), hero: getImage('yuki-hero', 1200, 800), partner1Photo: getImage('yuki-p1', 400, 400), partner2Photo: getImage('yuki-p2', 400, 400) },
    music: { src: getAudio(7), title: 'Let It Snow - Instrumental', autoplay: true },
    ogImage: getImage('yuki-og', 1200, 630),
  },
  {
    slug: 'sample-pasir', templateId: 'pasir',
    couple: { partner1: 'Sandi', partner2: 'Gita', partner1Title: 'Sandi Nugraha', partner2Title: 'Gita Paramita' },
    event: { date: '8 September 2027', time: '16:00 - 21:00 WITA', location: 'Desert, Lombok', address: 'Desert, Lombok, NTB', mapsUrl: 'https://maps.app.goo.gl/example25' },
    gallery: { images: [getImage('pasir-g1', 400, 400), getImage('pasir-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Acara', items: [{ time: '16:00 - 17:00', title: 'Sunset Ceremony' }, { time: '17:30 - 21:00', title: 'Dinner' }] },
    quote: { text: 'Setiap butir pasir adalah saksi bisu cinta yang abadi.' },
    rsvp: { deadline: '2027-08-25' },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank NTB', accountNumber: '7770001112', accountName: 'Sandi & Gita' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Terima kasih! Sampai jumpa di padang pasir!', showCredit: true },
    media: { cover: getImage('pasir-cover', 800, 1200), hero: getImage('pasir-hero', 1200, 800), partner1Photo: getImage('pasir-p1', 400, 400), partner2Photo: getImage('pasir-p2', 400, 400) },
    music: { src: getAudio(8), title: 'Desert Rose - Instrumental', autoplay: true },
    ogImage: getImage('pasir-og', 1200, 630),
  },
  {
    slug: 'sample-cinta', templateId: 'cinta',
    couple: { partner1: 'Cinta', partner2: 'Rizky', partner1Title: 'Cinta Laura', partner2Title: 'Rizky Pratama' },
    event: { date: '14 Februari 2027', time: '17:00 - 22:00 WITA', location: 'Hilltop, Ubud', address: 'Ubud, Gianyar, Bali', mapsUrl: 'https://maps.app.goo.gl/example26', note: 'Romantic dinner on the hill. Valentine special.' },
    gallery: { images: [getImage('cinta-g1', 400, 400), getImage('cinta-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Evening', items: [{ time: '17:00 - 18:00', title: 'Sunset Cocktail' }, { time: '18:00 - 22:00', title: 'Romantic Dinner' }] },
    quote: { text: 'Cinta adalah bahasa universal yang dimengerti oleh semua hati.' },
    rsvp: { deadline: '2027-01-31' },
    gift: { enabled: true, layout: 'standalone' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Happy Valentine! Thank you for celebrating love with us!', showCredit: true },
    media: { cover: getImage('cinta-cover', 800, 1200), hero: getImage('cinta-hero', 1200, 800), partner1Photo: getImage('cinta-p1', 400, 400), partner2Photo: getImage('cinta-p2', 400, 400) },
    music: { src: getAudio(9), title: 'My Heart Will Go On - Instrumental', autoplay: true },
    ogImage: getImage('cinta-og', 1200, 630),
  },
  {
    slug: 'sample-bumi', templateId: 'bumi',
    couple: { partner1: 'Bumi', partner2: 'Tari', partner1Title: 'Bumi Langit', partner2Title: 'Tari Kusuma' },
    event: { date: '3 Oktober 2027', time: '09:00 - 16:00 WIB', location: 'Garden Estate, Bogor', address: 'Bogor, Jawa Barat', mapsUrl: 'https://maps.app.goo.gl/example27' },
    gallery: { images: [getImage('bumi-g1', 400, 400), getImage('bumi-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Garden Wedding', items: [{ time: '09:00 - 10:00', title: 'Ceremony' }, { time: '11:00 - 16:00', title: 'Garden Party' }] },
    quote: { text: 'Bumi adalah saksi, langit adalah mahkota cinta kita.' },
    rsvp: { deadline: '2027-09-19' },
    gift: { enabled: true, layout: 'standalone' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Matur nuwun! Terima kasih!', showCredit: true },
    media: { cover: getImage('bumi-cover', 800, 1200), hero: getImage('bumi-hero', 1200, 800), partner1Photo: getImage('bumi-p1', 400, 400), partner2Photo: getImage('bumi-p2', 400, 400) },
    music: { src: getAudio(10), title: 'What a Wonderful World - Louis Armstrong', autoplay: true },
    ogImage: getImage('bumi-og', 1200, 630),
  },
  {
    slug: 'sample-awan', templateId: 'awan',
    couple: { partner1: 'Angga', partner2: 'Mega', partner1Title: 'Angga Wirawan', partner2Title: 'Mega Sari' },
    event: { date: '18 November 2027', time: '18:00 - 23:00 WIB', location: 'Rooftop, Jakarta', address: 'SCBD, Jakarta', mapsUrl: 'https://maps.app.goo.gl/example28' },
    gallery: { images: [getImage('awan-g1', 400, 400), getImage('awan-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Rooftop Party', items: [{ time: '18:00 - 19:00', title: 'Skyline View' }, { time: '19:00 - 23:00', title: 'Dinner & Dance' }] },
    quote: { text: 'Cinta kami melayang tinggi bagaikan awan di langit biru.' },
    rsvp: { deadline: '2027-11-04' },
    gift: { enabled: true, layout: 'standalone' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Thanks for coming up to the clouds with us!', showCredit: true },
    media: { cover: getImage('awan-cover', 800, 1200), hero: getImage('awan-hero', 1200, 800), partner1Photo: getImage('awan-p1', 400, 400), partner2Photo: getImage('awan-p2', 400, 400) },
    music: { src: getAudio(11), title: 'Fly Me to the Moon - Sinatra', autoplay: true },
    ogImage: getImage('awan-og', 1200, 630),
  },
  {
    slug: 'sample-ratu', templateId: 'ratu',
    couple: { partner1: 'Ratu', partner2: 'Pangeran', partner1Title: 'Ratu Ayu', partner2Title: 'Pangeran Dipa' },
    event: { date: '1 Januari 2028', time: '18:00 - 23:00 WIB', location: 'Palace, Yogyakarta', address: 'Keraton Yogyakarta', mapsUrl: 'https://maps.app.goo.gl/example29', note: 'Royal attire. Traditional Javanese palace ceremony.' },
    gallery: { images: [getImage('ratu-g1', 400, 400), getImage('ratu-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Royal Wedding', items: [{ time: '18:00 - 19:00', title: 'Procession' }, { time: '19:00 - 23:00', title: 'Royal Banquet' }] },
    quote: { text: 'A king without a queen is like a day without sunshine.' },
    rsvp: { deadline: '2027-12-18' },
    gift: { enabled: true, layout: 'standalone' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Long live love! Daulat!', showCredit: true },
    media: { cover: getImage('ratu-cover', 800, 1200), hero: getImage('ratu-hero', 1200, 800), partner1Photo: getImage('ratu-p1', 400, 400), partner2Photo: getImage('ratu-p2', 400, 400) },
    music: { src: getAudio(12), title: 'Gamelan Jawa - Instrumental', autoplay: true },
    ogImage: getImage('ratu-og', 1200, 630),
  },
  {
    slug: 'sample-laut', templateId: 'laut',
    couple: { partner1: 'Samudra', partner2: 'Karina', partner1Title: 'Samudra Biru', partner2Title: 'Karina Laut' },
    event: { date: '22 Mei 2027', time: '14:00 - 20:00 WIB', location: 'Beach Resort, Belitung', address: 'Pantai Tanjung Tinggi, Belitung', mapsUrl: 'https://maps.app.goo.gl/example30' },
    gallery: { images: [getImage('laut-g1', 400, 400), getImage('laut-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Coastal Wedding', items: [{ time: '14:00 - 15:00', title: 'Beach Ceremony' }, { time: '15:30 - 20:00', title: 'Seaside Dinner' }] },
    quote: { text: 'Cinta adalah lautan yang dalam dan luas, tempat dua jiwa berlayar bersama.' },
    rsvp: { deadline: '2027-05-08' },
    gift: { enabled: true, layout: 'standalone' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Sampai jumpa di tepi laut! Terima kasih!', showCredit: true },
    media: { cover: getImage('laut-cover', 800, 1200), hero: getImage('laut-hero', 1200, 800), partner1Photo: getImage('laut-p1', 400, 400), partner2Photo: getImage('laut-p2', 400, 400) },
    music: { src: getAudio(13), title: 'Ocean Eyes - Instrumental', autoplay: true },
    ogImage: getImage('laut-og', 1200, 630),
  },
  {
    slug: 'sample-hutan', templateId: 'hutan',
    couple: { partner1: 'Hutan', partner2: 'Rara', partner1Title: 'Hutan Lestari', partner2Title: 'Rara Rimba' },
    event: { date: '15 Agustus 2027', time: '08:00 - 15:00 WIB', location: 'Eco Lodge, Kalimantan', address: 'Tanjung Puting, Kalimantan', mapsUrl: 'https://maps.app.goo.gl/example31' },
    gallery: { images: [getImage('hutan-g1', 400, 400), getImage('hutan-g2', 400, 400)], layout: 'grid' },
    schedule: { title: 'Forest Wedding', items: [{ time: '08:00 - 09:00', title: 'Blessing' }, { time: '10:00 - 15:00', title: 'Forest Feast' }] },
    quote: { text: 'Cinta seperti hutan — misterius, indah, dan penuh kehidupan.' },
    rsvp: { deadline: '2027-08-01' },
    gift: { enabled: true, layout: 'standalone' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Selamatkan hutan, selamatkan cinta! Terima kasih!', showCredit: true },
    media: { cover: getImage('hutan-cover', 800, 1200), hero: getImage('hutan-hero', 1200, 800), partner1Photo: getImage('hutan-p1', 400, 400), partner2Photo: getImage('hutan-p2', 400, 400) },
    music: { src: getAudio(14), title: 'Colors of the Wind - Instrumental', autoplay: true },
    ogImage: getImage('hutan-og', 1200, 630),
  },
  // ── External template ──
  {
    slug: 'sample-azure-skies', templateId: 'azure-skies',
    couple: { partner1: 'Langit', partner2: 'Biru', partner1Title: 'Langit Senja', partner2Title: 'Biru Laut' },
    event: { date: '12 Maret 2027', time: '10:00 - 16:00 WITA', location: 'Waterfront, Manado', address: 'Boulevard, Manado, Sulawesi Utara', mapsUrl: 'https://maps.app.goo.gl/example32' },
    story: { title: 'Azure Love', paragraphs: ['Cinta Langit dan Biru lahir di tepi laut Manado yang biru jernih.', 'Dari snorkeling pertama bersama hingga menyelam di Bunaken, cinta mereka semakin dalam.', 'Kini, di tempat yang sama, mereka bersatu dalam ikatan pernikahan yang sakral.'], image: getImage('asky-story', 600, 400) },
    gallery: { images: [getImage('asky-g1', 400, 400), getImage('asky-g2', 400, 400), getImage('asky-g3', 400, 400)], layout: 'grid' },
    schedule: { title: 'Acara', items: [{ time: '10:00 - 11:00 WITA', title: 'Pemberkatan' }, { time: '11:30 - 16:00 WITA', title: 'Resepsi' }] },
    quote: { text: 'Langit dan laut bersatu di cakrawala, begitu pula cinta kami.' },
    rsvp: { deadline: '2027-02-26' },
    gift: { enabled: true, layout: 'standalone', bankName: 'Bank BCA', accountNumber: '8881112223', accountName: 'Langit & Biru' },
    guestbook: { enabled: true, showMessages: true },
    footer: { text: 'Terima kasih telah menjadi bagian dari cerita biru kami!', showCredit: true },
    media: { cover: getImage('asky-cover', 800, 1200), hero: getImage('asky-hero', 1200, 800), partner1Photo: getImage('asky-p1', 400, 400), partner2Photo: getImage('asky-p2', 400, 400) },
    music: { src: getAudio(15), title: 'Blue Skies - Willie Nelson', autoplay: true },
    ogImage: getImage('asky-og', 1200, 630),
  },
];

// ─── Helper: build InvitationContent from a sample ──────────
function buildContent(sample) {
  const isSolo = sample.mode === 'solo' || !sample.couple.partner2;
  return {
    slug: sample.slug,
    couple: {
      partner1: sample.couple.partner1,
      partner2: sample.couple.partner2 || '',
      partner1Title: sample.couple.partner1Title || '',
      partner2Title: isSolo ? '' : (sample.couple.partner2Title || ''),
      partner1Father: sample.couple.partner1Father || '',
      partner1Mother: sample.couple.partner1Mother || '',
      partner2Father: isSolo ? '' : (sample.couple.partner2Father || ''),
      partner2Mother: isSolo ? '' : (sample.couple.partner2Mother || ''),
      partner1Instagram: sample.couple.partner1Instagram || '',
      partner2Instagram: isSolo ? '' : (sample.couple.partner2Instagram || ''),
    },
    event: {
      date: sample.event.date,
      time: sample.event.time,
      location: sample.event.location,
      address: sample.event.address,
      mapsUrl: sample.event.mapsUrl || '',
      note: sample.event.note || '',
    },
    story: sample.story || { title: 'Kisah Kami', paragraphs: ['Kisah cinta yang indah.'], imagePosition: 'left' },
    stories: sample.stories || [{ year: '2021', title: 'Pertemuan', desc: 'Pertemuan pertama.' }],
    gallery: sample.gallery || { images: [], layout: 'grid' },
    schedule: sample.schedule || { title: 'Acara', items: [{ time: '09:00', title: 'Acara Utama' }] },
    quote: sample.quote || { text: 'Cinta adalah anugerah terindah.' },
    rsvp: sample.rsvp || { showConfirmationList: false },
    gift: sample.gift || { enabled: true, layout: 'standalone' },
    guestbook: sample.guestbook || { enabled: true, showMessages: true },
    maps: {},
    footer: sample.footer || { text: 'Terima kasih!', showCredit: true },
    media: sample.media || {},
    music: sample.music || { autoplay: false },
    ogImage: sample.ogImage || '',
    ogDescription: sample.ogDescription || '',
  };
}

// ─── API helpers ─────────────────────────────────────────────
async function api(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${path}: ${body}`);
  }
  return res.json();
}

async function login() {
  const res = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password: PASSWORD }),
  });
  return res.token;
}

async function getExistingSlugs(token) {
  try {
    const list = await api('/api/invitations', {
      headers: { Cookie: `lumina_session=${token}` },
    });
    return new Set(list.map(i => i.slug));
  } catch {
    return new Set();
  }
}

async function createAndPublish(sample, token) {
  const content = buildContent(sample);
  const slug = sample.slug;

  // Create
  const created = await api('/api/invitations', {
    method: 'POST',
    headers: { Cookie: `lumina_session=${token}` },
    body: JSON.stringify({
      slug,
      title: `${content.couple.partner1}${content.couple.partner2 ? ' & ' + content.couple.partner2 : ''} — ${sample.templateId}`,
      templateId: sample.templateId,
      layoutId: sample.layoutId || 'default',
      content,
      themeOverrides: {},
    }),
  });
  console.log(`  ✓ Created: ${slug}`);

  // Publish via snapshot API
  await api(`/api/invitations/${slug}/publish`, {
    method: 'POST',
    headers: { Cookie: `lumina_session=${token}` },
  });
  console.log(`  ✓ Published: ${slug}`);
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌱 Seeding ${SAMPLES.length} sample invitations...\n`);

  // Login
  console.log('🔑 Logging in...');
  const token = await login();
  console.log('  ✓ Authenticated\n');

  // Check existing
  const existing = await getExistingSlugs(token);
  console.log(`📋 ${existing.size} existing invitation(s) found\n`);

  let created = 0;
  let skipped = 0;

  for (const sample of SAMPLES) {
    if (existing.has(sample.slug)) {
      console.log(`  - Skipped: ${sample.slug} (already exists)`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  → ${sample.slug} (${sample.templateId})...\n`);
      await createAndPublish(sample, token);
      created++;
    } catch (err) {
      console.error(`  ✗ FAILED: ${sample.slug}: ${err.message}`);
    }
  }

  console.log(`\n✅ Done! ${created} created, ${skipped} skipped, ${SAMPLES.length - created - skipped} failed.\n`);

  if (created > 0) {
    console.log('📎 Sample URLs:');
    for (const s of SAMPLES) {
      if (!existing.has(s.slug)) {
        console.log(`  ${BASE}/i/${s.slug}`);
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
