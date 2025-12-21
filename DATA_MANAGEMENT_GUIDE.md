# データ管理・運用ガイド

このドキュメントでは、Webサイトのデータを管理するためのGoogleスプレッドシートの構成、画像の仕様、および更新手順について説明します。

## 1. Googleスプレッドシートの構成

Webサイトのデータ（音楽、小説、スタンプ、アーティスト、ニュース）は、それぞれ別のシート（または別のファイル）で管理し、CSVとして出力します。
以下のリストに従って、スプレッドシートの1行目に「ヘッダー列」を作成してください。

### 共通ルール
*   **ヘッダー名（1行目）**: 正確に以下の英単語を使用してください（大文字小文字を区別します）。
*   **ID**: 各データで重複しない一意な英数字（例: `happiness_v`, `ouki_vol1`）。
*   **空欄**: データがない場合は空欄で構いません。
*   **複数項目**: タグなどは `|` (縦棒) で区切ります（例: `Pop|Ballad`）。
*   **_note**: メモ用です。Webサイトには表示されません。
*   **並び順**: サイト上では基本的に「日付 (`date` / `releaseDate`)」の新しい順に表示されます。

---

### A. Music シート (`music.csv`)
楽曲情報を管理します。

| 列名 (A列〜) | 説明 / 書式サンプル | 必須 | 備考 |
| :--- | :--- | :---: | :--- |
| `id` | ID (英数字) <br>例: `happiness` | 〇 | |
| `title` | 曲名 <br>例: `Happiness Valentine` | 〇 | |
| `artistId` | アーティストID (`ouki` または `miyabi`) | 〇 | フィルタリングに使用 |
| `releaseDate`| 公開日 (YYYY-MM-DD) <br>例: `2024-02-14` | 〇 | 並び順に影響 |
| `status` | ステータス <br>例: `released` | | 現状は表示への影響なし |
| `cover` | ジャケット画像パス <br>例: `images/music/happiness.png` | 〇 | 推奨サイズ: 600x600px |
| `lyricsPreview`| 歌詞の一節（カード表示用） | | |
| `lyrics` | 歌詞全文 (改行は `\n` と記述) | | モーダル内に表示 |
| `tags` | タグ (`|`区切り) <br>例: `Pop|恋愛` | | |
| `links_Spotify`| Spotify URL <br>例: `https://open.spotify.com/...` | | Spotifyボタンを表示 |
| `links_AppleMusic`| Apple Music URL | | |
| `links_YoutubeMusic`| YouTube Music URL | | |
| `links_MV` | YouTube MV URL | | |
| `spotifyEmbed` | Spotify埋め込みタグ <br>例: `<iframe src="..."></iframe>` | | モーダル内の再生プレイヤー (空欄時はURLからボタンを自動生成) |
| `_note` | 管理用メモ | | |

### B. Novels シート (`novels.csv`)
小説データを管理します。

| 列名 | 説明 / 書式サンプル | 必須 | 備考 |
| :--- | :--- | :---: | :--- |
| `id` | ID (英数字) <br>例: `novel01` | 〇 | |
| `title` | タイトル | 〇 | |
| `subtitle` | サブタイトル | | Heroセクションなどで使用 |
| `description`| あらすじ・説明文 | 〇 | カードに表示 |
| `date` | 公開日 (YYYY-MM-DD) | 〇 | |
| `link` | リンク先URL (Note等) <br>例: `https://note.com/...` | 〇 | 「読む」ボタンの先 |
| `cover` | 表紙画像パス (任意) <br>例: `images/novels/vol1.png` | | Heroセクションで表示する場合に追加推奨 |
| `_note` | 管理用メモ | | |

### C. Stamps シート (`stamps.csv`)
LINEスタンプ等の情報を管理します。

| 列名 | 説明 / 書式サンプル | 必須 | 備考 |
| :--- | :--- | :---: | :--- |
| `id` | ID (英数字) | 〇 | |
| `title` | スタンプ名 | 〇 | |
| `description`| 説明文 | | |
| `cover` | メイン画像パス <br>例: `images/stamps/pack1.png` | 〇 | |
| `date` | リリース日 (YYYY-MM-DD) | | |
| `detailUrl` | ストアURL <br>例: `https://line.me/S/sticker/...` | 〇 | 購入ページへ遷移 |
| `tags` | タグ (`|`区切り) | | |
| `_note` | 管理用メモ | | |

