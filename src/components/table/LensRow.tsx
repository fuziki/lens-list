import { useMemo } from 'react';
import type { LensRow as LensRowType, AppConfig, GeometryContext, FilterState, FilterConfig } from '../../types';
import { lensMatchesFilters } from '../../lib/filterLogic';
import { PrimeLens } from './PrimeLens';
import { ZoomLens } from './ZoomLens';

interface Props {
  row: LensRowType;
  config: AppConfig;
  geometry: GeometryContext;
  filterState: FilterState;
  filters: FilterConfig[];
  activeAttributes: ReadonlySet<string>;
  rowHeight: number;
  showNewBadge: boolean;
}

export function LensRow({ row, config, geometry, filterState, filters, activeAttributes, rowHeight, showNewBadge }: Props) {
  const visibleLenses = useMemo(
    () => row.lenses.filter(lens => lensMatchesFilters(lens, filterState, filters)),
    [row.lenses, filterState, filters]
  );

  if (visibleLenses.length === 0) return null;

  return (
    <div
      className="row"
      data-row-id={row.id}
      style={{ height: rowHeight }}
    >
      {geometry.markers.map(m => (
        <div
          key={'vline-' + m.fxMm}
          style={{
            position: 'absolute',
            left: m.x - 1,
            top: 0,
            bottom: 0,
            width: 2,
            background: config.colors.gridLineColor,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}
      {visibleLenses.map(lens =>
        lens.type === 'prime' ? (
          <PrimeLens
            key={lens.id}
            lens={lens}
            config={config}
            geometry={geometry}
            activeAttributes={activeAttributes}
            showNewBadge={showNewBadge}
          />
        ) : (
          <ZoomLens
            key={lens.id}
            lens={lens}
            config={config}
            geometry={geometry}
            activeAttributes={activeAttributes}
            showNewBadge={showNewBadge}
          />
        )
      )}
    </div>
  );
}
