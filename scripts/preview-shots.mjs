// Seed preview invitations + screenshot each template (mobile + desktop).
// Run: node scripts/preview-shots.mjs
import Database from 'better-sqlite3';
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = '/tmp/lumina-shots';
mkdirSync(OUT, { recursive: true });

const TEMPLATES = [
  'undangan-premium',
  'undangan-terracotta',
  'undangan-luxury',
  'undangan-metatah-bali',
  'undangan-birthday-gala',
];

// Seed: empty content so each template renders its own polished demo defaults.
const db = new Database('dev.db');
const seed = db.prepare(`INSERT INTO invitations (id, slug, title, template_id, layout_id, content, theme_overrides, published)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  ON CONFLICT(slug) DO UPDATE SET template_id=excluded.template_id, content=excluded.content, published=1`);
for (const id of TEMPLATES) {
  const slug = `preview-${id}`;
  seed.run(id, slug, id, id, 'default', JSON.stringify({ slug, couple: { partner1: '', partner2: '' } }), '{}');
}
console.log('Seeded', TEMPLATES.length, 'preview invitations');

const browser = await chromium.launch();
for (const id of TEMPLATES) {
  const slug = `preview-${id}`;
  for (const [label, w, h] of [['mobile', 390, 844], ['desktop', 1280, 900]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.goto(`http://localhost:3006/i/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    // Open cover if present
    const openBtn = page.locator('button:has-text("Buka Undangan")');
    if (await openBtn.count()) { await openBtn.first().click().catch(() => {}); await page.waitForTimeout(1500); }
    await page.screenshot({ path: `${OUT}/${id}-${label}.png`, fullPage: true });
    // Cover shot (re-open fresh)
    await page.goto(`http://localhost:3006/i/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/${id}-cover-${label}.png`, fullPage: false });
    await page.close();
    console.log('shot', id, label);
  }
}
await browser.close();
db.close();
console.log('Done →', OUT);
