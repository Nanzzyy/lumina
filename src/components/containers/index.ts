import type { ReactNode, CSSProperties } from 'react';

export type ContainerType =
  | 'full-width'
  | 'contained'
  | 'split'
  | 'card'
  | 'hero-banner'
  | 'grid'
  | 'carousel';

export interface ContainerProps {
  children: ReactNode;
  type: ContainerType;
  variant?: string;
  columns?: number;
  style?: CSSProperties;
  className?: string;
}

export { FullWidthContainer } from './FullWidthContainer';
export { ContainedContainer } from './ContainedContainer';
export { SplitContainer } from './SplitContainer';
export { CardContainer } from './CardContainer';
export { HeroBannerContainer } from './HeroBannerContainer';
export { GridContainer } from './GridContainer';
export { CarouselContainer } from './CarouselContainer';

import { FullWidthContainer } from './FullWidthContainer';
import { ContainedContainer } from './ContainedContainer';
import { SplitContainer } from './SplitContainer';
import { CardContainer } from './CardContainer';
import { HeroBannerContainer } from './HeroBannerContainer';
import { GridContainer } from './GridContainer';
import { CarouselContainer } from './CarouselContainer';

export const ContainerComponents: Record<ContainerType, React.FC<{ children: ReactNode; variant?: string; style?: CSSProperties; className?: string; columns?: number }>> = {
  'full-width': FullWidthContainer,
  'contained': ContainedContainer,
  'split': SplitContainer,
  'card': CardContainer,
  'hero-banner': HeroBannerContainer,
  'grid': GridContainer,
  'carousel': CarouselContainer,
};
