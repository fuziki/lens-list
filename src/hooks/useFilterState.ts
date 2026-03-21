import { useState, useMemo, useCallback } from 'react';
import type { AppConfig, LensData, FilterState, FilterStateValue, FilterChip } from '../types';
import { buildChips, getDefaultFilterState, resetFilterValue } from '../lib/filterLogic';

export function useFilterState(config: AppConfig, lensData: LensData) {
  const defaultState = useMemo(
    () => getDefaultFilterState(config.filters, lensData),
    [config.filters, lensData]
  );

  const [filterState, setFilterState] = useState<FilterState>(defaultState);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const setFilterValue = useCallback((key: string, value: FilterStateValue) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilter = useCallback((key: string) => {
    setFilterState(prev => resetFilterValue(key, prev, config.filters));
  }, [config.filters]);

  const activeChips: FilterChip[] = useMemo(
    () => buildChips(filterState, config.filters),
    [filterState, config.filters]
  );

  return {
    filterState,
    setFilterValue,
    resetFilter,
    filterPanelOpen,
    setFilterPanelOpen,
    activeChips,
  };
}