### D. News シート (`news.csv`)
ニュース・お知らせを管理します。

| 列名 | 説明 / 書式サンプル | 必須 | 備考 |
| :--- | :--- | :---: | :--- |
| `id` | ID (英数字) | | |
| `date` | 日付 (YYYY-MM-DD) | 〇 | |
| `title` | ニュースタイトル | 〇 | |
| `description`| 詳細・本文 | | |
| `icon` | アイコン文字または絵文字 <br>例: `INFO`, `🎉`, `🎵` | | リストの左側に表示 |
| `link` | リンク先URL (あれば) | | クリックで遷移させる場合 |
| `_note` | 管理用メモ | | |

### E. Artists シート (`artists.csv`)
アーティスト情報を管理します（通常は頻繁に変更しません）。

| 列名 | 説明 / 書式サンプル |
| :--- | :--- |
| `id` | `ouki` / `chiya_masa` |
| `name` | 名前 (日本語) 例: `愛玩王姫（あいがん おうき）` |
| `role` | 肩書き 例: `Virtual Singer (AI)` |
| `cover` | アーティスト写真パス 例: `images/About/ouki.png` |
| `bio` | 紹介文 |
| `artistPageUrl`| 個別ページURL (`ouki.html` 等) |
| `links_Youtube`| YouTubeチャンネルURL |
| `links_X` | X (Twitter) URL |
| `playlistUrl`| 代表プレイリストURL |

---

## 2. 画像データについて

### Q. 画像サイズはどのくらいが適切ですか？
Webサイトの表示速度と画質のバランスを考慮し、以下のサイズを推奨します。3000pxなどの原寸大画像はファイルサイズが大きすぎるため、リサイズして使用してください。

| 用途 | 推奨サイズ (px) | 推奨形式 | 備考 |
| :--- | :--- | :--- | :--- |
| **ジャケット画像** (Music/Novels) | **600 x 600** | JPG / PNG | 正方形。Retinaディスプレイ対応のため、表示サイズ(約300px)の2倍を推奨。 |
| **スタンプ画像** | **400 x 400** | FN PG (透過) | 背景透過のPNG推奨。 |
| **アーティスト写真** | **400 x 400** | JPG / PNG | 円形に切り抜かれますが、元画像は正方形でOK。 |
| **Hero用画像** (トップ等の背景) | **1920 x 1080** | JPG | ファイルサイズを200KB以下に抑えると良いです。 |

### Q. 画像の配置場所とパスの書き方は？
*   **配置場所**: プロジェクトフォルダ内の `images/` フォルダの中に、カテゴリごとにサブフォルダを作って整理することをお勧めします。
    *   例: `images/music/`, `images/novels/`, `images/stamps/`
*   **パスの書き方**: スプレッドシートには「**相対パス**」を記入します。
    *   〇 正しい: `images/music/happiness.png`
    *   ✕ 間違い: `C:/Users/.../images/music/happiness.png`
*   **Spotify等の外部画像**: Spotifyの画像URLを直接指定することも技術的には可能ですが（`https://i.scdn.co/image/...`）、リンク切れのリスクがあるため、**画像をダウンロードしてローカル(`images/`フォルダ)に置くことを強く推奨します。**

---

## 3. 今後の運用ワークフロー

1.  **Googleスプレッドシートを更新する**
    *   新しい行を追加し、データを入力します。
2.  **データを同期する**
    *   PC上の `update_data.bat` をダブルクリックします。
    *   これだけで、「シートからCSVダウンロード」→「JSON変換」が自動で行われます。
    *   *※初回のみ、スプレッドシートのURLを `scripts/download_data.ps1` に設定する必要があります。*
3.  **画像を追加する**
    *   新しいジャケット画像などを `images/xxx/` フォルダに保存します。
4.  **Webサイトを確認する**
    *   `index.html` を開き、更新が反映されているか確認します。
