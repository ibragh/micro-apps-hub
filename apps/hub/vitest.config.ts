import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mofeed/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@mofeed/seo': path.resolve(__dirname, '../../packages/seo/src/index.ts'),
      '@mofeed/analytics': path.resolve(__dirname, '../../packages/analytics/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['../../packages/testing/src/setup.ts'],
    css: false,
  },
});
