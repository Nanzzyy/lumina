import type { InvitationContent } from '@/lib/content/types';

export const noirDemoInvitation: InvitationContent = {
  slug: 'noir-demo',
  couple: {
    partner1: 'Isabella',
    partner2: 'Marcus',
    partner1Title: 'Isabella Rossi',
    partner2Title: 'Marcus Blackwood',
    parents: 'The Rossi Family & The Blackwood Family',
  },
  event: {
    date: '2026-12-31T20:00:00',
    time: '8:00 PM',
    location: 'The Glasshouse',
    address: '200 Riverside Drive, New York, NY 10001',
    mapsUrl: 'https://www.openstreetmap.org/#map=15/40.7580/-73.9855',
    note: 'Black tie evening. Cocktail hour begins at 8 PM, dinner at 9 PM.',
  },
  story: {
    title: 'The Encounter',
    paragraphs: [
      'It happened in a gallery. Midnight blue walls, a Rothko glowing crimson, and her — standing before it like she belonged inside the frame. He walked past three times before finding the courage to speak.',
      'That conversation never really ended. It stretched from the gallery to a rooftop bar, from that first winter through three continents, from whispered phone calls at 2 AM to building a life together in a tiny Brooklyn apartment.',
      'Every ending is a beginning. This one begins on December 31st, as the clock strikes midnight, with champagne, with everyone we love, and with a promise that echoes into the new year.',
    ],
  },
  gallery: {
    images: ['', '', '', '', ''],
    layout: 'grid',
  },
  schedule: {
    title: 'The Evening',
    items: [
      { time: '8:00 PM', title: 'Cocktails', description: 'Champagne bar and hors d\'oeuvres' },
      { time: '9:00 PM', title: 'Dinner', description: 'Four-course tasting menu' },
      { time: '11:30 PM', title: 'Toast', description: 'Champagne toast at midnight' },
      { time: '12:00 AM', title: 'Dancing', description: 'Open bar and live band until late' },
    ],
  },
  quote: {
    text: 'We loved with a love that was more than love.',
    source: 'Edgar Allan Poe',
  },
  rsvp: {
    title: 'Will You Attend?',
    description: 'Kindly RSVP by December 1st.',
    deadline: '2026-12-01',
    showConfirmationList: true,
  },
  gift: {
    title: 'Gift Registry',
    description: 'Your presence is the only gift we need. For those who wish to honor us further, a contribution to our honeymoon would be deeply appreciated.',
    bankName: 'Chase Bank',
    accountNumber: '9876-5432-1098-7654',
    accountName: 'Isabella Rossi & Marcus Blackwood',
    enabled: true,
    layout: 'standalone',
  },
  guestbook: {
    title: 'Guest Book',
    description: 'Leave us a message',
    enabled: true,
    showMessages: true,
  },
  maps: {},
  footer: {
    text: 'Isabella & Marcus — December 31, 2026',
    showCredit: true,
  },
  seo: {
    title: 'Isabella & Marcus | New Year\'s Eve Wedding',
    description: 'Join us ringing in the new year and our new life together on December 31, 2026.',
  },
};
