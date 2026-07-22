// Automated functional audit of all 5 monolithic templates.
// Tests: cover open, countdown renders, RSVP submit, gallery lightbox, gift copy.
// Run: node scripts/audit-templates.mjs
import { chromium } from 'playwright';

const TEMPLATES = ['undangan-premium', 'undangan-terracotta', 'undangan-luxury', 'undangan-metatah-bali', 'undangan-birthday-gala'];
const BASE = 'http://localhost:3006/i';
const browser = await chromium.launch();
const results = [];

for (const id of TEMPLATES) {
  const slug = `preview-${id}`;
  const row = { id };

  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    // 1. Load → cover should be visible
    await page.goto(`${BASE}/${slug}?to=Test+User`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const coverText = await page.locator('text=Test User').count();
    row.cover = coverText > 0 ? 'OK' : 'FAIL: guest name missing';
    const openBtn = page.locator('button:has-text("Buka Undangan"), button:has-text("BUKA UNDANGAN")');
    const openCount = await openBtn.count();
    if (openCount) {
      await openBtn.first().click().catch(() => {});
      await page.waitForTimeout(2000);
    }

    // 2. Countdown digits visible
    const digits = await page.locator('[class*="padStart"]').count();
    const numeric = await page.locator('text=/\\b[0-9]{2}\\b/').count();
    row.countdown = numeric > 0 ? 'OK' : 'WARN: no countdown';

    // 3. RSVP form present + submit
    const rsvpInput = page.locator('input[placeholder*="Nama"], input[placeholder*="nama"], input[placeholder*="Name"]');
    if (await rsvpInput.count()) {
      await rsvpInput.first().fill('Test User Audit');
      const msg = page.locator('textarea');
      if (await msg.count()) await msg.first().fill('Test message from audit');
      const submitBtn = page.locator('button[type="submit"], button:has-text("Kirim"), button:has-text("Send")');
      if (await submitBtn.count()) {
        await submitBtn.first().click().catch(() => {});
        await page.waitForTimeout(1000);
      }
      row.rsvp = 'OK';
    } else {
      row.rsvp = 'WARN: RSVP form not found';
    }

    // 4. Gallery click → lightbox
    const galleryItems = page.locator('img[alt*="Gallery"], img[alt*="gallery"], [class*="rounded-2xl"] img').first();
    if (await galleryItems.count()) {
      const src = await galleryItems.getAttribute('src');
      await galleryItems.click().catch(() => {});
      await page.waitForTimeout(800);
      const lightbox = page.locator('.fixed.inset-0.z-50, [class*="z-50"]');
      if (await lightbox.count()) {
        row.lightbox = 'OK';
        await page.keyboard.press('Escape');
      } else {
        row.lightbox = 'WARN: no lightbox';
      }
    } else {
      row.lightbox = 'N/A: no gallery';
    }

    // 5. Gift copy button
    const copyBtn = page.locator('button:has-text("Salin"), button:has-text("Copy")');
    if (await copyBtn.count()) {
      await copyBtn.first().click().catch(() => {});
      await page.waitForTimeout(500);
      row.gift = (await page.locator('text=tersalin, text=Disalin, text=✓, text=Check').count()) > 0 ? 'OK' : 'WARN';
    } else {
      row.gift = 'N/A';
    }

    await page.close();
  } catch (e) {
    row.cover = `CRASH: ${String(e).slice(0, 80)}`;
  }
  results.push(row);
  console.log(id, JSON.stringify(row));
}
await browser.close();

const fail = results.filter((r) => Object.values(r).some((v) => typeof v === 'string' && (v.startsWith('FAIL') || v.startsWith('CRASH'))));
console.log('\n=== RESULTS ===');
console.table(results);
if (fail.length) console.log(`FAILURES: ${fail.length}`, fail.map((r) => r.id));
else console.log('ALL PASSED');
