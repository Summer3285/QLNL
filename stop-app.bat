@echo off
title NexNova HRM - Dung he thong
echo ======================================================
echo   DANG TAT HE THONG NEXNOVA ENTERPRISE HRM...
echo ======================================================

powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\stop-services.ps1"

echo.
echo Nhan phim bat ky de thoat...
pause >nul
