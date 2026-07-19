import { BottomSheet } from './BottomSheet';

interface Props {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ imageUrl, onClose }: Props) {
  return (
    <BottomSheet
      isOpen={imageUrl !== null}
      onClose={onClose}
      title={<span className="modal-title">画像を保存</span>}
    >
      <p className="image-preview-hint">画像を長押しして「&quot;写真&quot;に追加」から保存できます。</p>
      {imageUrl && <img className="image-preview-img" src={imageUrl} alt="レンズ一覧表" />}
    </BottomSheet>
  );
}
