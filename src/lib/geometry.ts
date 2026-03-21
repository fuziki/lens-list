import type { AppConfig, Marker, GeometryContext } from '../types';

export function computeMarkers(config: AppConfig): Marker[] {
  let x = 0;
  return config.focalLengthMarkers.map(m => {
    const entry: Marker = { fxMm: m.fxMm, dxMm: m.dxMm, x };
    x += m.spacingToNext || 0;
    return entry;
  });
}

export function computeContentWidth(markers: Marker[], rightPaddingPx: number): number {
  if (markers.length === 0) return rightPaddingPx;
  return markers[markers.length - 1].x + rightPaddingPx;
}

export function buildGeometry(config: AppConfig): GeometryContext {
  const markers = computeMarkers(config);
  const contentWidth = computeContentWidth(markers, config.rightPaddingPx);
  return { markers, contentWidth };
}

export function getX(fxMm: number, markers: Marker[]): number {
  if (markers.length === 0) return 0;
  if (fxMm <= markers[0].fxMm) return markers[0].x;
  const last = markers[markers.length - 1];
  if (fxMm >= last.fxMm) return last.x;

  for (let i = 0; i < markers.length - 1; i++) {
    const a = markers[i];
    const b = markers[i + 1];
    if (fxMm >= a.fxMm && fxMm <= b.fxMm) {
      const t = (fxMm - a.fxMm) / (b.fxMm - a.fxMm);
      return a.x + t * (b.x - a.x);
    }
  }
  return last.x;
}
