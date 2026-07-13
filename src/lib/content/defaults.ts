import type { InvitationContent } from './types';

export const defaultInvitationContent: InvitationContent = {
  slug: 'default',
  couple: {
    partner1: 'Partner 1',
    partner2: 'Partner 2',
  },
  event: {
    date: 'January 1, 2026',
    time: '10:00 AM',
    location: 'Venue Name',
    address: '123 Main Street, City',
  },
  story: {
    title: 'Our Story',
    paragraphs: ['We met and fell in love.'],
    imagePosition: 'left',
  },
  gallery: {
    images: [],
  },
  schedule: {
    title: 'Schedule',
    items: [
      { time: '10:00', title: 'Ceremony' },
      { time: '12:00', title: 'Reception' },
    ],
  },
  quote: {
    text: 'Love is the bridge between two hearts.',
  },
  rsvp: {
    showConfirmationList: true,
  },
  gift: {
    enabled: true,
    layout: 'standalone',
  },
  guestbook: {
    enabled: false,
    showMessages: true,
  },
  maps: {},
  footer: {
    text: 'Thank you for celebrating with us!',
    showCredit: true,
  },
};
