# Zマウントレンズラインナップ表 仕様書

## 1. 概要

Nikon Zマウントレンズのラインナップを焦点距離軸で視覚化する静的Webページ。
GitHub Pages でホスティングする。**React + TypeScript（Vite）** で構成する。

---

## 2. 用語定義

| 用語 | 定義 |
|---|---|
| **レンズ (Lens)** | 個々のレンズ商品。最小単位。 |
| **行 (Row)** | セクション内で同じ縦位置に並ぶレンズの集合。1本のみでも行を構成する。 |
| **セクション (Section)** | 行を束ねる大区分。例：単焦点レンズ / 薄型単焦点レンズ / ズームレンズ。 |
| **表示属性 (Display Attribute)** | 重さ・価格・レンタル有無など、表中のレンズ名の下に表示できる属性。表の上のチェックボックスで表示／非表示を切り替える。 |
| **フィルター (Filter)** | 焦点距離・最大絞り・価格・レンタル可否などの条件でレンズを絞り込む機能。 |
| **設定ファイル** | `config.json`。表示に関するすべての定数を管理する。 |
| **レンズデータファイル** | `lenses.json`。レンズの属性・レイアウト情報を管理する。 |

---

## 3. ファイル構成

```
/
├── public/
│   └── data/
│       ├── config.json       # 表示設定
│       └── lenses.json       # レンズデータ
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   └── app.css
│   ├── types/
│   │   └── index.ts          # 型定義
│   ├── lib/
│   │   ├── geometry.ts       # 座標計算
│   │   ├── filterLogic.ts    # フィルター処理
│   │   └── formatters.ts     # 表示フォーマット
│   ├── hooks/
│   │   ├── useAppData.ts     # データ取得
│   │   ├── useActiveAttributes.ts
│   │   └── useFilterState.ts
│   └── components/
│       ├── ChipBar.tsx
│       ├── controls/
│       │   ├── Controls.tsx
│       │   ├── AttributeCheckboxes.tsx
│       │   ├── FilterPanel.tsx
│       │   ├── RangeFilterItem.tsx
│       │   ├── SelectFilterItem.tsx
│       │   └── ToggleFilterItem.tsx
│       └── table/
│           ├── TableWrapper.tsx
│           ├── TableHeader.tsx
│           ├── Section.tsx
│           ├── LensRow.tsx
│           ├── PrimeLens.tsx
│           └── ZoomLens.tsx
├── index.html
└── README.md
```

---

## 4. 表示仕様

### 4.1 全体レイアウト

```
┌─────────────────────────────────────┐
│  表示属性チェックボックス群           │  ← 表の上部
│  フィルターパネル                    │
│  フィルターチップバー                │
├──────────────────────────────────────┤
│  テーブルメタ情報バー（免責・更新日・画像保存ボタン）│
├──────┬──────────────────────────────┤
│      │  焦点距離ヘッダー行（FX / DX） │
│セク  ├──────────────────────────────┤
│ション│  行 0                         │
│ラベ  │  行 1                         │
│ル    │  行 2  ...                    │
├──────┴──────────────────────────────┤
│  （次のセクション）                   │
└─────────────────────────────────────┘
```

### 4.2 焦点距離ヘッダー

- 表の最上部に FX 換算値を第1行、DX 換算値を第2行（参考値・やや小さく薄く表示）として常時表示する。
- 焦点距離の基準は常に FX 換算値とし、フィルター・配置ともに FX 換算値を使用する。DX 行は対応する FX 値の参考情報として表示するにとどめる。
- 各マーカー間の幅は `config.json` の `focalLengthMarkers` の `spacingToNext` で定義する。

### 4.3 セクション

- セクション数は可変（`lenses.json` に定義した数だけ生成する）。
- セクションラベルは表の左端に縦書きで表示する。
- セクションの背景色は `config.json` で指定する。

### 4.4 行

- 行数は可変（`lenses.json` に定義した数だけ生成する）。
- 同一行内のレンズは同じ縦位置（上端揃え）に配置する。
- 行の高さはすべての行で共通だが、表示属性チェックボックスの状態に応じて動的に変化する。
- 行の高さ＝`rowBaseHeightPx`＋（現在オンの表示属性数 × `attributeRowHeightPx`）
- チェックボックスの切り替え時に全行の高さを一括で再計算・再描画する。

### 4.5 レンズの描画

#### 単焦点レンズ

- **図形**：塗りつぶし円（●）
- 円の中心が該当する焦点距離のマーカー位置に来るよう配置する。
- DX フォーマット専用レンズは**表記上の焦点距離（実焦点距離）**の位置に配置する。FX 換算はしない。`lenses.json` の `focalLengthFxMm` には `focalLengthMm` と同じ値を設定する。
- 円の直径は `config.json` の `primeDotDiameterPx` で指定する。

