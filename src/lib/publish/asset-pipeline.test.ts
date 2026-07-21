import { describe, it, expect } from 'vitest';
import { srcsetFromVariants } from './asset-pipeline';
import type { AssetVariant } from './asset-pipeline';

describe('asset pipeline (ADR-022)', () => {
  it('srcsetFromVariants builds correct string', () => {
    const variants: AssetVariant[] = [
      { format: 'webp', width: 480, url: '/uploads/hash_w480.webp', bytes: 1000 },
      { format: 'webp', width: 768, url: '/uploads/hash_w768.webp', bytes: 2000 },
      { format: 'webp', width: 1024, url: '/uploads/hash_w1024.webp', bytes: 3000 },
    ];
    const srcset = srcsetFromVariants(variants);
    expect(srcset).toContain('480w');
    expect(srcset).toContain('768w');
    expect(srcset).toContain('1024w');
  });
});
