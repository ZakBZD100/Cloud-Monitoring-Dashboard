@echo off
echo 🔧 Fixing port conflicts for Cloud Monitoring Dashboard...

rem check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo 🧹 Cleaning up...

rem stop any existing containers
echo    Stopping existing containers...
docker-compose down -v >nul 2>&1

rem stop local Ollama service if running (Windows)
echo    Stopping local Ollama service...
taskkill /f /im ollama.exe >nul 2>&1

rem kill any processes using our ports (Windows)
echo    Killing processes using ports 8000 and 11434...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":11434"') do taskkill /f /pid %%a >nul 2>&1

rem clean Docker system
echo    Cleaning Docker cache...
docker system prune -f >nul 2>&1

echo ✅ Port conflicts fixed!
echo.
echo 🚀 Now you can run:
echo    docker-compose up --build -d
echo.
echo 💡 If you still have issues, try:
echo    docker-compose down -v ^&^& docker-compose up --build -d

pause 