import type { AppConfig, GeometryContext, LensData, FilterState } from '../../types';
import { TableHeader } from './TableHeader';
import { Section } from './Section';

interface Props {
  config: AppConfig;
  geometry: GeometryContext;
  lensData: LensData;
  filterState: FilterState;
  activeAttributes: ReadonlySet<string>;
  rowHeight: number;
}

export function TableWrapper({
  config,
  geometry,
  lensData,
  filterState,
  activeAttributes,
  rowHeight,
}: Props) {
  const totalWidth = config.sectionLabelWidthPx + geometry.contentWidth;

  return (
    <>
      <div className="table-meta">
        <p className="table-disclaimer">
          ※ 掲載情報は参考目的のみです。価格・仕様は変更される場合があります。最新情報はメーカー公式サイトをご確認ください。
        </p>
        {lensData.lastUpdated && (
          <span className="table-last-updated">最終更新日: {lensData.lastUpdated}</span>
        )}
      </div>
      <div className="table-wrapper">
        <div className="table-inner" style={{ width: totalWidth }}>
          <TableHeader config={config} geometry={geometry} />
          {lensData.sections.map(section => (
            <Section
              key={section.id}
              section={section}
              config={config}
              geometry={geometry}
              filterState={filterState}
              filters={config.filters}
              activeAttributes={activeAttributes}
              rowHeight={rowHeight}
            />
          ))}
        </div>
      </div>
    </>
  );
}
