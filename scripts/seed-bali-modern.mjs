/**
 * Seed a single Bali Modern sample invitation + publish.
 *   node scripts/seed-bali-modern.mjs
 * Requires the Lumina dev server running (LUMINA_BASE_URL, default :3006).
 * Gallery/media use the extracted reference assets served from /public/bali-modern.
 */
const BASE = process.env.LUMINA_BASE_URL || 'http://localhost:3006';
const PASSWORD = process.env.LUMINA_PASSWORD || 'lumina-studio-2026';
const A = '/bali-modern';

const GALLERY = [
  `${A}/ABP_2608.jpg`, `${A}/ABZ_8666.jpg`, `${A}/ABP_2239.jpg`, `${A}/ABP_2124.jpg`,
  `${A}/ABP_2095.jpg`, `${A}/ABP_2277.jpg`, `${A}/ABP_2288.jpg`, `${A}/ABP_2323.jpg`,
  `${A}/ABP_2513.jpg`, `${A}/ABP_2662.jpg`, `${A}/ABP_2690.jpg`, `${A}/ABZ_8315.jpg`,
  `${A}/ABZ_8353.jpg`, `${A}/ABZ_8602.jpg`, `${A}/ABZ_8605.jpg`, `${A}/ABZ_8606.jpg`,
  `${A}/ABZ_8707.jpg`, `${A}/ABZ_8786.jpg`, `${A}/ABZ_8877.jpg`, `${A}/ABZ_9205.jpg`,
  `${A}/ABZ_9312.jpg`, `${A}/ABZ_9337.jpg`, `${A}/ABZ_9390.jpg`,
];

const content = {
  couple: {
    partner1: 'Wardana', partner2: 'Moni',
    partner1Title: 'I Kadek Wardana', partner2Title: 'Ni Made Moni Melia Santi, S.Kep',
    partner1Father: 'Bapak I Ketut Sadia', partner1Mother: 'Ibu Ni Made Murniati',
    partner2Father: 'Bapak Drg. I Wayan Nik Arsana, S.KG', partner2Mother: 'Ibu Ni Nyoman Kariani',
    partner1Instagram: 'wardana.87', partner2Instagram: 'moniimeliaa',
    partner1Desc: 'Anak Kedua dari pasangan yang penuh cinta, tumbuh di antara sawah dan senyum keluarga.',
    partner2Desc: 'Anak Kedua dari keluarga yang hangat, dengan mimpi besar dan hati yang tulus.',
  },
  event: { date: '2026-06-03T13:00:00', time: '13:00 WITA', location: 'Ubud, Gianyar, Bali', address: 'Gg. Anila no 1, Ubud, Kabupaten Gianyar, Bali 80571' },
  guestName: 'Bapak/Ibu/Saudara/i',
  stories: [
    { year: '2018', title: 'Pertemuan di Masa Kecil', desc: 'Perjalanan kami dimulai dengan pertemuan sederhana di antara sawah dan senja Ubud, yang akhirnya mengikat dua hati.' },
    { year: '2022', title: 'Delapan Tahun Bersama', desc: 'Setiap musim yang kami lalui bersama menguatkan janji yang tumbuh pelan namun pasti, semetak demi semetak.' },
    { year: '2026', title: 'Menuju Jenjang Pernikahan', desc: 'Dengan restu keluarga, kami melangkah menuju ikatan suci Manusa Yadnya Pawiwahan.' },
  ],
  gallery: { images: GALLERY },
  schedule: { title: 'Save The Date', items: [
    { time: '13:00 WITA - Selesai', title: 'Resepsi', venue: 'Jabon Homestay', address: 'Gg. Anila no 1, Ubud, Kecamatan Ubud, Kabupaten Gianyar, Bali 80571', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ubud+Gianyar+Bali', description: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.' },
  ]},
  quote: { text: 'Wahai pasangan suami-istri, bersatulah dalam cinta, dan semoga keturunanmu penuh kebahagiaan.', source: 'Rg Veda : X.85.42' },
  rsvp: { title: 'Konfirmasi Kehadiran', description: 'Mohon konfirmasi kehadiran Anda sebelum hari bahagia kami.', showConfirmationList: true },
  gift: { enabled: true, layout: 'standalone', items: [
    { bank: 'BANK BRI (002)', number: '059001018136505', owner: 'I Kadek Wardana' },
    { bank: 'BANK BCA (014)', number: '1350703311', owner: 'Ni Made Moni Melia Santi' },
  ]},
  guestbook: { enabled: true, showMessages: true },
  maps: {}, footer: { text: 'Om Shanti Shanti Shanti Om — Wardana & Moni', showCredit: true },
  media: {
    cover: `${A}/cover-desktop.webp`,
    hero: `${A}/cover-desktop.webp`,
    partner1Photo: `${A}/wardana.webp`,
    partner2Photo: `${A}/moni.webp`,
    video: `${A}/video-prewed.mp4`,
    footerImage: `${A}/footer.webp`,
  },
  music: { src: `${A}/music-westlife.mp3`, title: 'Westlife', autoplay: true },
  ogImage: `${A}/cover-desktop.webp`,
  ogDescription: 'The Wedding of Wardana & Moni — Rabu, 3 Juni 2026. Ubud, Bali.',
};

async function api(path, opts) {
  const res = await fetch(BASE + path, { credentials: 'include', ...opts });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${typeof body === 'string' ? body.slice(0, 200) : JSON.stringify(body).slice(0, 300)}`);
  return { body, cookie: res.headers.get('set-cookie') };
}

const slug = 'sample-bali-modern';
const tplId = 'undangan-bali-modern';
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
    slug, title: 'Wardana & Moni — Bali Modern', templateId: tplId, content,
  })});
  console.log(`✓ Created: ${slug}`);

  await api(`/api/invitations/${slug}/publish`, { method: 'POST', headers });
  console.log(`✓ Published: ${slug}`);
  console.log(`  View: ${BASE}/i/${slug}`);
})().catch((e) => { console.error('✗ FAILED:', e.message); process.exit(1); });
