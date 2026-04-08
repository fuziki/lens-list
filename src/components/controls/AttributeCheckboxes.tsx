import type { DisplayAttributeConfig } from '../../types';

interface Props {
  displayAttributes: DisplayAttributeConfig[];
  activeAttributes: ReadonlySet<string>;
  onToggle: (key: string) => void;
  showNewBadge: boolean;
  onToggleNewBadge: () => void;
}

export function AttributeCheckboxes({ displayAttributes, activeAttributes, onToggle, showNewBadge, onToggleNewBadge }: Props) {
  return (
    <div className="attr-row">
      <span className="attr-row-label">表示属性:</span>
      <label className="attr-checkbox-item">
        <input
          type="checkbox"
          checked={showNewBadge}
          onChange={onToggleNewBadge}
        />
        新製品(半年以内)
      </label>
      {displayAttributes.map(attr => (
        <label key={attr.key} className="attr-checkbox-item">
          <input
            type="checkbox"
            checked={activeAttributes.has(attr.key)}
            onChange={() => onToggle(attr.key)}
          />
          {attr.label}
        </label>
      ))}
    </div>
  );
}
