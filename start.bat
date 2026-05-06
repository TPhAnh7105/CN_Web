@echo off
title LuxeFurnish - Furniture Store
color 0E

echo.
echo  ======================================
echo     LuxeFurnish - Furniture Store
echo  ======================================
echo.
echo  [1] Dang khoi dong Backend Server...
echo  [2] Dang khoi dong Frontend React...
echo.

:: Chạy Backend Server trong cửa sổ riêng
start "LuxeFurnish Backend - Port 5000" cmd /k "cd /d %~dp0backend && npx nodemon server.js"

:: Đợi backend khởi động 3 giây
timeout /t 3 /nobreak >nul

:: Chạy Frontend React trong cửa sổ riêng
start "LuxeFurnish Frontend - Port 3000" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo  ======================================
echo   Da khoi dong thanh cong!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo  ======================================
echo.
echo  Nhan phim bat ky de dong cua so nay...
pause >nul
