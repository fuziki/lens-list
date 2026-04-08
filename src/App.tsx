import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { useAppData } from './hooks/useAppData';
import { useActiveAttributes } from './hooks/useActiveAttributes';
import { useFilterState } from './hooks/useFilterState';
import { buildGeometry } from './lib/geometry';
import { TopBar } from './components/TopBar';
import { SettingsModal } from './components/SettingsModal';
import { ChipBar } from './components/ChipBar';
import { TableWrapper } from './components/table/TableWrapper';
import type { AppConfig, LensData } from './types';
import './styles/app.css';

export function App() {
  const appData = useAppData();

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

  return <AppInner config={appData.config} lensData={appData.lensData} />;
}

function AppInner({ config, lensData }: { config: AppConfig; lensData: LensData }) {
  const tableInnerRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  useEffect(() => {
    const root = document.documentElement;
    const c = config.colors;
    root.style.setProperty('--color-header-bg', c.headerBackground);
    root.style.setProperty('--color-header-text', c.headerText);
    root.style.setProperty('--color-section-label-bg', c.sectionLabelBackground);
    root.style.setProperty('--color-section-label-text', c.sectionLabelText);
    root.style.setProperty('--color-row-bg', c.rowBackground);
    root.style.setProperty('--color-lens-dot', c.lensDot);
    root.style.setProperty('--color-zoom-bar', c.zoomBar);
    root.style.setProperty('--color-lens-name', c.lensNameText);
    root.style.setProperty('--color-attr-text', c.attributeText);
  }, [config.colors]);

  return (
    <div id="app" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar
        onOpenSettings={() => setSettingsOpen(true)}
        onSaveImage={handleSaveImage}
        saving={saving}
      />
      <ChipBar chips={activeChips} onRemove={resetFilter} />
      <TableWrapper
        config={effectiveConfig}
        geometry={geometry}
        lensData={lensData}
        filterState={filterState}
        activeAttributes={activeAttributes}
        rowHeight={rowHeight}
        showNewBadge={showNewBadge}
        tableInnerRef={tableInnerRef}
        tableWrapperRef={tableWrapperRef}
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
    </div>
  );
}

export default App;
