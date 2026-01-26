# Lens List 仕様書

## 1. プロジェクト概要
ミラーレス一眼カメラの交換用レンズを焦点距離ごとに可視化するWebサイト

## 2. 技術スタック
- **フレームワーク**: React (Vite)
- **描画**: SVG (カスタムコンポーネント)
- **言語**: TypeScript
- **デプロイ**: GitHub Pages
- **パッケージマネージャー**: npm

## 3. データ構造

```typescript
interface Lens {
  id: string;
  name: string;
  type: 'prime' | 'zoom';
  category: string; // 例: '明るい大口径', '標準レンズ', 'ズームレンズ'
  focalLength?: number; // 単焦点の場合
  minFocalLength?: number; // ズームの場合
  maxFocalLength?: number; // ズームの場合
  order: number; // カテゴリ内での表示順序
}

interface LensData {
  categories: string[]; // カテゴリの表示順序
  lenses: Lens[];
}
```

## 4. UI仕様

### 4.1 グラフ表示
- **横軸**: 焦点距離 (線形スケール)
- **縦軸**: レンズカテゴリ
- **グリッド**: 主要焦点距離ごとに縦線

### 4.2 レンズ表示
- **ズームレンズ**:
  - 青い横棒で焦点距離範囲を表示
  - 長方形の中にレンズ名を表示
- **単焦点レンズ**:
  - 焦点距離位置に丸いポイントを表示
  - ポイントの横にレンズ名を表示

### 4.3 レスポンシブ対応
- PC: 横スクロール可能な広い表示
- スマートフォン: 縦スクロールと横スクロールの組み合わせ

## 5. ディレクトリ構造

```
lens-list/
├── public/
│   └── data/
│       └── lenses.json
├── src/
│   ├── components/
│   │   ├── LensChart.tsx
│   │   ├── LensItem.tsx
│   │   └── Axis.tsx
│   ├── types/
│   │   └── lens.ts
│   ├── utils/
│   │   └── scale.ts
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   └── specification.md
├── references/
│   └── reference-design.png
└── package.json
```

## 6. 将来の拡張性
- レンズクリック時のクリップボードコピー機能
- フィルタリング機能(メーカー、焦点距離範囲など)
- レンズ詳細情報の表示
- データ構造の拡張可能性
