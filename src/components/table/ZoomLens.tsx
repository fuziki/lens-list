import type { ZoomLens as ZoomLensType, AppConfig, GeometryContext } from '../../types';
import { getX } from '../../lib/geometry';
import { formatAttributeValue } from '../../lib/formatters';

interface Props {
  lens: ZoomLensType;
  config: AppConfig;
  geometry: GeometryContext;
  activeAttributes: ReadonlySet<string>;
}

const TOP_PAD = 10;

export function ZoomLens({ lens, config, geometry, activeAttributes }: Props) {
  const x1 = getX(lens.focalLengthMinFxMm, geometry.markers);
  const x2 = getX(lens.focalLengthMaxFxMm, geometry.markers);
  const barW = Math.max(x2 - x1 - 1, 20);

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
      <div style={{ marginTop: 3 }}>
        <div
          className="lens-name"
          style={{ fontSize: config.typography.lensNameFontSizePx, fontWeight: 'bold' }}
        >
          {lens.name}
        </div>
        {config.displayAttributes
          .filter(attr => activeAttributes.has(attr.key))
          .map(attr => (
            <div
              key={attr.key}
              className="lens-attr"
              style={{ fontSize: config.typography.attributeFontSizePx, lineHeight: `${config.attributeRowHeightPx}px` }}
            >
              {formatAttributeValue(lens, attr)}
            </div>
          ))}
      </div>
    </div>
  );
}
