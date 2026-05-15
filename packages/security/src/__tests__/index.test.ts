import { describe, it, expect } from 'vitest';
import { escapeHtml, safeIdentifier, toBoundedInt, isSafeUrl, normaliseText } from '../index';

describe('escapeHtml', () => {
  it('escapes the standard set', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });
});

describe('safeIdentifier', () => {
  it('drops unsafe chars and caps length', () => {
    expect(safeIdentifier('hello world!@#', 10)).toBe('helloworld');
  });
});

describe('toBoundedInt', () => {
  it('clamps high and low', () => {
    expect(toBoundedInt(99, 0, 10, -1)).toBe(10);
    expect(toBoundedInt(-5, 0, 10, -1)).toBe(0);
  });
  it('falls back on garbage', () => {
    expect(toBoundedInt('abc', 0, 10, 5)).toBe(5);
  });
});

describe('isSafeUrl', () => {
  it('accepts http(s)', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('http://example.com')).toBe(true);
  });
  it('rejects javascript:', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('normaliseText', () => {
  it('collapses whitespace and caps', () => {
    expect(normaliseText('  a    b\n c ', 50)).toBe('a b c');
    expect(normaliseText('x'.repeat(1000), 10).length).toBe(10);
  });
});
