import type { FilterChip } from '../types';

interface Props {
  chips: FilterChip[];
  onRemove: (key: string) => void;
}

export function ChipBar({ chips, onRemove }: Props) {
  if (chips.length === 0) return null;

  return (
    <div className="chip-bar visible">
      {chips.map(chip => (
        <span key={chip.key} className="chip">
          {chip.label}
          <button
            className="chip-remove"
            title="フィルターを解除"
            onClick={() => onRemove(chip.key)}
            type="button"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
