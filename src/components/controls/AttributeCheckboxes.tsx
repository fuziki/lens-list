import type { DisplayAttributeConfig } from '../../types';

interface Props {
  displayAttributes: DisplayAttributeConfig[];
  activeAttributes: ReadonlySet<string>;
  onToggle: (key: string) => void;
}

export function AttributeCheckboxes({ displayAttributes, activeAttributes, onToggle }: Props) {
  return (
    <div className="attr-row">
      <span className="attr-row-label">表示属性:</span>
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
