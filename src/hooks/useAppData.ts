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

    const fetchJson = async <T,>(path: string): Promise<T> => {
      const res = await fetch(path, { signal });
      if (!res.ok) throw new Error(`${path} の取得に失敗しました (${res.status})`);
      return res.json() as Promise<T>;
    };

    (async () => {
      try {
        const [config, lensData] = await Promise.all([
          fetchJson<AppConfig>(`${dataBase}/config.json`),
          fetchJson<LensData>(`${dataBase}/lenses.json`),
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
