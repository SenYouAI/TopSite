@echo off
chcp 65001 >nul
echo ========================================
echo  GitHub Auto Deploy
echo ========================================
echo.

REM Convert data
echo [1/4] Converting Excel to JSON...
python scripts\excel_to_json.py data_template.xlsx
if errorlevel 1 (
    echo [ERROR] Conversion failed
    pause
    exit /b 1
)

echo.
echo [2/4] Git staging...
git add .

echo.
echo [3/4] Git commit...
set /p commit_message="Enter commit message: "
if "%commit_message%"=="" set commit_message=Update data

git commit -m "%commit_message%"

echo.
echo [4/4] Pushing to GitHub...
git push

echo.
echo ========================================
echo  Deploy completed!
echo ========================================
pause
