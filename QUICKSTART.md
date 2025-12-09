# 🚀 クイックスタート

## 最初にやること（5分で完了）

### 1. Python のインストール確認
```bash
python --version
```

表示されない場合 → [Python公式サイト](https://www.python.org/)からインストール

### 2. 必要なライブラリをインストール
```bash
pip install openpyxl
```

### 3. Excelファイルを作成

`scripts/EXCEL_TEMPLATE_GUIDE.md` を見ながら、`data_template.xlsx` を作成します。

**最低限必要なシート:**
- Site（サイト基本情報）
- Artists（アーティスト情報）

**各シートの構造:**

#### Site（サイト基本情報）
- title: サイトタイトル
- tagline: キャッチフレーズ
- theme: dark / light
- season: default / valentine / xmas / newyear

#### Artists（アーティスト情報）
- ID: ouki, chiya_masa など
- 名前: 愛玩王姫、千夕 雅
- 役割: Virtual Singer（AI）
- カバー画像: images/About/xxx.png
- 紹介文: 自己紹介文

#### Music（楽曲情報）
- ID: song_xxx
- 曲名: Happiness Valentine
- アーティストID: ouki / chiya_masa
- リリース日: 2024-02-14
- ステータス: released / coming
- カバー画像: images/music/xxx.png
- タグ: Pop,Valentine,恋愛（カンマ区切り）
- **Spotify埋め込みURL**: https://open.spotify.com/embed/track/xxxxx

**自動判定:**
- N列が空欄 → PNG画像表示（配信前）
- N列にURL → Spotifyプレーヤー表示（配信後）

#### Novels（小説情報）
- ID: novel_xxx
- タイトル
- サブタイトル
- 説明

#### Stamps（LINEスタンプ情報）
- ID: stamp_xxx
- タイトル
- 説明
- カバー画像
- タグ（カンマ区切り）

#### News（お知らせ・最新情報）- NEW!
- 日付: 2024-12-06
- タイトル: 新曲「Happiness Valentine」配信開始
- 説明: Spotify、Apple Musicで配信中！
- リンク先: #music（クリック時の遷移先）
- アイコン: 🎵（絵文字）

**Newsの特徴:**
- Homeページの最上部に最新5件を表示
- Music/Novel/Stampすべての最新情報を手動管理
- 「何が最新か」が一目でわかる

詳細は `scripts/EXCEL_TEMPLATE_GUIDE.md` を参照してください。

### 4. ローカルでプレビュー

#### Windows
```
build_and_preview.bat をダブルクリック
```

#### Mac/Linux
```bash
python scripts/excel_to_json.py data_template.xlsx
python -m http.server 8000
```

ブラウザで http://localhost:8000 を開く

### 5. GitHubに公開（オプション）

#### 初回のみ
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

#### 2回目以降（Windows）
```
deploy_to_github.bat をダブルクリック
```

---

## よくある質問

**Q: Excelのどのシートが必須？**
A: SiteとArtistsは必須。他は空でもOK

**Q: 画像はどこに置く？**
A: `images/` フォルダに配置。パスは `images/About/xxx.png` の形式

**Q: データを更新したら？**
A: `build_and_preview.bat` を実行するだけ

---

**困ったら？** → README.md を参照
