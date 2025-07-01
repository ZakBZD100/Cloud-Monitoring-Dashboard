@echo off
echo 🚀 Starting Cloud Monitoring Dashboard...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo 🔍 Checking ports...

REM Check if port 8000 is in use
netstat -an | findstr ":8000" >nul
if not errorlevel 1 (
    echo    Port 8000 (dashboard) is in use. Stopping existing containers...
    docker-compose down >nul 2>&1
)

REM Check if port 11434 is in use
netstat -an | findstr ":11434" >nul
if not errorlevel 1 (
    echo    Port 11434 (ollama) is in use. This might be a local Ollama instance.
    echo    Using port 11435 for external access to avoid conflicts.
)

REM Check if port 11435 is in use
netstat -an | findstr ":11435" >nul
if not errorlevel 1 (
    echo    Port 11435 is also in use. Stopping existing containers...
    docker-compose down >nul 2>&1
)

REM Clean up any existing containers
echo 🧹 Cleaning up existing containers...
docker-compose down -v >nul 2>&1

REM Build and start
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo ✅ Checking service status...
docker-compose ps | findstr "Up" >nul
if not errorlevel 1 (
    echo 🎉 Services are running!
    echo 📊 Dashboard: http://localhost:8000
    echo 🤖 Ollama API: http://localhost:11435
    echo.
    echo 💡 If you have issues:
    echo    - Check logs: docker-compose logs -f
    echo    - Restart: docker-compose restart
    echo    - Full reset: docker-compose down -v ^&^& docker-compose up --build -d
) else (
    echo ❌ Some services failed to start. Check logs:
    docker-compose logs
    pause
    exit /b 1
)

pause 