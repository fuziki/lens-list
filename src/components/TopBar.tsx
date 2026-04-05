interface Props {
  onOpenSettings: () => void;
  onSaveImage: () => void;
  saving: boolean;
}

export function TopBar({ onOpenSettings, onSaveImage, saving }: Props) {
  return (
    <div className="top-bar">
      <span className="top-bar-logo">lens-list</span>
      <div className="top-bar-actions">
        <button className="top-bar-action-btn" onClick={onOpenSettings} type="button">
          ⚙ 設定
        </button>
        <button
          className={`top-bar-action-btn${saving ? ' saving' : ''}`}
          onClick={onSaveImage}
          disabled={saving}
          title="表を画像として保存"
          type="button"
        >
          {saving ? '保存中…' : '📷 画像保存'}
        </button>
      </div>
    </div>
  );
}
