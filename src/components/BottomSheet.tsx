import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** ヘッダー左側に表示するタイトル要素 */
  title: ReactNode;
  children: ReactNode;
}

/**
 * iPhone スタイルのボトムシートモーダルの共通骨格。
 * オーバーレイ・ハンドル・ヘッダー（タイトル + ✕）・本文を持ち、
 * 表示中はボディのスクロールをロックし、Esc・オーバーレイクリックで閉じる。
 */
export function BottomSheet({ isOpen, onClose, title, children }: Props) {
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
          {title}
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="閉じる">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
