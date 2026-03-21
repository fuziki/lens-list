import { useRef, useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
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
  const tableInnerRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveImage = useCallback(async () => {
    if (!tableInnerRef.current || !tableWrapperRef.current || saving) return;
    setSaving(true);

    const wrapper = tableWrapperRef.current;
    const savedScrollLeft = wrapper.scrollLeft;
    const savedScrollTop = wrapper.scrollTop;
    wrapper.scrollLeft = 0;
    wrapper.scrollTop = 0;

    try {
      const canvas = await html2canvas(tableInnerRef.current, {
        useCORS: true,
        scale: window.devicePixelRatio,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });

      const link = document.createElement('a');
      link.download = 'lens-list.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      wrapper.scrollLeft = savedScrollLeft;
      wrapper.scrollTop = savedScrollTop;
      setSaving(false);
    }
  }, [saving]);

  return (
    <>
      <div className="table-meta">
        <p className="table-disclaimer">
          ※ 掲載情報は参考目的のみです。価格・仕様は変更される場合があります。最新情報はメーカー公式サイトをご確認ください。
        </p>
        <div className="table-meta-right">
          {lensData.lastUpdated && (
            <span className="table-last-updated">最終更新日: {lensData.lastUpdated}</span>
          )}
          <button
            className={`save-image-btn${saving ? ' saving' : ''}`}
            onClick={handleSaveImage}
            disabled={saving}
            title="表を画像として保存"
          >
            {saving ? '保存中…' : '📷 画像保存'}
          </button>
        </div>
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
            />
          ))}
        </div>
      </div>
    </>
  );
}
