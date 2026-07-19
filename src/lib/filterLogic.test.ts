import { describe, it, expect } from 'vitest';
import {
  lensMatchesFilters,
  filterLensData,
  buildChips,
  getDefaultFilterState,
  resetFilterValue,
  formatRangeVal,
} from './filterLogic';
import type {
  FilterConfig,
  FilterState,
  LensData,
  PrimeLens,
  RangeFilterConfig,
  RangeFilterState,
  ZoomLens,
} from '../types';

const makePrime = (overrides: Partial<PrimeLens> = {}): PrimeLens => ({
  id: 'p1',
  name: 'Z 35mm f/1.8 S',
  type: 'prime',
  manufacturer: 'ニコン',
  format: 'FX',
  focalLengthMm: 35,
  focalLengthFxMm: 35,
  maxAperture: 1.8,
  weightG: 370,
  priceJpy: 100000,
  rentalAvailable: null,
  imageStabilization: false,
  ...overrides,
});

const makeZoom = (overrides: Partial<ZoomLens> = {}): ZoomLens => ({
  id: 'z1',
  name: 'Z 24-70mm f/2.8 S',
  type: 'zoom',
  manufacturer: 'ニコン',
  format: 'FX',
  focalLengthMinMm: 24,
  focalLengthMaxMm: 70,
  focalLengthMinFxMm: 24,
  focalLengthMaxFxMm: 70,
  maxAperture: 2.8,
  weightG: 805,
  priceJpy: 300000,
  rentalAvailable: null,
  imageStabilization: false,
  ...overrides,
});

const FILTERS: FilterConfig[] = [
  { key: 'focalLength', label: '焦点距離', type: 'range', unit: 'mm', min: 12, max: 800 },
  { key: 'maxAperture', label: '最大絞り', type: 'select', match: 'lte', options: [1.4, 1.8, 2.8, 4.0] },
  { key: 'priceJpy', label: '価格', type: 'range', unit: '円', step: 10000 },
  { key: 'format', label: 'フォーマット', type: 'select', options: ['FX', 'DX'] },
  { key: 'manufacturer', label: 'メーカー', type: 'select', options: ['ニコン', 'タムロン', 'シグマ'] },
  { key: 'imageStabilization', label: '手ぶれ補正', type: 'toggle' },
  { key: 'sLine', label: 'Sライン', type: 'toggle' },
];

const range = (min: number, max: number, activeMin: number, activeMax: number): RangeFilterState => ({
  min,
  max,
  activeMin,
  activeMax,
});

const defaultState = (): FilterState => ({
  focalLength: range(12, 800, 12, 800),
  maxAperture: 'all',
  priceJpy: range(0, 500000, 0, 500000),
  format: 'all',
  manufacturer: 'all',
  imageStabilization: false,
  sLine: false,
});

describe('lensMatchesFilters', () => {
  it('デフォルト状態ではすべて通す', () => {
    expect(lensMatchesFilters(makePrime(), defaultState(), FILTERS)).toBe(true);
    expect(lensMatchesFilters(makeZoom(), defaultState(), FILTERS)).toBe(true);
  });

  it('焦点距離: 単焦点は点で判定する', () => {
    const state = { ...defaultState(), focalLength: range(12, 800, 50, 100) };
    expect(lensMatchesFilters(makePrime({ focalLengthFxMm: 35 }), state, FILTERS)).toBe(false);
    expect(lensMatchesFilters(makePrime({ focalLengthFxMm: 50 }), state, FILTERS)).toBe(true);
  });

  it('焦点距離: ズームは範囲の重なりで判定する', () => {
    const state = { ...defaultState(), focalLength: range(12, 800, 60, 100) };
    expect(lensMatchesFilters(makeZoom(), state, FILTERS)).toBe(true); // 24-70 と 60-100 は重なる
    const state2 = { ...defaultState(), focalLength: range(12, 800, 100, 200) };
    expect(lensMatchesFilters(makeZoom(), state2, FILTERS)).toBe(false);
  });

  it('価格: 範囲外は除外・null は通す', () => {
    const state = { ...defaultState(), priceJpy: range(0, 500000, 0, 200000) };
    expect(lensMatchesFilters(makeZoom({ priceJpy: 300000 }), state, FILTERS)).toBe(false);
    expect(lensMatchesFilters(makePrime({ priceJpy: 100000 }), state, FILTERS)).toBe(true);
    expect(lensMatchesFilters(makePrime({ priceJpy: null }), state, FILTERS)).toBe(true);
  });

  it('最大絞り: match=lte は選択値以下のみ通す', () => {
    const state = { ...defaultState(), maxAperture: '2.8' };
    expect(lensMatchesFilters(makePrime({ maxAperture: 1.8 }), state, FILTERS)).toBe(true);
    expect(lensMatchesFilters(makePrime({ maxAperture: 2.8 }), state, FILTERS)).toBe(true);
    expect(lensMatchesFilters(makePrime({ maxAperture: 4.0 }), state, FILTERS)).toBe(false);
  });

  it('config 追記だけで新しい range フィルターを追加できる（例: 重さ）', () => {
    const filters: FilterConfig[] = [
      { key: 'weightG', label: '重さ', type: 'range', unit: 'g', step: 100 },
    ];
    const state: FilterState = { weightG: range(0, 1000, 0, 500) };
    expect(lensMatchesFilters(makePrime({ weightG: 370 }), state, filters)).toBe(true);
    expect(lensMatchesFilters(makeZoom({ weightG: 805 }), state, filters)).toBe(false);
    expect(lensMatchesFilters(makePrime({ weightG: null }), state, filters)).toBe(true);
  });

  it('フォーマット・メーカー: 完全一致', () => {
    const state = { ...defaultState(), format: 'DX', manufacturer: 'タムロン' };
    expect(lensMatchesFilters(makePrime({ format: 'DX', manufacturer: 'タムロン' }), state, FILTERS)).toBe(true);
    expect(lensMatchesFilters(makePrime({ format: 'FX', manufacturer: 'タムロン' }), state, FILTERS)).toBe(false);
    expect(lensMatchesFilters(makePrime({ format: 'DX', manufacturer: 'ニコン' }), state, FILTERS)).toBe(false);
  });

  it('トグル: オン時は truthy なレンズのみ通す（未設定フィールドは除外）', () => {
    const state = { ...defaultState(), sLine: true };
    expect(lensMatchesFilters(makePrime({ sLine: true }), state, FILTERS)).toBe(true);
    expect(lensMatchesFilters(makePrime({ sLine: false }), state, FILTERS)).toBe(false);
    expect(lensMatchesFilters(makePrime(), state, FILTERS)).toBe(false);
  });
});

