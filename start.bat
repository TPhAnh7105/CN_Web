@echo off
title LuxeFurnish - Menu Dieu khien
color 0E

:menu
cls
:: Mac dinh trang thai
set "BACKEND_STATUS=OFFLINE"
set "FRONTEND_STATUS=OFFLINE"
set "DB_STATUS=OFFLINE"

:: Kiem tra Database (3306)
netstat -ano | findstr LISTENING | findstr /C:":3306 " >nul 2>&1
if %errorlevel% equ 0 set "DB_STATUS=ONLINE "

:: Kiem tra Backend (5000)
netstat -ano | findstr LISTENING | findstr /C:":5000 " >nul 2>&1
if %errorlevel% equ 0 set "BACKEND_STATUS=ONLINE "

:: Kiem tra Frontend (3000)
netstat -ano | findstr LISTENING | findstr /C:":3000 " >nul 2>&1
if %errorlevel% equ 0 set "FRONTEND_STATUS=ONLINE "

echo ===================================================
echo           LUXEFURNISH - HE THONG QUAN LY
echo ===================================================
echo  Tinh trang he thong:
echo  - Database (MySQL)    : [%DB_STATUS%]
echo  - Backend (Port 5000) : [%BACKEND_STATUS%]
echo  - Frontend (Port 3000): [%FRONTEND_STATUS%]
echo ===================================================
echo  [1] Khoi dong Server (Backend va Frontend)
echo  [2] Khoi dong lai Server (Restart)
echo  [3] Tat Server va dong het cua so (Stop)
echo  [4] Kiem tra lai trang thai (Refresh)
echo  [5] Thoat
echo ===================================================
echo.

choice /c 12345 /n /m "Nhap lua chon cua ban (1, 2, 3, 4, 5): "

if errorlevel 5 exit
if errorlevel 4 goto menu
if errorlevel 3 goto stop_server
if errorlevel 2 goto restart_server
if errorlevel 1 goto start_server

:start_server
cls
echo.
echo  ======================================
echo     LuxeFurnish - Khoi dong Server
echo  ======================================
echo.

:: 1. Kiểm tra và copy file .env nếu chưa có
if not exist "%~dp0.env" (
    echo  [!] Canh bao: Khong tim thay file .env!
    echo  [*] Tu dong tao file .env tu .env.example...
    copy "%~dp0.env.example" "%~dp0.env" >nul
    echo  [+] Da khoi tao file .env. Ban nho mo file .env dien lai mat khau MySQL nhe!
    echo.
)

:: 2. Kiểm tra node_modules của Backend
if not exist "%~dp0backend\node_modules" (
    echo  [!] Khong tim thay node_modules cua Backend!
    echo  [*] Dang tu dong chay "npm install" cho Backend, vui long cho...
    cd /d "%~dp0backend" && call npm install
    echo  [+] Da tai xong thu vien Backend!
    echo.
)

:: 3. Kiểm tra node_modules của Frontend
if not exist "%~dp0frontend\node_modules" (
    echo  [!] Khong tim thay node_modules cua Frontend!
    echo  [*] Dang tu dong chay "npm install" cho Frontend, vui long cho...
    cd /d "%~dp0frontend" && call npm install
    echo  [+] Da tai xong thu vien Frontend!
    echo.
)

echo  [1] Dang khoi dong Backend Server...
echo  [2] Dang khoi dong Frontend React...
echo.

:: Chạy Backend Server trong cửa sổ riêng
start "LuxeFurnish Backend - Port 5000" cmd /c "cd /d %~dp0backend && npx nodemon server.js"

:: Đợi backend khởi động 3 giây
timeout /t 3 /nobreak >nul

:: Chạy Frontend React trong cửa sổ riêng
start "LuxeFurnish Frontend - Port 3000" cmd /c "cd /d %~dp0frontend && npm start"

echo.
echo  ======================================
echo   Da khoi dong thanh cong!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo  ======================================
echo.
echo  Nhan phim bat ky de quay lai Menu...
pause >nul
goto menu

:restart_server
cls
echo.
echo  ======================================
echo     LuxeFurnish - Khoi dong lai
echo  ======================================
echo.
echo  [*] Dang tat cac tien trinh node cu...
taskkill /FI "WINDOWTITLE eq LuxeFurnish Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LuxeFurnish Frontend*" /F >nul 2>&1
taskkill /IM node.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul
goto start_server

:stop_server
cls
echo.
echo  ======================================
echo     LuxeFurnish - Tat Server
echo  ======================================
echo.
echo  [*] Dang tat cac tien trinh node...
taskkill /FI "WINDOWTITLE eq LuxeFurnish Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LuxeFurnish Frontend*" /F >nul 2>&1
taskkill /IM node.exe /F >nul 2>&1
echo  [+] Da tat thanh cong tat ca Server!
echo.
timeout /t 3 /nobreak >nul
exit
