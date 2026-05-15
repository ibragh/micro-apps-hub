import { describe, it, expect } from 'vitest';
import { validateFactItem, validateAll, ContentValidationError } from '../validate';
import type { FactItem } from '../types';

const goodItem: FactItem = {
  id: 'a1',
  title: 'حدث تاريخي',
  category: 'history',
  sourceName: 'Britannica',
  sourceUrl: 'https://www.britannica.com',
  confidenceLevel: 'high',
  isVerified: true,
  isFictional: false,
};

describe('validateFactItem', () => {
  it('accepts a fully-formed verified item', () => {
    expect(() => validateFactItem(goodItem)).not.toThrow();
  });

  it('rejects a non-fictional item without source', () => {
    expect(() =>
      validateFactItem({ ...goodItem, sourceName: '' }),
    ).toThrowError(ContentValidationError);
  });

  it('rejects a non-fictional item not marked verified', () => {
    expect(() =>
      validateFactItem({ ...goodItem, isVerified: false }),
    ).toThrowError(/must be marked isVerified/);
  });

  it('allows a fictional item without source', () => {
    expect(() =>
      validateFactItem({
        ...goodItem,
        isFictional: true,
        isVerified: false,
        sourceName: '',
      }),
    ).not.toThrow();
  });

  it('rejects missing id or title', () => {
    expect(() => validateFactItem({ ...goodItem, id: '' })).toThrow();
    expect(() => validateFactItem({ ...goodItem, title: '' })).toThrow();
  });
});

describe('validateAll', () => {
  it('rejects duplicate ids', () => {
    expect(() => validateAll([goodItem, goodItem])).toThrowError(/Duplicate id/);
  });

  it('accepts a list of unique items', () => {
    expect(() =>
      validateAll([goodItem, { ...goodItem, id: 'a2' }]),
    ).not.toThrow();
  });
});
