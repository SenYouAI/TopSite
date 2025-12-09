# Excel テンプレート仕様書
# data_template.xlsx を作成する際のシート構成

## 📋 必要なシート一覧
1. Site（サイト基本情報）
2. Artists（アーティスト情報）
3. Music（楽曲情報）
4. Novels（小説情報）
5. Stamps（LINEスタンプ情報）

---

## 📄 シート1: Site
サイト全体の基本設定

| A列（項目名） | B列（値） |
|-------------|---------|
| title | SenYouAI Studio / 愛玩王姫 Official |
| tagline | AIとあなたで育てるバーチャルプロジェクト。歌とラノベとスタンプで、日常にちょっとした"庇護"を。 |
| theme | dark |
| season | default |

**theme**: dark / light
**season**: default / valentine / xmas / newyear

---

## 👤 シート2: Artists
アーティスト情報（1行目:ヘッダー、2行目:空白、3行目以降:データ）

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| ID | 名前 | 役割 | カバー画像 | 紹介文 | Spotify | YouTube Music | Amazon Music | アーティストページURL | SpotifyアーティストURL |
| ouki | 愛玩王姫（あいがん おうき） | Virtual Singer（AI） | images/About/AiganOuki.png | 白猫耳とゆるい縦ロール... | https://... | https://... | https://... | ouki.html | https://open.spotify.com/artist/xxxxx |
| chiya_masa | 千夕 雅（せんゆう みやび） | Virtual Singer（AI） | images/About/SenYouMiyabi.png | 澄んだ唄声で... | | | | miyabi.html | https://open.spotify.com/artist/xxxxx |

**ID**: ouki, chiya_masa など（半角英数字）
**紹介文**: 改行は「\n」で表現
**アーティストページURL**: 楽曲カードのアーティスト名クリック時の遷移先（例: ouki.html）
**SpotifyアーティストURL**: Spotifyのアーティストページ（将来的に使用予定）

---

## 🎵 シート3: Music
楽曲情報（1行目:ヘッダー、2行目:空白、3行目以降:データ）

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | 曲名 | アーティストID | リリース日 | ステータス | カバー画像 | 歌詞プレビュー | 歌詞（全文） | 備考 | タグ | YouTube | Spotify | Apple Music | Spotify埋め込みURL |
| song_happiness_valentine | Happiness Valentine | ouki | 2024-02-14 | released | images/music/happiness-valentine.png | チョコレートみたいに... | 鏡の前でくるりんぱ\n今日の... | バレンタインをテーマに... | Pop,Valentine,恋愛 | | https://open.spotify.com/track/xxxxx | | https://open.spotify.com/embed/track/xxxxx |
| song_kotoba | 言葉の向こう側 | ouki | 2024-11-15 | released | | | | | Ballad,切ない | | https://open.spotify.com/track/xxxxx | | https://open.spotify.com/embed/track/xxxxx |

**ステータス**: released（配信中） / coming（配信予定）
**タグ**: カンマ区切りで複数指定可能
**歌詞**: 改行は「\n」で表現
**Spotify埋め込みURL**: Spotifyの埋め込みURLを指定（後述の取得方法参照）

### 🎯 表示の自動判定（超シンプル！）

**N列（Spotify埋め込みURL）の有無で自動判定:**

#### パターンA: N列が**空欄**（配信前）
```
F列: images/music/song.png
N列: 空欄
```
→ **PNG画像を表示**

```
┌─────────────────┐
│  [PNG画像]      │ ← F列の画像
│  COMING SOON    │   （配信前は帯表示）
├─────────────────┤
│ タイトル        │
└─────────────────┘
```

#### パターンB: N列に**URLあり**（配信後）
```
F列: images/music/song.png ← カバー画像（必須）
N列: https://open.spotify.com/embed/track/xxxxx
```
→ **PNG画像 + コンパクトプレーヤーを表示**

```
┌─────────────────┐
│  [PNG画像]      │ ← F列の画像（大きく表示）
├─────────────────┤
│ タイトル        │
│ 🎵 Spotifyで試聴 │
│  [プレーヤー]   │ ← N列のURL（コンパクト152px）
└─────────────────┘
```

### 📋 推奨ワークフロー

#### 🎬 配信前
```
F列: images/music/new-song.png ← カバー画像（必須）
N列: 空欄
E列: coming
```

