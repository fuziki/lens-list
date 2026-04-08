import type { AppConfig, FilterState, FilterStateValue } from '../../types';
import { AttributeCheckboxes } from './AttributeCheckboxes';
import { FilterPanel } from './FilterPanel';

interface Props {
  config: AppConfig;
  activeAttributes: ReadonlySet<string>;
  onToggleAttribute: (key: string) => void;
  showNewBadge: boolean;
  onToggleNewBadge: () => void;
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
  showNewBadge,
  onToggleNewBadge,
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
        showNewBadge={showNewBadge}
        onToggleNewBadge={onToggleNewBadge}
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
