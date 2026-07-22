import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

// R7 (ADR-011): Core tests run in Node — no jsdom, no DOM, no React.
// If any core module imports react/react-dom, resolution or execution here fails.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'bench/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/lib/core'),
    },
  },
});
