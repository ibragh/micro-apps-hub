import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Set Arabic RTL on the test document so layout & assertions match prod.
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', 'ar');
  document.documentElement.setAttribute('dir', 'rtl');
}

afterEach(() => {
  cleanup();
});
