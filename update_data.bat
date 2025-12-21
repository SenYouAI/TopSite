@echo off
cd /d %~dp0

echo Updating data from scripts...

:: 1. Download entries from Google Sheets (Optional - Enable if URLs are set)
:: powershell -ExecutionPolicy Bypass -File scripts/download_data.ps1

:: 2. Convert CSV to JSON
powershell -ExecutionPolicy Bypass -File scripts/build_data.ps1

echo Done.
pause