#### ズームレンズ

- **図形**：角丸付き長方形（横バー）
- 左端が最短焦点距離のマーカー位置に、右端が最長焦点距離のマーカー位置に一致するよう配置する。DX 専用ズームレンズも同様に**表記上の焦点距離（実焦点距離）**で配置する（`focalLengthMinFxMm`・`focalLengthMaxFxMm` は `Min/MaxMm` と同値）。
- 高さ・角丸半径は `config.json` で指定する。

#### レンズ名表示

- 図形の直下にレンズ名を表示する。
- 有効な表示属性があれば、レンズ名のさらに下に縦に並べる。

### 4.6 テーブルメタ情報バー

- 表の直上（スクロール外）に1行のバーを表示する。
- 左側：免責テキスト（「掲載情報は参考目的のみです。最新情報はメーカー公式サイトをご確認ください。」）
- 右側：最終更新日（`lenses.json` の `lastUpdated` が存在する場合のみ表示）と画像保存ボタン。

---

## 5. 表示属性チェックボックス

- 表の上部に横並びで配置する。
- チェックを入れた属性のみ、表中のレンズ名の下に表示する。
- 初期状態はすべてオフ。

| 属性キー | 表示ラベル | 備考 |
|---|---|---|
| `weightG` | 重さ | 重さ (g) |
| `priceJpy` | 価格 | 価格 (円) |
| `campaignCashbackJpy` | キャンペーン（2026春）| キャッシュバック金額。`CB: XX,XXX円` 形式。対象外は `×` |
| `rentalAvailable` | レンタル | レンタル料金 (円/泊) |

属性の種類・ラベルは `config.json` で定義し、コードを変更せずに追加・削除できる。

#### キャンペーン属性について

- `campaignCashbackJpy` フィールドはキャンペーンのキャッシュバック金額を管理する。
- 対象レンズ（ニコン）：金額（例: `20000`）
- 対象外レンズ（ニコン非対象・他メーカー）：`false`
- 表示フォーマット：`CB: XX,XXX円`（対象）／ `×`（非対象）
- キャンペーン切替時は `config.json` のラベル（例: `キャンペーン（2026春）` → `キャンペーン（2026秋）`）と `lenses.json` の各レンズの `campaignCashbackJpy` 値を手動で更新する。

---

## 6. レンズデータの行配置ルール

### 6.1 行のグループ化方針

- 同一行に配置するレンズは**最大絞り（f値）ができるだけ同じ**になるよう揃える。
- 同一行内で焦点距離が重複する、または近接してレンズ名が重なる可能性がある場合は別行に分ける。
- マクロレンズ（MC）は単焦点レンズとして扱い、単焦点セクションに配置する。
- Special Edition（SE）版は通常版が存在する場合は除外する。
- 後継機（II など）が存在する場合は旧モデルを除外し後継機のみ掲載する。

### 6.2 DX レンズの行配置

- DX レンズは各セクションの**下部の行**にまとめて配置する。
- FX レンズと DX レンズが同一行に混在しないことが望ましい。
- パワーズーム（PZ）レンズは単独行とする。

### 6.3 現在のセクション構成

| セクション ID | ラベル | 内容 |
|---|---|---|
| `prime` | 単焦点レンズ | S-Line・Others の FX 単焦点全般（MC 含む）、DX 単焦点（最下行） |
| `compact-prime` | 薄型単焦点レンズ | 小型・軽量・パンケーキ系（Z 26・28・40mm 等）、DX 薄型（最下行） |
| `zoom` | ズームレンズ | FX ズーム全般（S-Line・Others）、DX ズーム（最下行・PZ は単独行） |

---

## 7. フィルター機能

フィルターパネルを表の上部（チェックボックス群の下）にアコーディオン形式で配置する。
「フィルター」ボタンをクリックするとパネルが展開・折りたたまれる。
展開時のみ各フィルター項目を表示する。
適用中のフィルターは、フィルターパネルとテーブルの間に**フィルターチップバー**として表示する。
チップバーは横スクロール可能な1行で、適用中の各フィルターをテキストチップとして並べる。チップの表示形式は以下の通り。

| フィルター | チップ表示例 |
|---|---|
| 焦点距離 | `焦点距離: 24〜70mm` |
| 最大絞り | `最大絞り: f/2.8以下` |
| 価格 | `価格: 〜300,000円` |
| レンタル可否 | `レンタル可` |
| フォーマット | `フォーマット: FX対応` / `フォーマット: DX専用` |
| 手ぶれ補正 | `手ぶれ補正` |
| メーカー | `メーカー: タムロン` |
| Sライン | `Sライン` |

