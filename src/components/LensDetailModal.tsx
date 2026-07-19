import type { Lens, AppConfig } from '../types';
import { formatAttributeValue, getFormatLabels, isNew } from '../lib/formatters';
import { BottomSheet } from './BottomSheet';

interface Props {
  lens: Lens | null;
  config: AppConfig;
  onClose: () => void;
}

function formatFocalLength(lens: Lens): string {
  if (lens.type === 'prime') {
    return `${lens.focalLengthMm}mm`;
  }
  return `${lens.focalLengthMinMm}–${lens.focalLengthMaxMm}mm`;
}

export function LensDetailModal({ lens, config, onClose }: Props) {
  return (
    <BottomSheet
      isOpen={lens !== null}
      onClose={onClose}
      title={
        lens && (
          <span className="lens-detail-title">
            {isNew(lens.releaseDate) && <span className="lens-new-badge">NEW</span>}
            {lens.name}
          </span>
        )
      }
    >
      {lens && (
        <>
          <div className="lens-detail-section">
            <div className="lens-detail-row">
              <span className="lens-detail-label">メーカー</span>
              <span className="lens-detail-value">{lens.manufacturer}</span>
            </div>
            <div className="lens-detail-row">
              <span className="lens-detail-label">フォーマット</span>
              <span className="lens-detail-value">
                {lens.format === 'FX' ? getFormatLabels(config).fx : getFormatLabels(config).dx}
              </span>
            </div>
            <div className="lens-detail-row">
              <span className="lens-detail-label">焦点距離</span>
              <span className="lens-detail-value">{formatFocalLength(lens)}</span>
            </div>
            <div className="lens-detail-row">
              <span className="lens-detail-label">最大絞り</span>
              <span className="lens-detail-value">f/{lens.maxAperture}</span>
            </div>
          </div>
          <div className="lens-detail-section">
            {config.displayAttributes.map(attr => {
              const value = formatAttributeValue(lens, attr, config.cropFactor);
              const isEmpty = value === '—' || value === '×';
              return (
                <div key={attr.key} className="lens-detail-row">
                  <span className="lens-detail-label">{attr.label}</span>
                  <span className={`lens-detail-value lens-attr-${attr.format}${isEmpty ? ' lens-attr-empty' : ''}`}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="lens-detail-btn-row">
            <a
              className="lens-detail-search-btn"
              href={`https://www.google.com/search?q=${encodeURIComponent(lens.name)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google検索
            </a>
            {lens.officialUrl && (
              <a
                className="lens-detail-official-btn"
                href={lens.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                公式サイト
              </a>
            )}
          </div>
        </>
      )}
    </BottomSheet>
  );
}
