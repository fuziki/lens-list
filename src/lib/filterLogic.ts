import type {
  Lens,
  FilterState,
  FilterConfig,
  FilterChip,
  RangeFilterState,
  LensData,
  RangeFilterConfig,
  FormatLabelsConfig,
} from '../types';
import { getLensValue } from './formatters';

const DEFAULT_FORMAT_LABELS: FormatLabelsConfig = { fx: 'FX', dx: 'DX' };

// range フィルターで max 未指定かつデータからも算出できない場合の上限
const FALLBACK_RANGE_MAX = 1000000;

/**
 * フィルターは config.json の定義（key = レンズのフィールド名）だけで動作する。
 * 唯一の例外は焦点距離（focalLength）で、単焦点は点・ズームは区間の重なりで判定する。
 */
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
      } else {
        // 値が未設定（null 等）のレンズは絞り込み対象にしない
        const val = getLensValue(lens, f.key);
        if (typeof val === 'number' && (val < activeMin || val > activeMax)) return false;
      }
    } else if (f.type === 'select') {
      if (state === 'all' || state === null) continue;
      const val = getLensValue(lens, f.key);
      if ((f.match ?? 'eq') === 'lte') {
        if (Number(val) > Number(state)) return false;
      } else {
        if (String(val) !== String(state)) return false;
      }
    } else if (f.type === 'toggle') {
      if (state === true && !getLensValue(lens, f.key)) return false;
    }
  }
  return true;
}

/**
 * フィルターを適用したレンズデータを返す。
 * レンズが0件になった行、行が0件になったセクションは取り除く。
 */
export function filterLensData(
  lensData: LensData,
  filterState: FilterState,
  filters: FilterConfig[]
): LensData {
  return {
    ...lensData,
    sections: lensData.sections
      .map(section => ({
        ...section,
        rows: section.rows
          .map(row => ({
            ...row,
            lenses: row.lenses.filter(lens => lensMatchesFilters(lens, filterState, filters)),
          }))
          .filter(row => row.lenses.length > 0),
      }))
      .filter(section => section.rows.length > 0),
  };
}

export function formatRangeVal(filterDef: RangeFilterConfig, val: number): string {
  return val.toLocaleString() + filterDef.unit;
}

export function buildChips(
  filterState: FilterState,
  filters: FilterConfig[],
  formatLabels: FormatLabelsConfig = DEFAULT_FORMAT_LABELS
): FilterChip[] {
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
        else if (f.key === 'format') {
          label =
            'フォーマット: ' +
            (state === 'FX' ? `${formatLabels.fx}対応` : `${formatLabels.dx}専用`);
        }
        else if (f.key === 'manufacturer') label = 'メーカー: ' + state;
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

  const state: FilterState = {};
  filters.forEach(f => {
    if (f.type === 'range') {
      let min: number;
      let max: number;
      if (f.key === 'focalLength') {
        min = f.min ?? 12;
        max = f.max ?? 800;
      } else {
        min = f.min ?? 0;
        if (f.max != null) {
          max = f.max;
        } else {
          // max 未指定の range はデータの最大値を step 単位で切り上げて使う
          const values = allLenses
            .map(l => getLensValue(l, f.key))
            .filter((v): v is number => typeof v === 'number');
          const step = f.step ?? 1;
          max =
            values.length > 0
              ? Math.ceil(Math.max(...values) / step) * step
              : FALLBACK_RANGE_MAX;
        }
      }
      state[f.key] = { min, max, activeMin: min, activeMax: max };
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
