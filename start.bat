@echo off
echo Starting The Club Hub Backend & Frontend...

start "Club Hub Backend" cmd /k "cd /d %~dp0server && node server.js"
start "Club Hub Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================================
echo The Club Hub is launching!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173 (or 5174)
echo ========================================================
