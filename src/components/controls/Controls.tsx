import type { AppConfig, FilterState, FilterStateValue } from '../../types';
import { AttributeCheckboxes } from './AttributeCheckboxes';
import { FilterPanel } from './FilterPanel';

interface Props {
  config: AppConfig;
  activeAttributes: ReadonlySet<string>;
  onToggleAttribute: (key: string) => void;
  filterState: FilterState;
  filterPanelOpen: boolean;
  onToggleFilterPanel: () => void;
  onSetFilterValue: (key: string, value: FilterStateValue) => void;
  onSaveImage: () => void;
  saving: boolean;
}

export function Controls({
  config,
  activeAttributes,
  onToggleAttribute,
  filterState,
  filterPanelOpen,
  onToggleFilterPanel,
  onSetFilterValue,
  onSaveImage,
  saving,
}: Props) {
  return (
    <div className="controls">
      <AttributeCheckboxes
        displayAttributes={config.displayAttributes}
        activeAttributes={activeAttributes}
        onToggle={onToggleAttribute}
      />
      <FilterPanel
        config={config}
        filterState={filterState}
        isOpen={filterPanelOpen}
        onToggleOpen={onToggleFilterPanel}
        onSetFilterValue={onSetFilterValue}
        onSaveImage={onSaveImage}
        saving={saving}
      />
    </div>
  );
}
