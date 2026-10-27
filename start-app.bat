@echo off
echo ===================================================
echo   Starting The Club Hub (Backend + Frontend)
echo ===================================================

echo [1/3] Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if errorlevel 1 (
    echo Starting MongoDB service...
    net start MongoDB >nul 2>&1
)

echo [2/4] Verifying 250+ Community Sample Members...
cd /d "%~dp0server"
node seed-members.js

echo [3/4] Starting Backend Server on port 5000...
start "The Club Hub - Backend Server" cmd /k "cd /d ""%~dp0server"" && npm start"

timeout /t 3 /nobreak >nul

echo [4/4] Starting Frontend Client...
start "The Club Hub - Frontend Client" cmd /k "cd /d ""%~dp0client"" && npm run dev"

echo.
echo All services launched!
echo Check the opened command windows for the exact local URL (usually http://localhost:5173).
echo.
pause
