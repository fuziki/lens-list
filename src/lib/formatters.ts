import type { Lens, DisplayAttributeConfig } from '../types';

export function formatAttributeValue(lens: Lens, attr: DisplayAttributeConfig): string {
  const val = (lens as unknown as Record<string, unknown>)[attr.key];

  if (attr.format === 'rental') {
    if (val === null) return '—';
    if (val === false) return '×';
    return Number(val).toLocaleString() + '円/泊';
  }

  if (attr.format === 'dxFocalLength') {
    const CROP = 1.5;
    if ('focalLengthFxMm' in lens) {
      return Math.round(lens.focalLengthFxMm * CROP) + 'mm相当';
    } else {
      const min = Math.round(lens.focalLengthMinFxMm * CROP);
      const max = Math.round(lens.focalLengthMaxFxMm * CROP);
      return `${min}-${max}mm相当`;
    }
  }

  if (attr.format === 'campaign') {
    if (typeof val === 'number') {
      return 'CB: ' + val.toLocaleString() + '円';
    }
    return '×';
  }

  if (attr.format === 'date') {
    if (!val) return '—';
    const [y, m, d] = String(val).split('-').map(Number);
    return `${y}年${m}月${d}日`;
  }

  if (val == null) return '—';

  if (attr.format === 'boolean') {
    return val ? '○' : '—';
  } else if (attr.format === 'number') {
    return Number(val).toLocaleString() + attr.unit;
  } else {
    return String(val) + attr.unit;
  }
}
