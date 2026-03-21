import type { Lens, DisplayAttributeConfig } from '../types';

export function formatAttributeValue(lens: Lens, attr: DisplayAttributeConfig): string {
  const val = (lens as unknown as Record<string, unknown>)[attr.key];

  if (val == null) return '—';

  if (attr.format === 'boolean') {
    return val ? '○' : '—';
  } else if (attr.format === 'number') {
    return Number(val).toLocaleString() + attr.unit;
  } else {
    return String(val) + attr.unit;
  }
}
