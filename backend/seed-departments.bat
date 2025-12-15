@echo off
REM Batch script to seed departments
REM Kullanım: seed-departments.bat

set BASE_URL=http://localhost:5000
set ENDPOINT=%BASE_URL%/api/departments/seed

echo 🌱 Bölüm ve programları yüklüyorum...
echo 📍 Endpoint: %ENDPOINT%
echo.

curl -X POST "%ENDPOINT%" ^
  -H "Content-Type: application/json" ^
  -w "\n\nHTTP Status: %%{http_code}\n"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ İşlem tamamlandı!
) else (
    echo.
    echo ❌ Hata oluştu! Backend'in çalıştığından emin olun.
)

echo.
echo 💡 Not: Backend'in çalıştığından emin olun (npm run dev veya npm start)
pause
