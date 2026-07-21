/**
 * CanvasElement — a positioned, layered element on the mobile canvas.
 * Coordinates are in virtual 375×667 pixel space (scaled at render time).
 */
export type EntranceAnimation =
  | 'fadeIn'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleIn'
  | 'rotateIn'
  | 'bounceIn'
  | 'none';

export interface CanvasAnimation {
  entrance: EntranceAnimation;
  duration: number;
  delay: number;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'button' | 'video' | 'divider' | 'icon';
  /** Position in virtual 375×667 space */
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  visible: boolean;
  animation?: CanvasAnimation;
  /** Type-specific data: text content, image src, colors, etc. */
  props: Record<string, string | number | boolean>;
}

export interface CanvasDimensions {
  w: number;
  h: number;
}

export interface CanvasSettings {
  backgroundColor?: string;
  backgroundImage?: string;
}

/** Create a default element of the given type, placed at (x,y). */
export function createDefaultElement(
  type: CanvasElement['type'],
  x: number,
  y: number,
): CanvasElement {
  const base: CanvasElement = {
    id: `el-${Math.random().toString(36).slice(2, 9)}`,
    type,
    x,
    y,
    w: 120,
    h: 40,
    rotation: 0,
    zIndex: 1,
    opacity: 1,
    visible: true,
    animation: { entrance: 'fadeIn', duration: 0.5, delay: 0 },
    props: {},
  };

  switch (type) {
    case 'text':
      return { ...base, w: 240, h: 48, props: { text: 'Teks Baru', fontSize: 16, color: '#ffffff', fontWeight: '400', textAlign: 'center' } };
    case 'image':
      return { ...base, w: 200, h: 200, props: { src: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400', fit: 'cover' } };
    case 'shape':
      return { ...base, w: 80, h: 80, props: { shape: 'circle', fill: '#D4AF37', borderWidth: 0, borderColor: '#ffffff' } };
    case 'button':
      return { ...base, w: 200, h: 48, props: { text: 'Klik Disini', bgColor: '#D4AF37', textColor: '#000000', borderRadius: 24 } };
    case 'video':
      return { ...base, w: 200, h: 150, props: { src: '' } };
    case 'divider':
      return { ...base, w: 200, h: 2, props: { color: '#ffffff', opacity: 0.3 } };
    case 'icon':
      return { ...base, w: 40, h: 40, props: { name: 'Heart', color: '#D4AF37', size: 24 } };
    default:
      return base;
  }
}

/** Default canvas — a clean canvas with one sample text element. */
export function defaultCanvasElements(): CanvasElement[] {
  return [
    { ...createDefaultElement('text', 68, 300), props: { text: 'Selamat Datang', fontSize: 28, color: '#ffffff', fontWeight: '600', textAlign: 'center' } },
    { ...createDefaultElement('text', 48, 360), props: { text: 'Bersama kita rayakan', fontSize: 14, color: '#d4d4d8', fontWeight: '300', textAlign: 'center' }, w: 280 },
  ];
}
