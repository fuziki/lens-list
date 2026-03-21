import { useState, useEffect } from 'react';
import type { AppConfig, LensData } from '../types';

type AppDataState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; config: AppConfig; lensData: LensData };

export function useAppData(): AppDataState {
  const [state, setState] = useState<AppDataState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const [config, lensData] = await Promise.all([
          fetch('./data/config.json', { signal }).then(r => r.json() as Promise<AppConfig>),
          fetch('./data/lenses.json', { signal }).then(r => r.json() as Promise<LensData>),
        ]);
        if (!signal.aborted) {
          setState({ status: 'ok', config, lensData });
        }
      } catch (e) {
        if (!signal.aborted) {
          setState({ status: 'error', message: (e as Error).message });
        }
      }
    })();

    return () => controller.abort();
  }, []);

  return state;
}
