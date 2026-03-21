// ============================================================
// Config types
// ============================================================

export interface FocalLengthMarkerConfig {
  fxMm: number;
  dxMm: number;
  spacingToNext: number;
}

export interface ColorsConfig {
  headerBackground: string;
  headerText: string;
  sectionLabelBackground: string;
  sectionLabelText: string;
  rowBackground: string;
  gridLineColor: string;
  sectionDividerColor: string;
  lensDot: string;
  zoomBar: string;
  lensNameText: string;
  attributeText: string;
}

export interface TypographyConfig {
  lensNameFontSizePx: number;
  attributeFontSizePx: number;
  headerFontSizePx: number;
}

export interface DisplayAttributeConfig {
  key: string;
  label: string;
  unit: string;
  format: 'number' | 'boolean' | 'string';
}

export interface RangeFilterConfig {
  key: string;
  label: string;
  type: 'range';
  unit: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectFilterConfig {
  key: string;
  label: string;
  type: 'select';
  options: (number | string)[];
}

export interface ToggleFilterConfig {
  key: string;
  label: string;
  type: 'toggle';
}

export type FilterConfig = RangeFilterConfig | SelectFilterConfig | ToggleFilterConfig;

export interface AppConfig {
  focalLengthMarkers: FocalLengthMarkerConfig[];
  rightPaddingPx: number;
  sectionLabelWidthPx: number;
  rowBaseHeightPx: number;
  attributeRowHeightPx: number;
  primeDotDiameterPx: number;
  zoomBarHeightPx: number;
  zoomBarBorderRadiusPx: number;
  colors: ColorsConfig;
  typography: TypographyConfig;
  displayAttributes: DisplayAttributeConfig[];
  filters: FilterConfig[];
}

// ============================================================
// Lens data types
// ============================================================

export interface PrimeLens {
  id: string;
  name: string;
  type: 'prime';
  format: 'FX' | 'DX';
  focalLengthMm: number;
  focalLengthFxMm: number;
  maxAperture: number;
  weightG: number | null;
  priceJpy: number | null;
  rentalAvailable: boolean | null;
  imageStabilization: boolean;
}

export interface ZoomLens {
  id: string;
  name: string;
  type: 'zoom';
  format: 'FX' | 'DX';
  focalLengthMinMm: number;
  focalLengthMaxMm: number;
  focalLengthMinFxMm: number;
  focalLengthMaxFxMm: number;
  maxAperture: number;
  weightG: number | null;
  priceJpy: number | null;
  rentalAvailable: boolean | null;
  imageStabilization: boolean;
}

export type Lens = PrimeLens | ZoomLens;

export interface LensRow {
  id: string;
  lenses: Lens[];
}

export interface LensSection {
  id: string;
  label: string;
  rows: LensRow[];
}

export interface LensData {
  lastUpdated?: string;
  sections: LensSection[];
}

// ============================================================
// Geometry types
// ============================================================

export interface Marker {
  fxMm: number;
  dxMm: number;
  x: number;
}

export interface GeometryContext {
  markers: Marker[];
  contentWidth: number;
}

// ============================================================
// Filter state types
// ============================================================

export interface RangeFilterState {
  min: number;
  max: number;
  activeMin: number;
  activeMax: number;
}

export type FilterStateValue = RangeFilterState | string | boolean | null;
export type FilterState = Record<string, FilterStateValue>;

export interface FilterChip {
  key: string;
  label: string;
}
