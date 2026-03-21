import { useState, useCallback } from 'react';
import type { AppConfig } from '../types';

export function useActiveAttributes(config: AppConfig) {
  const [activeAttributes, setActiveAttributes] = useState<ReadonlySet<string>>(new Set());

  const toggleAttribute = useCallback((key: string) => {
    setActiveAttributes(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const rowHeight =
    config.rowBaseHeightPx + activeAttributes.size * config.attributeRowHeightPx;

  return { activeAttributes, toggleAttribute, rowHeight };
}
