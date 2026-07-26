/**
 * Seed a single Vino (1:1 clone) sample invitation + publish.
 *   node scripts/seed-vino.mjs
 * Requires the Lumina dev server running (LUMINA_BASE_URL, default :3006).
 * Gallery/media use the scraped reference assets served from /public/vino.
 */
const BASE = process.env.LUMINA_BASE_URL || 'http://localhost:3006';
const PASSWORD = process.env.LUMINA_PASSWORD || 'lumina-studio-2026';
const G = '/vino/gallery';
const Y = '/vino/youtube';

const content = {
  couple: {
    partner1: 'Vino', partner2: 'Ivelle',
    partner1Title: 'Vino Laurent', partner2Title: 'Ivelle Rosalie',
    partner1Father: 'Mr. Fredly Mahesa', partner1Mother: 'Mrs. Jennie Grace',
    partner2Father: 'Mr. Calio Den', partner2Mother: 'Mrs. Shena Wong',
    partner1Instagram: '@katsudoto', partner2Instagram: '@katsudoto',
  },
  event: { date: '2026-06-20T09:00:00', time: '09:00', location: 'Jakarta', address: 'Jakarta, Indonesia' },
  hero: { subtitle: 'Surrounded by beauty and love, we invite you to celebrate the beginning of our forever.' },
  stories: [
    { year: 'The First Hello', title: 'The First Hello', desc: 'Among lecture halls, quiet conversations, and unexpected moments, two paths gently crossed. What began as a simple introduction soon turned into a connection neither of us ever expected.' },
    { year: 'Love in Bloom', title: 'Love in Bloom', desc: 'Between garden walks, warm conversations, and coffee shared beneath quiet skies, friendship slowly blossomed into something more beautiful — a love that felt like home.' },
    { year: 'The Proposal', title: 'The Proposal', desc: 'In a moment filled with love, surprise, and quiet happiness, a simple question changed everything — turning a beautiful story into a promise of forever.' },
  ],
  gallery: { images: [
    `${G}/gallery-01.webp`, `${G}/gallery-02.webp`, `${G}/gallery-03.webp`,
    `${G}/gallery-04.webp`, `${G}/gallery-05.webp`, `${G}/gallery-06.webp`,
    `${G}/gallery-07.webp`, `${G}/gallery-08.webp`, `${G}/gallery-09.webp`,
    `${G}/gallery-10.webp`, `${G}/gallery-11.webp`, `${G}/gallery-12.webp`,
    `${G}/gallery-13.webp`, `${G}/gallery-14.webp`, `${G}/gallery-15.webp`,
  ]},
  schedule: { title: 'Join Our Celebration', items: [
    { time: '09:00 - 10:00', title: 'The Vows', venue: 'Cathedral of Our Lady of the Assumption', address: 'Jl. Katedral No.7B, Ps. Baru, Sawah Besar, Jakarta 10710', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cathedral+of+Our+Lady+of+the+Assumption+Jakarta', description: 'Kota Jakarta Pusat' },
    { time: '17:00 - 21:00', title: 'Garden Celebration', venue: 'Taman Kajoe', address: 'Jl. Melati No.57 58, RT.4/RW.2, Cilandak Tim., Ps. Minggu, Jakarta 12560', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Taman+Kajoe+Jakarta', description: 'Kota Jakarta Selatan' },
  ]},
  quote: { text: 'Love does not consist in gazing at each other, but in looking outward together in the same direction.', source: 'Antoine de Saint-Exupéry' },
  rsvp: { title: 'Leave a Loving Note', showConfirmationList: true },
  gift: { enabled: true, layout: 'standalone', items: [
    { bank: 'BANK BCA (014)', number: '332265410', owner: 'Ivelle Rosalie' },
    { bank: 'BANK CIMB NIAGA (022)', number: '65500001241', owner: 'Vino Laurent' },
  ]},
  guestbook: { enabled: true, showMessages: true },
  maps: {}, footer: { text: 'Bound by Love — Vino & Ivelle', showCredit: true },
  media: {
    cover: `${G}/gallery-cover.webp`,
    hero: `${G}/gallery-cover.webp`,
    partner1Photo: `${G}/gallery-01.webp`,
    partner2Photo: `${G}/gallery-02.webp`,
  },
  music: { src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', title: 'Wedding Instrumental', autoplay: true },
  video: { youtubeId: 'nrXs4pyjtfs', title: 'Captured in Motion' },
  dresscode: { intro: 'Join us in celebrating amidst timeless beauty by wearing refined, elegant attire in soft and harmonious tones.', men: 'Garden', women: 'Garden Party', palette: ['#F4ECD8', '#E8DCC4', '#8A9A7B', '#C9A0A0', '#9AA0A6'] },
  liveStream: { url: 'https://www.youtube.com/watch?v=AGcTCvn-a6g', label: 'Open Link' },
  rundown: { title: 'Garden Celebration', items: [
    { time: '5:00 PM', label: 'Guest Arrival' }, { time: '5:30 PM', label: 'The Celebration Begins' },
    { time: '6:00 PM', label: 'Dining & Cherished Moments' }, { time: '6:30 PM', label: 'Games Session' },
    { time: '7:00 PM', label: 'Captured Memories' }, { time: '8:00 PM', label: 'With Love & Gratitude' },
  ]},
  ogImage: `${G}/gallery-cover.webp`,
  ogDescription: 'Vino & Ivelle — Bound by Love. Saturday, 20 June 2026.',
};

async function api(path, opts) {
  const res = await fetch(BASE + path, { credentials: 'include', ...opts });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${typeof body === 'string' ? body.slice(0, 200) : JSON.stringify(body).slice(0, 300)}`);
  return { body, cookie: res.headers.get('set-cookie') };
}

const slug = 'sample-vino';
const tplId = 'vino';
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
    slug, title: 'Vino & Ivelle — Vino Clone', templateId: tplId, content,
  })});
  console.log(`✓ Created: ${slug}`);

  await api(`/api/invitations/${slug}/publish`, { method: 'POST', headers });
  console.log(`✓ Published: ${slug}`);
  console.log(`  View: ${BASE}/i/${slug}`);
})().catch((e) => { console.error('✗ FAILED:', e.message); process.exit(1); });
