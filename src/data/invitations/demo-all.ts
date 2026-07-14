import type { InvitationContent } from '@/lib/content/types';

const baseDemo: Omit<InvitationContent, 'slug'> = {
  couple: {
    partner1: 'Nanda',
    partner2: 'Amanda',
    parents: 'Bapak Surya & Ibu Dewi & Bapak Aditya & Ibu Putri',
  },
  event: {
    date: '2026-09-12T09:00:00',
    time: '10:00 WITA',
    location: 'The Bali Estate',
    address: 'Jl. Raya Ubud No. 88, Gianyar, Bali',
    mapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.511!2d115.262!3d-8.559',
  },
  story: {
    title: 'Our Love Story',
    paragraphs: [
      'Pertama bertemu di sebuah acara pernikahan teman pada tahun 2020. Takdir mempertemukan kami di momen yang tak terduga.',
      'Memutuskan untuk menjalani hubungan yang lebih serius dan saling mendukung dalam setiap langkah.',
      'Momen pertunangan yang penuh haru, disaksikan oleh keluarga besar dan sahabat terdekat.',
    ],
    imagePosition: 'left',
  },
  gallery: {
    images: ['', '', '', '', '', ''],
    layout: 'grid',
  },
  schedule: {
    title: 'Rangkaian Acara',
    items: [
      { time: '09:00 - 10:00', title: 'Akad Nikah', description: 'Prosesi akad nikah di kediaman mempelai wanita' },
      { time: '11:00 - 15:00', title: 'Resepsi', description: 'Resepsi dan jamuan makan siang' },
      { time: '15:00 - 16:00', title: 'Sesi Foto', description: 'Foto bersama keluarga dan tamu' },
    ],
  },
  quote: {
    text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri.',
    source: 'QS. Ar-Rum: 21',
  },
  rsvp: {
    title: 'Konfirmasi Kehadiran',
    description: 'Mohon konfirmasi kehadiran Anda sebelum 1 September 2026.',
    showConfirmationList: true,
  },
  gift: {
    title: 'Wedding Gift',
    description: 'Doa restu sudah menjadi hadiah terindah. Jika ingin memberikan tanda kasih, berikut info yang dapat digunakan.',
    bankName: 'BCA',
    accountNumber: '1234567890',
    accountName: 'Nanda Putra',
    enabled: true,
    layout: 'standalone',
  },
  guestbook: {
    title: 'Ucapan & Doa',
    description: 'Tinggalkan ucapan dan doa untuk kedua mempelai',
    enabled: true,
    showMessages: true,
  },
  maps: {},
  footer: {
    text: 'Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir.',
    showCredit: true,
  },
  music: {
    src: '',
    title: 'Background Music',
    autoplay: false,
  },
  seo: {
    title: 'Nanda & Amanda — Wedding Invitation',
    description: 'Undangan pernikahan Nanda & Amanda, 12 September 2026',
  },
};

export const demoInvitations: Record<string, InvitationContent> = {
  aurora: { ...baseDemo, slug: 'demo-aurora' },
  fleur: { ...baseDemo, slug: 'demo-fleur' },
  luna: { ...baseDemo, slug: 'demo-luna' },
  ivory: { ...baseDemo, slug: 'demo-ivory' },
  sakura: { ...baseDemo, slug: 'demo-sakura' },
  nordic: { ...baseDemo, slug: 'demo-nordic' },
  royal: { ...baseDemo, slug: 'demo-royal' },
  celeste: { ...baseDemo, slug: 'demo-celeste' },
  verona: { ...baseDemo, slug: 'demo-verona' },
  noir: { ...baseDemo, slug: 'demo-noir' },
};
