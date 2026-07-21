import { z } from 'zod';

export const createInvitationSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  templateId: z.string().min(1),
  layoutId: z.string().min(1).optional().default('default'),
  content: z.record(z.string(), z.unknown()).optional().default({}),
  themeOverrides: z.record(z.string(), z.unknown()).optional().default({}),
  published: z.boolean().optional(),
});

export const updateInvitationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  templateId: z.string().min(1).optional(),
  layoutId: z.string().min(1).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  themeOverrides: z.record(z.string(), z.unknown()).optional(),
  published: z.boolean().optional(),
});

export const createRSVPSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1).max(100),
  status: z.enum(['hadir', 'tidak_hadir', 'ragu']).default('hadir'),
  guests: z.number().int().min(1).max(99).default(1),
  message: z.string().max(500).optional().default(''),
});

export const createWishSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
});

export const createLayoutSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  config: z.object({
    engine: z.enum(['legacy', 'tree']).optional(),
    // Legacy engine
    sections: z.array(z.object({
      id: z.string(),
      type: z.string(),
      variant: z.string().optional(),
      props: z.record(z.string(), z.unknown()).optional(),
      hidden: z.boolean().optional(),
    })).optional(),
    containers: z.array(z.object({
      id: z.string(),
      type: z.enum(['full-width', 'contained', 'split', 'card', 'hero-banner', 'grid', 'carousel']),
      variant: z.string().optional(),
      columns: z.number().int().min(1).max(6).optional(),
    })).optional(),
    // Tree engine
    nodes: z.array(z.record(z.string(), z.unknown())).optional(),
    animation: z.object({
      preset: z.enum(['fade-up', 'fade-in', 'scale-in', 'slide-up', 'none']),
      duration: z.number().optional(),
      delay: z.number().optional(),
      stagger: z.number().optional(),
    }).optional(),
    wrapper: z.object({
      bgClass: z.string().optional(),
      containerClass: z.string().optional(),
      maxWidth: z.string().optional(),
    }).optional(),
  }),
  isBuiltin: z.boolean().optional(),
});

export const updateLayoutSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  config: createLayoutSchema.shape.config.optional(),
});

// ─── Widget (library component) ──────────────────────────────
// Recursive LayoutNode-ish shape (loose; deep structure is clamped at render).
interface WidgetNodeShape {
  id?: string;
  kind?: 'section' | 'composite';
  type?: string;
  widgetId?: string;
  variant?: string;
  props?: Record<string, unknown>;
  placement?: { x: number; y: number; w: number; h: number };
  wrapper?: Record<string, unknown>;
  overrides?: Record<string, unknown>;
  children?: WidgetNodeShape[];
  hidden?: boolean;
  order?: number;
}

const widgetNodeSchema: z.ZodType<WidgetNodeShape> = z.lazy(() => z.object({
  id: z.string().optional(),
  kind: z.enum(['section', 'composite']).optional(),
  type: z.string().optional(),
  widgetId: z.string().optional(),
  variant: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
  placement: z.object({
    x: z.number(), y: z.number(), w: z.number(), h: z.number(),
  }).optional(),
  wrapper: z.record(z.string(), z.unknown()).optional(),
  overrides: z.record(z.string(), z.unknown()).optional(),
  children: z.array(widgetNodeSchema).optional(),
  hidden: z.boolean().optional(),
  order: z.number().optional(),
}));

export const createWidgetSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  thumbnail: z.string().max(2000).optional().default(''),
  category: z.string().max(50).optional().default('section'),
  definition: widgetNodeSchema,
});

export const updateWidgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  thumbnail: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  definition: widgetNodeSchema.optional(),
});
