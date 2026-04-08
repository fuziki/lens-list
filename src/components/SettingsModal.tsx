import { useEffect } from 'react';
import type { AppConfig, FilterState, FilterStateValue, RangeFilterState } from '../types';
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
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">設定</span>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="閉じる">
            ✕
          </button>
        </div>
        <div className="modal-body">
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
        </div>
      </div>
    </div>
  );
}
