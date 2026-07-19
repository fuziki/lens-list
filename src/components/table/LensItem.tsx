import type { CSSProperties, ReactNode } from 'react';
import type { Lens, AppConfig, GeometryContext } from '../../types';
import { getX } from '../../lib/geometry';
import { formatAttributeValue, isNew } from '../../lib/formatters';

interface Props {
  lens: Lens;
  config: AppConfig;
  geometry: GeometryContext;
  activeAttributes: ReadonlySet<string>;
  showNewBadge: boolean;
  onClick: () => void;
}

const TOP_PAD = 8;

export function LensItem({ lens, config, geometry, activeAttributes, showNewBadge, onClick }: Props) {
  let positionStyle: CSSProperties;
  let shape: ReactNode;
  let textClass: string;
  let textStyle: CSSProperties | undefined;

  if (lens.type === 'prime') {
    const dotD = config.primeDotDiameterPx;
    const cx = getX(lens.focalLengthFxMm, geometry.markers);
    positionStyle = { left: cx - dotD / 2, top: TOP_PAD, width: dotD, overflow: 'visible' };
    shape = <div className="lens-dot" style={{ width: dotD, height: dotD }} />;
    textClass = 'lens-text-box';
  } else {
    const x1 = getX(lens.focalLengthMinFxMm, geometry.markers);
    const x2 = getX(lens.focalLengthMaxFxMm, geometry.markers);
    positionStyle = { left: x1 + 1, top: TOP_PAD, width: Math.max(x2 - x1 - 2, 20) };
    shape = (
      <div
        className="zoom-bar"
        style={{ height: config.zoomBarHeightPx, borderRadius: config.zoomBarBorderRadiusPx }}
      />
    );
    textClass = 'lens-text-content';
    textStyle = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      top: config.zoomBarHeightPx + 4,
      textAlign: 'center',
    };
  }

  return (
    <div
      className="lens-item"
      data-lens-id={lens.id}
      style={positionStyle}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={lens.name}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {shape}
      <div className={textClass} style={textStyle}>
        <div
          className="lens-name"
          style={{ fontSize: config.typography.lensNameFontSizePx, fontWeight: 'bold' }}
        >
          {showNewBadge && isNew(lens.releaseDate) && <span className="lens-new-badge">NEW</span>}<span className="lens-name-text">{lens.name}</span>
        </div>
        {config.displayAttributes
          .filter(attr => activeAttributes.has(attr.key))
          .map(attr => {
            const value = formatAttributeValue(lens, attr, config.cropFactor);
            const isEmpty = value === '—' || value === '×';
            return (
              <div
                key={attr.key}
                className={`lens-attr lens-attr-${attr.format}${isEmpty ? ' lens-attr-empty' : ''}`}
                style={{ fontSize: config.typography.attributeFontSizePx, lineHeight: `${config.attributeRowHeightPx}px` }}
              >
                {value}
              </div>
            );
          })}
      </div>
    </div>
  );
}
