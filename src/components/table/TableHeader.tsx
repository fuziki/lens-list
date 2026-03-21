import type { AppConfig, GeometryContext } from '../../types';

interface Props {
  config: AppConfig;
  geometry: GeometryContext;
}

export function TableHeader({ config, geometry }: Props) {
  const { markers } = geometry;
  const { headerFontSizePx } = config.typography;

  return (
    <div className="table-header">
      {/* Sticky corner */}
      <div
        className="header-corner"
        style={{ width: config.sectionLabelWidthPx }}
      >
        <span className="header-fx-label">FX</span>
        <span className="header-dx-label">DX</span>
      </div>

      {/* Column labels */}
      <div
        className="header-content"
        style={{ width: geometry.contentWidth }}
      >
        {/* FX row */}
        <div className="header-fx-row" style={{ fontSize: headerFontSizePx }}>
          {markers.map((m, i) => i === 0 ? null : (
            <span
              key={m.fxMm}
              className="marker-label"
              style={{
                left: m.x,
                top: 7,
                transform: 'translateX(-50%)',
              }}
            >
              {m.fxMm}mm
            </span>
          ))}
        </div>

        {/* DX row */}
        <div
          className="header-dx-row"
          style={{ fontSize: headerFontSizePx - 1, opacity: 0.7 }}
        >
          {markers.map((m, i) => i === 0 ? null : (
            <span
              key={m.dxMm}
              className="marker-label"
              style={{
                left: m.x,
                top: 3,
                transform: 'translateX(-50%)',
              }}
            >
              {m.dxMm}mm
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
