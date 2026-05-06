@echo off
title LuxeFurnish - Tat Server
color 0C

echo.
echo  ======================================
echo     Dang tat tat ca server...
echo  ======================================
echo.

taskkill /FI "WINDOWTITLE eq LuxeFurnish Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LuxeFurnish Frontend*" /F >nul 2>&1

:: Tắt tất cả process node liên quan
taskkill /IM node.exe /F >nul 2>&1

echo  Da tat thanh cong!
echo.
pause
