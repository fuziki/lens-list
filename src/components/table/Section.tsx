import { useMemo } from 'react';
import type { LensSection, AppConfig, GeometryContext, FilterState, FilterConfig } from '../../types';
import { lensMatchesFilters } from '../../lib/filterLogic';
import { LensRow } from './LensRow';

interface Props {
  section: LensSection;
  config: AppConfig;
  geometry: GeometryContext;
  filterState: FilterState;
  filters: FilterConfig[];
  activeAttributes: ReadonlySet<string>;
  rowHeight: number;
  showNewBadge: boolean;
}

export function Section({ section, config, geometry, filterState, filters, activeAttributes, rowHeight, showNewBadge }: Props) {
  const visibleRows = useMemo(
    () =>
      section.rows.filter(row =>
        row.lenses.some(lens => lensMatchesFilters(lens, filterState, filters))
      ),
    [section.rows, filterState, filters]
  );

  if (visibleRows.length === 0) return null;

  return (
    <div className="section" data-section-id={section.id}>
      <div
        className="section-label"
        style={{ width: config.sectionLabelWidthPx }}
      >
        {section.label}
      </div>
      <div className="section-rows">
        {visibleRows.map(row => (
          <LensRow
            key={row.id}
            row={row}
            config={config}
            geometry={geometry}
            filterState={filterState}
            filters={filters}
            activeAttributes={activeAttributes}
            rowHeight={rowHeight}
            showNewBadge={showNewBadge}
          />
        ))}
      </div>
    </div>
  );
}
