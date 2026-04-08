import { useRef, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { AppConfig, GeometryContext, LensData, FilterState } from '../../types';
import { TableHeader } from './TableHeader';
import { Section } from './Section';

const DISCLAIMER = '※ 掲載情報は参考目的のみです。価格・仕様は変更される場合があります。最新情報はメーカー公式サイトをご確認ください。';
const GAP_PX = 40;

function DisclaimerMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const [scrolling, setScrolling] = useState(false);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const ghost = ghostRef.current;
    if (!container || !ghost) return;
    const check = () => {
      const needs = ghost.offsetWidth > container.clientWidth;
      setScrolling(needs);
      if (needs) setShift(ghost.offsetWidth + GAP_PX);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="disclaimer-container">
      <span ref={ghostRef} className="disclaimer-ghost">{DISCLAIMER}</span>
      {scrolling ? (
        <span
          className="disclaimer-scrolling"
          style={{ '--marquee-shift': `-${shift}px` } as React.CSSProperties}
        >
          {DISCLAIMER}
          <span style={{ display: 'inline-block', width: GAP_PX }} />
          {DISCLAIMER}
        </span>
      ) : (
        <span>{DISCLAIMER}</span>
      )}
    </div>
  );
}

interface Props {
  config: AppConfig;
  geometry: GeometryContext;
  lensData: LensData;
  filterState: FilterState;
  activeAttributes: ReadonlySet<string>;
  rowHeight: number;
  showNewBadge: boolean;
  tableInnerRef: RefObject<HTMLDivElement | null>;
  tableWrapperRef: RefObject<HTMLDivElement | null>;
}

export function TableWrapper({
  config,
  geometry,
  lensData,
  filterState,
  activeAttributes,
  rowHeight,
  showNewBadge,
  tableInnerRef,
  tableWrapperRef,
}: Props) {
  const totalWidth = config.sectionLabelWidthPx + geometry.contentWidth;

  return (
    <>
      <div className="table-meta">
        <DisclaimerMarquee />
        {lensData.lastUpdated && (
          <div className="table-meta-right">
            <span className="table-last-updated">最終更新日: {lensData.lastUpdated}</span>
          </div>
        )}
      </div>
      <div className="table-wrapper" ref={tableWrapperRef}>
        <div className="table-inner" ref={tableInnerRef} style={{ width: totalWidth }}>
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
              showNewBadge={showNewBadge}
            />
          ))}
        </div>
      </div>
    </>
  );
}
