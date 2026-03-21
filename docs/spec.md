# Zマウントレンズラインナップ表 仕様書

## 1. 概要

Nikon Zマウントレンズのラインナップを焦点距離軸で視覚化する静的Webページ。  
GitHub Pages でホスティングする。フレームワーク不使用、HTML / CSS / JavaScript のみで構成する。

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
├── index.html
├── style.css
├── main.js
├── data/
│   ├── config.json       # 表示設定
│   └── lenses.json       # レンズデータ
└── README.md
```

---

## 4. 表示仕様

### 4.1 全体レイアウト

```
┌─────────────────────────────────────┐
│  表示属性チェックボックス群           │  ← 表の上部
│  フィルターパネル                    │
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

- 表の最上部に FX 換算値を第1行、DX 換算値を第2行（参考値）として常時表示する。
- 焦点距離の基準は常に FX 換算値とし、フィルター・配置ともに FX 換算値を使用する。DX 行は対応する FX 値の参考情報として表示するにとどめる。
- 各列幅は `config.json` の `focalLengthColumns` で定義する。

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
- 円の中心が該当する焦点距離の列中央に来るよう配置する。
- DX フォーマット専用レンズは**表記上の焦点距離（実焦点距離）**の列に配置する。FX 換算はしない。`lenses.json` の `focalLengthFxMm` には `focalLengthMm` と同じ値を設定する。
- 円の直径は `config.json` の `primeDotDiameter` で指定する。

#### ズームレンズ

- **図形**：角丸付き長方形（横バー）
- 左端が最短焦点距離の列に、右端が最長焦点距離の列に一致するよう配置する。DX 専用ズームレンズも同様に**表記上の焦点距離（実焦点距離）**で配置する（`focalLengthMinFxMm`・`focalLengthMaxFxMm` は `Min/MaxMm` と同値）。
- 高さ・角丸半径は `config.json` で指定する。

#### レンズ名表示

- 図形の直下にレンズ名を表示する。
- 有効な表示属性があれば、レンズ名のさらに下に縦に並べる。

---

## 5. 表示属性チェックボックス

- 表の上部に横並びで配置する。
- チェックを入れた属性のみ、表中のレンズ名の下に表示する。
- 初期状態はすべてオフ。

| 属性キー | 表示ラベル |
|---|---|
| `weight` | 重さ |
| `price` | 価格 |
| `rentalAvailable` | レンタル |

属性の種類・ラベルは `config.json` で定義し、コードを変更せずに追加・削除できる。

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
フィルターが1件も適用されていない場合はチップバーを非表示にする。  
各チップには×ボタンを設け、クリックするとそのフィルターを単独で解除できる。  
フィルターに一致しないレンズは非表示にする。  
その結果、表示すべきレンズが0件になった行も非表示にする。  
さらに、セクション内のすべての行が非表示になった場合はセクションごと非表示にする。

| フィルター名 | 種別 | 対象属性 |
|---|---|---|
| 焦点距離 | 範囲スライダー（min / max） | `focalLengthFxMm`（単焦点）または `focalLengthMinFxMm` 〜 `focalLengthMaxFxMm`（ズーム）。DX レンズも表記上の焦点距離（実焦点距離）で評価する。 |
| 最大絞り | セレクトボックス（以下） | `maxAperture` |
| 価格 | 範囲スライダー（min / max） | `priceJpy` |
| レンタル可否 | トグル | `rentalAvailable` |
| フォーマット | セレクトボックス（すべて / FX対応 / DX専用） | `format` |

フィルターの種類・パラメーターは `config.json` で定義する。

---

## 8. config.json 仕様

