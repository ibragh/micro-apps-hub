/** Asserts that the current document has Arabic RTL setup. */
export function assertRtlSetup(): void {
  const html = document.documentElement;
  if (html.getAttribute('lang') !== 'ar') {
    throw new Error(`Expected <html lang="ar">, got ${html.getAttribute('lang')}`);
  }
  if (html.getAttribute('dir') !== 'rtl') {
    throw new Error(`Expected <html dir="rtl">, got ${html.getAttribute('dir')}`);
  }
}

/** Build a stable fake Date for tests that depend on "today". */
export function fakeToday(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}
