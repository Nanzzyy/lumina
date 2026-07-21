import type { InvitationContent } from './types';
import { defaultCanvasElements } from './canvas-types';

export const defaultInvitationContent: InvitationContent = {
  slug: 'default',
  couple: {
    partner1: 'Partner 1',
    partner2: 'Partner 2',
    partner1Father: 'Bpk. ...',
    partner1Mother: 'Ibu ...',
    partner2Father: 'Bpk. ...',
    partner2Mother: 'Ibu ...',
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
  stories: [
    { year: '2021', title: 'Pertemuan Pertama', desc: 'Awal perjumpaan kami.' },
    { year: '2023', title: 'Komitmen Bersama', desc: 'Melangkah pada komitmen yang lebih serius.' },
    { year: '2025', title: 'Lamaran Resmi', desc: 'Meminang di hadapan kedua keluarga.' },
  ],
  gallery: {
    images: [],
  },
  schedule: {
    title: 'Schedule',
    items: [
      { time: '08:00 - 10:00 WIB', title: 'Akad Nikah', venue: 'Masjid', address: '', mapsUrl: 'https://maps.google.com' },
      { time: '11:00 - 14:00 WIB', title: 'Resepsi Pernikahan', venue: 'Ballroom', address: '', mapsUrl: 'https://maps.google.com' },
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
    items: [
      { name: 'Bank BCA', bank: 'Bank BCA', number: '0000000000', owner: 'Nama' },
    ],
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
  canvasElements: defaultCanvasElements(),
  canvasDimensions: { w: 375, h: 667 },
  canvasSettings: { backgroundColor: '#0B0F19' },
};
