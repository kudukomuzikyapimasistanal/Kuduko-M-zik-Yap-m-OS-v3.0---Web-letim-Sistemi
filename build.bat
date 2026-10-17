@echo off
chcp 65001 >nul
echo === Kuduko OS - EXE olusturucu ===
where node >nul 2>nul || (echo Node.js bulunamadi. https://nodejs.org adresinden kurun. & pause & exit /b 1)
if not exist index.html (echo index.html bulunamadi! Kuduko OS HTML dosyasini bu klasore index.html adiyla koyun. & pause & exit /b 1)
call npm install
call npm run build
echo.
echo Bitti. EXE dosyasi "dist" klasorunde.
pause
