import type { LensSection, Lens, AppConfig, GeometryContext } from '../../types';
import { LensRow } from './LensRow';

interface Props {
  section: LensSection;
  config: AppConfig;
  geometry: GeometryContext;
  activeAttributes: ReadonlySet<string>;
  rowHeight: number;
  showNewBadge: boolean;
  onLensClick: (lens: Lens) => void;
}

export function Section({ section, config, geometry, activeAttributes, rowHeight, showNewBadge, onLensClick }: Props) {
  return (
    <div className="section" data-section-id={section.id}>
      <div
        className="section-label"
        style={{ width: config.sectionLabelWidthPx }}
      >
        {section.label}
      </div>
      <div className="section-rows">
        {section.rows.map(row => (
          <LensRow
            key={row.id}
            row={row}
            config={config}
            geometry={geometry}
            activeAttributes={activeAttributes}
            rowHeight={rowHeight}
            showNewBadge={showNewBadge}
            onLensClick={onLensClick}
          />
        ))}
      </div>
    </div>
  );
}
