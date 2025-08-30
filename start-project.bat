@echo off
echo Starting Community Mangrove Watch...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Make sure MongoDB is running before starting the backend!
echo.
pause
