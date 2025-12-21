# build_data.ps1
# Convert CSV files in data_src to JSON files in data
# Usage: .\update_data.bat

$srcDir = "data_src"
$destDir = "data"

if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

function Parse-CsvFile {
    param (
        [string]$FileName,
        [string]$Type # "items" or "sections"
    )

    $csvPath = Join-Path $srcDir $FileName
    if (-not (Test-Path $csvPath)) { Write-Host "Skipping $FileName (not found)"; return }

    Write-Host "Processing $FileName..."
    
    # Import CSV using UTF8 to handle Japanese characters correctly
    $data = Import-Csv -Path $csvPath -Encoding UTF8

    $items = @()

    foreach ($row in $data) {
        $item = @{}
        $links = @{}
        
        # Iterate through properties
        foreach ($prop in $row.PSObject.Properties) {
            $name = $prop.Name
            $value = $prop.Value.Trim()

            # Skip custom comments/notes or empty values (optional, but good for clean json)
            if ($name.StartsWith("_") -or $name.StartsWith("(note)")) { continue }

            # Handle Array (pipe separated)
            if ($name -eq "tags" -and $value -ne "") {
                $item[$name] = $value.Split("|")
            }
            # Handle Nested Links (links_Spotify -> links.Spotify)
            elseif ($name.StartsWith("links_")) {
                if ($value -ne "") {
                    $service = $name.Substring(6) # Remove "links_"
                    $links[$service] = $value
                }
            }
            # Standard Fields
            else {
                if ($value -ne "") {
                     $item[$name] = $value
                }
            }
        }

        # Attach links object if not empty
        if ($links.Count -gt 0) {
            $item["links"] = $links
        }

        $items += $item
    }

    # Structure Output
    $output = @{}
    if ($Type -eq "sections") {
        # Wrap in a default "All" section for compatibility with existing JS logic
        $output["sections"] = @(
            @{
                title = "All"
                items = $items
            }
        )
    } else {
        $output["items"] = $items
    }

    # Convert to JSON
    $jsonContent = $output | ConvertTo-Json -Depth 5 -Compress
    
    # Prettify somewhat manually or accept compressed? 
    # Compress is safer for encoding in PS 5.1 sometimes, but readable is nice.
    # Let's use simple output. PS 5.1 ConvertTo-Json defaults to Unicode (UTF16). 
    # We must enforce UTF8 for web.

    $jsonPath = Join-Path $destDir ($FileName.Replace(".csv", ".json"))
    
    # Write as UTF8NoBOM or UTF8
    [System.IO.File]::WriteAllText($jsonPath, $jsonContent, [System.Text.Encoding]::UTF8)
}

# Execute for known files
Parse-CsvFile "music.csv" "sections"
Parse-CsvFile "novels.csv" "sections"
Parse-CsvFile "stamps.csv" "sections"
Parse-CsvFile "artists.csv" "items"
Parse-CsvFile "news.csv" "items"

Write-Host "Data update complete."
