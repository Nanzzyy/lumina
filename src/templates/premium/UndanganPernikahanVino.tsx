'use client';

import { useEffect, useRef } from 'react';
import type { MonolithicTemplateProps } from '@/lib/template/types';
import type { InvitationContent, ScheduleItem, MediaContent } from '@/lib/content/types';

interface VinoEventItem extends ScheduleItem {
  note?: string;
}

type VinoContent = InvitationContent & {
  media?: MediaContent & {
    coverPhoto?: string;
    heroPhoto?: string;
    logoPhoto?: string;
    loadingLogo?: string;
    storyImages?: string[];
    filterImage?: string;
  };
  video?: { youtubeId?: string; enabled?: boolean; title?: string };
  liveStream?: { youtubeId?: string; enabled?: boolean; url?: string; label?: string };
  instagramFilter?: { enabled?: boolean };
  giftAddress?: string;
  /** Override gift type with address field. */
  gift?: InvitationContent['gift'] & { address?: string };
  rundown?: {
    enabled?: boolean;
    title?: string;
    items?: { time: string; label: string }[];
  };
  gallery?: { enabled?: boolean; images?: string[] };
  quote?: { enabled?: boolean; text?: string; source?: string };
};

function deriveData(content: VinoContent) {
  const c = content.couple;
  const m = content.media || {};
  const p1 = {
    nick: c.partner1 || 'Vino',
    full: c.partner1Title || c.partner1 || 'Vino Laurent',
    father: c.partner1Father || 'Mr. Fredly Mahesa',
    mother: c.partner1Mother || 'Mrs. Jennie Grace',
    ig: c.partner1Instagram || '@luminated',
    photo: m.partner1Photo || '',
  };
  const p2 = {
    nick: c.partner2 || 'Ivelle',
    full: c.partner2Title || c.partner2 || 'Ivelle Rosalie',
    father: c.partner2Father || 'Mr. Calio Den',
    mother: c.partner2Mother || 'Mrs. Shena Wong',
    ig: c.partner2Instagram || '@luminated',
    photo: m.partner2Photo || '',
  };
  const coverPhoto = m.coverPhoto || '';
  const heroPhoto = m.heroPhoto || '';
  const logoPhoto = m.logoPhoto || '';
  const loadingLogo = m.loadingLogo || '';
  const date = content.event?.date || '2026-06-20T09:00:00';
  const intro = content.hero?.subtitle || 'Surrounded by beauty and love, we invite you to celebrate the beginning of our forever.';
  const quoteText = content.quote?.text || 'Love does not consist in gazing at each other, but in looking outward together in the same direction.';
  const quoteSource = content.quote?.source || 'Antoine de Saint-Exupéry';
  const guestName = content.guestName || 'Dear,';
  const videoId = content.video?.youtubeId || 'nrXs4pyjtfs';
  const liveId = content.liveStream?.youtubeId || 'AGcTCvn-a6g';
  const events: VinoEventItem[] = content.schedule.items.length ? content.schedule.items as VinoEventItem[] : [
    { title: 'The Vows', time: '09:00 - 10:00', venue: 'Cathedral of Our Lady of the Assumption', address: 'Jl. Katedral No.7B, Ps. Baru, Sawah Besar, Jakarta 10710', note: 'Kota Jakarta Pusat', mapsUrl: '' },
    { title: 'Garden Celebration', time: '17:00 - 21:00', venue: 'Taman Kajoe', address: 'Jl. Melati No.57 58, Cilandak Tim., Ps. Minggu, Jakarta 12560', note: 'Kota Jakarta Selatan', mapsUrl: '' },
  ];
  const stories = content.stories?.length ? content.stories : [];
  const galleryImages = content.gallery?.images?.length ? content.gallery.images : [];
  const storyImages = m.storyImages || [];
  const filterImage = m.filterImage || '';
  const gifts = content.gift?.items?.length ? content.gift.items : [
    { bank: 'BANK BCA (014)', number: '332265410', owner: 'Ivelle Rosalie' },
    { bank: 'BANK CIMB NIAGA (022)', number: '65500001241', owner: 'Vino Laurent' },
  ];
  const giftAddress = content.giftAddress || content.gift?.address || 'Vino & Ivelle\n08114656441\nKomplek Cendrawasih, Blok T1 No 63 Sidoarjo 001214';
  const dresscode = content.dresscode || { men: 'Garden', women: 'Garden Party', intro: 'Join us in celebrating amidst timeless beauty by wearing refined, elegant attire in soft and harmonious tones.' };
  const rundown = content.rundown?.items?.length ? content.rundown.items : [
    { time: '5:00 PM', label: 'Guest Arrival' },
    { time: '5:30 PM', label: 'The Celebration Begins' },
    { time: '6:00 PM', label: 'Dining & Cherished Moments' },
    { time: '6:30 PM', label: 'Games Session' },
    { time: '7:00 PM', label: 'Captured Memories' },
    { time: '8:00 PM', label: 'With Love & Gratitude' },
  ];
  const sections: Record<string, boolean> = {
    story: !!content.stories?.length,
    gallery: content.gallery?.enabled !== false,
    video: content.video?.enabled !== false,
    liveStream: content.liveStream?.enabled !== false,
    rundown: content.rundown?.enabled !== false,
    instagramFilter: content.instagramFilter?.enabled !== false,
    gift: content.gift?.enabled !== false,
    quote: content.quote?.enabled !== false,
  };
  return { p1, p2, coverPhoto, heroPhoto, logoPhoto, loadingLogo, date, intro, quoteText, quoteSource, guestName, videoId, liveId, events, stories, galleryImages, storyImages, filterImage, gifts, giftAddress, dresscode, rundown, sections };
}

