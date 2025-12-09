@echo off
chcp 65001 >nul
echo ========================================
echo  SenYouAI Studio - Build and Preview
echo ========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed
    echo Please install Python 3.x
    pause
    exit /b 1
)

REM Check openpyxl installation
python -c "import openpyxl" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing openpyxl...
    pip install openpyxl
    if errorlevel 1 (
        echo [ERROR] Failed to install openpyxl
        pause
        exit /b 1
    )
    echo [OK] openpyxl installed successfully
    echo.
)

REM Check Excel file
if not exist "data_template.xlsx" (
    echo [ERROR] data_template.xlsx not found
    echo Please place data_template.xlsx in current directory
    pause
    exit /b 1
)

echo [1/3] Converting Excel to JSON...
python scripts\excel_to_json.py data_template.xlsx
if errorlevel 1 (
    echo [ERROR] Conversion failed
    pause
    exit /b 1
)

echo.
echo [2/3] Starting local server...
echo Open http://localhost:8000 in your browser
echo Press Ctrl+C to stop the server
echo.

REM Open browser after 2 seconds
timeout /t 2 /nobreak >nul
start http://localhost:8000

REM Start HTTP server
python -m http.server 8000

pause
