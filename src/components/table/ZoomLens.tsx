import type { ZoomLens as ZoomLensType, AppConfig, GeometryContext } from '../../types';
import { getX } from '../../lib/geometry';
import { formatAttributeValue, isNew } from '../../lib/formatters';

interface Props {
  lens: ZoomLensType;
  config: AppConfig;
  geometry: GeometryContext;
  activeAttributes: ReadonlySet<string>;
  showNewBadge: boolean;
}

const TOP_PAD = 8;

export function ZoomLens({ lens, config, geometry, activeAttributes, showNewBadge }: Props) {
  const x1 = getX(lens.focalLengthMinFxMm, geometry.markers);
  const x2 = getX(lens.focalLengthMaxFxMm, geometry.markers);
  const barW = Math.max(x2 - x1 - 2, 20);

  return (
    <div
      className="lens-item"
      data-lens-id={lens.id}
      style={{ left: x1 + 1, top: TOP_PAD, width: barW }}
    >
      <div
        className="zoom-bar"
        style={{
          height: config.zoomBarHeightPx,
          borderRadius: config.zoomBarBorderRadiusPx,
        }}
      />
      <div
        className="lens-text-content"
        style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: config.zoomBarHeightPx + 4, textAlign: 'center' }}
      >
        <div
          className="lens-name"
          style={{ fontSize: config.typography.lensNameFontSizePx, fontWeight: 'bold' }}
        >
          {showNewBadge && isNew(lens.releaseDate) && <span className="lens-new-badge">NEW</span>}<span className="lens-name-text">{lens.name}</span>
        </div>
        {config.displayAttributes
          .filter(attr => activeAttributes.has(attr.key))
          .map(attr => {
            const value = formatAttributeValue(lens, attr);
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