```jsonc
{
  "focalLengthColumns": [
    { "fxMm": 12,  "dxMm": 18,   "widthPx": 80 },
    { "fxMm": 24,  "dxMm": 36,   "widthPx": 120 },
    // ...
  ],
  "columnSpacingPx": 8,          // 列間の余白

  "rowBaseHeightPx": 72,          // 行の基本高さ（図形 + レンズ名のみの場合）
  "attributeRowHeightPx": 16,     // 表示属性1件あたりの追加高さ
  "sectionLabelWidthPx": 40,      // セクションラベル列の幅

  "primeDotDiameter": 18,         // 単焦点ドットの直径 (px)
  "zoomBarHeightPx": 18,          // ズームバーの高さ (px)
  "zoomBarBorderRadiusPx": 9,     // ズームバーの角丸半径 (px)

  "colors": {
    "headerBackground": "#1a1a1a",
    "headerText": "#ffffff",
    "sectionLabelBackground": "#2c2c2c",
    "sectionLabelText": "#ffffff",
    "rowBackground": "#dcdcdc",    // 行の背景色（全行共通）
    "gridLineColor": "#ffffff",     // 縦グリッド線の色（横線はセクション間のみ）
    "sectionDividerColor": "#ffffff", // セクション間区切り線の色
    "lensDot": "#3300ff",
    "zoomBar": "#3300ff",
    "lensNameText": "#000000",
    "attributeText": "#555555"
  },

  "typography": {
    "lensNameFontSizePx": 11,
    "attributeFontSizePx": 10,
    "headerFontSizePx": 13
  },

  "displayAttributes": [
    { "key": "weight",         "label": "重さ",   "unit": "g",  "format": "number" },
    { "key": "price",          "label": "価格",   "unit": "円", "format": "number" },
    { "key": "rentalAvailable","label": "レンタル","unit": "",   "format": "boolean" }
  ],

  "filters": [
    { "key": "focalLength",  "label": "焦点距離", "type": "range",  "unit": "mm" },
    { "key": "maxAperture",  "label": "最大絞り", "type": "select", "options": [0.95, 1.2, 1.4, 1.7, 1.8, 2.0, 2.8, 3.5, 4.0, 4.5, 5.6, 6.3] },
    { "key": "price",        "label": "価格",     "type": "range",  "unit": "円" },
    { "key": "rentalAvailable","label": "レンタル可","type": "toggle" },
    { "key": "format", "label": "フォーマット", "type": "select", "options": ["all", "FX", "DX"] }
  ]
}
```

---

## 9. lenses.json 仕様

```jsonc
{
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
              "format": "FX",               // "FX" | "DX"
              "focalLengthMm": 35,          // 実焦点距離（単焦点）
              "focalLengthFxMm": 35,        // FX換算値（単焦点）。FXレンズは focalLengthMm と同値
              "maxAperture": 1.2,
              "weightG": 785,
              "priceJpy": 330000,
              "rentalAvailable": true,
              "imageStabilization": false
            }
          ]
        },
        {
          "id": "prime-row-1",
          "lenses": [
            {
              "id": "z-14-24-2.8-s",
              "name": "Z 14-24mm f/2.8 S",
              "type": "zoom",               // "prime" | "zoom"
              "format": "FX",               // "FX" | "DX"
              "focalLengthMinMm": 14,       // 実最短焦点距離（ズーム）
              "focalLengthMaxMm": 24,       // 実最長焦点距離（ズーム）
              "focalLengthMinFxMm": 14,     // FX換算最短焦点距離（ズーム）。FXレンズは Min/MaxMm と同値
              "focalLengthMaxFxMm": 24,     // FX換算最長焦点距離（ズーム）
              "maxAperture": 2.8,
              "weightG": 650,
              "priceJpy": 280000,
              "rentalAvailable": true,
              "imageStabilization": false
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

## 10. 非機能要件

| 項目 | 要件 |
|---|---|
| ホスティング | GitHub Pages（静的配信） |
| 依存ライブラリ | なし（バニラ HTML / CSS / JS） |
| ブラウザ対応 | Chrome / Firefox / Safari 最新版 |
| レスポンシブ | 横スクロール対応（表は最小幅を維持し、画面幅が不足する場合は横スクロール） |
| アクセシビリティ | チェックボックス・フィルターには `<label>` を付与する |
| Sticky 固定 | 焦点距離ヘッダー行（FX / DX）は縦スクロール時に画面上部へ固定（`position: sticky; top`）。セクションラベル列は横スクロール時に画面左端へ固定（`position: sticky; left`）。両者が交差するコーナーセルは両方向に対して固定する。 |

---

## 11. 将来拡張（スコープ外）

- FX / DX 焦点距離の切り替え表示
- レンズ詳細モーダル（クリックで仕様を表示）
- 外部データソース（Googleスプレッドシート等）との連携
- ダークモード対応
