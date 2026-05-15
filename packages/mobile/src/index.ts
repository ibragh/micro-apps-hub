/**
 * Shared Capacitor configuration template. When an app is ready to be
 * wrapped as a mobile shell, add a `capacitor.config.ts` to the app
 * folder that imports and extends this base.
 *
 * Example (apps/seerah-quiz/capacitor.config.ts):
 *
 *   import { defineMobileConfig } from '@mofeed/mobile';
 *   export default defineMobileConfig({
 *     appId: 'com.mofeed.seerah-quiz',
 *     appName: 'اختبار السيرة النبوية',
 *     webDir: 'dist',
 *   });
 */

export interface MofeedMobileConfig {
  appId: string;
  appName: string;
  webDir: string;
  ios?: { contentInset?: 'always' | 'automatic' | 'never' | 'scrollableAxes' };
  android?: { allowMixedContent?: boolean };
}

/**
 * Returns a Capacitor-compatible config object. Importing
 * `@capacitor/cli` is left to each app so this package itself does
 * not depend on Capacitor.
 */
export function defineMobileConfig(config: MofeedMobileConfig): Record<string, unknown> {
  return {
    appId: config.appId,
    appName: config.appName,
    webDir: config.webDir,
    bundledWebRuntime: false,
    ios: {
      contentInset: config.ios?.contentInset ?? 'always',
    },
    android: {
      allowMixedContent: config.android?.allowMixedContent ?? false,
    },
    server: {
      androidScheme: 'https',
    },
  };
}