export function UndanganPernikahanVino({ content }: MonolithicTemplateProps) {
  const data = deriveData(content as VinoContent);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cachedHtml = useRef<string>('');

  useEffect(() => {
    let cancelled = false;

    async function build() {
      // Fetch original HTML once, cache it
      if (!cachedHtml.current) {
        const r = await fetch('/vino/index.html');
        cachedHtml.current = await r.text();
      }
      if (cancelled) return;
      const html = cachedHtml.current;

      const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
      const headStyles = headMatch ? (headMatch[1].match(/<style[^>]*>[\s\S]*?<\/style>/g) || []).join('\n') : '';
      const headLinks = headMatch ? (headMatch[1].match(/<link[^>]*rel="stylesheet"[^>]*>/g) || []).join('\n') : '';

      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (!bodyMatch) return;
      let body = bodyMatch[1];

      // Clean cruft
      body = body.replace(/<script>[\s\S]*?<\/script>/g, '');
      body = body.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
      body = body.replace(/<iframe[^>]*><\/iframe>/g, '');
      // Drop dead third-party katsudoto scripts (the fork doesn't host them).
      body = body.replace(/<script[^>]*katsudoto[^>]*><\/script>/g, '');

      // Fix paths
      body = body.replace(/src="images\//g, 'src="/vino/images/');
      body = body.replace(/url\("images\//g, 'url("/vino/images/');
      body = body.replace(/href="css\//g, 'href="/vino/css/');
      body = body.replace(/src="js\//g, 'src="/vino/js/');
      body = body.replace(/fonts\//g, '/vino/fonts/');

      // Clean Katsudoto remnants and powered-by footer
      body = body.replace(/<[^>]*class="[^"]*powered[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '');
      body = body.replace(/Katsudoto/gi, 'Lumina');
      body = body.replace(/katsudoto/gi, 'lumina');

      // === TEXT REPLACEMENTS ===
      body = body.replace(/Vino Laurent/g, data.p1.full);
      body = body.replace(/Ivelle Rosalie/g, data.p2.full);
      // First-name couple displays (hero title, footnote) — the full-name swap
      // above leaves these standalone tokens. Also the couple hashtag + the
      // URL-encoded calendar event title.
      body = body.replace(/Vino(\s*)<br>/g, `${data.p1.nick}$1<br>`);
      body = body.replace(/<br>(\s*)Ivelle/g, `<br>$1${data.p2.nick}`);
      body = body.replace(/Vino & Ivelle/g, `${data.p1.nick} & ${data.p2.nick}`);
      body = body.replace(/VowsofViVelle/g, `${data.p1.nick}${data.p2.nick}`);
      body = body.replace(/Vino\+%26\+Ivelle/g, `${encodeURIComponent(data.p1.nick)}+%26+${encodeURIComponent(data.p2.nick)}`);
      body = body.replace(/Mr\. Fredly Mahesa/g, data.p1.father);
      body = body.replace(/Mrs\. Jennie Grace/g, data.p1.mother);
      body = body.replace(/Mr\. Calio Den/g, data.p2.father);
      body = body.replace(/Mrs\. Shena Wong/g, data.p2.mother);
      body = body.replace(/@katsudoto/g, data.p1.ig);
      body = body.replace(/Surrounded by beauty and love, we invite you to celebrate the beginning of our forever\./g, data.intro);
      body = body.replace(/Love does not consist in gazing at each other, but in looking outward together in the same direction\./g, data.quoteText);
      body = body.replace(/Antoine de Saint-Exupéry/g, data.quoteSource);

      // Guest name — replace the "Dear," in top-cover
      body = body.replace(/>\s*Dear,\s*<\//g, `>${data.guestName}</`);

      // === PHOTO REPLACEMENTS ===
      // Cover photo in opening page — the main animated GIF
      if (data.coverPhoto) {
        body = body.replace(/src="[^"]*gif-917085[^"]*"/g, `src="${data.coverPhoto}"`);
        body = body.replace(/src="[^"]*916895[^"]*"/g, `src="${data.coverPhoto}"`); // logo photo
      }
      if (data.heroPhoto) {
        // Hero background in cover section
        body = body.replace(/<div class="ff-bg"[^>]*>[\s\S]*?<\/div>/, `<div class="ff-bg" style="background-image:url(${data.heroPhoto});background-size:cover;background-position:50% center"></div>`);
      }
      if (data.logoPhoto) {
        body = body.replace(/src="[^"]*916895[^"]*"/g, `src="${data.logoPhoto}"`);
      }
      if (data.loadingLogo) {
        body = body.replace(/src="[^"]*917211[^"]*"/g, `src="${data.loadingLogo}"`);
      }

      // Couple photos — replace the first two gallery-story images in couple section
      if (data.p1.photo) {
        // Replace groom photo (first couple-picture img)
        const groomImgRegex = /(<div class="couple-info groom">[\s\S]*?<img class="img" src=")[^"]*(")/;
        body = body.replace(groomImgRegex, `$1${data.p1.photo}$2`);
      }
      if (data.p2.photo) {
        const brideImgRegex = /(<div class="couple-info bride">[\s\S]*?<img class="img" src=")[^"]*(")/;
        body = body.replace(brideImgRegex, `$1${data.p2.photo}$2`);
      }

      // Story images
      if (data.storyImages.length >= 3) {
        const storyImgPattern = /(story-chitra__slider-for__item">\s*<img src=")[^"]*(")/g;
        let si = 0;
        body = body.replace(storyImgPattern, (match, p1, p2) => {
          const img = data.storyImages[si % data.storyImages.length] || match;
          si++;
          return `${p1}${img}${p2}`;
        });
      }

      // Gallery images
      if (data.galleryImages.length > 0) {
        const galleryPattern = /(photo-img-wrap[^>]*>\s*(?:<a[^>]*>\s*)?<img (?:class="[^"]*"\s*)?src=")[^"]*(")/g;
        let gi = 0;
        body = body.replace(galleryPattern, (match, p1, p2) => {
          const img = data.galleryImages[gi % data.galleryImages.length] || match;
          gi++;
          return `${p1}${img}${p2}`;
        });
      }

      // Instagram filter image
      if (data.filterImage) {
        body = body.replace(/src="[^"]*917091[^"]*"/g, `src="${data.filterImage}"`);
      }

      // === EVENT DATA ===
      if (data.events.length >= 2) {
        // Replace first event
        body = body.replace(/>The Vows</g, `>${data.events[0].title || 'The Vows'}<`);
        body = body.replace(/>09:00 - 10:00</g, `>${data.events[0].time || '09:00 - 10:00'}<`);
        body = body.replace(/>Cathedral of Our Lady of the Assumption</g, `>${data.events[0].venue || ''}<`);
        body = body.replace(/>Jl\. Katedral No\.7B[^<]*</g, `>${data.events[0].address || ''}<`);
        if (data.events[0].note) body = body.replace(/>Kota Jakarta Pusat</g, `>${data.events[0].note}<`);

        // Replace second event
        body = body.replace(/>Garden Celebration</g, `>${data.events[1].title || 'Garden Celebration'}<`);
        body = body.replace(/>17:00 - 21:00</g, `>${data.events[1].time || '17:00 - 21:00'}<`);
        body = body.replace(/>Taman Kajoe</g, `>${data.events[1].venue || ''}<`);
        body = body.replace(/>Jl\. Melati No\.57 58[^<]*</g, `>${data.events[1].address || ''}<`);
        if (data.events[1].note) body = body.replace(/>Kota Jakarta Selatan</g, `>${data.events[1].note}<`);
      }

      // === GIFT DATA ===
      if (data.gifts.length >= 1) {
        body = body.replace(/>BANK BCA[^<]*</g, `>${data.gifts[0].bank || ''}<`);
        body = body.replace(/>332265410</g, `>${data.gifts[0].number || ''}<`);
        body = body.replace(/>Ivelle Rosalie</g, (match, offset) => {
          // Only replace the gift owner, not the main couple name
          return offset > body.indexOf('couple-info') ? `>${data.gifts[0].owner || ''}<` : match;
        });
      }
      if (data.gifts.length >= 2) {
        body = body.replace(/>BANK CIMB NIAGA[^<]*</g, `>${data.gifts[1].bank || ''}<`);
        body = body.replace(/>65500001241</g, `>${data.gifts[1].number || ''}<`);
        body = body.replace(/>Vino Laurent</g, (match, offset) => {
          return offset > body.indexOf('couple-info') ? `>${data.gifts[1].owner || ''}<` : match;
        });
      }

      // Gift address
      body = body.replace(/>Vino &amp; Ivelle<[^>]*>08114656441<[^>]*>Komplek Cendrawasih[^<]*</g, `>${data.giftAddress.replace(/\n/g, '<br>')}<`);

      // === SECTION REMOVAL ===
      if (!data.sections.story) {
        body = body.replace(/<section class="love-story-wrap"[^>]*>[\s\S]*?<\/section>/i, '');
      }
      if (!data.sections.gallery) {
        body = body.replace(/<section class="photo-wrap"[^>]*>[\s\S]*?<\/section>/i, '');
      }
      if (!data.sections.video) {
        body = body.replace(/<section class="video-gallery[^"]*"[^>]*>[\s\S]*?<\/section>/i, '');
      }
      if (!data.sections.quote) {
        body = body.replace(/<section class="quote-wrap"[^>]*>[\s\S]*?<\/section>/i, '');
      }
      if (!data.sections.liveStream) {
        body = body.replace(/<section class="live-streaming"[^>]*>[\s\S]*?<\/section>/i, '');
      }
      if (!data.sections.rundown) {
        body = body.replace(/<section class="rundown-container"[^>]*>[\s\S]*?<\/section>/i, '');
      }
      if (!data.sections.instagramFilter) {
        body = body.replace(/<section class="ig-filter-wrap"[^>]*>[\s\S]*?<\/section>/i, '');
      }
      if (!data.sections.gift) {
        body = body.replace(/<section class="wedding-gift-wrap[^"]*"[^>]*>[\s\S]*?<\/section>/i, '');
        body = body.replace(/<section class="gift-section-wrap"[^>]*>[\s\S]*?<\/section>/i, '');
      }

      // === VIDEO IDs ===
      // Swap every occurrence of the demo YouTube IDs (data-url on the autoplay
      // preview box, data-video-id on the play buttons, href/embed URLs in the
      // live-stream section). Function-form replacement so any '$' in the user
      // ID isn't interpreted as a backreference.
      body = body.replace(/nrXs4pyjtfs/g, () => data.videoId);
      body = body.replace(/AGcTCvn-a6g/g, () => data.liveId);

      // === COUNTDOWN DATE ===
      body = body.replace(/new Date\('2026-06-20T09:00:00'\)/g, `new Date('${data.date}')`);
      body = body.replace(/20260620T170000\/20260620T210000/g, 
        `${data.date.replace(/[-:]/g,'').replace('T','T').slice(0,15)}/${data.date.replace(/[-:]/g,'').replace('T','T').slice(0,15)}`);

      // === EVENT DATE TEXT ===
      body = body.replace(/>Saturday, 20 June 2026</g, `>${new Date(data.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<`);

      // === STORY CONTENT ===
      if (data.stories.length >= 1) {
        body = body.replace(/>The First Hello</g, `>${data.stories[0].title || 'The First Hello'}<`);
        body = body.replace(/>Among lecture halls[^<]*</g, `>${data.stories[0].desc || ''}<`);
      }
      if (data.stories.length >= 2) {
        body = body.replace(/>Love in Bloom</g, `>${data.stories[1].title || 'Love in Bloom'}<`);
        body = body.replace(/>Between garden walks[^<]*</g, `>${data.stories[1].desc || ''}<`);
      }
      if (data.stories.length >= 3) {
        body = body.replace(/>The Proposal</g, `>${data.stories[2].title || 'The Proposal'}<`);
        body = body.replace(/>In a moment filled[^<]*</g, `>${data.stories[2].desc || ''}<`);
      }

      // === RUNDOWN ===
      data.rundown.forEach((item: { time: string; label: string }, i: number) => {
        if (i === 0) {
          body = body.replace(/>Guest Arrival</g, `>${item.label}</`);
          body = body.replace(/>5:00 PM</g, `>${item.time}</`);
        }
        // Harder to do dynamic — use a simpler approach by rebuilding rundown section

      });

      // === DRESSCODE ===
      body = body.replace(/>Garden</g, (match, offset) => {
        return (offset > body.indexOf('dresscode') || offset > body.indexOf('ic-dress')) ? `>${data.dresscode.men || 'Garden'}<` : match;
      });
      body = body.replace(/>Garden Party</g, `>${data.dresscode.women || 'Garden Party'}<`);

      // Build full document
      const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no">
${headLinks.replace(/css\//g, '/vino/css/').replace(/fonts\.googleapis\.com/g, 'fonts.googleapis.com')}
<link rel="stylesheet" href="/vino/css/selectize.default.css">
<link rel="stylesheet" href="/vino/css/flexbin.css">
<link rel="stylesheet" href="/vino/css/aos.css">
<link rel="stylesheet" href="/vino/css/lightgallery.css">
<link rel="stylesheet" href="/vino/css/all.min.css">
<link rel="stylesheet" href="/vino/css/slick.css">
<link rel="stylesheet" href="/vino/css/modal-video.min.css">
<link rel="stylesheet" href="/vino/css/video-js.css">
<link rel="stylesheet" href="/vino/css/52b09361.css">
<link rel="stylesheet" href="/vino/css/49ff9aca.css">
<link rel="stylesheet" href="/vino/css/7436fe60.css">
<link rel="stylesheet" href="/vino/css/96cdc8bb.css">
<link rel="stylesheet" href="/vino/css/6e8e0db0.css">
<link rel="stylesheet" href="/vino/css/ee3271c8.css">
<link rel="stylesheet" href="/vino/css/d4c303a8.css">
<link rel="stylesheet" href="/vino/css/swiper-bundle.min.css">
${headStyles.replace(/fonts\//g, '/vino/fonts/')}
<style>
body.ivana.original {
  --texture-1: url("/vino/images/texture-1.png");
  --frame-cover-mask: url("/vino/images/mask-cover.png");
  --mask-couple: url("/vino/images/frame-couple.png");
  --mask-ls: url("/vino/images/frame-ls.png");
  --bg-ff: url("/vino/images/Orn-38.png");
  --background-primary: #E4D9D5 !important;
  --background-primary-rgb: 228,217,213 !important;
  --background-secondary: #DCC1BA !important;
  --background-secondary-rgb: 220,193,186 !important;
  --background-tertiary: #F6F6F6 !important;
  --text-primary: #521119 !important;
  --text-secondary: #26503A !important;
  --text-tertiary: #7E8E81 !important;
  --button-text-primary: #FFF7DD !important;
  --button-background-primary: #521119 !important;
  --button-text-secondary: #F5F5F5 !important;
  --button-background-secondary: #26503A !important;
  --heading-size: 44px !important;
  --body-text-size: 16px !important;
}
.loading-page-container {
  position: fixed; inset: 0; z-index: 99999999;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  background-color: #FFFFFF; transition: opacity 600ms ease-out;
}
.loading-page-container img { max-width: 120px; border-radius: 50%; }
.loading-page-container .custom-text {
  font-family: 'Cormorant Upright', Georgia, serif;
  font-size: 32px; color: #ED0B53; text-align: center; margin-top: 16px; line-height: 1.1;
}
.loading-page-container .loading-text {
  font-family: Montserrat, sans-serif; font-size: 12px; font-weight: 500;
  color: #B0833C; margin-top: 8px;
}
.loading-page-container button {
  margin-top: 24px; padding: 10px 40px;
  background: #521119; color: #FFF7DD; border: none; border-radius: 999px;
  font-family: Roboto, sans-serif; font-size: 14px; cursor: pointer;
}
</style>
<script src="/vino/js/jquery.js"></script>
<script src="/vino/js/aos.js"></script>
<script src="/vino/js/slick.min.js"></script>
<script src="/vino/js/lightgallery.min.js"></script>
<script src="/vino/js/video.min.js"></script>
<script src="/vino/js/Youtube.min.js"></script>
<script>
// Lumina: wire music widget via event delegation. Runs FIRST because AOS.init
// below throws on this stripped DOM and would abort the rest of the script.
// Behavior: AUTOPLAY on open (first user gesture if browser blocks), music-box
// click = pause/resume.
(function(){
  var audio=new Audio('https://media.katsudoto.id/media/public/70/69311/assets/love-me-like-that-instrumental-1779274541-a6ae8c36a825e1b6498f2a6a.mp3');
  audio.loop=true; audio.preload='auto';
  function box(){return document.getElementById('music-box');}
  function setUI(on){ var b=box(); if(b){ on?b.classList.add('playing'):b.classList.remove('playing'); } }
  function play(){ return audio.play().then(function(){setUI(true)}); }
  function pause(){ audio.pause(); setUI(false); }
  function toggle(){ audio.paused ? play().catch(function(){}) : pause(); }
  document.addEventListener('click',function(e){ var t=e.target; if(t&&t.closest&&t.closest('#music-box')){ e.preventDefault(); toggle(); } });
  document.addEventListener('keydown',function(e){ var t=e.target; if((e.key==='Enter'||e.key===' ')&&t&&t.closest&&t.closest('#music-box')){ e.preventDefault(); toggle(); } });
  // Autoplay on open. Try now; if blocked by autoplay policy, play on first gesture.
  window.startMusic = function(){ play().catch(function(){}); };
  play().catch(function(){
    function g(){ document.removeEventListener('click',g);document.removeEventListener('touchstart',g);document.removeEventListener('keydown',g);document.removeEventListener('scroll',g); play().catch(function(){}); }
    document.addEventListener('click',g);document.addEventListener('touchstart',g);document.addEventListener('keydown',g);document.addEventListener('scroll',g);
  });
})();
try { AOS.init({ duration: 1000, once: false }); } catch(e) {}
$(document).ready(function(){
  $('.story-chitra__slider-for').slick({slidesToShow:1,slidesToScroll:1,arrows:false,fade:true,asNavFor:'.story-chitra__slider-nav'});
  $('.story-chitra__slider-nav').slick({slidesToShow:3,slidesToScroll:1,asNavFor:'.story-chitra__slider-for',dots:false,focusOnSelect:true});
  $('.photo-nav').slick({slidesToShow:1,slidesToScroll:1,arrows:false,asNavFor:'.photo-slider',variableWidth:true,centerMode:true});
  $('.photo-slider').slick({slidesToShow:1,slidesToScroll:1,arrows:true,prevArrow:'.photo-arrow.prev',nextArrow:'.photo-arrow.next',fade:true});
  $('.lightgallery').each(function(){ $(this).lightGallery({speed:500}); });
  $('.story--button.prev').click(function(){$('.story-chitra__slider-for').slick('slickPrev')});
  $('.story--button.next').click(function(){$('.story-chitra__slider-for').slick('slickNext')});
  $('.play-btn').click(function(){
    var vid=$(this).data('video-id');
    $('<div class="video-modal"><div class="vm-bg"><div style="width:90vw;max-width:800px;aspect-ratio:16/9"><iframe src="https://www.youtube.com/embed/'+vid+'?autoplay=1" allow="autoplay;encrypted-media" allowfullscreen></iframe></div><button>&times;</button></div></div>').appendTo('body');
    $('.vm-bg button, .vm-bg').click(function(e){if(e.target===this)$('.video-modal').remove()});
  });
  $('[onclick^="startTheJourney"]').click(function(e){
    e.preventDefault();
    $('.top-cover').addClass('hide');
    $('.loading-page-container').css('pointer-events','none').css('opacity','0');
    setTimeout(function(){$('.loading-page-container').remove()},700);
    if(window.startMusic)window.startMusic();
  });
  $('.loading-page-container button').click(function(){
    $('.loading-page-container').css('pointer-events','none').css('opacity','0');
    setTimeout(function(){$('.loading-page-container').remove()},700);
    if(window.startMusic)window.startMusic();
  });
  (function(){
    var target=new Date('${data.date}').getTime();
    function tick(){
      var now=Date.now(),d=target-now;
      if(d<0){$('.count-day').text('0');$('.count-hour').text('0');$('.count-minute').text('0');$('.count-second').text('0');return}
      $('.count-day').text(Math.floor(d/86400000));
      $('.count-hour').text(Math.floor((d%86400000)/3600000));
      $('.count-minute').text(Math.floor((d%3600000)/60000));
      $('.count-second').text(Math.floor((d%60000)/1000));
    }
    tick();setInterval(tick,1000);
  })();
});
</script>
<style>
.vm-bg{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center}
.vm-bg button{position:absolute;top:20px;right:20px;color:#fff;font-size:30px;background:none;border:none;cursor:pointer}
.vm-bg iframe{width:100%;height:100%;border:none}
</style>
</head>
<body class="ivana original preset-original" data-template="ivana">
${body}
</body>
</html>`;

      if (iframeRef.current) {
        iframeRef.current.srcdoc = doc;
      }
    }

    build();
    return () => { cancelled = true; };
  }, [
    data.p1.full, data.p1.father, data.p1.mother, data.p1.ig, data.p1.photo,
    data.p2.full, data.p2.father, data.p2.mother, data.p2.ig, data.p2.photo,
    data.coverPhoto, data.heroPhoto, data.logoPhoto, data.loadingLogo,
    data.date, data.intro, data.quoteText, data.quoteSource, data.guestName,
    data.videoId, data.liveId, data.filterImage,
    JSON.stringify(data.events), JSON.stringify(data.stories),
    JSON.stringify(data.galleryImages), JSON.stringify(data.storyImages),
    JSON.stringify(data.gifts), data.giftAddress, JSON.stringify(data.dresscode),
    JSON.stringify(data.rundown), JSON.stringify(data.sections),
  ]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc='<html><body style="background:#E4D9D5;display:flex;align-items:center;justify-content:center;height:100vh;font-family:Georgia,serif;color:#521119"><p>Loading...</p></body></html>'
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
      title="Vino & Ivelle Wedding"
    />
  );
}
