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
}

export function FilterPanel({ config, filterState, isOpen, onToggleOpen, onSetFilterValue }: Props) {
  return (
    <>
      <button
        className={`filter-accordion-btn${isOpen ? ' active' : ''}`}
        onClick={onToggleOpen}
        type="button"
      >
        {isOpen ? '▲' : '▼'} フィルター
      </button>

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
