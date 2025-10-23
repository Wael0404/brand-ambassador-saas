@echo off
echo 🛠️  Setting up Brand Ambassador SaaS for development...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
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

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install

echo ✅ Development setup complete!
echo.
echo 🚀 To start the development servers:
echo    Backend: cd backend ^&^& npm run start:dev
echo    Frontend: cd frontend ^&^& npm run dev
echo.
echo 🌐 Access your application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001
echo    API Documentation: http://localhost:3001/api

pause
