@echo off
title Cloud Monitoring Dashboard - Simple Launch

echo ============================================================
echo   CLOUD MONITORING DASHBOARD - AUTOMATED LAUNCH
echo   Author: Zakariae El Bouzidi
echo   AI-Enhanced Monitoring System
echo ============================================================
echo.

:: Configuration variables
set BACKEND_DIR=%cd%\cloud_monitoring_dashboard\backend
set FRONTEND_DIR=%cd%\cloud_monitoring_dashboard\frontend
set DASHBOARD_URL=http://localhost:8000
set API_URL=http://localhost:8000/docs

echo STEP 1/4: Verifying prerequisites...
echo.

:: Verify Python
echo - Verifying Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed
    echo Please install Python from https://python.org
    pause
    exit /b 1
)
echo + Python detected

:: Verify structure
echo - Verifying project structure...
if not exist "%BACKEND_DIR%" (
    echo ERROR: Backend directory missing
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%\main.py" (
    echo ERROR: main.py file missing
    pause
    exit /b 1
)
echo + Project structure validated

echo.
echo STEP 2/4: Installing Python dependencies...
echo.

cd /d "%BACKEND_DIR%"

echo - Installing Python packages...
pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo + Python dependencies installed

echo.
echo STEP 3/4: Verifying Ollama...
echo.

:: Check Ollama availability
echo - Checking AI service...
curl -s http://localhost:11434 >nul 2>&1
if %errorlevel% neq 0 (
    echo Note: Ollama AI not running
    echo To enable AI features: ollama serve
    echo Then install model: ollama pull llama3.2:1b
    echo.
    choice /c YN /m "Continue anyway (Y/N)? "
    if %errorlevel% equ 2 (
        echo Setup cancelled
        pause
        exit /b 1
    )
) else (
    echo + AI service ready on port 11434
)

echo.
echo STEP 4/4: Starting the system...
echo.

:: Launch backend
echo - Starting backend server...
start "Cloud Monitoring Backend" cmd /k "cd /d %BACKEND_DIR% && echo === CLOUD MONITORING BACKEND === && python main.py"

echo - Waiting for initialization (10 seconds)...
timeout /t 10 /nobreak >nul

:: Test API
echo - Checking system status...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo + System ready
) else (
    echo ! System starting up
)

echo.
echo - Opening dashboard...
start "" "%DASHBOARD_URL%"

echo.
echo ============================================================
echo   SYSTEM READY
echo.
echo   Home: %DASHBOARD_URL%
echo   Dashboard: %DASHBOARD_URL%/dashboard  
echo   API Docs: %API_URL%
echo.
echo   To stop: Close the backend window
echo ============================================================
echo.

:menu
echo.
echo MENU:
echo [1] Reopen dashboard
echo [2] Open API documentation
echo [3] Restart backend
echo [0] Exit
echo.
set /p choice="Choose (0-3): "

if "%choice%"=="1" (
    start "" "%DASHBOARD_URL%"
    goto menu
)
if "%choice%"=="2" (
    start "" "%API_URL%"
    goto menu
)
if "%choice%"=="3" (
    taskkill /f /im python.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    start "Cloud Monitoring Backend" cmd /k "cd /d %BACKEND_DIR% && python main.py"
    goto menu
)
if "%choice%"=="0" (
    echo Goodbye!
    pause
    exit /b 0
)
goto menu 