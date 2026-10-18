@echo off
echo ============================================
echo   NexNova HRM - Starting services...
echo ============================================
echo.
"C:\Program Files\nodejs\node.exe" "%APPDATA%\NexNovaHRM\start-services.js"
echo.
echo Services started successfully!
echo Open browser: http://localhost:3000
echo.
pause
