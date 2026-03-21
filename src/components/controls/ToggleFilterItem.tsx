import type { ToggleFilterConfig } from '../../types';

interface Props {
  filterDef: ToggleFilterConfig;
  checked: boolean;
  onChange: (key: string, value: boolean) => void;
}

export function ToggleFilterItem({ filterDef, checked, onChange }: Props) {
  return (
    <div className="filter-item">
      <label className="filter-toggle-label" htmlFor={`filter-${filterDef.key}`}>
        <input
          id={`filter-${filterDef.key}`}
          type="checkbox"
          checked={checked}
          onChange={e => onChange(filterDef.key, e.target.checked)}
        />
        {filterDef.label}
      </label>
    </div>
  );
}
