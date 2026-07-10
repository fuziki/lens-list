import { useState, useEffect } from 'react';
import type { AppConfig, LensData } from '../types';
import type { MountId } from '../lib/mounts';

type AppDataState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; config: AppConfig; lensData: LensData };

export function useAppData(mountId: MountId): AppDataState {
  const [state, setState] = useState<AppDataState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const dataBase = `${import.meta.env.BASE_URL}data/${mountId}`;

    (async () => {
      try {
        const [config, lensData] = await Promise.all([
          fetch(`${dataBase}/config.json`, { signal }).then(r => r.json() as Promise<AppConfig>),
          fetch(`${dataBase}/lenses.json`, { signal }).then(r => r.json() as Promise<LensData>),
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
  }, [mountId]);

  return state;
}
