import { useEffect, useRef, useState } from 'react';
import { MOUNTS, mountPath } from '../lib/mounts';
import type { MountDef } from '../lib/mounts';

interface Props {
  mount: MountDef;
  onOpenSettings: () => void;
  onSaveImage: () => void;
  saving: boolean;
}

export function TopBar({ mount, onOpenSettings, onSaveImage, saving }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="top-bar">
      <div className="mount-selector" ref={menuRef}>
        <button
          className="mount-selector-btn"
          onClick={() => setMenuOpen(o => !o)}
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="mount-selector-arrow">▽</span>
          {mount.label}
        </button>
        {menuOpen && (
          <div className="mount-selector-menu" role="menu">
            {MOUNTS.map(m => (
              <a
                key={m.id}
                className={`mount-selector-item${m.id === mount.id ? ' active' : ''}`}
                href={mountPath(m.id) + window.location.search}
                role="menuitem"
                aria-current={m.id === mount.id ? 'page' : undefined}
              >
                {m.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="top-bar-actions">
        <button className="top-bar-action-btn top-bar-action-btn--primary" onClick={onOpenSettings} type="button">
          表示設定
        </button>
        <button
          className={`top-bar-action-btn${saving ? ' saving' : ''}`}
          onClick={onSaveImage}
          disabled={saving}
          title="表を画像として保存"
          type="button"
        >
          {saving ? '保存中…' : '画像保存'}
        </button>
      </div>
    </div>
  );
}
