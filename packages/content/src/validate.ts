import type { FactItem } from './types';

export class ContentValidationError extends Error {
  constructor(
    message: string,
    public readonly itemId: string,
  ) {
    super(message);
    this.name = 'ContentValidationError';
  }
}

/**
 * Validate a single content item. Non-fictional items must carry a
 * sourceName and be marked verified. Throws on failure so the build
 * fails noisily.
 */
export function validateFactItem(item: FactItem): void {
  if (!item.id || typeof item.id !== 'string') {
    throw new ContentValidationError('Missing id', item.id ?? '(no-id)');
  }
  if (!item.title || typeof item.title !== 'string') {
    throw new ContentValidationError('Missing title', item.id);
  }
  if (!item.category) {
    throw new ContentValidationError('Missing category', item.id);
  }
  if (!item.isFictional) {
    if (!item.sourceName) {
      throw new ContentValidationError(
        'Non-fictional items must include sourceName',
        item.id,
      );
    }
    if (!item.isVerified) {
      throw new ContentValidationError(
        'Non-fictional items must be marked isVerified=true',
        item.id,
      );
    }
  }
}

export function validateAll(items: readonly FactItem[]): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      throw new ContentValidationError('Duplicate id', item.id);
    }
    seen.add(item.id);
    validateFactItem(item);
  }
}
