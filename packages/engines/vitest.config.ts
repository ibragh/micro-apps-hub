import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@mofeed/content': path.resolve(__dirname, '../content/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: false,
  },
});
