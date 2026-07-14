import type { SectionConfig, AnimationConfig } from '@/lib/template/types';

export type ContainerType =
  | 'full-width'
  | 'contained'
  | 'split'
  | 'card'
  | 'hero-banner'
  | 'grid'
  | 'carousel';

export interface ContainerConfig {
  id: string;
  type: ContainerType;
  variant?: string;
  columns?: number;
  responsive?: {
    mobile?: Partial<ContainerConfig>;
    tablet?: Partial<ContainerConfig>;
  };
}

export interface LayoutDefinition {
  id: string;
  name: string;
  description: string;
  sections: SectionConfig[];
  containers: ContainerConfig[];
  animation?: AnimationConfig;
  wrapper?: {
    bgClass?: string;
    containerClass?: string;
    maxWidth?: string;
  };
}