#### 🎵 配信後
```
F列: images/music/new-song.png ← そのまま（変更不要）
N列: https://open.spotify.com/embed/track/xxxxx ← 追加するだけ！
E列: released
```

**メリット:**
- ✅ カバー画像が常に大きく表示される
- ✅ 配信後にN列追加で試聴機能が追加される
- ✅ コンパクトプレーヤー（152px）でバランス良し

### Spotify埋め込みURLの取得方法:
1. Spotifyで楽曲を開く
2. 「...」メニュー → 「共有」 → 「埋め込みコードをコピー」
3. コピーされたコードから `src="..."` の部分だけ抽出
   
例:
```html
<iframe src="https://open.spotify.com/embed/track/xxxxxx?utm_source=generator"></iframe>
```
↓ この部分だけExcelのN列に貼り付け
```
https://open.spotify.com/embed/track/xxxxxx?utm_source=generator
```

---

## 📚 シート4: Novels
小説情報（1行目:ヘッダー、2行目:空白、3行目以降:データ）

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID | タイトル | サブタイトル | 説明 | なろうリンク | Kindleリンク | その他リンク |
| novel_ouki_vol1 | 愛玩王姫は今日も庇護される（仮） | 白猫耳の王女と、過保護すぎる周囲のお話。 | 白猫耳の王女・愛玩王姫が... | | | |

---

## 🎨 シート5: Stamps
LINEスタンプ情報（1行目:ヘッダー、2行目:空白、3行目以降:データ）

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID | タイトル | 説明 | カバー画像 | 一覧URL | 詳細URL | タグ |
| stamp_ouki_basic | 愛玩王姫スタンプ | 愛玩王姫が日常で使いやすい... | images/LINEStamp/OukiStamp_001.png | https://line.me/... | https://line.me/... | LINE,スタンプ,王姫 |

**タグ**: カンマ区切りで複数指定可能

---

## 🚀 使い方

1. **data_template.xlsx** を作成（上記のシート構成で）
2. データを入力
3. コマンドプロンプトで以下を実行:
   ```
   cd senyouai-site/scripts
   python excel_to_json.py ../data_template.xlsx
   ```
4. data/ フォルダに各JSONファイルが自動生成される
5. GitHubにコミット

---

## 💡 Tips

- **改行**: Excelのセル内改行ではなく「\n」で記述
- **空欄OK**: 空欄のセルは自動的にスキップされます
- **画像パス**: `images/xxxx/yyy.png` の形式で記述
- **URL**: 完全なURL（https://...）を記述

---

以上！

---

## 📰 シート6: News（NEW!）
お知らせ・最新情報（1行目:ヘッダー、2行目:空白、3行目以降:データ）

| A | B | C | D | E |
|---|---|---|---|---|
| 日付 | タイトル | 説明 | リンク先 | アイコン |
| 2024-12-06 | 新曲「Happiness Valentine」配信開始 | Spotify、Apple Musicで配信中！ | #music | 🎵 |
| 2024-11-15 | 小説「冬の物語」第1章公開 | Novelページで読めます | #novels | 📖 |
| 2024-10-20 | LINEスタンプ第2弾リリース | ストアで販売中 | #stamps | 🎨 |

**日付**: YYYY-MM-DD形式
**タイトル**: お知らせのタイトル
**説明**: 詳細説明（オプション）
**リンク先**: クリック時の遷移先（#music, #novels, #stamps, または外部URL）
**アイコン**: 絵文字（🎵=音楽、📖=小説、🎨=スタンプ、📢=お知らせ）

### 💡 使い方

#### Homeページに表示
- 最新5件をHomeページの最上部に表示
- 手動管理で「何が最新か」を明確に

#### リンク先の指定
- `#music` → Musicページへ
- `#novels` → Novelページへ
- `#stamps` → Stampsページへ
- `https://...` → 外部リンク（新しいタブで開く）

#### 推奨運用
1. 新しいコンテンツを追加したら、Newsシートの最上部に追加
2. 古いニュースは削除せず残す（履歴として）
3. 重要なお知らせは絵文字で強調

### アイコン一覧
- 🎵 音楽関連
- 📖 小説関連
- 🎨 スタンプ関連
- 📢 一般的なお知らせ
- 🎉 イベント
- ⚠️ 重要なお知らせ
