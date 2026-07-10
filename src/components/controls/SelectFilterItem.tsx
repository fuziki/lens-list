import type { SelectFilterConfig, FormatLabelsConfig } from '../../types';

interface Props {
  filterDef: SelectFilterConfig;
  formatLabels: FormatLabelsConfig;
  value: string;
  onChange: (key: string, value: string) => void;
}

function getOptionLabel(
  filterKey: string,
  option: number | string,
  formatLabels: FormatLabelsConfig
): string {
  if (filterKey === 'maxAperture') return `f/${option} 以下`;
  if (filterKey === 'format') {
    return option === 'FX' ? `${formatLabels.fx}対応` : `${formatLabels.dx}専用`;
  }
  return String(option);
}

export function SelectFilterItem({ filterDef, formatLabels, value, onChange }: Props) {
  return (
    <div className="filter-item">
      <label htmlFor={`filter-${filterDef.key}`}>{filterDef.label}</label>
      <select
        id={`filter-${filterDef.key}`}
        value={value}
        onChange={e => onChange(filterDef.key, e.target.value)}
      >
        <option value="all">すべて</option>
        {filterDef.options.map(opt => (
          <option key={String(opt)} value={String(opt)}>
            {getOptionLabel(filterDef.key, opt, formatLabels)}
          </option>
        ))}
      </select>
    </div>
  );
}
