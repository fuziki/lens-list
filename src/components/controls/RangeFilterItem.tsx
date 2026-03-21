import type { RangeFilterConfig, RangeFilterState } from '../../types';
import { formatRangeVal } from '../../lib/filterLogic';

interface Props {
  filterDef: RangeFilterConfig;
  state: RangeFilterState;
  onChange: (key: string, newState: RangeFilterState) => void;
}

export function RangeFilterItem({ filterDef, state, onChange }: Props) {
  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange(filterDef.key, { ...state, activeMin: val });
  };

  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange(filterDef.key, { ...state, activeMax: val });
  };

  const step = filterDef.step ?? 1;

  return (
    <div className="filter-item">
      <div className="filter-label">{filterDef.label}</div>
      <div className="range-row">
        <span>最小</span>
        <input
          type="range"
          min={state.min}
          max={state.max}
          step={step}
          value={state.activeMin}
          onChange={handleMin}
        />
        <span className="range-val">{formatRangeVal(filterDef, state.activeMin)}</span>
      </div>
      <div className="range-row">
        <span>最大</span>
        <input
          type="range"
          min={state.min}
          max={state.max}
          step={step}
          value={state.activeMax}
          onChange={handleMax}
        />
        <span className="range-val">{formatRangeVal(filterDef, state.activeMax)}</span>
      </div>
    </div>
  );
}
