/**
 * Capacitor configuration for the iOS / Android shell.
 *
 * To produce a native build for the first time:
 *   pnpm --filter @mofeed/seerah-quiz build
 *   cd apps/seerah-quiz
 *   pnpm add -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
 *   npx cap add ios       # first time only
 *   npx cap add android   # first time only
 *
 * On subsequent web rebuilds:
 *   pnpm --filter @mofeed/seerah-quiz build && cd apps/seerah-quiz && npx cap sync
 *
 * Open ios/App.xcworkspace in Xcode or android/ in Android Studio to ship.
 *
 * The shared base config lives in @mofeed/mobile; this file spreads it
 * so every app's mobile shell has consistent defaults.
 */
import { defineMobileConfig } from '@mofeed/mobile';

const config = defineMobileConfig({
  appId: 'com.mofeed.seerah-quiz',
  appName: 'اختبار السيرة النبوية',
  webDir: 'dist',
});

export default config;
