import { useEffect, useMemo } from 'react';
import { useAppData } from './hooks/useAppData';
import { useActiveAttributes } from './hooks/useActiveAttributes';
import { useFilterState } from './hooks/useFilterState';
import { buildGeometry } from './lib/geometry';
import { Controls } from './components/controls/Controls';
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
  const geometry = useMemo(() => buildGeometry(config), [config]);
  const { activeAttributes, toggleAttribute, rowHeight } = useActiveAttributes(config);
  const {
    filterState,
    setFilterValue,
    resetFilter,
    filterPanelOpen,
    setFilterPanelOpen,
    activeChips,
  } = useFilterState(config, lensData);

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
      <Controls
        config={config}
        activeAttributes={activeAttributes}
        onToggleAttribute={toggleAttribute}
        filterState={filterState}
        filterPanelOpen={filterPanelOpen}
        onToggleFilterPanel={() => setFilterPanelOpen(!filterPanelOpen)}
        onSetFilterValue={setFilterValue}
      />
      <ChipBar chips={activeChips} onRemove={resetFilter} />
      <TableWrapper
        config={config}
        geometry={geometry}
        lensData={lensData}
        filterState={filterState}
        activeAttributes={activeAttributes}
        rowHeight={rowHeight}
      />
    </div>
  );
}

export default App;
