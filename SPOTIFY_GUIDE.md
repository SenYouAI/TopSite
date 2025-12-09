# 🎵 Spotify埋め込みプレーヤー追加ガイド

## 🎯 **ベストバランス: PNG画像 + コンパクトプレーヤー**

**カバー画像（大きく見せる） + コンパクトプレーヤー（試聴機能）**

---

## 📊 **表示パターン**

### **パターンA: PNG画像のみ（配信前）**
```
┌─────────────────────────┐
│   [PNG画像]              │ ← F列の画像（大きく表示）
│   COMING SOON            │
├─────────────────────────┤
│ Happiness Valentine     │
│ 愛玩王姫 / 2024-02-14   │
└─────────────────────────┘
```
**設定:** N列 = 空欄

**用途:**
- ✅ 配信前の楽曲（COMING SOON表示）
- ✅ カバー画像を大きく見せる

---

### **パターンB: PNG画像 + コンパクトプレーヤー（配信後）**
```
┌─────────────────────────┐
│   [PNG画像]              │ ← F列の画像（大きく表示）
├─────────────────────────┤
│ Happiness Valentine     │
│ 愛玩王姫 / 2024-02-14   │
│                         │
│ 🎵 Spotifyで試聴         │
│ ┌─────────────────────┐ │
│ │ ▶ ━━━━━━━━━━━━━    │ │ ← N列のURL（コンパクト152px）
│ └─────────────────────┘ │
└─────────────────────────┘
```
**設定:** N列 = https://open.spotify.com/embed/track/xxxxx

**用途:**
- ✅ 配信済みの楽曲
- ✅ カバー画像を大きく見せつつ試聴も可能
- ✅ バランスが良い

---

## 📋 **推奨ワークフロー**

### 🎬 **配信前**
```
F列: images/music/new-song.png ← カバー画像（必須）
N列: 空欄
E列: coming
```
→ PNG画像 + COMING SOONバナー表示

### 🎵 **配信後**
```
F列: images/music/new-song.png ← そのまま（削除不要）
N列: https://open.spotify.com/embed/track/xxxxx ← 追加するだけ！
E列: released
```
→ **PNG画像 + コンパクトプレーヤー表示**

**メリット:**
- ✅ カバー画像が常に大きく表示される
- ✅ 配信後にN列追加で試聴機能が追加
- ✅ コンパクトプレーヤー（152px）でカードのバランスが良い

---

## 📝 Step 1: Spotify埋め込みURLを取得

### 方法1: Spotifyアプリ（推奨）

1. Spotifyで楽曲を開く
2. **「...」（3点メニュー）** をクリック
3. **「共有」** → **「埋め込みコードをコピー」** を選択
4. コピーされたコードが表示される：

```html
<iframe style="border-radius:12px" 
  src="https://open.spotify.com/embed/track/3n3Ppam7vgaVa1iaRUc9Lp?utm_source=generator" 
  width="100%" height="152" frameBorder="0" allowfullscreen="" 
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
  loading="lazy"></iframe>
```

5. **`src="..."`** の中身だけを抽出：

```
https://open.spotify.com/embed/track/3n3Ppam7vgaVa1iaRUc9Lp?utm_source=generator
```

### 方法2: Spotify Web Player

1. https://open.spotify.com/ にアクセス
2. 楽曲を検索して開く
3. 上記と同じ手順で「埋め込みコードをコピー」

---

## 📊 Step 2: Excelに追加

### Musicシートに入力

`data_template.xlsx` の **Musicシート** の **N列（Spotify埋め込みURL）** に貼り付け：

| A | B | C | ... | F | ... | N |
|---|---|---|-----|---|-----|---|
| ID | 曲名 | アーティストID | ... | カバー画像 | ... | **Spotify埋め込みURL** |
| song_001 | Happiness Valentine | ouki | ... | images/music/song.png | ... | 空欄（配信前） |
| song_002 | 言葉の向こう側 | ouki | ... | 空欄でもOK | ... | https://open.spotify.com/embed/track/xxxxx |

### N列（Spotify埋め込みURL）

- ✅ **URLのみ**を貼り付け（`<iframe>` タグは不要）
- ✅ **`https://open.spotify.com/embed/track/`** で始まるURL
- ❌ **通常のSpotify URL**（`https://open.spotify.com/track/`）は使えません
- 💡 **配信前は空欄でOK**（配信後に追加）

### 自動判定の仕組み

```
N列が空欄 → F列のPNG画像を表示
N列にURL → Spotifyプレーヤーを表示（F列は無視）
```

**配信前→配信後の移行:**
1. 配信前: N列を空欄のまま → PNG画像表示
2. 配信後: N列にURL追加 → 自動的にSpotifyプレーヤー表示
3. F列は変更不要（自動的に無視される）

---

## 🚀 Step 3: サイトに反映

### Windows
```bat
build_and_preview.bat をダブルクリック
```

### Mac/Linux
```bash
python scripts/excel_to_json.py data_template.xlsx
python -m http.server 8000
```

ブラウザで http://localhost:8000 を開いてプレーヤーが表示されるか確認！

---

## 🎨 表示位置

Spotify埋め込みプレーヤーは以下の順序で表示されます：

1. **楽曲カバー画像**
2. **タイトル・アーティスト・日付**
3. **説明文**
4. **タグ（chip）**
5. **🎵 Spotifyで試聴** ← ここに表示！
6. **歌詞を表示ボタン**
7. **配信リンク**

---

## ❓ よくある質問

### Q: プレーヤーが表示されない

**A: 以下を確認してください**

1. ✅ Spotify埋め込みURLが正しいか
   - `https://open.spotify.com/embed/track/` で始まっているか
   - 通常のURL（`/track/`）ではないか

2. ✅ Excelのセルが正しいか
   - N列に貼り付けているか
   - セルに余分なスペースがないか

3. ✅ JSON生成が成功しているか
   ```bash
   python scripts/excel_to_json.py data_template.xlsx
   ```

### Q: 楽曲が配信前でSpotifyにない

**A: N列を空欄にしてください**
- 配信前の楽曲は空欄のままでOK
- 配信後にURLを追加して再生成

### Q: プレーヤーの高さを変更したい

**A: `styles.css` を編集**
```css
.card-spotify iframe {
  height: 152px;  /* ← ここを変更 */
}
```

推奨値:
- **152px**: 標準（Spotifyのコンパクトプレーヤー）
- **352px**: フルプレーヤー（歌詞表示なし）
- **80px**: ミニプレーヤー

---

## 🎉 完成例

### Excel入力例

| N列 |
|-----|
| https://open.spotify.com/embed/track/3n3Ppam7vgaVa1iaRUc9Lp |

### サイト表示例

実際のカードに埋め込みプレーヤーが表示され、**その場で試聴可能**になります！

---

## 📱 スマホ対応

- ✅ **レスポンシブ対応済み**
- ✅ スマホでもプレーヤーは正しく表示されます
- ✅ タップで再生可能

---

## 💡 Tips

### 複数の楽曲に一括追加

1. Excel で最初の行にURLを入力
2. セルをコピー
3. 下の行に一括貼り付け
4. 各行のtrack IDを書き換え

### プレイリストも埋め込み可能

楽曲だけでなく、プレイリストやアルバムも埋め込めます：

- **楽曲**: `https://open.spotify.com/embed/track/xxxxx`
- **アルバム**: `https://open.spotify.com/embed/album/xxxxx`
- **プレイリスト**: `https://open.spotify.com/embed/playlist/xxxxx`

---

困ったら README.md を参照してください！
