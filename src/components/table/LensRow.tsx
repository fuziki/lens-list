import type { LensRow as LensRowType, Lens, AppConfig, GeometryContext } from '../../types';
import { LensItem } from './LensItem';

interface Props {
  row: LensRowType;
  config: AppConfig;
  geometry: GeometryContext;
  activeAttributes: ReadonlySet<string>;
  rowHeight: number;
  showNewBadge: boolean;
  onLensClick: (lens: Lens) => void;
}

export function LensRow({ row, config, geometry, activeAttributes, rowHeight, showNewBadge, onLensClick }: Props) {
  return (
    <div
      className="row"
      data-row-id={row.id}
      style={{ height: rowHeight }}
    >
      {geometry.markers.map(m => (
        <div key={'vline-' + m.fxMm} className="row-grid-line" style={{ left: m.x - 1 }} />
      ))}
      {row.lenses.map(lens => (
        <LensItem
          key={lens.id}
          lens={lens}
          config={config}
          geometry={geometry}
          activeAttributes={activeAttributes}
          showNewBadge={showNewBadge}
          onClick={() => onLensClick(lens)}
        />
      ))}
    </div>
  );
}
