import { useEffect } from 'react';

interface Props {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ imageUrl, onClose }: Props) {
  const isOpen = imageUrl !== null;

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
          <span className="modal-title">画像を保存</span>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="閉じる">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="image-preview-hint">画像を長押しして「&quot;写真&quot;に追加」から保存できます。</p>
          {imageUrl && <img className="image-preview-img" src={imageUrl} alt="レンズ一覧表" />}
        </div>
      </div>
    </div>
  );
}
