import type { InvitationContent } from '@/lib/content/types';

/**
 * Sample invitation for the Aria template.
 *
 * All content is structured data — nothing hardcoded.
 * Replace this file entirely for each client.
 */
export const ariaDemoInvitation: InvitationContent = {
  slug: 'aria-demo',
  couple: {
    partner1: 'Sarah',
    partner2: 'Alexander',
    partner1Title: 'Sarah Johnson',
    partner2Title: 'Alexander Chen',
    parents: 'Mr. & Mrs. Johnson & Mr. & Mrs. Chen',
  },
  event: {
    date: '2026-09-15T16:00:00',
    time: '4:00 PM',
    location: 'The Grand Botanical Garden',
    address: '742 Eden Valley Road, Beverly Hills, CA 90210',
    mapsUrl: 'https://www.openstreetmap.org/#map=15/34.0736/-118.4004',
    note: 'Garden attire requested. Ceremony will be held outdoors, weather permitting.',
  },
  story: {
    title: 'Our Love Story',
    paragraphs: [
      'It all began on a rainy spring afternoon in a tiny bookstore in Portland. Sarah was reaching for the last copy of a Murakami novel, and so was Alex. We laughed, we talked for hours over coffee, and by sunset, we both knew something extraordinary had begun.',
      'What started as a chance encounter blossomed into a beautiful partnership built on shared dreams, late-night conversations, and countless adventures across the globe. From hiking Patagonia to getting lost in the streets of Kyoto, every moment together has been a treasure.',
      'Today, with hearts full of gratitude and joy, we invite you to witness the next chapter of our love story. Your presence is the greatest gift of all.',
    ],
    image: '', // Will be replaced with uploaded photo
    imagePosition: 'left',
  },
  gallery: {
    images: ['', '', '', '', '', ''],
    layout: 'grid',
  },
  schedule: {
    title: 'Wedding Day Timeline',
    items: [
      {
        time: '4:00 PM',
        title: 'Guest Arrival',
        description: 'Welcome drinks and canapés in the garden',
      },
      {
        time: '4:30 PM',
        title: 'Ceremony',
        description: 'Under the oak tree overlooking the lake',
      },
      {
        time: '5:30 PM',
        title: 'Cocktail Hour',
        description: 'Hors d\'oeuvres and signature cocktails',
      },
      {
        time: '7:00 PM',
        title: 'Reception & Dinner',
        description: 'Three-course dinner with wine pairing',
      },
      {
        time: '9:00 PM',
        title: 'Dancing & Celebration',
        description: 'Live band and open dance floor',
      },
    ],
    note: 'Schedule is subject to minor adjustments on the day.',
  },
  quote: {
    text: 'Love is not two people gazing at each other, but two people looking outward in the same direction.',
    source: 'Antoine de Saint-Exupéry',
  },
  rsvp: {
    title: 'Will You Join Us?',
    description: 'Please let us know if you can make it to our celebration.',
    deadline: '2026-08-15',
    showConfirmationList: true,
  },
  gift: {
    title: 'Wedding Gift',
    description: 'Your presence is the greatest gift. However, if you wish to honor us with a gift, we would be grateful for a contribution to our honeymoon fund.',
    bankName: 'First National Bank',
    accountNumber: '1234-5678-9012-3456',
    accountName: 'Sarah Johnson & Alexander Chen',
    enabled: true,
    layout: 'standalone',
  },
  guestbook: {
    title: 'Guest Book',
    description: 'Leave a message for the happy couple',
    enabled: true,
    showMessages: true,
  },
  maps: {},
  footer: {
    text: 'With love and gratitude, Sarah & Alexander',
    showCredit: true,
  },
  seo: {
    title: 'Sarah & Alexander | Wedding Invitation',
    description: 'Join us celebrating our wedding on September 15, 2026',
  },
};
