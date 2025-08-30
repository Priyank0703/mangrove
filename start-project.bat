@echo off
echo Starting Community Mangrove Watch Project...

echo.
echo Step 1: Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo Step 3: Starting Backend Server...
cd ..\backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo Step 4: Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo.
echo IMPORTANT: Make sure you have created the .env file in the backend directory!
echo.
pause
