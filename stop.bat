@echo off
title LuxeFurnish - Tat Server
color 0C

:ask
echo.
echo ==============================================
echo  BAN CO CHAC CHAN MUON TAT HET SERVER KHONG?
echo ==============================================
echo.

choice /c yn /m "Lua chon cua ban (Y: Co, N: Khong)"

if errorlevel 2 (
    cls
    goto ask
)

if errorlevel 1 (
    echo.
    echo  [*] Dang tien hanh tat toan bo tien trinh node...
    
    taskkill /FI "WINDOWTITLE eq LuxeFurnish Backend*" /F >nul 2>&1
    taskkill /FI "WINDOWTITLE eq LuxeFurnish Frontend*" /F >nul 2>&1
    taskkill /IM node.exe /F >nul 2>&1
    
    echo.
    echo  [+] DA TAT THANH CONG TAT CA SERVER!
    echo.
    timeout /t 3
    exit
)
