@echo off
echo 🚀 Starting Brand Ambassador SaaS Platform...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "logs" mkdir logs

REM Copy environment file if it doesn't exist
if not exist "backend\.env" (
    echo 📋 Creating environment file...
    copy "backend\env.example" "backend\.env"
    echo ⚠️  Please update backend\.env with your actual configuration values
)

REM Install dependencies
echo 📦 Installing dependencies...
cd backend
call npm install
cd ..\frontend
call npm install
cd ..

REM Start services with Docker Compose
echo 🐳 Starting services with Docker Compose...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services are running successfully!
    echo.
    echo 🌐 Access your application:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:3001
    echo    API Documentation: http://localhost:3001/api
    echo.
    echo 📊 Database:
    echo    Host: localhost:5432
    echo    Database: brand_ambassador_saas
    echo    Username: postgres
    echo    Password: password
    echo.
    echo 🔧 To stop the services: docker-compose down
    echo 📝 To view logs: docker-compose logs -f
) else (
    echo ❌ Some services failed to start. Check the logs with: docker-compose logs
    pause
    exit /b 1
)

pause