describe('filterLensData', () => {
  const lensData: LensData = {
    lastUpdated: '2026-01-01',
    sections: [
      {
        id: 'prime',
        label: '単焦点',
        rows: [
          { id: 'r1', lenses: [makePrime({ id: 'a', focalLengthFxMm: 35 }), makePrime({ id: 'b', focalLengthFxMm: 85 })] },
          { id: 'r2', lenses: [makePrime({ id: 'c', focalLengthFxMm: 400 })] },
        ],
      },
      {
        id: 'zoom',
        label: 'ズーム',
        rows: [{ id: 'r3', lenses: [makeZoom({ id: 'd' })] }],
      },
    ],
  };

  it('デフォルト状態では全件・lastUpdated を保持する', () => {
    const result = filterLensData(lensData, defaultState(), FILTERS);
    expect(result.lastUpdated).toBe('2026-01-01');
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].rows[0].lenses.map(l => l.id)).toEqual(['a', 'b']);
  });

  it('一致しないレンズを除外し、空になった行を取り除く', () => {
    const state = { ...defaultState(), focalLength: range(12, 800, 30, 100) };
    const result = filterLensData(lensData, state, FILTERS);
    const prime = result.sections.find(s => s.id === 'prime')!;
    expect(prime.rows.map(r => r.id)).toEqual(['r1']); // r2 (400mm) は行ごと消える
    const zoom = result.sections.find(s => s.id === 'zoom')!;
    expect(zoom.rows).toHaveLength(1); // 24-70 は 30-100 と重なる
  });

  it('全行が消えたセクションはセクションごと取り除く', () => {
    const state = { ...defaultState(), maxAperture: '1.8' };
    const result = filterLensData(lensData, state, FILTERS);
    expect(result.sections.map(s => s.id)).toEqual(['prime']); // ズーム (f/2.8) は消える
  });

  it('元データを変更しない', () => {
    const state = { ...defaultState(), maxAperture: '1.8' };
    filterLensData(lensData, state, FILTERS);
    expect(lensData.sections).toHaveLength(2);
    expect(lensData.sections[0].rows[0].lenses).toHaveLength(2);
  });
});

describe('formatRangeVal', () => {
  it('価格は桁区切り + 円', () => {
    const def = FILTERS[2] as RangeFilterConfig;
    expect(formatRangeVal(def, 300000)).toBe('300,000円');
  });

  it('焦点距離は mm', () => {
    const def = FILTERS[0] as RangeFilterConfig;
    expect(formatRangeVal(def, 70)).toBe('70mm');
  });
});

