import type {
  Lens,
  FilterState,
  FilterConfig,
  FilterChip,
  RangeFilterState,
  LensData,
  RangeFilterConfig,
} from '../types';

export function lensMatchesFilters(
  lens: Lens,
  filterState: FilterState,
  filters: FilterConfig[]
): boolean {
  for (const f of filters) {
    const state = filterState[f.key];

    if (f.type === 'range') {
      const rs = state as RangeFilterState;
      const { activeMin, activeMax } = rs;

      if (f.key === 'focalLength') {
        const fMin = lens.type === 'prime' ? lens.focalLengthFxMm : lens.focalLengthMinFxMm;
        const fMax = lens.type === 'prime' ? lens.focalLengthFxMm : lens.focalLengthMaxFxMm;
        if (fMax < activeMin || fMin > activeMax) return false;
      } else if (f.key === 'priceJpy') {
        if (lens.priceJpy !== null && (lens.priceJpy < activeMin || lens.priceJpy > activeMax)) {
          return false;
        }
      }
    } else if (f.type === 'select') {
      if (state === 'all' || state === null) continue;
      if (f.key === 'maxAperture') {
        if (lens.maxAperture > Number(state)) return false;
      } else if (f.key === 'format') {
        if (lens.format !== state) return false;
      }
    } else if (f.type === 'toggle') {
      const key = f.key as keyof Lens;
      if (state === true && !lens[key]) return false;
    }
  }
  return true;
}

export function formatRangeVal(filterDef: RangeFilterConfig, val: number): string {
  if (filterDef.key === 'priceJpy') return val.toLocaleString() + '円';
  if (filterDef.key === 'focalLength') return val + 'mm';
  return String(val);
}

export function buildChips(filterState: FilterState, filters: FilterConfig[]): FilterChip[] {
  const chips: FilterChip[] = [];

  filters.forEach(f => {
    const state = filterState[f.key];
    let label: string | null = null;

    if (f.type === 'range') {
      const rs = state as RangeFilterState;
      const isMinDefault = rs.activeMin === rs.min;
      const isMaxDefault = rs.activeMax === rs.max;
      if (!isMinDefault || !isMaxDefault) {
        const minStr = formatRangeVal(f, rs.activeMin);
        const maxStr = formatRangeVal(f, rs.activeMax);
        if (!isMinDefault && !isMaxDefault) label = f.label + ': ' + minStr + '〜' + maxStr;
        else if (!isMinDefault) label = f.label + ': ' + minStr + '〜';
        else label = f.label + ': 〜' + maxStr;
      }
    } else if (f.type === 'select') {
      if (state !== 'all' && state !== null) {
        if (f.key === 'maxAperture') label = f.label + ': f/' + state + '以下';
        else if (f.key === 'format') label = 'フォーマット: ' + (state === 'FX' ? 'FX対応' : 'DX専用');
        else label = f.label + ': ' + state;
      }
    } else if (f.type === 'toggle') {
      if (state === true) label = f.label;
    }

    if (label) chips.push({ key: f.key, label });
  });

  return chips;
}

export function getDefaultFilterState(filters: FilterConfig[], lensData: LensData): FilterState {
  const allLenses: Lens[] = [];
  lensData.sections.forEach(s => s.rows.forEach(r => r.lenses.forEach(l => allLenses.push(l))));

  const prices = allLenses.map(l => l.priceJpy).filter((p): p is number => p !== null);
  const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 1000000;

  const state: FilterState = {};
  filters.forEach(f => {
    if (f.type === 'range') {
      if (f.key === 'focalLength') {
        const min = f.min ?? 12;
        const max = f.max ?? 800;
        state[f.key] = { min, max, activeMin: min, activeMax: max };
      } else if (f.key === 'priceJpy') {
        state[f.key] = { min: 0, max: maxPrice, activeMin: 0, activeMax: maxPrice };
      }
    } else if (f.type === 'select') {
      state[f.key] = 'all';
    } else if (f.type === 'toggle') {
      state[f.key] = false;
    }
  });

  return state;
}

export function resetFilterValue(
  key: string,
  filterState: FilterState,
  filters: FilterConfig[]
): FilterState {
  const f = filters.find(x => x.key === key);
  if (!f) return filterState;

  if (f.type === 'range') {
    const rs = filterState[key] as RangeFilterState;
    return {
      ...filterState,
      [key]: { ...rs, activeMin: rs.min, activeMax: rs.max },
    };
  } else if (f.type === 'select') {
    return { ...filterState, [key]: 'all' };
  } else if (f.type === 'toggle') {
    return { ...filterState, [key]: false };
  }
  return filterState;
}
