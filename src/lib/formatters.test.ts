import { describe, it, expect } from 'vitest';
import { getFormatLabels, isNew, formatAttributeValue } from './formatters';
import type { AppConfig, DisplayAttributeConfig, Lens, PrimeLens, ZoomLens } from '../types';

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

const attr = (overrides: Partial<DisplayAttributeConfig>): DisplayAttributeConfig => ({
  key: 'weightG',
  label: '重さ',
  unit: 'g',
  format: 'number',
  ...overrides,
});

const daysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

describe('getFormatLabels', () => {
  it('未設定なら FX / DX を返す', () => {
    expect(getFormatLabels({} as AppConfig)).toEqual({ fx: 'FX', dx: 'DX' });
  });

  it('config の formatLabels を優先する', () => {
    const config = { formatLabels: { fx: 'フルサイズ', dx: 'APS-C' } } as AppConfig;
    expect(getFormatLabels(config)).toEqual({ fx: 'フルサイズ', dx: 'APS-C' });
  });
});

describe('isNew', () => {
  it('未設定は false', () => {
    expect(isNew(undefined)).toBe(false);
  });

  it('6ヶ月以内の発売日は true', () => {
    expect(isNew(daysAgo(30))).toBe(true);
  });

  it('6ヶ月より前の発売日は false', () => {
    expect(isNew(daysAgo(365))).toBe(false);
  });
});

describe('formatAttributeValue', () => {
  const format = (lens: Lens, a: DisplayAttributeConfig, cropFactor?: number) =>
    formatAttributeValue(lens, a, cropFactor);

  it('number: 桁区切り + 単位', () => {
    expect(format(makeZoom({ weightG: 1234 }), attr({}))).toBe('1,234g');
  });

  it('number: null は —', () => {
    expect(format(makePrime({ weightG: null }), attr({}))).toBe('—');
  });

  it('rental: 金額 / 非対応 / 不明', () => {
    const rental = attr({ key: 'rentalAvailable', format: 'rental', unit: '' });
    expect(format(makePrime({ rentalAvailable: 5500 }), rental)).toBe('5,500円/泊');
    expect(format(makePrime({ rentalAvailable: false }), rental)).toBe('×');
    expect(format(makePrime({ rentalAvailable: null }), rental)).toBe('—');
  });

  it('campaign: 金額対象は CB 表記・対象外/未設定は ×', () => {
    const campaign = attr({ key: 'campaignCashbackJpy', format: 'campaign', unit: '' });
    expect(format(makePrime({ campaignCashbackJpy: 20000 }), campaign)).toBe('CB: 20,000円');
    expect(format(makePrime({ campaignCashbackJpy: false }), campaign)).toBe('×');
    expect(format(makePrime(), campaign)).toBe('×');
  });

  it('date: 和暦なし年月日表記・未設定は —', () => {
    const date = attr({ key: 'releaseDate', format: 'date', unit: '' });
    expect(format(makePrime({ releaseDate: '2025-02-28' }), date)).toBe('2025年2月28日');
    expect(format(makePrime(), date)).toBe('—');
  });

  it('boolean: ○ / —', () => {
    const stab = attr({ key: 'imageStabilization', format: 'boolean', unit: '' });
    expect(format(makePrime({ imageStabilization: true }), stab)).toBe('○');
    expect(format(makePrime({ imageStabilization: false }), stab)).toBe('—');
  });

  it('dxFocalLength: 単焦点はクロップファクター換算の単値', () => {
    const dx = attr({ key: 'dxFocalLength', format: 'dxFocalLength', unit: '' });
    expect(format(makePrime({ focalLengthFxMm: 35 }), dx)).toBe('53mm相当');
    expect(format(makePrime({ focalLengthFxMm: 35 }), dx, 1.6)).toBe('56mm相当');
  });

  it('dxFocalLength: ズームは範囲表記', () => {
    const dx = attr({ key: 'dxFocalLength', format: 'dxFocalLength', unit: '' });
    expect(format(makeZoom(), dx)).toBe('36-105mm相当');
  });
});
