@echo off
TITLE NEXUS Startup Assistant
echo ============================================================
echo           NEXUS - Institute Management System
echo ============================================================

echo Checking for port conflicts (Port 5000)...
netstat -ano | findstr :5000 | findstr LISTENING > nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 5000 is already in use. 
    echo This might cause the Backend to crash.
    echo Please close any existing Node.js processes using port 5000.
    echo.
    set /p choice="Do you want to attempt to kill the process on port 5000? (y/n): "
    if /i "%choice%"=="y" (
        for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a
        echo Process killed.
    )
)

echo Starting Backend (Port 5000)...
start powershell -NoExit -Command "cd backend; echo 'Starting Backend...'; npm run dev"

echo Starting Frontend (Vite)...
start powershell -NoExit -Command "cd frontend; echo 'Starting Frontend...'; npm run dev"

echo ------------------------------------------------------------
echo All services are launching in separate windows.
echo Please wait for "Connected to MongoDB" and "VITE ready".
echo Access UI at: http://localhost:5173
echo ------------------------------------------------------------
timeout /t 5
