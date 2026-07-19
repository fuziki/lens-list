import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { useAppData } from './hooks/useAppData';
import { useActiveAttributes } from './hooks/useActiveAttributes';
import { useFilterState } from './hooks/useFilterState';
import { buildGeometry } from './lib/geometry';
import { filterLensData } from './lib/filterLogic';
import { resolveMount } from './lib/mounts';
import type { MountDef } from './lib/mounts';
import { TopBar } from './components/TopBar';
import { SettingsModal } from './components/SettingsModal';
import { LensDetailModal } from './components/LensDetailModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { ChipBar } from './components/ChipBar';
import { TableWrapper } from './components/table/TableWrapper';
import type { AppConfig, LensData, Lens } from './types';
import './styles/app.css';

// iOS Safari は canvas の総ピクセル数が約 16.7M (4096x4096) を超えると
// 空の画像を返すため、scale を上限内に収める
const MAX_CANVAS_AREA = 16777216;

function isMobileDevice(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('画像の生成に失敗しました'))),
      'image/png'
    );
  });
}

export function App() {
  const mount = useMemo(() => resolveMount(), []);
  const appData = useAppData(mount.id);

  useEffect(() => {
    document.title = `lens-list | ${mount.label}`;
  }, [mount]);

  if (appData.status === 'loading') {
    return <div style={{ padding: 24, color: '#666' }}>読み込み中...</div>;
  }

  if (appData.status === 'error') {
    return (
      <div style={{ padding: 24, color: '#c00' }}>
        データの読み込みに失敗しました: {appData.message}
      </div>
    );
  }

  return <AppInner mount={mount} config={appData.config} lensData={appData.lensData} />;
}

function AppInner({ mount, config, lensData }: { mount: MountDef; config: AppConfig; lensData: LensData }) {
  const tableInnerRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleSaveImage = useCallback(async () => {
    if (!tableInnerRef.current || !tableWrapperRef.current || saving) return;
    setSaving(true);
    const wrapper = tableWrapperRef.current;
    const savedScrollLeft = wrapper.scrollLeft;
    const savedScrollTop = wrapper.scrollTop;
    wrapper.scrollLeft = 0;
    wrapper.scrollTop = 0;
    try {
      const el = tableInnerRef.current;
      const maxScale = Math.sqrt(MAX_CANVAS_AREA / (el.scrollWidth * el.scrollHeight));
      const canvas = await html2canvas(el, {
        useCORS: true,
        scale: Math.min(window.devicePixelRatio, maxScale),
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      if (isMobileDevice()) {
        setPreviewImageUrl(url);
      } else {
        const link = document.createElement('a');
        link.download = `lens-list-${mount.id}.png`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } finally {
      wrapper.scrollLeft = savedScrollLeft;
      wrapper.scrollTop = savedScrollTop;
      setSaving(false);
    }
  }, [saving, mount.id]);

  const closeImagePreview = useCallback(() => {
    setPreviewImageUrl(url => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  }, []);

  const showRental = useMemo(
    () => new URLSearchParams(window.location.search).get('show_rental') === '1',
    []
  );

  const effectiveConfig = useMemo(() => {
    if (showRental) return config;
    return {
      ...config,
      filters: config.filters.filter(f => f.key !== 'rentalAvailable'),
      displayAttributes: config.displayAttributes.filter(a => a.key !== 'rentalAvailable'),
    };
  }, [config, showRental]);

  const geometry = useMemo(() => buildGeometry(effectiveConfig), [effectiveConfig]);
  const { activeAttributes, toggleAttribute, rowHeight, showNewBadge, toggleNewBadge } = useActiveAttributes(effectiveConfig);
  const {
    filterState,
    setFilterValue,
    resetFilter,
    activeChips,
  } = useFilterState(effectiveConfig, lensData);

  const visibleLensData = useMemo(
    () => filterLensData(lensData, filterState, effectiveConfig.filters),
    [lensData, filterState, effectiveConfig.filters]
  );

  useEffect(() => {
    const root = document.documentElement;
    const c = config.colors;
    root.style.setProperty('--color-header-bg', c.headerBackground);
    root.style.setProperty('--color-header-text', c.headerText);
    root.style.setProperty('--color-section-label-bg', c.sectionLabelBackground);
    root.style.setProperty('--color-section-label-text', c.sectionLabelText);
    root.style.setProperty('--color-row-bg', c.rowBackground);
    root.style.setProperty('--color-grid-line', c.gridLineColor);
    root.style.setProperty('--color-lens-dot', c.lensDot);
    root.style.setProperty('--color-zoom-bar', c.zoomBar);
    root.style.setProperty('--color-lens-name', c.lensNameText);
    root.style.setProperty('--color-attr-text', c.attributeText);
  }, [config.colors]);

  return (
    <div id="app" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar
        mount={mount}
        onOpenSettings={() => setSettingsOpen(true)}
        onSaveImage={handleSaveImage}
        saving={saving}
      />
      <ChipBar chips={activeChips} onRemove={resetFilter} />
      <TableWrapper
        config={effectiveConfig}
        geometry={geometry}
        lensData={visibleLensData}
        activeAttributes={activeAttributes}
        rowHeight={rowHeight}
        showNewBadge={showNewBadge}
        tableInnerRef={tableInnerRef}
        tableWrapperRef={tableWrapperRef}
        onLensClick={setSelectedLens}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={effectiveConfig}
        activeAttributes={activeAttributes}
        onToggleAttribute={toggleAttribute}
        showNewBadge={showNewBadge}
        onToggleNewBadge={toggleNewBadge}
        filterState={filterState}
        onSetFilterValue={setFilterValue}
      />
      <LensDetailModal
        lens={selectedLens}
        config={effectiveConfig}
        onClose={() => setSelectedLens(null)}
      />
      <ImagePreviewModal
        imageUrl={previewImageUrl}
        onClose={closeImagePreview}
      />
    </div>
  );
}

export default App;
