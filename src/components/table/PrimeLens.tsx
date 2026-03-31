import type { PrimeLens as PrimeLensType, AppConfig, GeometryContext } from '../../types';
import { getX } from '../../lib/geometry';
import { formatAttributeValue } from '../../lib/formatters';

interface Props {
  lens: PrimeLensType;
  config: AppConfig;
  geometry: GeometryContext;
  activeAttributes: ReadonlySet<string>;
}

const TOP_PAD = 8;

export function PrimeLens({ lens, config, geometry, activeAttributes }: Props) {
  const dotD = config.primeDotDiameterPx;
  const dotR = dotD / 2;
  const cx = getX(lens.focalLengthFxMm, geometry.markers);

  return (
    <div
      className="lens-item"
      data-lens-id={lens.id}
      style={{ left: cx - dotR, top: TOP_PAD, width: dotD, overflow: 'visible' }}
    >
      <div
        className="lens-dot"
        style={{ width: dotD, height: dotD }}
      />
      <div className="lens-text-box">
        <div
          className="lens-name"
          style={{ fontSize: config.typography.lensNameFontSizePx, fontWeight: 'bold' }}
        >
          {lens.name}
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
