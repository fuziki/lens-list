import type { AppConfig, FilterState, FilterStateValue, RangeFilterState } from '../../types';
import { RangeFilterItem } from './RangeFilterItem';
import { SelectFilterItem } from './SelectFilterItem';
import { ToggleFilterItem } from './ToggleFilterItem';

interface Props {
  config: AppConfig;
  filterState: FilterState;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSetFilterValue: (key: string, value: FilterStateValue) => void;
  onSaveImage: () => void;
  saving: boolean;
}

export function FilterPanel({ config, filterState, isOpen, onToggleOpen, onSetFilterValue, onSaveImage, saving }: Props) {
  return (
    <>
      <div className="filter-btn-row">
        <button
          className={`filter-accordion-btn${isOpen ? ' active' : ''}`}
          onClick={onToggleOpen}
          type="button"
        >
          {isOpen ? '▲' : '▼'} フィルター
        </button>
        <button
          className={`save-image-btn${saving ? ' saving' : ''}`}
          onClick={onSaveImage}
          disabled={saving}
          title="表を画像として保存"
          type="button"
        >
          {saving ? '保存中…' : '📷 画像保存'}
        </button>
      </div>

      <div className={`filter-panel${isOpen ? ' open' : ''}`}>
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
          } else if (f.type === 'select') {
            return (
              <SelectFilterItem
                key={f.key}
                filterDef={f}
                value={(filterState[f.key] as string) ?? 'all'}
                onChange={(key, value) => onSetFilterValue(key, value)}
              />
            );
          } else if (f.type === 'toggle') {
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
    </>
  );
}
