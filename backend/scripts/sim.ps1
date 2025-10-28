Write-Host "Starting Real-time Attendance Simulation..." -ForegroundColor Cyan

$body = '{"interval": 2000, "count": 50}'

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/test-camera/start-simulation" -Method POST -ContentType "application/json" -Body $body
    
    Write-Host "SUCCESS! Simulation started" -ForegroundColor Green
    Write-Host "50 events will be generated over the next 100 seconds" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Open browser: http://localhost:4200/attendance/realtime" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "ERROR: Could not start simulation" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
