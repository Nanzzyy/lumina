'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { InvitationContent } from '@/lib/content/types';
import type { CanvasElement } from '@/lib/content/canvas-types';
import { Heart } from 'lucide-react';

/* ─── Entrance animation variants ─── */

function animInitial(anim?: CanvasElement['animation']) {
  const preset = anim?.entrance ?? 'none';
  switch (preset) {
    case 'fadeIn':
      return { opacity: 0 };
    case 'slideUp':
      return { opacity: 0, y: 30 };
    case 'slideDown':
      return { opacity: 0, y: -30 };
    case 'slideLeft':
      return { opacity: 0, x: -30 };
    case 'slideRight':
      return { opacity: 0, x: 30 };
    case 'scaleIn':
      return { opacity: 0, scale: 0.8 };
    case 'rotateIn':
      return { opacity: 0, rotate: -10, scale: 0.9 };
    case 'bounceIn':
      return { opacity: 0, scale: 0.5 };
    default:
      return { opacity: 1 };
  }
}

/* ─── Per-element renderer ─── */

function renderElement(el: CanvasElement) {
  const p = el.props;

  switch (el.type) {
    case 'text':
      return (
        <div
          className="w-full h-full flex items-center break-words leading-tight"
          style={{
            fontSize: (p.fontSize as number) || 16,
            color: (p.color as string) || '#ffffff',
            fontWeight: (p.fontWeight as string) || '400',
            textAlign: p.textAlign as React.CSSProperties['textAlign'] || 'left',
            fontFamily: (p.fontFamily as string) || 'system-ui, sans-serif',
          }}
        >
          {(p.text as string) || ''}
        </div>
      );

    case 'image':
      return p.src ? (
        <img
          src={p.src as string}
          alt=""
          className="w-full h-full pointer-events-none"
          style={{
            objectFit: p.fit as React.CSSProperties['objectFit'] || 'cover',
            borderRadius: (p.borderRadius as number) || 0,
          }}
        />
      ) : (
        <div className="w-full h-full bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 text-xs">
          No image
        </div>
      );

    case 'shape': {
      const shape = (p.shape as string) || 'circle';
      const fill = (p.fill as string) || '#D4AF37';
      const borderW = (p.borderWidth as number) || 0;
      const borderC = (p.borderColor as string) || '#fff';
      return (
        <div
          className="w-full h-full"
          style={{
            borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' ? 12 : 0,
            backgroundColor: fill,
            borderWidth: borderW,
            borderStyle: 'solid',
            borderColor: borderC,
          }}
        />
      );
    }

    case 'button':
      return (
        <button
          className="w-full h-full flex items-center justify-center text-xs font-semibold transition-all active:scale-95"
          style={{
            backgroundColor: (p.bgColor as string) || '#D4AF37',
            color: (p.textColor as string) || '#000000',
            borderRadius: (p.borderRadius as number) || 24,
            fontSize: (p.fontSize as number) || 14,
          }}
        >
          {(p.text as string) || 'Button'}
        </button>
      );

    case 'video':
      return p.src ? (
        <video
          src={p.src as string}
          muted
          loop
          playsInline
          className="w-full h-full object-cover rounded-lg pointer-events-none"
        />
      ) : (
        <div className="w-full h-full bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 text-xs">
          No video
        </div>
      );

    case 'divider':
      return (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: (p.color as string) || '#ffffff',
            opacity: (p.opacity as number) ?? 0.3,
          }}
        />
      );

    case 'icon': {
      const Icon = iconMap[(p.name as string) || 'Heart'] || Heart;
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Icon
            size={(p.size as number) || 24}
            color={(p.color as string) || '#D4AF37'}
          />
        </div>
      );
    }

    default:
      return null;
  }
}

const iconMap: Record<string, React.FC<any>> = {};

/* ─── The canvas — fixed size, absolutely positioned elements ─── */

export function CanvasRenderer({ content }: { content: InvitationContent }) {
  const elements = content.canvasElements || [];
  const dim = content.canvasDimensions || { w: 375, h: 667 };
  const bgColor = content.canvasSettings?.backgroundColor || '#0B0F19';
  const bgImage = content.canvasSettings?.backgroundImage;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width || 375;
      setScale(Math.min(w / dim.w, 1));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [dim.w]);

  return (
    <div ref={wrapperRef} className="w-full flex justify-center overflow-hidden">
      <div
        className="relative overflow-hidden"
        style={{
          width: dim.w,
          height: dim.h,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          backgroundColor: bgColor,
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: 'cover',
          flexShrink: 0,
        }}
      >
        {elements
          .filter((e) => e.visible !== false)
          .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
          .map((el) => (
            <motion.div
              key={el.id}
              initial={animInitial(el.animation)}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }}
              transition={{
                duration: el.animation?.duration || 0.5,
                delay: el.animation?.delay || 0,
                ease: 'easeOut',
              }}
              className="absolute pointer-events-none"
              style={{
                left: el.x,
                top: el.y,
                width: el.w,
                height: el.h,
                zIndex: el.zIndex ?? 0,
                opacity: el.opacity ?? 1,
                rotate: `${el.rotation ?? 0}deg`,
              }}
            >
              {renderElement(el)}
            </motion.div>
          ))}
      </div>
    </div>
  );
}

export default CanvasRenderer;
