import type { UserConfig } from 'vitest/config';

/**
 * Shared Vitest config used by every app. Apps spread this and add their
 * own `resolve.alias` mappings to the workspace packages.
 */
export const sharedVitestConfig: UserConfig = {
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['@mofeed/testing/setup'],
  },
};
