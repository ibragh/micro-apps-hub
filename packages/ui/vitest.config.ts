import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@mofeed/security': path.resolve(__dirname, '../security/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
