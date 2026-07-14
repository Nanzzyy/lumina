/** All text/content is driven by this interface — never hardcoded in components. */
export interface CoupleContent {
  partner1: string;
  partner2: string;
  partner1Title?: string;
  partner2Title?: string;
  parents?: string;
}

export interface EventContent {
  date: string;
  time: string;
  location: string;
  address: string;
  mapsUrl?: string;
  note?: string;
}

export interface StoryContent {
  title: string;
  paragraphs: string[];
  image?: string;
  /** Image position: left or right of text */
  imagePosition?: 'left' | 'right';
}

export interface GalleryContent {
  images: string[];
  layout?: 'grid' | 'masonry' | 'carousel';
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface ScheduleContent {
  title: string;
  items: ScheduleItem[];
  note?: string;
}

export interface QuoteContent {
  text: string;
  source?: string;
}

export interface RSVPContent {
  title?: string;
  description?: string;
  deadline?: string;
  endpoint?: string;
  /** Show confirmation list below form */
  showConfirmationList?: boolean;
}

export interface GiftItem {
  name: string;
  note?: string;
}

export interface GiftContent {
  title?: string;
  description?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  items?: GiftItem[];
  /** Toggle gift section visibility */
  enabled?: boolean;
  /** Layout position */
  layout?: 'standalone' | 'below-attendance';
}

export interface GuestBookContent {
  title?: string;
  description?: string;
  enabled: boolean;
  /** Show messages publicly */
  showMessages?: boolean;
}

export interface MapsContent {
  title?: string;
  embedUrl?: string;
}

export interface FooterContent {
  text: string;
  showCredit?: boolean;
}

/** Per-section background appearance */
export interface SectionBackground {
  type?: 'color' | 'image' | 'gradient';
  color?: string;
  image?: string;
  gradient?: string;
  /** Overlay effect: 'darken' | 'blur' | 'none' */
  overlay?: 'darken' | 'blur' | 'none';
  /** Overlay opacity 0-1 */
  overlayOpacity?: number;
}

/** Decorative ornament config */
export interface OrnamentConfig {
  id: string;
  type: 'flower' | 'divider' | 'dots' | 'frame' | 'leaf' | 'swirl' | 'heart' | 'custom';
  /** Free positioning as percentage of container (0-100). */
  x?: number;
  y?: number;
  rotation?: number;
  /** Legacy named position — used when x/y are not set. */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color?: string;
  size?: 'sm' | 'md' | 'lg' | number;
  opacity?: number;
  customSvg?: string;
  /** Entrance / exit animation config. */
  animation?: {
    entrance?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'rotateIn' | 'bounceIn' | 'none';
    exit?: 'fadeOut' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleOut' | 'rotateOut' | 'bounceOut' | 'none';
    duration?: number;
    delay?: number;
  };
}

export interface HeroContent {
  subtitle?: string;
}

/**
 * Complete invitation data.
 * Every field is optional at the top level — the template decides what to render.
 */
export interface InvitationContent {
  slug: string;
  couple: CoupleContent;
  event: EventContent;
  hero?: HeroContent;
  story: StoryContent;
  gallery: GalleryContent;
  schedule: ScheduleContent;
  quote: QuoteContent;
  rsvp: RSVPContent;
  gift: GiftContent;
  guestbook: GuestBookContent;
  maps: MapsContent;
  footer: FooterContent;
  /** Per-section background overrides (keyed by section id from template) */
  sectionBackgrounds?: Record<string, SectionBackground>;
  /** Global ornaments for the invitation */
  ornaments?: OrnamentConfig[];
  music?: {
    src: string;
    title?: string;
    autoplay?: boolean;
  };
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
}
