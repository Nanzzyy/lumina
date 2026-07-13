import { cn } from '@/lib/utils/cn';

type WaveStyle = 'wave' | 'curve' | 'notch' | 'angle';

interface WaveDividerProps {
  style?: WaveStyle;
  color?: string;
  flip?: boolean;
  className?: string;
}

const paths: Record<WaveStyle, string> = {
  wave: 'M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,69.3C1248,75,1344,85,1392,90.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z',
  curve: 'M0,32L48,37.3C96,43,192,53,288,53.3C384,53,480,43,576,48C672,53,768,75,864,80C960,85,1056,75,1152,64C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z',
  notch: 'M0,0L1440,0L1440,32L720,96L0,32Z',
  angle: 'M0,0L1440,48L1440,0Z',
};

const heights: Record<WaveStyle, number> = { wave: 64, curve: 48, notch: 96, angle: 48 };

export function WaveDivider({ style = 'wave', color, flip, className }: WaveDividerProps) {
  const fill = color ?? 'var(--colors-primary-light)';
  const height = heights[style];

  return (
    <div className={cn('relative w-full leading-none overflow-hidden -mb-px', flip && 'rotate-180', className)} style={{ height }} aria-hidden>
      <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d={paths[style]} fill={fill} />
      </svg>
    </div>
  );
}
