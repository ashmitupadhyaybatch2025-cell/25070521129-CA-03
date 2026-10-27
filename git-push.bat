@echo off
echo ===================================================
echo   Pushing All Updates to GitHub Repository
echo ===================================================

cd /d D:\25070521129
git add -A
git commit -m "Update admin name to The Club Hub Admin and integrate 250 sample members"
git push origin main

echo.
echo Git sync completed!
pause