describe('buildChips', () => {
  it('デフォルト状態ではチップなし', () => {
    expect(buildChips(defaultState(), FILTERS)).toEqual([]);
  });

  it('range: min のみ / max のみ / 両方の表記', () => {
    expect(
      buildChips({ ...defaultState(), focalLength: range(12, 800, 24, 800) }, FILTERS)[0].label
    ).toBe('焦点距離: 24mm〜');
    expect(
      buildChips({ ...defaultState(), focalLength: range(12, 800, 12, 70) }, FILTERS)[0].label
    ).toBe('焦点距離: 〜70mm');
    expect(
      buildChips({ ...defaultState(), focalLength: range(12, 800, 24, 70) }, FILTERS)[0].label
    ).toBe('焦点距離: 24mm〜70mm');
  });

  it('価格チップは桁区切りで表示する', () => {
    expect(
      buildChips({ ...defaultState(), priceJpy: range(0, 500000, 0, 300000) }, FILTERS)[0].label
    ).toBe('価格: 〜300,000円');
  });

  it('select: 最大絞り・メーカーの表記', () => {
    expect(buildChips({ ...defaultState(), maxAperture: '2.8' }, FILTERS)[0].label).toBe(
      '最大絞り: f/2.8以下'
    );
    expect(buildChips({ ...defaultState(), manufacturer: 'タムロン' }, FILTERS)[0].label).toBe(
      'メーカー: タムロン'
    );
  });

  it('フォーマットチップは formatLabels に従う', () => {
    expect(buildChips({ ...defaultState(), format: 'FX' }, FILTERS)[0].label).toBe(
      'フォーマット: FX対応'
    );
    expect(
      buildChips({ ...defaultState(), format: 'DX' }, FILTERS, { fx: 'フルサイズ', dx: 'APS-C' })[0]
        .label
    ).toBe('フォーマット: APS-C専用');
  });

  it('toggle はラベルのみ', () => {
    expect(buildChips({ ...defaultState(), sLine: true }, FILTERS)[0].label).toBe('Sライン');
  });

  it('複数フィルターは filters の定義順に並ぶ', () => {
    const chips = buildChips({ ...defaultState(), maxAperture: '2.8', sLine: true }, FILTERS);
    expect(chips.map(c => c.key)).toEqual(['maxAperture', 'sLine']);
  });
});

describe('getDefaultFilterState', () => {
  const lensData: LensData = {
    sections: [
      {
        id: 's1',
        label: 'テスト',
        rows: [
          { id: 'r1', lenses: [makePrime({ priceJpy: 123456 }), makeZoom({ priceJpy: null })] },
        ],
      },
    ],
  };

  it('焦点距離は config の min/max を使う', () => {
    const state = getDefaultFilterState(FILTERS, lensData);
    expect(state.focalLength).toEqual(range(12, 800, 12, 800));
  });

  it('価格の max はデータ最高値を 10,000 円単位で切り上げる', () => {
    const state = getDefaultFilterState(FILTERS, lensData);
    expect(state.priceJpy).toEqual(range(0, 130000, 0, 130000));
  });

  it('価格データがない場合は 1,000,000 円', () => {
    const empty: LensData = {
      sections: [{ id: 's1', label: 't', rows: [{ id: 'r1', lenses: [makePrime({ priceJpy: null })] }] }],
    };
    const state = getDefaultFilterState(FILTERS, empty);
    expect((state.priceJpy as RangeFilterState).max).toBe(1000000);
  });

  it('max 未指定の range はデータ最大値を step 単位で切り上げる（例: 重さ）', () => {
    const filters: FilterConfig[] = [
      { key: 'weightG', label: '重さ', type: 'range', unit: 'g', step: 100 },
    ];
    const state = getDefaultFilterState(filters, lensData);
    // makePrime: 370g, makeZoom: 805g → 900g に切り上げ
    expect(state.weightG).toEqual(range(0, 900, 0, 900));
  });

  it('select は all・toggle は false で初期化する', () => {
    const state = getDefaultFilterState(FILTERS, lensData);
    expect(state.maxAperture).toBe('all');
    expect(state.format).toBe('all');
    expect(state.imageStabilization).toBe(false);
  });
});

describe('resetFilterValue', () => {
  it('range は全域に戻す', () => {
    const state = { ...defaultState(), focalLength: range(12, 800, 24, 70) };
    const next = resetFilterValue('focalLength', state, FILTERS);
    expect(next.focalLength).toEqual(range(12, 800, 12, 800));
  });

  it('select は all・toggle は false に戻す', () => {
    const state = { ...defaultState(), manufacturer: 'シグマ', sLine: true };
    expect(resetFilterValue('manufacturer', state, FILTERS).manufacturer).toBe('all');
    expect(resetFilterValue('sLine', state, FILTERS).sLine).toBe(false);
  });

  it('未知のキーは状態を変えない', () => {
    const state = defaultState();
    expect(resetFilterValue('unknown', state, FILTERS)).toBe(state);
  });
});
