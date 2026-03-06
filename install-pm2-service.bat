@echo off
REM Script ini harus dijalankan sebagai Administrator
REM Gunakan nssm dari path winget

REM Cari nssm
SET NSSM_PATH=
FOR /F "tokens=*" %%i IN ('where nssm 2^>nul') DO SET NSSM_PATH=%%i
IF "%NSSM_PATH%"=="" (
    REM Coba cari di WinGet links
    SET NSSM_PATH=%LOCALAPPDATA%\Microsoft\WinGet\Links\nssm.exe
)
IF NOT EXIST "%NSSM_PATH%" (
    REM Coba path winget packages
    FOR /R "%LOCALAPPDATA%\Microsoft\WinGet\Packages" %%f IN (nssm.exe) DO SET NSSM_PATH=%%f
)

echo Menggunakan NSSM di: %NSSM_PATH%

REM Hapus service lama
"%NSSM_PATH%" stop PM2-InvoiceApp 2>nul
"%NSSM_PATH%" remove PM2-InvoiceApp confirm 2>nul

REM Buat service baru menggunakan node.exe + pm2 script langsung
"%NSSM_PATH%" install PM2-InvoiceApp "C:\Program Files\nodejs\node.exe" "C:\Users\Ryzen\AppData\Roaming\npm\node_modules\pm2\bin\pm2 resurrect"
"%NSSM_PATH%" set PM2-InvoiceApp AppDirectory "e:\JS\invoice-app"
"%NSSM_PATH%" set PM2-InvoiceApp AppStdout "e:\JS\invoice-app\pm2-service.log"
"%NSSM_PATH%" set PM2-InvoiceApp AppStderr "e:\JS\invoice-app\pm2-service-err.log"
"%NSSM_PATH%" set PM2-InvoiceApp Start SERVICE_AUTO_START
"%NSSM_PATH%" set PM2-InvoiceApp AppEnvironmentExtra "PM2_HOME=C:\Users\Ryzen\.pm2" "PATH=C:\Program Files\nodejs;C:\Users\Ryzen\AppData\Roaming\npm;%PATH%"

REM Start service
"%NSSM_PATH%" start PM2-InvoiceApp

echo.
echo Selesai! Cek status service:
sc query PM2-InvoiceApp
pause