フィルターが1件も適用されていない場合はチップバーを非表示にする。
各チップには×ボタンを設け、クリックするとそのフィルターを単独で解除できる。
フィルターに一致しないレンズは非表示にする。
その結果、表示すべきレンズが0件になった行も非表示にする。
さらに、セクション内のすべての行が非表示になった場合はセクションごと非表示にする。

| フィルター名 | 種別 | 対象属性 |
|---|---|---|
| 焦点距離 | 範囲スライダー（min / max） | `focalLengthFxMm`（単焦点）または `focalLengthMinFxMm` 〜 `focalLengthMaxFxMm`（ズーム）。DX レンズも表記上の焦点距離（実焦点距離）で評価する。 |
| 最大絞り | セレクトボックス（以下） | `maxAperture` |
| 価格 | 範囲スライダー（min / max） | `priceJpy`。min は 0 固定、max はデータから動的に計算。 |
| レンタル可否 | トグル | `rentalAvailable` |
| フォーマット | セレクトボックス（すべて / FX / DX） | `format` |
| 手ぶれ補正 | トグル | `imageStabilization` |
| メーカー | セレクトボックス（すべて / ニコン / タムロン / シグマ） | `manufacturer` |
| Sライン | トグル | `sLine`。ニコンレンズにのみ設定される。タムロン・シグマ等の他メーカーは常に非Sラインとして扱う（`sLine` フィールド未設定 ＝ `false` 相当）。 |

フィルターの種類・パラメーターは `config.json` で定義する。

---

## 8. 画像保存機能

- テーブルメタ情報バーの右側に「📷 画像保存」ボタンを配置する。
- クリックすると `html2canvas` を使用してテーブル全体を PNG 画像として保存する（ファイル名：`lens-list.png`）。
- 保存中はボタンを「保存中…」テキストに変更し、無効化する。
- 画像キャプチャ前にスクロール位置をリセットし、キャプチャ後に元の位置へ復元する。

---

## 9. config.json 仕様

```jsonc
{
  "focalLengthMarkers": [
    // マーカー群。fxMm=0 の原点マーカーから始まる。
    // spacingToNext: 次のマーカーまでのピクセル幅
    { "fxMm": 0,   "dxMm": 0,    "spacingToNext": 40 },
    { "fxMm": 12,  "dxMm": 18,   "spacingToNext": 100 },
    { "fxMm": 24,  "dxMm": 36,   "spacingToNext": 105 },
    // ...
    { "fxMm": 800, "dxMm": 1200, "spacingToNext": 0 }
  ],
  "rightPaddingPx": 120,          // 最右マーカーからコンテンツ右端までの余白

  "rowBaseHeightPx": 78,          // 行の基本高さ（図形 + レンズ名のみの場合）
  "attributeRowHeightPx": 16,     // 表示属性1件あたりの追加高さ
  "sectionLabelWidthPx": 44,      // セクションラベル列の幅

  "primeDotDiameterPx": 14,       // 単焦点ドットの直径 (px)
  "zoomBarHeightPx": 14,          // ズームバーの高さ (px)
  "zoomBarBorderRadiusPx": 5,     // ズームバーの角丸半径 (px)

  "colors": {
    "headerBackground": "#1a1a1a",
    "headerText": "#ffffff",
    "sectionLabelBackground": "#2c2c2c",
    "sectionLabelText": "#ffffff",
    "rowBackground": "#dcdcdc",
    "gridLineColor": "#ffffff",
    "sectionDividerColor": "#ffffff",
    "lensDot": "#2211cc",
    "zoomBar": "#2211cc",
    "lensNameText": "#111111",
    "attributeText": "#555555"
  },

  "typography": {
    "lensNameFontSizePx": 10,
    "attributeFontSizePx": 9,
    "headerFontSizePx": 11
  },

  "displayAttributes": [
    { "key": "weightG",              "label": "重さ",                  "unit": "g",  "format": "number" },
    { "key": "priceJpy",             "label": "価格",                  "unit": "円", "format": "number" },
    { "key": "campaignCashbackJpy",  "label": "キャンペーン（2026春）", "unit": "",   "format": "campaign" },
    { "key": "rentalAvailable",      "label": "レンタル",               "unit": "",   "format": "rental" }
  ],

  "filters": [
    { "key": "focalLength",        "label": "焦点距離", "type": "range",  "unit": "mm", "min": 12, "max": 800 },
    { "key": "maxAperture",        "label": "最大絞り", "type": "select", "options": [0.95, 1.2, 1.4, 1.7, 1.8, 2.0, 2.8, 3.5, 4.0, 4.5, 5.6, 6.3] },
    { "key": "priceJpy",           "label": "価格",     "type": "range",  "unit": "円", "step": 10000 },
    { "key": "rentalAvailable",    "label": "レンタル可","type": "toggle" },
    { "key": "format",             "label": "フォーマット", "type": "select", "options": ["FX", "DX"] },
    { "key": "imageStabilization", "label": "手ぶれ補正", "type": "toggle" },
    { "key": "manufacturer",       "label": "メーカー", "type": "select", "options": ["ニコン", "タムロン", "シグマ"] },
    { "key": "sLine",              "label": "Sライン",  "type": "toggle" }
  ]
}
```

