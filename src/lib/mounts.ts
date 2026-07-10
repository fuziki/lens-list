export type MountId = 'z' | 'e' | 'rf';

export interface MountDef {
  id: MountId;
  label: string;
}

export const MOUNTS: MountDef[] = [
  { id: 'z', label: 'Zマウント' },
  { id: 'e', label: 'Eマウント' },
  { id: 'rf', label: 'RFマウント' },
];

export const DEFAULT_MOUNT_ID: MountId = 'z';

export function mountPath(id: MountId): string {
  return import.meta.env.BASE_URL + id;
}

function parseMountId(pathname: string): MountId | null {
  const base = import.meta.env.BASE_URL;
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  const segment = rest.replace(/\/+$/, '');
  const found = MOUNTS.find(m => m.id === segment);
  return found ? found.id : null;
}

/**
 * URL からマウントを決定する。マウント指定がないパス（ルート等）の場合は
 * デフォルトマウントの URL に置き換える（クライアントサイドリダイレクト）。
 */
export function resolveMount(): MountDef {
  const id = parseMountId(window.location.pathname);
  if (id === null) {
    window.history.replaceState(null, '', mountPath(DEFAULT_MOUNT_ID) + window.location.search);
    return MOUNTS.find(m => m.id === DEFAULT_MOUNT_ID)!;
  }
  return MOUNTS.find(m => m.id === id)!;
}
