import { useEffect } from 'react';
import type { Lens, AppConfig } from '../types';
import { formatAttributeValue, isNew } from '../lib/formatters';

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
  const isOpen = lens !== null;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        {lens && (
          <>
            <div className="modal-header">
              <span className="lens-detail-title">
                {isNew(lens.releaseDate) && <span className="lens-new-badge">NEW</span>}
                {lens.name}
              </span>
              <button className="modal-close-btn" onClick={onClose} type="button" aria-label="閉じる">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="lens-detail-section">
                <div className="lens-detail-row">
                  <span className="lens-detail-label">メーカー</span>
                  <span className="lens-detail-value">{lens.manufacturer}</span>
                </div>
                <div className="lens-detail-row">
                  <span className="lens-detail-label">フォーマット</span>
                  <span className="lens-detail-value">{lens.format}</span>
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
                  const value = formatAttributeValue(lens, attr);
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
