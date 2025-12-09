# SenYouAI Studio - Official Website

AIバーチャルシンガー「愛玩王姫」と「千夕 雅」の公式サイト

## 🎨 特徴

- **Glassmorphismデザイン**: 透明感のある洗練されたUI
- **Excel駆動**: データはExcelで管理、バッチで自動JSON変換
- **アーティスト別フィルタ**: アーティストごとに専用ページを自動生成
- **レスポンシブ対応**: PC・スマホ両対応
- **アニメーション**: スムーズなホバーエフェクト

## 📁 フォルダ構成

```
senyouai-site/
├── index.html              # トップページ（全アーティスト表示）
├── ouki.html               # 愛玩王姫専用ページ
├── miyabi.html             # 千夕雅専用ページ
├── styles.css              # スタイルシート
├── main.js                 # JavaScriptメイン
├── data/                   # JSONデータ（自動生成）
│   ├── site.json
│   ├── artists.json
│   ├── music.json
│   ├── novels.json
│   └── stamps.json
├── images/                 # 画像ファイル
│   ├── About/
│   │   ├── AiganOuki.png
│   │   └── SenYouMiyabi.png
│   ├── music/
│   │   └── happiness-valentine.png
│   └── LINEStamp/
│       └── OukiStamp_001.png
├── scripts/                # ツール類
│   ├── excel_to_json.py
│   └── EXCEL_TEMPLATE_GUIDE.md
├── build_and_preview.bat   # ローカルプレビュー用
├── deploy_to_github.bat    # GitHub自動アップロード用
└── data_template.xlsx      # データ入力用Excel（あなたが作成）
```

## 🚀 使い方

### 1. 初回セットアップ

#### 必要なもの
- Python 3.x
- Git（GitHub使用の場合）

#### Pythonライブラリのインストール
```bash
pip install openpyxl
```

### 2. データの準備

#### Excelファイルの作成
`scripts/EXCEL_TEMPLATE_GUIDE.md` を参照して、`data_template.xlsx` を作成してください。

#### シート構成
- **Site**: サイト基本情報
- **Artists**: アーティスト情報
- **Music**: 楽曲情報
- **Novels**: 小説情報
- **Stamps**: LINEスタンプ情報

### 3. データ変換とプレビュー

#### Windows の場合
```bat
build_and_preview.bat
```
をダブルクリック

→ 自動的にブラウザで http://localhost:8000 が開きます

#### Mac/Linux の場合
```bash
# JSON生成
python scripts/excel_to_json.py data_template.xlsx

# ローカルサーバー起動
python -m http.server 8000

# ブラウザで http://localhost:8000 を開く
```

### 4. GitHub へのアップロード

#### Windows の場合
```bat
deploy_to_github.bat
```
をダブルクリック

#### Mac/Linux の場合
```bash
# JSON生成
python scripts/excel_to_json.py data_template.xlsx

# Git コミット
git add .
git commit -m "Update data"
git push
```

## 🎨 デザインカスタマイズ

### テーマ変更
`data/site.json` の `theme` を変更:
- `dark`: ダークテーマ（デフォルト）
- `light`: ライトテーマ

### 季節テーマ
`data/site.json` の `season` を変更:
- `default`: 通常
- `valentine`: バレンタイン（ピンク系）
- `xmas`: クリスマス（緑系）
- `newyear`: 新年（オレンジ系）

### CSS変数のカスタマイズ
`styles.css` の `:root` セクションで色を変更できます:

```css
:root {
  --accent: #ff8ac7;           /* メインアクセントカラー */
  --ouki-primary: #ffb6d5;     /* 愛玩王姫カラー */
  --miyabi-primary: #c4b5fd;   /* 千夕雅カラー */
  ...
}
```

## 📝 データ入力のコツ

### 改行
- Excelでは改行を `\n` で表現
- 例: `1行目\n2行目\n3行目`

### 画像パス
- 相対パスで記述
- 例: `images/About/AiganOuki.png`

### タグ
- カンマ区切りで複数指定
- 例: `Pop,Valentine,恋愛`

### ステータス
- `released`: 配信中
- `coming`: 配信予定（COMING SOONバナー表示）

## 🛠️ トラブルシューティング

### Q: 画像が表示されない
A: 画像ファイルが `images/` フォルダに配置されているか確認してください

### Q: JSONファイルが生成されない
A: `openpyxl` がインストールされているか確認
```bash
pip install openpyxl
```

### Q: GitHubにプッシュできない
A: リポジトリが設定されているか確認
```bash
git remote -v
```

## 📱 GitHub Pages での公開

### 初回設定
1. GitHubでリポジトリ作成
2. ローカルで初期化
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

3. GitHub リポジトリの Settings → Pages
4. Source: `main` ブランチ, Folder: `/ (root)`
5. Save

### URL
`https://あなたのユーザー名.github.io/リポジトリ名/`

## ✨ 今後の拡張案

- [ ] 楽曲の音声プレーヤー埋め込み
- [ ] ブログ/ニュース機能
- [ ] SNSフィード統合
- [ ] コメントシステム
- [ ] 多言語対応

## 📄 ライセンス

このテンプレートは自由に使用・改変できます。
ただし、キャラクターデザイン・楽曲等の著作権は SenYouAI プロジェクトに帰属します。

## 🙋 サポート

質問・バグ報告は GitHub Issues へお願いします。

---

**Powered by SenYouAI Studio**
