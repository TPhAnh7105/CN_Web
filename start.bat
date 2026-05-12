@echo off
title LuxeFurnish - Furniture Store
color 0E

echo.
echo  ======================================
echo     LuxeFurnish - Furniture Store
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
echo  Cua so nay se tu dong dong sau 5 giay...
timeout /t 5 /nobreak
exit
