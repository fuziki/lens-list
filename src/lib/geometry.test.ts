import { describe, it, expect } from 'vitest';
import { computeMarkers, computeContentWidth, getX, buildGeometry } from './geometry';
import type { AppConfig, Marker } from '../types';

const configWithMarkers = (markers: AppConfig['focalLengthMarkers'], rightPaddingPx = 120): AppConfig =>
  ({ focalLengthMarkers: markers, rightPaddingPx }) as AppConfig;

describe('computeMarkers', () => {
  it('spacingToNext を累積して x 座標を割り当てる', () => {
    const markers = computeMarkers(
      configWithMarkers([
        { fxMm: 0, dxMm: 0, spacingToNext: 40 },
        { fxMm: 24, dxMm: 36, spacingToNext: 100 },
        { fxMm: 50, dxMm: 75, spacingToNext: 0 },
      ])
    );
    expect(markers.map(m => m.x)).toEqual([0, 40, 140]);
    expect(markers.map(m => m.fxMm)).toEqual([0, 24, 50]);
  });
});

describe('computeContentWidth', () => {
  it('最右マーカーの x + 右余白を返す', () => {
    const markers: Marker[] = [
      { fxMm: 0, dxMm: 0, x: 0 },
      { fxMm: 24, dxMm: 36, x: 200 },
    ];
    expect(computeContentWidth(markers, 120)).toBe(320);
  });

  it('マーカーが空の場合は右余白のみ', () => {
    expect(computeContentWidth([], 120)).toBe(120);
  });
});

describe('buildGeometry', () => {
  it('markers と contentWidth をまとめて返す', () => {
    const geo = buildGeometry(
      configWithMarkers(
        [
          { fxMm: 0, dxMm: 0, spacingToNext: 40 },
          { fxMm: 24, dxMm: 36, spacingToNext: 0 },
        ],
        100
      )
    );
    expect(geo.markers).toHaveLength(2);
    expect(geo.contentWidth).toBe(140);
  });
});

describe('getX', () => {
  const markers: Marker[] = [
    { fxMm: 0, dxMm: 0, x: 0 },
    { fxMm: 24, dxMm: 36, x: 40 },
    { fxMm: 48, dxMm: 72, x: 140 },
  ];

  it('マーカー位置ちょうどの値はそのマーカーの x を返す', () => {
    expect(getX(24, markers)).toBe(40);
  });

  it('マーカー間は線形補間する', () => {
    expect(getX(36, markers)).toBe(90);
  });

  it('最小より小さい値は先頭マーカーにクランプする', () => {
    expect(getX(-5, markers)).toBe(0);
  });

  it('最大より大きい値は末尾マーカーにクランプする', () => {
    expect(getX(1000, markers)).toBe(140);
  });

  it('マーカーが空なら 0 を返す', () => {
    expect(getX(50, [])).toBe(0);
  });
});
