/**
 * Seed a single Melati sample invitation + publish.
 *   node scripts/seed-melati.mjs
 * Requires the Lumina dev server running (LUMINA_BASE_URL, default :3006).
 */
const BASE = process.env.LUMINA_BASE_URL || 'http://localhost:3006';
const PASSWORD = process.env.LUMINA_PASSWORD || 'lumina-studio-2026';

const content = {
  couple: {
    partner1: 'Arya', partner2: 'Laras',
    partner1Title: 'Arya Wibisana', partner2Title: 'Laras Ayuningtyas',
    partner1Father: 'Bpk. Drs. Wibisana Putra', partner1Mother: 'Ibu Sri Lestari Wibisana',
    partner2Father: 'Bpk. Agus Ningtyas', partner2Mother: 'Ibu Diah Anggrek',
    partner1Instagram: '@arya.wibisana', partner2Instagram: '@laras.ayu',
    partner1Desc: 'Menemukan keindahan dalam hal-hal sederhana dan percaya cinta tumbuh dari kesabaran.',
    partner2Desc: 'Pencinta sastra dan kebun yang meyakini setiap bunga memiliki kisah.',
  },
  event: { date: '2027-06-20T17:00:00', time: '17:00 WIB', location: 'Jakarta', address: 'Taman Melati Estate, Jakarta Selatan' },
  hero: { subtitle: 'Di antara bunga yang mekar dan doa yang tulus, kami memulai babak baru bersama.' },
  stories: [
    { year: '2021', title: 'Pertemuan Pertama', desc: 'Berawal dari pameran bunga, dua jiwa pecinta keindahan alam dipersatukan senyum.' },
    { year: '2023', title: 'Mekar dalam Cinta', desc: 'Taman dan kopi pagi menjadi saksi tumbuhnya persahabatan menjadi cinta yang tenang.' },
    { year: '2025', title: 'Janji Suci', desc: 'Di hamparan melati, sebuah pertanyaan mengubah kisah indah menjadi janji sehidup semati.' },
  ],
  gallery: { images: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1537907690979-ee8e01276184?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&q=80&w=800',
  ]},
  schedule: { title: 'Rangkaian Acara', items: [
    { time: '09:00 - 10:30 WIB', title: 'Upacara Suci', venue: 'Balai Kartika', address: 'Jl. Garuda No. 17, Jakarta Selatan', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Balai+Kartika+Jakarta', description: 'Khidmat dan sakral.' },
    { time: '17:00 - 21:00 WIB', title: 'Resepsi Garden', venue: 'Taman Melati Estate', address: 'Jl. Melati Raya No. 57, Jakarta Selatan', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Taman+Melati+Jakarta', description: 'Terbuka untuk seluruh tamu.' },
  ]},
  quote: { text: 'Cinta sejati bukan tentang saling menatap, tetapi bersama memandang ke arah yang sama.', source: 'Seuntai Harapan Pagi' },
  rsvp: { title: 'Ucapan & Doa', showConfirmationList: true },
  gift: { enabled: true, layout: 'standalone', items: [
    { bank: 'Bank BCA', number: '0283910456', owner: 'Arya Wibisana' },
    { bank: 'Bank Mandiri', number: '1450098765432', owner: 'Laras Ayuningtyas' },
  ]},
  guestbook: { enabled: true, showMessages: true },
  maps: {}, footer: { text: 'Terima kasih atas doa restunya.', showCredit: true },
  media: {
    cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    hero: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1600',
    partner1Photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=700',
    partner2Photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=700',
  },
  music: { src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', title: 'Wedding Instrumental', autoplay: true },
  video: { youtubeId: '2Vv-BfVoq4g', title: 'Forever Arya & Laras — Cinematic' },
  dresscode: { intro: 'Hadirlah dengan busana anggun dalam nuansa harmonis yang menyatu dengan taman.', men: 'Garden Formal — setelan tipis warna lembut', women: 'Garden Party — gaun bunga pastel', palette: ['#F4ECD8', '#D9BE8C', '#8A9A7B', '#C9A0A0', '#9AA0A6'] },
  liveStream: { url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g', label: 'Tonton Siaran Langsung' },
  rundown: { title: 'Resepsi Garden', items: [
    { time: '17:00', label: 'Kedatangan Tamu' }, { time: '17:30', label: 'Perayaan Dimulai' },
    { time: '18:00', label: 'Jamuan & Silaturahmi' }, { time: '18:45', label: 'Sesi Hiburan' },
    { time: '19:30', label: 'Kenangan Tercitra' }, { time: '20:30', label: 'Penutup' },
  ]},
  ogImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
  ogDescription: 'Undangan pernikahan Arya & Laras. Dengan hati yang penuh syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir memberikan doa restu.',
};

async function api(path, opts) {
  const res = await fetch(BASE + path, { credentials: 'include', ...opts });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${typeof body === 'string' ? body.slice(0, 200) : JSON.stringify(body).slice(0, 300)}`);
  return { body, cookie: res.headers.get('set-cookie') };
}

const slug = 'sample-melati';
const tplId = 'melati';
(async () => {
  const loginRes = await api('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: PASSWORD }) });
  const cookie = loginRes.cookie?.split(';')[0];
  const headers = { 'Content-Type': 'application/json', cookie };

  const listRes = await api('/api/invitations', { headers });
  const existing = Array.isArray(listRes.body) ? new Set(listRes.body.map((i) => i.slug)) : new Set();
  if (existing.has(slug)) {
    console.log(`- Skipped: ${slug} (exists) — view: ${BASE}/i/${slug}`);
    return;
  }

  await api('/api/invitations', { method: 'POST', headers, body: JSON.stringify({
    slug, title: 'Arya & Laras — Melati', templateId: tplId, content,
  })});
  console.log(`✓ Created: ${slug}`);

  await api(`/api/invitations/${slug}/publish`, { method: 'POST', headers });
  console.log(`✓ Published: ${slug}`);
  console.log(`  View: ${BASE}/i/${slug}`);
})().catch((e) => { console.error('✗ FAILED:', e.message); process.exit(1); });