### フィルター初期値の算出

- `range` 型フィルター：
  - `focalLength`：`min`・`max` は config.json の値を使用。
  - `priceJpy`：`min` は 0 固定。`max` はレンズデータ全体の最高価格を 10,000 円単位で切り上げた値（動的算出）。
- `select` 型フィルター：初期値は `"all"`（全件表示）。
- `toggle` 型フィルター：初期値は `false`（絞り込みなし）。

---

## 10. lenses.json 仕様

```jsonc
{
  "lastUpdated": "2025-06-01",    // 任意。テーブルメタ情報バーに表示される最終更新日
  "sections": [
    {
      "id": "prime",
      "label": "単焦点\nレンズ",
      "rows": [
        {
          "id": "prime-row-0",
          "lenses": [
            {
              "id": "z-35-1.2-s",
              "name": "Z 35mm f/1.2 S",
              "type": "prime",              // "prime" | "zoom"
              "manufacturer": "ニコン",     // "ニコン" | "タムロン" | "シグマ" など
              "format": "FX",               // "FX" | "DX"
              "focalLengthMm": 35,          // 実焦点距離（単焦点）
              "focalLengthFxMm": 35,        // FX換算値（単焦点）。FXレンズは focalLengthMm と同値
              "maxAperture": 1.2,
              "weightG": 785,               // 重さ (g)。不明の場合は null
              "priceJpy": 330000,           // 実勢価格 (円)。不明の場合は null
              "campaignCashbackJpy": 20000, // キャッシュバック金額 (円)。対象外は false
              "rentalAvailable": true,      // レンタル可否。不明の場合は null
              "imageStabilization": false,  // 手ぶれ補正の有無
              "sLine": true                 // Sライン対象。ニコンのみ設定。他メーカーは省略（= false 扱い）
            }
          ]
        },
        {
          "id": "prime-row-1",
          "lenses": [
            {
              "id": "z-14-24-2.8-s",
              "name": "Z 14-24mm f/2.8 S",
              "type": "zoom",
              "manufacturer": "ニコン",
              "format": "FX",
              "focalLengthMinMm": 14,       // 実最短焦点距離（ズーム）
              "focalLengthMaxMm": 24,       // 実最長焦点距離（ズーム）
              "focalLengthMinFxMm": 14,     // FX換算最短焦点距離（ズーム）。FXレンズは Min/MaxMm と同値
              "focalLengthMaxFxMm": 24,     // FX換算最長焦点距離（ズーム）
              "maxAperture": 2.8,
              "weightG": 650,
              "priceJpy": 280000,
              "rentalAvailable": true,
              "imageStabilization": false,
              "sLine": true                 // ズームレンズにも同様に設定
            }
          ]
        }
      ]
    }
    // セクションを追加する場合はここに追記
  ]
}
```

---

## 11. 非機能要件

| 項目 | 要件 |
|---|---|
| ホスティング | GitHub Pages（静的配信） |
| 技術スタック | React 19 + TypeScript 5 + Vite 7 |
| 外部ライブラリ | `html2canvas`（画像保存のみ） |
| ブラウザ対応 | Chrome / Firefox / Safari 最新版 |
| レスポンシブ | 横スクロール対応（表は最小幅を維持し、画面幅が不足する場合は横スクロール） |
| アクセシビリティ | チェックボックス・フィルターには `<label>` を付与する |
| Sticky 固定 | 焦点距離ヘッダー行（FX / DX）は縦スクロール時に画面上部へ固定（`position: sticky; top`）。セクションラベル列は横スクロール時に画面左端へ固定（`position: sticky; left`）。両者が交差するコーナーセルは両方向に対して固定する。 |

---

## 12. 将来拡張（スコープ外）

- FX / DX 焦点距離の切り替え表示
- レンズ詳細モーダル（クリックで仕様を表示）
- 外部データソース（Googleスプレッドシート等）との連携
- ダークモード対応
