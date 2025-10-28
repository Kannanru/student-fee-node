@echo off
echo ============================================
echo Real-time Attendance Event Generator
echo ============================================
echo.
echo Generating 20 attendance events...
echo Watch your browser - events will appear in real-time!
echo.

for /L %%i in (1,1,20) do (
    echo [%%i/20] Generating event...
    curl -s http://localhost:5000/api/test-camera/generate > nul
    timeout /t 2 /nobreak > nul
)

echo.
echo ============================================
echo SUCCESS! 20 events generated
echo Check your real-time dashboard now!
echo ============================================
pause
