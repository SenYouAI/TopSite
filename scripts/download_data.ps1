# scripts/download_data.ps1

# 設定：Googleスプレッドシートの「公開CSV」URLをここに貼り付けてください
# 手順：
# 1. スプレッドシートで「ファイル」→「共有」→「ウェブに公開」
# 2. 「シート全体」ではなく「music」などのシートを選択し、「CSV」形式を選択
# 3. 表示されたURLを以下の $urls の該当部分に貼り付ける

$urls = @{
    "music.csv"   = "" # 例: "https://docs.google.com/spreadsheets/d/.../pub?gid=...&output=csv"
    "news.csv"    = ""
    "artists.csv" = ""
    "novels.csv"  = ""
    "stamps.csv"  = ""
}

$destDir = "data_src"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

foreach ($key in $urls.Keys) {
    $url = $urls[$key]
    if ($url -ne "") {
        Write-Host "Downloading $key ..."
        $outputPath = Join-Path $destDir $key
        try {
            # Download using Invoke-WebRequest, ensuring UTF8 decoding if needed
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing
            
            # Google Sheets CSV usually comes as UTF-8. Save it as such.
            # Byte-stream saving is safest to preserve encoding.
            [System.IO.File]::WriteAllBytes($outputPath, $response.Content.ToString().ToCharArray() | ForEach-Object { [byte]$_ })
            
            # Alternative simpler way if encoding is standard
            # Set-Content -Path $outputPath -Value $response.Content -Encoding UTF8
            
            Write-Host "  -> Saved to $outputPath"
        } catch {
            Write-Host "  -> Error downloading $key : $_"
        }
    } else {
        Write-Host "Skipping $key (No URL configured)"
    }
}
