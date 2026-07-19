import type { AppConfig, FilterState, FilterStateValue, RangeFilterState } from '../types';
import { getFormatLabels } from '../lib/formatters';
import { BottomSheet } from './BottomSheet';
import { AttributeCheckboxes } from './controls/AttributeCheckboxes';
import { RangeFilterItem } from './controls/RangeFilterItem';
import { SelectFilterItem } from './controls/SelectFilterItem';
import { ToggleFilterItem } from './controls/ToggleFilterItem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  activeAttributes: ReadonlySet<string>;
  onToggleAttribute: (key: string) => void;
  showNewBadge: boolean;
  onToggleNewBadge: () => void;
  filterState: FilterState;
  onSetFilterValue: (key: string, value: FilterStateValue) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  config,
  activeAttributes,
  onToggleAttribute,
  showNewBadge,
  onToggleNewBadge,
  filterState,
  onSetFilterValue,
}: Props) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={<span className="modal-title">設定</span>}>
      <div className="modal-section">
        <div className="modal-section-title">表示属性</div>
        <AttributeCheckboxes
          displayAttributes={config.displayAttributes}
          activeAttributes={activeAttributes}
          onToggle={onToggleAttribute}
          showNewBadge={showNewBadge}
          onToggleNewBadge={onToggleNewBadge}
        />
      </div>
      {config.filters.length > 0 && (
        <div className="modal-section">
          <div className="modal-section-title">フィルター</div>
          <div className="modal-filter-grid">
            {config.filters.map(f => {
              if (f.type === 'range') {
                return (
                  <RangeFilterItem
                    key={f.key}
                    filterDef={f}
                    state={filterState[f.key] as RangeFilterState}
                    onChange={(key, newState) => onSetFilterValue(key, newState)}
                  />
                );
              }
              if (f.type === 'select') {
                return (
                  <SelectFilterItem
                    key={f.key}
                    filterDef={f}
                    formatLabels={getFormatLabels(config)}
                    value={(filterState[f.key] as string) ?? 'all'}
                    onChange={(key, value) => onSetFilterValue(key, value)}
                  />
                );
              }
              if (f.type === 'toggle') {
                return (
                  <ToggleFilterItem
                    key={f.key}
                    filterDef={f}
                    checked={(filterState[f.key] as boolean) ?? false}
                    onChange={(key, value) => onSetFilterValue(key, value)}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
