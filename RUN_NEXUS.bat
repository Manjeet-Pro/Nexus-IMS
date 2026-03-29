@echo off
TITLE NEXUS Startup Assistant
echo ============================================================
echo           NEXUS - Institute Management System
echo ============================================================
echo Starting Backend (Port 5000)...
start powershell -NoExit -Command "cd IGNOU__Modules/backend; echo 'Starting Backend...'; npm run dev"

echo Starting Frontend (Vite)...
start powershell -NoExit -Command "cd IGNOU__Modules/frontend; echo 'Starting Frontend...'; npm run dev"

echo ------------------------------------------------------------
echo All services are launching in separate windows.
echo Please wait for "Connected to MongoDB" and "VITE ready".
echo Access UI at: http://localhost:5173
echo ------------------------------------------------------------
timeout /t 5
